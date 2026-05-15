"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    roles: ["ADMIN", "SELLER"],
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    roles: ["ADMIN", "SELLER", "FLORIST", "DELIVERY"],
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    href: "/admin/productos",
    label: "Productos",
    roles: ["ADMIN", "SELLER"],
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    href: "/admin/pos",
    label: "Punto de venta",
    roles: ["ADMIN", "SELLER"],
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    href: "/admin/clientes",
    label: "Clientes",
    roles: ["ADMIN", "SELLER"],
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: "/admin/reportes",
    label: "Reportes",
    roles: ["ADMIN"],
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const allowed  = navItems.filter((i) => i.roles.includes(role));

  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[220px] flex-col z-30"
      style={{ background: "#FAFAF9", borderRight: "1px solid #E5E7EB", fontFamily: "var(--font-manrope, sans-serif)" }}
    >
      {/* Brand */}
      <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid #E5E7EB" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontFamily: "var(--font-italiana, serif)", fontSize: 20, color: "#111827", letterSpacing: "0.08em", lineHeight: 1 }}>
            Deco · Imperio
          </span>
          <span style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#A87C3A", marginTop: 3 }}>
            Panel de gestión
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
        {allowed.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#1F3A2E" : "#4B5563",
                background: isActive ? "#EDF2EF" : "transparent",
                borderLeft: isActive ? "2px solid #1F3A2E" : "2px solid transparent",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "#F3F4F6";
                  (e.currentTarget as HTMLElement).style.color = "#1F3A2E";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#4B5563";
                }
              }}
            >
              <span style={{ color: isActive ? "#1F3A2E" : "#9CA3AF", flexShrink: 0, transition: "color 0.15s" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "10px 10px 14px", borderTop: "1px solid #E5E7EB" }}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", fontSize: 12, color: "#9CA3AF", textDecoration: "none", transition: "all 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#1F3A2E"; (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Ver sitio público
        </Link>
      </div>
    </aside>
  );
}
