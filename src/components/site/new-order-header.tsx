"use client";

import { useI18n } from "@/lib/i18n";

export function NewOrderHeader() {
  const { t } = useI18n();
  return (
    <section className="mb-10 md:mb-14">
      <p className="text-mono-label text-white/40 mb-4">
        {t.admin.allBriefsLabel.replace("(03) — ", "")}
      </p>
      <h1 className="text-display text-4xl md:text-5xl tracking-tight font-medium leading-[1.05]">
        {t.briefing.title}{" "}
        <span className="text-serif-italic text-white/70">{t.briefing.titleAccent}</span>
      </h1>
      <p className="mt-3 max-w-xl text-base text-white/50 leading-relaxed">
        {t.briefing.body}
      </p>
    </section>
  );
}
