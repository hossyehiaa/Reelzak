"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useI18n, type Locale } from "@/lib/i18n";
import { Languages } from "lucide-react";

/**
 * LanguageToggle — minimal EN/AR switch.
 *
 * Renders a pill with two segments (EN | AR). The active segment is solid
 * white-on-black; the inactive is faint. Clicking the inactive segment
 * switches the locale.
 *
 * The toggle is intentionally small and unobtrusive — it sits in the
 * navbar without competing with the brand or CTAs.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  const segments: { key: Locale; label: string }[] = [
    { key: "en", label: "EN" },
    { key: "ar", label: "ع" },
  ];

  return (
    <div
      className={`relative inline-flex items-center gap-0.5 p-0.5 rounded-full border border-white/10 bg-white/[0.02] ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      {segments.map((seg) => {
        const isActive = locale === seg.key;
        return (
          <button
            key={seg.key}
            onClick={() => setLocale(seg.key)}
            className="relative px-2.5 py-1 text-xs font-medium tracking-wide transition-colors duration-300 rounded-full"
            aria-pressed={isActive}
            aria-label={seg.key === "en" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {isActive && (
              <motion.span
                layoutId="lang-toggle-active"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-300 ${
                isActive ? "text-black" : "text-white/50 hover:text-white/80"
              }`}
            >
              {seg.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
