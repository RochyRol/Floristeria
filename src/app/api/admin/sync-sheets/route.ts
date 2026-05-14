import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendToSheets, SEED_PASSWORDS, isSheetsConfigured } from "@/lib/sheets";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isSheetsConfigured()) {
    return NextResponse.json(
      { error: "Configura GOOGLE_SHEETS_WEBHOOK_URL y SHEETS_SYNC_SECRET en .env" },
      { status: 500 },
    );
  }

  try {
    // Pull everything in parallel
    const [
      users,
      products,
      categories,
      occasions,
      orders,
      addresses,
      coupons,
      favorites,
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true, email: true, password: true, name: true, phone: true,
          role: true, active: true, createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.product.findMany({
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.occasion.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.order.findMany({
        include: {
          items: { include: { product: { select: { name: true } } } },
          customer: { select: { name: true, email: true } },
          statusHistory: { orderBy: { timestamp: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.address.findMany({
        include: { user: { select: { email: true } } },
      }),
      prisma.coupon.findMany(),
      prisma.favorite.findMany({
        include: {
          user: { select: { email: true } },
          product: { select: { name: true } },
        },
      }),
    ]);

    // Shape each table for the sheet
    const userRows = users.map(u => ({
      id: u.id,
      email: u.email,
      passwordPlain: SEED_PASSWORDS[u.email] ?? "",
      passwordHash: u.password ?? "",
      name: u.name,
      phone: u.phone ?? "",
      role: u.role,
      active: u.active,
      createdAt: u.createdAt.toISOString(),
    }));

    const productRows = products.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline ?? "",
      basePrice: Number(p.basePrice),
      categoryName: p.category?.name ?? "",
      stock: p.stock,
      salesCount: p.salesCount,
      featured: p.featured,
      active: p.active,
      createdAt: p.createdAt.toISOString(),
    }));

    const categoryRows = categories.map(c => ({
      id: c.id, slug: c.slug, name: c.name,
      description: c.description ?? "",
      active: c.active, sortOrder: c.sortOrder,
    }));

    const occasionRows = occasions.map(o => ({
      id: o.id, slug: o.slug, name: o.name,
      description: o.description ?? "",
      active: o.active, sortOrder: o.sortOrder,
    }));

    const orderRows = orders.map(o => ({
      orderNumber: o.orderNumber,
      createdAt: o.createdAt.toISOString(),
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      customerName: o.customer?.name ?? "",
      customerEmail: o.customer?.email ?? "",
      recipientName: o.recipientName,
      recipientPhone: o.recipientPhone,
      deliveryAddress: o.deliveryAddress ?? "",
      neighborhood: o.neighborhood ?? "",
      city: o.city,
      deliveryDate: o.deliveryDate?.toISOString() ?? "",
      subtotal: Number(o.subtotal),
      shippingCost: Number(o.shippingCost),
      discount: Number(o.discount),
      total: Number(o.total),
      couponCode: o.couponCode ?? "",
      cardMessage: o.cardMessage ?? "",
    }));

    const orderItemRows = orders.flatMap(o =>
      o.items.map(i => ({
        orderNumber: o.orderNumber,
        productName: i.productName,
        size: i.size ?? "",
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
        dedication: i.dedication ?? "",
      })),
    );

    const statusHistoryRows = orders.flatMap(o =>
      o.statusHistory.map(h => ({
        orderNumber: o.orderNumber,
        status: h.status,
        note: h.note ?? "",
        changedBy: h.changedBy ?? "",
        timestamp: h.timestamp.toISOString(),
      })),
    );

    const addressRows = addresses.map(a => ({
      id: a.id,
      userEmail: a.user?.email ?? "",
      label: a.label,
      street: a.street,
      neighborhood: a.neighborhood ?? "",
      city: a.city,
      department: a.department,
      isDefault: a.isDefault,
    }));

    const couponRows = coupons.map(c => ({
      code: c.code,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
      maxUses: c.maxUses ?? null,
      usedCount: c.usedCount,
      active: c.active,
      expiresAt: c.expiresAt?.toISOString() ?? "",
    }));

    const favoriteRows = favorites.map(f => ({
      userEmail: f.user?.email ?? "",
      productName: f.product?.name ?? "",
      createdAt: f.createdAt.toISOString(),
    }));

    // Summary metrics
    const totalRevenue = orderRows
      .filter(o => o.status !== "CANCELLED")
      .reduce((s, o) => s + o.total, 0);
    const totalUnitsSold = orderItemRows.reduce((s, i) => s + i.quantity, 0);

    const summary = [
      { metric: "Última sincronización", value: new Date().toISOString() },
      { metric: "Total usuarios", value: userRows.length },
      { metric: "Total productos", value: productRows.length },
      { metric: "Productos activos", value: productRows.filter(p => p.active).length },
      { metric: "Total pedidos", value: orderRows.length },
      { metric: "Pedidos entregados", value: orderRows.filter(o => o.status === "DELIVERED").length },
      { metric: "Pedidos cancelados", value: orderRows.filter(o => o.status === "CANCELLED").length },
      { metric: "Ingresos totales (COP)", value: totalRevenue },
      { metric: "Unidades vendidas", value: totalUnitsSold },
      { metric: "Ticket promedio (COP)", value: orderRows.length > 0 ? Math.round(totalRevenue / orderRows.length) : 0 },
      { metric: "Total clientes (CLIENT)", value: userRows.filter(u => u.role === "CLIENT").length },
      { metric: "Cupones activos", value: couponRows.filter(c => c.active).length },
      { metric: "Favoritos guardados", value: favoriteRows.length },
    ];

    const result = await sendToSheets("full-sync", {
      users: userRows,
      products: productRows,
      categories: categoryRows,
      occasions: occasionRows,
      orders: orderRows,
      orderItems: orderItemRows,
      statusHistory: statusHistoryRows,
      addresses: addressRows,
      coupons: couponRows,
      favorites: favoriteRows,
      summary,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      synced: {
        users: userRows.length,
        products: productRows.length,
        categories: categoryRows.length,
        occasions: occasionRows.length,
        orders: orderRows.length,
        orderItems: orderItemRows.length,
        statusHistory: statusHistoryRows.length,
        addresses: addressRows.length,
        coupons: couponRows.length,
        favorites: favoriteRows.length,
      },
    });
  } catch (err) {
    console.error("[sync-sheets] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
