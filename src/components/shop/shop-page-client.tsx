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
  { id: "low",     label: "Hasta $100.000",        min: 0,      max: 100000  },
  { id: "mid",     label: "$100.000 – $200.000",   min: 100000, max: 200000  },
  { id: "high",    label: "$200.000 – $350.000",   min: 200000, max: 350000  },
  { id: "premium", label: "Más de $350.000",        min: 350000, max: 9999999 },
];

const sortOptions = [
  { value: "mas-vendidos", label: "Más vendidos" },
  { value: "precio-asc",   label: "Menor precio" },
  { value: "precio-desc",  label: "Mayor precio" },
  { value: "nuevos",       label: "Más recientes" },
];

const fallbackProducts: ProductCardData[] = [
  { id:"1", slug:"rojo-eterno",         name:"Rojo Eterno",        tagline:"12 rosas premium en caja kraft",   basePrice:180000, images:["https://images.unsplash.com/photo-1548199569-3e1c6aa8f469?w=900&q=85&fit=crop"],  featured:true  },
  { id:"2", slug:"pasion-de-medianoche",name:"Pasión de Medianoche",tagline:"24 rosas en jarrón de cristal",    basePrice:320000, images:["https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&q=85&fit=crop"],  featured:true  },
  { id:"3", slug:"susurro-de-petalos",  name:"Susurro de Pétalos", tagline:"Bouquet rosas y gypsophila",        basePrice:150000, images:["https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=85&fit=crop"],  featured:false },
  { id:"4", slug:"amor-en-box",         name:"Amor en Box",        tagline:"Caja con rosas preservadas",        basePrice:280000, images:["https://images.unsplash.com/photo-1496661415325-ef852f9e8e7c?w=900&q=85&fit=crop"],  featured:true  },
  { id:"5", slug:"beso-frances",        name:"Beso Francés",       tagline:"Rosas blancas en papel coreano",    basePrice:195000, images:["https://images.unsplash.com/photo-1596547608027-8bf2b955d62b?w=900&q=85&fit=crop"],  featured:false },
  { id:"6", slug:"romance-boho",        name:"Romance Boho",       tagline:"Arreglo silvestre con eucalipto",   basePrice:165000, images:["https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=900&q=85&fit=crop"],  featured:false },
  { id:"7", slug:"sol-del-mediodia",    name:"Sol del Mediodía",   tagline:"Girasoles frescos del campo",       basePrice:140000, images:["https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=900&q=85&fit=crop"],  featured:false },
  { id:"8", slug:"jardin-secreto",      name:"Jardín Secreto",     tagline:"Mix de peonías silvestres",         basePrice:230000, images:["https://images.unsplash.com/photo-1455582916367-25f75bfc6710?w=900&q=85&fit=crop"],  featured:false },
];

/* ─── Design tokens ─────────────────────────────── */
const BG   = "#0A0807";
const GOLD = "#A87C3A";
const PARCHMENT = "#EDE8DF";
const MUTED = "rgba(237,232,223,0.45)";
const BORDER = "rgba(237,232,223,0.07)";
const CARD_BG = "rgba(255,255,255,0.025)";

