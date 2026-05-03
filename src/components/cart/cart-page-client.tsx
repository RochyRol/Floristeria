"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatCOP, SHIPPING_COSTS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CartPageClient() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const [selectedZone, setSelectedZone] = useState("Bello");

  const shippingCost = SHIPPING_COSTS[selectedZone] || 10000;
  const sub = subtotal();
  const total = sub + shippingCost;

  if (items.length === 0) {
    return (
      <div className="pt-28 min-h-screen bg-cream flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-forest/20">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="font-serif text-2xl text-forest">Tu carrito está vacío</h1>
          <p className="mt-2 text-sm font-sans text-forest/55">
            Explora nuestra tienda y encuentra el arreglo perfecto.
          </p>
        </div>
        <Link href="/tienda">
          <Button size="lg">Explorar la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="font-serif text-display-sm text-forest">Mi carrito</h1>
          <p className="text-sm font-sans text-forest/50 mt-1">
            {items.length} {items.length === 1 ? "artículo" : "artículos"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-6 border-b border-forest/8">
                <Link href={`/producto/${item.slug}`} className="relative w-24 h-28 shrink-0 rounded-sm overflow-hidden bg-cream-darker">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link href={`/producto/${item.slug}`}>
                        <h3 className="font-serif text-base text-forest hover:text-terracotta transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-xs font-sans text-forest/50 mt-0.5">{item.sizeLabel}</p>
                      {item.dedication && (
                        <p className="text-xs font-sans text-forest/40 mt-1 italic">
                          &ldquo;{item.dedication}&rdquo;
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-forest/25 hover:text-burgundy transition-colors self-start"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="inline-flex items-center border border-forest/15 rounded-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-forest/55 hover:text-forest transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-sans text-forest">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-forest/55 hover:text-forest transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-serif text-base text-forest price">
                      {formatCOP(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="self-start text-xs font-sans uppercase tracking-brand text-forest/40 hover:text-burgundy transition-colors"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-cream-dark border border-forest/8 rounded-sm p-6 sticky top-28">
              <h2 className="font-serif text-lg text-forest mb-5">Resumen del pedido</h2>

              {/* Shipping zone */}
              <div className="mb-5">
                <label className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/50 block mb-2">
                  Zona de entrega
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full text-sm font-sans text-forest bg-transparent border border-forest/15 rounded-sm px-3 py-2 focus:outline-none focus:border-terracotta"
                >
                  {Object.entries(SHIPPING_COSTS).map(([zone, cost]) => (
                    <option key={zone} value={zone}>
                      {zone} — {formatCOP(cost)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3 py-4 border-y border-forest/8 mb-4">
                <div className="flex justify-between text-sm font-sans text-forest/70">
                  <span>Subtotal</span>
                  <span className="price">{formatCOP(sub)}</span>
                </div>
                <div className="flex justify-between text-sm font-sans text-forest/70">
                  <span>Envío</span>
                  <span className="price">{formatCOP(shippingCost)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-serif text-base text-forest">Total</span>
                <span className="font-serif text-lg text-forest price">{formatCOP(total)}</span>
              </div>

              <Link href="/checkout">
                <Button fullWidth size="lg">
                  Proceder al pago
                </Button>
              </Link>

              <Link href="/tienda">
                <Button fullWidth variant="ghost" size="sm" className="mt-2">
                  Seguir comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
