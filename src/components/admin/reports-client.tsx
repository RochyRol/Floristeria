"use client";

import Image from "next/image";
import { formatCOP, ORDER_STATUS_LABELS } from "@/lib/utils";

/* ── Design tokens ──────────────────────────── */
const F   = "var(--font-manrope, sans-serif)";
const FS  = "var(--font-italiana, serif)";
const INK = "#111827";
const MUT = "#6B7280";
const DIM = "#9CA3AF";
const BDR = "#E5E7EB";
const BG  = "#F7F5F2";
const WH  = "#FFFFFF";
const GRN = "#1F3A2E";
const GLD = "#A87C3A";
const RED = "#DC2626";

/* ── Types ──────────────────────────────────── */
interface DayData   { label: string; total: number; count: number }
interface MonthData { label: string; total: number }
interface TopProduct { id: string; name: string; salesCount: number; basePrice: number; images: string[] }
interface StatusCount { status: string; count: number }

interface ReportData {
  thisMonthRevenue: number;  lastMonthRevenue: number;
  thisMonthOrders: number;   lastMonthOrders: number;
  thisWeekOrders: number;    lastWeekOrders: number;
  totalClients: number;      newClientsMonth: number;
  allTimeRevenue: number;    avgTicketMonth: number;
  revenueByMonth: MonthData[];
  revenueByDay: DayData[];
  topProducts: TopProduct[];
  statusCounts: StatusCount[];
  deliveredCount: number;    cancelledCount: number;
  completionRate: number;    totalOrderCount: number;
}

/* ── Helpers ────────────────────────────────── */
function pct(cur: number, prev: number) {
  if (prev === 0) return cur > 0 ? "+100%" : "—";
  const p = ((cur - prev) / prev) * 100;
  return `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`;
}
function isUp(cur: number, prev: number) { return cur >= prev; }

/* ── Bar ────────────────────────────────────── */
function Bar({ value, max, color = GRN, label, sublabel }: { value: number; max: number; color?: string; label: string; sublabel?: string }) {
  const h = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 group relative">
      <div className="w-full flex items-end" style={{ height: 80 }}>
        <div
          className="w-full rounded-t-sm transition-all duration-500 relative"
          style={{ height: `${h}%`, background: color, minHeight: value > 0 ? 3 : 0, opacity: 0.85 }}
        >
          {value > 0 && (
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
              style={{ fontSize: 10, color: INK, fontFamily: F, background: WH, border: `1px solid ${BDR}`, padding: "2px 6px", zIndex: 10 }}
            >
              {sublabel || formatCOP(value)}
            </div>
          )}
        </div>
      </div>
      <span style={{ fontSize: 9, color: DIM, fontFamily: F, letterSpacing: "0.04em" }}>{label}</span>
    </div>
  );
}

