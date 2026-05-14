"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/admin":           "Dashboard",
  "/admin/pedidos":   "Pedidos",
  "/admin/productos": "Productos",
  "/admin/pos":       "Punto de venta",
  "/admin/clientes":  "Clientes",
  "/admin/reportes":  "Reportes",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN:    "Administrador",
  SELLER:   "Vendedor",
  FLORIST:  "Florista",
  DELIVERY: "Domiciliario",
};

export function AdminHeader({ session }: { session: Session }) {
  const pathname = usePathname();
  const title    = PAGE_TITLES[pathname] ?? "Admin";
  const role     = session.user?.role ?? "";

  return (
    <header
      className="flex items-center justify-between px-6 lg:px-8"
      style={{
        height: 56,
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        fontFamily: "var(--font-manrope, sans-serif)",
      }}
    >
      <h1 style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="hidden sm:flex flex-col items-end" style={{ lineHeight: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
            {session.user?.name}
          </span>
          <span style={{ fontSize: 10, color: "#9CA3AF", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>

        {/* Avatar */}
        <div
          className="hidden sm:flex items-center justify-center shrink-0"
          style={{
            width: 30, height: 30,
            borderRadius: "50%",
            background: "#F0FDF4",
            border: "1.5px solid #BBF7D0",
            fontSize: 12,
            fontWeight: 700,
            color: "#1F3A2E",
          }}
        >
          {session.user?.name?.[0]?.toUpperCase() ?? "A"}
        </div>

        <div style={{ width: 1, height: 20, background: "#E5E7EB" }} />

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 transition-colors"
          style={{ fontSize: 12, color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#111827")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#6B7280")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Salir
        </button>
      </div>
    </header>
  );
}
