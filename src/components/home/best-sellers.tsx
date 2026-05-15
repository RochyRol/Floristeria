"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard, type ProductCardData } from "@/components/ui/product-card";

const fallbackProducts: ProductCardData[] = [
  {
    id: "1",
    slug: "rojo-eterno",
    name: "Rojo Eterno",
    tagline: "12 rosas premium en caja kraft",
    basePrice: 180000,
    images: ["https://images.unsplash.com/photo-1548199569-3e1c6aa8f469?w=900&q=85&fit=crop"],
    featured: true,
  },
  {
    id: "2",
    slug: "pasion-de-medianoche",
    name: "Pasión de Medianoche",
    tagline: "24 rosas en jarrón de cristal",
    basePrice: 320000,
    images: ["https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&q=85&fit=crop"],
    featured: true,
  },
  {
    id: "3",
    slug: "susurro-de-petalos",
    name: "Susurro de Pétalos",
    tagline: "Bouquet rosas y gypsophila",
    basePrice: 150000,
    images: ["https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=85&fit=crop"],
    featured: true,
  },
  {
    id: "4",
    slug: "beso-frances",
    name: "Beso Francés",
    tagline: "Rosas blancas y rosadas",
    basePrice: 195000,
    images: ["https://images.unsplash.com/photo-1596547608027-8bf2b955d62b?w=900&q=85&fit=crop"],
    featured: true,
  },
];

interface BestSellersProps {
  products: ProductCardData[];
}

export function BestSellers({ products }: BestSellersProps) {
  const items = products.length > 0 ? products : fallbackProducts;

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden" style={{ background: "#120e0c" }}>
      {/* Subtle decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16" style={{ background: "linear-gradient(to bottom, transparent, rgba(201,162,122,0.4), transparent)" }} />

      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        {/* Editorial header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-end justify-between mb-14 lg:mb-20"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px" style={{ background: "#c9a27a" }} />
              <span className="text-[10px] uppercase tracking-[0.22em] font-sans font-medium" style={{ color: "#c9a27a" }}>
                Los más queridos
              </span>
            </div>
            <h2 className="font-serif text-4xl lg:text-6xl leading-tight" style={{ color: "#f7f1ea", fontWeight: 500, letterSpacing: "0.005em" }}>
              Favoritos de la <span className="italic" style={{ color: "#c9a27a", fontWeight: 600 }}>temporada</span>
            </h2>
          </div>
          <Link
            href="/tienda"
            className="hidden sm:inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] font-sans font-medium transition-colors group pb-2"
            style={{ color: "#bfb5ab" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f7f1ea")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#bfb5ab")}
          >
            Ver toda la colección
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Products grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 lg:gap-x-7 lg:gap-y-14">
          {items.slice(0, 4).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* Mobile-only "see all" */}
        <div className="sm:hidden flex justify-center mt-10">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] font-sans font-medium transition-colors pb-1"
            style={{ color: "#bfb5ab", borderBottom: "1px solid rgba(247,241,234,0.2)" }}
          >
            Ver toda la colección
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
