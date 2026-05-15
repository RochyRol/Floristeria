import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getClientsReportData } from "./clients-data";

describe("getClientsReportData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("classifies new vs recurring clients and ranks top spenders", async () => {
    (prisma.order.findMany as any).mockResolvedValue([
      {
        id: "o1",
        userId: "u1",
        recipientName: "Ana López",
        recipientPhone: "300111",
        total: 100000,
        createdAt: new Date("2026-05-05"),
      },
      {
        id: "o2",
        userId: "u1",
        recipientName: "Ana López",
        recipientPhone: "300111",
        total: 200000,
        createdAt: new Date("2026-05-10"),
      },
      {
        id: "o3",
        userId: null,
        recipientName: "Luis Pérez",
        recipientPhone: "300222",
        total: 80000,
        createdAt: new Date("2026-05-12"),
      },
    ]);
    (prisma.user.findMany as any).mockResolvedValue([
      { id: "u1", name: "Ana López", email: "ana@test.com", phone: "300111", createdAt: new Date("2024-01-01") },
    ]);

    const data = await getClientsReportData({
      start: new Date("2026-05-01"),
      end: new Date("2026-05-31"),
    });

    expect(data.activeClients).toBe(2);
    expect(data.recurringClients).toBe(1);
    expect(data.newClients).toBe(1);
    expect(data.ranking[0].totalSpent).toBe(300000);
    expect(data.ranking[0].name).toBe("Ana López");
    expect(data.ranking[0].orderCount).toBe(2);
  });

  it("returns zeros on empty period", async () => {
    (prisma.order.findMany as any).mockResolvedValue([]);
    (prisma.user.findMany as any).mockResolvedValue([]);

    const data = await getClientsReportData({
      start: new Date("2026-05-01"),
      end: new Date("2026-05-31"),
    });

    expect(data.activeClients).toBe(0);
    expect(data.ranking).toEqual([]);
  });
});
