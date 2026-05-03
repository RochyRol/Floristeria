import { prisma } from "@/lib/prisma";
import { PosClient } from "@/components/admin/pos-client";

export const metadata = { title: "POS — Admin" };

export default async function PosPage() {
  const products = await prisma.product
    .findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        basePrice: true,
        images: true,
        stock: true,
        category: { select: { name: true } },
      },
    })
    .catch(() => []);

  return <PosClient products={JSON.parse(JSON.stringify(products))} />;
}
