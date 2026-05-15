import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

const CAPACITY_LIMIT = 15;

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  try {
    const [
      todayOrders,
      pendingOrders,
      activeOrders,
      monthRevenue,
      recentOrders,
      topProducts,
      incomingOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: today }, status: { not: "CANCELLED" } },
      }),
      prisma.order.count({
        where: { status: { in: ["RECEIVED", "ACCEPTED", "MAKING", "READY"] } },
      }),
      // All orders currently "in flight" (count against capacity)
      prisma.order.count({
        where: { status: { in: ["RECEIVED", "ACCEPTED", "MAKING", "READY", "IN_ROUTE"] } },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: firstOfMonth }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { customer: { select: { name: true } }, items: { take: 1 } },
      }),
      prisma.product.findMany({
        orderBy: { salesCount: "desc" },
        take: 5,
        select: { id: true, name: true, salesCount: true, basePrice: true, images: true },
      }),
      // Pedidos recién llegados (RECEIVED) — para gestión de capacidad
      prisma.order.findMany({
        where: { status: "RECEIVED" },
        orderBy: { createdAt: "asc" },
        take: 20,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          recipientName: true,
          recipientPhone: true,
          deliveryDate: true,
          deliveryTime: true,
          cardMessage: true,
          customer: { select: { name: true, phone: true } },
          items: { take: 3, select: { productName: true, quantity: true } },
        },
      }),
    ]);

    return {
      todayOrders,
      pendingOrders,
      activeOrders,
      capacityLimit: CAPACITY_LIMIT,
      monthRevenue: Number(monthRevenue._sum.total || 0),
      recentOrders,
      topProducts,
      incomingOrders,
    };
  } catch {
    return {
      todayOrders: 0,
      pendingOrders: 0,
      activeOrders: 0,
      capacityLimit: CAPACITY_LIMIT,
      monthRevenue: 0,
      recentOrders: [],
      topProducts: [],
      incomingOrders: [],
    };
  }
}

export default async function AdminDashboard() {
  const [session, rawStats] = await Promise.all([auth(), getStats()]);
  const stats = JSON.parse(JSON.stringify(rawStats));
  return <AdminDashboardClient stats={stats} role={session?.user?.role || "SELLER"} />;
}
