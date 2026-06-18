"use client";

import { motion } from "framer-motion";

export function Manifesto() {
  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <p className="text-mono-label text-white/40 mb-12">
            (01) — Manifesto
          </p>
          <h2 className="text-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight font-medium text-white/90">
            We believe AI is a{" "}
            <span className="text-serif-italic text-white/55">tool</span>,
            not a substitute for taste. Every reel we ship is conceived by a
            human creative, generated with our AI pipeline, and finished by
            hand — <span className="text-serif-italic text-white/55">framed</span>{" "}
            cut by cut, beat by beat.
          </h2>

          <div className="hairline mt-20" />

          <div className="mt-12 grid md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                k: "Taste over template",
                v: "No two reels look alike. Your brief is the source — not a stock library.",
              },
              {
                k: "Pipeline, not prompt",
                v: "Ideation, generation, editing, grading, sound — each stage owned by a specialist.",
              },
              {
                k: "Delivery, not drafts",
                v: "You receive a finished, publish-ready file. Not a deck of options.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.k}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex flex-col gap-3"
              >
                <span className="text-mono-label text-white/40">
                  0{i + 1}
                </span>
                <h3 className="font-display text-xl font-medium tracking-tight text-white">
                  {item.k}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {item.v}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
