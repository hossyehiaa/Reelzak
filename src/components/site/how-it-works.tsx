"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, Wand2, Package } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: FileText,
    title: "Fill the Brief",
    body: "Tell us about your brand, the objective, the style, the audience, the deadline. Two minutes — that's all we ask. The rest is on us.",
    detail: "Brand · Objective · Style · Audience · Deadline",
  },
  {
    num: "02",
    icon: Wand2,
    title: "Our Team Works",
    body: "A creative director ideates. Our AI specialists generate. An editor assembles. A colorist grades. A sound designer scores. You don't see the messy middle — just the cut.",
    detail: "Ideation · AI Generation · Editing · Grading · Sound",
  },
  {
    num: "03",
    icon: Package,
    title: "Receive Your Reel",
    body: "A finished, publish-ready vertical reel lands in your client portal. Download it. Schedule it. Ship it. Or request one revision round — included in every package.",
    detail: "Review · Download · Publish",
  },
];

export function HowItWorks() {
  return (
    <section id="process" className="relative py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24"
        >
          <div>
            <p className="text-mono-label text-white/40 mb-4">
              (02) — Process
            </p>
            <h2 className="text-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight font-medium">
              Three steps.
              <br />
              <span className="text-serif-italic text-white/55">
                Zero friction.
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-base text-white/50 leading-relaxed">
            From brief to delivered file in five business days. Monthly plans
            ship in three. Studio tier ships in forty-eight hours.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="group relative bg-background p-8 md:p-10 flex flex-col gap-6 min-h-[420px] hover:bg-white/[0.02] transition-colors duration-500"
            >
              {/* Number + icon */}
              <div className="flex items-start justify-between">
                <span className="font-mono text-sm text-white/40 tracking-widest">
                  {step.num}
                </span>
                <div className="h-10 w-10 rounded-full border border-white/15 flex items-center justify-center group-hover:border-white/30 transition-colors duration-500">
                  <step.icon className="h-4 w-4 text-white/70" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-display text-2xl md:text-3xl font-medium tracking-tight mt-auto">
                {step.title}
              </h3>

              {/* Body */}
              <p className="text-sm md:text-base text-white/50 leading-relaxed">
                {step.body}
              </p>

              {/* Detail */}
              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-mono-label text-white/40">{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
