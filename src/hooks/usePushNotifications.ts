import { useEffect, useState } from "react";
import { toast } from "sonner";
import { subscribeUser, unsubscribeUser } from "../app/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function registerServiceWorker(
  setSubscription: (sub: PushSubscription | null) => void,
  setIsLoading: (loading: boolean) => void,
  subscribeToPush: () => Promise<boolean>
) {
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
    setIsLoading(false);

    // Prompt for notification permission on mount if not granted
    if (Notification.permission === "default") {
      await subscribeToPush();
    }
  } catch (error) {
    console.error("Failed to register service worker:", error);
    setIsLoading(false);
    toast.error("Neizdevās reģistrēt paziņojumu servisu");
  }
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);
      const serializedSub = JSON.parse(JSON.stringify(sub));

      const promise = subscribeUser(serializedSub);
      toast.promise(promise, {
        loading: "Ieslēdzam paziņojumus...",
        success: "Paziņojumi ieslēgti!",
        error: "Neizdevās ieslēgt paziņojumus",
      });

      await promise;
      return true;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      if (Notification.permission === "denied") {
        toast.error("Lūdzu atļaujiet paziņojumus pārlūka iestatījumos");
      }
      return false;
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe();
      setSubscription(null);

      const promise = unsubscribeUser();
      toast.promise(promise, {
        loading: "Atslēdzam paziņojumus...",
        success: "Paziņojumi atslēgti",
        error: "Neizdevās atslēgt paziņojumus",
      });

      await promise;
      return true;
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      return false;
    }
  }

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker(setSubscription, setIsLoading, subscribeToPush);
    } else {
      setIsLoading(false);
      toast.error("Jūsu pārlūks neatbalsta paziņojumus");
    }
  }, []);

  return {
    isSupported,
    isSubscribed: !!subscription,
    isLoading,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush,
  };
}
