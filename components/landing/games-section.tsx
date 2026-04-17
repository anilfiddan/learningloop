"use client";

import { Mic, Package, Brain } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function GamesSection() {
  const { lang } = useLanguage();

  const tools = [
    {
      icon: Brain,
      title: lang === "tr" ? "Akıllı Pratik" : "Smart Practice",
      description: lang === "tr"
        ? "AI, telaffuzunuzu analiz eder ve zorluk yaşadığınız sesleri tespit eder. Kişisel koçluk ipuçlarıyla hedefe yönelik çalışın."
        : "AI analyzes your pronunciation and identifies sounds you struggle with. Work towards goals with personalized coaching tips.",
      features: lang === "tr"
        ? ["Hece bazlı analiz", "Kişisel koçluk", "Anlık geri bildirim", "Tekrar önerileri"]
        : ["Syllable-level analysis", "Personal coaching", "Instant feedback", "Repeat suggestions"],
    },
    {
      icon: Package,
      title: lang === "tr" ? "Kelime Paketleri" : "Word Packs",
      description: lang === "tr"
        ? "Kategorilere göre hazır kelime paketleriyle pratik yapın veya kendi listenizi oluşturun."
        : "Practice with ready-made word packs by category or create your own custom lists.",
      features: lang === "tr"
        ? ["Kategorili paketler", "Özel listeler", "Zorluk seviyeleri", "Sözlük entegrasyonu"]
        : ["Categorized packs", "Custom lists", "Difficulty levels", "Dictionary integration"],
    },
    {
      icon: Mic,
      title: lang === "tr" ? "Telaffuz Quizi" : "Pronunciation Quiz",
      description: lang === "tr"
        ? "Öğrendiğiniz kelimeleri quiz ile pekiştirin. Görseller ve ses ipuçlarıyla hafızanızı güçlendirin."
        : "Reinforce learned words with quizzes. Strengthen your memory with visual and audio cues.",
      features: lang === "tr"
        ? ["AI görseller", "Sesli ipuçları", "İlerleme skoru", "Tekrar algoritması"]
        : ["AI visuals", "Audio cues", "Progress score", "Repeat algorithm"],
    },
  ];

  return (
    <section id="tools" className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {lang === "tr" ? "Pratik Araçları" : "Practice Tools"}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {lang === "tr"
              ? "Telaffuz gelişiminizi hızlandırmak için tasarlanmış araçlar"
              : "Tools designed to accelerate your pronunciation improvement"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-5">
                <tool.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">{tool.description}</p>

              <div className="flex flex-wrap gap-2">
                {tool.features.map((feature, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 border border-gray-100">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
