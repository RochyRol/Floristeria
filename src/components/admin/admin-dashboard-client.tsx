"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCOP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import { SyncSheetsButton } from "@/components/admin/sync-sheets-button";
import type { Role } from "@prisma/client";

/* ── tokens ── */
const GOLD  = "#A87C3A";
const F     = "#1F3A2E";       /* forest */
const FM    = "rgba(31,58,46,0.45)";
const FL    = "rgba(31,58,46,0.12)";
const CARD  = "#FFFFFF";
const BG    = "#F7F4EF";
const SERIF = "var(--font-italiana, serif)";
const SANS  = "var(--font-manrope, sans-serif)";

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

const kpiConfig = [
  {
    key: "todayOrders" as const,
    label: "Pedidos hoy",
    accent: "#2D8A4E",
    accentBg: "rgba(45,138,78,0.08)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    key: "pendingOrders" as const,
    label: "Por atender",
    accent: "#A87C3A",
    accentBg: "rgba(168,124,58,0.08)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    key: "monthRevenue" as const,
    label: "Ingresos del mes",
    accent: "#1F3A2E",
    accentBg: "rgba(31,58,46,0.07)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
];

export function AdminDashboardClient({ stats, role }: { stats: Stats; role: Role }) {
  return (
    <div className="flex flex-col gap-7">

      {/* Google Sheets sync bar */}
      {role === "ADMIN" && (
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ background: CARD, border: `1px solid ${FL}`, borderLeft: `3px solid ${GOLD}` }}
        >
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, fontFamily: SANS, marginBottom: 2 }}>
              Google Sheets
            </p>
            <p style={{ fontSize: 13, color: FM, fontFamily: SANS }}>
              Sincroniza la base de datos completa a tu hoja de cálculo
            </p>
          </div>
          <SyncSheetsButton />
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpiConfig.map((kpi) => {
          const raw = stats[kpi.key];
          const display = kpi.key === "monthRevenue" ? formatCOP(raw as number) : String(raw);
          return (
            <div
              key={kpi.key}
              style={{
                background: CARD,
                border: `1px solid ${FL}`,
                borderTop: `3px solid ${kpi.accent}`,
                padding: "20px 22px",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: FM, fontFamily: SANS }}>
                  {kpi.label}
                </p>
                <div
                  style={{
                    width: 30, height: 30,
                    background: kpi.accentBg,
                    color: kpi.accent,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {kpi.icon}
                </div>
              </div>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: kpi.key === "monthRevenue" ? 22 : 36,
                  color: F,
                  lineHeight: 1,
                  letterSpacing: "0.02em",
                }}
              >
                {display}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main content: orders + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent orders */}
        <div className="lg:col-span-2" style={{ background: CARD, border: `1px solid ${FL}` }}>
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: `1px solid ${FL}` }}
          >
            <p style={{ fontFamily: SERIF, fontSize: 16, color: F, letterSpacing: "0.04em" }}>
              Pedidos recientes
            </p>
            <Link
              href="/admin/pedidos"
              style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontFamily: SANS, textDecoration: "none" }}
            >
              Ver todos →
            </Link>
          </div>

          <div>
            {stats.recentOrders.length === 0 ? (
              <p style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: FM, fontFamily: SANS }}>
                No hay pedidos aún
              </p>
            ) : (
              stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center gap-4 transition-colors"
                  style={{
                    padding: "12px 20px",
                    borderBottom: `1px solid ${FL}`,
                    textDecoration: "none",
                    display: "flex",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F7F4EF")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  {/* Order number */}
                  <div style={{ width: 80, flexShrink: 0 }}>
                    <p style={{ fontSize: 12, fontFamily: SANS, fontWeight: 600, color: F }}>
                      #{order.orderNumber}
                    </p>
                    <p style={{ fontSize: 10, fontFamily: SANS, color: FM, marginTop: 1 }}>
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  {/* Customer + product */}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 12, fontFamily: SANS, color: F, fontWeight: 500 }}>
                      {order.customer?.name || order.recipientName}
                    </p>
                    <p style={{ fontSize: 11, fontFamily: SANS, color: FM, marginTop: 1 }} className="truncate">
                      {order.items[0]?.productName}
                    </p>
                  </div>

                  {/* Status */}
                  <div style={{ flexShrink: 0, marginRight: 12 }}>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  {/* Total */}
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <p style={{ fontFamily: SERIF, fontSize: 14, color: F, letterSpacing: "0.02em" }}>
                      {formatCOP(Number(order.total))}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Top products */}
        <div style={{ background: CARD, border: `1px solid ${FL}` }}>
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: `1px solid ${FL}` }}
          >
            <p style={{ fontFamily: SERIF, fontSize: 16, color: F, letterSpacing: "0.04em" }}>
              Más vendidos
            </p>
            <Link
              href="/admin/productos"
              style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontFamily: SANS, textDecoration: "none" }}
            >
              Gestionar →
            </Link>
          </div>

          <div>
            {stats.topProducts.length === 0 ? (
              <p style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: FM, fontFamily: SANS }}>
                No hay productos aún
              </p>
            ) : (
              stats.topProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3"
                  style={{ padding: "11px 20px", borderBottom: `1px solid ${FL}` }}
                >
                  <span style={{ fontSize: 11, fontFamily: SANS, color: FM, width: 16, flexShrink: 0, textAlign: "center" }}>
                    {i + 1}
                  </span>
                  <div
                    className="relative overflow-hidden shrink-0"
                    style={{ width: 36, height: 36, border: `1px solid ${FL}` }}
                  >
                    {product.images[0] && (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 12, fontFamily: SANS, color: F, fontWeight: 500 }} className="truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p style={{ fontSize: 10, fontFamily: SANS, color: FM }}>
                        {product.salesCount} vendidos
                      </p>
                      <span style={{ color: FL }}>·</span>
                      <p style={{ fontSize: 11, fontFamily: SERIF, color: GOLD, letterSpacing: "0.02em" }}>
                        {formatCOP(Number(product.basePrice))}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/pedidos?estado=RECEIVED",   label: "Nuevos pedidos",      sub: "Por aceptar",       color: "#2D8A4E" },
          { href: "/admin/pedidos?estado=MAKING",      label: "En elaboración",      sub: "En proceso",        color: GOLD      },
          { href: "/admin/productos/nuevo",            label: "Nuevo producto",      sub: "Agregar al catálogo", color: F        },
          { href: "/admin/pos",                        label: "Venta en mostrador",  sub: "Punto de venta",    color: "#7A3D4C" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col gap-2 transition-colors group"
            style={{
              background: CARD,
              border: `1px solid ${FL}`,
              padding: "16px 18px",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = a.color)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = FL)}
          >
            <span
              style={{
                display: "inline-block",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: a.color,
              }}
            />
            <p style={{ fontSize: 12, fontFamily: SANS, color: F, fontWeight: 500, lineHeight: 1.3 }}>
              {a.label}
            </p>
            <p style={{ fontSize: 10, fontFamily: SANS, color: FM, letterSpacing: "0.04em" }}>
              {a.sub}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
