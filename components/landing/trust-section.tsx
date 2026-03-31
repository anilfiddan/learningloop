"use client";

import { Shield, UserX, Ban } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function TrustSection() {
  const { t } = useLanguage();
  
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-lg">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.trust.title}</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              {t.trust.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-sm text-gray-600 font-medium">{t.trust.feature1}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <UserX className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-sm text-gray-600 font-medium">{t.trust.feature2}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-4">
                <Ban className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-sm text-gray-600 font-medium">{t.trust.feature3}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
