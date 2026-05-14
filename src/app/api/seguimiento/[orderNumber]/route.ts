import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
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
        select: {
          productName: true,
          quantity: true,
          size: true,
        },
      },
      statusHistory: {
        orderBy: { timestamp: "asc" },
        select: { status: true, note: true, timestamp: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  return NextResponse.json(order);
}
