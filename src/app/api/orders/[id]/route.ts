import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ORDER_STATUS_FLOW, type OrderStatus } from "@/types/domain";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isAdmin(user: { role: string } | null): boolean {
  return !!user && user.role === "ADMIN";
}

const VALID_STATUSES = new Set<OrderStatus>(ORDER_STATUS_FLOW);

// ---------------------------------------------------------------------------
// PATCH /api/orders/[id] — update an order's status, delivery link, and/or
// payment verification. Admin-only.
//
// deliveryFileUrl accepts:
//   - a valid http(s) URL (Google Drive, Dropbox, WeTransfer, S3, etc.)
//   - an empty string "" (to clear the existing link)
//
// paymentStatus accepts: "VERIFIED" | "REJECTED" (admin verification flow)
// ---------------------------------------------------------------------------
const PatchSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "IDEATION",
      "AI_GENERATION",
      "EDITING",
      "READY_FOR_REVIEW",
      "DELIVERED",
    ])
    .optional(),
  deliveryFileUrl: z
    .string()
    .refine(
      (v) => v === "" || /^https?:\/\/.+/i.test(v),
      "Must be a valid http(s) URL or empty string",
    )
    .optional(),
  deliveryFileName: z.string().max(255).optional(),
  // Payment verification (Task 3)
  paymentStatus: z.enum(["VERIFIED", "REJECTED"]).optional(),
  note: z.string().max(1000).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { status, deliveryFileUrl, deliveryFileName, paymentStatus, note } = parsed.data;

  // Validate the status transition.
  // - Forward transitions are always allowed.
  // - Backward transition is ONLY allowed from READY_FOR_REVIEW → EDITING
  //   (this is the revision flow: admin manually sends an order back to editing,
  //   or the client requests a revision via the /review endpoint).
  if (status && !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (status) {
    const fromIdx = ORDER_STATUS_FLOW.indexOf(existing.status);
    const toIdx = ORDER_STATUS_FLOW.indexOf(status);
    if (toIdx < fromIdx) {
      // Allow the specific revision transition: READY_FOR_REVIEW → EDITING
      const isRevisionFlow =
        existing.status === "READY_FOR_REVIEW" && status === "EDITING";
      if (!isRevisionFlow) {
        return NextResponse.json(
          {
            error: "Status cannot move backward through the pipeline.",
          },
          { status: 400 },
        );
      }
    }
  }

  // If marking DELIVERED, require a delivery link.
  // (Either passing one in this request, or one already exists on the order.)
  const newUrl = deliveryFileUrl === undefined ? existing.deliveryFileUrl : (deliveryFileUrl || null);
  if (status === "DELIVERED" && !newUrl) {
    return NextResponse.json(
      { error: "Attach a delivery link before marking as Delivered." },
      { status: 400 },
    );
  }

  // Payment verification (Task 3)
  if (paymentStatus && !existing.paymentReceiptUrl) {
    return NextResponse.json(
      { error: "Cannot verify payment — no receipt uploaded." },
      { status: 400 },
    );
  }

  // Build the update payload
  const update: Record<string, unknown> = {};
  if (status) update.status = status;
  if (deliveryFileUrl !== undefined) {
    // Normalize: empty string → null (so the DB column stays clean)
    update.deliveryFileUrl = deliveryFileUrl || null;
  }
  if (deliveryFileName !== undefined) {
    update.deliveryFileName = deliveryFileName || null;
  }
  if (paymentStatus) {
    update.paymentStatus = paymentStatus;
    if (paymentStatus === "VERIFIED") {
      update.paymentVerifiedAt = new Date();
      update.paymentVerifiedById = user!.id;
    } else {
      // On reject, clear the verifier
      update.paymentVerifiedAt = null;
      update.paymentVerifiedById = null;
    }
  }

  const updated = await db.order.update({
    where: { id },
    data: update,
  });

  // Write an audit row if the status actually changed
  if (status && status !== existing.status) {
    await db.orderStatusUpdate.create({
      data: {
        orderId: id,
        fromStatus: existing.status,
        toStatus: status,
        changedById: user!.id,
        note: note ?? null,
      },
    });
  }

  return NextResponse.json({ order: updated });
}

// ---------------------------------------------------------------------------
// GET /api/orders/[id] — fetch a single order with its status history.
// Used by the admin order detail drawer.
// ---------------------------------------------------------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      client: {
        select: { id: true, name: true, email: true, brandName: true },
      },
      statusUpdates: {
        orderBy: { createdAt: "asc" },
        include: {
          changedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
