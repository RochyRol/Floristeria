"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { formatCOP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import { SyncSheetsButton } from "@/components/admin/sync-sheets-button";
import type { Role } from "@prisma/client";

/* ── tokens ── */
const SANS = "var(--font-manrope, sans-serif)";
const SERIF = "var(--font-italiana, serif)";
const WA_NUMBER = "573215039845";

type Period = "day" | "week" | "month" | "year";

const PERIOD_LABELS: Record<Period, string>     = { day: "Hoy", week: "Semana", month: "Mes", year: "Año" };
const PERIOD_KPI_LABEL: Record<Period, string>  = { day: "Ingresos hoy", week: "Ingresos semana", month: "Ingresos del mes", year: "Ingresos del año" };

interface IncomingOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  recipientName: string;
  recipientPhone: string;
  deliveryDate: string | null;
  deliveryTime: string | null;
  cardMessage: string | null;
  customer: { name: string; phone: string | null } | null;
  items: { productName: string; quantity: number }[];
}

interface Stats {
  todayOrders: number;
  pendingOrders: number;
  activeOrders: number;
  capacityLimit: number;
  monthRevenue: number;
  recentOrders: {
    id: string; orderNumber: string; status: string; total: number;
    createdAt: string; recipientName: string;
    customer: { name: string } | null;
    items: { productName: string }[];
  }[];
  topProducts: { id: string; name: string; salesCount: number; basePrice: number; images: string[] }[];
  incomingOrders: IncomingOrder[];
}

