"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    icon: "❀",
    title: "Elegimos tus flores",
    description: "Cada mañana seleccionamos las flores más frescas, priorizando proveedores de la Sabana y mercados de importación directa.",
  },
  {
    n: "02",
    icon: "✦",
    title: "Armamos a mano",
    description: "Nuestras floristas componen cada arreglo a mano, atando cada tallo con cinta de seda natural y cuidado artesanal.",
  },
  {
    n: "03",
    icon: "❋",
    title: "Empacamos con amor",
    description: "Caja kraft, papel coreano o jarrón — el empaque forma parte del regalo y protege cada pétalo.",
  },
  {
    n: "04",
    icon: "❁",
    title: "Llevamos a tu puerta",
    description: "Entregamos en Bello, Niquía, Copacabana y norte de Medellín. Seguimiento en tiempo real.",
  },
];

export function ProcessSection() {
  return (
    <section
      style={{
        background: "#0a0807",
        borderTop: "1px solid rgba(247,241,234,0.14)",
        borderBottom: "1px solid rgba(247,241,234,0.14)",
      }}
    >
      {/* Section header */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 48,
            padding: "100px 0 60px",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-italiana), 'Italiana', serif",
                fontSize: 14,
                color: "#c9a27a",
                letterSpacing: "0.4em",
                display: "block",
                marginBottom: 18,
              }}
            >
              — III · Proceso
            </span>
            <h2
              style={{
                fontFamily: "var(--font-italiana), 'Italiana', serif",
                fontWeight: 400,
                fontSize: "clamp(40px, 5.4vw, 84px)",
                lineHeight: 1,
                letterSpacing: "0.02em",
                color: "#f7f1ea",
              }}
            >
              Del campo
              <br />
              a tus manos.
            </h2>
          </div>
          <p
            style={{
              maxWidth: 340,
              color: "#bfb5ab",
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontSize: 18,
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            Cuatro pasos cuidados al detalle, porque una flor merece llegar tan viva como nació.
          </p>
        </div>
      </div>

      {/* Steps grid — 4 columns with border lines */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: "rgba(247,241,234,0.14)",
          borderTop: "1px solid rgba(247,241,234,0.14)",
          borderBottom: "1px solid rgba(247,241,234,0.14)",
        }}
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            style={{
              background: "#0a0807",
              padding: "44px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              minHeight: 300,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-italiana), 'Italiana', serif",
                fontSize: 14,
                color: "#c9a27a",
                letterSpacing: "0.3em",
              }}
            >
              {step.n}
            </span>
            <h4
              style={{
                fontFamily: "var(--font-italiana), 'Italiana', serif",
                fontWeight: 400,
                fontSize: 28,
                lineHeight: 1.05,
                color: "#f7f1ea",
              }}
            >
              {step.title}
            </h4>
            <p
              style={{
                color: "#bfb5ab",
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
              }}
            >
              {step.description}
            </p>
            <div
              style={{
                width: 42,
                height: 42,
                border: "1px solid rgba(247,241,234,0.14)",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "#c9a27a",
                fontFamily: "var(--font-italiana), 'Italiana', serif",
                fontSize: 16,
                marginTop: "auto",
              }}
            >
              {step.icon}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
