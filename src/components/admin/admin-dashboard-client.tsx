"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCOP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import { SyncSheetsButton } from "@/components/admin/sync-sheets-button";
import type { Role } from "@prisma/client";

const SANS  = "var(--font-manrope, sans-serif)";

type Period = "day" | "week" | "month" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  day:   "Hoy",
  week:  "Semana",
  month: "Mes",
  year:  "Año",
};

const PERIOD_KPI_LABEL: Record<Period, string> = {
  day:   "Ingresos hoy",
  week:  "Ingresos semana",
  month: "Ingresos del mes",
  year:  "Ingresos del año",
};

interface Stats {
  todayOrders: number;
  pendingOrders: number;
  monthRevenue: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date;
    recipientName: string;
    customer: { name: string } | null;
    items: { productName: string }[];
  }[];
  topProducts: {
    id: string;
    name: string;
    salesCount: number;
    basePrice: number;
    images: string[];
  }[];
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8 }}
    >
      {children}
    </div>
  );
}

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{ borderBottom: "1px solid #F3F4F6" }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: SANS }}>{title}</p>
      {action}
    </div>
  );
}

const NUM = {
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 30,
  letterSpacing: "-0.03em",
  fontVariantNumeric: "tabular-nums",
  color: "#111827",
  lineHeight: 1,
} as const;

export function AdminDashboardClient({ stats, role }: { stats: Stats; role: Role }) {
  const [period, setPeriod] = useState<Period>("month");
  const [revenue, setRevenue] = useState(stats.monthRevenue);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  async function changePeriod(p: Period) {
    setPeriod(p);
    setLoadingRevenue(true);
    try {
      const res = await fetch(`/api/admin/stats?period=${p}`);
      if (res.ok) {
        const data = await res.json();
        setRevenue(data.revenue);
      }
    } finally {
      setLoadingRevenue(false);
    }
  }

  const kpis = [
    {
      label: "Pedidos hoy",
      display: String(stats.todayOrders),
      dot: "#2D8A4E",
    },
    {
      label: "Por atender",
      display: String(stats.pendingOrders),
      dot: "#D97706",
    },
    {
      label: PERIOD_KPI_LABEL[period],
      display: loadingRevenue ? "—" : formatCOP(revenue),
      dot: "#1F3A2E",
    },
  ];

  return (
    <div className="flex flex-col gap-5" style={{ fontFamily: SANS }}>

      {/* Sync bar */}
      {role === "ADMIN" && (
        <Card>
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Sincronizar con Google Sheets</p>
              <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Exporta toda la base de datos a tu hoja de cálculo</p>
            </div>
            <SyncSheetsButton />
          </div>
        </Card>
      )}

      {/* Period filter + KPIs */}
      <div className="flex flex-col gap-3">
        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => changePeriod(p)}
              style={{
                fontSize: 12,
                fontWeight: period === p ? 600 : 400,
                fontFamily: SANS,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "5px 14px",
                border: "1px solid",
                borderColor: period === p ? "#1F3A2E" : "#E5E7EB",
                borderRadius: 4,
                background: period === p ? "#1F3A2E" : "#fff",
                color: period === p ? "#fff" : "#6B7280",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <Card key={k.label}>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: k.dot, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280" }}>
                    {k.label}
                  </span>
                </div>
                <p style={NUM}>{k.display}</p>
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
            action={
              <Link href="/admin/pedidos" style={{ fontSize: 12, color: "#1F3A2E", fontWeight: 500, textDecoration: "none" }}>
                Ver todos →
              </Link>
            }
          />
          <div>
            {stats.recentOrders.length === 0 ? (
              <p style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>
                No hay pedidos aún
              </p>
            ) : (
              stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center gap-4 transition-colors no-underline"
                  style={{ padding: "10px 20px", borderBottom: "1px solid #F3F4F6", display: "flex" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F9FAFB")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <div style={{ width: 76, flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontVariantNumeric: "tabular-nums" }}>#{order.orderNumber}</p>
                    <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                      {order.customer?.name || order.recipientName}
                    </p>
                    <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }} className="truncate">
                      {order.items[0]?.productName}
                    </p>
                  </div>
                  <div style={{ flexShrink: 0, marginRight: 12 }}>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 13, color: "#111827", flexShrink: 0, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
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
            action={
              <Link href="/admin/productos" style={{ fontSize: 12, color: "#1F3A2E", fontWeight: 500, textDecoration: "none" }}>
                Gestionar →
              </Link>
            }
          />
          <div>
            {stats.topProducts.length === 0 ? (
              <p style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>
                No hay productos aún
              </p>
            ) : (
              stats.topProducts.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3"
                  style={{ padding: "10px 20px", borderBottom: "1px solid #F3F4F6" }}
                >
                  <span style={{ fontSize: 12, color: "#D1D5DB", width: 14, textAlign: "center", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                  <div style={{ width: 34, height: 34, borderRadius: 4, overflow: "hidden", border: "1px solid #E5E7EB", position: "relative", flexShrink: 0 }}>
                    {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }} className="truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span style={{ fontSize: 12, color: "#9CA3AF", fontVariantNumeric: "tabular-nums" }}>{p.salesCount} vendidos</span>
                      <span style={{ color: "#E5E7EB" }}>·</span>
                      <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 13, color: "#1F3A2E", fontVariantNumeric: "tabular-nums" }}>{formatCOP(Number(p.basePrice))}</span>
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
          { href: "/admin/pedidos?estado=RECEIVED",  label: "Nuevos pedidos",     sub: "Pendientes de aceptar", color: "#2D8A4E" },
          { href: "/admin/pedidos?estado=MAKING",     label: "En elaboración",     sub: "En proceso ahora",      color: "#D97706" },
          { href: "/admin/productos/nuevo",           label: "Nuevo producto",     sub: "Agregar al catálogo",   color: "#1F3A2E" },
          { href: "/admin/pos",                       label: "Venta en mostrador", sub: "Registro rápido",       color: "#7C3AED" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col gap-2 transition-all no-underline"
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
    </div>
  );
}
