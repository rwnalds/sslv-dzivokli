import chromium from "@sparticuz/chromium-min";
import puppeteer, { Browser } from "puppeteer-core";

import { sendNotification } from "@/app/actions";
import { categories } from "@/lib/ss/categories";
import { regions } from "@/lib/ss/regions";
import { prisma } from "@/utils/get-prisma";
import { SearchCriteria } from "@prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const maxDuration = 30;

const ACTION_DELAY = 1000; // 1 second delay between actions

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
  const isLocal = process.env.NODE_ENV === "development";

  const options = {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-extensions",
    ],
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        "https://storage.googleapis.com/sslv-chromium/Chromium%20v126.0.0%20Pack.tar"
      )),
    headless: true,
    ignoreHTTPSErrors: true,
  };

  return puppeteer.launch(options);
}

export async function GET() {
  let browser;
  try {
    browser = await getBrowser();
    const activeCriteria = await prisma.searchCriteria.findMany({
      where: {
        isActive: true,
      },
    });
    const pushSubscription = await prisma.pushSubscription.findFirst({
      where: {
        userId: {
          in: activeCriteria.map((criteria) => criteria.userId),
        },
      },
    });

    let newListings = [];

    for (const criteria of activeCriteria) {
      const listings = await scrapeSSlv(browser, criteria);

      for (const listing of listings) {
        try {
          // Skip listings without a valid ssUrl
          if (!listing.ssUrl || !listing.title) {
            console.warn("Skipping listing without ssUrl or title");
            continue;
          }

          // Format listing data before insert
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

          // Send notification if user has push subscription
          if (pushSubscription) {
            const subscription = JSON.parse(
              pushSubscription.subscription
            ) as PushSubscription;

            const price = listing.price
              ? `${listing.price}€`
              : "Price not specified";
            await sendNotification(
              subscription,
              `Atrasts dzīvoklis ${listing.title} - ${price}EUR`,
              "🏠 Jauns dzīvoklis!"
            );

            // Mark as notified
            await prisma.foundListing.update({
              where: { ssUrl: listing.ssUrl },
              data: { notified: true },
            });
          }
        } catch (error) {
          // Skip duplicate listings
          continue;
        }
      }

      // Update last checked timestamp
      await prisma.searchCriteria.update({
        where: { id: criteria.id },
        data: { lastChecked: new Date() },
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
  browser: Browser,
  criteria: SearchCriteria
): Promise<ScrapedListing[]> {
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setDefaultNavigationTimeout(30000);

    // Find the region and category configuration
    const region = regions.find((r) => r.name === criteria.region);
    const category = categories.find((c) => c.value === criteria.category);

    if (!region || !category) {
      throw new Error("Invalid region or category");
    }

    // Construct the base URL
    let url = `https://www.ss.lv/lv/real-estate/flats/${region.urlPath}/`;
    if (criteria.district && criteria.district !== "all") {
      url += `${criteria.district}/`;
    } else {
      url += "all/";
    }
    url += `${category.urlPath}/`;

    console.log("Navigating to URL:", url);

    // Navigate to page and wait for content
    await page.goto(url, { waitUntil: "networkidle0" });

    // Wait for the filter table to be present
    await page
      .waitForSelector("#filter_tbl", { visible: true, timeout: 10000 })
      .catch(() =>
        console.log("Filter table not immediately visible, proceeding anyway")
      );

    // Wait for initial render
    await new Promise((resolve) => setTimeout(resolve, ACTION_DELAY * 2));

    async function fillField(selector: string, value: string | number) {
      try {
        await page.waitForSelector(selector, { visible: true });
        await page.evaluate((sel: string) => {
          const element = document.querySelector(sel);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, selector);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const isSelect = selector.includes("select");

        if (isSelect) {
          // For select elements, first verify the option exists
          const optionExists = await page.evaluate(
            ({ sel, val }: { sel: string; val: string }) => {
              const select = document.querySelector(sel) as HTMLSelectElement;
              if (!select) return false;
              return Array.from(select.options).some(
                (option) => option.value === val || option.text === val
              );
            },
            { sel: selector, val: value.toString() }
          );

          if (!optionExists) {
            console.warn(
              `Option ${value} not found in select ${selector}, skipping...`
            );
            return;
          }

          await page.select(selector, value.toString());
        } else {
          await page.type(selector, value.toString());
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Verify the value was set correctly
        try {
          if (isSelect) {
            const selectedValue = await page.evaluate((sel: string) => {
              const select = document.querySelector(sel) as HTMLSelectElement;
              if (!select) return null;
              const selected = select.selectedOptions[0];
              return selected ? selected.value || selected.text : null;
            }, selector);

            if (selectedValue !== value.toString()) {
              console.warn(
                `Select ${selector} value mismatch. Expected: ${value}, Got: ${selectedValue}`
              );
              // Retry once
              await new Promise((resolve) => setTimeout(resolve, 500));
              await page.select(selector, value.toString());
            }
          } else {
            const fieldValue = await page.evaluate((sel: string) => {
              const input = document.querySelector(sel) as HTMLInputElement;
              return input ? input.value : null;
            }, selector);

            if (fieldValue !== value.toString()) {
              console.warn(
                `Field ${selector} value mismatch. Expected: ${value}, Got: ${fieldValue}`
              );
              // Retry once
              await new Promise((resolve) => setTimeout(resolve, 500));
              await page.type(selector, value.toString(), { delay: 100 });
            }
          }
        } catch (verifyError) {
          console.log(`Could not verify field ${selector}, continuing anyway`);
        }
      } catch (error) {
        console.warn(`Failed to fill field ${selector}:`, error);
      }
    }

    // Fill filters
    console.log("Filling in filters...");

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
      await fillField('select[name="topt[1][min]"]', criteria.minRooms);
    }
    if (criteria.maxRooms) {
      await fillField('select[name="topt[1][max]"]', criteria.maxRooms);
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

    // Click search button and wait for results
    console.log("Clicking search button...");
    const searchButton = await page.waitForSelector(
      'input[type="submit"][value="Meklēt"]'
    );

    if (!searchButton) {
      throw new Error("Search button not found");
    }

    // Click and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      searchButton.click(),
    ]);

    // Make sure the results are loaded
    await page.waitForSelector("tr[id^='tr_']");

    console.log("Extracting listings...");
    // Extract listings
    const listings = await page.evaluate(() => {
      const rows = document.querySelectorAll("tr[id^='tr_']");
      const results: ScrapedListing[] = [];

      rows.forEach((row) => {
        // Skip banner rows
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

        // Skip if we don't have required fields
        if (
          !titleEl ||
          !titleEl.textContent ||
          !(titleEl as HTMLAnchorElement).href
        ) {
          return;
        }

        // Skip "buying" or "renting" listings that don't have a price
        const priceText = priceEl?.textContent?.trim();
        if (priceText === "pērku" || priceText === "vēlos\nīret") return;

        // Extract price
        let price: number | null = null;
        if (priceText) {
          const match = priceText.match(/(\d+(?:,\d+)?)/);
          if (match) {
            price = parseInt(match[1].replace(",", ""), 10);
          }
        }

        // Get image URL
        let imageUrl: string | null = null;
        if (imageEl) {
          const src = (imageEl as HTMLImageElement).src;
          if (src && !src.includes("homes.lv.gif")) {
            imageUrl = src.replace(".th2.", ".800.");
          }
        }

        // Extract rooms
        let rooms: number | null = null;
        const roomsText = roomsEl?.textContent?.trim();
        if (roomsText) {
          const roomsMatch = roomsText.match(/\d+/);
          if (roomsMatch) {
            rooms = parseInt(roomsMatch[0], 10);
          }
        }

        // Extract area
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
          description: null, // We don't have description in the list view
        });
      });

      return results;
    });

    console.log("Found", listings.length, "listings");
    return listings;
  } finally {
    await page.close();
  }
}
