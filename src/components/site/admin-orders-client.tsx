"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  type OrderStatus,
  type PaymentStatus,
} from "@/types/domain";
import { OrderDetailDrawer } from "./order-detail-drawer";
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

interface AdminOrdersClientProps {
  orders: AdminOrder[];
}

type FilterValue = "ALL" | OrderStatus;

function fmtDate(d: string | null) {
  if (!d) return "—";
  const date = parseISO(d);
  if (!isValid(date)) return "—";
  return format(date, "MMM d, yyyy");
}

export function AdminOrdersClient({ orders }: AdminOrdersClientProps) {
  const [filter, setFilter] = React.useState<FilterValue>("ALL");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Filter + search
  const filtered = React.useMemo(() => {
    let list = orders;
    if (filter !== "ALL") list = list.filter((o) => o.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.brandName.toLowerCase().includes(q) ||
          o.client.name?.toLowerCase().includes(q) ||
          o.client.email.toLowerCase().includes(q) ||
          o.industry?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [orders, filter, query]);

  // Count per status for the filter chips
  const counts = React.useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length };
    for (const s of ORDER_STATUS_FLOW) c[s] = 0;
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;

  return (
    <>
      {/* ===================== FILTERS + SEARCH ===================== */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-cglab pb-1 md:pb-0">
          {(["ALL", ...ORDER_STATUS_FLOW] as FilterValue[]).map((f) => {
            const isActive = filter === f;
            const label = f === "ALL" ? "All" : ORDER_STATUS_META[f as OrderStatus].label;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-300 border ${
                  isActive
                    ? "bg-white text-black border-white"
                    : "bg-white/[0.02] text-white/60 border-white/10 hover:text-white hover:border-white/30"
                }`}
              >
                {label}
                <span
                  className={`text-[10px] font-mono ${
                    isActive ? "text-black/50" : "text-white/40"
                  }`}
                >
                  {counts[f] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative md:ml-auto md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, brands, clients…"
            className="h-10 pl-10 pr-9 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 inline-flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* ===================== TABLE ===================== */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.01] p-12 md:p-16 text-center">
          <p className="text-display text-xl font-medium tracking-tight mb-2">
            No orders match
          </p>
          <p className="text-sm text-white/50">
            Try a different status filter or clear your search.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto scrollbar-cglab">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.015]">
                  <Th>Order</Th>
                  <Th>Brand</Th>
                  <Th>Client</Th>
                  <Th>Status</Th>
                  <Th>Deadline</Th>
                  <Th right>Open</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const meta = ORDER_STATUS_META[order.status];
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      onClick={() => setSelectedId(order.id)}
                      className="group border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-white/90 tracking-wide">
                          {order.orderNumber}
                        </span>
                        <p className="text-xs text-white/40 mt-0.5">
                          {fmtDate(order.createdAt)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-white/90">
                          {order.brandName}
                        </span>
                        {order.industry && (
                          <p className="text-xs text-white/40 mt-0.5">
                            {order.industry}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-white/80">
                          {order.client.name ?? "—"}
                        </span>
                        <p className="text-xs text-white/40 mt-0.5">
                          {order.client.email}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs ${meta.color} w-fit`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                          {/* Payment indicator (Task 3) */}
                          {order.paymentStatus && (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] w-fit ${PAYMENT_STATUS_META[order.paymentStatus].color}`}
                              title={PAYMENT_STATUS_META[order.paymentStatus].description}
                            >
                              <span className={`h-1 w-1 rounded-full ${PAYMENT_STATUS_META[order.paymentStatus].dot}`} />
                              Pay · {PAYMENT_STATUS_META[order.paymentStatus].label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-white/80">
                          {fmtDate(order.deadline)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 group-hover:border-white/30 group-hover:text-white transition-all duration-300">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== DETAIL DRAWER ===================== */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailDrawer
            order={selectedOrder}
            onClose={() => setSelectedId(null)}
            onMutated={() => {
              // Tell Next.js to refresh server data
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`text-mono-label text-white/45 font-medium py-4 px-6 ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
