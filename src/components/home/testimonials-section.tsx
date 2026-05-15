"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const GOLD = "#A87C3A";
const P    = "#EDE8DF";
const M    = "rgba(237,232,223,0.5)";
const B    = "rgba(237,232,223,0.06)";

const testimonials = [
  {
    id: 1,
    name: "Valentina Rueda",
    location: "Bello, Antioquia",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&fit=crop&crop=face",
    text: "Pedí el arreglo 'Rojo Eterno' para el aniversario de mis papás y llegó perfectísimo. Las rosas eran frescas y el empaque era una caja kraft con cinta dorada. Deco Imperio no decepciona.",
    product: "Rojo Eterno",
  },
  {
    id: 2,
    name: "Camilo Montoya",
    location: "Niquía, Antioquia",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&fit=crop&crop=face",
    text: "Llevo tres años comprando aquí para sorprender a mi esposa. Cada vez el arreglo es diferente y más bonito. La dedicatoria escrita a mano es un detalle que lo dice todo.",
    product: "Romance Boho",
  },
  {
    id: 3,
    name: "Isabela Herrera",
    location: "Medellín, Antioquia",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80&fit=crop&crop=face",
    text: "Para el cumpleaños de mi mamá pedí el bouquet de girasoles y llegó en 2 horas. Las flores duraron más de una semana. Servicio impecable y atención por WhatsApp inmediata.",
    product: "Sol del Mediodía",
  },
  {
    id: 4,
    name: "Andrés Felipe Cano",
    location: "Copacabana, Antioquia",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80&fit=crop&crop=face",
    text: "Compré el arreglo empresarial para la oficina y recibimos muchos comentarios positivos. Profesionales, puntuales y con muy buen gusto. Ya los tengo como proveedores fijos.",
    product: "Imperio Corporativo",
  },
];

export function TestimonialsSection() {
  return (
    <section
      style={{
        background: "#0E0E0D",
        borderTop: `1px solid ${B}`,
        padding: "96px 0 112px",
        overflow: "hidden",
      }}
    >
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="w-10 h-px" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <span style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope, sans-serif)" }}>
              Lo que dicen nuestros clientes
            </span>
            <span className="w-10 h-px" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-italiana, serif)",
              fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
              color: P,
              letterSpacing: "0.04em",
            }}
          >
            Historias reales
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: B }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              style={{ background: "#0E0E0D", padding: "36px 32px" }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill={GOLD}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p
                style={{
                  fontSize: 14,
                  fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
                  fontStyle: "italic",
                  color: M,
                  lineHeight: 1.75,
                  marginBottom: 24,
                }}
              >
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5" style={{ borderTop: `1px solid ${B}` }}>
                <div className="relative w-9 h-9 overflow-hidden shrink-0" style={{ borderRadius: "50%", border: `1px solid rgba(168,124,58,0.25)` }}>
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontFamily: "var(--font-manrope, sans-serif)", color: P, fontWeight: 500 }}>{t.name}</p>
                  <p style={{ fontSize: 10, fontFamily: "var(--font-manrope, sans-serif)", color: "rgba(237,232,223,0.3)" }}>{t.location}</p>
                </div>
                <span
                  className="ml-auto"
                  style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope, sans-serif)" }}
                >
                  {t.product}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
