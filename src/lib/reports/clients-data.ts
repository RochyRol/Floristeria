import { prisma } from "@/lib/prisma";

export interface ClientsReportRange {
  start: Date;
  end: Date;
}

export interface ClientRankingEntry {
  key: string;
  name: string;
  phone: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date;
}

export interface ClientsReportData {
  activeClients: number;
  newClients: number;
  recurringClients: number;
  ranking: ClientRankingEntry[];
}

export async function getClientsReportData(range: ClientsReportRange): Promise<ClientsReportData> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: range.start, lte: range.end },
      status: { not: "CANCELLED" },
    },
    select: {
      userId: true,
      recipientName: true,
      recipientPhone: true,
      total: true,
      createdAt: true,
    },
  });

  // Agrupar por userId (si existe) o por teléfono (cliente mostrador).
  const grouped = new Map<string, ClientRankingEntry>();
  for (const o of orders) {
    const key = o.userId ?? `phone:${o.recipientPhone}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += Number(o.total);
      if (o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
    } else {
      grouped.set(key, {
        key,
        name: o.recipientName,
        phone: o.recipientPhone,
        email: "",
        orderCount: 1,
        totalSpent: Number(o.total),
        lastOrderAt: o.createdAt,
      });
    }
  }

  // Enriquecer con email de los usuarios registrados.
  const userIds = Array.from(grouped.keys()).filter((k) => !k.startsWith("phone:"));
  if (userIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
    for (const u of users) {
      const entry = grouped.get(u.id);
      if (entry) {
        entry.email = u.email ?? "";
        entry.name = u.name ?? entry.name;
        // Cliente "nuevo" = se registró dentro del período.
        if (u.createdAt >= range.start && u.createdAt <= range.end) {
          // marcado más abajo con flag separado
        }
      }
    }
  }

  // Calcular nuevos vs recurrentes basado en orderCount dentro del período.
  let newClients = 0;
  let recurringClients = 0;
  for (const entry of grouped.values()) {
    if (entry.orderCount > 1) recurringClients += 1;
    else newClients += 1;
  }

  const ranking = Array.from(grouped.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    activeClients: grouped.size,
    newClients,
    recurringClients,
    ranking,
  };
}
