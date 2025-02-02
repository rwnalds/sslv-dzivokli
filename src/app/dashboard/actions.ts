"use server";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { revalidatePath } from "next/cache";
import * as schema from "src/db/schema";

const db = drizzle(process.env.DATABASE_URL!, { schema });

export async function deleteSearchCriteria(criteriaId: number) {
  try {
    await db
      .delete(schema.searchCriteria)
      .where(eq(schema.searchCriteria.id, criteriaId));
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete search criteria:", error);
    return { success: false, error: "Failed to delete search criteria" };
  }
}

export async function toggleSearchCriteria(
  criteriaId: number,
  isActive: boolean
) {
  try {
    await db
      .update(schema.searchCriteria)
      .set({ isActive })
      .where(eq(schema.searchCriteria.id, criteriaId));
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle search criteria:", error);
    return { success: false, error: "Failed to toggle search criteria" };
  }
}
