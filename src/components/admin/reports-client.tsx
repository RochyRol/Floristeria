"use client";

import Image from "next/image";
import { formatCOP } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import { DownloadReportsSection } from "./download-reports-section";

interface MonthData {
  label: string;
  total: number;
}

interface TopProduct {
  id: string;
  name: string;
  salesCount: number;
  basePrice: number;
  images: string[];
}

interface StatusCount {
  status: string;
  count: number;
}

interface ReportData {
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  thisMonthOrders: number;
  lastMonthOrders: number;
  totalClients: number;
  revenueByMonth: MonthData[];
  topProducts: TopProduct[];
  statusCounts: StatusCount[];
}

function pctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function isPositive(current: number, previous: number) {
  return current >= previous;
}

export function ReportsClient({ data }: { data: ReportData }) {
  const maxRevenue = Math.max(...data.revenueByMonth.map((m) => m.total), 1);
  const totalStatusOrders = data.statusCounts.reduce((s, c) => s + c.count, 0);

  const kpis = [
    {
      label: "Ingresos este mes",
      value: formatCOP(data.thisMonthRevenue),
      sub: pctChange(data.thisMonthRevenue, data.lastMonthRevenue),
      positive: isPositive(data.thisMonthRevenue, data.lastMonthRevenue),
    },
    {
      label: "Pedidos este mes",
      value: data.thisMonthOrders.toString(),
      sub: pctChange(data.thisMonthOrders, data.lastMonthOrders),
      positive: isPositive(data.thisMonthOrders, data.lastMonthOrders),
    },
    {
      label: "Clientes registrados",
      value: data.totalClients.toString(),
      sub: "total acumulado",
      positive: true,
    },
    {
      label: "Ticket promedio",
      value:
        data.thisMonthOrders > 0
          ? formatCOP(data.thisMonthRevenue / data.thisMonthOrders)
          : formatCOP(0),
      sub: "este mes",
      positive: true,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl text-forest">Reportes</h1>
        <p className="text-sm font-sans text-forest/50 mt-1">
          Resumen de desempeño del negocio
        </p>
      </div>

      <DownloadReportsSection />

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-white border border-forest/8 rounded-sm p-5 flex flex-col gap-2"
          >
            <p className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/40">
              {k.label}
            </p>
            <p className="font-serif text-2xl text-forest price">{k.value}</p>
            <p
              className={`text-xs font-sans font-medium ${
                k.positive ? "text-forest/60" : "text-burgundy"
              }`}
            >
              {k.sub} vs mes anterior
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Revenue bar chart */}
        <div className="col-span-2 bg-white border border-forest/8 rounded-sm p-5">
          <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40 mb-6">
            Ingresos últimos 12 meses
          </p>
          {data.revenueByMonth.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm font-sans text-forest/30">
              Sin datos aún
            </div>
          ) : (
            <div className="flex items-end gap-1.5 h-40">
              {data.revenueByMonth.map((m) => {
                const heightPct = maxRevenue > 0 ? (m.total / maxRevenue) * 100 : 0;
                return (
                  <div
                    key={m.label}
                    className="flex-1 flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-full relative flex items-end" style={{ height: "120px" }}>
                      <div
                        className="w-full bg-forest/15 group-hover:bg-forest/40 rounded-t-sm transition-all duration-300 relative"
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                        title={formatCOP(m.total)}
                      >
                        {m.total > 0 && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-sans text-forest/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatCOP(m.total)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] font-sans text-forest/30">{m.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status distribution */}
        <div className="bg-white border border-forest/8 rounded-sm p-5">
          <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40 mb-4">
            Pedidos por estado
          </p>
          <div className="flex flex-col gap-2.5">
            {data.statusCounts.length === 0 ? (
              <p className="text-sm font-sans text-forest/30 py-4 text-center">
                Sin datos
              </p>
            ) : (
              data.statusCounts.map((s) => {
                const pct =
                  totalStatusOrders > 0
                    ? Math.round((s.count / totalStatusOrders) * 100)
                    : 0;
                return (
                  <div key={s.status}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-sans text-forest/60">
                        {ORDER_STATUS_LABELS[s.status] ?? s.status}
                      </span>
                      <span className="text-xs font-sans font-medium text-forest">
                        {s.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-forest/8 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest/40 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white border border-forest/8 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-forest/8">
          <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
            Productos más vendidos
          </p>
        </div>
        <div className="divide-y divide-forest/5">
          {data.topProducts.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm font-sans text-forest/40">
              Sin ventas registradas aún.
            </div>
          ) : (
            data.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-sm font-serif text-forest/30 w-5 text-right">
                  {i + 1}
                </span>
                <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-cream-darker flex-shrink-0">
                  {p.images[0] && (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-medium text-forest truncate">
                    {p.name}
                  </p>
                  <p className="text-xs font-sans text-forest/40 price">
                    {formatCOP(p.basePrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-sans font-medium text-forest">
                    {p.salesCount}
                  </p>
                  <p className="text-[10px] font-sans text-forest/40 uppercase tracking-brand">
                    ventas
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
