"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  Loader2,
  ExternalLink,
  FileVideo,
  Check,
  ChevronRight,
  Link2,
  Calendar,
  User,
  Building2,
  Target,
  Palette,
  MessageSquare,
  Clock,
  Download,
  Save,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  type OrderStatus,
  type PaymentStatus,
} from "@/types/domain";
import { PRICING_PACKAGES } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { format, parseISO, isValid } from "date-fns";

interface AdminOrder {
  id: string;
  orderNumber: string;
  brandName: string;
  industry: string | null;
  briefDetails: string;
  status: OrderStatus;
  deadline: string | null;
  deliveryFileUrl: string | null;
  deliveryFileName: string | null;
  // Payment fields (Task 3)
  paymentPackage: string | null;
  paymentReceiptUrl: string | null;
  paymentStatus: PaymentStatus;
  paymentVerifiedAt: string | null;
  // Revision fields (Task 4)
  clientApprovedAt: string | null;
  clientRevisionNotes: string | null;
  clientRevisionRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string | null;
    email: string;
    brandName: string | null;
  };
}

interface OrderDetailDrawerProps {
  order: AdminOrder;
  onClose: () => void;
  onMutated: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseBrief(raw: string): Record<string, any> | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  const date = parseISO(d);
  if (!isValid(date)) return "—";
  return format(date, "MMM d, yyyy · h:mm a");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function OrderDetailDrawer({
  order,
  onClose,
  onMutated,
}: OrderDetailDrawerProps) {
  const { t } = useI18n();
  const brief = parseBrief(order.briefDetails);
  const [updatingStatus, setUpdatingStatus] = React.useState<OrderStatus | null>(null);

  // Lock body scroll while the drawer is open
  React.useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Escape to close
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);
  const nextStatus = ORDER_STATUS_FLOW[currentIdx + 1] ?? null;
  const isDelivered = order.status === "DELIVERED";

