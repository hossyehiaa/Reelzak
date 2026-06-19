import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/orders";

// ---------------------------------------------------------------------------
// GET /api/orders — list the current user's orders (clients see their own;
// admins see all). Sorted by createdAt desc.
// ---------------------------------------------------------------------------
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = user.role === "ADMIN" ? {} : { clientId: user.id };
  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: {
        select: { id: true, name: true, email: true, brandName: true },
      },
    },
  });

  return NextResponse.json({ orders });
}

// ---------------------------------------------------------------------------
// POST /api/orders — submit a new brief (client only).
// Now accepts payment fields (Task 3): paymentPackage + paymentReceiptUrl.
// The receipt is a base64 data URL (client-side compressed image) so we don't
// need external storage for MVP.
// ---------------------------------------------------------------------------
const BriefSchema = z.object({
  brandName: z.string().min(2, "Brand name is required").max(100),
  industry: z.string().min(2, "Industry is required").max(100),
  objective: z.enum(["AWARENESS", "SALES", "EDUCATIONAL"]),
  style: z.string().min(1, "Style is required"),
  targetAudience: z.string().min(4, "Tell us who you're trying to reach").max(500),
  keyMessage: z.string().min(4, "What's the one thing viewers should remember?").max(500),
  referenceLinks: z
    .array(z.string().url().or(z.literal("")))
    .max(5)
    .optional()
    .transform((arr) => (arr ?? []).filter(Boolean)),
  additionalNotes: z.string().max(2000).optional().default(""),
  deadline: z.string().datetime().optional(),
  // --- Payment fields (Task 3) ---
  paymentPackage: z.enum(["single", "monthly-4", "monthly-10"]),
  paymentReceiptUrl: z
    .string()
    .min(1, "Payment receipt is required")
    .max(500_000, "Receipt image too large (max ~350KB after compression)")
    .refine(
      (v) => v.startsWith("data:image/") || v.startsWith("https://"),
      "Receipt must be an image data URL or https URL",
    ),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "CLIENT") {
    return NextResponse.json(
      { error: "Only clients can submit briefs" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BriefSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstError?.message ?? "Invalid brief" },
      { status: 400 },
    );
  }

  const { brandName, industry, objective, style, targetAudience, keyMessage, referenceLinks, additionalNotes, deadline, paymentPackage, paymentReceiptUrl } = parsed.data;

  const briefDetails = JSON.stringify({
    objective,
    style,
    targetAudience,
    keyMessage,
    referenceLinks,
    additionalNotes,
  });

  const orderNumber = await generateOrderNumber();

  const order = await db.order.create({
    data: {
      orderNumber,
      clientId: user.id,
      brandName,
      industry,
      briefDetails,
      status: "PENDING",
      deadline: deadline ? new Date(deadline) : null,
      // Payment (Task 3)
      paymentPackage,
      paymentReceiptUrl,
      paymentStatus: "PENDING",
    },
    select: {
      id: true,
      orderNumber: true,
      brandName: true,
      status: true,
      deadline: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  // Cache the latest brand name on the user for convenience.
  await db.user.update({
    where: { id: user.id },
    data: { brandName },
  });

  return NextResponse.json({ order }, { status: 201 });
}
