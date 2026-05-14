"use client";

import { useState } from "react";
import { toast } from "sonner";

export function SyncSheetsButton() {
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    const t = toast.loading("Sincronizando con Google Sheets…");
    try {
      const res = await fetch("/api/admin/sync-sheets", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        toast.error(data.error || "Error al sincronizar", { id: t });
        return;
      }

      const synced = data.synced;
      const total = Object.values(synced as Record<string, number>).reduce((a, b) => a + b, 0);
      toast.success(`Sincronizados ${total} registros en ${Object.keys(synced).length} hojas`, {
        id: t,
        description: `Pedidos: ${synced.orders} · Productos: ${synced.products} · Usuarios: ${synced.users}`,
      });
      setLastSync(new Date().toLocaleTimeString("es-CO"));
    } catch (err) {
      toast.error("Error de red", { id: t, description: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-cream text-xs uppercase tracking-[0.16em] font-sans font-medium hover:bg-forest-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={loading ? "animate-spin" : ""}
        >
          {loading ? (
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          ) : (
            <>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
              <polyline points="7.5 19.79 7.5 14.6 3 12" />
              <polyline points="21 12 16.5 14.6 16.5 19.79" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </>
          )}
        </svg>
        {loading ? "Sincronizando…" : "Sincronizar Sheets"}
      </button>
      {lastSync && (
        <span className="text-xs font-sans text-forest/40">
          Última: {lastSync}
        </span>
      )}
    </div>
  );
}
