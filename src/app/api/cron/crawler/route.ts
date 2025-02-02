import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { JSDOM } from "jsdom";
import { NextResponse } from "next/server";
import { sendNotification } from "src/app/install/actions";
import * as schema from "src/db/schema";
import { foundListings, searchCriteria } from "src/db/schema";

export const dynamic = "force-dynamic";

const db = drizzle(process.env.DATABASE_URL!, { schema });

async function crawlSSLV(criteria: schema.SearchCriteria) {
  // Base URL for Riga apartments
  let url = "https://www.ss.lv/lv/real-estate/flats/riga/";
  if (criteria.district) {
    url += `${criteria.district.toLowerCase()}/`;
  }
  url += "sell/";

  // Add filter parameters
  const params = new URLSearchParams();
  if (criteria.minPrice)
    params.append("topt[8][min]", criteria.minPrice.toString());
  if (criteria.maxPrice)
    params.append("topt[8][max]", criteria.maxPrice.toString());
  if (criteria.minRooms)
    params.append("topt[1][min]", criteria.minRooms.toString());
  if (criteria.maxRooms)
    params.append("topt[1][max]", criteria.maxRooms.toString());
  if (criteria.minArea)
    params.append("topt[3][min]", criteria.minArea.toString());
  if (criteria.maxArea)
    params.append("topt[3][max]", criteria.maxArea.toString());

  const fullUrl = `${url}?${params.toString()}`;

  try {
    const response = await fetch(fullUrl);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const listings: schema.NewFoundListing[] = [];
    const rows = document.querySelectorAll("tr[id^='tr_']");

    for (const row of rows) {
      const titleEl = row.querySelector("a.am");
      if (!titleEl) continue;

      const priceEl = row.querySelector("td.msga2-o");
      const detailsEl = row.querySelector("td.msga2:nth-child(4)");
      const locationEl = row.querySelector("td.msga2-o:nth-child(5)");

      // Extract values
      const priceStr = priceEl?.textContent?.replace(/[^0-9.]/g, "") || null;
      const roomsStr = detailsEl?.textContent?.split(" ")[0];
      const areaStr = detailsEl?.textContent?.split(" ")[3] || null;

      const listing: schema.NewFoundListing = {
        ssUrl: "https://www.ss.lv" + titleEl.getAttribute("href"),
        title: titleEl.textContent?.trim() || "",
        price: priceStr,
        rooms: roomsStr ? parseInt(roomsStr, 10) : null,
        area: areaStr,
        district: locationEl?.textContent?.trim() || null,
        criteriaId: criteria.id,
        description: null,
        notified: false,
      };

      listings.push(listing);
    }

    return listings;
  } catch (error) {
    console.error("Failed to crawl SS.lv:", error);
    return [];
  }
}

export async function GET() {
  try {
    // Get all active search criteria
    const activeCriteria = await db.query.searchCriteria.findMany({
      where: eq(searchCriteria.isActive, true),
      with: {
        user: {
          with: {
            pushSubscription: true,
          },
        },
      },
    });

    let totalNewListings = 0;

    for (const criteria of activeCriteria) {
      const listings = await crawlSSLV(criteria);

      for (const listing of listings) {
        try {
          // Try to insert the listing, skip if URL already exists
          await db.insert(foundListings).values(listing);
          totalNewListings++;

          // Send notification if user has push subscription
          if (criteria.user.pushSubscription) {
            const subscription = JSON.parse(
              criteria.user.pushSubscription.subscription
            ) as PushSubscription;

            const price = listing.price
              ? `${listing.price}€`
              : "Price not specified";
            await sendNotification(
              subscription,
              `New apartment found: ${listing.title} - ${price}`,
              "🏠 New Apartment Alert!"
            );

            // Mark as notified
            await db
              .update(foundListings)
              .set({ notified: true })
              .where(eq(foundListings.ssUrl, listing.ssUrl));
          }
        } catch (error) {
          // Skip duplicate listings
          continue;
        }
      }

      // Update last checked timestamp
      await db
        .update(searchCriteria)
        .set({ lastChecked: new Date() })
        .where(eq(searchCriteria.id, criteria.id));
    }

    return NextResponse.json({
      success: true,
      newListings: totalNewListings,
    });
  } catch (error) {
    console.error("Failed to run crawler:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run crawler" },
      { status: 500 }
    );
  }
}
