"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { formatCOP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Role } from "@prisma/client";

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
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "") params.delete(key); else params.set(key, value);
    params.delete("pagina");
    router.push(`/admin/pedidos?${params.toString()}`);
  }

  async function advanceStatus(orderId: string, currentStatus: string) {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setLoadingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${ORDER_STATUS_LABELS[next]}`);
      router.refresh();
    } catch {
      toast.error("Error al actualizar el estado");
    } finally {
      setLoadingId(null);
    }
  }

  const totalPages = Math.ceil(total / perPage);
  const canAdvance  = (status: string) => NEXT_STATUS[status] && role !== "CLIENT";

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: SANS }}>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-2 p-3"
        style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8 }}
      >
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => {
            const on = (activeFilters.estado || "") === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateFilter("estado", opt.value)}
                style={{
                  padding: "4px 11px",
                  fontSize: 11,
                  fontFamily: SANS,
                  fontWeight: on ? 600 : 400,
                  cursor: "pointer",
                  borderRadius: 5,
                  border: `1px solid ${on ? "#1F3A2E" : "#E5E7EB"}`,
                  background: on ? "#1F3A2E" : "transparent",
                  color:      on ? "#fff" : "#374151",
                  transition: "all 0.12s",
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
            marginLeft: "auto", padding: "5px 11px", fontSize: 12,
            fontFamily: SANS, background: "#F9FAFB",
            border: "1px solid #E5E7EB", borderRadius: 6, outline: "none",
            color: "#111827", width: 210,
          }}
        />
      </div>

      <p style={{ fontSize: 12, color: "#6B7280", paddingLeft: 2 }}>
        {total} pedido{total !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F4F6", background: "#F9FAFB" }}>
                {["Pedido", "Cliente", "Estado", "Entrega", "Total", "Acción"].map((h) => (
                  <th
                    key={h}
                    style={{ padding: "9px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, fontFamily: SANS, color: "#6B7280", whiteSpace: "nowrap" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: "#9CA3AF", fontFamily: SANS }}>
                    No hay pedidos con estos filtros
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid #F3F4F6" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFAFA")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "11px 16px" }}>
                      <Link href={`/admin/pedidos/${order.id}`} style={{ fontSize: 12, fontWeight: 600, color: "#1F3A2E", textDecoration: "none" }}>
                        #{order.orderNumber}
                      </Link>
                      <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{formatDateTime(order.createdAt)}</p>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "#111827" }}>{order.recipientName}</p>
                      <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{order.neighborhood || order.city}</p>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: 12, color: "#374151" }}>
                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("es-CO") : "—"}
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontFamily: SERIF, fontSize: 13, color: "#111827", letterSpacing: "0.02em" }}>
                        {formatCOP(Number(order.total))}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      {canAdvance(order.status) ? (
                        <Button size="sm" variant="outline" loading={loadingId === order.id}
                          onClick={() => advanceStatus(order.id, order.status)}>
                          {NEXT_STATUS_LABELS[order.status]}
                        </Button>
                      ) : (
                        <Link href={`/admin/pedidos/${order.id}`}
                          style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "none", fontFamily: SANS }}>
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
        <div className="flex justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("pagina", String(p));
                router.push(`/admin/pedidos?${params.toString()}`);
              }}
              style={{
                width: 32, height: 32, fontSize: 12, fontFamily: SANS, cursor: "pointer",
                borderRadius: 6,
                border: `1px solid ${p === page ? "#1F3A2E" : "#E5E7EB"}`,
                background: p === page ? "#1F3A2E" : "#fff",
                color:      p === page ? "#fff" : "#374151",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
