import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/site/dashboard-shell";
import { OrdersTable } from "@/components/site/orders-table";
import { DeliveredFiles } from "@/components/site/delivered-files";
import { ReviewSection } from "@/components/site/review-section";
import { ArrowUpRight, Clapperboard, Package, CheckCircle2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import type { Order } from "@/types/domain";

export default async function ClientDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch all the user's orders, newest first
  const orders = await db.order.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Split into active vs delivered
  const activeOrders = orders.filter((o) => o.status !== "DELIVERED");
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");

  // Orders that are ready for client review (Task 4)
  const reviewOrders = activeOrders.filter(
    (o) => o.status === "READY_FOR_REVIEW",
  );

  // Serialize review orders for the client component (Date → ISO string)
  const serializedReviewOrders: Order[] = reviewOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    clientId: o.clientId,
    brandName: o.brandName,
    industry: o.industry,
    briefDetails: o.briefDetails,
    status: o.status as any,
    deadline: o.deadline ? o.deadline.toISOString() : null,
    deliveryFileUrl: o.deliveryFileUrl,
    deliveryFileName: o.deliveryFileName,
    paymentPackage: o.paymentPackage,
    paymentReceiptUrl: o.paymentReceiptUrl,
    paymentStatus: o.paymentStatus as any,
    paymentVerifiedAt: o.paymentVerifiedAt
      ? o.paymentVerifiedAt.toISOString()
      : null,
    clientApprovedAt: o.clientApprovedAt
      ? o.clientApprovedAt.toISOString()
      : null,
    clientRevisionNotes: o.clientRevisionNotes,
    clientRevisionRequestedAt: o.clientRevisionRequestedAt
      ? o.clientRevisionRequestedAt.toISOString()
      : null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));

  // Stats
  const inProduction = activeOrders.length;
  const totalDelivered = deliveredOrders.length;
  const total = orders.length;

  // Find the next upcoming deadline across active orders
  const upcoming = activeOrders
    .filter((o) => o.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    )[0];

  const fmtDate = (d: Date | string | null) => {
    if (!d) return "—";
    const date = typeof d === "string" ? parseISO(d) : d;
    if (!isValid(date)) return "—";
    return format(date, "MMM d, yyyy");
  };

  return (
    <DashboardShell
      areaLabel="Client Portal"
      primaryAction={{ href: "/new-order", label: "New Order" }}
    >
      {/* ===================== HEADER ===================== */}
      <section className="mb-12 md:mb-16">
        <p className="text-mono-label text-white/40 mb-4">
          (01) — Overview
        </p>
        <h1 className="text-display text-4xl md:text-6xl tracking-tight font-medium leading-[1.05]">
          Welcome back,{" "}
          <span className="text-serif-italic text-white/70">
            {user.name?.split(" ")[0] || "there"}.
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/50 leading-relaxed">
          Track your active orders, submit new briefs, and download finished
          reels — all in one place.
        </p>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
          {[
            {
              icon: Clapperboard,
              label: "In production",
              value: inProduction,
              hint: upcoming
                ? `Next: ${fmtDate(upcoming.deadline)}`
                : "No deadlines scheduled",
            },
            {
              icon: Package,
              label: "Total orders",
              value: total,
              hint: "Since you joined",
            },
            {
              icon: CheckCircle2,
              label: "Delivered",
              value: totalDelivered,
              hint: "Ready to download",
            },
            {
              icon: ArrowUpRight,
              label: "Repeat rate",
              value: total > 0 ? "100%" : "—",
              hint: "Of clients reorder",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-background p-6 md:p-7 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <stat.icon className="h-4 w-4 text-white/40" />
                <span className="text-mono-label text-white/30">
                  {stat.label}
                </span>
              </div>
              <span className="text-display text-4xl md:text-5xl font-medium tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs text-white/40 leading-snug">
                {stat.hint}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== ACTIVE ORDERS ===================== */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-mono-label text-white/40 mb-2">
              (02) — Active orders
            </p>
            <h2 className="text-display text-2xl md:text-3xl font-medium tracking-tight">
              In production
            </h2>
          </div>
          {activeOrders.length > 0 && (
            <Link
              href="/new-order"
              className="group hidden sm:inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
            >
              Submit another brief
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>

        {activeOrders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <OrdersTable orders={activeOrders} />
        )}
      </section>

      {/* ===================== READY FOR REVIEW ===================== */}
      {serializedReviewOrders.length > 0 && (
        <section className="mb-16">
          <div className="mb-6">
            <p className="text-mono-label text-white/40 mb-2">
              (03) — Awaiting your review
            </p>
            <h2 className="text-display text-2xl md:text-3xl font-medium tracking-tight">
              First cuts ready
            </h2>
          </div>
          <div className="space-y-6">
            {serializedReviewOrders.map((order) => (
              <ReviewSection key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {/* ===================== DELIVERED ===================== */}
      {deliveredOrders.length > 0 && (
        <section className="mb-16">
          <div className="mb-6">
            <p className="text-mono-label text-white/40 mb-2">
              ({serializedReviewOrders.length > 0 ? "04" : "03"}) — Delivered files
            </p>
            <h2 className="text-display text-2xl md:text-3xl font-medium tracking-tight">
              Finished reels
            </h2>
          </div>
          <DeliveredFiles orders={deliveredOrders} />
        </section>
      )}
    </DashboardShell>
  );
}

// ---------------------------------------------------------------------------
// Empty state — shown when the client has no active orders
// ---------------------------------------------------------------------------
function EmptyOrders() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.01] p-12 md:p-16 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] mb-6">
        <Clapperboard className="h-6 w-6 text-white/60" />
      </div>
      <h3 className="text-display text-2xl font-medium tracking-tight mb-2">
        No active orders
      </h3>
      <p className="max-w-md mx-auto text-sm text-white/50 leading-relaxed mb-8">
        Submit your first brief and our team will start ideating within 24
        hours. Most reels deliver in five business days.
      </p>
      <Link
        href="/new-order"
        className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft"
      >
        Start your first project
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  );
}
