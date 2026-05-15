"use client";

import { motion } from "framer-motion";
import { OrderProgress } from "@/components/ui/order-progress";
import { ORDER_STATUS_LABELS, formatDateTime } from "@/lib/utils";

interface StatusEntry {
  status: string;
  note: string | null;
  timestamp: string;
}

interface OrderItem {
  productName: string;
  quantity: number;
  size: string | null;
}

interface TrackingOrder {
  orderNumber: string;
  status: string;
  recipientName: string;
  deliveryAddress: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  createdAt: string;
  items: OrderItem[];
  statusHistory: StatusEntry[];
}

const WHATSAPP_NUMBER = "573215039845";

export function TrackingClient({ order }: { order: TrackingOrder }) {
  const currentLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;

  function contactWhatsApp() {
    const msg = `Hola, soy ${order.recipientName} y quiero consultar sobre mi pedido ${order.orderNumber}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0E0E0D", color: "#EDE8DF" }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(237,232,223,0.08)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p style={{ fontFamily: "var(--font-italiana, serif)", fontSize: 22, letterSpacing: "0.06em", color: "#EDE8DF" }}>
              Deco·Imperio
            </p>
            <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A87C3A", fontFamily: "var(--font-manrope, sans-serif)", marginTop: 1 }}>
              Floristería
            </p>
          </div>
          <a
            href="/"
            style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(237,232,223,0.65)", fontFamily: "var(--font-manrope, sans-serif)", textDecoration: "none" }}
          >
            Ir a la tienda →
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Order number + status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10"
        >
          <p style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A87C3A", fontFamily: "var(--font-manrope, sans-serif)", fontWeight: 600, marginBottom: 8 }}>
            Seguimiento de pedido
          </p>
          <h1 style={{ fontFamily: "var(--font-italiana, serif)", fontSize: "clamp(2rem, 6vw, 3.5rem)", color: "#EDE8DF", lineHeight: 1, letterSpacing: "0.04em" }}>
            {order.orderNumber}
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <span
              className="inline-block"
              style={{
                background: order.status === "CANCELLED" ? "rgba(122,46,46,0.2)" : "rgba(168,124,58,0.15)",
                border: `1px solid ${order.status === "CANCELLED" ? "rgba(122,46,46,0.4)" : "rgba(168,124,58,0.4)"}`,
                color: order.status === "CANCELLED" ? "#c07070" : "#A87C3A",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "var(--font-manrope, sans-serif)",
                fontWeight: 600,
                padding: "4px 12px",
              }}
            >
              {currentLabel}
            </span>
            <span style={{ color: "rgba(237,232,223,0.65)", fontSize: 12, fontFamily: "var(--font-manrope, sans-serif)" }}>
              {formatDateTime(order.createdAt)}
            </span>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 px-2"
        >
          <div
            className="rounded-sm p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(237,232,223,0.06)" }}
          >
            <OrderProgress status={order.status} />
          </div>
        </motion.div>

        {/* Order details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
        >
          {/* Recipient */}
          <div
            className="p-5 rounded-sm"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(237,232,223,0.06)" }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(237,232,223,0.65)", fontFamily: "var(--font-manrope, sans-serif)", fontWeight: 500, marginBottom: 6 }}>
              Destinatario
            </p>
            <p style={{ fontFamily: "var(--font-italiana, serif)", fontSize: 18, color: "#EDE8DF" }}>
              {order.recipientName}
            </p>
            {order.deliveryAddress && (
              <p style={{ fontSize: 13, color: "rgba(237,232,223,0.72)", fontFamily: "var(--font-manrope, sans-serif)", marginTop: 4, lineHeight: 1.5 }}>
                {order.deliveryAddress}
              </p>
            )}
          </div>

          {/* Delivery time */}
          {(order.deliveryDate || order.deliveryTime) && (
            <div
              className="p-5 rounded-sm"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(237,232,223,0.06)" }}
            >
              <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(237,232,223,0.65)", fontFamily: "var(--font-manrope, sans-serif)", fontWeight: 500, marginBottom: 6 }}>
                Entrega programada
              </p>
              {order.deliveryDate && (
                <p style={{ fontFamily: "var(--font-italiana, serif)", fontSize: 18, color: "#EDE8DF" }}>
                  {new Date(order.deliveryDate).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              )}
              {order.deliveryTime && (
                <p style={{ fontSize: 12, color: "#A87C3A", fontFamily: "var(--font-manrope, sans-serif)", marginTop: 4 }}>
                  {order.deliveryTime}
                </p>
              )}
            </div>
          )}

          {/* Products */}
          <div
            className="p-5 rounded-sm sm:col-span-2"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(237,232,223,0.06)" }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(237,232,223,0.65)", fontFamily: "var(--font-manrope, sans-serif)", fontWeight: 500, marginBottom: 10 }}>
              Tu pedido
            </p>
            <div className="flex flex-col gap-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p style={{ fontFamily: "var(--font-manrope, sans-serif)", fontSize: 13, color: "rgba(237,232,223,0.8)" }}>
                    {item.productName}
                    {item.size && item.size !== "Estándar" && (
                      <span style={{ color: "rgba(237,232,223,0.65)", fontSize: 12, marginLeft: 6 }}>· {item.size}</span>
                    )}
                  </p>
                  <span style={{ fontSize: 12, color: "rgba(237,232,223,0.4)", fontFamily: "var(--font-manrope, sans-serif)" }}>
                    ×{item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Status history */}
        {order.statusHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-10"
          >
            <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(237,232,223,0.65)", fontFamily: "var(--font-manrope, sans-serif)", fontWeight: 500, marginBottom: 14 }}>
              Historial
            </p>
            <div className="flex flex-col gap-0">
              {order.statusHistory.map((entry, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center" style={{ width: 20 }}>
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ background: i === order.statusHistory.length - 1 ? "#A87C3A" : "#1C3A2B" }}
                    />
                    {i < order.statusHistory.length - 1 && (
                      <div className="flex-1 w-px my-1" style={{ background: "rgba(237,232,223,0.08)", minHeight: 16 }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p style={{ fontFamily: "var(--font-manrope, sans-serif)", fontSize: 13, color: i === order.statusHistory.length - 1 ? "#EDE8DF" : "rgba(237,232,223,0.72)", fontWeight: i === order.statusHistory.length - 1 ? 600 : 500 }}>
                      {ORDER_STATUS_LABELS[entry.status] ?? entry.status}
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(237,232,223,0.60)", fontFamily: "var(--font-manrope, sans-serif)", marginTop: 2 }}>
                      {formatDateTime(entry.timestamp)}
                    </p>
                    {entry.note && (
                      <p style={{ fontSize: 12, color: "rgba(237,232,223,0.65)", fontFamily: "var(--font-manrope, sans-serif)", marginTop: 3, fontStyle: "italic" }}>
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center text-center gap-4 pt-4"
          style={{ borderTop: "1px solid rgba(237,232,223,0.06)" }}
        >
          <p style={{ fontSize: 13, color: "rgba(237,232,223,0.65)", fontFamily: "var(--font-manrope, sans-serif)", letterSpacing: "0.03em" }}>
            ¿Tienes alguna pregunta sobre tu pedido?
          </p>
          <button
            onClick={contactWhatsApp}
            className="inline-flex items-center gap-3 px-6 py-3 transition-all"
            style={{
              background: "rgba(37,211,102,0.1)",
              border: "1px solid rgba(37,211,102,0.3)",
              color: "#25D366",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "var(--font-manrope, sans-serif)",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,211,102,0.18)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,211,102,0.1)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49" />
            </svg>
            Escríbenos
          </button>
        </motion.div>
      </div>
    </div>
  );
}
