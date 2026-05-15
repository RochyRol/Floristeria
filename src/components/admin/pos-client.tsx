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

type Mode = "catalog" | "custom";

function getTrackingPath(orderNumber: string): string {
  return `/seguimiento/${orderNumber}`;
}

function getTrackingUrl(orderNumber: string): string {
  if (typeof window === "undefined") return getTrackingPath(orderNumber);
  // Forzar el protocolo actual (http en desarrollo) para evitar que el navegador
  // intente conectar por https a localhost al pegar el URL.
  const { protocol, host } = window.location;
  return `${protocol}//${host}${getTrackingPath(orderNumber)}`;
}

function showOrderSuccessToast(
  orderNumber: string,
  opts?: { description?: string }
) {
  const url = getTrackingUrl(orderNumber);
  toast.success(`Pedido registrado: ${orderNumber}`, {
    description: opts?.description
      ? `${opts.description} · ${url}`
      : url,
    action: {
      label: "Abrir",
      onClick: () => {
        // Abrir directamente con el protocolo correcto en una nueva pestaña
        // evita que el navegador autocomplete https al pegar localhost.
        window.open(url, "_blank", "noopener");
      },
    },
    cancel: {
      label: "Copiar link",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Link copiado al portapapeles");
        } catch {
          toast.error("No se pudo copiar el link");
        }
      },
    },
    duration: 15000,
  });
}

