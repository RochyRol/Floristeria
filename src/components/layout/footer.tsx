"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        background: "rgba(6,5,4,0.8)",
        borderTop: "1px solid rgba(247,241,234,0.14)",
        padding: "80px 0 0",
      }}
    >
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 48px" }}>
        {/* Main footer grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
            gap: 48,
            paddingBottom: 64,
          }}
        >
          {/* Brand */}
          <div>
            <h5
              style={{
                fontFamily: "var(--font-italiana), 'Italiana', serif",
                fontSize: 32,
                letterSpacing: "0.18em",
                color: "#f7f1ea",
                marginBottom: 18,
              }}
            >
              DECO·IMPERIO
            </h5>
            <p
              style={{
                color: "#bfb5ab",
                maxWidth: 340,
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                fontSize: 18,
                lineHeight: 1.55,
              }}
            >
              Floristería de autor en Medellín. Composiciones únicas, flor de temporada, oficio heredado.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
              <SocialLink href="https://instagram.com/floristeriaimperio_" aria="Instagram">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href="https://facebook.com" aria="Facebook">
                <FacebookIcon />
              </SocialLink>
              <SocialLink href="https://wa.me/573215039845" aria="WhatsApp">
                <WhatsAppIcon />
              </SocialLink>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h6
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#8a7f76",
                marginBottom: 18,
                fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
              }}
            >
              Ocasiones
            </h6>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { href: "/tienda?ocasion=amor", label: "Amor & Romance" },
                { href: "/tienda?ocasion=cumpleanos", label: "Cumpleaños" },
                { href: "/tienda?ocasion=aniversario", label: "Aniversario" },
                { href: "/tienda?ocasion=condolencias", label: "Condolencias" },
                { href: "/tienda?ocasion=nacimiento", label: "Nacimiento" },
                { href: "/tienda?ocasion=empresarial", label: "Empresarial" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      color: "#bfb5ab",
                      fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                      fontSize: 18,
                      transition: "color 0.25s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f7f1ea")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#bfb5ab")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h6
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#8a7f76",
                marginBottom: 18,
                fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
              }}
            >
              Ayuda
            </h6>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { href: "/contacto", label: "Contacto" },
                { href: "/politicas#envios", label: "Política de envíos" },
                { href: "/politicas#devoluciones", label: "Devoluciones" },
                { href: "/nosotros", label: "Nuestra historia" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      color: "#bfb5ab",
                      fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                      fontSize: 18,
                      transition: "color 0.25s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f7f1ea")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#bfb5ab")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h6
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#8a7f76",
                marginBottom: 18,
                fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
              }}
            >
              Newsletter
            </h6>
            <p
              style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: 18,
                color: "#bfb5ab",
                marginBottom: 12,
              }}
            >
              Una carta floral cada estación.
            </p>
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(247,241,234,0.2)",
                paddingBottom: 6,
                marginTop: 8,
              }}
            >
              <input
                placeholder="tu@correo.com"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#f7f1ea",
                  outline: "none",
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                  fontSize: 18,
                }}
              />
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#c9a27a",
                  cursor: "pointer",
                  fontFamily: "var(--font-italiana), 'Italiana', serif",
                  letterSpacing: "0.2em",
                  fontSize: 11,
                  textTransform: "uppercase",
                }}
              >
                Suscribir
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: 32,
            paddingBottom: 32,
            borderTop: "1px solid rgba(247,241,234,0.14)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#8a7f76",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            flexWrap: "wrap",
            gap: 16,
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
          }}
        >
          <div>© {new Date().getFullYear()} Deco·Imperio · Todos los derechos reservados</div>
          <div>Bello · Niquía · Medellín</div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, aria, children }: { href: string; aria: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={aria}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(247,241,234,0.14)",
        color: "#bfb5ab",
        transition: "color 0.25s, border-color 0.25s",
      }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "#f7f1ea"; el.style.borderColor = "rgba(247,241,234,0.4)"; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "#bfb5ab"; el.style.borderColor = "rgba(247,241,234,0.14)"; }}
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
