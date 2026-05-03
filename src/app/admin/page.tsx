import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  try {
    const [
      todayOrders,
      pendingOrders,
      monthRevenue,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today }, status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { status: { in: ["RECEIVED", "PROCESSING", "READY"] } } }),
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
    ]);

    return {
      todayOrders,
      pendingOrders,
      monthRevenue: Number(monthRevenue._sum.total || 0),
      recentOrders,
      topProducts,
    };
  } catch {
    return {
      todayOrders: 0,
      pendingOrders: 0,
      monthRevenue: 0,
      recentOrders: [],
      topProducts: [],
    };
  }
}

export default async function AdminDashboard() {
  const [session, rawStats] = await Promise.all([auth(), getStats()]);
  const stats = JSON.parse(JSON.stringify(rawStats));
  return <AdminDashboardClient stats={stats} role={session?.user?.role || "SELLER"} />;
}
