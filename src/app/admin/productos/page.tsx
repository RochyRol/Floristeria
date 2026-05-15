import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Productos — Admin" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  }).catch(() => []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-sans text-forest/50">{products.length} productos</p>
        <Link href="/admin/productos/nuevo">
          <Button size="sm">+ Nuevo producto</Button>
        </Link>
      </div>

      <div className="bg-white border border-forest/8 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-forest/8">
                {["", "Nombre", "Precio", "Categoría", "Stock", "Estado", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[12px] uppercase font-sans font-bold text-forest/40"
                    style={{ letterSpacing: "0.08em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm font-sans text-forest/40">
                    No hay productos. Crea el primero.
                  </td>
                </tr>
              ) : (
                products.map((product: typeof products[0]) => (
                  <tr key={product.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-4 py-3 w-14">
                      <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-cream-darker">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-sans font-medium text-forest">{product.name}</p>
                      {product.tagline && (
                        <p className="text-[12px] font-sans text-forest/40 line-clamp-1">
                          {product.tagline}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-serif text-sm text-forest price">
                      {formatCOP(Number(product.basePrice))}
                    </td>
                    <td className="px-4 py-3 text-sm font-sans text-forest/60">
                      {product.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-sans text-forest/60">
                      {product.stock}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge text-[11px] ${
                          product.active
                            ? "bg-forest/10 text-forest"
                            : "bg-burgundy/10 text-burgundy"
                        }`}
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="text-xs font-sans text-forest/40 hover:text-forest transition-colors"
                      >
                        Editar →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
