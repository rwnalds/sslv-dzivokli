"use server";

import { auth } from "@/auth";
import { categories } from "@/lib/ss/categories";
import { regions } from "@/lib/ss/regions";
import { scrapeSSlv } from "@/lib/ss/scraper";
import { prisma } from "@/utils/get-prisma";
import { revalidatePath } from "next/cache";
import { sendNotification } from "../../actions";

export type SearchCriteriaResponse = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function addSearchCriteria(
  formData: FormData
): Promise<SearchCriteriaResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nav piekļuves tiesību" };

  const region = formData.get("region")?.toString();
  const district = formData.get("district")?.toString();
  const category = formData.get("category")?.toString();
  const minPrice = formData.get("minPrice")?.toString();
  const maxPrice = formData.get("maxPrice")?.toString();
  const minRooms = formData.get("minRooms")?.toString();
  const maxRooms = formData.get("maxRooms")?.toString();
  const minArea = formData.get("minArea")?.toString();
  const maxArea = formData.get("maxArea")?.toString();

  // Validate region
  if (!region || !regions.find((r) => r.name === region)) {
    return { error: "Nepareizs reģions" };
  }

  // Validate category
  if (!category || !categories.find((c) => c.value === category)) {
    return { error: "Nepareiza kategorija" };
  }

  try {
    await prisma.searchCriteria.create({
      data: {
        userId: session.user.id,
        region,
        district: district || null,
        category,
        minPrice: minPrice ? parseInt(minPrice) : null,
        maxPrice: maxPrice ? parseInt(maxPrice) : null,
        minRooms: minRooms ? parseInt(minRooms) : null,
        maxRooms: maxRooms ? parseInt(maxRooms) : null,
        minArea: minArea ? parseInt(minArea) : null,
        maxArea: maxArea ? parseInt(maxArea) : null,
        isActive: true,
      },
    });
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Meklēšanas kritēriji pievienoti!",
    };
  } catch (error) {
    console.error("Failed to add search criteria:", error);
    return { error: "Neizdevās pievienot meklēšanas kritērijus" };
  }
}

export async function deleteSearchCriteria(
  criteriaId: number
): Promise<SearchCriteriaResponse> {
  try {
    await prisma.searchCriteria.delete({
      where: { id: criteriaId },
    });
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Meklēšanas kritēriji izdzēsti",
    };
  } catch (error) {
    console.error("Failed to delete search criteria:", error);
    return { error: "Neizdevās izdzēst meklēšanas kritērijus" };
  }
}

export async function toggleSearchCriteria(
  criteriaId: number,
  isActive: boolean
): Promise<SearchCriteriaResponse> {
  try {
    await prisma.searchCriteria.update({
      where: { id: criteriaId },
      data: { isActive },
    });
    revalidatePath("/dashboard");
    return {
      success: true,
      message: isActive ? "Meklēšana aktivizēta" : "Meklēšana apturēta",
    };
  } catch (error) {
    console.error("Failed to toggle search criteria:", error);
    return { error: "Neizdevās mainīt meklēšanas statusu" };
  }
}

export const refreshListings = async () => {
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

  let totalNewListings = 0;

  for (const criteria of activeCriteria) {
    const listings = await scrapeSSlv(criteria);

    for (const listing of listings) {
      try {
        // Skip listings without a valid ssUrl
        if (!listing.ssUrl || !listing.title) {
          console.warn("Skipping listing without ssUrl or title");
          continue;
        }

        // Format listing data before insert
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
};
