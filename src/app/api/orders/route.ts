import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const {
      buyerName,
      buyerEmail,
      buyerPhone,
      recipientName,
      recipientPhone,
      sameAsBuyer,
      deliveryAddress,
      neighborhood,
      city,
      deliveryZone,
      deliveryDate,
      deliveryTime,
      cardMessage,
      deliveryNotes,
      paymentMethod,
      items,
      subtotal,
      shippingCost,
      total,
    } = body;

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id || null,
        recipientName: sameAsBuyer ? buyerName : recipientName,
        recipientPhone: sameAsBuyer ? buyerPhone : recipientPhone,
        deliveryAddress,
        neighborhood,
        city,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryTime,
        cardMessage,
        deliveryNotes,
        paymentMethod,
        subtotal,
        shippingCost,
        total,
        status: "RECEIVED",
        items: {
          create: items.map((item: {
            productId: string;
            productName: string;
            productImage?: string;
            size?: string;
            quantity: number;
            unitPrice: number;
            subtotal: number;
            dedication?: string;
          }) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            dedication: item.dedication,
          })),
        },
        statusHistory: {
          create: {
            status: "RECEIVED",
            note: "Pedido recibido en línea",
            changedBy: session?.user?.id || null,
          },
        },
      },
    });

    // Update product sales count
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { salesCount: { increment: item.quantity } },
      }).catch(() => null);
    }

    return NextResponse.json({ orderNumber: order.orderNumber, id: order.id });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Error al crear el pedido" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("pagina")) || 1;
  const perPage = 10;

  const isAdmin = ["ADMIN", "SELLER", "FLORIST", "DELIVERY"].includes(session.user.role);

  const where = isAdmin ? {} : { userId: session.user.id };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        items: true,
        statusHistory: { orderBy: { timestamp: "asc" } },
        customer: { select: { name: true, email: true, phone: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, perPage });
}
