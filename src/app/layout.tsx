import type { Metadata } from "next";
import { Italiana, Cormorant_Garamond, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const italiana = Italiana({
  variable: "--font-italiana",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Floristería Deco Imperio | Flores Artesanales en Medellín",
    template: "%s | Floristería Deco Imperio",
  },
  description:
    "Arreglos florales hechos a mano en Medellín. Rosas, bouquets y flores para toda ocasión. Domicilios a Bello, Niquía, Copacabana y norte de Medellín.",
  keywords: ["floristería", "flores", "Medellín", "rosas", "arreglos florales", "domicilios", "Bello", "Niquía"],
  authors: [{ name: "Floristería Deco Imperio" }],
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://floristeriadecoimperio.com",
    siteName: "Floristería Deco Imperio",
    title: "Floristería Deco Imperio | Flores Artesanales en Medellín",
    description: "Flores que cuentan historias. Hechas a mano en Medellín.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Floristería Deco Imperio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Floristería Deco Imperio",
    description: "Flores que cuentan historias. Hechas a mano en Medellín.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${italiana.variable} ${cormorant.variable} ${manrope.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-noir text-parchment antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#f7f1ea",
                border: "1px solid rgba(247,241,234,0.14)",
                color: "#0a0807",
                fontFamily: "var(--font-manrope)",
                fontSize: "0.875rem",
                letterSpacing: "0.04em",
                borderRadius: "0px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
