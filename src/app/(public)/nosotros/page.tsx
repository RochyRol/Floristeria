import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nuestra historia",
  description: "Conoce la historia de Floristería Deco Imperio, 15 años llenando de flores los momentos especiales de Medellín.",
};

export default function NosotrosPage() {
  return (
    <div className="pt-20 min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1800&q=85&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-forest/65" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-xs uppercase tracking-widest font-sans text-gold mb-3">Desde 2009</p>
          <h1 className="font-serif text-display-md text-cream">Nuestra historia</h1>
          <p className="mt-4 text-base font-sans text-cream/70 max-w-lg">
            Quince años poniendo flores en los momentos que importan.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="font-serif text-display-sm text-forest mb-6">
              Nacimos de una pasión por la belleza natural
            </h2>
            <div className="prose-editorial">
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
          <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1596547608027-8bf2b955d62b?w=800&q=85&fit=crop"
              alt="Floristería Deco Imperio"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-display-sm text-forest">Lo que nos mueve</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: "Frescura garantizada", text: "Compramos flores tres veces por semana para asegurar que lo que llega a tus manos es lo más fresco del mercado." },
              { title: "Hecho a mano", text: "Ningún arreglo es igual a otro. Cada uno se diseña individualmente con criterio estético y amor artesanal." },
              { title: "Compromiso local", text: "Priorizamos proveedores antioqueños y colombianos. Apoyamos la floricultura local y reducimos nuestro impacto ambiental." },
            ].map((val) => (
              <div key={val.title} className="text-center">
                <div className="w-12 h-px bg-terracotta mx-auto mb-4" />
                <h3 className="font-serif text-lg text-forest mb-2">{val.title}</h3>
                <p className="text-sm font-sans text-forest/60 leading-relaxed">{val.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-serif text-2xl text-forest mb-4">¿Tienes algo que celebrar?</h2>
          <p className="text-sm font-sans text-forest/60 mb-6">
            Cuéntanos la historia y nosotros ponemos las flores.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/tienda"><Button>Ver tienda</Button></Link>
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Hablar por WhatsApp</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
