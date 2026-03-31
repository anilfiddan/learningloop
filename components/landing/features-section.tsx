"use client";

import { AudioWaveform, BrainCircuit, Eye, Mic, MessageSquare, TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function FeaturesSection() {
  const { lang } = useLanguage();

  const features = [
    {
      icon: AudioWaveform,
      title: lang === "tr" ? "Hece Analizi" : "Syllable Analysis",
      description: lang === "tr" ? "Kelimeleri hecelere ayirir, her birinin dogru telaffuzunu gosterir" : "Breaks words into syllables, shows correct pronunciation for each",
    },
    {
      icon: BrainCircuit,
      title: lang === "tr" ? "NLP Degerlendirme" : "NLP Evaluation",
      description: lang === "tr" ? "Yapay zeka telaffuzunuzu analiz eder ve gelisim alanlarinizi belirler" : "AI analyzes your pronunciation and identifies areas for improvement",
    },
    {
      icon: Eye,
      title: lang === "tr" ? "Gorsel Ipuclari" : "Visual Cues",
      description: lang === "tr" ? "AI tarafindan olusturulan gorseller ve videolarla kelimeleri somutlastirir" : "Makes words concrete with AI-generated images and videos",
    },
    {
      icon: Mic,
      title: lang === "tr" ? "Ses Kaydi ve Karsilastirma" : "Voice Recording & Comparison",
      description: lang === "tr" ? "Sesinizi kaydedin, dogru telaffuzla karsilastirin" : "Record your voice, compare with correct pronunciation",
    },
    {
      icon: MessageSquare,
      title: lang === "tr" ? "Kisisel Kocluk" : "Personal Coaching",
      description: lang === "tr" ? "Agiz pozisyonu, nefes kontrolu ve vurgu rehberligi" : "Mouth position, breath control and stress guidance",
    },
    {
      icon: TrendingUp,
      title: lang === "tr" ? "Ilerleme Takibi" : "Progress Tracking",
      description: lang === "tr" ? "Zaman icindeki gelisiminizi detayli grafiklerle takip edin" : "Track your development over time with detailed charts",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {lang === "tr" ? "Ozellikler" : "Features"}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {lang === "tr" ? "Telaffuz gelisiminizi destekleyen yapay zeka ozellikleri" : "AI features that support your pronunciation development"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
