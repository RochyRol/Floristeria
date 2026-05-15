"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/utils";

export function MapSection() {
  const mapUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=Floristería+Deco+Imperio,Medellín,Colombia&zoom=15`
    : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322094!2d-75.56899492365!3d6.350874893636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4427f1a4f9c8ff%3A0x0!2sAv+33+%2354-52%2C+Medell%C3%ADn!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco`;

  return (
    <section style={{ background: "#120e0c", borderTop: "1px solid rgba(247,241,234,0.06)" }}>
      <div
        className="max-w-8xl mx-auto"
        style={{ padding: "clamp(48px, 6vw, 80px) clamp(24px, 3vw, 48px)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Info column */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-8"
          >
            {/* Heading */}
            <div>
              <p
                className="uppercase mb-4"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  color: "#c9a27a",
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                }}
              >
                Encuéntranos
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-italiana), 'Italiana', serif",
                  fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  color: "#f7f1ea",
                  lineHeight: 1.15,
                  letterSpacing: "0.02em",
                }}
              >
                Visita nuestra floristería
              </h2>
            </div>

            {/* Info rows */}
            <div className="flex flex-col gap-5">
              <InfoRow icon={<LocationIcon />} label="Dirección" value="Av 33 No. 54 - 52, Medellín — Antioquia" />
              <InfoRow icon={<PhoneIcon />} label="Teléfonos" value="321-503-9845 / 596 5550" />
              <InfoRow
                icon={<ClockIcon />}
                label="Horario"
                value={
                  <>
                    <span className="block">Lun – Sáb: 8:30 am – 8:00 pm</span>
                    <span className="block">Dom: 11:00 am – 7:00 pm</span>
                  </>
                }
              />
              <InfoRow icon={<MapPinIcon />} label="Zona de cobertura" value="Bello, Niquía, Copacabana, Medellín Norte" />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                <button
                  style={{
                    background: "#c9a27a",
                    color: "#0a0807",
                    border: "none",
                    padding: "12px 24px",
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.25s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#d4b896")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#c9a27a")}
                >
                  Escríbenos por WhatsApp
                </button>
              </a>
              <Link href="/contacto">
                <button
                  style={{
                    background: "transparent",
                    color: "#bfb5ab",
                    border: "1px solid rgba(247,241,234,0.2)",
                    padding: "12px 24px",
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "color 0.25s, border-color 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "#f7f1ea";
                    el.style.borderColor = "rgba(247,241,234,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "#bfb5ab";
                    el.style.borderColor = "rgba(247,241,234,0.2)";
                  }}
                >
                  Formulario de contacto
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Map column */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="relative"
          >
            <div
              className="overflow-hidden aspect-[4/3]"
              style={{ border: "1px solid rgba(247,241,234,0.1)" }}
            >
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Floristería Deco Imperio"
                className="saturate-[0.6] brightness-[0.85] contrast-[1.1]"
              />
            </div>
            {/* Amber accent corner */}
            <div
              className="absolute -bottom-3 -right-3 w-20 h-20 -z-10"
              style={{ border: "1px solid rgba(201,162,122,0.25)" }}
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div
        className="flex items-center justify-center shrink-0 mt-0.5"
        style={{ width: 32, height: 32, color: "#c9a27a" }}
      >
        {icon}
      </div>
      <div>
        <p
          className="uppercase mb-0.5"
          style={{
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "#8a7f76",
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
          }}
        >
          {label}
        </p>
        <div
          style={{
            fontSize: 13,
            color: "#bfb5ab",
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}