export function PosClient({ products }: { products: PosProduct[] }) {
  const [mode, setMode] = useState<Mode>("catalog");

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl text-forest">Punto de venta</h1>
        <div className="inline-flex border border-forest/15 rounded-sm overflow-hidden">
          <button
            onClick={() => setMode("catalog")}
            className={`px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] font-sans font-medium transition-colors ${
              mode === "catalog"
                ? "bg-forest text-cream"
                : "bg-cream text-forest/40 hover:text-forest/70"
            }`}
          >
            Catálogo
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] font-sans font-medium transition-colors border-l border-forest/15 ${
              mode === "custom"
                ? "bg-forest text-cream"
                : "bg-cream text-forest/40 hover:text-forest/70"
            }`}
          >
            Personalizado
          </button>
        </div>
      </div>

      {mode === "catalog" ? (
        <CatalogMode products={products} />
      ) : (
        <CustomMode />
      )}
    </div>
  );
}

/* ---------- Modo catálogo (lógica original) ---------- */

function CatalogMode({ products }: { products: PosProduct[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("POS_CASH");
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
          items: cart.map((i) => ({
            productId: i.id,
            productName: i.name,
            productImage: i.images[0],
            quantity: i.quantity,
            unitPrice: i.basePrice,
            subtotal: i.basePrice * i.quantity,
          })),
          recipientName: customerName || "Cliente mostrador",
          recipientPhone: "—",
          deliveryAddress: "Mostrador — Av 33 No. 54-52",
          subtotal,
          shippingCost: 0,
          total: subtotal,
          paymentMethod: payment,
        }),
      });
      if (!res.ok) throw new Error();
      const order = await res.json();
      showOrderSuccessToast(order.orderNumber, {
        description:
          payment === "POS_CASH" && cashGiven
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
    <div className="flex gap-4 flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm font-sans border border-forest/15 rounded-sm bg-white focus:outline-none focus:border-forest/40 placeholder:text-forest/30"
        />
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
              Sin resultados para &quot;{search}&quot;
            </div>
          )}
        </div>
      </div>

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
                  <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 rounded border border-forest/15 text-forest/50 text-xs hover:border-forest/40 transition-colors flex items-center justify-center">−</button>
                  <span className="w-5 text-center text-xs font-sans text-forest">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 rounded border border-forest/15 text-forest/50 text-xs hover:border-forest/40 transition-colors flex items-center justify-center">+</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-forest/8 p-4 flex flex-col gap-3">
          <Input label="Cliente (opcional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre del cliente" />
          <PaymentSelector value={payment} onChange={setPayment} />
          {payment === "POS_CASH" && (
            <Input label="Efectivo recibido" type="number" value={cashGiven} onChange={(e) => setCashGiven(e.target.value)} placeholder="0" />
          )}
          <div className="flex justify-between items-center pt-1 border-t border-forest/8">
            <span className="text-xs font-sans font-medium text-forest/60">Total</span>
            <span className="font-serif text-lg text-forest price">{formatCOP(subtotal)}</span>
          </div>
          {payment === "POS_CASH" && cashGiven && Number(cashGiven) >= subtotal && (
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-forest/50">Cambio</span>
              <span className="text-forest font-medium price">{formatCOP(change)}</span>
            </div>
          )}
          <Button className="w-full" onClick={handleSell} loading={submitting} disabled={!cart.length}>
            Registrar venta
          </Button>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs font-sans text-center text-forest/30 hover:text-burgundy transition-colors">
              Vaciar carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Modo personalizado ---------- */

function CustomMode() {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [payment, setPayment] = useState("POS_CASH");
  const [submitting, setSubmitting] = useState(false);

  const priceNum = Number(price) || 0;

  async function handleSubmit() {
    if (description.trim().length < 3) {
      return toast.error("La descripción debe tener al menos 3 caracteres");
    }
    if (priceNum <= 0) {
      return toast.error("El precio debe ser mayor a 0");
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              productName: description.trim(),
              quantity: 1,
              unitPrice: priceNum,
              subtotal: priceNum,
            },
          ],
          recipientName: customerName || "Cliente mostrador",
          recipientPhone: customerPhone || "—",
          deliveryAddress: "Mostrador — Av 33 No. 54-52",
          deliveryDate,
          subtotal: priceNum,
          shippingCost: 0,
          total: priceNum,
          paymentMethod: payment,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(err.error || "Error al registrar");
      }
      const order = await res.json();
      showOrderSuccessToast(order.orderNumber);
      setDescription("");
      setPrice("");
      setCustomerName("");
      setCustomerPhone("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-4 flex-1 overflow-hidden">
      <div className="flex-1 bg-white border border-forest/8 rounded-sm p-5 flex flex-col gap-4 overflow-y-auto">
        <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
          Detalles del arreglo
        </p>
        <div>
          <label className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/40 block mb-1.5">
            Descripción del arreglo
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Ramo de rosas rojas con girasoles, papel kraft, moño dorado..."
            rows={4}
            className="w-full px-3 py-2 text-sm font-sans text-forest border border-forest/15 rounded-sm bg-white focus:outline-none focus:border-forest/40 placeholder:text-forest/30 resize-none"
          />
        </div>
        <Input
          label="Precio"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
        />
        <Input
          label="Fecha de entrega"
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
        />
      </div>

      <div className="w-72 flex flex-col bg-white border border-forest/8 rounded-sm overflow-hidden flex-shrink-0">
        <div className="px-4 py-3 border-b border-forest/8">
          <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
            Cliente y pago
          </p>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3">
          <Input
            label="Nombre del cliente"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Opcional"
          />
          <Input
            label="Teléfono"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Opcional"
          />
          <PaymentSelector value={payment} onChange={setPayment} />
        </div>
        <div className="border-t border-forest/8 p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-sans font-medium text-forest/60">Total</span>
            <span className="font-serif text-lg text-forest price">
              {formatCOP(priceNum)}
            </span>
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!description.trim() || priceNum <= 0}
          >
            Registrar pedido
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Selector de método de pago (compartido) ---------- */

function PaymentSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const methods = [
    { v: "POS_CASH", label: "Efectivo" },
    { v: "POS_CARD", label: "Tarjeta" },
    { v: "BANK_TRANSFER", label: "Transferencia" },
  ];
  return (
    <div>
      <p className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/40 mb-1.5">
        Método de pago
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {methods.map((m) => (
          <button
            key={m.v}
            onClick={() => onChange(m.v)}
            className={`py-1.5 text-[11px] font-sans rounded-sm border transition-colors ${
              value === m.v
                ? "bg-forest text-cream border-forest"
                : "bg-white text-forest/50 border-forest/15 hover:border-forest/40"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
