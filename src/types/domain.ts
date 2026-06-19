/**
 * CGLAB — Shared Domain Types
 * Mirrors the Prisma models so client + server code share one vocabulary.
 */

export type Role = "CLIENT" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "IDEATION"
  | "AI_GENERATION"
  | "EDITING"
  | "READY_FOR_REVIEW"
  | "DELIVERED";

export type PaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  brandName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BriefDetails {
  objective: "AWARENESS" | "SALES" | "EDUCATIONAL";
  style: ("CINEMATIC" | "3D" | "REALISTIC" | "ANIMATED" | "MINIMAL")[number] | string;
  targetAudience: string;
  keyMessage: string;
  referenceLinks?: string[];
  additionalNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  brandName: string;
  industry?: string | null;
  briefDetails: string; // JSON-encoded BriefDetails
  status: OrderStatus;
  deadline: string | null;
  deliveryFileUrl?: string | null;
  deliveryFileName?: string | null;
  // Payment fields (Task 3)
  paymentPackage?: string | null;
  paymentReceiptUrl?: string | null;
  paymentStatus: PaymentStatus;
  paymentVerifiedAt?: string | null;
  // Client revision fields (Task 4)
  clientApprovedAt?: string | null;
  clientRevisionNotes?: string | null;
  clientRevisionRequestedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  priceUsd: number;
  reelCount: number;
  cadence: "one-time" | "monthly";
  popular: boolean;
  features: string[]; // parsed from JSON
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// UI helpers — styling only. Labels/descriptions come from the i18n dictionary
// (t.status[OrderStatus].label / .desc) so they can be translated.
// --------------------------------------------------------------------------

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { color: string; dot: string }
> = {
  PENDING: {
    color: "bg-white/5 text-white/70 border-white/10",
    dot: "bg-white/40",
  },
  IDEATION: {
    color: "bg-white/[0.07] text-white/80 border-white/15",
    dot: "bg-white/55",
  },
  AI_GENERATION: {
    color: "bg-white/[0.09] text-white/85 border-white/20",
    dot: "bg-white/70",
  },
  EDITING: {
    color: "bg-white/[0.11] text-white/90 border-white/25",
    dot: "bg-white/80",
  },
  READY_FOR_REVIEW: {
    color: "bg-white/[0.13] text-white border-white/30",
    dot: "bg-white/90",
  },
  DELIVERED: {
    color: "bg-white text-black border-white",
    dot: "bg-white",
  },
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "IDEATION",
  "AI_GENERATION",
  "EDITING",
  "READY_FOR_REVIEW",
  "DELIVERED",
];

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { color: string; dot: string }
> = {
  PENDING: {
    color: "bg-white/5 text-white/70 border-white/10",
    dot: "bg-white/40",
  },
  VERIFIED: {
    color: "bg-white text-black border-white",
    dot: "bg-black",
  },
  REJECTED: {
    color: "bg-white/[0.03] text-white/50 border-white/10 line-through",
    dot: "bg-white/20",
  },
};
