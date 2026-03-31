"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { RecordingMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";
import { 
  Mic, 
  Square, 
  Play, 
  Pause,
  RotateCcw,
  Clock,
  Hash,
  Target
} from "lucide-react";

interface VoiceRecorderProps {
  word: string;
  onRecordingComplete: (metrics: RecordingMetrics) => void;
  attemptNumber: number;
}

export function VoiceRecorder({
  word,
  onRecordingComplete,
  attemptNumber,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const pauseCountRef = useRef(0);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      // Close AudioContext to prevent memory leak
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  const isRecordingRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const detectPauses = useCallback((analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkAmplitude = () => {
      if (!isRecordingRef.current) return;

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      const SILENCE_THRESHOLD = 10;
      const PAUSE_DURATION_MS = 200;

      if (average < SILENCE_THRESHOLD) {
        if (silenceStartRef.current === null) {
          silenceStartRef.current = Date.now();
        } else if (Date.now() - silenceStartRef.current > PAUSE_DURATION_MS) {
          if (silenceStartRef.current !== -1) {
            pauseCountRef.current++;
            setPauseCount(pauseCountRef.current);
            silenceStartRef.current = -1;
          }
        }
      } else {
        silenceStartRef.current = null;
      }

      animationFrameRef.current = requestAnimationFrame(checkAmplitude);
    };

    checkAmplitude();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio analysis for pause detection - reuse or create AudioContext
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      pauseCountRef.current = 0;
      setPauseCount(0);
      setRecordingTime(0);
      silenceStartRef.current = null;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        setAudioUrl(url);
        
        // Get actual duration
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          const finalDuration = audio.duration;
          setDuration(finalDuration);
          
          onRecordingComplete({
            duration: finalDuration,
            pauseCount: pauseCountRef.current,
            attemptNumber: attemptNumber + 1,
          });
        };

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 0.1);
      }, 100);

      // Start pause detection
      detectPauses(analyser);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      
      audio.play();
      setIsPlaying(true);
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setDuration(0);
    setPauseCount(0);
    setRecordingTime(0);
  };

  if (!word) {
    return (
      <div className="card-soft p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-sage-500 flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5" />
            Record
          </h3>
        </div>
        <div className="flex h-20 items-center justify-center rounded-xl bg-sage-50 border border-sage-100">
          <p className="text-xs text-sage-400">Enter a word first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-sage-500 flex items-center gap-1.5">
          <Mic className="h-3.5 w-3.5" />
          Record
        </h3>
        {isRecording && (
          <div className="flex items-center gap-1.5 text-rose-500">
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono text-xs">{recordingTime.toFixed(1)}s</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Recording controls */}
        <div className="flex items-center justify-center gap-4 py-2">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center transition-all",
                "bg-gradient-to-br from-primary to-mint-500 text-white shadow-lg",
                "hover:scale-110 hover:shadow-xl",
                "border-4 border-white"
              )}
            >
              <Mic className="h-7 w-7" />
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center transition-all",
                "bg-rose-500 text-white shadow-lg animate-pulse",
                "border-4 border-white"
              )}
            >
              <Square className="h-6 w-6" />
            </button>
          )}

          {audioUrl && !isRecording && (
            <>
              <button
                onClick={playRecording}
                className="h-11 w-11 rounded-full flex items-center justify-center bg-sage-100 text-sage-600 hover:bg-sage-200 border-2 border-sage-200"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <button
                onClick={startRecording}
                className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center transition-all",
                  "bg-gradient-to-br from-primary to-mint-500 text-white shadow-lg",
                  "hover:scale-110 hover:shadow-xl",
                  "border-4 border-white"
                )}
              >
                <Mic className="h-7 w-7" />
              </button>
              <button
                onClick={resetRecording}
                className="h-11 w-11 rounded-full flex items-center justify-center bg-sage-50 text-sage-500 hover:bg-sage-100 border-2 border-sage-200"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Metrics - Compact inline */}
        {(audioUrl || isRecording) && (
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-sage-500">
              <Clock className="h-3 w-3" />
              <span>{isRecording ? recordingTime.toFixed(1) : duration.toFixed(1)}s</span>
            </div>
            <div className="flex items-center gap-1 text-sage-500">
              <Hash className="h-3 w-3" />
              <span>{pauseCount} pauses</span>
            </div>
            <div className="flex items-center gap-1 text-sage-500">
              <Target className="h-3 w-3" />
              <span>#{attemptNumber + (audioUrl ? 1 : 0)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