  async function advanceTo(target: OrderStatus) {
    setUpdatingStatus(target);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Could not update status");
        return;
      }
      toast.success(`Status → ${ORDER_STATUS_META[target].label}`);
      onMutated();
    } catch {
      toast.error("Network error");
    } finally {
      setUpdatingStatus(null);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[560px] lg:w-[640px] bg-background border-l border-white/[0.08] flex flex-col"
      >
        {/* ===================== HEADER ===================== */}
        <div className="shrink-0 flex items-start justify-between p-6 border-b border-white/[0.06]">
          <div>
            <p className="font-mono text-xs text-white/45 tracking-wide mb-1.5">
              {order.orderNumber}
            </p>
            <h2 className="text-display text-2xl font-medium tracking-tight">
              {order.brandName}
            </h2>
            {order.industry && (
              <p className="text-xs text-white/45 mt-1">{order.industry}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all duration-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ===================== SCROLL BODY ===================== */}
        <div className="flex-1 overflow-y-auto scrollbar-cglab">
          {/* ---------- CURRENT STATUS + ADVANCE ---------- */}
          <section className="p-6 border-b border-white/[0.06]">
            <p className="text-mono-label text-white/40 mb-4">
              Current status
            </p>
            <div className="flex items-center justify-between gap-4 mb-5">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${ORDER_STATUS_META[order.status].color}`}
              >
                <span className={`h-2 w-2 rounded-full ${ORDER_STATUS_META[order.status].dot}`} />
                {ORDER_STATUS_META[order.status].label}
              </span>
              <span className="text-xs text-white/40">
                Step {currentIdx + 1} / {ORDER_STATUS_FLOW.length}
              </span>
            </div>

            {/* Pipeline visualization */}
            <div className="flex items-center gap-1 mb-6">
              {ORDER_STATUS_FLOW.map((s, i) => {
                const done = i < currentIdx;
                const current = i === currentIdx;
                return (
                  <React.Fragment key={s}>
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        done || current ? "bg-white/80" : "bg-white/[0.08]"
                      }`}
                    />
                  </React.Fragment>
                );
              })}
            </div>

            {/* Advance button */}
            {nextStatus ? (
              <Button
                onClick={() => advanceTo(nextStatus)}
                disabled={updatingStatus !== null}
                className="group w-full h-11 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft disabled:opacity-60"
              >
                {updatingStatus === nextStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    Advance to {ORDER_STATUS_META[nextStatus].label}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-white/60">
                <Check className="h-4 w-4" />
                Order delivered. Nothing left to do.
              </div>
            )}

            {/* Quick-set to any later status (skip ahead) */}
            {!isDelivered && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-white/40 self-center mr-1">
                  Skip to:
                </span>
                {ORDER_STATUS_FLOW.slice(currentIdx + 2).map((s) => (
                  <button
                    key={s}
                    onClick={() => advanceTo(s)}
                    disabled={updatingStatus !== null}
                    className="px-2.5 py-1 rounded-full text-[11px] border border-white/10 text-white/55 hover:text-white hover:border-white/30 transition-all duration-300 disabled:opacity-50"
                  >
                    {ORDER_STATUS_META[s].label}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ---------- BRIEF DETAILS ---------- */}
          <section className="p-6 border-b border-white/[0.06]">
            <p className="text-mono-label text-white/40 mb-4">Brief</p>
            <div className="space-y-4">
              <BriefRow icon={User} label="Client" value={order.client.name ?? order.client.email} />
              <BriefRow icon={Building2} label="Brand" value={order.brandName} />
              {order.industry && (
                <BriefRow icon={Building2} label="Industry" value={order.industry} />
              )}
              {brief?.objective && (
                <BriefRow
                  icon={Target}
                  label="Objective"
                  value={brief.objective.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                />
              )}
              {brief?.style && (
                <BriefRow icon={Palette} label="Style" value={brief.style.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} />
              )}
              {brief?.targetAudience && (
                <BriefRow icon={MessageSquare} label="Audience" value={brief.targetAudience} multiline />
              )}
              {brief?.keyMessage && (
                <BriefRow icon={MessageSquare} label="Key message" value={brief.keyMessage} multiline />
              )}
              {brief?.additionalNotes && (
                <BriefRow icon={MessageSquare} label="Notes" value={brief.additionalNotes} multiline />
              )}
              {brief?.referenceLinks?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-mono-label text-white/40">References</p>
                  <ul className="space-y-1.5">
                    {brief.referenceLinks.map((url: string, i: number) => (
                      <li key={i}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white break-all"
                        >
                          <Link2 className="h-3.5 w-3.5 shrink-0 text-white/40 group-hover:text-white" />
                          <span className="underline underline-offset-2 decoration-white/20">
                            {url}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <BriefRow
                icon={Calendar}
                label="Deadline"
                value={fmtDate(order.deadline)}
              />
              <BriefRow
                icon={Clock}
                label="Submitted"
                value={fmtDate(order.createdAt)}
              />
            </div>
          </section>

          {/* ---------- CLIENT REVISION (Task 4) ---------- */}
          {(order.clientRevisionNotes || order.clientApprovedAt) && (
            <RevisionSection order={order} onMutated={onMutated} />
          )}

          {/* ---------- PAYMENT (Task 3) ---------- */}
          {order.paymentReceiptUrl && (
            <PaymentSection order={order} onMutated={onMutated} />
          )}

          {/* ---------- DELIVERY FILE ---------- */}
          <section className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-mono-label text-white/40">{t.admin.deliveryFile}</p>
              {order.deliveryFileUrl && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/40 text-green-400 text-xs font-semibold tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  {t.admin.deliveryDone}
                </span>
              )}
            </div>
            {order.deliveryFileUrl ? (
              <div className="space-y-3">
                {/* Green confirmation banner */}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/[0.08]">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-400">
                      {t.admin.deliveryDone}
                    </p>
                    <p className="text-xs text-green-300/60 mt-0.5">
                      {order.deliveryFileName ?? "Final reel"}
                    </p>
                  </div>
                  <a
                    href={order.deliveryFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-green-500 text-black text-xs font-medium hover:bg-green-400 transition-all duration-300"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Open
                  </a>
                </div>
                {/* The link details (compact) */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.01]">
                  <Link2 className="h-3 w-3 text-white/30 shrink-0" />
                  <p className="text-xs text-white/35 truncate flex-1">
                    {order.deliveryFileUrl}
                  </p>
                </div>
                <DriveLinkInput
                  orderId={order.id}
                  existingUrl={order.deliveryFileUrl}
                  existingFileName={order.deliveryFileName}
                  onSaved={onMutated}
                />
              </div>
            ) : (
              <DriveLinkInput
                orderId={order.id}
                existingUrl={null}
                existingFileName={null}
                onSaved={onMutated}
              />
            )}
          </section>
        </div>
      </motion.aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Brief row
// ---------------------------------------------------------------------------
function BriefRow({
  icon: Icon,
  label,
  value,
  multiline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex items-start gap-3 flex-1">
        <Icon className="h-3.5 w-3.5 text-white/35 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] tracking-wider uppercase text-white/40 mb-0.5">
            {label}
          </p>
          <p
            className={`text-sm text-white/85 ${
              multiline ? "leading-relaxed whitespace-pre-wrap" : "truncate"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// DriveLinkInput — premium Google Drive link attacher
// ===========================================================================
// Instead of uploading the file to our own storage, the admin pastes a
// Google Drive (or any URL) share link. We PATCH it onto the order, which
// lets us mark it as Delivered.
//
// Why this approach:
//   - Zero storage cost (Drive is free up to 15GB)
//   - Admin can update / replace the file in Drive without redeploying
//   - Client downloads directly from Drive — no proxy bandwidth
//   - Works for Dropbox, WeTransfer, S3, anything with a URL
// ===========================================================================
function DriveLinkInput({
  orderId,
  existingUrl,
  existingFileName,
  onSaved,
}: {
  orderId: string;
  existingUrl: string | null;
  existingFileName: string | null;
  onSaved: () => void;
}) {
  const [url, setUrl] = React.useState(existingUrl ?? "");
  const [fileName, setFileName] = React.useState(existingFileName ?? "");
  const [saving, setSaving] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);

  // Sync local state if the order changes externally
  React.useEffect(() => {
    setUrl(existingUrl ?? "");
    setFileName(existingFileName ?? "");
  }, [existingUrl, existingFileName]);

  // Drive link validation — accept drive.google.com, dropbox, wetransfer,
  // or any URL that starts with http(s)://
  function isValidUrl(v: string): boolean {
    if (!v.trim()) return false;
    try {
      const u = new URL(v.trim());
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  // Try to extract a filename from a Drive URL (?usp=sharing&resourcekey=...
  // or /file/d/FILE_ID/view). Falls back to whatever the user typed.
  function guessFileName(urlStr: string): string {
    const trimmed = urlStr.trim();
    // Try /file/d/<id>/view pattern
    const driveMatch = trimmed.match(/\/file\/d\/([^/?#]+)/);
    if (driveMatch) {
      return `drive-${driveMatch[1].slice(0, 12)}.mp4`;
    }
    // Try generic /<filename>.mp4 pattern at end of URL
    const extMatch = trimmed.match(/\/([^/?#]+\.(mp4|mov|webm|m4v))(?:$|[?#])/i);
    if (extMatch) {
      return extMatch[1];
    }
    return existingFileName ?? "Final reel";
  }

  const canSave = isValidUrl(url) && !saving;
  const isDirty = url.trim() !== (existingUrl ?? "").trim();

  async function save() {
    if (!canSave || !isDirty) return;
    setSaving(true);
    try {
      const trimmedUrl = url.trim();
      const guessedName = fileName.trim() || guessFileName(trimmedUrl);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryFileUrl: trimmedUrl,
          deliveryFileName: guessedName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Could not save link");
        return;
      }
      toast.success(
        existingUrl ? "Delivery link updated." : "Link attached. You can now mark the order as Delivered.",
      );
      onSaved();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setRemoving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryFileUrl: "",
          deliveryFileName: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Could not remove link");
        return;
      }
      toast.success("Delivery link removed.");
      onSaved();
    } catch {
      toast.error("Network error");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.015] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-mono-label text-white/55">
          {existingUrl ? "Replace link" : "Attach delivery link"}
        </p>
        {existingUrl && (
          <button
            onClick={remove}
            disabled={removing}
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors disabled:opacity-50"
          >
            {removing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
            Remove
          </button>
        )}
      </div>

      {/* URL input */}
      <div className="space-y-2">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
          className="h-11 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 font-mono text-sm"
        />
        {url && !isValidUrl(url) && (
          <p className="text-xs text-white/60">
            Enter a valid URL starting with http:// or https://
          </p>
        )}
      </div>

      {/* Optional filename override */}
      <div className="space-y-2">
        <p className="text-[11px] tracking-wider uppercase text-white/40">
          Display name (optional)
        </p>
        <Input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder={guessFileName(url) || "final-reel.mp4"}
          className="h-10 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 text-sm"
        />
      </div>

      {/* Helper text */}
      <p className="text-xs text-white/40 leading-relaxed">
        Paste a Google Drive share link (or Dropbox, WeTransfer, any URL).
        Make sure the file is publicly viewable. The client will see this
        link in their portal and can download directly.
      </p>

      {/* Save button */}
      <Button
        onClick={save}
        disabled={!canSave || !isDirty}
        className="group w-full h-10 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        {saving ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Save className="h-3.5 w-3.5" />
            {existingUrl ? "Update link" : "Attach link"}
          </>
        )}
      </Button>
    </div>
  );
}

// ===========================================================================
// PaymentSection — admin view of the client's payment receipt + verify/reject
// ===========================================================================
function PaymentSection({
  order,
  onMutated,
}: {
  order: AdminOrder;
  onMutated: () => void;
}) {
  const [updating, setUpdating] = React.useState<"VERIFIED" | "REJECTED" | null>(null);
  const meta = PAYMENT_STATUS_META[order.paymentStatus];
  const pkg = PRICING_PACKAGES.find((p) => p.slug === order.paymentPackage);

  async function updatePaymentStatus(target: "VERIFIED" | "REJECTED") {
    setUpdating(target);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Could not update payment status");
        return;
      }
      toast.success(
        target === "VERIFIED"
          ? "Payment verified. Order is now confirmed."
          : "Payment rejected. Client will need to re-upload.",
      );
      onMutated();
    } catch {
      toast.error("Network error");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <section className="p-6 border-b border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-mono-label text-white/40">Payment</p>
        <span
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs ${meta.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      {/* Package + amount summary */}
      {pkg && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mono-label text-white/45 mb-1">Package</p>
              <p className="font-display text-base font-medium tracking-tight">
                {pkg.name}
              </p>
              <p className="text-xs text-white/45 mt-0.5">
                {pkg.reelCount} {pkg.reelCount === 1 ? "reel" : "reels"} · {pkg.cadence === "monthly" ? "monthly" : "one-time"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-display text-2xl font-medium tracking-tight">
                {pkg.priceEgp.toLocaleString("en-US")}
                <span className="text-sm text-white/55 ml-1">EGP</span>
              </p>
              <p className="text-[11px] text-white/40 mt-0.5">
                ≈ ${pkg.priceUsd.toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Receipt preview */}
      <div className="rounded-xl border border-white/[0.08] bg-black/40 overflow-hidden mb-4">
        <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
          <p className="text-xs text-white/55">Receipt screenshot</p>
          <a
            href={order.paymentReceiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open full size
          </a>
        </div>
        <a
          href={order.paymentReceiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-[16/10] bg-black group"
        >
          <img
            src={order.paymentReceiptUrl}
            alt="Payment receipt"
            className="absolute inset-0 w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs text-white/90 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
              Click to view full size
            </span>
          </div>
        </a>
      </div>

      {/* Verification timestamp (if verified) */}
      {order.paymentStatus === "VERIFIED" && order.paymentVerifiedAt && (
        <p className="text-xs text-white/45 mb-3">
          Verified on {fmtDate(order.paymentVerifiedAt)}
        </p>
      )}

      {/* Verify / Reject buttons — only show if PENDING */}
      {order.paymentStatus === "PENDING" && (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => updatePaymentStatus("VERIFIED")}
            disabled={updating !== null}
            className="group flex-1 h-10 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft disabled:opacity-60"
          >
            {updating === "VERIFIED" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Verify payment
              </>
            )}
          </Button>
          <Button
            onClick={() => updatePaymentStatus("REJECTED")}
            disabled={updating !== null}
            variant="outline"
            className="flex-1 h-10 rounded-full border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/[0.04] transition-all duration-300 disabled:opacity-60"
          >
            {updating === "REJECTED" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Rejecting…
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5" />
                Reject
              </>
            )}
          </Button>
        </div>
      )}

      {/* Re-verify option if already decided */}
      {order.paymentStatus !== "PENDING" && (
        <button
          onClick={() => updatePaymentStatus(order.paymentStatus === "VERIFIED" ? "REJECTED" : "VERIFIED")}
          disabled={updating !== null}
          className="text-xs text-white/50 hover:text-white transition-colors disabled:opacity-50"
        >
          {updating ? "Updating…" : `Mark as ${order.paymentStatus === "VERIFIED" ? "Rejected" : "Verified"} instead`}
        </button>
      )}
    </section>
  );
}

// ===========================================================================
// RevisionSection — admin view of client's revision feedback / approval
// ===========================================================================
function RevisionSection({
  order,
  onMutated,
}: {
  order: AdminOrder;
  onMutated: () => void;
}) {
  const [sendingBack, setSendingBack] = React.useState(false);

  // Scenario 1: Client approved the cut
  if (order.clientApprovedAt) {
    return (
      <section className="p-6 border-b border-white/[0.06]">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 shrink-0 rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center">
            <Check className="h-4 w-4 text-white/90" />
          </div>
          <div className="flex-1">
            <p className="text-mono-label text-white/45 mb-1">Client review</p>
            <h3 className="font-display text-base font-medium tracking-tight">
              Cut approved by client
            </h3>
            <p className="text-xs text-white/40 mt-1">
              Approved on {fmtDate(order.clientApprovedAt)}. You can now mark
              the order as Delivered.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Scenario 2: Client requested a revision with feedback
  async function sendBackToEditing() {
    setSendingBack(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "EDITING" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Could not update status");
        return;
      }
      toast.success("Order sent back to Editing.");
      onMutated();
    } catch {
      toast.error("Network error");
    } finally {
      setSendingBack(false);
    }
  }

  return (
    <section className="p-6 border-b border-white/[0.06]">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-10 w-10 shrink-0 rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-white/90" />
        </div>
        <div className="flex-1">
          <p className="text-mono-label text-white/45 mb-1">Client revision</p>
          <h3 className="font-display text-base font-medium tracking-tight">
            Revision requested
          </h3>
          {order.clientRevisionRequestedAt && (
            <p className="text-xs text-white/40 mt-1">
              Requested on {fmtDate(order.clientRevisionRequestedAt)}
            </p>
          )}
        </div>
      </div>

      {/* The revision notes — prominent, in a glass card */}
      <div className="rounded-xl border border-white/[0.12] bg-white/[0.03] p-4 mb-4">
        <p className="text-[11px] tracking-wider uppercase text-white/45 mb-2">
          Client feedback
        </p>
        <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
          {order.clientRevisionNotes}
        </p>
      </div>

      {/* Action: send back to editing */}
      {order.status !== "EDITING" && (
        <Button
          onClick={sendBackToEditing}
          disabled={sendingBack}
          variant="outline"
          className="group w-full h-10 rounded-full border-white/15 text-white/80 hover:text-white hover:border-white/30 hover:bg-white/[0.04] transition-all duration-300 disabled:opacity-60"
        >
          {sendingBack ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sending back…
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Send back to Editing
            </>
          )}
        </Button>
      )}

      {order.status === "EDITING" && (
        <p className="text-xs text-white/45 text-center py-1">
          ✓ Order is back in Editing. The team has the feedback above.
        </p>
      )}
    </section>
  );
}
