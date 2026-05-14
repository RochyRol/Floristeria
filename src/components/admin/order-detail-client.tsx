"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/ui/badge";
import { formatCOP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";

const NEXT_STATUS: Record<string, string> = {
  RECEIVED: "ACCEPTED",
  ACCEPTED: "MAKING",
  MAKING:   "READY",
  READY:    "IN_ROUTE",
  IN_ROUTE: "DELIVERED",
};

const STATUS_ACTION_LABEL: Record<string, string> = {
  RECEIVED: "✅ Aceptar pedido",
  ACCEPTED: "🌸 Iniciar elaboración",
  MAKING:   "📦 Marcar como listo",
  READY:    "🛵 Despachar",
  IN_ROUTE: "🏠 Confirmar entrega",
};

interface StatusEntry {
  id: string;
  status: string;
  note: string | null;
  timestamp: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string | null;
  dedication: string | null;
  product: { name: string; images: string[]; slug: string } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryZone: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  subtotal: number;
  deliveryCost: number;
  total: number;
  paymentMethod: string;
  notes: string | null;
  items: OrderItem[];
  customer: { name: string; email: string; phone: string | null } | null;
  statusHistory: StatusEntry[];
}

export function OrderDetailClient({
  order: initialOrder,
  role,
}: {
  order: Order;
  role: string;
}) {
  const [order, setOrder] = useState(initialOrder);
  const [advancing, setAdvancing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const nextStatus = NEXT_STATUS[order.status];
  const canAdvance =
    nextStatus &&
    (role === "ADMIN" ||
      role === "SELLER" ||
      (role === "FLORIST" && ["RECEIVED", "PROCESSING"].includes(order.status)) ||
      (role === "DELIVERY" && ["READY", "IN_ROUTE"].includes(order.status)));

  async function advanceStatus() {
    setAdvancing(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setOrder((prev) => ({
        ...prev,
        status: updated.status,
        statusHistory: [
          ...prev.statusHistory,
          {
            id: Date.now().toString(),
            status: updated.status,
            note: null,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
      toast.success(`Estado actualizado: ${ORDER_STATUS_LABELS[updated.status]}`);
    } catch {
      toast.error("Error al actualizar el estado");
    } finally {
      setAdvancing(false);
    }
  }

  async function cancelOrder() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (!res.ok) throw new Error();
      setOrder((prev) => ({ ...prev, status: "CANCELLED" }));
      toast.success("Pedido cancelado");
    } catch {
      toast.error("Error al cancelar");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/pedidos"
              className="text-xs font-sans text-forest/40 hover:text-forest transition-colors"
            >
              ← Pedidos
            </Link>
          </div>
          <h1 className="font-serif text-2xl text-forest">{order.orderNumber}</h1>
          <p className="text-sm font-sans text-forest/50 mt-1">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          {canAdvance && (
            <Button size="sm" onClick={advanceStatus} loading={advancing}>
              {STATUS_ACTION_LABEL[order.status]}
            </Button>
          )}
          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && role === "ADMIN" && (
            <Button
              size="sm"
              variant="danger"
              onClick={cancelOrder}
              loading={cancelling}
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Items */}
        <div className="col-span-2 flex flex-col gap-4">
          <section className="bg-white border border-forest/8 rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-forest/8">
              <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
                Productos ({order.items.length})
              </p>
            </div>
            <div className="divide-y divide-forest/5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="relative w-12 h-12 rounded-sm overflow-hidden bg-cream-darker flex-shrink-0">
                    {item.product?.images[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product?.name ?? ""}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium text-forest truncate">
                      {item.product?.name ?? "Producto eliminado"}
                    </p>
                    <p className="text-xs font-sans text-forest/40">
                      {item.size && `Tamaño: ${item.size} · `}
                      Cant: {item.quantity}
                    </p>
                    {item.dedication && (
                      <p className="text-xs font-sans text-forest/50 italic mt-0.5">
                        "{item.dedication}"
                      </p>
                    )}
                  </div>
                  <p className="font-serif text-sm text-forest price flex-shrink-0">
                    {formatCOP(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-forest/8 bg-cream/20">
              <div className="flex justify-between text-xs font-sans text-forest/60 mb-1">
                <span>Subtotal</span>
                <span className="price">{formatCOP(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-sans text-forest/60 mb-2">
                <span>Envío ({order.deliveryZone || "—"})</span>
                <span className="price">{formatCOP(order.deliveryCost)}</span>
              </div>
              <div className="flex justify-between text-sm font-sans font-medium text-forest">
                <span>Total</span>
                <span className="price font-serif">{formatCOP(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Status timeline */}
          <section className="bg-white border border-forest/8 rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-forest/8">
              <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
                Historial de estado
              </p>
            </div>
            <div className="px-5 py-4">
              <div className="relative flex flex-col gap-0">
                {order.statusHistory.map((entry, i) => (
                  <div key={entry.id} className="flex gap-3 relative">
                    {i < order.statusHistory.length - 1 && (
                      <div className="absolute left-[7px] top-5 bottom-0 w-px bg-forest/10" />
                    )}
                    <div className="w-3.5 h-3.5 rounded-full bg-forest flex-shrink-0 mt-1 ring-2 ring-cream" />
                    <div className="pb-4 flex-1">
                      <p className="text-sm font-sans font-medium text-forest">
                        {ORDER_STATUS_LABELS[entry.status] ?? entry.status}
                      </p>
                      {entry.note && (
                        <p className="text-xs font-sans text-forest/50">{entry.note}</p>
                      )}
                      <p className="text-xs font-sans text-forest/30 mt-0.5">
                        {formatDateTime(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-4">
          <section className="bg-white border border-forest/8 rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-forest/8">
              <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
                Cliente
              </p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-1">
              <p className="text-sm font-sans font-medium text-forest">
                {order.customer?.name ?? "—"}
              </p>
              <p className="text-xs font-sans text-forest/50">{order.customer?.email}</p>
              {order.customer?.phone && (
                <p className="text-xs font-sans text-forest/50">{order.customer.phone}</p>
              )}
            </div>
          </section>

          <section className="bg-white border border-forest/8 rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-forest/8">
              <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
                Entrega
              </p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-brand font-sans text-forest/40">
                  Destinatario
                </p>
                <p className="text-sm font-sans text-forest">{order.recipientName}</p>
                <p className="text-xs font-sans text-forest/50">{order.recipientPhone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-brand font-sans text-forest/40">
                  Dirección
                </p>
                <p className="text-sm font-sans text-forest">{order.deliveryAddress}</p>
                {order.deliveryZone && (
                  <p className="text-xs font-sans text-forest/50">{order.deliveryZone}</p>
                )}
              </div>
              {(order.deliveryDate || order.deliveryTime) && (
                <div>
                  <p className="text-[10px] uppercase tracking-brand font-sans text-forest/40">
                    Fecha / Hora
                  </p>
                  <p className="text-sm font-sans text-forest">
                    {order.deliveryDate} {order.deliveryTime && `· ${order.deliveryTime}`}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white border border-forest/8 rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-forest/8">
              <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
                Pago
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm font-sans text-forest capitalize">
                {order.paymentMethod.replace("_", " ").toLowerCase()}
              </p>
            </div>
          </section>

          {order.notes && (
            <section className="bg-white border border-forest/8 rounded-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-forest/8">
                <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
                  Notas
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm font-sans text-forest/70 italic">{order.notes}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
