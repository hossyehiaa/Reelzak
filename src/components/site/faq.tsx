"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/brand";

export function FAQ() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  return (
    <section id="faq" className="relative py-32 md:py-40">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-16 md:mb-20"
        >
          <p className="text-mono-label text-white/40 mb-4">
            (04) — Questions
          </p>
          <h2 className="text-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight font-medium">
            Before you ask,
            <br />
            <span className="text-serif-italic text-white/55">
              we answer.
            </span>
          </h2>
        </motion.div>

        {/* Accordion */}
        <div className="border-t border-white/[0.08]">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="border-b border-white/[0.08]"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-7 text-left group"
                >
                  <span
                    className={`font-display text-lg md:text-2xl font-medium tracking-tight transition-colors duration-300 ${
                      isOpen ? "text-white" : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "border-white/30 bg-white/[0.06]"
                        : "border-white/15 group-hover:border-white/30"
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="h-4 w-4 text-white" />
                    ) : (
                      <Plus className="h-4 w-4 text-white/70" />
                    )}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <p className="pb-7 pr-14 text-base text-white/55 leading-relaxed max-w-2xl">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
