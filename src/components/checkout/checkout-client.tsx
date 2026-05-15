"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { formatCOP, SHIPPING_COSTS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

const checkoutSchema = z.object({
  buyerName: z.string().min(2, "Ingresa tu nombre completo"),
  buyerEmail: z.string().email("Email inválido"),
  buyerPhone: z.string().min(7, "Teléfono inválido"),
  recipientName: z.string().min(2, "Nombre del destinatario requerido"),
  recipientPhone: z.string().min(7, "Teléfono inválido"),
  deliveryAddress: z.string().min(5, "Dirección requerida"),
  neighborhood: z.string().min(2, "Barrio requerido"),
  city: z.string(),
  deliveryZone: z.string(),
  deliveryDate: z.string().min(1, "Selecciona la fecha de entrega"),
  deliveryTime: z.string().min(1, "Selecciona el horario"),
  cardMessage: z.string().optional(),
  deliveryNotes: z.string().optional(),
  paymentMethod: z.string(),
  sameAsBuyer: z.boolean(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const STEPS = ["Datos", "Entrega", "Pago", "Confirmación"] as const;

const paymentOptions = [
  { value: "CASH_ON_DELIVERY", label: "Pago contra entrega" },
  { value: "BANK_TRANSFER", label: "Transferencia bancaria" },
  { value: "WOMPI", label: "Tarjeta / Wompi" },
  { value: "PSE", label: "PSE" },
];

const timeSlots = [
  { value: "08:30-12:00", label: "Mañana (8:30am – 12:00pm)" },
  { value: "12:00-17:00", label: "Tarde (12:00pm – 5:00pm)" },
  { value: "17:00-20:00", label: "Noche (5:00pm – 8:00pm)" },
];

export function CheckoutClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [mounted, setMounted] = useState(false);

  // Wait until cart hydrates from localStorage before deciding "empty cart" branch.
  // Otherwise the component remounts after hydration and resets step to 0.
  useEffect(() => { setMounted(true); }, []);

  const {
    register,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      buyerName: session?.user?.name || "",
      buyerEmail: session?.user?.email || "",
      buyerPhone: session?.user?.phone || "",
      recipientName: "",
      recipientPhone: "",
      deliveryAddress: "",
      neighborhood: "",
      city: "Medellín",
      deliveryZone: "Bello",
      deliveryDate: "",
      deliveryTime: "",
      cardMessage: "",
      deliveryNotes: "",
      paymentMethod: "CASH_ON_DELIVERY",
      sameAsBuyer: false,
    },
  });

  // Fields each step must validate before advancing
  const STEP_FIELDS: (keyof CheckoutForm)[][] = [
    // Step 0: Datos
    ["buyerName", "buyerEmail", "buyerPhone", "sameAsBuyer", "recipientName", "recipientPhone"],
    // Step 1: Entrega
    ["deliveryAddress", "neighborhood", "city", "deliveryZone", "deliveryDate", "deliveryTime"],
    // Step 2: Pago — final submit
    ["paymentMethod"],
  ];

  async function handleNext() {
    let fields = STEP_FIELDS[step];
    // If destinatario soy yo, skip recipient validation in step 0
    if (step === 0 && getValues("sameAsBuyer")) {
      fields = fields.filter(f => f !== "recipientName" && f !== "recipientPhone");
    }
    const valid = await trigger(fields);
    if (!valid) return;

    if (step < 2) {
      setStep(step + 1);
      return;
    }

    // Final step — submit directly with current form values.
    // (We don't use handleSubmit() because the zodResolver re-validates ALL fields,
    // and with sameAsBuyer logic + optional fields it can fail silently.)
    await onSubmit(getValues());
  }

  const deliveryZone = watch("deliveryZone");
  const sameAsBuyer = watch("sameAsBuyer");
  const shippingCost = SHIPPING_COSTS[deliveryZone] || 10000;
  const sub = subtotal();
  const total = sub + shippingCost;

  // While the cart hydrates from localStorage, render a placeholder.
  // This prevents the SSR (cart=[]) vs client (cart=full) hydration mismatch
  // that was regenerating the React tree and resetting `step` back to 0.
  if (!mounted) {
    return (
      <div className="pt-28 min-h-screen bg-cream flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-forest/20 border-t-forest rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="pt-28 min-h-screen bg-cream flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="font-serif text-2xl text-forest">Tu carrito está vacío</h1>
        <Link href="/tienda">
          <Button>Ver tienda</Button>
        </Link>
      </div>
    );
  }

  async function onSubmit(data: CheckoutForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            productImage: item.image,
            size: item.sizeLabel,
            quantity: item.quantity,
            unitPrice: item.price,
            subtotal: item.price * item.quantity,
            dedication: item.dedication,
          })),
          subtotal: sub,
          shippingCost,
          total,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al procesar el pedido");
      }

      const order = await res.json();
      setOrderNumber(order.orderNumber);
      clearCart();
      setStep(3);

      // Send WhatsApp to the store with the order + tracking link
      const siteUrl = window.location.origin;
      const trackingUrl = `${siteUrl}/seguimiento/${order.orderNumber}`;
      const waMsg = `🌸 *Nuevo pedido ${order.orderNumber}*\n\nCliente: ${data.buyerName}\nTeléfono: ${data.buyerPhone}\nDestinatario: ${data.sameAsBuyer ? data.buyerName : data.recipientName}\n\nVer pedido: ${trackingUrl}`;
      window.open(`https://wa.me/573215039845?text=${encodeURIComponent(waMsg)}`, "_blank");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "No se pudo procesar el pedido");
    } finally {
      setLoading(false);
    }
  }

  // Confirmation step
  if (step === 3) {
    const trackingUrl = `/seguimiento/${orderNumber}`;
    return (
      <div className="pt-28 min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center" style={{ background: "#0E0E0D" }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ fontSize: 56 }}
        >
          🌸
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <p style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A87C3A", fontFamily: "var(--font-manrope, sans-serif)", fontWeight: 600, marginBottom: 10 }}>
            ¡Pedido confirmado!
          </p>
          <h1 style={{ fontFamily: "var(--font-italiana, serif)", fontSize: "clamp(2rem, 6vw, 3.5rem)", color: "#EDE8DF", letterSpacing: "0.04em", lineHeight: 1 }}>
            {orderNumber}
          </h1>
          <p style={{ marginTop: 12, fontSize: 14, color: "rgba(237,232,223,0.72)", fontFamily: "var(--font-manrope, sans-serif)", lineHeight: 1.6 }}>
            Recibimos tu pedido. Te notificaremos<br />por WhatsApp cuando avance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-3 w-full max-w-xs"
        >
          <Link href={trackingUrl} className="w-full">
            <button
              className="w-full py-3 text-center transition-all"
              style={{
                background: "#A87C3A",
                color: "#0E0E0D",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "var(--font-manrope, sans-serif)",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Ver seguimiento del pedido →
            </button>
          </Link>
          <Link href="/tienda" className="w-full">
            <button
              className="w-full py-3 text-center transition-all"
              style={{
                background: "transparent",
                color: "rgba(237,232,223,0.68)",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "var(--font-manrope, sans-serif)",
                border: "1px solid rgba(237,232,223,0.18)",
                cursor: "pointer",
              }}
            >
              Seguir comprando
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.slice(0, 3).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans font-medium transition-colors ${
                  i < step
                    ? "bg-forest text-cream"
                    : i === step
                    ? "bg-terracotta text-cream"
                    : "bg-cream-darker text-forest/30 border border-forest/10"
                }`}
              >
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs uppercase tracking-brand font-sans hidden sm:block ${i === step ? "text-forest" : "text-forest/55"}`}>
                {s}
              </span>
              {i < 2 && <div className="w-8 lg:w-16 h-px bg-forest/10 mx-1" />}
            </div>
          ))}
        </div>

        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form area */}
            <div className="lg:col-span-2">
              <div>
                {/* Step 0: Datos personales */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-6"
                  >
                    <h2 className="font-serif text-xl text-forest">Tus datos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="Nombre completo"
                        {...register("buyerName")}
                        error={errors.buyerName?.message}
                        variant="box"
                      />
                      <Input
                        label="Email"
                        type="email"
                        {...register("buyerEmail")}
                        error={errors.buyerEmail?.message}
                        variant="box"
                      />
                      <Input
                        label="Teléfono"
                        type="tel"
                        {...register("buyerPhone")}
                        error={errors.buyerPhone?.message}
                        variant="box"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sameAsBuyer"
                        {...register("sameAsBuyer")}
                        className="w-4 h-4 rounded-sm border-forest/30 accent-terracotta"
                      />
                      <label htmlFor="sameAsBuyer" className="text-sm font-sans text-forest/70">
                        El destinatario soy yo
                      </label>
                    </div>

                    {!sameAsBuyer && (
                      <div>
                        <h3 className="font-serif text-base text-forest mb-4">Datos del destinatario</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Input
                            label="Nombre del destinatario"
                            {...register("recipientName")}
                            error={errors.recipientName?.message}
                            variant="box"
                          />
                          <Input
                            label="Teléfono del destinatario"
                            type="tel"
                            {...register("recipientPhone")}
                            error={errors.recipientPhone?.message}
                            variant="box"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 1: Entrega */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-5"
                  >
                    <h2 className="font-serif text-xl text-forest">Datos de entrega</h2>
                    <Select
                      label="Zona de entrega"
                      options={Object.entries(SHIPPING_COSTS).map(([k, v]) => ({
                        value: k,
                        label: `${k} — Envío: ${formatCOP(v)}`,
                      }))}
                      {...register("deliveryZone")}
                    />
                    <Input
                      label="Dirección completa"
                      placeholder="Calle 45 # 32-10, Apto 301"
                      {...register("deliveryAddress")}
                      error={errors.deliveryAddress?.message}
                      variant="box"
                    />
                    <div className="grid grid-cols-2 gap-5">
                      <Input
                        label="Barrio"
                        {...register("neighborhood")}
                        error={errors.neighborhood?.message}
                        variant="box"
                      />
                      <Input
                        label="Ciudad"
                        {...register("city")}
                        variant="box"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <Input
                        label="Fecha de entrega"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        {...register("deliveryDate")}
                        error={errors.deliveryDate?.message}
                        variant="box"
                      />
                      <Select
                        label="Horario de entrega"
                        options={timeSlots}
                        {...register("deliveryTime")}
                      />
                    </div>
                    <Textarea
                      label="Mensaje para la tarjeta (opcional)"
                      placeholder="Escribe algo especial..."
                      rows={3}
                      {...register("cardMessage")}
                    />
                    <Textarea
                      label="Indicaciones de entrega (opcional)"
                      placeholder="Ej: Tocar el timbre del apto 201, preguntar por María..."
                      rows={2}
                      {...register("deliveryNotes")}
                    />
                  </motion.div>
                )}

                {/* Step 2: Pago */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-5"
                  >
                    <h2 className="font-serif text-xl text-forest">Método de pago</h2>
                    <div className="flex flex-col gap-3">
                      {paymentOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-4 p-4 rounded-sm border cursor-pointer transition-colors ${
                            watch("paymentMethod") === opt.value
                              ? "border-forest bg-forest/5"
                              : "border-forest/15 hover:border-forest/30"
                          }`}
                        >
                          <input
                            type="radio"
                            value={opt.value}
                            {...register("paymentMethod")}
                            className="accent-terracotta"
                          />
                          <span className="text-sm font-sans text-forest">{opt.label}</span>
                        </label>
                      ))}
                    </div>

                    {watch("paymentMethod") === "BANK_TRANSFER" && (
                      <div className="bg-cream-dark border border-forest/10 rounded-sm p-4 text-sm font-sans text-forest/70">
                        <p className="font-medium text-forest mb-2">Datos para transferencia:</p>
                        <p>Bancolombia · Ahorros · 123-456789-10</p>
                        <p>A nombre de: Floristería Deco Imperio S.A.S</p>
                        <p>NIT: 900.XXX.XXX-X</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-forest/8">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                  >
                    ← Volver
                  </Button>
                ) : (
                  <Link href="/carrito">
                    <Button type="button" variant="ghost">← Carrito</Button>
                  </Link>
                )}
                <Button type="button" size="lg" loading={loading} onClick={handleNext}>
                  {step === 2 ? "Confirmar pedido" : "Continuar →"}
                </Button>
              </div>
            </div>

            {/* Order summary — sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-cream-dark border border-forest/8 rounded-sm p-5 sticky top-28">
                <h3 className="font-serif text-base text-forest mb-4">Tu pedido</h3>
                <div className="flex flex-col gap-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-sm overflow-hidden bg-cream-darker shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-forest text-cream text-[11px] rounded-full flex items-center justify-center font-sans">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-sans text-forest line-clamp-1">{item.name}</p>
                        <p className="text-[11px] font-sans text-forest/60">{item.sizeLabel}</p>
                        <p className="text-xs font-serif text-forest mt-0.5 price">
                          {formatCOP(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t border-forest/8 text-sm font-sans">
                  <div className="flex justify-between text-forest/60">
                    <span>Subtotal</span>
                    <span className="price">{formatCOP(sub)}</span>
                  </div>
                  <div className="flex justify-between text-forest/60">
                    <span>Envío</span>
                    <span className="price">{formatCOP(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-forest pt-2 border-t border-forest/8">
                    <span className="font-serif">Total</span>
                    <span className="font-serif price">{formatCOP(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
