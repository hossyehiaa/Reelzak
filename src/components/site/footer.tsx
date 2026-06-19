"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { Logo } from "@/components/site/logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  const COLS = [
    {
      title: t.footer.colProduct,
      links: [
        { label: t.nav.process, href: "#process" },
        { label: t.nav.pricing, href: "#pricing" },
        { label: t.hero.ctaSecondary, href: "#showreel" },
        { label: t.nav.faq, href: "#faq" },
      ],
    },
    {
      title: t.footer.colAccount,
      links: [
        { label: t.nav.signIn, href: "/login" },
        { label: t.nav.startProject, href: "/signup" },
        { label: t.footer.clientPortal, href: "/dashboard" },
      ],
    },
    {
      title: t.footer.colStudio,
      links: [
        { label: "hello@cglab.studio", href: "mailto:hello@cglab.studio" },
        { label: "Twitter / X", href: BRAND.social.twitter, external: true },
        { label: "Instagram", href: BRAND.social.instagram, external: true },
        { label: "YouTube", href: BRAND.social.youtube, external: true },
      ],
    },
  ];

  return (
    <footer className="relative mt-auto border-t border-white/[0.08]">
      {/* CTA band */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-mono-label text-white/40 mb-4">
              {t.footer.readyLabel}
            </p>
            <h3 className="text-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight font-medium max-w-2xl">
              {t.footer.title1}
              <br />
              <span className="text-serif-italic text-white/55">
                {t.footer.title2}
              </span>
            </h3>
          </div>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-7 py-4 text-base font-medium rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft"
          >
            {t.footer.cta}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl-flip" />
          </Link>
        </motion.div>
      </div>

      <div className="hairline" />

      {/* Footer columns */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo height={36} dim />
            </div>
            <p className="text-sm text-white/45 leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          {/* Link cols */}
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-mono-label text-white/40 mb-5">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link: any) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/65 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="hairline mt-16 mb-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} {BRAND.name} Studio. {t.footer.rights}
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white/70 transition-colors">
              {t.footer.privacy}
            </Link>
            <Link href="#" className="hover:text-white/70 transition-colors">
              {t.footer.terms}
            </Link>
            <span className="font-mono">v.01 / 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
