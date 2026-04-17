"use client";

import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface CTASectionProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function CTASection({ onGetStarted, onLogin }: CTASectionProps) {
  const { lang } = useLanguage();

  return (
    <section className="py-24 px-6 bg-gray-900">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          {lang === "tr"
            ? "Telaffuz Yolculuğunuza Başlayın"
            : "Start Your Pronunciation Journey"}
        </h2>
        <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
          {lang === "tr"
            ? "Ücretsiz hesap oluşturun ve AI destekli kişisel telaffuz asistanınızla hemen pratik yapmaya başlayın."
            : "Create a free account and start practicing with your AI-powered personal pronunciation assistant right away."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 text-base font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            {lang === "tr" ? "Ücretsiz Başla" : "Start Free"}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLogin}
            className="px-8 py-4 text-base font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 border border-gray-700 rounded-xl hover:border-gray-500"
          >
            {lang === "tr" ? "Hesabım Var" : "I Have an Account"}
          </button>
        </div>

        <p className="text-sm text-gray-500">
          {lang === "tr"
            ? "Kredi kartı gerekmez. Terapi yerine geçmez, tamamlayıcı destek sağlar."
            : "No credit card required. Does not replace therapy, provides complementary support."}
        </p>
      </div>
    </section>
  );
}
