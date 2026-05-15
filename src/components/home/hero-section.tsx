"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getWhatsAppUrl } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-noir flex items-end">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=2000&q=85&auto=format&fit=crop')",
          filter: "brightness(0.78) saturate(1.05)",
        }}
      >
        {/* Multi-layer dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(120% 80% at 50% 110%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 45%, transparent 75%),
              linear-gradient(180deg, rgba(10,8,7,0.4) 0%, rgba(10,8,7,0) 22%, rgba(10,8,7,0) 60%, rgba(10,8,7,0.85) 100%)
            `,
          }}
        />
      </div>

      {/* Decorative frame */}
      <div
        className="absolute z-20 pointer-events-none hidden md:block"
        style={{ inset: "24px", border: "1px solid rgba(247,241,234,0.18)" }}
      >
        {/* Corner marks */}
        {[
          { pos: { top: -1, left: -1 }, borders: { borderRight: "none", borderBottom: "none" } },
          { pos: { top: -1, right: -1 }, borders: { borderLeft: "none", borderBottom: "none" } },
          { pos: { bottom: -1, left: -1 }, borders: { borderRight: "none", borderTop: "none" } },
          { pos: { bottom: -1, right: -1 }, borders: { borderLeft: "none", borderTop: "none" } },
        ].map((corner, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
            className="absolute"
            style={{
              width: 18,
              height: 18,
              border: "1px solid #f7f1ea",
              ...corner.pos,
              ...corner.borders,
            }}
          />
        ))}
      </div>

      {/* Year badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute z-30 hidden md:flex"
        style={{
          top: 64,
          right: 84,
          border: "1px solid #f7f1ea",
          borderRadius: 999,
          padding: "6px 18px",
          fontFamily: "var(--font-italiana), 'Italiana', serif",
          fontSize: 14,
          letterSpacing: "0.12em",
          color: "#f7f1ea",
        }}
      >
        Est. 1962
      </motion.div>

      {/* Side text — left (rotated) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute z-30 hidden lg:block"
        style={{
          top: "50%",
          left: 60,
          transform: "translateY(-50%) rotate(-90deg)",
          transformOrigin: "left top",
          fontSize: 12,
          letterSpacing: "0.2em",
          color: "#bfb5ab",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
        }}
      >
        Atelier · Bello, Niquía · Est. 1962
      </motion.div>

      {/* Side text — right (rotated) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute z-30 hidden lg:block"
        style={{
          top: "50%",
          right: 42,
          transform: "translateY(-50%) rotate(90deg)",
          transformOrigin: "right top",
          fontSize: 12,
          letterSpacing: "0.2em",
          color: "#bfb5ab",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
        }}
      >
        N° 001 — Colección Primavera
      </motion.div>

      {/* Main content — centered */}
      <div
        className="relative z-10 w-full flex flex-col justify-end items-center text-center"
        style={{ minHeight: "100vh", padding: "0 48px 96px", maxWidth: "1440px", margin: "0 auto" }}
      >
        {/* Flourish */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flourish mb-6"
          style={{ fontSize: 12, letterSpacing: "0.16em" }}
        >
          — Floristería de autor —
        </motion.div>

        {/* Main headline */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              fontFamily: "var(--font-italiana), 'Italiana', serif",
              fontWeight: 400,
              fontSize: "clamp(56px, 9vw, 128px)",
              lineHeight: 0.92,
              letterSpacing: "0.04em",
              color: "#f7f1ea",
              textShadow: "0 4px 40px rgba(0,0,0,0.6)",
              display: "block",
            }}
          >
            Floristería
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-8">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.22, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              fontFamily: "var(--font-italiana), 'Italiana', serif",
              fontWeight: 400,
              fontSize: "clamp(56px, 9vw, 128px)",
              lineHeight: 0.92,
              letterSpacing: "0.04em",
              color: "#f7f1ea",
              textShadow: "0 4px 40px rgba(0,0,0,0.6)",
              display: "block",
            }}
          >
            Deco·Imperio
          </motion.h1>
        </div>

        {/* Lede */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          style={{
            maxWidth: 560,
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 18,
            color: "#bfb5ab",
            lineHeight: 1.6,
            margin: "0 auto",
          }}
        >
          Composiciones florales únicas, hechas a mano en Bello, Niquía.
          Cada arreglo es una pieza irrepetible — efímera, como toda belleza verdadera.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="flex gap-4 items-center justify-center flex-wrap mt-10"
        >
          <Link href="/tienda" className="btn-luxury primary">
            <span>Ver Colecciones</span>
          </Link>
          <a
            href={getWhatsAppUrl("Hola, quiero hacer un pedido a medida.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury"
          >
            <span>Pedido a Medida</span>
            <ArrowIcon />
          </a>
        </motion.div>
      </div>

      {/* Scroll cue — centered bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-9 left-1/2 z-30 flex flex-col items-center gap-2.5"
        style={{ transform: "translateX(-50%)" }}
      >
        <span
          style={{
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#bfb5ab",
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
            fontWeight: 600,
          }}
        >
          Descubrir
        </span>
        <div className="relative overflow-hidden" style={{ width: 1, height: 36 }}>
          <div className="absolute inset-0" style={{ background: "#bfb5ab" }} />
          <motion.div
            animate={{ top: ["-50%", "100%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 right-0"
            style={{ height: "50%", background: "#f7f1ea" }}
          />
        </div>
      </motion.div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
