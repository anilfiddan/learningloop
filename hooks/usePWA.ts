"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as installed PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    setIsInstalled(standalone);

    // Detect iOS (needs manual install instructions)
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    // Listen for install prompt (Chrome/Edge/Samsung)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;

    await installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      setIsInstalled(true);
      setInstallPrompt(null);
      return true;
    }
    return false;
  }, [installPrompt]);

  // Dismiss: remember for 7 days
  const dismiss = useCallback(() => {
    localStorage.setItem("ll_pwa_dismissed", String(Date.now()));
  }, []);

  const isDismissed = useCallback(() => {
    const dismissed = localStorage.getItem("ll_pwa_dismissed");
    if (!dismissed) return false;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - Number(dismissed) < sevenDays;
  }, []);

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    isIOS: isIOS && !isStandalone,
    isStandalone,
    promptInstall,
    dismiss,
    isDismissed,
  };
}
