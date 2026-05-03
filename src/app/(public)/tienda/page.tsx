import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ShopPageClient } from "@/components/shop/shop-page-client";

export const metadata: Metadata = {
  title: "Tienda de Flores",
  description: "Explora nuestra colección completa de arreglos florales artesanales en Medellín.",
};

interface SearchParams {
  ocasion?: string;
  categoria?: string;
  precio_min?: string;
  precio_max?: string;
  orden?: string;
  buscar?: string;
  pagina?: string;
}

async function getProducts(params: SearchParams) {
  const where: Record<string, unknown> = { active: true };

  if (params.ocasion) {
    where.occasions = {
      some: { occasion: { slug: params.ocasion } },
    };
  }

  if (params.precio_min || params.precio_max) {
    where.basePrice = {};
    if (params.precio_min) (where.basePrice as Record<string, number>).gte = Number(params.precio_min);
    if (params.precio_max) (where.basePrice as Record<string, number>).lte = Number(params.precio_max);
  }

  if (params.buscar) {
    where.OR = [
      { name: { contains: params.buscar, mode: "insensitive" } },
      { description: { contains: params.buscar, mode: "insensitive" } },
      { tags: { has: params.buscar.toLowerCase() } },
    ];
  }

  const orderBy: Record<string, string> = {};
  switch (params.orden) {
    case "precio-asc":
      orderBy.basePrice = "asc";
      break;
    case "precio-desc":
      orderBy.basePrice = "desc";
      break;
    case "nuevos":
      orderBy.createdAt = "desc";
      break;
    default:
      orderBy.salesCount = "desc";
  }

  const page = Number(params.pagina) || 1;
  const perPage = 12;

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, perPage };
  } catch {
    return { products: [], total: 0, page: 1, perPage };
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

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [{ products, total, page, perPage }, occasions] = await Promise.all([
    getProducts(params),
    getOccasions(),
  ]);

  return (
    <ShopPageClient
      products={JSON.parse(JSON.stringify(products))}
      total={total}
      page={page}
      perPage={perPage}
      occasions={occasions}
      activeFilters={params}
    />
  );
}
