"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/tienda", label: "Tienda" },
  { href: "/tienda?ocasion=amor", label: "Amor" },
  { href: "/tienda?ocasion=cumpleanos", label: "Cumpleaños" },
  { href: "/tienda?ocasion=empresarial", label: "Empresarial" },
  { href: "/nosotros", label: "Nosotros" },
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
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || !isHome
            ? "bg-cream/95 backdrop-blur-sm border-b border-forest/8 shadow-fine"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none group">
              <span
                className={cn(
                  "font-serif text-xl lg:text-2xl tracking-tight transition-colors",
                  scrolled || !isHome ? "text-forest" : "text-cream"
                )}
              >
                Deco Imperio
              </span>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest font-sans transition-colors",
                  scrolled || !isHome ? "text-gold" : "text-cream/70"
                )}
              >
                Floristería
              </span>
            </Link>

            {/* Nav links — desktop */}
            <ul className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-xs uppercase tracking-brand font-sans font-medium transition-colors duration-200",
                      scrolled || !isHome
                        ? "text-forest/70 hover:text-forest"
                        : "text-cream/80 hover:text-cream",
                      pathname === link.href && (scrolled || !isHome)
                        ? "text-terracotta"
                        : pathname === link.href
                        ? "text-cream"
                        : ""
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <Link
                href="/tienda"
                aria-label="Buscar"
                className={cn(
                  "hidden lg:flex w-9 h-9 items-center justify-center rounded-sm transition-colors",
                  scrolled || !isHome
                    ? "text-forest/60 hover:text-forest hover:bg-forest/5"
                    : "text-cream/70 hover:text-cream"
                )}
              >
                <SearchIcon />
              </Link>

              {/* Cuenta */}
              <Link
                href={session ? "/mi-cuenta" : "/login"}
                aria-label="Mi cuenta"
                className={cn(
                  "hidden lg:flex w-9 h-9 items-center justify-center rounded-sm transition-colors",
                  scrolled || !isHome
                    ? "text-forest/60 hover:text-forest hover:bg-forest/5"
                    : "text-cream/70 hover:text-cream"
                )}
              >
                <UserIcon />
              </Link>

              {/* Carrito */}
              <button
                onClick={() => setCartOpen(true)}
                aria-label={`Carrito (${itemCount} items)`}
                className={cn(
                  "relative flex w-9 h-9 items-center justify-center rounded-sm transition-colors",
                  scrolled || !isHome
                    ? "text-forest/60 hover:text-forest hover:bg-forest/5"
                    : "text-cream/70 hover:text-cream"
                )}
              >
                <CartIcon />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta text-cream text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              {/* Admin link */}
              {session?.user?.role && ["ADMIN", "SELLER"].includes(session.user.role) && (
                <Link
                  href="/admin"
                  className={cn(
                    "hidden lg:inline-flex text-xs uppercase tracking-brand font-sans font-medium px-3 py-1.5 rounded-sm border transition-colors",
                    scrolled || !isHome
                      ? "border-forest/20 text-forest/70 hover:border-forest/50 hover:text-forest"
                      : "border-cream/30 text-cream/70 hover:border-cream/60 hover:text-cream"
                  )}
                >
                  Admin
                </Link>
              )}

              {/* Hamburger — mobile */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menú"
                className={cn(
                  "lg:hidden flex flex-col gap-1.5 p-2 transition-colors",
                  scrolled || !isHome ? "text-forest" : "text-cream"
                )}
              >
                <span
                  className={cn(
                    "block w-5 h-0.5 bg-current transition-transform duration-300",
                    menuOpen && "rotate-45 translate-y-2"
                  )}
                />
                <span
                  className={cn(
                    "block w-5 h-0.5 bg-current transition-opacity duration-300",
                    menuOpen && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "block w-5 h-0.5 bg-current transition-transform duration-300",
                    menuOpen && "-rotate-45 -translate-y-2"
                  )}
                />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 top-16 z-40 bg-cream lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col px-6 py-8 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-2xl font-serif text-forest border-b border-forest/10 pb-4"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                <Link
                  href={session ? "/mi-cuenta" : "/login"}
                  className="text-sm font-sans uppercase tracking-brand text-forest/60"
                >
                  {session ? "Mi cuenta" : "Iniciar sesión"}
                </Link>
                <Link
                  href="/contacto"
                  className="text-sm font-sans uppercase tracking-brand text-forest/60"
                >
                  Contacto
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
