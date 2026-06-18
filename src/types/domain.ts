/**
 * Reelzak — Shared Domain Types
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
// UI helpers
// --------------------------------------------------------------------------

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; dot: string; description: string }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-white/5 text-white/70 border-white/10",
    dot: "bg-white/40",
    description: "Brief submitted — our team is reviewing it.",
  },
  IDEATION: {
    label: "Ideation",
    color: "bg-white/[0.07] text-white/80 border-white/15",
    dot: "bg-white/55",
    description: "Our creative team is crafting concept directions.",
  },
  AI_GENERATION: {
    label: "AI Generation",
    color: "bg-white/[0.09] text-white/85 border-white/20",
    dot: "bg-white/70",
    description: "Generating visual assets with our AI pipeline.",
  },
  EDITING: {
    label: "Editing",
    color: "bg-white/[0.11] text-white/90 border-white/25",
    dot: "bg-white/80",
    description: "Assembling, color-grading, and sound-designing your reel.",
  },
  READY_FOR_REVIEW: {
    label: "Ready for Review",
    color: "bg-white/[0.13] text-white border-white/30",
    dot: "bg-white/90",
    description: "First cut delivered — review and share feedback.",
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-white text-black border-white",
    dot: "bg-white",
    description: "Final reel delivered. Ready to download.",
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
