"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, ChevronDown, Plus, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { useI18n } from "@/lib/i18n";

interface DashboardShellProps {
  children: React.ReactNode;
  /** Label shown in the top-left under the brand mark, e.g. "Client Portal" or "Admin". */
  areaLabel: string;
  /** Show the "Back to dashboard" link in the top bar (used on sub-pages like /new-order). */
  backHref?: string;
  /** Optional primary action shown on the right (e.g. New Order button). */
  primaryAction?: {
    href: string;
    label: string;
  };
}

export function DashboardShell({
  children,
  areaLabel,
  backHref,
  primaryAction,
}: DashboardShellProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close the user menu on outside click
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const userName = session?.user?.name || session?.user?.email || "Account";
  const initials = userName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      {/* ====================== TOP BAR ====================== */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-background/70 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          {/* Left — brand + area label */}
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center" aria-label="CGLAB home">
              <Logo height={40} className="transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <span className="hidden md:block h-5 w-px bg-white/10" />
            <span className="hidden md:block text-mono-label text-white/45">
              {areaLabel}
            </span>
          </div>

          {/* Right — back link / primary CTA / user menu */}
          <div className="flex items-center gap-3">
            {backHref && (
              <Link
                href={backHref}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            )}

            {primaryAction && (
              <Link
                href={primaryAction.href}
                className="group inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft"
              >
                <Plus className="h-3.5 w-3.5" />
                {primaryAction.label}
              </Link>
            )}

            {/* User menu */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/[0.04] transition-all duration-300"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/15 text-xs font-medium tracking-wide">
                  {initials || <User className="h-4 w-4" />}
                </span>
                <span className="hidden sm:block text-sm text-white/80 max-w-[120px] truncate">
                  {userName.split(" ")[0]}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-white/50 transition-transform duration-300 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-xl border border-white/10 bg-popover/95 backdrop-blur-2xl p-2 shadow-2xl"
                  >
                    <div className="px-3 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-white truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-white/45 truncate mt-0.5">
                        {session?.user?.email}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] tracking-wider uppercase text-white/55">
                        {session?.user?.role}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="w-full mt-1 flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t.shell.signOut}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ====================== CONTENT ====================== */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 lg:px-10 py-10 md:py-16">
        {children}
      </main>

      {/* ====================== FOOTER ====================== */}
      <footer className="mt-auto border-t border-white/[0.06] py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {new Date().getFullYear()} CGLAB Studio</span>
          <span className="font-mono">v.01 / 2026</span>
        </div>
      </footer>
    </div>
  );
}
