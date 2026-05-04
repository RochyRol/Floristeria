"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/tienda", label: "Colecciones" },
  { href: "/nosotros", label: "Atelier" },
  { href: "/tienda?ocasion=empresarial", label: "Eventos" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.itemCount());
  const setCartOpen = useCartStore((s) => s.setOpen);

  const isHome = pathname === "/";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-400",
          scrolled || !isHome
            ? "border-b px-12 py-3.5"
            : "px-12 py-5"
        )}
        style={{
          background: scrolled || !isHome ? "rgba(10,8,7,0.92)" : "transparent",
          backdropFilter: scrolled || !isHome ? "blur(16px)" : "none",
          borderColor: "rgba(247,241,234,0.14)",
          paddingLeft: "clamp(24px, 3vw, 48px)",
          paddingRight: "clamp(24px, 3vw, 48px)",
        }}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              border: "1px solid #f7f1ea",
              borderRadius: "50%",
              fontFamily: "var(--font-italiana), 'Italiana', serif",
              fontSize: 15,
              color: "#f7f1ea",
              flexShrink: 0,
              transition: "border-color 0.3s",
            }}
          >
            D
          </div>
          <span
            style={{
              fontFamily: "var(--font-italiana), 'Italiana', serif",
              fontSize: 20,
              letterSpacing: "0.28em",
              color: "#f7f1ea",
            }}
          >
            DECO·IMPERIO
          </span>
        </Link>

        {/* Nav links — desktop */}
        <ul className="hidden lg:flex items-center gap-9" style={{ listStyle: "none" }}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative"
                style={{
                  fontSize: 12,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: pathname === link.href ? "#f7f1ea" : "#bfb5ab",
                  transition: "color 0.25s",
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f7f1ea")}
                onMouseLeave={(e) => (e.currentTarget.style.color = pathname === link.href ? "#f7f1ea" : "#bfb5ab")}
              >
                {link.label}
                {pathname === link.href && (
                  <span
                    className="absolute left-0 right-0"
                    style={{ bottom: -6, height: 1, background: "#f7f1ea" }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div
            className="hidden lg:flex items-center gap-4"
            style={{
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#bfb5ab",
              fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
            }}
          >
            <Link
              href={session ? "/mi-cuenta" : "/login"}
              className="hidden lg:block"
              style={{ color: "#bfb5ab", transition: "color 0.25s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f7f1ea")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#bfb5ab")}
            >
              <UserIcon />
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 relative"
              style={{ background: "none", border: "none", color: "#bfb5ab", cursor: "pointer", transition: "color 0.25s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f7f1ea")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#bfb5ab")}
              aria-label={`Cesta (${itemCount})`}
            >
              <BagIcon />
              <span>Cesta</span>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#c9a27a",
                    color: "#0a0807",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 0,
                    fontFamily: "var(--font-manrope), sans-serif",
                  }}
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
              )}
            </button>

            {session?.user?.role && ["ADMIN", "SELLER"].includes(session.user.role) && (
              <Link
                href="/admin"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  border: "1px solid rgba(247,241,234,0.2)",
                  padding: "6px 12px",
                  color: "#bfb5ab",
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f7f1ea"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(247,241,234,0.5)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#bfb5ab"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(247,241,234,0.2)"; }}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-[5px] p-2"
            aria-label="Menú"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#f7f1ea" }}
          >
            <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} transition={{ duration: 0.25 }} className="block" style={{ width: 20, height: 1, background: "currentColor" }} />
            <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} transition={{ duration: 0.2 }} className="block" style={{ width: 20, height: 1, background: "currentColor" }} />
            <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} transition={{ duration: 0.25 }} className="block" style={{ width: 20, height: 1, background: "currentColor" }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-0 z-40 lg:hidden overflow-y-auto flex flex-col"
            style={{ background: "#0a0807", top: 0 }}
          >
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(247,241,234,0.14)" }}>
              <Link href="/" style={{ fontFamily: "var(--font-italiana), 'Italiana', serif", fontSize: 20, letterSpacing: "0.28em", color: "#f7f1ea" }}>
                DECO·IMPERIO
              </Link>
              <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f7f1ea", fontSize: 24 }}>×</button>
            </div>
            <div className="flex flex-col px-6 py-8 gap-0 flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 + 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center justify-between py-5"
                    style={{ borderBottom: "1px solid rgba(247,241,234,0.1)" }}
                  >
                    <span style={{ fontFamily: "var(--font-italiana), 'Italiana', serif", fontSize: 32, color: "#f7f1ea" }}>
                      {link.label}
                    </span>
                    <ArrowRightIcon />
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="px-6 pb-8 flex gap-6" style={{ borderTop: "1px solid rgba(247,241,234,0.1)", paddingTop: 24 }}>
              <Link href={session ? "/mi-cuenta" : "/login"} style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#bfb5ab", fontFamily: "var(--font-manrope)", transition: "color 0.25s" }}>
                {session ? "Mi cuenta" : "Iniciar sesión"}
              </Link>
              <button
                onClick={() => { setMenuOpen(false); setCartOpen(true); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#bfb5ab", fontFamily: "var(--font-manrope)" }}
              >
                Cesta {itemCount > 0 ? `(${itemCount})` : ""}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 8h14l-1.2 12a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#c9a27a" }}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