/* ── KPI Card ───────────────────────────────── */
function KpiCard({ label, value, delta, deltaLabel, up, accent = false }: {
  label: string; value: string; delta?: string; deltaLabel?: string; up?: boolean; accent?: boolean;
}) {
  return (
    <div style={{ background: WH, border: `1px solid ${BDR}`, padding: "20px 20px 18px" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: DIM, fontFamily: F, marginBottom: 10 }}>
        {label}
      </p>
      <p style={{ fontFamily: FS, fontSize: 28, color: accent ? GLD : INK, lineHeight: 1, letterSpacing: "0.02em", marginBottom: 8 }}>
        {value}
      </p>
      {delta && (
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 11, fontFamily: F, fontWeight: 600, color: up ? GRN : RED }}>
            {delta}
          </span>
          {deltaLabel && (
            <span style={{ fontSize: 11, fontFamily: F, color: DIM }}>{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Section title ──────────────────────────── */
function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-5">
      <div>
        <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: DIM, fontFamily: F, marginBottom: 2 }}>
          {children}
        </p>
        {sub && <p style={{ fontSize: 12, color: MUT, fontFamily: F }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────── */
export function ReportsClient({ data }: { data: ReportData }) {
  const maxMonth = Math.max(...data.revenueByMonth.map(m => m.total), 1);
  const maxDay   = Math.max(...data.revenueByDay.map(d => d.total), 1);
  const maxDayCount = Math.max(...data.revenueByDay.map(d => d.count), 1);
  const totalStatus = data.statusCounts.reduce((s, c) => s + c.count, 0);

  const statusColors: Record<string, string> = {
    RECEIVED: "#3B82F6", ACCEPTED: "#8B5CF6", MAKING: "#F59E0B",
    READY: "#10B981", IN_ROUTE: "#6366F1", DELIVERED: GRN, CANCELLED: RED,
  };

  return (
    <div style={{ fontFamily: F }}>

      {/* ── Page header ── */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM, marginBottom: 4 }}>Panel de análisis</p>
          <h1 style={{ fontFamily: FS, fontSize: 30, color: INK, letterSpacing: "0.04em", lineHeight: 1 }}>Reportes</h1>
        </div>
        <p style={{ fontSize: 11, color: DIM }}>
          {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* ── KPI row 1 — revenue ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <KpiCard
          label="Ingresos este mes"
          value={formatCOP(data.thisMonthRevenue)}
          delta={pct(data.thisMonthRevenue, data.lastMonthRevenue)}
          deltaLabel="vs mes anterior"
          up={isUp(data.thisMonthRevenue, data.lastMonthRevenue)}
          accent
        />
        <KpiCard
          label="Pedidos este mes"
          value={data.thisMonthOrders.toString()}
          delta={pct(data.thisMonthOrders, data.lastMonthOrders)}
          deltaLabel="vs mes anterior"
          up={isUp(data.thisMonthOrders, data.lastMonthOrders)}
        />
        <KpiCard
          label="Pedidos esta semana"
          value={data.thisWeekOrders.toString()}
          delta={pct(data.thisWeekOrders, data.lastWeekOrders)}
          deltaLabel="vs semana anterior"
          up={isUp(data.thisWeekOrders, data.lastWeekOrders)}
        />
        <KpiCard
          label="Ticket promedio (mes)"
          value={formatCOP(data.avgTicketMonth)}
          deltaLabel="por pedido este mes"
        />
      </div>

      {/* ── KPI row 2 — operations ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiCard
          label="Ingresos totales"
          value={formatCOP(data.allTimeRevenue)}
          deltaLabel="histórico acumulado"
          accent
        />
        <KpiCard
          label="Tasa de entrega"
          value={`${data.completionRate}%`}
          delta={`${data.deliveredCount} entregados`}
          up={data.completionRate > 70}
        />
        <KpiCard
          label="Clientes registrados"
          value={data.totalClients.toString()}
          delta={`+${data.newClientsMonth}`}
          deltaLabel="este mes"
          up={data.newClientsMonth > 0}
        />
        <KpiCard
          label="Pedidos cancelados"
          value={data.cancelledCount.toString()}
          delta={data.totalOrderCount > 0 ? `${Math.round((data.cancelledCount / data.totalOrderCount) * 100)}% del total` : "0%"}
          up={false}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Revenue 12 months */}
        <div style={{ background: WH, border: `1px solid ${BDR}`, padding: "20px 20px 16px", gridColumn: "span 2" }}>
          <SectionTitle sub="Últimos 12 meses — sin cancelados">
            Ingresos por mes
          </SectionTitle>
          {data.revenueByMonth.every(m => m.total === 0) ? (
            <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: DIM, fontSize: 13 }}>
              Sin datos aún
            </div>
          ) : (
            <div className="flex items-end gap-1" style={{ height: 96 }}>
              {data.revenueByMonth.map((m) => (
                <Bar key={m.label} value={m.total} max={maxMonth} label={m.label} color={GRN} />
              ))}
            </div>
          )}
        </div>

        {/* Estado de pedidos */}
        <div style={{ background: WH, border: `1px solid ${BDR}`, padding: "20px 20px 16px" }}>
          <SectionTitle>Estado de pedidos</SectionTitle>
          {data.statusCounts.length === 0 ? (
            <p style={{ fontSize: 13, color: DIM, textAlign: "center", paddingTop: 24 }}>Sin datos</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.statusCounts
                .sort((a, b) => b.count - a.count)
                .map((s) => {
                  const pctVal = totalStatus > 0 ? (s.count / totalStatus) * 100 : 0;
                  const color  = statusColors[s.status] || MUT;
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontFamily: F, color: MUT }}>
                            {ORDER_STATUS_LABELS[s.status] ?? s.status}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, fontFamily: FS, color: INK, letterSpacing: "0.04em" }}>
                          {s.count}
                        </span>
                      </div>
                      <div style={{ height: 3, background: BDR, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: color, width: `${pctVal}%`, transition: "width 0.5s ease", opacity: 0.7 }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* ── Last 7 days ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Revenue last 7 days */}
        <div style={{ background: WH, border: `1px solid ${BDR}`, padding: "20px 20px 16px" }}>
          <SectionTitle sub="Ingresos diarios — últimos 7 días">
            Ingresos por día
          </SectionTitle>
          <div className="flex items-end gap-2" style={{ height: 80 }}>
            {data.revenueByDay.map((d) => (
              <Bar key={d.label} value={d.total} max={maxDay} label={d.label} color={GLD} />
            ))}
          </div>
        </div>

        {/* Orders last 7 days */}
        <div style={{ background: WH, border: `1px solid ${BDR}`, padding: "20px 20px 16px" }}>
          <SectionTitle sub="Pedidos por día — últimos 7 días">
            Pedidos por día
          </SectionTitle>
          <div className="flex items-end gap-2" style={{ height: 80 }}>
            {data.revenueByDay.map((d) => (
              <Bar key={d.label} value={d.count} max={maxDayCount} label={d.label} color="#6366F1" sublabel={`${d.count} pedidos`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Top products ── */}
      <div style={{ background: WH, border: `1px solid ${BDR}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${BDR}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: DIM, fontFamily: F }}>
            Productos más vendidos
          </p>
          <p style={{ fontSize: 10, color: DIM, fontFamily: F, letterSpacing: "0.08em" }}>
            UNIDADES · INGRESO EST.
          </p>
        </div>

        {data.topProducts.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", fontSize: 13, color: DIM }}>
            Sin ventas registradas aún.
          </div>
        ) : (
          <div>
            {data.topProducts.map((p, i) => {
              const maxSales = data.topProducts[0]?.salesCount || 1;
              const barWidth = (p.salesCount / maxSales) * 100;
              const estimated = p.salesCount * Number(p.basePrice);
              return (
                <div
                  key={p.id}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < data.topProducts.length - 1 ? `1px solid ${BDR}` : "none", position: "relative" }}
                >
                  {/* rank */}
                  <span style={{ fontFamily: FS, fontSize: 16, color: i < 3 ? GLD : DIM, width: 22, textAlign: "right", flexShrink: 0 }}>
                    {i + 1}
                  </span>

                  {/* image */}
                  <div style={{ width: 38, height: 38, overflow: "hidden", flexShrink: 0, background: BG, position: "relative" }}>
                    {p.images[0] && (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                    )}
                  </div>

                  {/* name + bar */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontFamily: F, fontWeight: 500, color: INK, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </p>
                    <div style={{ height: 3, background: BDR, overflow: "hidden", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${barWidth}%`, background: i === 0 ? GLD : GRN, opacity: 0.6, transition: "width 0.5s ease" }} />
                    </div>
                  </div>

                  {/* stats */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: FS, fontSize: 18, color: INK, lineHeight: 1, letterSpacing: "0.02em" }}>
                      {p.salesCount}
                    </p>
                    <p style={{ fontSize: 10, fontFamily: F, color: DIM, marginTop: 2 }}>
                      ≈ {formatCOP(estimated)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${BDR}`, display: "flex", justifyContent: "flex-end", gap: 32, background: BG }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: DIM, fontFamily: F, marginBottom: 2 }}>Total unidades vendidas</p>
            <p style={{ fontFamily: FS, fontSize: 18, color: INK }}>
              {data.topProducts.reduce((s, p) => s + p.salesCount, 0)}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: DIM, fontFamily: F, marginBottom: 2 }}>Ingreso estimado top 8</p>
            <p style={{ fontFamily: FS, fontSize: 18, color: GLD }}>
              {formatCOP(data.topProducts.reduce((s, p) => s + p.salesCount * Number(p.basePrice), 0))}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
