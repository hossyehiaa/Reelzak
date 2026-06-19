"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function Manifesto() {
  const { t } = useI18n();
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
            {t.manifesto.label}
          </p>
          <h2 className="text-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight font-medium text-white/90">
            {t.manifesto.body1}{" "}
            <span className="text-serif-italic text-white/55">{t.manifesto.body1Accent}</span>
            {t.manifesto.body2}{" "}
            <span className="text-serif-italic text-white/55">{t.manifesto.body2Accent}</span>
            {t.manifesto.body3}
          </h2>

          <div className="hairline mt-20" />

          <div className="mt-12 grid md:grid-cols-3 gap-12 md:gap-16">
            {[
              { k: t.manifesto.principle1Title, v: t.manifesto.principle1Body },
              { k: t.manifesto.principle2Title, v: t.manifesto.principle2Body },
              { k: t.manifesto.principle3Title, v: t.manifesto.principle3Body },
            ].map((item, i) => (
              <motion.div
                key={i}
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
