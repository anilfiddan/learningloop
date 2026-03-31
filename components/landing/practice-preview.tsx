"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { AudioWaveform, Mic } from "lucide-react";

export function PracticePreview() {
  const { lang } = useLanguage();

  const benefits = lang === "tr" ? [
    { text: "Hece bazli detayli telaffuz rehberligi" },
    { text: "Gercek zamanli ses analizi ve geri bildirim" },
    { text: "Destekleyici ve motive edici kocluk tonu" },
    { text: "Kisisellestirilmis zorluk tespiti" },
  ] : [
    { text: "Detailed syllable-based pronunciation guidance" },
    { text: "Real-time voice analysis and feedback" },
    { text: "Supportive and motivating coaching tone" },
    { text: "Personalized difficulty detection" },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {lang === "tr" ? "Akilli Pratik Deneyimi" : "Smart Practice Experience"}
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {lang === "tr"
                ? "Sadece dinle-tekrarla degil. AI, her telaffuzunuzu analiz ederek tam olarak nerede zorlandiginizi tespit eder ve size ozel pratik stratejisi olusturur."
                : "Not just listen-and-repeat. AI analyzes each pronunciation attempt, identifies exactly where you struggle, and creates a practice strategy tailored to you."
              }
            </p>

            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <span className="text-gray-600 text-sm">{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {/* Syllable Visualization */}
              <div className="text-center mb-8">
                <p className="text-xs text-emerald-600 uppercase tracking-wider mb-3 font-medium">
                  {lang === "tr" ? "Pratik Kelimesi" : "Practice Word"}
                </p>
                <p className="text-5xl font-bold text-gray-900 mb-6">tesekkurler</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className="px-4 py-2 bg-gray-50 rounded-xl text-lg font-medium text-gray-500 border border-gray-200">te</span>
                  <span className="px-4 py-2 bg-gray-50 rounded-xl text-lg font-medium text-gray-500 border border-gray-200">sek</span>
                  <span className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-lg font-bold shadow-md">kur</span>
                  <span className="px-4 py-2 bg-gray-50 rounded-xl text-lg font-medium text-gray-500 border border-gray-200">ler</span>
                </div>
              </div>

              {/* Audio Waveform Placeholder */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0">
                  <AudioWaveform className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 flex items-center gap-0.5 h-6">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-sky-200 rounded-full"
                      style={{ height: `${Math.random() * 100}%`, minHeight: "3px" }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-emerald-700 text-sm mb-1">
                      {lang === "tr" ? "Guzel ilerleme!" : "Nice progress!"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lang === "tr"
                        ? "\"kur\" hecesindeki vurguyu dogru yaptiiniz. \"sek\" hecesinde 's' sesini biraz daha uzatmayi deneyin."
                        : "You got the stress on \"kur\" syllable right. Try extending the 's' sound a bit more in the \"sek\" syllable."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-br from-emerald-50 to-sky-50 rounded-full blur-3xl opacity-40"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
