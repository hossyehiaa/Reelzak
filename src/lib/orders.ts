import { db } from "@/lib/db";

/**
 * Generate the next human-friendly order number, e.g. CGL-2026-0004.
 * Format: CGL-{YEAR}-{4-digit zero-padded sequence}.
 *
 * Sequence is derived from the count of orders created in the current year.
 * This is intentionally simple — for high-volume production you'd want a
 * dedicated counter row, but this works perfectly for a productized service.
 */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const startOfYear = new Date(`${year}-01-01T00:00:00Z`);

  const count = await db.order.count({
    where: { createdAt: { gte: startOfYear } },
  });

  const seq = (count + 1).toString().padStart(4, "0");
  return `CGL-${year}-${seq}`;
}

/**
 * The ordered list of brief objectives, used by both the briefing form
 * and (later) the admin dashboard filters.
 */
export const BRIEF_OBJECTIVES = [
  { value: "AWARENESS", label: "Awareness", description: "Build brand recognition and reach new audiences." },
  { value: "SALES", label: "Sales", description: "Drive direct conversions and product purchases." },
  { value: "EDUCATIONAL", label: "Educational", description: "Teach, explain, or demonstrate a concept or process." },
] as const;

export const BRIEF_STYLES = [
  { value: "CINEMATIC", label: "Cinematic", description: "Film-grade grain, anamorphic flares, score-driven." },
  { value: "3D", label: "3D / CGI", description: "Rendered worlds, abstract product viz, motion design." },
  { value: "REALISTIC", label: "Realistic", description: "Photo-real, document-style, human-led." },
  { value: "ANIMATED", label: "Animated", description: "Hand-drawn or vector motion, character-led storytelling." },
  { value: "MINIMAL", label: "Minimal", description: "Negative space, single subject, restrained palette." },
] as const;
