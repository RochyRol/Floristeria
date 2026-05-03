import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Floristería Deco Imperio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Floristería Deco Imperio",
    description: "Flores que cuentan historias. Hechas a mano en Medellín.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-cream text-forest antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#FAF7F2",
                border: "1px solid rgba(31,58,46,0.12)",
                color: "#1F3A2E",
                fontFamily: "var(--font-inter)",
                fontSize: "0.875rem",
                borderRadius: "4px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
