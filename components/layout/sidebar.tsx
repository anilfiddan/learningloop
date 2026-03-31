"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Mic, 
  BarChart3, 
  Settings, 
  Flame,
  Dumbbell,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navItems = [
  { href: "/", label: "Practice", icon: Mic },
  { href: "/exercises", label: "Exercises", icon: Dumbbell, disabled: true },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings, disabled: true },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const streak = 4;

  return (
    <aside 
      className={cn(
        "h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-600" />
        )}
      </button>

      {/* Logo */}
      <div className={cn("p-4", isCollapsed ? "px-3" : "px-4")}>
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">L</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-semibold text-foreground tracking-tight text-sm">LearningLoop</h1>
              <p className="text-xs text-muted-foreground">Speech</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                {item.disabled ? (
                  <span
                    className={cn(
                      "flex items-center rounded-lg text-sm cursor-not-allowed",
                      isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                      "text-gray-300"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span>{item.label}</span>
                        <span className="ml-auto text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">Soon</span>
                      </>
                    )}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg text-sm transition-all duration-200",
                      isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Streak Badge - Only show when expanded */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <div className="p-3 bg-gray-100 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">{streak} day streak</p>
                <p className="text-xs text-gray-500">Keep going!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed streak icon */}
      {isCollapsed && (
        <div className="px-2 pb-3 flex justify-center">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center" title={`${streak} day streak`}>
            <Flame className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </aside>
  );
}
