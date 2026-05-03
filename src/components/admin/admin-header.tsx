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

export function AdminHeader({ session }: { session: Session }) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Admin";

  return (
    <header className="bg-white border-b border-forest/8 px-6 lg:px-8 h-16 flex items-center justify-between">
      <h1 className="font-serif text-lg text-forest">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-sm font-sans font-medium text-forest">{session.user?.name}</p>
          <p className="text-[10px] font-sans uppercase tracking-brand text-forest/40">
            {session.user?.role?.toLowerCase()}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-xs font-sans uppercase tracking-brand text-forest/50 hover:text-forest transition-colors"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
