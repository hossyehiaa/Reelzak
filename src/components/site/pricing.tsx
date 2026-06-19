"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { PRICING_PACKAGES } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

export function Pricing() {
  const { t } = useI18n();

  // Map package slugs to translation keys
  const pkgTranslations: Record<string, { name: string; tagline: string; cta: string; features: string[] }> = {
    single: t.pricing.packages.single,
    "monthly-4": t.pricing.packages.monthly4,
    "monthly-10": t.pricing.packages.monthly10,
  };

  return (
    <section id="pricing" className="relative py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-mono-label text-white/40 mb-4">
            {t.pricing.label}
          </p>
          <h2 className="text-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight font-medium">
            {t.pricing.title1}
            <br />
            <span className="text-serif-italic text-white/55">
              {t.pricing.title2}
            </span>
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base text-white/50 leading-relaxed">
            {t.pricing.body}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {PRICING_PACKAGES.map((pkg, i) => {
            const popular = pkg.popular;
            const trans = pkgTranslations[pkg.slug];
            return (
              <motion.div
                key={pkg.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className={`relative rounded-2xl p-8 md:p-10 flex flex-col ${
                  popular
                    ? "glass-strong border-white/20"
                    : "glass-card"
                }`}
              >
                {/* Popular ribbon */}
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-black text-mono-label">
                    {t.pricing.popular}
                  </div>
                )}

                {/* Header */}
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-display text-xl font-medium tracking-tight">
                    {trans.name}
                  </h3>
                  <span className="text-mono-label text-white/40">
                    {pkg.reelCount} {pkg.reelCount === 1 ? t.common.reel : t.common.reels}
                  </span>
                </div>
                <p className="text-sm text-white/50 mb-8 min-h-[2.5em] leading-relaxed">
                  {trans.tagline}
                </p>

                {/* Price — EGP primary, USD secondary */}
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-display text-5xl md:text-6xl font-medium tracking-tight">
                    {pkg.priceEgp.toLocaleString("en-US")}
                  </span>
                  <span className="text-sm text-white/55 font-medium">
                    {t.common.EGP}
                  </span>
                  <span className="text-sm text-white/45">
                    /{pkg.cadence === "monthly" ? t.pricing.perMonth : t.pricing.perOnce}
                  </span>
                </div>
                <p className="text-xs text-white/40 mb-1">
                  ≈ ${pkg.priceUsd.toFixed(2)} {t.common.USD} ·{" "}
                  {pkg.cadence === "monthly"
                    ? t.pricing.billedMonthly
                    : t.pricing.oneTime}
                </p>
                <p className="text-[11px] text-white/35 mb-8">
                  {t.pricing.paymentNote}
                </p>

                {/* CTA */}
                <Link
                  href="/signup"
                  className={`group inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium rounded-full transition-all duration-300 mb-8 ${
                    popular
                      ? "bg-white text-black hover:bg-white/90 glow-white-soft"
                      : "border border-white/15 text-white hover:border-white/35 hover:bg-white/[0.04]"
                  }`}
                >
                  {trans.cta}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl-flip" />
                </Link>

                {/* Divider */}
                <div className="hairline mb-6" />

                {/* Features */}
                <ul className="space-y-3.5">
                  {trans.features.map((f, fi) => (
                    <li
                      key={fi}
                      className="flex items-start gap-3 text-sm text-white/70"
                    >
                      <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 shrink-0">
                        <Check className="h-2.5 w-2.5 text-white/80" />
                      </span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Sub-note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 text-center text-xs text-white/40"
        >
          {t.pricing.needCustom}{" "}
          <Link
            href="mailto:hello@cglab.studio"
            className="text-white/70 underline underline-offset-4 hover:text-white"
          >
            {t.pricing.talkToUs}
          </Link>
          .
        </motion.p>
      </div>
    </section>
  );
}
