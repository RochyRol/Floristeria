"use client";

import { getWhatsAppUrl } from "@/lib/utils";

const BG   = "#0A0807";
const GOLD = "#A87C3A";
const P    = "#EDE8DF";
const M    = "rgba(237,232,223,0.5)";
const B    = "rgba(237,232,223,0.07)";
const MAP_URL = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322094!2d-75.56899492365!3d6.350874893636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4427f1a4f9c8ff%3A0x0!2sAv+33+%2354-52%2C+Medell%C3%ADn!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco`;

const contactMethods = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49" />
      </svg>
    ),
    label: "WhatsApp",
    value: "321-503-9845",
    sub: "Respuesta inmediata",
    href: getWhatsAppUrl(),
    color: "#25D366",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: "Teléfono",
    value: "321-503-9845",
    sub: "Lun–Sáb 8:30am–8pm",
    href: "tel:3215039845",
    color: GOLD,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "Email",
    value: "info@decoimperio.co",
    sub: "Respuesta en 24h",
    href: "mailto:info@decoimperio.co",
    color: GOLD,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Dirección",
    value: "Av 33 No. 54–52",
    sub: "Bello, Niquía · Antioquia",
    href: "https://maps.google.com/?q=Av+33+54-52+Medellin",
    color: GOLD,
  },
];

const coverageZones = ["Bello", "Niquía", "Copacabana", "Medellín Norte", "Castilla", "Aranjuez"];

export function ContactoClient() {
  return (
    <div style={{ background: BG, minHeight: "100vh", paddingTop: 72 }}>

      {/* ── Page hero ── */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-16 lg:py-24" style={{ borderBottom: `1px solid ${B}` }}>
        <div className="flex items-center gap-3 mb-5">
          <span className="w-8 h-px" style={{ background: GOLD }} />
          <span style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope, sans-serif)" }}>
            Estamos aquí para ti
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-italiana, serif)", fontSize: "clamp(2.8rem, 7vw, 5.5rem)", color: P, lineHeight: 1, letterSpacing: "0.04em", marginBottom: 16 }}>
          Contáctanos
        </h1>
        <p style={{ fontSize: 15, fontFamily: "var(--font-manrope, sans-serif)", color: M, maxWidth: 500, lineHeight: 1.7 }}>
          Responderemos tu mensaje lo antes posible. Para una respuesta más rápida, escríbenos directo por WhatsApp.
        </p>
      </div>

      {/* ── Contact cards ── */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ border: `1px solid ${B}`, background: B }}>
          {contactMethods.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group block transition-colors duration-200 hover:bg-white/[0.025]"
              style={{ background: BG, padding: "28px 24px", textDecoration: "none" }}
            >
              <div style={{ color: c.color, marginBottom: 16 }}>{c.icon}</div>
              <p style={{ fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(237,232,223,0.3)", fontFamily: "var(--font-manrope, sans-serif)", marginBottom: 6 }}>
                {c.label}
              </p>
              <p style={{ fontSize: 15, fontFamily: "var(--font-italiana, serif)", color: P, letterSpacing: "0.03em", marginBottom: 4 }}>
                {c.value}
              </p>
              <p style={{ fontSize: 11, fontFamily: "var(--font-manrope, sans-serif)", color: M }}>
                {c.sub}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* ── Schedule + Coverage ── */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ border: `1px solid ${B}`, background: B }}>
          <div style={{ background: BG, padding: "32px 28px" }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-4 h-px" style={{ background: GOLD }} />
              <span style={{ fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope, sans-serif)" }}>Horarios</span>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { dia: "Lunes — Sábado", hora: "8:30 am – 8:00 pm" },
                { dia: "Domingo",         hora: "11:00 am – 7:00 pm" },
                { dia: "Días festivos",   hora: "Consultar disponibilidad" },
              ].map((h) => (
                <div key={h.dia} className="flex items-baseline justify-between" style={{ paddingBottom: 12, borderBottom: `1px solid ${B}` }}>
                  <span style={{ fontSize: 13, fontFamily: "var(--font-manrope, sans-serif)", color: M }}>{h.dia}</span>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-italiana, serif)", color: P, letterSpacing: "0.05em" }}>{h.hora}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: BG, padding: "32px 28px" }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-4 h-px" style={{ background: GOLD }} />
              <span style={{ fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-manrope, sans-serif)" }}>Zona de domicilios</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {coverageZones.map((zone) => (
                <span key={zone} style={{ display: "inline-block", padding: "5px 14px", fontSize: 11, fontFamily: "var(--font-manrope, sans-serif)", color: P, border: `1px solid rgba(237,232,223,0.1)`, letterSpacing: "0.06em" }}>
                  {zone}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 12, fontFamily: "var(--font-manrope, sans-serif)", color: M, lineHeight: 1.6, marginTop: 12 }}>
              ¿Tu zona no aparece? Contáctanos — muchas veces podemos llegar más lejos con previo aviso.
            </p>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12 pb-20">
        <div style={{ border: `1px solid ${B}`, overflow: "hidden" }}>
          <iframe
            src={MAP_URL}
            width="100%"
            height="400"
            style={{ border: 0, display: "block", filter: "brightness(0.75) saturate(0.5) contrast(1.1)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Floristería Deco Imperio"
          />
        </div>
        <p style={{ marginTop: 12, fontSize: 12, fontFamily: "var(--font-manrope, sans-serif)", color: "rgba(237,232,223,0.25)", textAlign: "center", letterSpacing: "0.06em" }}>
          Av 33 No. 54–52 · Bello, Niquía · Antioquia, Colombia
        </p>
      </div>

      {/* ── WhatsApp CTA ── */}
      <div style={{ borderTop: `1px solid ${B}`, padding: "64px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center bottom, rgba(37,211,102,0.04) 0%, transparent 60%)` }} />
        <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "#25D366", fontFamily: "var(--font-manrope, sans-serif)", marginBottom: 12 }}>
          La forma más rápida
        </p>
        <h2 style={{ fontFamily: "var(--font-italiana, serif)", fontSize: "clamp(1.8rem, 4vw, 3rem)", color: P, marginBottom: 10, letterSpacing: "0.04em" }}>
          Escríbenos por WhatsApp
        </h2>
        <p style={{ fontSize: 14, fontFamily: "var(--font-manrope, sans-serif)", color: M, maxWidth: 380, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Respuesta inmediata. Cuéntanos tu ocasión y diseñamos el arreglo perfecto para ti.
        </p>
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 transition-colors duration-200 hover:bg-[rgba(37,211,102,0.18)]"
          style={{ padding: "14px 32px", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-manrope, sans-serif)", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", color: "#25D366", textDecoration: "none" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49" />
          </svg>
          Abrir WhatsApp
        </a>
      </div>
    </div>
  );
}
