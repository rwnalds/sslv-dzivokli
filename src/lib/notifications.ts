import webPush from "web-push";

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error("Missing VAPID keys in environment variables");
}

webPush.setVapidDetails(
  "mailto:test@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendNotification(
  subscription: string,
  payload: NotificationPayload
) {
  try {
    const parsedSubscription = JSON.parse(subscription);
    await webPush.sendNotification(
      parsedSubscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url,
      })
    );
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}
