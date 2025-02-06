import { sendNotification } from "@/app/actions";
import { scrapeSSlv } from "@/lib/ss/scraper";
import { prisma } from "@/utils/get-prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get all active search criteria
    const activeCriteria = await prisma.searchCriteria.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          include: {
            pushSubscription: true,
          },
        },
      },
    });

    let totalNewListings = 0;

    for (const criteria of activeCriteria) {
      try {
        const listings = await scrapeSSlv(criteria);

        for (const listing of listings) {
          try {
            // Ensure all required fields are present and have correct types
            if (!listing.ssUrl || !listing.title) {
              console.error("Missing required fields for listing:", listing);
              continue;
            }

            // Insert with validated data
            await prisma.foundListing.create({
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

            totalNewListings++;

            // Send notification if user has push subscription
            if (criteria.user.pushSubscription) {
              const subscription = JSON.parse(
                criteria.user.pushSubscription.subscription
              ) as PushSubscription;

              const price = listing.price
                ? `${listing.price}€`
                : "Cena nav norādīta";
              await sendNotification(
                subscription,
                `Jauns sludinājums: ${listing.title} - ${price}`,
                "🏠 Jauns Sludinājums!"
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
      } catch (error) {
        console.error(
          "Failed to scrape listings for criteria:",
          criteria.id,
          error
        );
        continue;
      }

      // Update last checked timestamp
      await prisma.searchCriteria.update({
        where: { id: criteria.id },
        data: { lastChecked: new Date() },
      });
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
