"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden bg-forest">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1800&q=85&fit=crop')",
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-forest/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/30 to-transparent" />
      </div>

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-8xl mx-auto px-6 lg:px-12 pb-20 lg:pb-28 pt-32">
        <div className="max-w-2xl">
          {/* Pre-title */}
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xs uppercase tracking-widest font-sans font-medium text-gold mb-5"
          >
            Bello — Niquía, Antioquia
          </motion.p>

          {/* Main headline */}
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-serif text-display-xl text-cream leading-[1.05] mb-6"
          >
            Flores que
            <br />
            <em className="not-italic text-terracotta-light">cuentan historias.</em>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="font-sans text-base lg:text-lg text-cream/70 leading-relaxed mb-10 max-w-xl"
          >
            Arreglos hechos a mano en Medellín. Cada pétalo elegido con cuidado
            para el momento que lo merece.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap gap-3"
          >
            <Link href="/tienda">
              <Button
                size="lg"
                className="bg-cream text-forest border-cream hover:bg-cream/90 hover:border-cream/90"
              >
                Explorar tienda
              </Button>
            </Link>
            <a href={getWhatsAppUrl("Hola, quiero pedir un arreglo floral personalizado.")} target="_blank" rel="noopener noreferrer">
              <Button
                variant="whatsapp"
                size="lg"
                icon={<WhatsAppIcon />}
              >
                Pedido express
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="hidden lg:flex absolute right-12 bottom-10 flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest font-sans text-cream/30 writing-mode-vertical">
            Desliza
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-cream/30 to-transparent" />
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute right-0 bottom-0 left-0 lg:left-auto lg:right-12 z-10"
      >
        <div className="lg:inline-flex bg-cream/95 backdrop-blur-sm border border-forest/8 rounded-t-sm">
          <div className="flex divide-x divide-forest/10">
            {[
              { value: "15+", label: "años de experiencia" },
              { value: "3.000+", label: "arreglos al año" },
              { value: "4.9★", label: "calificación" },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-4 text-center">
                <p className="font-serif text-xl text-forest">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-brand font-sans text-forest/50 mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
