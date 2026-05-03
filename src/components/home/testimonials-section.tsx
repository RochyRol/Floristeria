"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Valentina Rueda",
    location: "Bello, Antioquia",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&fit=crop&crop=face",
    text: "Pedí el arreglo 'Rojo Eterno' para el aniversario de mis papás y llegó perfectísimo. Las rosas eran frescas y el empaque era una caja kraft con cinta dorada. Deco Imperio no decepciona.",
    rating: 5,
    product: "Rojo Eterno",
  },
  {
    id: 2,
    name: "Camilo Montoya",
    location: "Niquía, Antioquia",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&fit=crop&crop=face",
    text: "Llevo tres años comprando aquí para sorprender a mi esposa. Cada vez el arreglo es diferente y más bonito. La dedicatoria escrita a mano es un detalle que lo dice todo.",
    rating: 5,
    product: "Romance Boho",
  },
  {
    id: 3,
    name: "Isabela Herrera",
    location: "Medellín, Antioquia",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80&fit=crop&crop=face",
    text: "Para el cumpleaños de mi mamá pedí el bouquet de girasoles y llegó en 2 horas. Las flores duraron más de una semana. Servicio impecable y atención por WhatsApp inmediata.",
    rating: 5,
    product: "Sol del Mediodía",
  },
  {
    id: 4,
    name: "Andrés Felipe Cano",
    location: "Copacabana, Antioquia",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80&fit=crop&crop=face",
    text: "Compré el arreglo empresarial para la oficina y recibimos muchos comentarios positivos. Profesionales, puntuales y con muy buen gusto. Ya los tengo como proveedores fijos.",
    rating: 5,
    product: "Imperio Corporativo",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32 bg-cream overflow-hidden">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <p className="text-xs uppercase tracking-widest font-sans font-medium text-gold mb-3">
            Lo que dicen nuestros clientes
          </p>
          <h2 className="font-serif text-display-sm text-forest">
            Historias reales
          </h2>
          <div className="mt-4 w-12 h-px bg-terracotta" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="bg-cream-dark border border-forest/8 rounded-sm p-7 flex flex-col gap-5"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#B8935A">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="font-sans text-sm text-forest/70 leading-relaxed italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-1 border-t border-forest/8">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-cream-darker">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-sans font-medium text-forest">{testimonial.name}</p>
                  <p className="text-[11px] font-sans text-forest/40">{testimonial.location}</p>
                </div>
                <span className="ml-auto text-[10px] uppercase tracking-brand font-sans text-terracotta/70">
                  {testimonial.product}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
