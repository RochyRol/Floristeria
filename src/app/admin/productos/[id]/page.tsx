import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Editar Producto — Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, occasions] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { occasions: { include: { occasion: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.occasion.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      product={JSON.parse(JSON.stringify(product))}
      categories={categories}
      occasions={occasions}
    />
  );
}
