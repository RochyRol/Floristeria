import { prisma } from "@/lib/prisma";
import { ReportsClient } from "@/components/admin/reports-client";

export const metadata = { title: "Reportes — Admin" };

async function getReportData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Build last 12 months labels
  const months: { year: number; month: number; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" }),
    });
  }

  try {
    const [
      thisMonthRevenue,
      lastMonthRevenue,
      thisMonthOrders,
      lastMonthOrders,
      totalClients,
      allOrders,
      topProducts,
      statusCounts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.order.findMany({
        where: {
          status: { not: "CANCELLED" },
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
          },
        },
        select: { total: true, createdAt: true },
      }),
      prisma.product.findMany({
        orderBy: { salesCount: "desc" },
        take: 8,
        select: { id: true, name: true, salesCount: true, basePrice: true, images: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    // Aggregate revenue by month
    const revenueByMonth = months.map((m) => {
      const total = allOrders
        .filter((o) => {
          const d = new Date(o.createdAt);
          return d.getFullYear() === m.year && d.getMonth() + 1 === m.month;
        })
        .reduce((s, o) => s + Number(o.total), 0);
      return { label: m.label, total };
    });

    return {
      thisMonthRevenue: Number(thisMonthRevenue._sum.total || 0),
      lastMonthRevenue: Number(lastMonthRevenue._sum.total || 0),
      thisMonthOrders,
      lastMonthOrders,
      totalClients,
      revenueByMonth,
      topProducts,
      statusCounts: statusCounts.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
    };
  } catch {
    return {
      thisMonthRevenue: 0,
      lastMonthRevenue: 0,
      thisMonthOrders: 0,
      lastMonthOrders: 0,
      totalClients: 0,
      revenueByMonth: [],
      topProducts: [],
      statusCounts: [],
    };
  }
}

export default async function ReportsPage() {
  const data = await getReportData();
  return <ReportsClient data={JSON.parse(JSON.stringify(data))} />;
}
