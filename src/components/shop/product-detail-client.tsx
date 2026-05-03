"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { formatCOP, getProductWhatsAppUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

interface ProductSize {
  id: string;
  label: string;
  price: number;
  description?: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  basePrice: string | number;
  images: string[];
  specifications: Record<string, string> | null;
  sizes: ProductSize[] | null;
  featured: boolean;
  category: { name: string } | null;
  occasions: { occasion: { name: string; slug: string } }[];
}

interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  basePrice: string | number;
  images: string[];
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: RelatedProduct[];
}

const defaultSizes: ProductSize[] = [
  { id: "sencillo", label: "Sencillo", price: 0.75, description: "Arreglo más compacto y delicado" },
  { id: "standard", label: "Estándar", price: 1, description: "Tamaño clásico y generoso" },
  { id: "premium", label: "Premium", price: 1.5, description: "Nuestro arreglo más espectacular" },
];

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState("standard");
  const [quantity, setQuantity] = useState(1);
  const [dedication, setDedication] = useState("");
  const [showDedication, setShowDedication] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const sizes = (product.sizes as ProductSize[] | null) || defaultSizes;
  const selectedSize = sizes.find((s) => s.id === selectedSizeId) || sizes[1];

  const basePrice = Number(product.basePrice);
  const currentPrice = Math.round(basePrice * (selectedSize.price <= 2 && selectedSize.price > 0 ? selectedSize.price : 1));

  const images =
    product.images.length > 0
      ? product.images
      : [
          "https://images.unsplash.com/photo-1548199569-3e1c6aa8f469?w=800&q=85&fit=crop",
          "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=85&fit=crop",
          "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=85&fit=crop",
        ];

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: images[0],
      size: selectedSizeId,
      sizeLabel: selectedSize.label,
      price: currentPrice,
      quantity,
      dedication: dedication || undefined,
    });
    toast.success(`"${product.name}" agregado al carrito`, {
      action: { label: "Ver carrito", onClick: () => setCartOpen(true) },
    });
  }

  const specs = product.specifications as Record<string, string> | null;

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-5 border-b border-forest/8">
        <nav className="flex items-center gap-2 text-xs font-sans text-forest/40">
          <Link href="/" className="hover:text-forest transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/tienda" className="hover:text-forest transition-colors">Tienda</Link>
          {product.occasions[0] && (
            <>
              <span>/</span>
              <Link
                href={`/tienda?ocasion=${product.occasions[0].occasion.slug}`}
                className="hover:text-forest transition-colors"
              >
                {product.occasions[0].occasion.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-forest/70">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square rounded-sm overflow-hidden bg-cream-darker"
            >
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.featured && (
                <div className="absolute top-4 left-4">
                  <span className="badge bg-gold/90 text-cacao">Destacado</span>
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-sm overflow-hidden transition-all ${
                      i === activeImage
                        ? "ring-2 ring-terracotta ring-offset-2 ring-offset-cream"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
              {product.occasions[0] && (
                <p className="text-xs uppercase tracking-brand font-sans font-medium text-terracotta mb-2">
                  {product.occasions[0].occasion.name}
                </p>
              )}
              <h1 className="font-serif text-display-sm text-forest">{product.name}</h1>
              {product.tagline && (
                <p className="mt-2 text-base font-sans text-forest/60 italic">{product.tagline}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl text-forest price">{formatCOP(currentPrice)}</span>
              {selectedSizeId !== "standard" && (
                <span className="text-sm font-sans text-forest/40 line-through price">
                  {formatCOP(basePrice)}
                </span>
              )}
            </div>

            {/* Size selector */}
            <div>
              <p className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/50 mb-3">
                Tamaño del arreglo
              </p>
              <div className="flex gap-3">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`flex-1 py-3 px-2 text-center rounded-sm border transition-all duration-200 ${
                      selectedSizeId === size.id
                        ? "border-forest bg-forest text-cream"
                        : "border-forest/20 text-forest/70 hover:border-forest/50"
                    }`}
                  >
                    <span className="text-xs font-sans font-medium uppercase tracking-brand block">
                      {size.label}
                    </span>
                    <span className="text-xs font-sans block mt-0.5 opacity-70">
                      {formatCOP(Math.round(basePrice * (size.price <= 2 && size.price > 0 ? size.price : 1)))}
                    </span>
                  </button>
                ))}
              </div>
              {selectedSize.description && (
                <p className="mt-2 text-xs font-sans text-forest/45">{selectedSize.description}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/50 mb-2">
                  Cantidad
                </p>
                <div className="inline-flex items-center border border-forest/20 rounded-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-forest/60 hover:text-forest transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-sans font-medium text-forest">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-forest/60 hover:text-forest transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-sm font-sans text-forest/50">
                Total:{" "}
                <span className="font-serif text-forest price">{formatCOP(currentPrice * quantity)}</span>
              </div>
            </div>

            {/* Dedication toggle */}
            <div className="border border-forest/10 rounded-sm">
              <button
                onClick={() => setShowDedication(!showDedication)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-sans text-forest/70 hover:text-forest transition-colors"
              >
                <span className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Agregar dedicatoria personalizada
                </span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className={`transition-transform ${showDedication ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {showDedication && (
                <div className="px-4 pb-4">
                  <Textarea
                    placeholder="Escribe aquí tu mensaje de corazón..."
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    rows={3}
                    maxLength={200}
                    hint={`${dedication.length}/200 caracteres`}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button fullWidth size="lg" onClick={handleAddToCart}>
                Agregar al carrito
              </Button>
              <a
                href={getProductWhatsAppUrl(product.name, currentPrice)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button fullWidth variant="whatsapp" size="lg" icon={<WhatsAppIcon />}>
                  Pedir por WhatsApp
                </Button>
              </a>
            </div>

            {/* Shipping info */}
            <div className="flex flex-col gap-2 pt-2 border-t border-forest/8">
              {[
                { icon: "🚚", text: "Domicilio a Bello, Niquía, Copacabana y norte de Medellín" },
                { icon: "⏰", text: "Entrega el mismo día si pides antes de las 5:00pm" },
                { icon: "🌸", text: "Flores frescas de alto corte garantizadas" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <span className="text-base leading-snug">{item.icon}</span>
                  <p className="text-xs font-sans text-forest/55 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description & Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 pt-12 border-t border-forest/8">
          <div>
            <h2 className="font-serif text-xl text-forest mb-4">Descripción</h2>
            <div className="prose-editorial">
              <p>{product.description}</p>
            </div>
          </div>

          {specs && Object.keys(specs).length > 0 && (
            <div>
              <h2 className="font-serif text-xl text-forest mb-4">Detalles del arreglo</h2>
              <dl className="flex flex-col gap-3">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex gap-3">
                    <dt className="text-xs font-sans uppercase tracking-brand text-forest/40 w-32 shrink-0 pt-0.5">
                      {key}
                    </dt>
                    <dd className="text-sm font-sans text-forest/70">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-forest/8">
            <h2 className="font-serif text-display-sm text-forest mb-8">También te puede gustar</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/producto/${p.slug}`} className="group">
                  <div className="relative aspect-[3/4] rounded-sm overflow-hidden mb-3 bg-cream-darker">
                    <Image
                      src={p.images[0] || "https://images.unsplash.com/photo-1548199569-3e1c6aa8f469?w=400&q=80"}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-serif text-sm text-forest group-hover:text-terracotta transition-colors">
                    {p.name}
                  </h3>
                  <p className="font-serif text-sm text-forest/70 mt-1 price">{formatCOP(Number(p.basePrice))}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
