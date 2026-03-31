"use client";

import { Mic } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="py-12 px-6 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">LearningLoop</span>
          </div>
          <p className="text-xs text-gray-400 max-w-md">
            {lang === "tr"
              ? "NLP destekli telaffuz asistani. Konusma ve telaffuz gelisimini destekleyen yapay zeka araci. Profesyonel terapinin yerine gecmez."
              : "NLP-powered pronunciation assistant. An AI tool that supports speech and pronunciation development. Does not replace professional therapy."}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>&copy; {new Date().getFullYear()} LearningLoop</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
