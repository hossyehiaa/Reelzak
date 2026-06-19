"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Download, FileVideo, ExternalLink } from "lucide-react";
import { type Order } from "@/types/domain";
import { format, parseISO, isValid } from "date-fns";

function fmtDate(d: string | Date | null) {
  if (!d) return "";
  const date = typeof d === "string" ? parseISO(d) : d;
  if (!isValid(date)) return "";
  return format(date, "MMM d, yyyy");
}

interface DeliveredFilesProps {
  orders: Order[];
}

export function DeliveredFiles({ orders }: DeliveredFilesProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order, i) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.06 }}
          className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/20 transition-all duration-500 p-6 flex flex-col gap-5 overflow-hidden"
        >
          {/* Decorative thumbnail */}
          <div className="relative aspect-video rounded-lg overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02]">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileVideo className="h-8 w-8 text-white/30" />
            </div>
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] tracking-wider uppercase text-white/80 font-mono">
                Delivered
              </span>
            </div>
            <div className="absolute bottom-2.5 right-2.5 text-[10px] text-white/40 font-mono">
              1080×1920
            </div>
          </div>

          {/* Meta */}
          <div className="flex-1">
            <p className="font-mono text-xs text-white/45 tracking-wide mb-1.5">
              {order.orderNumber}
            </p>
            <h3 className="font-display text-lg font-medium tracking-tight">
              {order.brandName}
            </h3>
            <p className="text-xs text-white/45 mt-1">
              Delivered {fmtDate(order.updatedAt)}
            </p>
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
            {order.deliveryFileUrl ? (
              <a
                href={order.deliveryFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn flex-1 inline-flex items-center justify-center gap-2 h-9 px-3 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 transition-all duration-300"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            ) : (
              <span className="flex-1 text-center text-xs text-white/40 py-2">
                No file attached
              </span>
            )}
            <a
              href={order.deliveryFileUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all duration-300"
              aria-label="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
