"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { PRICING_PACKAGES } from "@/lib/brand";

export function Pricing() {
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
            (03) — Pricing
          </p>
          <h2 className="text-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight font-medium">
            Pick a pace.
            <br />
            <span className="text-serif-italic text-white/55">
              We handle the rest.
            </span>
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base text-white/50 leading-relaxed">
            Month-to-month. Cancel anytime. Every plan includes ideation, AI
            generation, editing, and at least one revision round.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {PRICING_PACKAGES.map((pkg, i) => {
            const popular = pkg.popular;
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
                    Most chosen
                  </div>
                )}

                {/* Header */}
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-display text-xl font-medium tracking-tight">
                    {pkg.name}
                  </h3>
                  <span className="text-mono-label text-white/40">
                    {pkg.reelCount} {pkg.reelCount === 1 ? "reel" : "reels"}
                  </span>
                </div>
                <p className="text-sm text-white/50 mb-8 min-h-[2.5em] leading-relaxed">
                  {pkg.tagline}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-display text-5xl md:text-6xl font-medium tracking-tight">
                    ${pkg.priceUsd}
                  </span>
                  <span className="text-sm text-white/45">
                    /{pkg.cadence === "monthly" ? "mo" : "once"}
                  </span>
                </div>
                <p className="text-xs text-white/40 mb-8">
                  {pkg.cadence === "monthly"
                    ? "Billed monthly · cancel anytime"
                    : "One-time delivery · 5-day turnaround"}
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
                  {pkg.cta}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                {/* Divider */}
                <div className="hairline mb-6" />

                {/* Features */}
                <ul className="space-y-3.5">
                  {pkg.features.map((f) => (
                    <li
                      key={f}
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
          Need a higher volume or custom cadence?{" "}
          <Link
            href="mailto:hello@reelzak.studio"
            className="text-white/70 underline underline-offset-4 hover:text-white"
          >
            Talk to us
          </Link>
          .
        </motion.p>
      </div>
    </section>
  );
}
