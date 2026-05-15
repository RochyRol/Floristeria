import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { sendToSheets, isSheetsConfigured } from "@/lib/sheets";

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

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "El pedido debe tener al menos un item" }, { status: 400 });
    }

    // Server-side validation: never trust client-supplied prices.
    // - For catalog items (with productId): re-fetch unitPrice from DB.
    // - For custom items (no productId): require client unitPrice > 0 and within sane bounds.
    // Always recompute subtotal/total server-side to prevent tampering.
    const MAX_UNIT_PRICE = 50_000_000; // 50M COP — sane upper bound
    const MAX_QUANTITY = 999;
    const validatedItems: Array<{
      productId: string | null;
      productName: string;
      productImage?: string;
      size?: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      dedication?: string;
    }> = [];

    for (const item of items) {
      if (!item.productName || typeof item.productName !== "string" || item.productName.trim().length < 3) {
        return NextResponse.json(
          { error: "Cada item requiere una descripción (mínimo 3 caracteres)" },
          { status: 400 }
        );
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
        return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
      }

      let unitPrice: number;
      if (item.productId) {
        // Re-fetch authoritative price from DB
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { basePrice: true, name: true },
        });
        if (!product) {
          return NextResponse.json({ error: `Producto no encontrado` }, { status: 400 });
        }
        unitPrice = Number(product.basePrice);
      } else {
        // Custom POS item — accept client price but validate bounds
        const clientPrice = Number(item.unitPrice);
        if (!Number.isFinite(clientPrice) || clientPrice <= 0 || clientPrice > MAX_UNIT_PRICE) {
          return NextResponse.json({ error: "Precio inválido en item personalizado" }, { status: 400 });
        }
        unitPrice = clientPrice;
      }

      validatedItems.push({
        productId: item.productId || null,
        productName: item.productName,
        productImage: item.productImage,
        size: item.size,
        quantity: qty,
        unitPrice,
        subtotal: unitPrice * qty,
        dedication: item.dedication,
      });
    }

    // Recompute totals from validated items
    const computedSubtotal = validatedItems.reduce((s, i) => s + i.subtotal, 0);
    const safeShippingCost = Math.max(0, Number(shippingCost) || 0);
    const computedTotal = computedSubtotal + safeShippingCost;

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
        subtotal: computedSubtotal,
        shippingCost: safeShippingCost,
        total: computedTotal,
        status: "RECEIVED",
        items: {
          create: validatedItems,
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

    // Update product sales count (solo para items con productId del catálogo)
    for (const item of validatedItems) {
      if (!item.productId) continue;
      await prisma.product.update({
        where: { id: item.productId },
        data: { salesCount: { increment: item.quantity } },
      }).catch(() => null);
    }

    // 🔄 Push to Google Sheets — fire-and-forget so it never blocks the order response.
    if (isSheetsConfigured()) {
      const customerEmail = session?.user?.email ?? buyerEmail ?? "";
      const customerName = session?.user?.name ?? buyerName ?? "";
      sendToSheets("order-created", {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        status: "RECEIVED",
        paymentMethod,
        paymentStatus: "PENDING",
        customerName,
        customerEmail,
        recipientName: sameAsBuyer ? buyerName : recipientName,
        recipientPhone: sameAsBuyer ? buyerPhone : recipientPhone,
        deliveryAddress,
        neighborhood,
        city,
        deliveryDate: deliveryDate || "",
        subtotal: computedSubtotal,
        shippingCost: safeShippingCost,
        discount: 0,
        total: computedTotal,
        couponCode: "",
        cardMessage: cardMessage || "",
        items: validatedItems.map((i) => ({
          productName: i.productName,
          size: i.size,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.subtotal,
          dedication: i.dedication,
        })),
      }).catch((err) => console.error("[sheets] order-created failed:", err));
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
