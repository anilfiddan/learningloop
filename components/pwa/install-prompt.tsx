"use client";

import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Download, X, Share, Plus } from "lucide-react";

export function InstallPrompt() {
  const { canInstall, isIOS, isInstalled, isStandalone, promptInstall, dismiss, isDismissed } = usePWA();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show after 30 seconds if not dismissed and not already installed
    if (isStandalone || isInstalled) return;

    const timer = setTimeout(() => {
      if ((canInstall || isIOS) && !isDismissed()) {
        setShow(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [canInstall, isIOS, isStandalone, isInstalled, isDismissed]);

  // Also show when canInstall changes (prompt becomes available)
  useEffect(() => {
    if (canInstall && !isDismissed() && !isInstalled) {
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isDismissed, isInstalled]);

  if (!show) return null;

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) setShow(false);
  };

  const handleDismiss = () => {
    dismiss();
    setShow(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:w-96">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-900" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* App icon */}
          <div className="w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm">
              LearningLoop'u Yükle
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Uygulamayı telefonuna ekle, her yerde konusma pratigi yap.
            </p>

            {/* iOS instructions */}
            {isIOS && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-700 font-medium mb-2">
                  Safari'de yüklemek için:
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Share className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Paylas butonuna bas</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1.5">
                  <Plus className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>"Ana Ekrana Ekle" secenegini bul</span>
                </div>
              </div>
            )}

            {/* Install button (Chrome/Edge) */}
            {canInstall && (
              <button
                onClick={handleInstall}
                className="mt-3 w-full py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Uygulamayı Yükle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
