"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCOP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import type { Role } from "@prisma/client";

interface Stats {
  todayOrders: number;
  pendingOrders: number;
  monthRevenue: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date;
    recipientName: string;
    customer: { name: string } | null;
    items: { productName: string }[];
  }[];
  topProducts: {
    id: string;
    name: string;
    salesCount: number;
    basePrice: number;
    images: string[];
  }[];
}

export function AdminDashboardClient({ stats, role }: { stats: Stats; role: Role }) {
  const kpis = [
    {
      label: "Pedidos hoy",
      value: stats.todayOrders,
      color: "bg-terracotta/10 text-terracotta",
      icon: "📦",
    },
    {
      label: "Por atender",
      value: stats.pendingOrders,
      color: "bg-gold/10 text-cacao",
      icon: "⏳",
    },
    {
      label: "Ingresos del mes",
      value: formatCOP(stats.monthRevenue),
      color: "bg-forest/10 text-forest",
      icon: "💰",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-forest/8 rounded-sm p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-sm flex items-center justify-center text-2xl ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-brand font-sans text-forest/40">{kpi.label}</p>
              <p className="font-serif text-2xl text-forest mt-0.5">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white border border-forest/8 rounded-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-forest/8">
            <h2 className="font-serif text-base text-forest">Pedidos recientes</h2>
            <Link
              href="/admin/pedidos"
              className="text-xs font-sans uppercase tracking-brand text-forest/40 hover:text-forest transition-colors"
            >
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-forest/5">
            {stats.recentOrders.length === 0 ? (
              <p className="px-5 py-8 text-sm font-sans text-forest/40 text-center">
                No hay pedidos aún
              </p>
            ) : (
              stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-sans font-medium text-forest">
                        #{order.orderNumber}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs font-sans text-forest/50 mt-0.5">
                      {order.customer?.name || order.recipientName} ·{" "}
                      {order.items[0]?.productName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-sm text-forest price">
                      {formatCOP(Number(order.total))}
                    </p>
                    <p className="text-[10px] font-sans text-forest/40 mt-0.5">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white border border-forest/8 rounded-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-forest/8">
            <h2 className="font-serif text-base text-forest">Top productos</h2>
            <Link
              href="/admin/productos"
              className="text-xs font-sans uppercase tracking-brand text-forest/40 hover:text-forest transition-colors"
            >
              Gestionar →
            </Link>
          </div>
          <div className="divide-y divide-forest/5">
            {stats.topProducts.length === 0 ? (
              <p className="px-5 py-8 text-sm font-sans text-forest/40 text-center">
                No hay productos aún
              </p>
            ) : (
              stats.topProducts.map((product, i) => (
                <div key={product.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="text-xs font-sans text-forest/30 w-4">{i + 1}</span>
                  <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-cream-darker shrink-0">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans text-forest line-clamp-1">{product.name}</p>
                    <p className="text-xs font-sans text-forest/40 mt-0.5">
                      {product.salesCount} vendidos · {formatCOP(Number(product.basePrice))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/pedidos?estado=RECEIVED", label: "Nuevos pedidos", icon: "📬" },
          { href: "/admin/pedidos?estado=PROCESSING", label: "En proceso", icon: "🌷" },
          { href: "/admin/productos/nuevo", label: "Nuevo producto", icon: "+" },
          { href: "/admin/pos", label: "Venta en mostrador", icon: "💳" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white border border-forest/8 rounded-sm p-4 flex flex-col items-center gap-2 hover:border-forest/25 hover:bg-cream/30 transition-colors text-center"
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-xs font-sans uppercase tracking-brand text-forest/60">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
