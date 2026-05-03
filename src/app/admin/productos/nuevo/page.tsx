import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Nuevo Producto — Admin" };

export default async function NewProductPage() {
  const [categories, occasions] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }).catch(() => []),
    prisma.occasion.findMany({ orderBy: { name: "asc" } }).catch(() => []),
  ]);

  return <ProductForm categories={categories} occasions={occasions} />;
}
