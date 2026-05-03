"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    roles: ["ADMIN", "SELLER"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    roles: ["ADMIN", "SELLER", "FLORIST", "DELIVERY"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: "/admin/productos",
    label: "Productos",
    roles: ["ADMIN", "SELLER"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: "/admin/pos",
    label: "Punto de venta",
    roles: ["ADMIN", "SELLER"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: "/admin/clientes",
    label: "Clientes",
    roles: ["ADMIN", "SELLER"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/reportes",
    label: "Reportes",
    roles: ["ADMIN"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const allowedItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-forest flex-col z-30">
        {/* Brand */}
        <div className="px-6 py-7 border-b border-cream/8">
          <Link href="/" className="flex flex-col">
            <span className="font-serif text-xl text-cream">Deco Imperio</span>
            <span className="text-[10px] uppercase tracking-widest font-sans text-gold/70 mt-0.5">
              Panel de gestión
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
          {allowedItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-sans transition-colors",
                  isActive
                    ? "bg-cream/10 text-cream"
                    : "text-cream/50 hover:text-cream/80 hover:bg-cream/5"
                )}
              >
                <span className={isActive ? "text-terracotta-light" : ""}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-5 border-t border-cream/8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-sans text-cream/40 hover:text-cream/70 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Ver sitio público
          </Link>
        </div>
      </aside>
    </>
  );
}
