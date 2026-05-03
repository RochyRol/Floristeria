"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard, type ProductCardData } from "@/components/ui/product-card";

interface Occasion {
  id: string;
  slug: string;
  name: string;
}

interface ShopPageClientProps {
  products: ProductCardData[];
  total: number;
  page: number;
  perPage: number;
  occasions: Occasion[];
  activeFilters: {
    ocasion?: string;
    precio_min?: string;
    precio_max?: string;
    orden?: string;
    buscar?: string;
  };
}

const priceRanges = [
  { id: "low", label: "Hasta $100.000", min: 0, max: 100000 },
  { id: "mid", label: "$100.000 – $200.000", min: 100000, max: 200000 },
  { id: "high", label: "$200.000 – $350.000", min: 200000, max: 350000 },
  { id: "premium", label: "Más de $350.000", min: 350000, max: 9999999 },
];

const sortOptions = [
  { value: "mas-vendidos", label: "Más vendidos" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nuevos", label: "Más recientes" },
];

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
    featured: false,
  },
  {
    id: "4",
    slug: "amor-en-box",
    name: "Amor en Box",
    tagline: "Caja con rosas preservadas",
    basePrice: 280000,
    images: ["https://images.unsplash.com/photo-1496661415325-ef852f9e8e7c?w=900&q=85&fit=crop"],
    featured: true,
  },
  {
    id: "5",
    slug: "beso-frances",
    name: "Beso Francés",
    tagline: "Rosas blancas en papel coreano",
    basePrice: 195000,
    images: ["https://images.unsplash.com/photo-1596547608027-8bf2b955d62b?w=900&q=85&fit=crop"],
    featured: false,
  },
  {
    id: "6",
    slug: "romance-boho",
    name: "Romance Boho",
    tagline: "Arreglo silvestre con eucalipto",
    basePrice: 165000,
    images: ["https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=900&q=85&fit=crop"],
    featured: false,
  },
  {
    id: "7",
    slug: "sol-del-mediodia",
    name: "Sol del Mediodía",
    tagline: "Girasoles frescos del campo",
    basePrice: 140000,
    images: ["https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=900&q=85&fit=crop"],
    featured: false,
  },
  {
    id: "8",
    slug: "jardin-secreto",
    name: "Jardín Secreto",
    tagline: "Mix de peonías silvestres",
    basePrice: 230000,
    images: ["https://images.unsplash.com/photo-1455582916367-25f75bfc6710?w=900&q=85&fit=crop"],
    featured: false,
  },
];

