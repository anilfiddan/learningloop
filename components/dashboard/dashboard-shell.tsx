"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/language-context";
import { getAttempts } from "@/lib/stores/word-store";
import { PracticeAttempt } from "@/lib/types/word";
import {
  Mic,
  BarChart3,
  Settings,
  Flame,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FolderOpen,
  History,
  Globe,
  Menu,
  X,
  Gamepad2,
  Package,
  CalendarCheck
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function calculateStreak(attempts: PracticeAttempt[]): number {
  if (attempts.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const hasAttempt = attempts.some(a => {
      const attemptDate = new Date(a.createdAt);
      return attemptDate >= dayStart && attemptDate <= dayEnd;
    });

    if (hasAttempt) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (streak === 0) {
      currentDate.setDate(currentDate.getDate() - 1);
      if (currentDate < new Date(today.getTime() - 86400000)) break;
    } else {
      break;
    }
  }

  return streak;
}

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/dashboard", label: t.dashboard.practice, icon: Mic },
    { href: "/dashboard/daily", label: lang === "tr" ? "Gunluk Pratik" : "Daily Practice", icon: CalendarCheck },
    { href: "/dashboard/quiz", label: lang === "tr" ? "Quiz" : "Quiz", icon: Gamepad2 },
    { href: "/dashboard/packs", label: lang === "tr" ? "Paketler" : "Packs", icon: Package },
    { href: "/dashboard/dictionary", label: t.dashboard.dictionary, icon: BookOpen },
    { href: "/dashboard/lists", label: lang === "tr" ? "Listeler" : "Lists", icon: FolderOpen },
    { href: "/dashboard/history", label: lang === "tr" ? "Gecmis" : "History", icon: History },
    { href: "/dashboard/progress", label: t.dashboard.progress, icon: BarChart3 },
    { href: "/dashboard/settings", label: t.dashboard.settings, icon: Settings },
  ];

  useEffect(() => {
    const attempts = getAttempts();
    setStreak(calculateStreak(attempts));
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getPageTitle = () => {
    if (pathname === "/dashboard") return lang === "tr" ? "Pratik" : "Practice";
    if (pathname === "/dashboard/daily") return lang === "tr" ? "Gunluk Pratik" : "Daily Practice";
    if (pathname === "/dashboard/quiz") return "Quiz";
    if (pathname === "/dashboard/packs") return lang === "tr" ? "Paketler" : "Packs";
    if (pathname === "/dashboard/dictionary") return lang === "tr" ? "Sozluk" : "Dictionary";
    if (pathname === "/dashboard/lists") return lang === "tr" ? "Listeler" : "Lists";
    if (pathname === "/dashboard/history") return lang === "tr" ? "Gecmis" : "History";
    if (pathname === "/dashboard/progress") return lang === "tr" ? "Ilerleme" : "Progress";
    if (pathname === "/dashboard/settings") return lang === "tr" ? "Ayarlar" : "Settings";
    if (pathname?.startsWith("/dashboard/word/")) return lang === "tr" ? "Kelime Detayi" : "Word Detail";
    return "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-50",
          "hidden lg:flex",
          sidebarCollapsed ? "lg:w-16" : "lg:w-60"
        )}
      >
        {/* Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10 hidden lg:flex"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600" />
          )}
        </button>

        {/* Logo */}
        <div className={cn("p-4", sidebarCollapsed ? "px-3" : "px-4")}>
          <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-3")}>
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-gray-900 text-sm">LearningLoop</h1>
                <p className="text-xs text-gray-400">{lang === "tr" ? "Telaffuz Asistani" : "Speech Assistant"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 mt-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg text-sm transition-all duration-200",
                      sidebarCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Streak */}
        {!sidebarCollapsed && streak > 0 && (
          <div className="px-3 pb-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">
                    {streak} {lang === "tr" ? "gunluk seri" : "day streak"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {lang === "tr" ? "Devam et!" : "Keep going!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {sidebarCollapsed && streak > 0 && (
          <div className="px-2 pb-3 flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center" title={`${streak} ${lang === "tr" ? "gunluk seri" : "day streak"}`}>
              <Flame className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 z-50 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">LearningLoop</h1>
              <p className="text-xs text-gray-400">{lang === "tr" ? "Telaffuz Asistani" : "Speech Assistant"}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {streak > 0 && (
          <div className="px-3 pb-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">
                  {streak} {lang === "tr" ? "gunluk seri" : "day streak"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>{lang === "tr" ? "Cikis Yap" : "Log out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-60",
        "ml-0"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 h-14 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 lg:px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-gray-900 text-sm">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => setLang(lang === "tr" ? "en" : "tr")}
              className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              title={lang === "tr" ? "Switch to English" : "Turkce'ye gec"}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === "tr" ? "EN" : "TR"}</span>
            </button>

            {user?.email && (
              <span className="text-sm text-gray-400 hidden md:inline">{user.email}</span>
            )}

            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{lang === "tr" ? "Cikis" : "Log out"}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
