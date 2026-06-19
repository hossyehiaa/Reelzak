"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Calendar as CalIcon, Plus, X, Link2, UploadCloud, ImageIcon, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StepIndicator } from "./step-indicator";
import { BRIEF_OBJECTIVES, BRIEF_STYLES } from "@/lib/orders";
import { PRICING_PACKAGES, BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface BriefState {
  brandName: string;
  industry: string;
  objective: "" | "AWARENESS" | "SALES" | "EDUCATIONAL";
  style: string;
  targetAudience: string;
  keyMessage: string;
  referenceLinks: string[];
  additionalNotes: string;
  deadline: Date | undefined;
  // Payment (Task 3)
  paymentPackage: "" | "single" | "monthly-4" | "monthly-10";
  paymentReceiptUrl: string; // base64 data URL
  paymentReceiptName: string;
}

const INITIAL: BriefState = {
  brandName: "",
  industry: "",
  objective: "",
  style: "",
  targetAudience: "",
  keyMessage: "",
  referenceLinks: [],
  additionalNotes: "",
  deadline: undefined,
  paymentPackage: "",
  paymentReceiptUrl: "",
  paymentReceiptName: "",
};

// Step labels are now built inside the component from the translation dictionary.
const STEP_KEYS = [
  { num: 1, key: "brand" },
  { num: 2, key: "objective" },
  { num: 3, key: "style" },
  { num: 4, key: "message" },
  { num: 5, key: "references" },
  { num: 6, key: "schedule" },
  { num: 7, key: "payment" },
] as const;

// ---------------------------------------------------------------------------
// Per-step validation
// ---------------------------------------------------------------------------
function stepValid(step: number, s: BriefState): boolean {
  switch (step) {
    case 0:
      return s.brandName.trim().length >= 2 && s.industry.trim().length >= 2;
    case 1:
      return s.objective !== "";
    case 2:
      return s.style !== "";
    case 3:
      return (
        s.targetAudience.trim().length >= 4 && s.keyMessage.trim().length >= 4
      );
    case 4:
      return true; // optional
    case 5:
      return true; // deadline optional
    case 6:
      // Payment step — must select a package AND upload a receipt
      return s.paymentPackage !== "" && s.paymentReceiptUrl.startsWith("data:image/");
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function BriefingForm() {
  const router = useRouter();
  const { t } = useI18n();
  // Build the steps array from the translation dictionary
  const STEPS = [
    { num: 1, label: t.briefing.step1Title.split(" ")[0] }, // "Brand" / "العلامة"
    { num: 2, label: t.objectives.AWARENESS.label }, // "Awareness" / "وعي" — shortened
    { num: 3, label: t.admin.styleLabel }, // "Style" / "الأسلوب"
    { num: 4, label: t.admin.keyMessage.split(" ")[0] }, // "Key" / "الرسالة"
    { num: 5, label: t.admin.references }, // "References" / "المراجع"
    { num: 6, label: t.briefing.summaryTarget }, // "Target" / "الموعد"
    { num: 7, label: t.admin.payment }, // "Payment" / "الدفع"
  ];
  const [step, setStep] = React.useState(0);
  const [state, setState] = React.useState<BriefState>(INITIAL);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [submitting, setSubmitting] = React.useState(false);
  const completed = React.useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < step; i++) if (stepValid(i, state)) set.add(i);
    return set;
  }, [step, state]);

  const canAdvance = stepValid(step, state);

  function update<K extends keyof BriefState>(key: K, value: BriefState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (!canAdvance) return;
    setDirection(1);
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function back() {
    if (step === 0) return;
    setDirection(-1);
    setStep(step - 1);
  }

  async function submit() {
    if (!stepValid(STEPS.length - 1, state)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: state.brandName,
          industry: state.industry,
          objective: state.objective,
          style: state.style,
          targetAudience: state.targetAudience,
          keyMessage: state.keyMessage,
          referenceLinks: state.referenceLinks,
          additionalNotes: state.additionalNotes,
          deadline: state.deadline?.toISOString(),
          paymentPackage: state.paymentPackage,
          paymentReceiptUrl: state.paymentReceiptUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? t.briefing.toastError);
        setSubmitting(false);
        return;
      }
      toast.success(t.briefing.toastSuccess);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error(t.briefing.toastNetworkError);
      setSubmitting(false);
    }
  }

  // Per-step slide variants — the heart of the "flawless" feel
  const variants = {
    enter: (dir: 1 | -1) => ({
      opacity: 0,
      x: dir === 1 ? 60 : -60,
      filter: "blur(6px)",
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
    },
    exit: (dir: 1 | -1) => ({
      opacity: 0,
      x: dir === 1 ? -60 : 60,
      filter: "blur(6px)",
    }),
  };

  return (
    <div className="space-y-10">
      {/* ===================== STEP INDICATOR ===================== */}
      <StepIndicator steps={STEPS} current={step} completed={completed} />

      {/* ===================== FORM CARD ===================== */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.015] backdrop-blur-xl p-6 md:p-10 min-h-[460px] flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.35 },
              filter: { duration: 0.4 },
            }}
            className="flex-1"
          >
            {/* ---------- STEP 1: BRAND & INDUSTRY ---------- */}
            {step === 0 && (
              <StepShell
                num={t.briefing.step1Num}
                title={t.briefing.step1Title}
                subtitle={t.briefing.step1Subtitle}
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label={t.briefing.brandName} required>
                    <Input
                      autoFocus
                      value={state.brandName}
                      onChange={(e) => update("brandName", e.target.value)}
                      placeholder={t.briefing.brandNamePlaceholder}
                      className="h-12 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25"
                    />
                  </Field>
                  <Field label={t.briefing.industry} required>
                    <Input
                      value={state.industry}
                      onChange={(e) => update("industry", e.target.value)}
                      placeholder={t.briefing.industryPlaceholder}
                      className="h-12 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25"
                    />
                  </Field>
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 2: OBJECTIVE ---------- */}
            {step === 1 && (
              <StepShell
                num={t.briefing.step2Num}
                title={t.briefing.step2Title}
                subtitle={t.briefing.step2Subtitle}
              >
                <div className="grid sm:grid-cols-3 gap-3">
                  {BRIEF_OBJECTIVES.map((obj) => {
                    const active = state.objective === obj.value;
                    return (
                      <button
                        key={obj.value}
                        type="button"
                        onClick={() => update("objective", obj.value as BriefState["objective"])}
                        className={`text-left rounded-xl p-5 border transition-all duration-300 ${
                          active
                            ? "border-white/40 bg-white/[0.06]"
                            : "border-white/10 bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display text-lg font-medium tracking-tight">
                            {t.objectives[obj.value as keyof typeof t.objectives].label}
                          </span>
                          <span
                            className={`h-4 w-4 rounded-full border transition-all duration-300 ${
                              active
                                ? "bg-white border-white"
                                : "border-white/25"
                            }`}
                          >
                            {active && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="block h-full w-full rounded-full bg-black scale-[0.4]"
                              />
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          {t.objectives[obj.value as keyof typeof t.objectives].desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 3: STYLE ---------- */}
            {step === 2 && (
              <StepShell
                num={t.briefing.step3Num}
                title={t.briefing.step3Title}
                subtitle={t.briefing.step3Subtitle}
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BRIEF_STYLES.map((s) => {
                    const active = state.style === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => update("style", s.value)}
                        className={`text-left rounded-xl p-5 border transition-all duration-300 group ${
                          active
                            ? "border-white/40 bg-white/[0.06]"
                            : "border-white/10 bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display text-base font-medium tracking-tight">
                            {t.styles[s.value as keyof typeof t.styles].label}
                          </span>
                          <span
                            className={`h-4 w-4 rounded-full border transition-all duration-300 ${
                              active ? "bg-white border-white" : "border-white/25"
                            }`}
                          >
                            {active && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="block h-full w-full rounded-full bg-black scale-[0.4]"
                              />
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          {t.styles[s.value as keyof typeof t.styles].desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 4: AUDIENCE & MESSAGE ---------- */}
            {step === 3 && (
              <StepShell
                num={t.briefing.step4Num}
                title={t.briefing.step4Title}
                subtitle={t.briefing.step4Subtitle}
              >
                <div className="space-y-5">
                  <Field label="Target audience" required>
                    <Textarea
                      value={state.targetAudience}
                      onChange={(e) => update("targetAudience", e.target.value)}
                      placeholder="e.g. Affluent women 28-45 in urban centers who follow slow-fashion creators on Instagram."
                      className="min-h-[88px] bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 resize-none"
                    />
                    <CharCounter value={state.targetAudience} max={500} />
                  </Field>
                  <Field label="Key message" required>
                    <Textarea
                      value={state.keyMessage}
                      onChange={(e) => update("keyMessage", e.target.value)}
                      placeholder="e.g. Slow luxury — every stitch tells a story."
                      className="min-h-[88px] bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 resize-none"
                    />
                    <CharCounter value={state.keyMessage} max={500} />
                  </Field>
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 5: REFERENCES ---------- */}
            {step === 4 && (
              <StepShell
                num={t.briefing.step5Num}
                title={t.briefing.step5Title}
                subtitle={t.briefing.step5Subtitle}
              >
                <div className="space-y-3">
                  {state.referenceLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                          value={link}
                          onChange={(e) => {
                            const next = [...state.referenceLinks];
                            next[i] = e.target.value;
                            update("referenceLinks", next);
                          }}
                          placeholder="https://instagram.com/reel/..."
                          className="h-11 pl-10 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "referenceLinks",
                            state.referenceLinks.filter((_, idx) => idx !== i),
                          )
                        }
                        className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all duration-300"
                        aria-label="Remove link"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {state.referenceLinks.length < 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        update("referenceLinks", [...state.referenceLinks, ""])
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white border border-dashed border-white/15 hover:border-white/30 rounded-full transition-all duration-300"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add reference
                    </button>
                  )}

                  <Field label="Anything else? (optional)" className="pt-4">
                    <Textarea
                      value={state.additionalNotes}
                      onChange={(e) => update("additionalNotes", e.target.value)}
                      placeholder="Tone, must-haves, brand colors to avoid, music preferences, voiceover direction..."
                      className="min-h-[88px] bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 resize-none"
                    />
                    <CharCounter value={state.additionalNotes} max={2000} />
                  </Field>
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 6: DEADLINE ---------- */}
            {step === 5 && (
              <StepShell
                num={t.briefing.step6Num}
                title={t.briefing.step6Title}
                subtitle={t.briefing.step6Subtitle}
              >
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div className="flex justify-center md:justify-start">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-full h-12 px-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/25 transition-all duration-300 text-left"
                        >
                          <CalIcon className="h-4 w-4 text-white/50" />
                          {state.deadline ? (
                            <span className="text-sm text-white/90">
                              {format(state.deadline, "EEEE, MMM d, yyyy")}
                            </span>
                          ) : (
                            <span className="text-sm text-white/40">
                              Pick a delivery date
                            </span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-popover/95 backdrop-blur-2xl border-white/10"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={state.deadline}
                          onSelect={(d) => update("deadline", d)}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="bg-transparent text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Summary card */}
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3">
                    <p className="text-mono-label text-white/45">Order summary</p>
                    <div className="space-y-2 text-sm">
                      <Row k="Brand" v={state.brandName || "—"} />
                      <Row k="Industry" v={state.industry || "—"} />
                      <Row
                        k="Objective"
                        v={
                          BRIEF_OBJECTIVES.find((o) => o.value === state.objective)
                            ?.label || "—"
                        }
                      />
                      <Row
                        k="Style"
                        v={
                          BRIEF_STYLES.find((s) => s.value === state.style)?.label ||
                          "—"
                        }
                      />
                      <Row
                        k="References"
                        v={`${state.referenceLinks.filter(Boolean).length} link(s)`}
                      />
                      <Row
                        k="Target"
                        v={
                          state.deadline
                            ? format(state.deadline, "MMM d, yyyy")
                            : "No deadline"
                        }
                      />
                    </div>
                    <p className="text-xs text-white/40 pt-2 border-t border-white/[0.06]">
                      Standard turnaround is 5 business days. Monthly plans
                      ship in 3. Studio tier ships in 48 hours.
                    </p>
                  </div>
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 7: PAYMENT ---------- */}
            {step === 6 && (
              <StepShell
                num={t.briefing.step7Num}
                title={t.briefing.step7Title}
                subtitle={t.briefing.step7Subtitle}
              >
                <div className="space-y-6">
                  {/* Package selection */}
                  <div>
                    <p className="text-mono-label text-white/45 mb-3">
                      Select package
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {PRICING_PACKAGES.map((pkg) => {
                        const active = state.paymentPackage === pkg.slug;
                        return (
                          <button
                            key={pkg.slug}
                            type="button"
                            onClick={() => update("paymentPackage", pkg.slug as BriefState["paymentPackage"])}
                            className={`text-left rounded-xl p-4 border transition-all duration-300 relative ${
                              active
                                ? "border-white/40 bg-white/[0.06]"
                                : "border-white/10 bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03]"
                            }`}
                          >
                            {pkg.popular && (
                              <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-white text-black text-[9px] tracking-wider uppercase font-medium">
                                Popular
                              </span>
                            )}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-display text-sm font-medium tracking-tight">
                                {pkg.name}
                              </span>
                              <span
                                className={`h-3.5 w-3.5 rounded-full border transition-all duration-300 ${
                                  active ? "bg-white border-white" : "border-white/25"
                                }`}
                              >
                                {active && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="block h-full w-full rounded-full bg-black scale-[0.4]"
                                  />
                                )}
                              </span>
                            </div>
                            <p className="text-display text-xl font-medium tracking-tight">
                              {pkg.priceEgp.toLocaleString("en-US")}
                              <span className="text-xs text-white/55 ml-1">EGP</span>
                            </p>
                            <p className="text-[10px] text-white/40 mt-0.5">
                              ≈ ${pkg.priceUsd.toFixed(2)} · {pkg.reelCount} {pkg.reelCount === 1 ? "reel" : "reels"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* InstaPay instructions */}
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3">
                    <p className="text-mono-label text-white/45">
                      Payment instructions
                    </p>
                    <ol className="space-y-2.5 text-sm text-white/70 leading-relaxed">
                      <li className="flex gap-3">
                        <span className="font-mono text-white/40 shrink-0">01.</span>
                        <span>
                          Open <span className="text-white/90 font-medium">InstaPay</span> and send{" "}
                          <span className="text-white font-medium">
                            {state.paymentPackage
                              ? `${PRICING_PACKAGES.find((p) => p.slug === state.paymentPackage)?.priceEgp.toLocaleString("en-US")} EGP`
                              : "the package amount"}
                          </span>{" "}
                          to:
                        </span>
                      </li>
                      <li className="flex gap-3 pl-6">
                        <div className="flex-1 rounded-lg border border-white/10 bg-black/30 px-4 py-3 font-mono text-base text-white tracking-wide">
                          {BRAND.instapayHandle}
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-mono text-white/40 shrink-0">02.</span>
                        <span>Recipient name: <span className="text-white/90">{BRAND.instapayName}</span></span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-mono text-white/40 shrink-0">03.</span>
                        <span>Take a screenshot of the confirmation page (with the transaction ID and date visible).</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-mono text-white/40 shrink-0">04.</span>
                        <span>Upload the screenshot below. Our team verifies payments within 24 hours.</span>
                      </li>
                    </ol>
                  </div>

                  {/* Receipt dropzone */}
                  <div>
                    <p className="text-mono-label text-white/45 mb-3">
                      Upload receipt
                    </p>
                    <ReceiptDropzone
                      value={state.paymentReceiptUrl}
                      fileName={state.paymentReceiptName}
                      onChange={(url, name) => {
                        update("paymentReceiptUrl", url);
                        update("paymentReceiptName", name);
                      }}
                    />
                  </div>
                </div>
              </StepShell>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===================== NAV BUTTONS ===================== */}
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={step === 0 || submitting}
          className="h-11 px-5 rounded-full text-white/60 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 rtl-flip" />
          {t.briefing.back}
        </Button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs text-white/40 font-mono">
            {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={next}
              disabled={!canAdvance}
              className="group h-11 px-6 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t.briefing.continue}
              <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-0.5 rtl-flip" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="group h-11 px-6 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  {t.briefing.submitting}
                </>
              ) : (
                <>
                  {t.briefing.submit}
                  <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-0.5 rtl-flip" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function StepShell({
  num,
  title,
  subtitle,
  children,
}: {
  num: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-7">
      <div>
        <p className="text-mono-label text-white/40 mb-3">{t.admin.step} {num}</p>
        <h2 className="text-display text-2xl md:text-3xl font-medium tracking-tight leading-[1.15]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-white/50 leading-relaxed max-w-lg">
          {subtitle}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label className="text-mono-label text-white/55">
        {label}
        {required && <span className="text-white/40 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

function CharCounter({ value, max }: { value: string; max: number }) {
  return (
    <div className="flex justify-end">
      <span className="text-[10px] text-white/35 font-mono">
        {value.length}/{max}
      </span>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-white/45">{k}</span>
      <span className="text-white/85 text-right truncate max-w-[60%]">{v}</span>
    </div>
  );
}

// ===========================================================================
// ReceiptDropzone — premium monochromatic drag-and-drop image uploader
// ===========================================================================
// Compresses the image client-side to ~150KB max (800px wide, JPEG q80) and
// returns a base64 data URL. No external storage needed — the data URL gets
// stored directly in the Order.paymentReceiptUrl column.
// ===========================================================================
function ReceiptDropzone({
  value,
  fileName,
  onChange,
}: {
  value: string;
  fileName: string;
  onChange: (dataUrl: string, fileName: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Image compression: load the file into an <img>, draw onto a canvas at
  // max 800px wide, export as JPEG q80. Returns a data URL.
  // -----------------------------------------------------------------------
  async function processFile(file: File): Promise<{ dataUrl: string; name: string }> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file (PNG, JPG, or screenshot).");
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Image too large. Max 10MB before compression.");
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read file."));
      reader.readAsDataURL(file);
    });

    // Load into an Image to compress
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not load image."));
      i.src = dataUrl;
    });

    // Scale to max 800px wide, preserve aspect ratio
    const MAX_W = 800;
    const scale = Math.min(1, MAX_W / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context.");
    ctx.drawImage(img, 0, 0, w, h);

    // Export as JPEG q80 (handles screenshots well, ~100-200KB)
    const compressed = canvas.toDataURL("image/jpeg", 0.8);
    return { dataUrl: compressed, name: file.name };
  }

  async function handleFile(file: File) {
    setError(null);
    setProcessing(true);
    try {
      const { dataUrl, name } = await processFile(file);
      onChange(dataUrl, name);
    } catch (err: any) {
      setError(err?.message ?? "Could not process image.");
    } finally {
      setProcessing(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  // If a receipt is already uploaded, show the preview
  if (value && !processing) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-xl border border-white/[0.12] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-3 p-3 border-b border-white/[0.06]">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <Check className="h-4 w-4 text-white/80" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/90 truncate">
                {fileName || "receipt.jpg"}
              </p>
              <p className="text-[11px] text-white/40">
                Receipt attached · click to view full size
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange("", "")}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-xs text-white/60 hover:text-white hover:border-white/30 transition-all duration-300"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
          {/* Thumbnail preview */}
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative aspect-[16/9] bg-black/40 group"
          >
            {/* Receipt preview */}
            <img
              src={value}
              alt="Payment receipt preview"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs text-white/90 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
                Click to view full size
              </span>
            </div>
          </a>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs text-white/50 hover:text-white transition-colors"
        >
          Replace with a different image
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onInputChange}
          className="hidden"
        />
      </div>
    );
  }

  // Dropzone state (empty or processing)
  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!processing) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !processing && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
          dragging
            ? "border-white/50 bg-white/[0.06] scale-[1.01]"
            : "border-white/[0.12] bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.03]"
        } ${processing ? "pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onInputChange}
          className="hidden"
        />

        {processing ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
            <p className="text-sm text-white/60">Processing image…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={dragging ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-11 w-11 rounded-full border border-white/20 bg-white/[0.03] flex items-center justify-center"
            >
              <UploadCloud className="h-5 w-5 text-white/70" />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-white/85">
                {dragging ? "Drop to upload" : "Drop receipt screenshot here"}
              </p>
              <p className="text-xs text-white/45 mt-1">
                or click to browse · PNG, JPG · auto-compressed
              </p>
            </div>
          </div>
        )}

        {/* Decorative grid while dragging */}
        <AnimatePresence>
          {dragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-white/70"
        >
          {error}
        </motion.p>
      )}
    </>
  );
}
