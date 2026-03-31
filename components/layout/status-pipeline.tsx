"use client";

import { cn } from "@/lib/utils";
import { PipelineStep } from "@/lib/types";
import { Check, Loader2, Lightbulb, Volume2, Image, Sparkles } from "lucide-react";

interface StatusPipelineProps {
  currentStep: PipelineStep;
}

const steps: { key: PipelineStep; label: string; labelTr: string; icon: typeof Check }[] = [
  { key: "strategy", label: "Strategy", labelTr: "Strateji", icon: Lightbulb },
  { key: "audio", label: "Audio", labelTr: "Ses", icon: Volume2 },
  { key: "visual", label: "Visual", labelTr: "Görsel", icon: Image },
  { key: "ready", label: "Ready", labelTr: "Hazır", icon: Sparkles },
];

function getStepStatus(
  stepKey: PipelineStep,
  currentStep: PipelineStep
): "pending" | "active" | "completed" {
  if (currentStep === "idle") return "pending";

  // When ready, all steps are completed
  if (currentStep === "ready") return "completed";

  const stepOrder = ["strategy", "audio", "visual", "ready"];
  const currentIndex = stepOrder.indexOf(currentStep);
  const stepIndex = stepOrder.indexOf(stepKey);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

export function StatusPipeline({ currentStep }: StatusPipelineProps) {
  if (currentStep === "idle") return null;

  const activeStep = steps.find(s => getStepStatus(s.key, currentStep) === "active");
  const completedCount = steps.filter(s => getStepStatus(s.key, currentStep) === "completed").length;
  const progress = currentStep === "ready" ? 100 : (completedCount / steps.length) * 100;

  return (
    <div className="mb-4 bg-white rounded-xl border border-gray-100 p-4">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="absolute left-0 top-0 h-full bg-gray-900 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key, currentStep);
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                  status === "completed" ? "bg-emerald-600 text-white" : "",
                  status === "active" ? "bg-gray-900 text-white scale-110" : "",
                  status === "pending" ? "bg-gray-200 text-gray-400" : ""
                )}
              >
                {status === "completed" ? (
                  <Check className="h-5 w-5" />
                ) : status === "active" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className={cn(
                "text-xs mt-1.5 font-medium transition-colors",
                status === "completed" ? "text-emerald-700" : "",
                status === "active" ? "text-gray-900" : "",
                status === "pending" ? "text-gray-400" : ""
              )}>
                {step.labelTr}
              </span>
            </div>
          );
        })}
      </div>

      {/* Active Step Message */}
      {activeStep && (
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
              {activeStep.labelTr} olusturuluyor...
            </span>
          </p>
        </div>
      )}

      {currentStep === "ready" && (
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-700 font-medium">
            Hazır! Pratik yapmaya baslayabilirsin.
          </p>
        </div>
      )}
    </div>
  );
}
