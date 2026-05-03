"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { formatCOP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Role } from "@prisma/client";

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
  { value: "", label: "Todos" },
  { value: "RECEIVED", label: "Recibidos" },
  { value: "PROCESSING", label: "En proceso" },
  { value: "READY", label: "Listos" },
  { value: "IN_ROUTE", label: "En ruta" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
];

const NEXT_STATUS: Record<string, string> = {
  RECEIVED: "PROCESSING",
  PROCESSING: "READY",
  READY: "IN_ROUTE",
  IN_ROUTE: "DELIVERED",
};

const NEXT_STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Iniciar proceso",
  PROCESSING: "Marcar como listo",
  READY: "Despachar",
  IN_ROUTE: "Confirmar entrega",
};

export function AdminOrdersClient({
  orders,
  total,
  page,
  perPage,
  role,
  activeFilters,
}: AdminOrdersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
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
      toast.success(`Estado actualizado: ${ORDER_STATUS_LABELS[nextStatus]}`);
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
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter("estado", opt.value)}
              className={`px-3 py-1.5 text-xs font-sans uppercase tracking-brand rounded-sm border transition-colors ${
                (activeFilters.estado || "") === opt.value
                  ? "bg-forest text-cream border-forest"
                  : "border-forest/15 text-forest/60 hover:border-forest/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Buscar pedido o cliente..."
          defaultValue={activeFilters.buscar || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilter("buscar", (e.target as HTMLInputElement).value);
            }
          }}
          className="ml-auto px-3 py-1.5 text-sm font-sans bg-white border border-forest/15 rounded-sm focus:outline-none focus:border-terracotta w-64"
        />
      </div>

      <p className="text-xs font-sans text-forest/40">{total} pedidos encontrados</p>

      {/* Table */}
      <div className="bg-white border border-forest/8 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-forest/8">
                {["Pedido", "Cliente", "Estado", "Entrega", "Total", "Acción"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] uppercase tracking-brand font-sans font-medium text-forest/40"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm font-sans text-forest/40">
                    No hay pedidos con estos filtros
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-sm font-sans font-medium text-terracotta hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                      <p className="text-[10px] font-sans text-forest/40 mt-0.5">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-sans text-forest">{order.recipientName}</p>
                      <p className="text-[10px] font-sans text-forest/40">
                        {order.neighborhood || order.city}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm font-sans text-forest/60">
                      {order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString("es-CO")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-serif text-sm text-forest price">
                      {formatCOP(Number(order.total))}
                    </td>
                    <td className="px-4 py-3">
                      {canAdvance(order.status) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={loadingId === order.id}
                          onClick={() => advanceStatus(order.id, order.status)}
                        >
                          {NEXT_STATUS_LABELS[order.status]}
                        </Button>
                      ) : (
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="text-xs font-sans text-forest/40 hover:text-forest transition-colors"
                        >
                          Ver detalle →
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
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("pagina", String(p));
                router.push(`/admin/pedidos?${params.toString()}`);
              }}
              className={`w-9 h-9 text-sm font-sans rounded-sm transition-colors ${
                p === page
                  ? "bg-forest text-cream"
                  : "border border-forest/15 text-forest/60 hover:border-forest/40"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
