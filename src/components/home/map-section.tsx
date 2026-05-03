"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/lib/utils";

export function MapSection() {
  const mapUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=Floristería+Deco+Imperio,Medellín,Colombia&zoom=15`
    : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322094!2d-75.56899492365!3d6.350874893636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4427f1a4f9c8ff%3A0x0!2sAv+33+%2354-52%2C+Medell%C3%ADn!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco`;

  return (
    <section className="py-24 lg:py-32 bg-cream-dark/40">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div>
              <p className="text-xs uppercase tracking-widest font-sans font-medium text-gold mb-3">
                Encuéntranos
              </p>
              <h2 className="font-serif text-display-sm text-forest leading-tight">
                Visita nuestra
                <br />
                floristería
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <InfoRow
                icon={<LocationIcon />}
                label="Dirección"
                value="Av 33 No. 54 - 52, Medellín — Antioquia"
              />
              <InfoRow
                icon={<PhoneIcon />}
                label="Teléfonos"
                value="321-503-9845 / 596 5550"
              />
              <InfoRow
                icon={<ClockIcon />}
                label="Horario"
                value={
                  <>
                    <span className="block">Lun – Sáb: 8:30am – 8:00pm</span>
                    <span className="block">Dom: 11:00am – 7:00pm</span>
                  </>
                }
              />
              <InfoRow
                icon={<MapPinIcon />}
                label="Zona de cobertura"
                value="Bello, Niquía, Copacabana, Medellín Norte"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="md">
                  Escríbenos por WhatsApp
                </Button>
              </a>
              <Link href="/contacto">
                <Button variant="outline" size="md">
                  Formulario de contacto
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-sm overflow-hidden border border-forest/10 shadow-card aspect-[4/3]">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Floristería Deco Imperio"
                className="grayscale contrast-110"
              />
            </div>
            {/* Decorative corner */}
            <div className="absolute -bottom-3 -right-3 w-24 h-24 border border-gold/20 rounded-sm -z-10" />
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
      <div className="w-8 h-8 flex items-center justify-center shrink-0 text-terracotta mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/40 mb-0.5">
          {label}
        </p>
        <div className="text-sm font-sans text-forest/80">{value}</div>
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
