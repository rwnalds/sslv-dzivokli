"use server";

import { auth } from "@/auth";
import { categories } from "@/lib/ss/categories";
import { regions } from "@/lib/ss/regions";
import { prisma } from "@/utils/get-prisma";
import { revalidatePath } from "next/cache";

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

export async function refreshListings() {
  const response = await fetch(process.env.BASE_URL + "/api/cron/crawler");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to refresh listings");
  }

  return data;
}
