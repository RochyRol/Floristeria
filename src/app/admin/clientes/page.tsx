import { prisma } from "@/lib/prisma";
import { ClientsClient } from "@/components/admin/clients-client";

export const metadata = { title: "Clientes — Admin" };

interface SearchParams {
  buscar?: string;
  pagina?: string;
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.pagina) || 1;
  const perPage = 25;

  const where = params.buscar
    ? {
        role: "CLIENT" as const,
        OR: [
          { name: { contains: params.buscar, mode: "insensitive" as const } },
          { email: { contains: params.buscar, mode: "insensitive" as const } },
          { phone: { contains: params.buscar, mode: "insensitive" as const } },
        ],
      }
    : { role: "CLIENT" as const };

  const [clients, total] = await Promise.all([
    prisma.user
      .findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          active: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      })
      .catch(() => []),
    prisma.user.count({ where }).catch(() => 0),
  ]);

  return (
    <ClientsClient
      clients={JSON.parse(JSON.stringify(clients))}
      total={total}
      page={page}
      perPage={perPage}
      search={params.buscar ?? ""}
    />
  );
}
