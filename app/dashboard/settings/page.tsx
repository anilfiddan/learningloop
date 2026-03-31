"use client";

import { useState, useEffect } from "react";
import { 
  Globe, 
  Volume2, 
  GraduationCap, 
  Moon, 
  Sun,
  Bell,
  Trash2,
  Download,
  Info,
  Check
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";
type Speed = "slow" | "normal";
type Level = "beginner" | "intermediate";

interface Settings {
  theme: Theme;
  speed: Speed;
  level: Level;
  notifications: boolean;
  autoPlay: boolean;
  showDefinitions: boolean;
}

const defaultSettings: Settings = {
  theme: "light",
  speed: "normal",
  level: "beginner",
  notifications: true,
  autoPlay: true,
  showDefinitions: true,
};

export default function SettingsPage() {
  const { lang, setLang } = useLanguage();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("learningloop-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem("learningloop-settings", JSON.stringify(newSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    saveSettings({ ...settings, [key]: value });
  };

  const clearAllData = () => {
    if (confirm(lang === "tr" 
      ? "Tüm verileriniz silinecek. Emin misiniz?" 
      : "All your data will be deleted. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      settings: localStorage.getItem("learningloop-settings"),
      words: localStorage.getItem("learningloop-words"),
      attempts: localStorage.getItem("learningloop-attempts"),
      lists: localStorage.getItem("learningloop-lists"),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learningloop-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const t = {
    tr: {
      title: "Ayarlar",
      subtitle: "Uygulama tercihlerini özelleştir",
      language: "Dil",
      languageDesc: "Uygulama dilini seç",
      turkish: "Türkçe",
      english: "English",
      speed: "Konuşma Hızı",
      speedDesc: "Ses çalma hızını ayarla",
      slow: "Yavaş",
      normal: "Normal",
      level: "Seviye",
      levelDesc: "Pratik seviyeni seç",
      beginner: "Başlangıç",
      intermediate: "Orta",
      theme: "Tema",
      themeDesc: "Görünüm tercihini seç",
      light: "Açık",
      dark: "Koyu",
      system: "Sistem",
      notifications: "Bildirimler",
      notificationsDesc: "Günlük hatırlatıcılar al",
      autoPlay: "Otomatik Oynat",
      autoPlayDesc: "Kelime seçildiğinde sesi otomatik çal",
      showDefinitions: "Tanımları Göster",
      showDefinitionsDesc: "Kelime kartlarında tanımları göster",
      data: "Veri Yönetimi",
      exportData: "Verileri Dışa Aktar",
      exportDataDesc: "Tüm verilerini JSON olarak indir",
      clearData: "Tüm Verileri Sil",
      clearDataDesc: "Tüm kelimeler, listeler ve ilerleme silinecek",
      about: "Hakkında",
      version: "Sürüm",
      disclaimer: "Bu uygulama yalnızca pratik amaçlıdır. Tıbbi tavsiye, teşhis veya tedavi sağlamaz.",
      saved: "Kaydedildi",
    },
    en: {
      title: "Settings",
      subtitle: "Customize your app preferences",
      language: "Language",
      languageDesc: "Choose your app language",
      turkish: "Türkçe",
      english: "English",
      speed: "Speech Speed",
      speedDesc: "Adjust audio playback speed",
      slow: "Slow",
      normal: "Normal",
      level: "Level",
      levelDesc: "Choose your practice level",
      beginner: "Beginner",
      intermediate: "Intermediate",
      theme: "Theme",
      themeDesc: "Choose your appearance preference",
      light: "Light",
      dark: "Dark",
      system: "System",
      notifications: "Notifications",
      notificationsDesc: "Get daily practice reminders",
      autoPlay: "Auto Play",
      autoPlayDesc: "Automatically play audio when word is selected",
      showDefinitions: "Show Definitions",
      showDefinitionsDesc: "Show definitions on word cards",
      data: "Data Management",
      exportData: "Export Data",
      exportDataDesc: "Download all your data as JSON",
      clearData: "Clear All Data",
      clearDataDesc: "All words, lists, and progress will be deleted",
      about: "About",
      version: "Version",
      disclaimer: "This app is for practice only. It does not provide medical advice, diagnosis, or treatment.",
      saved: "Saved",
    },
  };

  const text = t[lang];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">{text.title}</h1>
        <p className="text-gray-500">{text.subtitle}</p>
      </div>

      {/* Saved indicator */}
      {saved && (
        <div className="fixed top-20 right-6 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg shadow-lg animate-fade-in">
          <Check className="w-4 h-4" />
          {text.saved}
        </div>
      )}

      <div className="space-y-6">
        {/* Language */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{text.language}</h3>
              <p className="text-sm text-gray-500 mb-4">{text.languageDesc}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLang("tr")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    lang === "tr"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {text.turkish}
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    lang === "en"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {text.english}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Speech Speed */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-5 h-5 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{text.speed}</h3>
              <p className="text-sm text-gray-500 mb-4">{text.speedDesc}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSetting("speed", "slow")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    settings.speed === "slow"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {text.slow}
                </button>
                <button
                  onClick={() => updateSetting("speed", "normal")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    settings.speed === "normal"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {text.normal}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Level */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{text.level}</h3>
              <p className="text-sm text-gray-500 mb-4">{text.levelDesc}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSetting("level", "beginner")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    settings.level === "beginner"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {text.beginner}
                </button>
                <button
                  onClick={() => updateSetting("level", "intermediate")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    settings.level === "intermediate"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {text.intermediate}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              {settings.theme === "dark" ? (
                <Moon className="w-5 h-5 text-gray-700" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{text.theme}</h3>
              <p className="text-sm text-gray-500 mb-4">{text.themeDesc}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSetting("theme", "light")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    settings.theme === "light"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {text.light}
                </button>
                <button
                  onClick={() => updateSetting("theme", "dark")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    settings.theme === "dark"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {text.dark}
                </button>
                <button
                  onClick={() => updateSetting("theme", "system")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    settings.theme === "system"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {text.system}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Toggle Settings */}
        <section className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          {/* Notifications */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{text.notifications}</h3>
                <p className="text-sm text-gray-500">{text.notificationsDesc}</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting("notifications", !settings.notifications)}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors",
                settings.notifications ? "bg-gray-900" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                  settings.notifications ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>

          {/* Auto Play */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{text.autoPlay}</h3>
                <p className="text-sm text-gray-500">{text.autoPlayDesc}</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting("autoPlay", !settings.autoPlay)}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors",
                settings.autoPlay ? "bg-gray-900" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                  settings.autoPlay ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>

          {/* Show Definitions */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{text.showDefinitions}</h3>
                <p className="text-sm text-gray-500">{text.showDefinitionsDesc}</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting("showDefinitions", !settings.showDefinitions)}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors",
                settings.showDefinitions ? "bg-gray-900" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                  settings.showDefinitions ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-medium text-gray-900 mb-4">{text.data}</h3>
          <div className="space-y-3">
            <button
              onClick={exportData}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">{text.exportData}</p>
                <p className="text-sm text-gray-500">{text.exportDataDesc}</p>
              </div>
            </button>
            <button
              onClick={clearAllData}
              className="w-full flex items-center gap-3 p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors text-left"
            >
              <Trash2 className="w-5 h-5 text-rose-600" />
              <div>
                <p className="font-medium text-rose-600">{text.clearData}</p>
                <p className="text-sm text-rose-500">{text.clearDataDesc}</p>
              </div>
            </button>
          </div>
        </section>

        {/* About */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-medium text-gray-900 mb-4">{text.about}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{text.version}</span>
              <span className="text-gray-900 font-medium">1.0.0</span>
            </div>
            <p className="text-sm text-gray-500 pt-3 border-t border-gray-100">
              {text.disclaimer}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
