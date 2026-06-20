"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/site/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<AuthShell eyebrow="(Members)"><div /></AuthShell>}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    errorParam ? t.auth.errorInvalid : null,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(t.auth.errorInvalid);
      setLoading(false);
      return;
    }

    if (!res?.ok) {
      setError(t.auth.errorGeneric);
      setLoading(false);
      return;
    }

    toast.success(t.dashboard.welcome);

    // Fetch the session to determine role, then redirect accordingly.
    try {
      const r = await fetch("/api/auth/session");
      const session = await r.json();
      const role = session?.user?.role;
      router.push(role === "ADMIN" ? "/admin" : callbackUrl);
      router.refresh();
    } catch {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <AuthShell eyebrow={t.auth.membersEyebrow}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-display text-3xl md:text-4xl font-medium tracking-tight">
            {t.auth.loginTitle}
          </h2>
          <p className="mt-3 text-sm text-white/50 leading-relaxed">
            {t.auth.loginBody}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-mono-label text-white/50">
              {t.auth.email}
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              className="h-12 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 text-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-mono-label text-white/50">
                {t.auth.password}
              </Label>
              <Link
                href="#"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {t.auth.forgot}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 text-base"
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-lg border border-white/10 bg-white/[0.02]"
            >
              <AlertCircle className="h-4 w-4 text-white/70 shrink-0 mt-0.5" />
              <p className="text-sm text-white/70">{error}</p>
            </motion.div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="group w-full h-12 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.auth.signingIn}
              </>
            ) : (
              <>
                {t.auth.signIn}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl-flip" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-white/50">
          {t.auth.newToCGLAB}{" "}
          <Link
            href="/signup"
            className="text-white underline underline-offset-4 hover:text-white"
          >
            {t.auth.startProject}
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  );
}
