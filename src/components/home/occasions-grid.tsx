"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Occasion {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
}

// Verified Unsplash IDs that are stable + curated for the brand mood
const IMAGE_MAP: Record<string, string> = {
  amor: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=1200&q=85&auto=format&fit=crop",
  cumpleanos: "https://images.unsplash.com/photo-1462275404821-0b32a3f5e72b?w=1200&q=85&auto=format&fit=crop",
  cumpleaños: "https://images.unsplash.com/photo-1462275404821-0b32a3f5e72b?w=1200&q=85&auto=format&fit=crop",
  aniversario: "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=1200&q=85&auto=format&fit=crop",
  condolencias: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=1200&q=85&auto=format&fit=crop",
  nacimiento: "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1200&q=85&auto=format&fit=crop",
  empresarial: "https://images.unsplash.com/photo-1457089328389-f5be382b6cce?w=1200&q=85&auto=format&fit=crop",
  graduacion: "https://images.unsplash.com/photo-1589491106922-a8e488e1f240?w=1200&q=85&auto=format&fit=crop",
  graduación: "https://images.unsplash.com/photo-1589491106922-a8e488e1f240?w=1200&q=85&auto=format&fit=crop",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=85&auto=format&fit=crop";

const fallbackOccasions: Occasion[] = [
  { id: "1", slug: "amor", name: "Amor", description: "Para quien llena tus días de luz", image: null },
  { id: "2", slug: "cumpleanos", name: "Cumpleaños", description: "Celebra con flores y color", image: null },
  { id: "3", slug: "aniversario", name: "Aniversario", description: "Años de historia que merecen flores", image: null },
  { id: "4", slug: "condolencias", name: "Condolencias", description: "Acompañar con dignidad y respeto", image: null },
  { id: "5", slug: "nacimiento", name: "Nacimiento", description: "Bienvenida al mundo más puro", image: null },
  { id: "6", slug: "empresarial", name: "Empresarial", description: "Imagen y elegancia", image: null },
];

interface OccasionsGridProps {
  occasions: Occasion[];
}

function getImage(slug: string): string {
  return IMAGE_MAP[slug.toLowerCase()] || FALLBACK_IMG;
}

interface CardSlotProps {
  occasion: Occasion;
  delay: number;
  className?: string;
  isHero?: boolean;
  style?: React.CSSProperties;
}

function CardSlot({ occasion, delay, className = "", isHero = false, style }: CardSlotProps) {
  const imageUrl = getImage(occasion.slug);
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative overflow-hidden ${className}`}
      style={{ background: "#1a1411", borderRadius: "1px", ...style }}
    >
      <Link href={`/tienda?ocasion=${occasion.slug}`} className="absolute inset-0 group">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
        {/* Gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,8,7,0.88) 0%, rgba(10,8,7,0.25) 50%, rgba(10,8,7,0.08) 100%)" }} />
        {/* Inner border */}
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 0 1px rgba(247,241,234,0.08)" }} />
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
          <span
            className="inline-block uppercase mb-2"
            style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(247,241,234,0.55)", fontFamily: "var(--font-manrope), 'Manrope', sans-serif" }}
          >
            Colección
          </span>
          <h3
            style={{
              fontFamily: "var(--font-italiana), 'Italiana', serif",
              fontSize: isHero ? "clamp(1.6rem, 3vw, 2.8rem)" : "clamp(1.2rem, 2vw, 1.8rem)",
              color: "#f7f1ea",
              lineHeight: 1.1,
              letterSpacing: "0.02em",
            }}
          >
            {occasion.name}
          </h3>
          {occasion.description && (
            <p
              className="mt-2 max-w-xs leading-relaxed"
              style={{ fontSize: 13, color: "rgba(247,241,234,0.65)", fontFamily: "var(--font-manrope), 'Manrope', sans-serif" }}
            >
              {occasion.description}
            </p>
          )}
          <span
            className="inline-flex items-center gap-2 mt-4 pb-1 transition-all"
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#c9a27a",
              borderBottom: "1px solid rgba(201,162,122,0.4)",
              fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
            }}
          >
            Ver arreglos
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="group-hover:translate-x-1 transition-transform duration-300">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function OccasionsGrid({ occasions }: OccasionsGridProps) {
  const items = occasions.length > 0 ? occasions : fallbackOccasions;

  return (
    <section className="py-24 lg:py-36 relative overflow-hidden" style={{ background: "#0a0807" }}>
      {/* Subtle decorative top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20" style={{ background: "linear-gradient(to bottom, transparent, rgba(201,162,122,0.4), transparent)" }} />

      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center text-center mb-16 lg:mb-20"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px" style={{ background: "#c9a27a" }} />
            <span className="text-[10px] uppercase tracking-[0.22em] font-sans font-medium" style={{ color: "#c9a27a" }}>
              Cada momento importa
            </span>
            <span className="w-8 h-px" style={{ background: "#c9a27a" }} />
          </div>
          <h2 className="font-serif text-4xl lg:text-6xl leading-tight max-w-2xl" style={{ color: "#f7f1ea" }}>
            ¿Cuál es la <span className="italic" style={{ color: "#c9a27a" }}>ocasión</span>?
          </h2>
          <p className="mt-5 max-w-md text-base font-sans leading-relaxed" style={{ color: "#8a7f76" }}>
            Cada momento merece su propio arreglo. Encuentra el ideal para celebrar.
          </p>
        </motion.div>

        {/* ── Desktop: flex layout (no row-span) ── */}
        <div className="hidden lg:flex lg:flex-col lg:gap-6">
          {/* Row 1: hero (2/3) + side stack (1/3) */}
          <div className="flex gap-6" style={{ height: "clamp(320px, 30vw, 480px)" }}>
            <CardSlot occasion={items[0]} delay={0} className="flex-[2]" isHero />
            <div className="flex-1 flex flex-col gap-6">
              {items.slice(1, 3).map((occasion, j) => (
                <CardSlot key={occasion.id} occasion={occasion} delay={(j + 1) * 0.08} className="flex-1" />
              ))}
            </div>
          </div>
          {/* Row 2: 3 small cards */}
          <div className="grid grid-cols-3 gap-6">
            {items.slice(3, 6).map((occasion, j) => (
              <CardSlot
                key={occasion.id}
                occasion={occasion}
                delay={(j + 3) * 0.08}
                className=""
                style={{ aspectRatio: "4/5" }}
              />
            ))}
          </div>
        </div>

        {/* ── Mobile: simple 2-col grid ── */}
        <div className="lg:hidden grid grid-cols-2 gap-4">
          {items.slice(0, 6).map((occasion, i) => {
            const isHero = i === 0;
            return (
              <CardSlot
                key={occasion.id}
                occasion={occasion}
                delay={Math.min(i * 0.08, 0.4)}
                isHero={isHero}
                className={isHero ? "col-span-2" : ""}
                style={{ aspectRatio: isHero ? "16/9" : "4/5" }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
