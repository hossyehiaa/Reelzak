"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: { num: number; label: string }[];
  current: number; // 0-indexed
  completed: Set<number>;
}

export function StepIndicator({ steps, current, completed }: StepIndicatorProps) {
  const progress = ((current + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      {/* Desktop / tablet — horizontal numbered track */}
      <div className="hidden sm:block">
        {/* Track */}
        <div className="relative">
          <div className="absolute top-4 left-0 right-0 h-px bg-white/[0.08]" />
          <motion.div
            className="absolute top-4 left-0 h-px bg-white/80"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Step dots */}
          <div className="relative flex justify-between">
            {steps.map((step, i) => {
              const isCurrent = i === current;
              const isDone = completed.has(i) && !isCurrent;
              const isFuture = i > current;
              return (
                <div
                  key={step.num}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isFuture
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(255,255,255,1)",
                      borderColor: isFuture
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(255,255,255,1)",
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 h-8 w-8 rounded-full border flex items-center justify-center"
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5 text-black" />
                    ) : (
                      <span
                        className={`text-xs font-mono tracking-wide ${
                          isFuture ? "text-white/40" : "text-black"
                        }`}
                      >
                        {String(step.num).padStart(2, "0")}
                      </span>
                    )}
                  </motion.div>
                  <span
                    className={`text-[11px] tracking-wider uppercase transition-colors duration-300 ${
                      isCurrent
                        ? "text-white"
                        : isFuture
                          ? "text-white/35"
                          : "text-white/55"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile — compact progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-mono-label text-white/55">
            Step {current + 1} / {steps.length}
          </span>
          <span className="text-mono-label text-white/80">
            {steps[current]?.label}
          </span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full bg-white/80 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
