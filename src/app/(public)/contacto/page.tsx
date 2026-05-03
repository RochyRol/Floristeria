import { Metadata } from "next";
import { MapSection } from "@/components/home/map-section";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contáctanos por WhatsApp, teléfono o email. Domicilios en Bello, Niquía, Copacabana y Medellín.",
};

export default function ContactoPage() {
  return (
    <div className="pt-20 min-h-screen bg-cream">
      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-16 border-b border-forest/8">
        <p className="text-xs uppercase tracking-widest font-sans font-medium text-gold mb-3">
          Estamos aquí para ti
        </p>
        <h1 className="font-serif text-display-sm text-forest">Contáctanos</h1>
        <p className="mt-3 text-base font-sans text-forest/60 max-w-lg">
          Responderemos tu mensaje lo antes posible. También puedes escribirnos directo por WhatsApp para una respuesta más rápida.
        </p>
      </div>
      <MapSection />
    </div>
  );
}
