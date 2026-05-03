import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "@/components/shop/product-detail-client";
import { formatCOP } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug, active: true },
      include: {
        category: true,
        occasions: { include: { occasion: true } },
      },
    });
  } catch {
    return null;
  }
}

async function getRelatedProducts(productId: string, categoryId: string | null) {
  try {
    return await prisma.product.findMany({
      where: {
        active: true,
        NOT: { id: productId },
        ...(categoryId ? { categoryId } : {}),
      },
      take: 4,
      orderBy: { salesCount: "desc" },
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | Floristería Deco Imperio`,
      description: product.description.slice(0, 160),
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId);

  return (
    <ProductDetailClient
      product={JSON.parse(JSON.stringify(product))}
      relatedProducts={JSON.parse(JSON.stringify(relatedProducts))}
    />
  );
}
