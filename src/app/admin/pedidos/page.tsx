import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AdminOrdersClient } from "@/components/admin/admin-orders-client";

export const metadata = { title: "Pedidos — Admin" };

interface SearchParams {
  estado?: string;
  pagina?: string;
  buscar?: string;
}

async function getOrders(params: SearchParams, role: string) {
  const where: Record<string, unknown> = {};

  if (params.estado) where.status = params.estado;
  if (role === "FLORIST") where.status = { in: ["RECEIVED", "PROCESSING"] };
  if (role === "DELIVERY") where.status = { in: ["READY", "IN_ROUTE"] };

  if (params.buscar) {
    where.OR = [
      { orderNumber: { contains: params.buscar, mode: "insensitive" } },
      { recipientName: { contains: params.buscar, mode: "insensitive" } },
    ];
  }

  const page = Number(params.pagina) || 1;
  const perPage = 20;

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          items: true,
          customer: { select: { name: true, email: true, phone: true } },
          statusHistory: { orderBy: { timestamp: "desc" }, take: 1 },
        },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, total, page, perPage };
  } catch {
    return { orders: [], total: 0, page: 1, perPage };
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, session] = await Promise.all([searchParams, auth()]);
  const role = session?.user?.role || "SELLER";
  const { orders, total, page, perPage } = await getOrders(params, role);

  return (
    <AdminOrdersClient
      orders={JSON.parse(JSON.stringify(orders))}
      total={total}
      page={page}
      perPage={perPage}
      role={role}
      activeFilters={params}
    />
  );
}
