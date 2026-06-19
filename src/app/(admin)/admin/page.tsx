import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/site/dashboard-shell";
import { AdminOrdersClient } from "@/components/site/admin-orders-client";
import {
  Clapperboard,
  Lightbulb,
  Cpu,
  Scissors,
  Eye,
  PackageCheck,
  Inbox,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  // Fetch ALL orders, newest first, with the client joined
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: {
        select: { id: true, name: true, email: true, brandName: true },
      },
    },
  });

  // Count by status — for the pipeline overview
  const byStatus = (s: string) => orders.filter((o) => o.status === s).length;
  const pipeline = [
    { key: "PENDING", label: "Pending", icon: Inbox, count: byStatus("PENDING") },
    { key: "IDEATION", label: "Ideation", icon: Lightbulb, count: byStatus("IDEATION") },
    { key: "AI_GENERATION", label: "AI Generation", icon: Cpu, count: byStatus("AI_GENERATION") },
    { key: "EDITING", label: "Editing", icon: Scissors, count: byStatus("EDITING") },
    { key: "READY_FOR_REVIEW", label: "Ready for Review", icon: Eye, count: byStatus("READY_FOR_REVIEW") },
    { key: "DELIVERED", label: "Delivered", icon: PackageCheck, count: byStatus("DELIVERED") },
  ];

  const active = orders.filter((o) => o.status !== "DELIVERED").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;
  const total = orders.length;

  // Serialize for the client component
  const serialized = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    brandName: o.brandName,
    industry: o.industry ?? null,
    briefDetails: o.briefDetails,
    status: o.status,
    deadline: o.deadline ? o.deadline.toISOString() : null,
    deliveryFileUrl: o.deliveryFileUrl ?? null,
    deliveryFileName: o.deliveryFileName ?? null,
    // Payment fields (Task 3)
    paymentPackage: o.paymentPackage ?? null,
    paymentReceiptUrl: o.paymentReceiptUrl ?? null,
    paymentStatus: o.paymentStatus,
    paymentVerifiedAt: o.paymentVerifiedAt ? o.paymentVerifiedAt.toISOString() : null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    client: {
      id: o.client.id,
      name: o.client.name,
      email: o.client.email,
      brandName: o.client.brandName,
    },
  }));

  return (
    <DashboardShell areaLabel="Admin · Operations">
      {/* ===================== HEADER ===================== */}
      <section className="mb-12 md:mb-16">
        <p className="text-mono-label text-white/40 mb-4">
          (01) — Operations
        </p>
        <h1 className="text-display text-4xl md:text-6xl tracking-tight font-medium leading-[1.05]">
          The studio{" "}
          <span className="text-serif-italic text-white/70">floor.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/50 leading-relaxed">
          Every brief, every cut, every delivery — in one console. Update
          status, attach final files, and keep the pipeline moving.
        </p>
      </section>

      {/* ===================== SUMMARY STATS ===================== */}
      <section className="mb-10">
        <div className="grid grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
          {[
            { label: "In production", value: active },
            { label: "Delivered", value: delivered },
            { label: "Total orders", value: total },
          ].map((s) => (
            <div key={s.label} className="bg-background p-6 md:p-7">
              <p className="text-mono-label text-white/45 mb-3">{s.label}</p>
              <span className="text-display text-4xl md:text-5xl font-medium tracking-tight">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== PIPELINE OVERVIEW ===================== */}
      <section className="mb-12">
        <p className="text-mono-label text-white/40 mb-4">
          (02) — Pipeline
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
          {pipeline.map((stage) => (
            <div
              key={stage.key}
              className="bg-background p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <stage.icon className="h-4 w-4 text-white/40" />
                <span className="text-display text-2xl font-medium tracking-tight">
                  {stage.count}
                </span>
              </div>
              <span className="text-[11px] tracking-wider uppercase text-white/45 leading-tight">
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== ALL ORDERS ===================== */}
      <section>
        <div className="mb-6">
          <p className="text-mono-label text-white/40 mb-2">
            (03) — All briefs
          </p>
          <h2 className="text-display text-2xl md:text-3xl font-medium tracking-tight">
            Incoming & active
          </h2>
        </div>
        <AdminOrdersClient orders={serialized} />
      </section>
    </DashboardShell>
  );
}
