import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { OrderDetailClient } from "@/components/admin/order-detail-client";

export const metadata = { title: "Detalle de pedido — Admin" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, session] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { name: true, images: true, slug: true } } } },
        customer: { select: { name: true, email: true, phone: true } },
        statusHistory: { orderBy: { timestamp: "asc" } },
      },
    }),
    auth(),
  ]);

  if (!order) notFound();

  return (
    <OrderDetailClient
      order={JSON.parse(JSON.stringify(order))}
      role={session?.user?.role ?? "SELLER"}
    />
  );
}
