"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { Globe, Gauge, SlidersHorizontal } from "lucide-react";

export function SettingsSection() {
  const { lang } = useLanguage();

  const controls = lang === "tr" ? [
    {
      icon: Globe,
      title: "Dil seçimi",
      description: "Türkçe ve İngilizce dillerinde pratik yapın",
    },
    {
      icon: Gauge,
      title: "Hız kontrolü",
      description: "Yavaş veya normal hızda dinleyin, kendi temponuzda ilerleyin",
    },
    {
      icon: SlidersHorizontal,
      title: "Kişiselleştirilmiş deneyim",
      description: "Seviye, mod ve tercihlerinizi istediğiniz gibi ayarlayın",
    },
  ] : [
    {
      icon: Globe,
      title: "Language selection",
      description: "Practice in Turkish and English languages",
    },
    {
      icon: Gauge,
      title: "Speed control",
      description: "Listen at slow or normal speed, progress at your own tempo",
    },
    {
      icon: SlidersHorizontal,
      title: "Personalized experience",
      description: "Adjust level, mode and preferences as you like",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Visual */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              {/* Settings Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {lang === "tr" ? "Ayarlar" : "Settings"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {lang === "tr" ? "Deneyiminizi özelleştirin" : "Customize your experience"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {lang === "tr" ? "Dil" : "Language"}
                    </span>
                  </div>
                  <span className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg">
                    {lang === "tr" ? "Türkçe" : "English"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Gauge className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {lang === "tr" ? "Konuşma Hızı" : "Speech Speed"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-500">
                      {lang === "tr" ? "Yavaş" : "Slow"}
                    </span>
                    <span className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg">
                      {lang === "tr" ? "Normal" : "Normal"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {lang === "tr" ? "Seviye" : "Level"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-500">
                      {lang === "tr" ? "Başlangıç" : "Beginner"}
                    </span>
                    <span className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg">
                      {lang === "tr" ? "Orta" : "Intermediate"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {lang === "tr" ? "Sizin Kontrolünüzde" : "You're in Control"}
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {lang === "tr"
                ? "Dil, hız ve seviye ayarlarını kendinize göre düzenleyin. Herkesin öğrenim hızı farklıdır — LearningLoop buna saygı duyar."
                : "Adjust language, speed and level settings to your needs. Everyone learns at a different pace — LearningLoop respects that."
              }
            </p>

            <div className="space-y-4">
              {controls.map((control, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <control.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{control.title}</h3>
                    <p className="text-sm text-gray-500">{control.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