export function ShopPageClient({
  products,
  total,
  page,
  perPage,
  occasions,
  activeFilters,
}: ShopPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const displayProducts = products.length > 0 ? products : fallbackProducts;
  const totalPages = Math.ceil(total / perPage) || 1;

  const activeOccasion = occasions.find((o) => o.slug === activeFilters.ocasion);
  const activePriceRange = priceRanges.find(
    (r) => String(r.min) === activeFilters.precio_min,
  );

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("pagina");
    router.push(`/tienda?${params.toString()}`);
  }

  function clearAllFilters() {
    router.push("/tienda");
  }

  const hasActiveFilters = !!(
    activeFilters.ocasion ||
    activeFilters.precio_min ||
    activeFilters.precio_max ||
    activeFilters.buscar
  );

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-cream">
      {/* Editorial header */}
      <ShopHeader
        activeOccasion={activeOccasion}
        total={total > 0 ? total : displayProducts.length}
      />

      {/* Active filters chips */}
      {hasActiveFilters && (
        <div className="border-b border-forest/8 bg-cream-dark/40">
          <div className="max-w-8xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-3 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.18em] font-sans text-forest/40">
              Filtrado por
            </span>
            {activeOccasion && (
              <FilterChip
                label={activeOccasion.name}
                onRemove={() => updateFilter("ocasion", null)}
              />
            )}
            {activePriceRange && (
              <FilterChip
                label={activePriceRange.label}
                onRemove={() => {
                  updateFilter("precio_min", null);
                  updateFilter("precio_max", null);
                }}
              />
            )}
            {activeFilters.buscar && (
              <FilterChip
                label={`"${activeFilters.buscar}"`}
                onRemove={() => updateFilter("buscar", null)}
              />
            )}
            <button
              onClick={clearAllFilters}
              className="text-[10px] uppercase tracking-[0.18em] font-sans text-terracotta hover:text-terracotta-dark transition-colors ml-auto"
            >
              Limpiar todo →
            </button>
          </div>
        </div>
      )}

      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="flex gap-12 lg:gap-16">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-28">
              <FilterSidebar
                occasions={occasions}
                activeFilters={activeFilters}
                onUpdate={updateFilter}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort + mobile filter trigger */}
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-forest/10">
              <div className="flex items-center gap-4">
                <p className="text-sm font-sans text-forest/55 hidden sm:block">
                  <span className="font-serif text-forest text-base mr-1">
                    {displayProducts.length}
                  </span>
                  arreglo{displayProducts.length === 1 ? "" : "s"}
                </p>
                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-1.5 border border-forest/15 rounded-[1px] text-[10px] uppercase tracking-[0.16em] font-sans text-forest/70 hover:border-forest/40 transition-colors"
                >
                  <FilterIcon />
                  Filtros
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.18em] font-sans text-forest/40 hidden sm:inline">
                  Ordenar
                </span>
                <select
                  value={activeFilters.orden || "mas-vendidos"}
                  onChange={(e) => updateFilter("orden", e.target.value)}
                  className="text-xs font-sans text-forest bg-cream border border-forest/15 rounded-[1px] pl-3 pr-8 py-2 focus:outline-none focus:border-terracotta cursor-pointer hover:border-forest/40 transition-colors appearance-none"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231F3A2E' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                  }}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Empty state */}
            {displayProducts.length === 0 ? (
              <EmptyState onClear={clearAllFilters} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-14">
                {displayProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    priority={i < 3}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(p) => updateFilter("pagina", String(p))}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterDrawerOpen(false)}
              className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-cream z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-xl text-forest">Filtros</h2>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    aria-label="Cerrar"
                    className="w-8 h-8 flex items-center justify-center text-forest/60 hover:text-forest"
                  >
                    <CloseIcon />
                  </button>
                </div>
                <FilterSidebar
                  occasions={occasions}
                  activeFilters={activeFilters}
                  onUpdate={(k, v) => {
                    updateFilter(k, v);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function ShopHeader({
  activeOccasion,
  total,
}: {
  activeOccasion?: { name: string };
  total: number;
}) {
  return (
    <div className="relative bg-gradient-to-b from-cream-dark to-cream border-b border-forest/8 overflow-hidden">
      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-16 lg:py-24 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.22em] font-sans font-medium text-gold">
              {activeOccasion ? "Ocasión" : "Colección completa"}
            </span>
          </div>

          <h1 className="font-serif text-5xl lg:text-7xl text-forest leading-[1.05] tracking-tight">
            {activeOccasion ? (
              <>
                Flores para{" "}
                <span className="italic text-terracotta">
                  {activeOccasion.name.toLowerCase()}
                </span>
              </>
            ) : (
              <>
                Cada arreglo,{" "}
                <span className="italic text-terracotta">una historia</span>
              </>
            )}
          </h1>

          <p className="mt-6 max-w-xl text-base lg:text-lg font-sans text-forest/60 leading-relaxed">
            {activeOccasion
              ? `Cuidadosamente seleccionados para celebrar este momento especial.`
              : `Diseñados a mano en Bello, Antioquia. Cada flor es elegida pensando en el momento que va a vivir.`}
          </p>

          <p className="mt-5 text-xs uppercase tracking-[0.18em] font-sans text-forest/40">
            {total} arreglos disponibles
          </p>
        </motion.div>

        {/* Decorative botanical SVG accent */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
          <svg
            width="280"
            height="280"
            viewBox="0 0 200 200"
            fill="none"
            stroke="#1F3A2E"
            strokeWidth="0.6"
          >
            <circle cx="100" cy="100" r="80" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="40" />
            <circle cx="100" cy="100" r="20" />
            <path d="M100 20 L100 180 M20 100 L180 100 M40 40 L160 160 M160 40 L40 160" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({
  occasions,
  activeFilters,
  onUpdate,
}: {
  occasions: Occasion[];
  activeFilters: ShopPageClientProps["activeFilters"];
  onUpdate: (k: string, v: string | null) => void;
}) {
  const occasionList =
    occasions.length > 0
      ? occasions
      : [
          { id: "1", slug: "amor", name: "Amor" },
          { id: "2", slug: "cumpleanos", name: "Cumpleaños" },
          { id: "3", slug: "aniversario", name: "Aniversario" },
          { id: "4", slug: "condolencias", name: "Condolencias" },
          { id: "5", slug: "nacimiento", name: "Nacimiento" },
          { id: "6", slug: "empresarial", name: "Empresarial" },
          { id: "7", slug: "graduacion", name: "Graduación" },
        ];

  return (
    <div className="flex flex-col gap-10">
      {/* Occasion */}
      <div>
        <FilterLabel>Ocasión</FilterLabel>
        <ul className="flex flex-col gap-1">
          <FilterRow
            active={!activeFilters.ocasion}
            onClick={() => onUpdate("ocasion", null)}
          >
            Todas las ocasiones
          </FilterRow>
          {occasionList.map((occ) => (
            <FilterRow
              key={occ.id}
              active={activeFilters.ocasion === occ.slug}
              onClick={() => onUpdate("ocasion", occ.slug)}
            >
              {occ.name}
            </FilterRow>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <FilterLabel>Precio</FilterLabel>
        <ul className="flex flex-col gap-1">
          <FilterRow
            active={!activeFilters.precio_min && !activeFilters.precio_max}
            onClick={() => {
              onUpdate("precio_min", null);
              onUpdate("precio_max", null);
            }}
          >
            Cualquier precio
          </FilterRow>
          {priceRanges.map((range) => (
            <FilterRow
              key={range.id}
              active={activeFilters.precio_min === String(range.min)}
              onClick={() => {
                onUpdate("precio_min", String(range.min));
                onUpdate("precio_max", String(range.max));
              }}
            >
              {range.label}
            </FilterRow>
          ))}
        </ul>
      </div>

      {/* Help block */}
      <div className="mt-2 pt-8 border-t border-forest/10">
        <p className="text-[10px] uppercase tracking-[0.18em] font-sans font-medium text-gold/80 mb-2">
          ¿Necesitas ayuda?
        </p>
        <p className="text-sm font-sans text-forest/60 leading-relaxed mb-4">
          Te ayudamos a elegir el arreglo perfecto para tu ocasión.
        </p>
        <a
          href="https://wa.me/573215039845"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-sans text-terracotta hover:text-terracotta-dark transition-colors"
        >
          Chatea por WhatsApp
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] uppercase tracking-[0.22em] font-sans font-medium text-forest/45 mb-4 flex items-center gap-2">
      <span className="w-4 h-px bg-gold" />
      {children}
    </h3>
  );
}

function FilterRow({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left py-1.5 text-sm font-sans transition-all duration-200 flex items-center gap-2.5 group ${
          active
            ? "text-terracotta font-medium"
            : "text-forest/60 hover:text-forest"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            active ? "bg-terracotta" : "bg-transparent border border-forest/20 group-hover:border-forest/50"
          }`}
        />
        {children}
      </button>
    </li>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 bg-cream border border-forest/15 px-3 py-1.5 rounded-[1px] text-xs font-sans text-forest">
      {label}
      <button
        onClick={onRemove}
        aria-label="Quitar filtro"
        className="text-forest/40 hover:text-burgundy transition-colors"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C97B63" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div>
        <p className="font-serif text-2xl text-forest mb-2">
          Sin resultados
        </p>
        <p className="text-sm font-sans text-forest/55 max-w-xs">
          No encontramos arreglos con esos filtros. Prueba con otra combinación.
        </p>
      </div>
      <button
        onClick={onClear}
        className="text-xs uppercase tracking-[0.16em] font-sans text-cream bg-forest hover:bg-forest-light transition-colors px-6 py-3 rounded-[1px]"
      >
        Ver todos los arreglos
      </button>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-16 pt-12 border-t border-forest/10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 text-xs uppercase tracking-[0.16em] font-sans text-forest/60 hover:text-forest disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Anterior
      </button>
      <div className="flex items-center gap-1 mx-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 text-sm font-sans rounded-[1px] transition-all ${
              p === page
                ? "bg-forest text-cream"
                : "text-forest/60 hover:text-forest hover:bg-cream-dark"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 text-xs uppercase tracking-[0.16em] font-sans text-forest/60 hover:text-forest disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Siguiente →
      </button>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
