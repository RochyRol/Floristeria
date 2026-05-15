"use client";

import { useEffect, useState } from "react";
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
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

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

      if (order.status === "RECEIVED") {
        const phone = (order.customer?.phone ?? order.recipientPhone).replace(/\D/g, "");
        const normalized = phone.startsWith("57") ? phone : `57${phone}`;
        const trackingUrl = `${window.location.origin}/seguimiento/${order.orderNumber}`;
        const customerName = order.customer?.name ?? order.recipientName;
        const msg =
          `¡Hola ${customerName}! 🌸 Tu pedido *#${order.orderNumber}* ha sido *aceptado* y ya estamos trabajando en él con mucho cariño.\n\n` +
          `Puedes seguir el estado de tu pedido en tiempo real aquí:\n${trackingUrl}\n\n` +
          `Cualquier consulta, estamos a tu disposición. 💐`;
        setWhatsappUrl(`https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`);
      }
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
          <TrackingLinkRow orderNumber={order.orderNumber} />
        </div>
        <div className="flex flex-col items-end gap-2">
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
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-sans font-medium bg-[#25D366] text-white px-3 py-1.5 rounded-sm hover:bg-[#1ebe59] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Notificar cliente por WhatsApp
            </a>
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
                <p className="text-[12px] uppercase tracking-brand font-sans font-medium text-forest/40">
                  Destinatario
                </p>
                <p className="text-sm font-sans text-forest">{order.recipientName}</p>
                <p className="text-xs font-sans text-forest/50">{order.recipientPhone}</p>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-brand font-sans font-medium text-forest/40">
                  Dirección
                </p>
                <p className="text-sm font-sans text-forest">{order.deliveryAddress}</p>
                {order.deliveryZone && (
                  <p className="text-xs font-sans text-forest/50">{order.deliveryZone}</p>
                )}
              </div>
              {(order.deliveryDate || order.deliveryTime) && (
                <div>
                  <p className="text-[12px] uppercase tracking-brand font-sans font-medium text-forest/40">
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

function TrackingLinkRow({ orderNumber }: { orderNumber: string }) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const { protocol, host } = window.location;
    setOrigin(`${protocol}//${host}`);
  }, []);

  const url = origin ? `${origin}/seguimiento/${orderNumber}` : `/seguimiento/${orderNumber}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el link");
    }
  }

  function openLink() {
    window.open(url, "_blank", "noopener");
  }

  return (
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      <span className="text-[12px] uppercase tracking-brand font-sans font-semibold text-forest/60">
        Link de seguimiento
      </span>
      <code className="text-[13px] font-sans text-forest bg-cream-dark/50 px-2 py-1 rounded-sm border border-forest/8 truncate max-w-[320px]">
        {url}
      </code>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] uppercase tracking-[0.10em] font-sans font-semibold text-forest border border-forest/20 rounded-sm hover:border-forest/50 transition-colors"
        title="Copiar link"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Copiar
      </button>
      <button
        onClick={openLink}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] uppercase tracking-[0.10em] font-sans font-semibold bg-forest text-cream rounded-sm hover:bg-forest-light transition-colors"
        title="Abrir en nueva pestaña"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        Abrir
      </button>
    </div>
  );
}
