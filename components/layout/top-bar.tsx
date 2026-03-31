"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Mic, MicOff } from "lucide-react";

interface TopBarProps {
  sttEnabled?: boolean;
  onSttToggle?: (enabled: boolean) => void;
}

export function TopBar({ sttEnabled = false, onSttToggle }: TopBarProps) {
  const [micActive, setMicActive] = useState(false);

  return (
    <header className="h-14 bg-card/60 backdrop-blur-md border-b border-sage-100/50 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left - App name */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">LearningLoop Speech</span>
      </div>

      {/* Right - Controls */}
      <div className="flex items-center gap-4">
        {/* Microphone status */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors duration-300",
            micActive ? "bg-primary animate-pulse-gentle" : "bg-sage-300"
          )} />
          <span className="text-xs text-muted-foreground">
            {micActive ? "Listening" : "Ready"}
          </span>
        </div>

        {/* STT Toggle */}
        <button
          onClick={() => onSttToggle?.(!sttEnabled)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
            sttEnabled 
              ? "bg-primary/10 text-primary" 
              : "bg-sage-100 text-sage-500"
          )}
        >
          {sttEnabled ? (
            <Mic className="w-3.5 h-3.5" />
          ) : (
            <MicOff className="w-3.5 h-3.5" />
          )}
          STT {sttEnabled ? "On" : "Off"}
        </button>
      </div>
    </header>
  );
}
