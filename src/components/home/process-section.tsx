"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: "🌹",
    title: "Elegimos tus flores",
    description:
      "Cada mañana seleccionamos las flores más frescas y de mejor calidad, priorizando proveedores locales de la Sabana.",
  },
  {
    number: "02",
    icon: "✂️",
    title: "Armamos a mano",
    description:
      "Nuestros floristas diseñan cada arreglo con cuidado artesanal, siguiendo tu ocasión y el estilo que preferiste.",
  },
  {
    number: "03",
    icon: "📦",
    title: "Empacamos con amor",
    description:
      "Caja kraft, papel coreano o jarrón de vidrio — el empaque forma parte del regalo y protege tus flores.",
  },
  {
    number: "04",
    icon: "🚚",
    title: "Llevamos a tu puerta",
    description:
      "Entregamos en Bello, Niquía, Copacabana y norte de Medellín. Seguimiento en tiempo real desde tu cuenta.",
  },
];

export function ProcessSection() {
  return (
    <section className="py-24 lg:py-32 bg-forest text-cream overflow-hidden">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-lg mb-16 lg:mb-20">
          <p className="text-xs uppercase tracking-widest font-sans font-medium text-gold mb-3">
            Detrás de cada arreglo
          </p>
          <h2 className="font-serif text-display-md text-cream leading-tight">
            Del jardín a
            <br />
            tus manos.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: "easeOut" }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-cream/10 -translate-x-4" />
              )}

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-3xl text-terracotta-light/40">
                    {step.number}
                  </span>
                  <div className="w-px h-6 bg-cream/10" />
                </div>

                <div>
                  <h3 className="font-serif text-lg text-cream mb-2">{step.title}</h3>
                  <p className="text-sm font-sans text-cream/55 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
