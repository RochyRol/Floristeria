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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    href: "/admin/pos",
    label: "Punto de venta",
    roles: ["ADMIN", "SELLER"],
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    href: "/admin/clientes",
    label: "Clientes",
    roles: ["ADMIN", "SELLER"],
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const allowed = navItems.filter((i) => i.roles.includes(role));

  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[220px] flex-col z-30"
      style={{
        background: "#fff",
        borderRight: "1px solid #E5E7EB",
        fontFamily: "var(--font-manrope, sans-serif)",
      }}
    >
      {/* Brand */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <Link href="/" className="flex flex-col gap-0.5 no-underline">
          <span style={{ fontFamily: "var(--font-italiana, serif)", fontSize: 19, color: "#111827", letterSpacing: "0.06em", lineHeight: 1 }}>
            Deco · Imperio
          </span>
          <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9CA3AF" }}>
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-0.5">
        {allowed.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md no-underline transition-colors"
              style={{
                background:  isActive ? "#F0FDF4" : "transparent",
                color:       isActive ? "#1F3A2E" : "#4B5563",
                fontWeight:  isActive ? 600 : 400,
                fontSize:    13,
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ color: isActive ? "#1F3A2E" : "#9CA3AF", flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: "1px solid #E5E7EB" }}>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-md no-underline transition-colors"
          style={{ fontSize: 13, color: "#9CA3AF" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#374151"; (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Ver sitio público
        </Link>
      </div>
    </aside>
  );
}
