"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCOP } from "@/lib/utils";

interface PosProduct {
  id: string;
  name: string;
  basePrice: number;
  images: string[];
  stock: number;
  category: { name: string } | null;
}

interface CartItem extends PosProduct {
  quantity: number;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Efectivo" },
  { value: "CARD", label: "Tarjeta" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "NEQUI", label: "Nequi / Daviplata" },
];

export function PosClient({ products }: { products: PosProduct[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("CASH");
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cashGiven, setCashGiven] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(product: PosProduct) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  const subtotal = cart.reduce((s, i) => s + i.basePrice * i.quantity, 0);
  const change = Number(cashGiven) - subtotal;

  async function handleSell() {
    if (!cart.length) return toast.error("El carrito está vacío");
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.basePrice })),
          recipientName: customerName || "Cliente mostrador",
          recipientPhone: "—",
          deliveryAddress: "Mostrador — Av 33 No. 54-52",
          deliveryZone: "PICKUP",
          subtotal,
          deliveryCost: 0,
          total: subtotal,
          paymentMethod: payment,
          isPosOrder: true,
        }),
      });
      if (!res.ok) throw new Error();
      const order = await res.json();
      toast.success(`Venta registrada: ${order.orderNumber}`, {
        description: payment === "CASH" && cashGiven
          ? `Cambio: ${formatCOP(change)}`
          : undefined,
      });
      setCart([]);
      setCustomerName("");
      setCashGiven("");
    } catch {
      toast.error("Error al registrar la venta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Product grid */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-xl text-forest">Punto de venta</h1>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans border border-forest/15 rounded-sm bg-white focus:outline-none focus:border-forest/40 placeholder:text-forest/30"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white border border-forest/8 rounded-sm p-2 text-left hover:border-forest/30 hover:shadow-card transition-all group"
            >
              <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-cream-darker mb-2">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-forest/20 text-2xl">🌸</div>
                )}
              </div>
              <p className="text-xs font-sans font-medium text-forest line-clamp-2 mb-1">{p.name}</p>
              <p className="font-serif text-sm text-forest price">{formatCOP(p.basePrice)}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 py-12 text-center text-sm font-sans text-forest/40">
              Sin resultados para "{search}"
            </div>
          )}
        </div>
      </div>

      {/* Cart / checkout */}
      <div className="w-72 flex flex-col bg-white border border-forest/8 rounded-sm overflow-hidden flex-shrink-0">
        <div className="px-4 py-3 border-b border-forest/8">
          <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
            Carrito ({cart.length})
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-forest/5">
          {cart.length === 0 ? (
            <div className="p-6 text-center text-xs font-sans text-forest/30">
              Toca un producto para agregar
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-4 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-sans font-medium text-forest truncate">{item.name}</p>
                  <p className="text-[11px] font-sans text-forest/50 price">{formatCOP(item.basePrice)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-5 h-5 rounded border border-forest/15 text-forest/50 text-xs hover:border-forest/40 transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-xs font-sans text-forest">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-5 h-5 rounded border border-forest/15 text-forest/50 text-xs hover:border-forest/40 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-forest/8 p-4 flex flex-col gap-3">
          <Input
            label="Cliente (opcional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nombre del cliente"
          />

          <div>
            <p className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/40 mb-1.5">
              Método de pago
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setPayment(m.value)}
                  className={`py-1.5 text-[11px] font-sans rounded-sm border transition-colors ${
                    payment === m.value
                      ? "bg-forest text-cream border-forest"
                      : "bg-white text-forest/50 border-forest/15 hover:border-forest/40"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {payment === "CASH" && (
            <Input
              label="Efectivo recibido"
              type="number"
              value={cashGiven}
              onChange={(e) => setCashGiven(e.target.value)}
              placeholder="0"
            />
          )}

          <div className="flex justify-between items-center pt-1 border-t border-forest/8">
            <span className="text-xs font-sans font-medium text-forest/60">Total</span>
            <span className="font-serif text-lg text-forest price">{formatCOP(subtotal)}</span>
          </div>

          {payment === "CASH" && cashGiven && Number(cashGiven) >= subtotal && (
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-forest/50">Cambio</span>
              <span className="text-forest font-medium price">{formatCOP(change)}</span>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSell}
            loading={submitting}
            disabled={!cart.length}
          >
            Registrar venta
          </Button>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs font-sans text-center text-forest/30 hover:text-burgundy transition-colors"
            >
              Vaciar carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
