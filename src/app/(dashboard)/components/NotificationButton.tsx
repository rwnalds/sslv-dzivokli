"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, Loader2 } from "lucide-react";

export function NotificationButton() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported) {
    return null;
  }

  if (isLoading) {
    return (
      <button className="btn btn-ghost btn-sm" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </button>
    );
  }

  if (isSubscribed) {
    return (
      <button
        onClick={unsubscribe}
        className="btn btn-ghost btn-sm"
        title="Atslēgt paziņojumus"
      >
        <Bell className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={subscribe}
      className="btn btn-ghost btn-sm"
      title="Ieslēgt paziņojumus"
    >
      <BellOff className="w-4 h-4" />
    </button>
  );
}
