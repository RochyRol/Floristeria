"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { formatCOP } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  basePrice: string | number;
  images: string[];
  featured?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  index?: number;
  variant?: "default" | "compact" | "feature";
  priority?: boolean;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=85&auto=format&fit=crop";

// Curated, verified Unsplash images mapped by product slug
const SLUG_IMAGE_MAP: Record<string, string> = {
  "rojo-eterno": "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&q=85&auto=format&fit=crop",
  "pasion-de-medianoche": "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=900&q=85&auto=format&fit=crop",
  "susurro-de-petalos": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=85&auto=format&fit=crop",
  "amor-en-box": "https://images.unsplash.com/photo-1546842931-886c185b4c8c?w=900&q=85&auto=format&fit=crop",
  "beso-frances": "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=900&q=85&auto=format&fit=crop",
  "romance-boho": "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=900&q=85&auto=format&fit=crop",
  "sol-del-mediodia": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=900&q=85&auto=format&fit=crop",
  "fiesta-tropical": "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=900&q=85&auto=format&fit=crop",
  "primavera-feliz": "https://images.unsplash.com/photo-1462275404821-0b32a3f5e72b?w=900&q=85&auto=format&fit=crop",
  "jardin-secreto": "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=900&q=85&auto=format&fit=crop",
  "eternamente-tuya": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&q=85&auto=format&fit=crop",
  "luna-de-miel": "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=900&q=85&auto=format&fit=crop",
  "serenidad-blanca": "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=900&q=85&auto=format&fit=crop",
  "corona-imperial": "https://images.unsplash.com/photo-1457089328389-f5be382b6cce?w=900&q=85&auto=format&fit=crop",
  "paz-y-memoria": "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=900&q=85&auto=format&fit=crop",
  "bienvenido-al-mundo": "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=900&q=85&auto=format&fit=crop",
  "luna-azul": "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=900&q=85&auto=format&fit=crop",
  "imperio-corporativo": "https://images.unsplash.com/photo-1457089328389-f5be382b6cce?w=900&q=85&auto=format&fit=crop",
  "bienvenida-vip": "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=900&q=85&auto=format&fit=crop",
  "nueva-etapa": "https://images.unsplash.com/photo-1462275404821-0b32a3f5e72b?w=900&q=85&auto=format&fit=crop",
  "diploma-floral": "https://images.unsplash.com/photo-1589491106922-a8e488e1f240?w=900&q=85&auto=format&fit=crop",
};

function resolveImage(slug: string, dbImage?: string): string {
  if (SLUG_IMAGE_MAP[slug]) return SLUG_IMAGE_MAP[slug];
  if (dbImage) return dbImage;
  return FALLBACK_IMG;
}

export function ProductCard({
  product,
  index = 0,
  variant = "default",
  priority = false,
}: ProductCardProps) {
  const [favorite, setFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const imageUrl = imgError
    ? FALLBACK_IMG
    : resolveImage(product.slug, product.images[0]);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || "",
      size: "standard",
      sizeLabel: "Estándar",
      price: Number(product.basePrice),
      quantity: 1,
    });
    toast.success(product.name, {
      description: "Agregado a tu carrito",
      action: { label: "Ver", onClick: () => setCartOpen(true) },
    });
  }

  function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavorite((f) => !f);
  }

  const isFeature = variant === "feature";
  const isCompact = variant === "compact";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`group relative ${isFeature ? "lg:col-span-2 lg:row-span-2" : ""}`}
    >
      <Link href={`/producto/${product.slug}`} className="block">
        {/* Image frame */}
        <div
          className={`relative overflow-hidden bg-cream-darker ${
            isFeature ? "aspect-[4/5]" : isCompact ? "aspect-square" : "aspect-[4/5]"
          }`}
          style={{ borderRadius: "1px" }}
        >
          {/* The image */}
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes={
              isFeature
                ? "(max-width: 1024px) 100vw, 50vw"
                : "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            }
            priority={priority}
            onError={() => setImgError(true)}
            className="object-cover transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
          />

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top-left: featured badge */}
          {product.featured && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 bg-cream/95 backdrop-blur-sm text-forest text-[9px] uppercase tracking-[0.18em] font-sans font-medium px-2.5 py-1 rounded-[1px]">
                <span className="w-1 h-1 bg-gold rounded-full" />
                Destacado
              </span>
            </div>
          )}

          {/* Top-right: wishlist */}
          <button
            onClick={toggleFavorite}
            aria-label="Agregar a favoritos"
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-cream/85 backdrop-blur-sm rounded-full opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-cream"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={favorite ? "#C97B63" : "none"}
              stroke={favorite ? "#C97B63" : "#1F3A2E"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Bottom-right: quick-add pill */}
          <button
            onClick={handleAddToCart}
            aria-label="Agregar al carrito"
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 bg-forest text-cream text-[10px] uppercase tracking-[0.14em] font-sans font-medium px-3.5 py-2 rounded-[1px] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-forest-light shadow-lg"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar
          </button>
        </div>

        {/* Text content */}
        <div className={`pt-4 ${isFeature ? "lg:pt-6" : ""}`}>
          {/* Tagline as small editorial label above name */}
          {product.tagline && (
            <p className="text-[10px] uppercase tracking-[0.18em] font-sans text-gold/80 mb-1.5 line-clamp-1">
              {product.tagline}
            </p>
          )}

          <h3
            className={`font-serif text-forest group-hover:text-terracotta transition-colors duration-300 line-clamp-1 ${
              isFeature ? "text-2xl lg:text-3xl" : "text-lg"
            }`}
          >
            {product.name}
          </h3>

          {/* Decorative thin line */}
          <div className="flex items-center gap-3 mt-2">
            <span className="font-serif text-base text-forest price">
              {formatCOP(Number(product.basePrice))}
            </span>
            <span className="flex-1 h-px bg-forest/10 group-hover:bg-terracotta/40 transition-colors duration-500" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
