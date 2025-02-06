"use server";

import { prisma } from "@/utils/get-prisma";
import { ApiError } from "next/dist/server/api-utils";
import { auth } from "src/auth";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:ronalds.palacis@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub;
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    // Upsert the subscription - replace if exists, create if doesn't
    await prisma.pushSubscription.upsert({
      where: { userId: session.user.id },
      update: { subscription: JSON.stringify(sub) },
      create: { userId: session.user.id, subscription: JSON.stringify(sub) },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to save subscription:", error);
    return { success: false };
  }
}

export async function unsubscribeUser() {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    // Simply delete by userId since it's a one-to-one relation
    await prisma.pushSubscription.delete({
      where: { userId: session.user.id },
    });
    subscription = null;
    return { success: true };
  } catch (error) {
    console.error("Failed to remove subscription:", error);
    return { success: false };
  }
}

export async function sendNotification(
  subscription: PushSubscription,
  message: string,
  title: string = "Test Notification"
) {
  if (!subscription) {
    throw new Error("No subscription available");
  }

  try {
    await webpush.sendNotification(
      subscription as unknown as webpush.PushSubscription,
      JSON.stringify({
        title,
        body: message,
        icon: "/icons/logo.png",
      })
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    // If subscription is invalid/expired, remove it from database
    if ((error as ApiError).statusCode === 410 && subscription.endpoint) {
      await prisma.pushSubscription.deleteMany({
        where: {
          subscription: {
            contains: subscription.endpoint,
          },
        },
      });
    }
    return { success: false, error: "Failed to send notification" };
  }
}
