import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TrackingClient } from "@/components/tracking/tracking-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return { title: `Seguimiento ${orderNumber} | Deco Imperio` };
}

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      status: true,
      recipientName: true,
      deliveryAddress: true,
      deliveryDate: true,
      deliveryTime: true,
      createdAt: true,
      items: {
        select: { productName: true, quantity: true, size: true },
      },
      statusHistory: {
        orderBy: { timestamp: "asc" },
        select: { status: true, note: true, timestamp: true },
      },
    },
  }).catch(() => null);

  if (!order) notFound();

  return <TrackingClient order={JSON.parse(JSON.stringify(order))} />;
}
