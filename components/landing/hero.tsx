"use client";

import { ArrowRight, Mic, AudioWaveform, BrainCircuit } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface HeroProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function Hero({ onGetStarted, onLogin }: HeroProps) {
  const { lang } = useLanguage();

  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-6 border border-emerald-200">
              <BrainCircuit className="w-4 h-4" />
              {lang === "tr" ? "NLP Destekli Telaffuz Asistani" : "NLP-Powered Pronunciation Assistant"}
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              {lang === "tr" ? (
                <>
                  Her Sesi <span className="text-emerald-600">Net</span> Soyle,
                  <br />
                  Her Gun <span className="text-sky-600">Daha Iyi</span>
                </>
              ) : (
                <>
                  Speak Every Sound <span className="text-emerald-600">Clearly</span>,
                  <br />
                  Get <span className="text-sky-600">Better</span> Every Day
                </>
              )}
            </h1>

            <p className="text-xl text-gray-500 mb-10 leading-relaxed">
              {lang === "tr"
                ? "Konusma ve telaffuz zorluklarini yapay zeka ile analiz edin, kisisellestirilmis pratiklerle ilerlemenizi takip edin. Terapistinizin yaninda, guclü bir destek araci."
                : "Analyze speech and pronunciation challenges with AI, track your progress with personalized practice. A powerful support tool alongside your therapist."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 text-base font-semibold text-white bg-gray-900 rounded-2xl hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Mic className="w-5 h-5" />
                {lang === "tr" ? "Hemen Basla" : "Get Started"}
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-4 text-base font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 bg-white rounded-2xl border border-gray-200 hover:border-gray-300"
              >
                {lang === "tr" ? "Nasil Calisir?" : "How it Works?"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>{lang === "tr" ? "Ucretsiz baslayın" : "Free to start"}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>{lang === "tr" ? "Her yas grubu" : "All ages"}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>{lang === "tr" ? "Kisisel ilerleme" : "Personal progress"}</span>
            </div>
          </div>

          {/* Right - App Preview */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-full px-3 py-1.5 text-xs text-gray-400 text-center border border-gray-100">
                    LearningLoop
                  </div>
                </div>
              </div>

              {/* App Content */}
              <div className="p-6 space-y-4">
                {/* Word Display */}
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider mb-2 font-medium">
                    {lang === "tr" ? "Pratik Kelimesi" : "Practice Word"}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-4">merhaba</p>
                  <div className="flex justify-center gap-2">
                    <span className="px-4 py-2 bg-white rounded-xl text-lg font-medium text-gray-500 border border-gray-200">mer</span>
                    <span className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-lg font-bold shadow-md">ha</span>
                    <span className="px-4 py-2 bg-white rounded-xl text-lg font-medium text-gray-500 border border-gray-200">ba</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center">
                      <AudioWaveform className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{lang === "tr" ? "Dinle" : "Listen"}</p>
                      <p className="text-xs text-gray-400">{lang === "tr" ? "Yavas hiz" : "Slow speed"}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{lang === "tr" ? "Soyle" : "Speak"}</p>
                      <p className="text-xs text-gray-400">{lang === "tr" ? "Sira sizde" : "Your turn"}</p>
                    </div>
                  </div>
                </div>

                {/* Feedback Preview */}
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-semibold text-emerald-700">
                      {lang === "tr" ? "Harika ilerleme!" : "Great progress!"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {lang === "tr" ? "Ikinci heceyi biraz daha vurgulayın" : "Try emphasizing the second syllable a bit more"}
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle decorative */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-emerald-50 to-sky-50 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
