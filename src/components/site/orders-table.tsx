"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ORDER_STATUS_META, type Order, type OrderStatus } from "@/types/domain";
import { useI18n } from "@/lib/i18n";
import { format, parseISO, isValid } from "date-fns";

interface OrdersTableProps {
  orders: Order[];
  /** When true (admin view), show the client name column. */
  showClient?: boolean;
}

function fmtDate(d: string | Date | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  if (!isValid(date)) return "—";
  return format(date, "MMM d, yyyy");
}

function daysUntil(d: string | Date | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  if (!isValid(date)) return "—";
  const now = new Date();
  const diff = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Today";
  return `in ${diff}d`;
}

export function OrdersTable({ orders, showClient = false }: OrdersTableProps) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="overflow-x-auto scrollbar-cglab">
        <table className="w-full min-w-[760px]">
          {/* HEADER */}
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.015]">
              <th className="text-left text-mono-label text-white/45 font-medium py-4 px-6">
                {t.ordersTable.order}
              </th>
              <th className="text-left text-mono-label text-white/45 font-medium py-4 px-6">
                {t.ordersTable.brand}
              </th>
              {showClient && (
                <th className="text-left text-mono-label text-white/45 font-medium py-4 px-6">
                  {t.admin.client}
                </th>
              )}
              <th className="text-left text-mono-label text-white/45 font-medium py-4 px-6">
                {t.ordersTable.status}
              </th>
              <th className="text-left text-mono-label text-white/45 font-medium py-4 px-6">
                {t.ordersTable.deadline}
              </th>
              <th className="text-right text-mono-label text-white/45 font-medium py-4 px-6">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          {/* BODY */}
          <tbody>
            {orders.map((order, i) => {
              const meta = ORDER_STATUS_META[order.status as OrderStatus];
              return (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="group border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Order number */}
                  <td className="py-5 px-6">
                    <span className="font-mono text-sm text-white/90 tracking-wide">
                      {order.orderNumber}
                    </span>
                    <p className="text-xs text-white/40 mt-0.5">
                      {fmtDate(order.createdAt)}
                    </p>
                  </td>
                  {/* Brand */}
                  <td className="py-5 px-6">
                    <span className="text-sm text-white/90">
                      {order.brandName}
                    </span>
                    {order.industry && (
                      <p className="text-xs text-white/40 mt-0.5">
                        {order.industry}
                      </p>
                    )}
                  </td>
                  {/* Client (admin only) */}
                  {showClient && (
                    <td className="py-5 px-6">
                      <span className="text-sm text-white/80">
                        {/* The admin view passes client data — but we render via the
                            joined `client` field from Prisma if available on the row.
                            Since we share the Order type here, we cast loosely. */}
                        {(order as any).client?.name ??
                          (order as any).client?.email ??
                          "—"}
                      </span>
                    </td>
                  )}
                  {/* Status */}
                  <td className="py-5 px-6">
                    <span
                      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs ${meta.color}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {t.status[order.status as OrderStatus].label}
                    </span>
                  </td>
                  {/* Deadline */}
                  <td className="py-5 px-6">
                    <span className="text-sm text-white/80">
                      {fmtDate(order.deadline)}
                    </span>
                    {order.deadline && (
                      <p className="text-xs text-white/40 mt-0.5">
                        {daysUntil(order.deadline)}
                      </p>
                    )}
                  </td>
                  {/* Open chevron */}
                  <td className="py-5 px-6 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 group-hover:border-white/30 group-hover:text-white transition-all duration-300"
                      aria-label={`Open order ${order.orderNumber}`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
