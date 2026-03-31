"use client";

import { useRef, useEffect } from "react";
import { VideoResult } from "@/lib/types";
import { Video, RefreshCw, Play } from "lucide-react";

interface VideoCueCardProps {
  video: VideoResult | null;
  isLoading: boolean;
  onRegenerate: () => void;
  word: string;
}

export function VideoCueCard({
  video,
  isLoading,
  onRegenerate,
  word,
}: VideoCueCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && video?.videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  }, [video?.videoUrl]);

  if (isLoading) {
    return (
      <div className="card-soft p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-sage-500 flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5" />
            Video
          </h3>
        </div>
        <div className="skeleton-soft h-48 w-full" />
      </div>
    );
  }

  if (!word) {
    return (
      <div className="card-soft p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-sage-500 flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5" />
            Video
          </h3>
        </div>
        <div className="flex h-48 items-center justify-center rounded-xl bg-sage-50 border border-sage-100">
          <p className="text-xs text-sage-400">Enter a word</p>
        </div>
      </div>
    );
  }

  if (video?.isFallback || !video?.videoUrl) {
    return (
      <div className="card-soft p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-sage-500 flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5" />
            Video
          </h3>
          <span className="text-xs text-sage-300">Optional</span>
        </div>
        <div className="flex h-48 items-center justify-center rounded-xl bg-sage-50/50 border border-sage-100 gap-2">
          <Play className="h-4 w-4 text-sage-300" />
          <p className="text-xs text-sage-400">Unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-sage-500 flex items-center gap-1.5">
          <Video className="h-3.5 w-3.5" />
          Video
        </h3>
        <button
          onClick={onRegenerate}
          className="text-xs text-sage-400 hover:text-sage-600 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
      <div className="relative overflow-hidden rounded-xl">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="h-48 w-full object-cover"
          loop
          muted
          playsInline
          autoPlay
        />
      </div>
    </div>
  );
}
