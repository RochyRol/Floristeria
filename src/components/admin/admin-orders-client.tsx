"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { formatCOP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Role } from "@prisma/client";

/* ── tokens ── */
const F    = "#1F3A2E";
const FM   = "rgba(31,58,46,0.45)";
const FL   = "rgba(31,58,46,0.09)";
const GOLD = "#A87C3A";
const CARD = "#FFFFFF";
const SANS  = "var(--font-manrope, sans-serif)";
const SERIF = "var(--font-italiana, serif)";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  recipientName: string;
  recipientPhone: string;
  deliveryDate: Date | null;
  neighborhood: string | null;
  city: string;
  paymentMethod: string;
  customer: { name: string; email: string; phone: string | null } | null;
  items: { productName: string; quantity: number; unitPrice: number }[];
}

interface AdminOrdersClientProps {
  orders: Order[];
  total: number;
  page: number;
  perPage: number;
  role: string;
  activeFilters: { estado?: string; buscar?: string };
}

const STATUS_OPTIONS = [
  { value: "",           label: "Todos"      },
  { value: "RECEIVED",   label: "Recibidos"  },
  { value: "ACCEPTED",   label: "Aceptados"  },
  { value: "MAKING",     label: "Elaborando" },
  { value: "READY",      label: "Listos"     },
  { value: "IN_ROUTE",   label: "En ruta"    },
  { value: "DELIVERED",  label: "Entregados" },
  { value: "CANCELLED",  label: "Cancelados" },
];

const NEXT_STATUS: Record<string, string> = {
  RECEIVED: "ACCEPTED",
  ACCEPTED: "MAKING",
  MAKING:   "READY",
  READY:    "IN_ROUTE",
  IN_ROUTE: "DELIVERED",
};

const NEXT_STATUS_LABELS: Record<string, string> = {
  RECEIVED: "✅ Aceptar",
  ACCEPTED: "🌸 Elaborar",
  MAKING:   "📦 Listo",
  READY:    "🛵 Despachar",
  IN_ROUTE: "🏠 Entregado",
};

export function AdminOrdersClient({ orders, total, page, perPage, role, activeFilters }: AdminOrdersClientProps) {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "") params.delete(key); else params.set(key, value);
    params.delete("pagina");
    router.push(`/admin/pedidos?${params.toString()}`);
  }

  async function advanceStatus(orderId: string, currentStatus: string) {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;
    setLoadingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Estado → ${ORDER_STATUS_LABELS[nextStatus]}`);
      router.refresh();
    } catch {
      toast.error("Error al actualizar el estado");
    } finally {
      setLoadingId(null);
    }
  }

  const totalPages = Math.ceil(total / perPage);
  const canAdvance = (status: string) => NEXT_STATUS[status] && role !== "CLIENT";

  return (
    <div className="flex flex-col gap-5">

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ background: CARD, border: `1px solid ${FL}` }}>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = (activeFilters.estado || "") === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateFilter("estado", opt.value)}
                style={{
                  padding: "5px 12px", fontSize: 10, letterSpacing: "0.14em",
                  textTransform: "uppercase", fontFamily: SANS, cursor: "pointer",
                  border: `1px solid ${isActive ? F : FL}`,
                  background: isActive ? F : "transparent",
                  color: isActive ? "#EDE8DF" : FM, transition: "all 0.15s",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <input
          type="search"
          placeholder="Buscar pedido o cliente..."
          defaultValue={activeFilters.buscar || ""}
          onKeyDown={(e) => { if (e.key === "Enter") updateFilter("buscar", (e.target as HTMLInputElement).value); }}
          style={{
            marginLeft: "auto", padding: "6px 12px", fontSize: 12, fontFamily: SANS,
            background: "#F7F4EF", border: `1px solid ${FL}`, outline: "none", color: F, width: 220,
          }}
        />
      </div>

      <p style={{ fontSize: 11, fontFamily: SANS, color: FM, paddingLeft: 2 }}>
        {total} pedido{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div style={{ background: CARD, border: `1px solid ${FL}`, overflow: "hidden" }}>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${FL}`, background: "#F7F4EF" }}>
                {["Pedido", "Cliente", "Estado", "Entrega", "Total", "Acción"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: SANS, color: FM, fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, fontFamily: SANS, color: FM }}>
                    No hay pedidos con estos filtros
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: `1px solid ${FL}`, transition: "background 0.15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F7F4EF")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={`/admin/pedidos/${order.id}`} style={{ fontSize: 12, fontFamily: SANS, fontWeight: 600, color: GOLD, textDecoration: "none" }}>
                        #{order.orderNumber}
                      </Link>
                      <p style={{ fontSize: 10, fontFamily: SANS, color: FM, marginTop: 2 }}>{formatDateTime(order.createdAt)}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 12, fontFamily: SANS, color: F, fontWeight: 500 }}>{order.recipientName}</p>
                      <p style={{ fontSize: 10, fontFamily: SANS, color: FM, marginTop: 2 }}>{order.neighborhood || order.city}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: SANS, color: FM }}>
                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("es-CO") : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontFamily: SERIF, fontSize: 14, color: F, letterSpacing: "0.02em" }}>
                        {formatCOP(Number(order.total))}
                      </p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {canAdvance(order.status) ? (
                        <Button size="sm" variant="outline" loading={loadingId === order.id} onClick={() => advanceStatus(order.id, order.status)}>
                          {NEXT_STATUS_LABELS[order.status]}
                        </Button>
                      ) : (
                        <Link href={`/admin/pedidos/${order.id}`} style={{ fontSize: 10, fontFamily: SANS, color: FM, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
                          Ver →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { const params = new URLSearchParams(searchParams.toString()); params.set("pagina", String(p)); router.push(`/admin/pedidos?${params.toString()}`); }}
              style={{ width: 34, height: 34, fontSize: 12, fontFamily: SANS, cursor: "pointer", border: `1px solid ${p === page ? F : FL}`, background: p === page ? F : "transparent", color: p === page ? "#EDE8DF" : FM, transition: "all 0.15s" }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
