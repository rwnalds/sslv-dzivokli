"use server";

import { SearchCriteria } from "@prisma/client";
import { chromium, Page } from "playwright";
import { categories } from "../ss/categories";
import { regions } from "../ss/regions";

const ACTION_DELAY = 1000; // 1 second delay between actions

export async function scrapeSSlv(criteria: SearchCriteria) {
  const browser = await chromium.launch({
    headless: true,
  });

  console.log("Scraping SSLV for criteria:", criteria);
  let page: Page | null = null;

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    page = await context.newPage();
    page.setDefaultTimeout(30000);

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

    // Enhanced page loading wait conditions
    await page.goto(url);
    await Promise.all([
      page.waitForLoadState("domcontentloaded"),
      page.waitForLoadState("networkidle"),
    ]);

    // Wait for the filter table to be present
    await page
      .waitForSelector("#filter_tbl", { state: "visible", timeout: 10000 })
      .catch(() =>
        console.log("Filter table not immediately visible, proceeding anyway")
      );

    // Wait for initial render
    await page.waitForTimeout(ACTION_DELAY * 2);

    async function fillField(selector: string, value: string | number) {
      if (!page) return;

      try {
        await page.waitForSelector(selector, { state: "visible" });
        await page.evaluate((sel) => {
          const element = document.querySelector(sel);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, selector);
        await page.waitForTimeout(500);

        const isSelect = selector.includes("select");

        if (isSelect) {
          // For select elements, first verify the option exists
          const optionExists = await page.evaluate(
            ({ sel, val }) => {
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

          await page.selectOption(selector, value.toString());
        } else {
          await page.fill(selector, value.toString());
        }

        // Wait a bit after filling
        await page.waitForTimeout(500);

        // Only verify if the page hasn't navigated
        try {
          if (isSelect) {
            const selectedValue = await page.evaluate((sel) => {
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
              await page.waitForTimeout(500);
              await page.selectOption(selector, value.toString());
            }
          } else {
            const fieldValue = await page.$eval(
              selector,
              (el: HTMLInputElement) => el.value
            );

            if (fieldValue !== value.toString()) {
              console.warn(
                `Field ${selector} value mismatch. Expected: ${value}, Got: ${fieldValue}`
              );
              // Retry once
              await page.waitForTimeout(500);
              await page.fill(selector, value.toString());
            }
          }
        } catch (verifyError) {
          // If verification fails (e.g., due to navigation), just log it and continue
          console.log(`Could not verify field ${selector}, continuing anyway`);
        }
      } catch (error) {
        console.warn(`Failed to fill field ${selector}:`, error);
        // Don't throw, just continue with other fields
      }
    }

    // Fill filters with verification
    console.log("Filling in filters...");

    if (criteria.minPrice) {
      await fillField('input[name="topt[8][min]"]', criteria.minPrice);
    }
    if (criteria.maxPrice) {
      await fillField('input[name="topt[8][max]"]', criteria.maxPrice);
    }
    if (criteria.minRooms) {
      await fillField('select[name="topt[1][min]"]', criteria.minRooms);
    }
    if (criteria.maxRooms) {
      await fillField('select[name="topt[1][max]"]', criteria.maxRooms);
    }
    if (criteria.minArea) {
      await fillField('input[name="topt[3][min]"]', criteria.minArea);
    }
    if (criteria.maxArea) {
      await fillField('input[name="topt[3][max]"]', criteria.maxArea);
    }

    // Click search with enhanced wait conditions
    console.log("Clicking search button...");
    const searchButton = await page.waitForSelector(
      'input[type="submit"][value="Meklēt"]'
    );

    // Start waiting for the response before clicking
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("ss.lv") && response.status() === 200
    );

    // Click the search button
    await searchButton.click();

    // Wait for the response and the page to be ready
    await responsePromise;
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("networkidle");

    // Make sure the results are loaded
    await page.waitForSelector("tr[id^='tr_']");

    console.log("Extracting listings...");
    // Extract listings
    const listings = await page.$$eval("tr[id^='tr_']", (rows) => {
      return rows
        .map((row) => {
          // Skip banner rows
          if (row.id.includes("bnr_")) return null;

          const titleEl = row.querySelector("td.msg2 div.d1 a.am");
          const priceEl = row.querySelector(
            "td.msga2-o.pp6:last-child a.amopt"
          ); // Last column contains the price
          const roomsEl = row.querySelector(
            "td.msga2-o.pp6:nth-child(5) a.amopt"
          ); // 5th column contains rooms
          const areaEl = row.querySelector(
            "td.msga2-o.pp6:nth-child(6) a.amopt"
          ); // 6th column contains area
          const locationEl = row.querySelector(
            "td.msga2-o.pp6:nth-child(4) a.amopt"
          ); // 4th column contains location
          const imageEl = row.querySelector("td.msga2:nth-child(2) img");

          // Skip "buying" or "renting" listings that don't have a price
          const priceText = priceEl?.textContent?.trim();
          if (priceText === "pērku" || priceText === "vēlos\nīret") return null;

          // Extract price - handle both sale and rent cases
          let priceStr = null;
          if (priceText) {
            const match = priceText.match(/(\d+(?:,\d+)?)/);
            if (match) {
              priceStr = match[1].replace(",", "");
            }
          }

          // Get image URL
          let imageUrl = null;
          if (imageEl) {
            const src = imageEl.getAttribute("src");
            if (src && !src.includes("homes.lv.gif")) {
              imageUrl = src.replace(".th2.", ".800.");
            }
          }

          // Only return valid listings (with title and either buying or renting price)
          if (!titleEl || !priceStr) return null;

          return {
            ssUrl: "https://www.ss.lv" + titleEl.getAttribute("href"),
            title: titleEl.textContent?.trim() || "",
            price: priceStr,
            rooms:
              roomsEl?.textContent?.trim() !== "-"
                ? parseInt(roomsEl?.textContent?.trim() || "0", 10)
                : null,
            area:
              areaEl?.textContent?.trim() !== "-"
                ? areaEl?.textContent?.trim()
                : null,
            district: locationEl?.textContent?.trim() || null,
            imageUrl,
            description: null,
          };
        })
        .filter((listing) => listing !== null); // Remove null entries
    });

    console.log("Found", listings.length, "listings");

    return listings.map((listing) => ({
      ...listing,
      criteriaId: criteria.id,
      notified: false,
    }));
  } finally {
    if (page) {
      await page.close();
    }
    await browser.close();
  }
}
