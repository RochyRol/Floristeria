import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getSalesReportData } from "./sales-data";

describe("getSalesReportData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates totals, orders, average ticket and top products", async () => {
    (prisma.order.findMany as any).mockResolvedValue([
      {
        id: "1",
        orderNumber: "FL-001",
        createdAt: new Date("2026-05-10"),
        total: 100000,
        paymentMethod: "CASH_ON_DELIVERY",
        status: "DELIVERED",
        recipientName: "Ana",
        items: [
          { productId: "p1", productName: "Ramo rosas", quantity: 2, unitPrice: 50000, subtotal: 100000 },
        ],
      },
      {
        id: "2",
        orderNumber: "FL-002",
        createdAt: new Date("2026-05-12"),
        total: 60000,
        paymentMethod: "POS_CASH",
        status: "DELIVERED",
        recipientName: "Luis",
        items: [
          { productId: "p1", productName: "Ramo rosas", quantity: 1, unitPrice: 50000, subtotal: 50000 },
          { productId: null, productName: "Arreglo personalizado", quantity: 1, unitPrice: 10000, subtotal: 10000 },
        ],
      },
    ]);
    (prisma.order.aggregate as any).mockResolvedValue({ _sum: { total: 90000 } });

    const data = await getSalesReportData({
      start: new Date("2026-05-01"),
      end: new Date("2026-05-31"),
      previousStart: new Date("2026-04-01"),
      previousEnd: new Date("2026-04-30"),
    });

    expect(data.totalRevenue).toBe(160000);
    expect(data.totalOrders).toBe(2);
    expect(data.averageTicket).toBe(80000);
    expect(data.previousRevenue).toBe(90000);
    expect(data.topProducts[0].name).toBe("Ramo rosas");
    expect(data.topProducts[0].unitsSold).toBe(3);
    expect(data.paymentBreakdown.CASH_ON_DELIVERY).toBe(100000);
    expect(data.paymentBreakdown.POS_CASH).toBe(60000);
    expect(data.orders).toHaveLength(2);
  });

  it("handles empty period gracefully", async () => {
    (prisma.order.findMany as any).mockResolvedValue([]);
    (prisma.order.aggregate as any).mockResolvedValue({ _sum: { total: null } });

    const data = await getSalesReportData({
      start: new Date("2026-05-01"),
      end: new Date("2026-05-31"),
      previousStart: new Date("2026-04-01"),
      previousEnd: new Date("2026-04-30"),
    });

    expect(data.totalRevenue).toBe(0);
    expect(data.totalOrders).toBe(0);
    expect(data.averageTicket).toBe(0);
    expect(data.topProducts).toEqual([]);
  });
});
