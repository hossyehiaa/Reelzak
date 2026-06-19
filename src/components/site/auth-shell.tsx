"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/site/logo";
import { useI18n } from "@/lib/i18n";

/**
 * AuthShell — shared two-column layout for Login + Signup.
 *
 * Left  = cinematic brand panel (hidden on mobile).
 * Right = the actual form (passed as children).
 */
export function AuthShell({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow: string;
}) {
  const { t } = useI18n();
  return (
    <main className="flex-1 grid lg:grid-cols-2 min-h-screen">
      {/* ============================================================
          LEFT — cinematic brand panel
          ============================================================ */}
      <section className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-white/[0.06]">
        {/* Layered backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          }}
        />
        <div className="absolute -inset-32 bg-[radial-gradient(ellipse_at_30%_40%,_rgba(255,255,255,0.06),_transparent_60%)]" />

        {/* Brand mark — top */}
        <Link
          href="/"
          className="relative z-10 flex items-center group"
          aria-label="CGLAB home"
        >
          <Logo height={52} className="transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {/* Editorial headline — middle */}
        <div className="relative z-10">
          <p className="text-mono-label text-white/40 mb-6">
            {eyebrow}
          </p>
          <h1 className="text-display text-5xl xl:text-6xl 2xl:text-7xl leading-[1.0] tracking-tightest font-medium max-w-xl">
            {t.auth.brandHeadline1}
            <br />
            <span className="text-serif-italic text-white/70">{t.auth.brandHeadline2}</span>
          </h1>
          <p className="mt-8 max-w-md text-base text-white/50 leading-relaxed">
            {t.auth.brandBody}
          </p>
        </div>

        {/* Footer quote — bottom */}
        <div className="relative z-10 pt-12 border-t border-white/[0.06]">
          <p className="text-serif-italic text-xl text-white/60 leading-snug max-w-md">
            "{t.auth.brandQuote}"
          </p>
          <p className="mt-3 text-mono-label text-white/40">
            {t.auth.brandQuoteAttr}
          </p>
        </div>
      </section>

      {/* ============================================================
          RIGHT — form panel
          ============================================================ */}
      <section className="relative flex flex-col">
        {/* Mobile-only brand bar */}
        <div className="lg:hidden p-6 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center" aria-label="CGLAB home">
            <Logo height={40} />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex items-center justify-center p-6 sm:p-10 md:p-16"
        >
          <div className="w-full max-w-md">{children}</div>
        </motion.div>
      </section>
    </main>
  );
}
