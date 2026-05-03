import Link from "next/link";

const footerLinks = {
  tienda: [
    { href: "/tienda?ocasion=amor", label: "Amor & Romance" },
    { href: "/tienda?ocasion=cumpleanos", label: "Cumpleaños" },
    { href: "/tienda?ocasion=aniversario", label: "Aniversario" },
    { href: "/tienda?ocasion=condolencias", label: "Condolencias" },
    { href: "/tienda?ocasion=nacimiento", label: "Nacimiento" },
    { href: "/tienda?ocasion=empresarial", label: "Empresarial" },
  ],
  ayuda: [
    { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
    { href: "/politicas#envios", label: "Política de envíos" },
    { href: "/politicas#devoluciones", label: "Devoluciones" },
    { href: "/politicas#privacidad", label: "Privacidad" },
    { href: "/contacto", label: "Contacto" },
  ],
  empresa: [
    { href: "/nosotros", label: "Nuestra historia" },
    { href: "/tienda", label: "Catálogo completo" },
    { href: "/admin", label: "Área de trabajo" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-forest text-cream/80">
      {/* Main footer */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-serif text-2xl text-cream">Deco Imperio</p>
              <p className="text-[10px] uppercase tracking-widest font-sans text-gold/80 mt-0.5">
                Floristería
              </p>
            </div>
            <p className="text-sm font-sans leading-relaxed text-cream/60">
              Flores que cuentan historias. Arreglos hechos a mano con amor en
              Bello, Niquía — Antioquia.
            </p>
            <div className="flex gap-3">
              <SocialLink href="https://instagram.com" aria="Instagram">
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
            <h4 className="text-xs uppercase tracking-brand font-sans font-medium text-cream/50 mb-5">
              Ocasiones
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.tienda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-sans text-cream/60 hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="text-xs uppercase tracking-brand font-sans font-medium text-cream/50 mb-5">
              Ayuda
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.ayuda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-sans text-cream/60 hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-xs uppercase tracking-brand font-sans font-medium text-cream/50 mb-5">
              Visítanos
            </h4>
            <address className="not-italic flex flex-col gap-3">
              <p className="text-sm font-sans text-cream/60">
                Av 33 No. 54 - 52
                <br />
                Medellín, Antioquia
              </p>
              <div className="flex flex-col gap-1.5">
                <a
                  href="tel:+573215039845"
                  className="text-sm font-sans text-cream/60 hover:text-cream transition-colors"
                >
                  321-503-9845
                </a>
                <a
                  href="tel:5965550"
                  className="text-sm font-sans text-cream/60 hover:text-cream transition-colors"
                >
                  596 5550
                </a>
              </div>
              <a
                href="mailto:info@floristeriadecoimperio.com"
                className="text-sm font-sans text-cream/60 hover:text-cream transition-colors"
              >
                info@floristeriadecoimperio.com
              </a>
              <div className="text-xs font-sans text-cream/40 mt-1">
                <p>Lun – Sáb: 8:30am – 8:00pm</p>
                <p>Dom: 11:00am – 7:00pm</p>
              </div>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10">
        <div className="max-w-8xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans text-cream/30">
            © {new Date().getFullYear()} Floristería Deco Imperio. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs font-sans text-cream/30">Pagos seguros con</span>
            <div className="flex gap-3 items-center">
              <PaymentBadge>Wompi</PaymentBadge>
              <PaymentBadge>PSE</PaymentBadge>
              <PaymentBadge>Efectivo</PaymentBadge>
            </div>
          </div>
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
      className="w-9 h-9 flex items-center justify-center rounded-sm border border-cream/10 text-cream/50 hover:text-cream hover:border-cream/30 transition-colors"
    >
      {children}
    </a>
  );
}

function PaymentBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-brand font-sans text-cream/30 border border-cream/10 px-2 py-0.5 rounded-sm">
      {children}
    </span>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
