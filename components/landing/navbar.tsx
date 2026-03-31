"use client";

import { Mic } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface NavbarProps {
  onLogin: () => void;
  onGetStarted: () => void;
}

export function Navbar({ onLogin, onGetStarted }: NavbarProps) {
  const { lang, setLang } = useLanguage();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleLang = () => {
    setLang(lang === "tr" ? "en" : "tr");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              LearningLoop
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollTo("how-it-works")}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              {lang === "tr" ? "Nasil Calisir" : "How it Works"}
            </button>
            <button
              onClick={() => scrollTo("tools")}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              {lang === "tr" ? "Araclar" : "Tools"}
            </button>
            <button
              onClick={() => scrollTo("features")}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              {lang === "tr" ? "Ozellikler" : "Features"}
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg transition-all"
            >
              {lang === "tr" ? "EN" : "TR"}
            </button>
            <button
              onClick={onLogin}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg transition-all"
            >
              {lang === "tr" ? "Giris Yap" : "Login"}
            </button>
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              {lang === "tr" ? "Basla" : "Start"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
