import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// ---------------------------------------------------------------------------
// POST /api/orders/[id]/review — client approves or requests a revision.
// Client-only. Only works when the order is in READY_FOR_REVIEW status.
//
// Body:
//   { action: "APPROVE" }                              → sets clientApprovedAt
//   { action: "REQUEST_REVISION", notes: "..." }       → sets revision notes +
//                                                        moves status back to EDITING
// ---------------------------------------------------------------------------
const ReviewSchema = z.object({
  action: z.enum(["APPROVE", "REQUEST_REVISION"]),
  notes: z.string().max(2000).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "CLIENT") {
    return NextResponse.json(
      { error: "Only clients can review orders" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const order = await db.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Verify ownership
  if (order.clientId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only allow review when the order is READY_FOR_REVIEW
  if (order.status !== "READY_FOR_REVIEW") {
    return NextResponse.json(
      {
        error:
          "This order is not ready for review. You can only review orders in the 'Ready for Review' stage.",
      },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { action, notes } = parsed.data;

  if (action === "REQUEST_REVISION") {
    if (!notes || notes.trim().length < 4) {
      return NextResponse.json(
        { error: "Please provide revision feedback (at least 4 characters)." },
        { status: 400 },
      );
    }

    // Move status back to EDITING + store revision notes
    const updated = await db.order.update({
      where: { id },
      data: {
        status: "EDITING",
        clientRevisionNotes: notes.trim(),
        clientRevisionRequestedAt: new Date(),
        // Clear any prior approval if this is a re-review
        clientApprovedAt: null,
      },
    });

    // Write an audit row for the backward transition
    await db.orderStatusUpdate.create({
      data: {
        orderId: id,
        fromStatus: "READY_FOR_REVIEW",
        toStatus: "EDITING",
        changedById: user.id,
        note: `Client requested revision: ${notes.trim().slice(0, 200)}${notes.trim().length > 200 ? "…" : ""}`,
      },
    });

    return NextResponse.json({
      ok: true,
      action: "REQUEST_REVISION",
      order: { id: updated.id, status: updated.status },
    });
  }

  // action === "APPROVE"
  const updated = await db.order.update({
    where: { id },
    data: {
      clientApprovedAt: new Date(),
      // Clear any prior revision notes
      clientRevisionNotes: null,
      clientRevisionRequestedAt: null,
    },
  });

  return NextResponse.json({
    ok: true,
    action: "APPROVE",
    order: { id: updated.id, status: updated.status },
  });
}
