"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Check,
  MessageSquare,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUS_META, type Order } from "@/types/domain";
import { format, parseISO, isValid } from "date-fns";

interface ReviewSectionProps {
  order: Order;
  /** Optional callback after a successful action (in addition to router.refresh) */
  onMutated?: () => void;
}

/**
 * ReviewSection — shown on the client dashboard when an order is
 * READY_FOR_REVIEW. Renders:
 *   - A premium glass card with the order's first-cut delivery link
 *   - "Approve" and "Request Revision" buttons
 *   - An expandable revision feedback textarea (with smooth animation)
 *
 * On "Approve": POSTs to /api/orders/[id]/review with action=APPROVE.
 *   → Sets clientApprovedAt. Admin can then move to DELIVERED.
 *
 * On "Request Revision": POSTs with action=REQUEST_REVISION + notes.
 *   → Moves status back to EDITING + stores the feedback for the admin.
 */
export function ReviewSection({ order, onMutated }: ReviewSectionProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"idle" | "approving" | "revision" | "submitting">("idle");
  const [revisionNotes, setRevisionNotes] = React.useState("");

  const meta = ORDER_STATUS_META[order.status];
  const fmtDate = (d: string | null) => {
    if (!d) return "—";
    const date = parseISO(d);
    return isValid(date) ? format(date, "MMM d, yyyy · h:mm a") : "—";
  };

  // If the client already approved, show a thank-you state
  if (order.clientApprovedAt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.12] glass-strong p-6 md:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center">
            <Check className="h-5 w-5 text-white/90" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl font-medium tracking-tight mb-1">
              You approved the cut
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Thank you. Our team has been notified. The final reel will be
              delivered shortly.
            </p>
            <p className="text-xs text-white/35 mt-3 font-mono">
              Approved on {fmtDate(order.clientApprovedAt)}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  async function submitReview(action: "APPROVE" | "REQUEST_REVISION") {
    setMode("submitting");
    try {
      const body: { action: string; notes?: string } = { action };
      if (action === "REQUEST_REVISION") {
        body.notes = revisionNotes.trim();
      }

      const res = await fetch(`/api/orders/${order.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Could not submit review");
        setMode(action === "APPROVE" ? "idle" : "revision");
        return;
      }

      if (action === "APPROVE") {
        toast.success("Cut approved. Our team will deliver the final reel shortly.");
      } else {
        toast.success("Revision request sent. Our team is back on it.");
      }
      router.refresh();
      onMutated?.();
    } catch {
      toast.error("Network error. Please try again.");
      setMode(action === "APPROVE" ? "idle" : "revision");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/[0.12] glass-strong p-6 md:p-8"
    >
      {/* ===================== HEADER ===================== */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-mono-label text-white/45 mb-2">
            Ready for your review
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-medium tracking-tight leading-tight">
            Your first cut is{" "}
            <span className="text-serif-italic text-white/70">ready.</span>
          </h3>
          <p className="mt-2 text-sm text-white/50 leading-relaxed max-w-md">
            Watch the cut below. If you're happy, approve it and we'll deliver
            the final file. Need changes? Request a revision with specific
            feedback.
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${meta.color}`}
        >
          <span className={`h-2 w-2 rounded-full ${meta.dot} pulse-soft`} />
          {meta.label}
        </span>
      </div>

      {/* ===================== DELIVERY LINK CARD ===================== */}
      {order.deliveryFileUrl && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] mb-6">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <Eye className="h-5 w-5 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/90 truncate">
              {order.deliveryFileName ?? "First cut preview"}
            </p>
            <p className="text-xs text-white/40 truncate">
              {order.deliveryFileUrl}
            </p>
          </div>
          <a
            href={order.deliveryFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 transition-all duration-300"
          >
            <Download className="h-3.5 w-3.5" />
            Watch
          </a>
        </div>
      )}

      {/* ===================== ACTION BUTTONS ===================== */}
      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              onClick={() => submitReview("APPROVE")}
              disabled={mode !== "idle"}
              className="group flex-1 h-12 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft"
            >
              <Check className="h-4 w-4" />
              Approve this cut
            </Button>
            <Button
              onClick={() => setMode("revision")}
              disabled={mode !== "idle"}
              variant="outline"
              className="flex-1 h-12 rounded-full border-white/15 text-white/80 hover:text-white hover:border-white/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4" />
              Request revision
            </Button>
          </motion.div>
        )}

        {mode === "revision" && (
          <motion.div
            key="revision"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-mono-label text-white/55">
                Your revision feedback
              </label>
              <Textarea
                autoFocus
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Tell us what needs to change. Be specific — reference timestamps, shots, music cues, text overlays, etc.&#10;&#10;e.g. '0:03 — the transition feels too fast, slow it down. 0:08 — can we try a different font for the headline? The overall color grade is great but feels slightly too warm.'"
                className="min-h-[140px] bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 resize-none text-sm leading-relaxed"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-white/40">
                  {revisionNotes.trim().length < 4
                    ? "At least 4 characters required"
                    : `${revisionNotes.trim().length} characters`}
                </p>
                <span className="text-[10px] text-white/35 font-mono">
                  {revisionNotes.length}/2000
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setMode("idle")}
                disabled={mode === "submitting"}
                variant="ghost"
                className="h-11 px-5 rounded-full text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <Button
                onClick={() => submitReview("REQUEST_REVISION")}
                disabled={
                  mode === "submitting" || revisionNotes.trim().length < 4
                }
                className="group flex-1 h-11 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {mode === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send revision request
                    <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {mode === "submitting" && (
          <motion.div
            key="submitting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-4"
          >
            <Loader2 className="h-5 w-5 animate-spin text-white/60" />
            <span className="ml-3 text-sm text-white/60">
              {revisionNotes ? "Sending revision request…" : "Submitting approval…"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== FOOTER NOTE ===================== */}
      {mode === "idle" && (
        <p className="mt-4 text-xs text-white/35 leading-relaxed">
          Approving moves the order to final delivery. Requesting a revision
          sends it back to our editing team with your feedback.
        </p>
      )}
    </motion.div>
  );
}
