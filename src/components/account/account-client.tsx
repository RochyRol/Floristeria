"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { formatCOP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/ui/badge";
import { OrderProgress } from "@/components/ui/order-progress";
import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface StatusHistory {
  id: string;
  status: string;
  note: string | null;
  timestamp: Date;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  deliveryDate: Date | null;
  recipientName: string;
  items: OrderItem[];
  statusHistory: StatusHistory[];
}

interface AccountClientProps {
  session: Session;
  orders: Order[];
}


export function AccountClient({ session, orders }: AccountClientProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  return (
    <div className="pt-24 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-display-sm text-forest">
              Hola, {session.user?.name?.split(" ")[0]}
            </h1>
            <p className="text-sm font-sans text-forest/50 mt-1">{session.user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Cerrar sesión
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-forest/10 mb-8">
          {[
            { key: "orders", label: "Mis pedidos" },
            { key: "profile", label: "Mis datos" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "orders" | "profile")}
              className={`pb-3 text-sm font-sans uppercase tracking-brand border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? "border-terracotta text-forest"
                  : "border-transparent text-forest/40 hover:text-forest/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-5">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-serif text-xl text-forest/40">Aún no tienes pedidos</p>
                <a href="/tienda" className="mt-4 inline-block text-sm font-sans text-terracotta underline">
                  Explorar la tienda
                </a>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-cream-dark border border-forest/8 rounded-sm overflow-hidden"
                >
                  {/* Order header */}
                  <button
                    onClick={() =>
                      setExpandedOrder(expandedOrder === order.id ? null : order.id)
                    }
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-cream-darker/50 transition-colors"
                  >
                    <div className="flex items-center gap-5">
                      <div>
                        <p className="text-xs font-sans uppercase tracking-brand text-forest/40">
                          Pedido
                        </p>
                        <p className="text-sm font-sans font-medium text-forest mt-0.5">
                          #{order.orderNumber}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-xs font-sans text-forest/40">Fecha</p>
                        <p className="text-sm font-sans text-forest/70">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-sans text-forest/40">Total</p>
                        <p className="font-serif text-sm text-forest price">
                          {formatCOP(Number(order.total))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                        className={`text-forest/40 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="border-t border-forest/8"
                    >
                      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Status progress */}
                        <div>
                          <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
                              Estado del pedido
                            </h3>
                            <Link
                              href={`/seguimiento/${order.orderNumber}`}
                              className="text-xs font-sans text-terracotta hover:underline"
                            >
                              Ver seguimiento →
                            </Link>
                          </div>
                          <OrderProgress status={order.status} compact />
                          {order.statusHistory.length > 0 && (
                            <div className="mt-5 flex flex-col gap-1.5">
                              {order.statusHistory.slice(-3).map((entry) => (
                                <div key={entry.id} className="flex items-baseline gap-2">
                                  <span className="text-xs font-sans text-forest/70 font-medium">
                                    {ORDER_STATUS_LABELS[entry.status] ?? entry.status}
                                  </span>
                                  <span className="text-[10px] font-sans text-forest/30">
                                    {formatDateTime(entry.timestamp)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Items */}
                        <div>
                          <h3 className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40 mb-4">
                            Artículos
                          </h3>
                          <div className="flex flex-col gap-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex gap-3">
                                <div className="relative w-12 h-12 rounded-sm overflow-hidden bg-cream-darker shrink-0">
                                  {item.productImage && (
                                    <Image
                                      src={item.productImage}
                                      alt={item.productName}
                                      fill
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-sans text-forest">{item.productName}</p>
                                  <p className="text-xs font-sans text-forest/40">
                                    {item.size} · Cant: {item.quantity}
                                  </p>
                                  <p className="text-xs font-serif text-forest/70 price">
                                    {formatCOP(Number(item.subtotal))}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-4 border-t border-forest/8 flex justify-between">
                            <span className="text-sm font-sans text-forest/60">Total pagado</span>
                            <span className="font-serif text-base text-forest price">
                              {formatCOP(Number(order.total))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="max-w-md">
            <div className="flex flex-col gap-5">
              <div className="bg-cream-dark border border-forest/8 rounded-sm p-6 flex flex-col gap-4">
                <h3 className="font-serif text-base text-forest">Información personal</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] uppercase tracking-brand font-sans text-forest/40">Nombre</p>
                  <p className="text-sm font-sans text-forest">{session.user?.name}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] uppercase tracking-brand font-sans text-forest/40">Email</p>
                  <p className="text-sm font-sans text-forest">{session.user?.email}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] uppercase tracking-brand font-sans text-forest/40">Rol</p>
                  <p className="text-sm font-sans text-forest capitalize">{session.user?.role?.toLowerCase()}</p>
                </div>
              </div>

              {["ADMIN", "SELLER", "FLORIST", "DELIVERY"].includes(session.user?.role || "") && (
                <a href="/admin">
                  <Button fullWidth variant="outline">
                    Ir al panel de administración
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
