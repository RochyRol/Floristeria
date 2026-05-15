import { prisma } from "@/lib/prisma";

export interface SalesReportRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

export interface SalesReportData {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  previousRevenue: number;
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  paymentBreakdown: Record<string, number>;
  orders: {
    orderNumber: string;
    createdAt: Date;
    recipientName: string;
    paymentMethod: string;
    status: string;
    total: number;
    itemsSummary: string;
  }[];
}

export async function getSalesReportData(range: SalesReportRange): Promise<SalesReportData> {
  const [orders, previousAgg] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: range.start, lte: range.end },
        status: { not: "CANCELLED" },
      },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: range.previousStart, lte: range.previousEnd },
        status: { not: "CANCELLED" },
      },
      _sum: { total: true },
    }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const productMap = new Map<string, { unitsSold: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.productName;
      const existing = productMap.get(key) ?? { unitsSold: 0, revenue: 0 };
      existing.unitsSold += item.quantity;
      existing.revenue += Number(item.subtotal);
      productMap.set(key, existing);
    }
  }
  const topProducts = Array.from(productMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10);

  const paymentBreakdown: Record<string, number> = {};
  for (const o of orders) {
    paymentBreakdown[o.paymentMethod] = (paymentBreakdown[o.paymentMethod] ?? 0) + Number(o.total);
  }

  return {
    totalRevenue,
    totalOrders,
    averageTicket,
    previousRevenue: Number(previousAgg._sum.total ?? 0),
    topProducts,
    paymentBreakdown,
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      recipientName: o.recipientName,
      paymentMethod: o.paymentMethod,
      status: o.status,
      total: Number(o.total),
      itemsSummary: o.items.map((i) => `${i.quantity}× ${i.productName}`).join(", "),
    })),
  };
}
