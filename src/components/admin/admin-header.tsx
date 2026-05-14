"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/pedidos": "Pedidos",
  "/admin/productos": "Productos",
  "/admin/pos": "Punto de venta",
  "/admin/clientes": "Clientes",
  "/admin/reportes": "Reportes",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  SELLER: "Vendedor",
  FLORIST: "Florista",
  DELIVERY: "Domiciliario",
};

export function AdminHeader({ session }: { session: Session }) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Admin";
  const role  = session.user?.role ?? "";

  return (
    <header
      className="flex items-center justify-between px-6 lg:px-8"
      style={{
        height: 60,
        background: "#fff",
        borderBottom: "1px solid rgba(31,58,46,0.07)",
        fontFamily: "var(--font-manrope, sans-serif)",
      }}
    >
      {/* Page title */}
      <div className="flex items-center gap-3">
        <span
          style={{
            width: 3,
            height: 18,
            background: "#A87C3A",
            borderRadius: 2,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <h1
          style={{
            fontFamily: "var(--font-italiana, serif)",
            fontSize: 20,
            color: "#1F3A2E",
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right — user + logout */}
      <div className="flex items-center gap-5">
        <div className="hidden sm:flex flex-col items-end gap-0.5">
          <p
            style={{
              fontSize: 13,
              color: "#1F3A2E",
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            {session.user?.name}
          </p>
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#A87C3A",
              lineHeight: 1,
            }}
          >
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>

        {/* Avatar circle */}
        <div
          className="hidden sm:flex items-center justify-center shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(168,124,58,0.12)",
            border: "1px solid rgba(168,124,58,0.3)",
            fontFamily: "var(--font-italiana, serif)",
            fontSize: 14,
            color: "#A87C3A",
          }}
        >
          {session.user?.name?.[0]?.toUpperCase() ?? "A"}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 transition-colors"
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(31,58,46,0.4)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-manrope, sans-serif)",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#1F3A2E")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(31,58,46,0.4)")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Salir
        </button>
      </div>
    </header>
  );
}
