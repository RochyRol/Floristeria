"use client";

import { useState } from "react";
import { toast } from "sonner";

type Period = "week" | "month" | "year";
type Format = "xlsx" | "pdf";

const PERIODS: { value: Period; label: string }[] = [
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "year", label: "Este año" },
];

const REPORTS: {
  id: "ventas" | "clientes";
  title: string;
  description: string;
}[] = [
  {
    id: "ventas",
    title: "Reporte de Ventas",
    description: "Ingresos, pedidos y productos más vendidos",
  },
  {
    id: "clientes",
    title: "Reporte de Clientes",
    description: "Clientes nuevos, recurrentes y ranking de compras",
  },
];

export function DownloadReportsSection() {
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleDownload(report: "ventas" | "clientes", format: Format) {
    const key = `${report}-${format}`;
    setLoading(key);
    const t = toast.loading(`Generando ${format.toUpperCase()}…`);
    try {
      const res = await fetch(
        `/api/admin/reports/${report}?period=${period}&format=${format}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error" }));
        toast.error(err.error || "Error al generar reporte", { id: t });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disp = res.headers.get("Content-Disposition") ?? "";
      const match = disp.match(/filename="?([^"]+)"?/);
      a.download = match?.[1] ?? `reporte-${report}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Reporte descargado", { id: t });
    } catch (err) {
      toast.error("Error de red", { id: t, description: String(err) });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white border border-forest/8 rounded-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-forest/8 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
          Descargar reportes
        </p>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-xs font-sans rounded-sm border transition-colors ${
                period === p.value
                  ? "bg-forest text-cream border-forest"
                  : "bg-white text-forest/60 border-forest/15 hover:border-forest/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-forest/5">
        {REPORTS.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-4 px-5 py-4 flex-wrap"
          >
            <div>
              <p className="text-sm font-sans font-medium text-forest">{r.title}</p>
              <p className="text-xs font-sans text-forest/45 mt-0.5">
                {r.description}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(r.id, "xlsx")}
                disabled={loading !== null}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-forest text-cream text-[11px] uppercase tracking-[0.14em] font-sans font-medium hover:bg-forest-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm"
              >
                <DownloadIcon spinning={loading === `${r.id}-xlsx`} />
                Excel
              </button>
              <button
                onClick={() => handleDownload(r.id, "pdf")}
                disabled={loading !== null}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-forest border border-forest/20 text-[11px] uppercase tracking-[0.14em] font-sans font-medium hover:border-forest/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm"
              >
                <DownloadIcon spinning={loading === `${r.id}-pdf`} />
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DownloadIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={spinning ? "animate-spin" : ""}
    >
      {spinning ? (
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      ) : (
        <>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </>
      )}
    </svg>
  );
}
