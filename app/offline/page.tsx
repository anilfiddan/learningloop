"use client";

import { WifiOff, Mic } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Baglanti Yok
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Internet baglantiniz kesilmis gorunuyor. Telaffuz pratigi yapmak icin
          internete bagli olmaniz gerekiyor.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all text-sm"
        >
          Tekrar Dene
        </button>
        <div className="flex items-center justify-center gap-2 mt-8">
          <Mic className="w-4 h-4 text-gray-300" />
          <span className="text-xs text-gray-300">LearningLoop</span>
        </div>
      </div>
    </div>
  );
}
