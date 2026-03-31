"use client";

import { Baby, User, Users, GraduationCap } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function WhoItsFor() {
  const { lang } = useLanguage();

  const audiences = lang === "tr" ? [
    {
      icon: Baby,
      title: "Cocuklar",
      description: "Konusma gelisim surecinde destek arayan cocuklar icin eglenceli ve motive edici pratik ortami",
    },
    {
      icon: User,
      title: "Yetiskinler",
      description: "Telaffuz zorluklari yasayan veya ikinci dilde netlik kazanmak isteyen yetiskinler",
    },
    {
      icon: GraduationCap,
      title: "Terapist Destegi",
      description: "Dil ve konusma terapistlerinin hastalarına ev odevi olarak onerebilecegi tamamlayici arac",
    },
    {
      icon: Users,
      title: "Aileler",
      description: "Yakinlarinin konusma pratigi surecine destek olmak isteyen aile uyeleri",
    },
  ] : [
    {
      icon: Baby,
      title: "Children",
      description: "A fun and motivating practice environment for children needing speech development support",
    },
    {
      icon: User,
      title: "Adults",
      description: "Adults experiencing pronunciation difficulties or seeking clarity in a second language",
    },
    {
      icon: GraduationCap,
      title: "Therapist Support",
      description: "A complementary tool that speech therapists can recommend as homework for their patients",
    },
    {
      icon: Users,
      title: "Families",
      description: "Family members who want to support their loved ones' speech practice journey",
    },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {lang === "tr" ? "Kimler Icin?" : "Who Is It For?"}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {lang === "tr"
              ? "Konusma ve telaffuz gelisimini desteklemek isteyen herkes icin"
              : "For everyone who wants to support their speech and pronunciation development"
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {audiences.map((audience, index) => (
            <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-11 h-11 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                <audience.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{audience.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{audience.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
