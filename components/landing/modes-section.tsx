"use client";

import { Mic, BookOpen, ListChecks } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function ModesSection() {
  const { t, lang } = useLanguage();
  
  return (
    <section id="modes" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.modes.title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.modes.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Quick Practice */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
              <Mic className="w-7 h-7 text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{t.modes.quickPractice}</h3>
            <p className="text-gray-600 mb-4">
              {t.modes.quickPracticeDesc}
            </p>
          </div>

          {/* Dictionary */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{t.modes.dictionary}</h3>
            <p className="text-gray-600 mb-4">
              {t.modes.dictionaryDesc}
            </p>
          </div>

          {/* Lists */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center mb-6">
              <ListChecks className="w-7 h-7 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{t.modes.lists}</h3>
            <p className="text-gray-600 mb-4">
              {t.modes.listsDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
