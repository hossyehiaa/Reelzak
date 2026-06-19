"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative pt-36 md:pt-44 pb-20 md:pb-28 overflow-hidden">
      {/* Top label row */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between mb-12 md:mb-16"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white/60 pulse-soft" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-mono-label text-white/50">
              {t.hero.badge}
            </span>
          </div>
          <span className="hidden md:block text-mono-label text-white/40">
            {t.hero.indexLabel}
          </span>
        </motion.div>

        {/* Headline */}
        <div className="max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="text-display text-[2.75rem] sm:text-7xl md:text-8xl lg:text-[8.5rem] leading-[0.95] tracking-tightest font-medium"
          >
            {t.hero.headline1}
            <br />
            {t.hero.headline2}{" "}
            <span className="text-serif-italic text-white/85 font-normal">
              {t.hero.headline2Accent}
            </span>
            <br />
            {t.hero.headline3}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="mt-10 max-w-xl text-lg md:text-xl text-white/55 leading-relaxed"
          >
            {t.hero.body}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
            className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-medium rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft"
            >
              {t.hero.ctaPrimary}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl-flip" />
            </Link>
            <Link
              href="#showreel"
              className="group inline-flex items-center justify-center gap-3 px-7 py-4 text-base text-white/80 hover:text-white rounded-full border border-white/15 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 group-hover:border-white/40 transition-colors">
                <Play className="h-3 w-3 fill-current" />
              </span>
              {t.hero.ctaSecondary}
            </Link>
          </motion.div>
        </div>

        {/* Showreel placeholder */}
        <motion.div
          id="showreel"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          className="mt-20 md:mt-28 relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/[0.08] glass-strong"
        >
          {/* Layered backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02]" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Soft white hotspot */}
          <div className="absolute -inset-32 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08),_transparent_60%)]" />

          {/* Center play */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <button
              className="group relative h-20 w-20 md:h-24 md:w-24 rounded-full border border-white/20 backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-500 flex items-center justify-center"
              aria-label="Play showreel"
            >
              <span className="absolute inset-0 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-500" />
              <Play className="h-7 w-7 md:h-8 md:w-8 fill-white text-white translate-x-0.5" />
            </button>
            <div className="mt-6 text-center">
              <p className="text-mono-label text-white/60">{t.hero.showreelLabel}</p>
              <p className="mt-2 text-sm text-white/40">
                {t.hero.showreelDuration}
              </p>
            </div>
          </div>

          {/* Corner labels */}
          <div className="absolute top-5 left-5 text-mono-label text-white/40">
            {t.hero.recLabel}
          </div>
          <div className="absolute top-5 right-5 text-mono-label text-white/40">
            {t.hero.timecode}
          </div>
          <div className="absolute bottom-5 left-5 text-mono-label text-white/40">
            {t.hero.directorLabel}
          </div>
          <div className="absolute bottom-5 right-5 text-mono-label text-white/40">
            ⌐◼ ◼¬
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
          className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-xl overflow-hidden border border-white/[0.06]"
        >
          {[
            { stat: "480+", label: t.hero.statReels },
            { stat: "120+", label: t.hero.statBrands },
            { stat: "14d", label: t.hero.statTurnaround },
            { stat: "98%", label: t.hero.statRepeat },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-background p-6 md:p-8 flex flex-col gap-2"
            >
              <span className="text-display text-4xl md:text-5xl font-medium tracking-tight text-white">
                {item.stat}
              </span>
              <span className="text-xs text-white/45 tracking-wide">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
