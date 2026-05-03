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

export function OccasionsGrid({ occasions }: OccasionsGridProps) {
  const items = occasions.length > 0 ? occasions : fallbackOccasions;

  return (
    <section className="py-24 lg:py-36 bg-cream relative overflow-hidden">
      {/* Subtle decorative top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-gold/40 to-transparent" />

      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center text-center mb-16 lg:mb-20"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.22em] font-sans font-medium text-gold">
              Cada momento importa
            </span>
            <span className="w-8 h-px bg-gold" />
          </div>
          <h2 className="font-serif text-4xl lg:text-6xl text-forest leading-tight max-w-2xl">
            ¿Cuál es la <span className="italic text-terracotta">ocasión</span>?
          </h2>
          <p className="mt-5 max-w-md text-base font-sans text-forest/60 leading-relaxed">
            Cada momento merece su propio arreglo. Encuentra el ideal para celebrar.
          </p>
        </motion.div>

        {/* Asymmetric editorial grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {items.slice(0, 6).map((occasion, i) => {
            const isHero = i === 0;
            const imageUrl = getImage(occasion.slug);

            return (
              <motion.div
                key={occasion.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: Math.min(i * 0.08, 0.4),
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className={isHero ? "col-span-2 lg:col-span-2 lg:row-span-2" : ""}
              >
                <Link
                  href={`/tienda?ocasion=${occasion.slug}`}
                  className="group relative block overflow-hidden bg-cream-dark"
                  style={{ aspectRatio: isHero ? "16/9" : "4/5", borderRadius: "1px" }}
                >
                  {/* Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]"
                    style={{ backgroundImage: `url('${imageUrl}')` }}
                  />

                  {/* Editorial gradient — darker for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/30 to-forest/10" />

                  {/* Soft inner border */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-cream/10" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    <span className="inline-block text-[9px] uppercase tracking-[0.22em] font-sans font-medium text-cream/70 mb-2">
                      Colección
                    </span>
                    <h3
                      className={`font-serif text-cream leading-[1.1] ${
                        isHero ? "text-3xl lg:text-5xl" : "text-2xl lg:text-3xl"
                      }`}
                    >
                      {occasion.name}
                    </h3>
                    {occasion.description && (
                      <p className="mt-2 text-sm font-sans text-cream/75 max-w-xs leading-relaxed">
                        {occasion.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-2 mt-5 text-[10px] uppercase tracking-[0.18em] font-sans font-medium text-cream border-b border-cream/30 group-hover:border-cream pb-1 transition-all">
                      Ver arreglos
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
