"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-cream shadow-editorial flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-forest/8">
              <div>
                <h2 className="font-serif text-xl text-forest">Tu carrito</h2>
                <p className="text-xs font-sans text-forest/50 mt-0.5">
                  {itemCount()} {itemCount() === 1 ? "artículo" : "artículos"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar carrito"
                className="w-9 h-9 flex items-center justify-center text-forest/50 hover:text-forest rounded-sm transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="text-forest/20">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-serif text-lg text-forest">Tu carrito está vacío</p>
                    <p className="text-sm font-sans text-forest/50 mt-1">
                      Explora nuestra tienda y encuentra el arreglo perfecto.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/tienda">Ver tienda</Link>
                  </Button>
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden bg-cream-dark">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm text-forest leading-snug line-clamp-2">
                          {item.name}
                        </p>
                        {item.sizeLabel && (
                          <p className="text-xs font-sans text-forest/50 mt-0.5">{item.sizeLabel}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 border border-forest/15 rounded-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-forest/60 hover:text-forest transition-colors"
                            >
                              −
                            </button>
                            <span className="text-sm font-sans w-6 text-center text-forest">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-forest/60 hover:text-forest transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-serif text-sm text-forest price">
                            {formatCOP(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Eliminar"
                        className="self-start mt-0.5 text-forest/30 hover:text-burgundy transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-forest/8 px-6 py-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-sans text-forest/70">Subtotal</span>
                  <span className="font-serif text-lg text-forest price">{formatCOP(subtotal())}</span>
                </div>
                <p className="text-xs font-sans text-forest/40">
                  El costo de envío se calculará en el checkout.
                </p>
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  <Button fullWidth size="lg">
                    Continuar al checkout
                  </Button>
                </Link>
                <Link href="/carrito" onClick={() => setOpen(false)}>
                  <Button fullWidth variant="ghost" size="sm">
                    Ver carrito completo
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