export function ShopPageClient({ products, total, page, perPage, occasions, activeFilters }: ShopPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const displayProducts  = products.length > 0 ? products : fallbackProducts;
  const totalPages       = Math.ceil(total / perPage) || 1;
  const activeOccasion   = occasions.find((o) => o.slug === activeFilters.ocasion);
  const activePriceRange = priceRanges.find((r) => String(r.min) === activeFilters.precio_min);

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.delete("pagina");
    router.push(`/tienda?${params.toString()}`);
  }

  function clearAllFilters() { router.push("/tienda"); }

  const hasActiveFilters = !!(activeFilters.ocasion || activeFilters.precio_min || activeFilters.precio_max || activeFilters.buscar);

  return (
    <div
      className="min-h-screen"
      style={{ background: BG, paddingTop: 72 }}
    >
      {/* ── Editorial header ── */}
      <div
        className="relative overflow-hidden"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        {/* gold radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%", left: "60%",
            width: 500, height: 500,
            transform: "translate(-50%,-50%)",
            background: `radial-gradient(circle, rgba(168,124,58,0.08) 0%, transparent 70%)`,
          }}
        />
        <div className="max-w-8xl mx-auto px-6 lg:px-12 py-16 lg:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px" style={{ background: GOLD }} />
              <span style={{ fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope, sans-serif)" }}>
                {activeOccasion ? "Ocasión" : "Colección completa"}
              </span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-italiana, serif)",
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                color: PARCHMENT,
                lineHeight: 1.05,
                letterSpacing: "0.04em",
              }}
            >
              {activeOccasion ? (
                <>Flores para <em style={{ color: GOLD, fontStyle: "italic" }}>{activeOccasion.name.toLowerCase()}</em></>
              ) : (
                <>Cada arreglo, <em style={{ color: GOLD, fontStyle: "italic" }}>una historia</em></>
              )}
            </h1>
            <p style={{ marginTop: 16, maxWidth: 480, fontSize: 15, fontFamily: "var(--font-manrope, sans-serif)", color: MUTED, lineHeight: 1.7 }}>
              {activeOccasion
                ? "Cuidadosamente seleccionados para celebrar este momento especial."
                : "Diseñados a mano en Bello, Antioquia. Cada flor es elegida pensando en el momento que va a vivir."}
            </p>
            <p style={{ marginTop: 14, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(237,232,223,0.25)", fontFamily: "var(--font-manrope, sans-serif)" }}>
              {displayProducts.length} arreglos disponibles
            </p>
          </motion.div>

          {/* decorative botanical circle */}
          <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.05 }}>
            <svg width="260" height="260" viewBox="0 0 200 200" fill="none" stroke={PARCHMENT} strokeWidth="0.5">
              <circle cx="100" cy="100" r="80" /><circle cx="100" cy="100" r="55" /><circle cx="100" cy="100" r="30" />
              <path d="M100 20 L100 180 M20 100 L180 100 M43 43 L157 157 M157 43 L43 157" />
              <path d="M100 20 Q140 60 100 100 Q60 60 100 20Z" /><path d="M100 100 Q140 140 100 180 Q60 140 100 100Z" />
              <path d="M20 100 Q60 60 100 100 Q60 140 20 100Z" /><path d="M100 100 Q140 60 180 100 Q140 140 100 100Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {hasActiveFilters && (
        <div style={{ borderBottom: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}>
          <div className="max-w-8xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-3 flex-wrap">
            <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(237,232,223,0.3)", fontFamily: "var(--font-manrope)" }}>
              Filtrado por
            </span>
            {activeOccasion   && <DarkChip label={activeOccasion.name}    onRemove={() => updateFilter("ocasion", null)} />}
            {activePriceRange && <DarkChip label={activePriceRange.label}  onRemove={() => { updateFilter("precio_min", null); updateFilter("precio_max", null); }} />}
            {activeFilters.buscar && <DarkChip label={`"${activeFilters.buscar}"`} onRemove={() => updateFilter("buscar", null)} />}
            <button
              onClick={clearAllFilters}
              style={{ marginLeft: "auto", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-manrope)" }}
            >
              Limpiar todo →
            </button>
          </div>
        </div>
      )}

      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="flex gap-12 lg:gap-16">
          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-28">
              <FilterSidebar occasions={occasions} activeFilters={activeFilters} onUpdate={updateFilter} />
            </div>
          </aside>

          {/* ── Main grid ── */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-10 pb-6" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-4">
                <p style={{ fontSize: 13, fontFamily: "var(--font-manrope)", color: "rgba(237,232,223,0.35)" }}>
                  <span style={{ fontFamily: "var(--font-italiana, serif)", color: PARCHMENT, fontSize: 18, marginRight: 4 }}>
                    {displayProducts.length}
                  </span>
                  arreglo{displayProducts.length === 1 ? "" : "s"}
                </p>
                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-2"
                  style={{ padding: "7px 14px", border: `1px solid rgba(237,232,223,0.15)`, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, background: "none", cursor: "pointer", fontFamily: "var(--font-manrope)" }}
                >
                  <FilterIcon /> Filtros
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(237,232,223,0.3)", fontFamily: "var(--font-manrope)" }} className="hidden sm:inline">
                  Ordenar
                </span>
                <select
                  value={activeFilters.orden || "mas-vendidos"}
                  onChange={(e) => updateFilter("orden", e.target.value)}
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-manrope)",
                    color: MUTED,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid rgba(237,232,223,0.12)`,
                    padding: "8px 32px 8px 12px",
                    cursor: "pointer",
                    outline: "none",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23A87C3A' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                  }}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ background: "#0A0807" }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {displayProducts.length === 0 ? (
              <EmptyState onClear={clearAllFilters} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-14">
                {displayProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} priority={i < 3} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onChange={(p) => updateFilter("pagina", String(p))} />
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFilterDrawerOpen(false)}
              className="fixed inset-0 z-50 lg:hidden"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] z-50 lg:hidden overflow-y-auto"
              style={{ background: "#0D0B0A", borderRight: `1px solid ${BORDER}` }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <p style={{ fontFamily: "var(--font-italiana, serif)", fontSize: 22, color: PARCHMENT, letterSpacing: "0.06em" }}>
                    Filtros
                  </p>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 22 }}
                  >
                    ×
                  </button>
                </div>
                <FilterSidebar occasions={occasions} activeFilters={activeFilters} onUpdate={(k, v) => { updateFilter(k, v); }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Subcomponents ─────────────────────────────── */

function FilterSidebar({ occasions, activeFilters, onUpdate }: {
  occasions: Occasion[];
  activeFilters: ShopPageClientProps["activeFilters"];
  onUpdate: (k: string, v: string | null) => void;
}) {
  const occasionList = occasions.length > 0 ? occasions : [
    { id:"1", slug:"amor",          name:"Amor"          },
    { id:"2", slug:"cumpleanos",    name:"Cumpleaños"    },
    { id:"3", slug:"aniversario",   name:"Aniversario"   },
    { id:"4", slug:"condolencias",  name:"Condolencias"  },
    { id:"5", slug:"nacimiento",    name:"Nacimiento"    },
    { id:"6", slug:"empresarial",   name:"Empresarial"   },
    { id:"7", slug:"graduacion",    name:"Graduación"    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <FilterGroup label="Ocasión">
        <FilterItem active={!activeFilters.ocasion} onClick={() => onUpdate("ocasion", null)}>
          Todas las ocasiones
        </FilterItem>
        {occasionList.map((occ) => (
          <FilterItem key={occ.id} active={activeFilters.ocasion === occ.slug} onClick={() => onUpdate("ocasion", occ.slug)}>
            {occ.name}
          </FilterItem>
        ))}
      </FilterGroup>

      <FilterGroup label="Precio">
        <FilterItem active={!activeFilters.precio_min && !activeFilters.precio_max} onClick={() => { onUpdate("precio_min", null); onUpdate("precio_max", null); }}>
          Cualquier precio
        </FilterItem>
        {priceRanges.map((range) => (
          <FilterItem key={range.id} active={activeFilters.precio_min === String(range.min)} onClick={() => { onUpdate("precio_min", String(range.min)); onUpdate("precio_max", String(range.max)); }}>
            {range.label}
          </FilterItem>
        ))}
      </FilterGroup>

      <div style={{ paddingTop: 24, borderTop: `1px solid rgba(237,232,223,0.06)` }}>
        <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope)", marginBottom: 8 }}>
          ¿Necesitas ayuda?
        </p>
        <p style={{ fontSize: 13, fontFamily: "var(--font-manrope)", color: MUTED, lineHeight: 1.6, marginBottom: 14 }}>
          Te ayudamos a elegir el arreglo perfecto para tu ocasión.
        </p>
        <a
          href="https://wa.me/573215039845"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#25D366", fontFamily: "var(--font-manrope)", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          WhatsApp →
        </a>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-4 h-px" style={{ background: GOLD }} />
        <h3 style={{ fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope)", fontWeight: 500 }}>
          {label}
        </h3>
      </div>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  );
}

function FilterItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button
        onClick={onClick}
        className="w-full text-left flex items-center gap-3 group"
        style={{
          padding: "7px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "var(--font-manrope)",
          color: active ? PARCHMENT : MUTED,
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = PARCHMENT; }}
        onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = MUTED; }}
      >
        <span
          style={{
            width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
            background: active ? GOLD : "transparent",
            border: `1px solid ${active ? GOLD : "rgba(237,232,223,0.2)"}`,
            transition: "all 0.2s",
          }}
        />
        {children}
      </button>
    </li>
  );
}

function DarkChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-2"
      style={{ background: "rgba(168,124,58,0.1)", border: "1px solid rgba(168,124,58,0.25)", padding: "4px 12px", fontSize: 11, fontFamily: "var(--font-manrope)", color: GOLD, letterSpacing: "0.06em" }}
    >
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(168,124,58,0.6)", lineHeight: 1, padding: 0, fontSize: 14 }}>×</button>
    </span>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
      <div style={{ width: 60, height: 60, border: `1px solid rgba(237,232,223,0.1)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div>
        <p style={{ fontFamily: "var(--font-italiana, serif)", fontSize: 26, color: PARCHMENT, marginBottom: 8 }}>Sin resultados</p>
        <p style={{ fontSize: 13, fontFamily: "var(--font-manrope)", color: MUTED, maxWidth: 300 }}>
          No encontramos arreglos con esos filtros. Prueba con otra combinación.
        </p>
      </div>
      <button
        onClick={onClear}
        style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: BG, background: PARCHMENT, padding: "12px 28px", border: "none", cursor: "pointer", fontFamily: "var(--font-manrope)" }}
      >
        Ver todos
      </button>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-16 pt-12" style={{ borderTop: `1px solid ${BORDER}` }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        style={{ padding: "8px 16px", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, background: "none", border: "none", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.3 : 1, fontFamily: "var(--font-manrope)" }}
      >
        ← Anterior
      </button>
      <div className="flex items-center gap-1 mx-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              width: 36, height: 36, fontSize: 12, fontFamily: "var(--font-manrope)", cursor: "pointer", border: "none",
              background: p === page ? GOLD : "transparent",
              color: p === page ? BG : MUTED,
              outline: p !== page ? `1px solid rgba(237,232,223,0.1)` : "none",
              transition: "all 0.2s",
            }}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        style={{ padding: "8px 16px", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, background: "none", border: "none", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.3 : 1, fontFamily: "var(--font-manrope)" }}
      >
        Siguiente →
      </button>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}
