import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Atelier — Deco Imperio",
  description: "La historia de Floristería Deco Imperio. Arte floral artesanal en Bello, Niquía desde 2009.",
};

const BG   = "#0A0807";
const GOLD = "#A87C3A";
const P    = "#EDE8DF";
const M    = "rgba(237,232,223,0.5)";
const B    = "rgba(237,232,223,0.07)";

export default function NosotrosPage() {
  return (
    <div style={{ background: BG, minHeight: "100vh", paddingTop: 72 }}>

      {/* ── Hero cinematic ── */}
      <div className="relative overflow-hidden" style={{ height: "60vh", minHeight: 400 }}>
        <Image
          src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1800&q=85&fit=crop"
          alt="Atelier Deco Imperio"
          fill
          className="object-cover"
          style={{ filter: "brightness(0.45) saturate(0.9)" }}
          priority
        />
        {/* gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${BG}55 0%, transparent 30%, ${BG}cc 85%, ${BG} 100%)` }}
        />
        {/* decorative frame */}
        <div className="absolute pointer-events-none" style={{ inset: 20, border: `1px solid rgba(237,232,223,0.12)` }} />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <p style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope, sans-serif)", marginBottom: 16 }}>
            Desde 2009
          </p>
          <h1
            style={{
              fontFamily: "var(--font-italiana, serif)",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              color: P,
              lineHeight: 1,
              letterSpacing: "0.05em",
            }}
          >
            El Atelier
          </h1>
          <p style={{ marginTop: 16, fontSize: 15, fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)", fontStyle: "italic", color: M, maxWidth: 500, lineHeight: 1.7 }}>
            Quince años poniendo flores en los momentos que importan.
          </p>
        </div>

        {/* side label */}
        <p
          className="absolute hidden lg:block"
          style={{ top: "50%", left: 32, transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "left center", fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(237,232,223,0.3)", fontFamily: "var(--font-manrope, sans-serif)", whiteSpace: "nowrap" }}
        >
          Bello · Niquía · Antioquia
        </p>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-20">

        {/* Story block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-px" style={{ background: GOLD }} />
              <span style={{ fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope, sans-serif)" }}>
                Nuestra historia
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-italiana, serif)",
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                color: P,
                lineHeight: 1.2,
                letterSpacing: "0.04em",
                marginBottom: 24,
              }}
            >
              Nacimos de una pasión por la belleza natural
            </h2>
            <div style={{ fontSize: 14, fontFamily: "var(--font-manrope, sans-serif)", color: M, lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 16 }}>
              <p>
                Todo comenzó en 2009, cuando la fundadora de Deco Imperio decidió convertir su amor por las flores en un oficio. Lo que empezó como un pequeño puesto en el barrio Niquía de Bello, se convirtió con los años en una de las floristerías más queridas del norte de Medellín.
              </p>
              <p>
                Hoy, con más de quince años de experiencia, seguimos fieles al mismo principio: cada arreglo es una obra artesanal, hecha con las mejores flores de la Sabana de Bogotá y los jardines locales de Antioquia.
              </p>
              <p>
                Creemos que las flores tienen el poder de expresar lo que las palabras no pueden. Por eso, cada bouquet que sale de nuestro taller lleva un pedazo del corazón de quienes lo hicieron.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden" style={{ border: `1px solid ${B}` }}>
            <Image
              src="https://images.unsplash.com/photo-1596547608027-8bf2b955d62b?w=800&q=85&fit=crop"
              alt="Artesanas Deco Imperio"
              fill
              className="object-cover"
              style={{ filter: "brightness(0.85) saturate(0.95)" }}
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG}44 0%, transparent 40%)` }} />
          </div>
        </div>

        {/* Values */}
        <div style={{ marginBottom: 80 }}>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
              <span style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope, sans-serif)" }}>
                Filosofía
              </span>
              <span className="w-12 h-px" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
            </div>
            <h2 style={{ fontFamily: "var(--font-italiana, serif)", fontSize: "clamp(2rem, 4vw, 3rem)", color: P, letterSpacing: "0.04em" }}>
              Lo que nos mueve
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: `1px solid ${B}` }}>
            {[
              { title: "Frescura garantizada", text: "Compramos flores tres veces por semana para asegurar que lo que llega a tus manos es lo más fresco del mercado." },
              { title: "Hecho a mano",          text: "Ningún arreglo es igual a otro. Cada uno se diseña individualmente con criterio estético y amor artesanal." },
              { title: "Compromiso local",      text: "Priorizamos proveedores antioqueños y colombianos. Apoyamos la floricultura local y reducimos nuestro impacto ambiental." },
            ].map((val, i) => (
              <div
                key={val.title}
                className="text-center p-8"
                style={{
                  borderRight: i < 2 ? `1px solid ${B}` : "none",
                  borderBottom: "none",
                }}
              >
                <div className="mx-auto mb-5" style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1">
                    {i === 0 && <path d="M12 2C12 2 8 6 8 10a4 4 0 008 0C16 6 12 2 12 2z M12 10v10" />}
                    {i === 1 && <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-14v4l3 3" />}
                    {i === 2 && <path d="M12 21.7C5.4 21.7 1 18 1 13s4.4-8 11-8 11 3 11 8-4.4 8.7-11 8.7zM12 5V2m-4 3L6 3m8 2 2-2" />}
                  </svg>
                </div>
                <h3 style={{ fontFamily: "var(--font-italiana, serif)", fontSize: 20, color: P, marginBottom: 10, letterSpacing: "0.04em" }}>
                  {val.title}
                </h3>
                <p style={{ fontSize: 13, fontFamily: "var(--font-manrope, sans-serif)", color: M, lineHeight: 1.75 }}>
                  {val.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA section */}
        <div
          className="text-center py-16 px-8"
          style={{ border: `1px solid ${B}`, position: "relative", overflow: "hidden" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, rgba(168,124,58,0.06) 0%, transparent 70%)` }}
          />
          <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope, sans-serif)", marginBottom: 14 }}>
            ¿Tienes algo que celebrar?
          </p>
          <h2 style={{ fontFamily: "var(--font-italiana, serif)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: P, marginBottom: 12, letterSpacing: "0.04em" }}>
            Cuéntanos la historia,<br />nosotros ponemos las flores.
          </h2>
          <p style={{ fontSize: 14, fontFamily: "var(--font-manrope, sans-serif)", color: M, maxWidth: 400, margin: "0 auto 28px" }}>
            Diseñamos arreglos a medida para bodas, eventos corporativos, cumpleaños y cada momento especial.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/tienda"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "var(--font-manrope, sans-serif)",
                background: GOLD,
                color: "#0A0807",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Ver colecciones
            </Link>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "var(--font-manrope, sans-serif)",
                background: "transparent",
                border: `1px solid rgba(237,232,223,0.2)`,
                color: P,
                textDecoration: "none",
              }}
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
