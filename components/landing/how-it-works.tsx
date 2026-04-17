"use client";

import { Search, Headphones, Mic, BarChart3 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function HowItWorks() {
  const { lang } = useLanguage();

  const steps = [
    {
      icon: Search,
      number: "01",
      title: lang === "tr" ? "Kelime Seçin" : "Choose a Word",
      desc: lang === "tr" ? "Pratik yapmak istediğiniz kelimeyi yazın veya hazır listelerden seçin. AI, hecelere ayırır ve öğrenim stratejisi oluşturur." : "Type the word you want to practice or choose from ready lists. AI breaks it into syllables and creates a learning strategy.",
    },
    {
      icon: Headphones,
      number: "02",
      title: lang === "tr" ? "Dinleyin ve Analiz Edin" : "Listen & Analyze",
      desc: lang === "tr" ? "Doğru telaffuzu yavaş ve normal hızda dinleyin. Her hece için ağız pozisyonu ve nefes rehberliği alın." : "Listen to correct pronunciation at slow and normal speed. Get mouth position and breathing guidance for each syllable.",
    },
    {
      icon: Mic,
      number: "03",
      title: lang === "tr" ? "Söyleyin ve Geri Bildirim Alın" : "Speak & Get Feedback",
      desc: lang === "tr" ? "Sesinizi kaydedin, NLP motoru telaffuzunuzu analiz etsin. Hangi hecelerde zorlandığınızı görün ve kişisel ipuçları alın." : "Record your voice and let the NLP engine analyze your pronunciation. See which syllables need work and get personalized tips.",
    },
    {
      icon: BarChart3,
      number: "04",
      title: lang === "tr" ? "İlerlemenizi Takip Edin" : "Track Your Progress",
      desc: lang === "tr" ? "Zaman içindeki gelişiminizi görün. Düzenli pratik önerileriyle her gün biraz daha ilerleyin." : "See your improvement over time. Progress a little more each day with structured practice suggestions.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {lang === "tr" ? "Nasıl Çalışır?" : "How Does It Work?"}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {lang === "tr" ? "4 adımda kişiselleştirilmiş telaffuz pratiğine başlayın" : "Start personalized pronunciation practice in 4 steps"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-mono text-gray-400 mb-1 block">{step.number}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
