"use client";

import { useEffect, useState } from "react";
import { sendNotification, subscribeUser, unsubscribeUser } from "./actions";

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

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(subscription, message);
      setMessage("");
    }
  }

  if (!isSupported) {
    return (
      <div className="alert alert-warning">
        <span>Push notifications are not supported in this browser.</span>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
          Push Notifications
        </h3>
        {subscription ? (
          <div className="space-y-4">
            <div className="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>You are subscribed to push notifications!</span>
            </div>
            <div className="join w-full">
              <input
                type="text"
                placeholder="Enter test notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input input-bordered join-item w-full"
              />
              <button
                onClick={sendTestNotification}
                className="btn btn-primary join-item"
              >
                Test
              </button>
            </div>
            <button
              onClick={unsubscribeFromPush}
              className="btn btn-outline btn-error w-full"
            >
              Unsubscribe from Notifications
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Enable notifications to get updates about your pet&apos;s
              appointments and reminders.
            </p>
            <button
              onClick={subscribeToPush}
              className="btn btn-primary w-full"
            >
              Enable Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  };

  if (isStandalone) {
    return (
      <div className="alert alert-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>App is already installed!</span>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title">Install App</h3>

        {isIOS ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              To install this app on your iOS device:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>
                Tap the share button{" "}
                <span className="badge badge-neutral">⎋</span>
              </li>
              <li>
                Scroll down and tap &quot;Add to Home Screen&quot;{" "}
                <span className="badge badge-neutral">➕</span>
              </li>
              <li>Tap &quot;Add&quot; in the top right</li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Install our app for the best experience and quick access to your
              pet&apos;s information.
            </p>
            <button onClick={handleInstall} className="btn btn-primary w-full">
              Install App
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">To install this app on your device:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Open your browser&apos;s menu</li>
              <li>
                Look for &quot;Install App&quot; or &quot;Add to Home
                Screen&quot;
              </li>
              <li>Follow the installation prompts</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="container min-h-screen mx-auto p-4 max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Install App</h1>
      <PushNotificationManager />
      <InstallPrompt />
    </div>
  );
}
