import { Metadata } from "next";
import { ContactoClient } from "./contacto-client";

export const metadata: Metadata = {
  title: "Contacto — Deco Imperio",
  description: "Contáctanos por WhatsApp, teléfono o email. Domicilios en Bello, Niquía, Copacabana y Medellín.",
};

export default function ContactoPage() {
  return <ContactoClient />;
}
