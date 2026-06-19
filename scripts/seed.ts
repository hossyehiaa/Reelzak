/**
 * CGLAB — Database Seed
 * Run with: bun run db:seed
 *
 * Creates:
 *   - 1 admin user (admin@cglab.studio / cglab-admin-2026)
 *   - 1 demo client user (client@cglab.studio / cglab-client-2026)
 *   - 3 sample orders for the demo client (one per status stage)
 *
 * NOTE: This seed is IDEMPOTENT for users (upserts by email) but
 * SKIPS order creation if the client already has orders. To force a
 * fresh re-seed, run `bun run db:reset` first (destructive).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Tiny placeholder receipt image (1×1 black JPEG, ~600 bytes base64).
// In production these would be real screenshots uploaded by clients.
const PLACEHOLDER_RECEIPT =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKgAB//Z";

async function main() {
  console.log("→ Seeding CGLAB database…\n");

  // -----------------------------------------------------------------------
  // USERS — upsert so we can run this repeatedly without duplicate-email errors
  // -----------------------------------------------------------------------
  const adminPassword = await bcrypt.hash("cglab-admin-2026", 12);
  const clientPassword = await bcrypt.hash("cglab-client-2026", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@cglab.studio" },
    update: { password: adminPassword }, // keep password fresh on re-runs
    create: {
      email: "admin@cglab.studio",
      name: "CGLAB Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`  ✓ Admin:   ${admin.email}`);

  const client = await db.user.upsert({
    where: { email: "client@cglab.studio" },
    update: { password: clientPassword },
    create: {
      email: "client@cglab.studio",
      name: "Mira Castellano",
      password: clientPassword,
      role: "CLIENT",
      brandName: "Castellano Atelier",
    },
  });
  console.log(`  ✓ Client:  ${client.email}\n`);

  // -----------------------------------------------------------------------
  // ORDERS — only seed if the client has none yet
  // -----------------------------------------------------------------------
  const existingOrders = await db.order.count({
    where: { clientId: client.id },
  });

  if (existingOrders > 0) {
    console.log(`  ↻ Client already has ${existingOrders} orders — skipping order seed.\n`);
  } else {
    const now = new Date();
    const inDays = (d: number) =>
      new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    const orders = [
      {
        orderNumber: "CGL-2026-0001",
        brandName: "Castellano Atelier",
        industry: "Fashion / Luxury",
        briefDetails: JSON.stringify({
          objective: "AWARENESS",
          style: "CINEMATIC",
          targetAudience: "Affluent women 28-45, urban professionals",
          keyMessage: "Slow luxury — every stitch tells a story",
          referenceLinks: ["https://instagram.com/reel.castellano"],
          additionalNotes: "Use warm grain, no dialogue, score-driven edit.",
        }),
        status: "EDITING",
        deadline: inDays(3),
        // Payment verified (this order is already in production)
        paymentPackage: "monthly-4",
        paymentReceiptUrl: PLACEHOLDER_RECEIPT,
        paymentStatus: "VERIFIED",
        paymentVerifiedAt: inDays(-5),
      },
      {
        orderNumber: "CGL-2026-0002",
        brandName: "Castellano Atelier",
        industry: "Fashion / Luxury",
        briefDetails: JSON.stringify({
          objective: "SALES",
          style: "REALISTIC",
          targetAudience: "Existing customers + warm leads",
          keyMessage: "Pre-fall collection — 48-hour early access",
          referenceLinks: [],
          additionalNotes: "End with product close-up + CTA card.",
        }),
        status: "IDEATION",
        deadline: inDays(8),
        // Payment pending — admin needs to verify this one
        paymentPackage: "monthly-4",
        paymentReceiptUrl: PLACEHOLDER_RECEIPT,
        paymentStatus: "PENDING",
      },
      {
        orderNumber: "CGL-2026-0003",
        brandName: "Castellano Atelier",
        industry: "Fashion / Luxury",
        briefDetails: JSON.stringify({
          objective: "EDUCATIONAL",
          style: "MINIMAL",
          targetAudience: "New followers unfamiliar with the brand",
          keyMessage: "How our atelier builds a single garment in 14 days",
          referenceLinks: [],
          additionalNotes: "VO + b-roll. 45-second vertical cut.",
        }),
        status: "DELIVERED",
        deadline: inDays(-2),
        // Use a Google Drive placeholder link — matches the new upload UX
        deliveryFileUrl:
          "https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/view",
        deliveryFileName: "CGL-2026-0003-castellano-process-reel.mp4",
        // Payment verified (delivered order)
        paymentPackage: "single",
        paymentReceiptUrl: PLACEHOLDER_RECEIPT,
        paymentStatus: "VERIFIED",
        paymentVerifiedAt: inDays(-10),
      },
    ];

    for (const o of orders) {
      const created = await db.order.create({
        data: { ...o, clientId: client.id },
      });
      console.log(`  ✓ Order:   ${created.orderNumber}  [${created.status}]`);
    }
  }

  console.log("\n→ Seed complete.\n");
  console.log("  ──────────────────────────────────────────────");
  console.log("  Admin login:");
  console.log("    email:    admin@cglab.studio");
  console.log("    password: cglab-admin-2026");
  console.log("");
  console.log("  Client login:");
  console.log("    email:    client@cglab.studio");
  console.log("    password: cglab-client-2026");
  console.log("  ──────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