/* ── helpers ── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8 }}>
      {children}
    </div>
  );
}
function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #F3F4F6" }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: SANS }}>{title}</p>
      {action}
    </div>
  );
}

function openWhatsApp(phone: string, message: string) {
  const clean = phone.replace(/\D/g, "");
  const full  = clean.startsWith("57") ? clean : `57${clean}`;
  window.open(`https://wa.me/${full}?text=${encodeURIComponent(message)}`, "_blank");
}

/* ── Reschedule Modal ── */
function RescheduleModal({
  order,
  onClose,
  onDone,
}: {
  order: IncomingOrder;
  onClose: () => void;
  onDone: (id: string) => void;
}) {
  const [date, setDate]     = useState(order.deliveryDate?.slice(0, 10) ?? "");
  const [time, setTime]     = useState(order.deliveryTime ?? "");
  const [note, setNote]     = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!date) { toast.error("Elige una fecha"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryDate: date, deliveryTime: time || null }),
      });
      if (!res.ok) throw new Error();

      toast.success("Pedido reprogramado");
      onDone(order.id);

      // WhatsApp message
      const phone    = order.customer?.phone || order.recipientPhone;
      const dateStr  = new Date(date + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
      const timeStr  = time ? ` a las ${time}` : "";
      const msg = `🌸 Hola ${order.recipientName}, te escribimos de Floristería Deco Imperio.\n\nTu pedido *#${order.orderNumber}* ha sido reprogramado para el *${dateStr}${timeStr}*.\n\n${note ? `Nota: ${note}\n\n` : ""}Por favor confírmanos si esta fecha te queda bien. ¡Gracias!`;

      setTimeout(() => openWhatsApp(phone, msg), 300);
      onClose();
    } catch {
      toast.error("Error al reprogramar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 440, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p style={{ fontFamily: SERIF, fontSize: 22, color: "#111827", letterSpacing: "0.04em" }}>Reprogramar pedido</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", fontFamily: SANS, marginTop: 2 }}>#{order.orderNumber} · {order.recipientName}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B7280", fontFamily: SANS, display: "block", marginBottom: 6 }}>
              Nueva fecha de entrega *
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13, fontFamily: SANS, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B7280", fontFamily: SANS, display: "block", marginBottom: 6 }}>
              Hora (opcional)
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13, fontFamily: SANS, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B7280", fontFamily: SANS, display: "block", marginBottom: 6 }}>
              Nota para el cliente (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Estamos al tope hoy, con gusto lo atendemos el viernes..."
              rows={3}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13, fontFamily: SANS, outline: "none", resize: "none" }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px 0", border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 13, fontFamily: SANS, cursor: "pointer", background: "none", color: "#6B7280" }}
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving || !date}
            style={{ flex: 2, padding: "10px 0", borderRadius: 6, fontSize: 13, fontFamily: SANS, fontWeight: 600, cursor: "pointer", background: "#1F3A2E", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: saving || !date ? 0.6 : 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49" />
            </svg>
            {saving ? "Guardando…" : "Reprogramar y avisar por WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export function AdminDashboardClient({ stats, role }: { stats: Stats; role: Role }) {
  const [period,         setPeriod]         = useState<Period>("month");
  const [revenue,        setRevenue]        = useState(stats.monthRevenue);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [incoming,       setIncoming]       = useState<IncomingOrder[]>(stats.incomingOrders);
  const [cancelling,     setCancelling]     = useState<string | null>(null);
  const [rescheduleOrder,setRescheduleOrder]= useState<IncomingOrder | null>(null);

  const capacity    = stats.capacityLimit;
  const active      = stats.activeOrders;
  const capPct      = Math.min((active / capacity) * 100, 100);
  const capColor    = active >= capacity ? "#DC2626" : active >= capacity * 0.8 ? "#D97706" : "#2D8A4E";
  const atCapacity  = active >= capacity;

  async function changePeriod(p: Period) {
    setPeriod(p);
    setLoadingRevenue(true);
    try {
      const res = await fetch(`/api/admin/stats?period=${p}`);
      if (res.ok) { const d = await res.json(); setRevenue(d.revenue); }
    } finally { setLoadingRevenue(false); }
  }

  async function cancelOrder(order: IncomingOrder) {
    setCancelling(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", note: "Cancelado por capacidad — contactar para reprogramar" }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Pedido #${order.orderNumber} cancelado`);
      setIncoming((prev) => prev.filter((o) => o.id !== order.id));

      const phone = order.customer?.phone || order.recipientPhone;
      const msg   = `🌸 Hola ${order.recipientName}, te escribimos de Floristería Deco Imperio.\n\nLamentablemente no podemos atender tu pedido *#${order.orderNumber}* en este momento — nuestro taller está al límite de capacidad.\n\nTe invitamos a reprogramarlo para otra fecha y con gusto lo atendemos. Escríbenos y buscamos el día perfecto para ti. ¡Disculpa los inconvenientes!`;
      setTimeout(() => openWhatsApp(phone, msg), 300);
    } catch {
      toast.error("Error al cancelar");
    } finally {
      setCancelling(null);
    }
  }

  function removeFromIncoming(id: string) {
    setIncoming((prev) => prev.filter((o) => o.id !== id));
  }

  const kpis = [
    { label: "Pedidos hoy",   display: String(stats.todayOrders),                                          dot: "#2D8A4E" },
    { label: "Por atender",   display: String(stats.pendingOrders),                                        dot: "#D97706" },
    { label: PERIOD_KPI_LABEL[period], display: loadingRevenue ? "—" : formatCOP(revenue),                dot: "#1F3A2E" },
  ];

  return (
    <div className="flex flex-col gap-5" style={{ fontFamily: SANS }}>

      {/* ── Capacity meter ── */}
      <Card>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Capacidad del taller</p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>Pedidos activos en este momento</p>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: SERIF, fontSize: 32, color: capColor, letterSpacing: "0.02em", lineHeight: 1 }}>{active}</span>
              <span style={{ fontSize: 16, color: "#D1D5DB", fontFamily: SANS }}>/ {capacity}</span>
            </div>
          </div>
          {/* Bar */}
          <div style={{ height: 8, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{ height: "100%", width: `${capPct}%`, background: capColor, borderRadius: 4, transition: "width 0.4s ease" }}
            />
          </div>
          {atCapacity && (
            <div
              className="flex items-center gap-2 mt-3 px-3 py-2"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#DC2626", fontFamily: SANS }}>
                Taller al límite — los nuevos pedidos deben ser cancelados o reprogramados.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* ── Incoming orders panel ── */}
      {incoming.length > 0 && (
        <Card>
          <SectionHead
            title={`🔔 Pedidos entrantes (${incoming.length})`}
            action={
              <span style={{ fontSize: 11, color: atCapacity ? "#DC2626" : "#D97706", fontWeight: 600 }}>
                {atCapacity ? "⚠️ Sin capacidad" : "Pendientes de aceptar"}
              </span>
            }
          />
          <div>
            {incoming.map((order, i) => (
              <div
                key={order.id}
                style={{
                  padding: "14px 20px",
                  borderBottom: i < incoming.length - 1 ? "1px solid #F3F4F6" : "none",
                  background: atCapacity ? "#FFFBFB" : "#fff",
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
                        #{order.orderNumber}
                      </span>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>·</span>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>{order.customer?.name || order.recipientName}</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>·</span>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>{formatDateTime(order.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
                      {order.items.map(i => `${i.productName} ×${i.quantity}`).join(" · ")}
                    </p>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1F3A2E", fontVariantNumeric: "tabular-nums" }}>
                        {formatCOP(Number(order.total))}
                      </span>
                      {order.deliveryDate && (
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                          📅 {new Date(order.deliveryDate).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                          {order.deliveryTime && ` ${order.deliveryTime}`}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                        📞 {order.customer?.phone || order.recipientPhone}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Reschedule */}
                    <button
                      onClick={() => setRescheduleOrder(order)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", border: "1px solid #1F3A2E", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#1F3A2E", background: "#fff", cursor: "pointer", fontFamily: SANS }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Reprogramar
                    </button>

                    {/* Cancel */}
                    <button
                      onClick={() => cancelOrder(order)}
                      disabled={cancelling === order.id}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", border: "1px solid #FECACA", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#DC2626", background: "#FEF2F2", cursor: "pointer", fontFamily: SANS, opacity: cancelling === order.id ? 0.6 : 1 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      {cancelling === order.id ? "Cancelando…" : "Cancelar"}
                    </button>

                    {/* Ver detalle */}
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      style={{ padding: "7px 10px", border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 12, color: "#6B7280", textDecoration: "none", background: "#fff", display: "flex", alignItems: "center" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sync bar */}
      {role === "ADMIN" && (
        <Card>
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Sincronizar con Google Sheets</p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Exporta toda la base de datos a tu hoja de cálculo</p>
            </div>
            <SyncSheetsButton />
          </div>
        </Card>
      )}

      {/* Period filter + KPIs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => changePeriod(p)}
              style={{ fontSize: 12, fontWeight: period === p ? 600 : 400, fontFamily: SANS, letterSpacing: "0.06em", textTransform: "uppercase", padding: "5px 14px", border: "1px solid", borderColor: period === p ? "#1F3A2E" : "#E5E7EB", borderRadius: 4, background: period === p ? "#1F3A2E" : "#fff", color: period === p ? "#fff" : "#6B7280", cursor: "pointer", transition: "all 0.15s" }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <Card key={k.label}>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: k.dot, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280" }}>{k.label}</span>
                </div>
                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: "#111827", lineHeight: 1 }}>
                  {k.display}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <SectionHead
            title="Pedidos recientes"
            action={<Link href="/admin/pedidos" style={{ fontSize: 12, color: "#1F3A2E", fontWeight: 500, textDecoration: "none" }}>Ver todos →</Link>}
          />
          <div>
            {stats.recentOrders.length === 0 ? (
              <p style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>No hay pedidos aún</p>
            ) : (
              stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center gap-4 no-underline transition-colors"
                  style={{ padding: "10px 20px", borderBottom: "1px solid #F3F4F6", display: "flex" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F9FAFB")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <div style={{ width: 76, flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontVariantNumeric: "tabular-nums" }}>#{order.orderNumber}</p>
                    <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{order.customer?.name || order.recipientName}</p>
                    <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }} className="truncate">{order.items[0]?.productName}</p>
                  </div>
                  <div style={{ flexShrink: 0, marginRight: 12 }}>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 13, color: "#111827", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                    {formatCOP(Number(order.total))}
                  </p>
                </Link>
              ))
            )}
          </div>
        </Card>

        {/* Top products */}
        <Card>
          <SectionHead
            title="Más vendidos"
            action={<Link href="/admin/productos" style={{ fontSize: 12, color: "#1F3A2E", fontWeight: 500, textDecoration: "none" }}>Gestionar →</Link>}
          />
          <div>
            {stats.topProducts.length === 0 ? (
              <p style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>No hay productos aún</p>
            ) : (
              stats.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3" style={{ padding: "10px 20px", borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ fontSize: 12, color: "#D1D5DB", width: 14, textAlign: "center", flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ width: 34, height: 34, borderRadius: 4, overflow: "hidden", border: "1px solid #E5E7EB", position: "relative", flexShrink: 0 }}>
                    {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }} className="truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>{p.salesCount} vendidos</span>
                      <span style={{ color: "#E5E7EB" }}>·</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#1F3A2E" }}>{formatCOP(Number(p.basePrice))}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/pedidos?estado=RECEIVED", label: "Nuevos pedidos",     sub: "Pendientes de aceptar", color: "#2D8A4E" },
          { href: "/admin/pedidos?estado=MAKING",   label: "En elaboración",     sub: "En proceso ahora",      color: "#D97706" },
          { href: "/admin/productos/nuevo",          label: "Nuevo producto",     sub: "Agregar al catálogo",   color: "#1F3A2E" },
          { href: "/admin/pos",                      label: "Venta en mostrador", sub: "Registro rápido",       color: "#7C3AED" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col gap-2 no-underline transition-all"
            style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "14px 16px" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = a.color; (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}
          >
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: a.color }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{a.label}</p>
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>{a.sub}</p>
          </Link>
        ))}
      </div>

      {/* Reschedule modal */}
      {rescheduleOrder && (
        <RescheduleModal
          order={rescheduleOrder}
          onClose={() => setRescheduleOrder(null)}
          onDone={removeFromIncoming}
        />
      )}
    </div>
  );
}
