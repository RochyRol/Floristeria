import { prisma } from "@/lib/prisma";
import { ReportsClient } from "@/components/admin/reports-client";

export const metadata = { title: "Reportes — Admin" };

async function getReportData() {
  const now = new Date();
  const startOfToday    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek     = new Date(startOfToday); startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfLastWeek = new Date(startOfWeek);  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const endOfLastWeek   = new Date(startOfWeek);  endOfLastWeek.setMilliseconds(-1);
  const startOfMonth    = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth= new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth  = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // Build last 12 months
  const months: { year: number; month: number; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" }) });
  }

  // Last 7 days labels
  const days7: { date: Date; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startOfToday); d.setDate(startOfToday.getDate() - i);
    days7.push({ date: d, label: d.toLocaleDateString("es-CO", { weekday: "short" }) });
  }

  try {
    const [
      thisMonthAgg, lastMonthAgg,
      thisMonthOrders, lastMonthOrders,
      thisWeekOrders, lastWeekOrders,
      totalClients, newClientsMonth,
      allTimeAgg,
      allOrders12m,
      allOrders7d,
      topProducts,
      statusCounts,
      deliveredCount, cancelledCount,
    ] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth },     status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth },          status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfWeek },            status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfLastWeek, lte: endOfLastWeek }, status: { not: "CANCELLED" } } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "CLIENT", createdAt: { gte: startOfMonth } } }),
      prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" }, createdAt: { gte: twelveMonthsAgo } },
        select: { total: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" }, createdAt: { gte: days7[0].date } },
        select: { total: true, createdAt: true },
      }),
      prisma.product.findMany({
        orderBy: { salesCount: "desc" }, take: 8,
        select: { id: true, name: true, salesCount: true, basePrice: true, images: true },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
    ]);

    // Revenue by month
    const revenueByMonth = months.map((m) => {
      const total = allOrders12m
        .filter((o) => { const d = new Date(o.createdAt); return d.getFullYear() === m.year && d.getMonth() + 1 === m.month; })
        .reduce((s, o) => s + Number(o.total), 0);
      return { label: m.label, total };
    });

    // Revenue last 7 days
    const revenueByDay = days7.map(({ date, label }) => {
      const nextDay = new Date(date); nextDay.setDate(date.getDate() + 1);
      const total = allOrders7d
        .filter((o) => { const d = new Date(o.createdAt); return d >= date && d < nextDay; })
        .reduce((s, o) => s + Number(o.total), 0);
      const count = allOrders7d.filter((o) => { const d = new Date(o.createdAt); return d >= date && d < nextDay; }).length;
      return { label, total, count };
    });

    const totalOrderCount = statusCounts.reduce((s, c) => s + c._count._all, 0);
    const completionRate  = totalOrderCount > 0 ? Math.round((deliveredCount / totalOrderCount) * 100) : 0;

    return {
      thisMonthRevenue:  Number(thisMonthAgg._sum.total || 0),
      lastMonthRevenue:  Number(lastMonthAgg._sum.total || 0),
      thisMonthOrders,   lastMonthOrders,
      thisWeekOrders,    lastWeekOrders,
      totalClients,      newClientsMonth,
      allTimeRevenue:    Number(allTimeAgg._sum.total || 0),
      avgTicketMonth:    thisMonthOrders > 0 ? Math.round(Number(thisMonthAgg._sum.total || 0) / thisMonthOrders) : 0,
      revenueByMonth,    revenueByDay,
      topProducts,
      statusCounts:      statusCounts.map((s) => ({ status: s.status, count: s._count._all })),
      deliveredCount,    cancelledCount,
      completionRate,
      totalOrderCount,
    };
  } catch {
    return {
      thisMonthRevenue: 0, lastMonthRevenue: 0,
      thisMonthOrders: 0,  lastMonthOrders: 0,
      thisWeekOrders: 0,   lastWeekOrders: 0,
      totalClients: 0,     newClientsMonth: 0,
      allTimeRevenue: 0,   avgTicketMonth: 0,
      revenueByMonth: [],  revenueByDay: [],
      topProducts: [],     statusCounts: [],
      deliveredCount: 0,   cancelledCount: 0,
      completionRate: 0,   totalOrderCount: 0,
    };
  }
}

export default async function ReportsPage() {
  const data = await getReportData();
  return <ReportsClient data={JSON.parse(JSON.stringify(data))} />;
}
