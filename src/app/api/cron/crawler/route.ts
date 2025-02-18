import { sendNotification } from "@/app/actions";
import { prisma } from "@/lib/db";
import { categories } from "@/lib/ss/categories";
import { regions } from "@/lib/ss/regions";
import { SearchCriteria } from "@prisma/client";
import chromium from "@sparticuz/chromium-min";
import { NextResponse } from "next/server";
import { chromium as playwright } from "playwright-core";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
const ACTION_DELAY = 1000;

type ScrapedListing = {
  title: string;
  ssUrl: string;
  price: number | null;
  rooms: number | null;
  area: number | null;
  district: string | null;
  imageUrl: string | null;
  description: string | null;
};

async function getBrowser() {
  return playwright.launch({
    args: chromium.args,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar"
      )),
    headless: true,
  });
}

export async function GET() {
  let browser;
  try {
    browser = await getBrowser();
    const activeCriteria = await prisma.searchCriteria.findMany({
      where: { isActive: true },
    });
    const pushSubscription = await prisma.pushSubscription.findFirst({
      where: {
        userId: {
          in: activeCriteria.map((criteria) => criteria.userId),
        },
      },
    });

    type NewListing = Awaited<ReturnType<typeof prisma.foundListing.create>>;
    let newListings: NewListing[] = [];
    let listingsByCriteria = new Map<number, NewListing[]>();

    for (const criteria of activeCriteria) {
      const listings = await scrapeSSlv(browser, criteria);

      for (const listing of listings) {
        try {
          if (!listing.ssUrl || !listing.title) {
            console.warn("Skipping listing without ssUrl or title");
            continue;
          }

          const newListing = await prisma.foundListing.create({
            data: {
              criteriaId: criteria.id,
              ssUrl: listing.ssUrl,
              title: listing.title,
              price: listing.price ? Number(listing.price) : null,
              rooms: listing.rooms || null,
              area: listing.area ? Number(listing.area) : null,
              district: listing.district || null,
              description: listing.description || null,
              imageUrl: listing.imageUrl || null,
              notified: false,
            },
          });

          newListings.push(newListing);
          const criteriaListings = listingsByCriteria.get(criteria.id) || [];
          criteriaListings.push(newListing);
          listingsByCriteria.set(criteria.id, criteriaListings);
        } catch (error) {
          // Skip duplicate listings
          continue;
        }
      }

      await prisma.searchCriteria.update({
        where: { id: criteria.id },
        data: { lastChecked: new Date() },
      });
    }

    if (pushSubscription && newListings.length > 0) {
      const subscription = JSON.parse(
        pushSubscription.subscription
      ) as PushSubscription;

      for (const [criteriaId, listings] of listingsByCriteria.entries()) {
        const criteria = activeCriteria.find((c) => c.id === criteriaId);
        if (!criteria || listings.length === 0) continue;

        const location = criteria.district
          ? `${criteria.region}, ${criteria.district}`
          : criteria.region;

        const priceRange = listings
          .map((l) => l.price)
          .filter(Boolean)
          .sort((a, b) => (a || 0) - (b || 0));

        let message = `Atrasti ${listings.length} jauni sludinājumi rajonā ${location}`;
        if (priceRange.length > 0) {
          message += ` (${priceRange[0]}€ - ${
            priceRange[priceRange.length - 1]
          }€)`;
        }

        await sendNotification(subscription, message, "🏠 Jauni Sludinājumi!");
      }

      await prisma.foundListing.updateMany({
        where: {
          id: {
            in: newListings.map((l) => l.id),
          },
        },
        data: { notified: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: newListings,
      count: newListings.length,
      message: `Found ${newListings.length} new listings`,
    });
  } catch (error) {
    console.error("Error in crawler:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to fetch listings",
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function scrapeSSlv(
  browser: Awaited<ReturnType<typeof playwright.launch>>,
  criteria: SearchCriteria
): Promise<ScrapedListing[]> {
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    const region = regions.find((r) => r.name === criteria.region);
    const category = categories.find((c) => c.value === criteria.category);

    if (!region || !category) {
      throw new Error("Invalid region or category");
    }

    let url = `https://www.ss.lv/lv/real-estate/flats/${region.urlPath}/`;
    if (criteria.district && criteria.district !== "all") {
      url += `${criteria.district}/`;
    } else {
      url += "all/";
    }
    url += `${category.urlPath}/`;

    console.log("Navigating to URL:", url);
    await page.goto(url, { waitUntil: "networkidle" });
    await page
      .waitForSelector("#filter_tbl", { timeout: 10000 })
      .catch(() =>
        console.log("Filter table not immediately visible, proceeding anyway")
      );

    await page.waitForTimeout(ACTION_DELAY * 2);

    async function fillField(selector: string, value: string | number) {
      try {
        await page.waitForSelector(selector);
        const isSelect = selector.includes("select");

        if (isSelect) {
          await page.selectOption(selector, value.toString());
        } else {
          await page.fill(selector, value.toString());
        }

        await page.waitForTimeout(500);
      } catch (error) {
        console.warn(`Failed to fill field ${selector}:`, error);
      }
    }

    if (criteria.minPrice) {
      await fillField(
        'input[name="topt[8][min]"]',
        criteria.minPrice.toString()
      );
    }
    if (criteria.maxPrice) {
      await fillField(
        'input[name="topt[8][max]"]',
        criteria.maxPrice.toString()
      );
    }
    if (criteria.minRooms) {
      await fillField(
        'select[name="topt[1][min]"]',
        criteria.minRooms.toString()
      );
    }
    if (criteria.maxRooms) {
      await fillField(
        'select[name="topt[1][max]"]',
        criteria.maxRooms.toString()
      );
    }
    if (criteria.minArea) {
      await fillField(
        'input[name="topt[3][min]"]',
        criteria.minArea.toString()
      );
    }
    if (criteria.maxArea) {
      await fillField(
        'input[name="topt[3][max]"]',
        criteria.maxArea.toString()
      );
    }

    const searchButton = await page.waitForSelector(
      'input[type="submit"][value="Meklēt"]'
    );
    if (!searchButton) {
      throw new Error("Search button not found");
    }

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      searchButton.click(),
    ]);

    await page.waitForSelector("tr[id^='tr_']");

    const listings = await page.evaluate((criteria) => {
      const rows = document.querySelectorAll("tr[id^='tr_']");
      const results: ScrapedListing[] = [];

      rows.forEach((row) => {
        if (row.id.includes("bnr_")) return;

        const titleEl = row.querySelector("td.msg2 div.d1 a.am");
        const priceEl = row.querySelector("td.msga2-o.pp6:last-child a.amopt");
        const roomsEl = row.querySelector(
          "td.msga2-o.pp6:nth-child(5) a.amopt"
        );
        const areaEl = row.querySelector("td.msga2-o.pp6:nth-child(6) a.amopt");
        const locationEl = row.querySelector(
          "td.msga2-o.pp6:nth-child(4) a.amopt"
        );
        const imageEl = row.querySelector("td.msga2:nth-child(2) img");

        if (!titleEl?.textContent || !(titleEl as HTMLAnchorElement).href) {
          return;
        }

        const priceText = priceEl?.textContent?.trim();
        if (priceText === "pērku" || priceText === "vēlos\nīret") return;

        let price: number | null = null;
        if (priceText) {
          const match = priceText.match(/(\d+(?:,\d+)?)/);
          if (match) {
            price = parseInt(match[1].replace(",", ""), 10);
          }
        }

        if (price !== null) {
          if (criteria.minPrice && price < criteria.minPrice) return;
          if (criteria.maxPrice && price > criteria.maxPrice) return;
        }

        let imageUrl: string | null = null;
        if (imageEl) {
          const src = (imageEl as HTMLImageElement).src;
          if (src && !src.includes("homes.lv.gif")) {
            imageUrl = src.replace(".th2.", ".800.");
          }
        }

        let rooms: number | null = null;
        const roomsText = roomsEl?.textContent?.trim();
        if (roomsText) {
          const roomsMatch = roomsText.match(/\d+/);
          if (roomsMatch) {
            rooms = parseInt(roomsMatch[0], 10);
          }
        }

        let area: number | null = null;
        const areaText = areaEl?.textContent?.trim();
        if (areaText) {
          const areaMatch = areaText.match(/\d+/);
          if (areaMatch) {
            area = parseInt(areaMatch[0], 10);
          }
        }

        results.push({
          title: titleEl.textContent.trim(),
          ssUrl:
            "https://www.ss.lv" +
            (titleEl as HTMLAnchorElement).getAttribute("href"),
          price,
          rooms,
          area,
          district: locationEl?.textContent?.trim() || null,
          imageUrl,
          description: null,
        });
      });

      return results;
    }, criteria);

    console.log("Found", listings.length, "listings");
    return listings;
  } finally {
    await context.close();
  }
}
