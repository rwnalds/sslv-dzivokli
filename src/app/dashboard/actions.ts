"use server";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { revalidatePath } from "next/cache";
import { auth } from "src/auth";
import * as schema from "src/db/schema";

const db = drizzle(process.env.DATABASE_URL!, { schema });

export async function createAppointment(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const appointmentType = formData.get("appointmentType") as string;
    const dateTime = formData.get("dateTime") as string;
    const notes = formData.get("notes") as string;
    const recurrence = formData.get("recurrence") as schema.RecurrenceType;

    if (!appointmentType || !dateTime) {
      return { success: false, error: "Missing required fields" };
    }

    // Get the user's pet
    const [userPet] = await db
      .select()
      .from(schema.pets)
      .limit(1)
      .where(eq(schema.pets.ownerId, session.user.id));

    if (!userPet) {
      return { success: false, error: "No pet found" };
    }

    await db.insert(schema.reminders).values({
      petId: userPet.id,
      name: appointmentType,
      schedule: new Date(dateTime).toISOString(),
      notes: notes || null,
      recurrence,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to create reminder:", error);
    return { success: false, error: "Failed to create reminder" };
  }
}

export async function getReminders() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const userPet = await db.query.pets.findFirst({
      where: eq(schema.pets.ownerId, session.user.id),
      with: {
        reminders: true,
      },
    });

    if (!userPet) {
      return { success: false, error: "No pet found" };
    }

    return {
      success: true,
      reminders: userPet.reminders as schema.Appointment[],
    };
  } catch (error) {
    console.error("Failed to fetch reminders:", error);
    return { success: false, error: "Failed to fetch reminders" };
  }
}

export async function deleteReminder(reminderId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify the reminder belongs to the user's pet
    const userPet = await db.query.pets.findFirst({
      where: eq(schema.pets.ownerId, session.user.id),
      with: {
        reminders: {
          where: eq(schema.reminders.id, reminderId),
        },
      },
    });

    if (!userPet?.reminders.length) {
      return { success: false, error: "Reminder not found" };
    }

    await db
      .delete(schema.reminders)
      .where(eq(schema.reminders.id, reminderId));
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete reminder:", error);
    return { success: false, error: "Failed to delete reminder" };
  }
}

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
