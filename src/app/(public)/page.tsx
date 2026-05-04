import { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { MarqueeSection } from "@/components/home/marquee-section";
import { OccasionsGrid } from "@/components/home/occasions-grid";
import { BestSellers } from "@/components/home/best-sellers";
import { ProcessSection } from "@/components/home/process-section";
import { QuoteSection } from "@/components/home/quote-section";
import { PressSection } from "@/components/home/press-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { MapSection } from "@/components/home/map-section";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Floristería Deco Imperio | Flores Artesanales en Medellín",
};

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { featured: true, active: true },
      take: 8,
      orderBy: { salesCount: "desc" },
    });
  } catch {
    return [];
  }
}

async function getOccasions() {
  try {
    return await prisma.occasion.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [rawProducts, occasions] = await Promise.all([
    getFeaturedProducts(),
    getOccasions(),
  ]);

  const featuredProducts = JSON.parse(JSON.stringify(rawProducts));

  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <OccasionsGrid occasions={occasions} />
      <BestSellers products={featuredProducts} />
      <ProcessSection />
      <QuoteSection />
      <PressSection />
      <TestimonialsSection />
      <MapSection />
    </>
  );
}
