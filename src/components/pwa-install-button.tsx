"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if already installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isStandalone) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } catch (error) {
      console.error("Error installing PWA:", error);
    }
  };

  if (!isInstallable && !isIOS) return null;

  if (isIOS) {
    return (
      <button
        onClick={() => {
          // Show iOS installation instructions
          // You can implement a modal or tooltip here
          alert(
            "Lai instalētu aplikāciju iOS ierīcē:\n\n" +
              "1. Atver Safari\n" +
              '2. Nospied "Kopīgot" pogu\n' +
              '3. Izvēlies "Pievienot sākuma ekrānam"'
          );
        }}
        className="btn btn-ghost gap-2"
      >
        <Download size={20} />
        <span className="hidden md:inline">Instalēt Aplikāciju</span>
      </button>
    );
  }

  return (
    <button onClick={handleInstallClick} className="btn btn-ghost gap-2">
      <Download size={20} />
      <span className="hidden md:inline">Instalēt Aplikāciju</span>
    </button>
  );
}
