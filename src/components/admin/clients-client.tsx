"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface Client {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
  _count: { orders: number };
}

interface Props {
  clients: Client[];
  total: number;
  page: number;
  perPage: number;
  search: string;
}

export function ClientsClient({ clients, total, page, perPage, search }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(search);

  const totalPages = Math.ceil(total / perPage);

  function applySearch(value: string) {
    const params = new URLSearchParams();
    if (value) params.set("buscar", value);
    params.set("pagina", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function goPage(p: number) {
    const params = new URLSearchParams();
    if (search) params.set("buscar", search);
    params.set("pagina", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-sans text-forest/50">{total} clientes registrados</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch(query)}
            className="w-72 px-3 py-2 text-sm font-sans border border-forest/15 rounded-sm bg-white focus:outline-none focus:border-forest/40 placeholder:text-forest/30"
          />
          <button
            onClick={() => applySearch(query)}
            className="px-4 py-2 text-xs font-sans font-semibold uppercase tracking-brand bg-forest text-cream rounded-sm hover:bg-forest/90 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="bg-white border border-forest/8 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-forest/8">
                {["Nombre", "Email", "Teléfono", "Pedidos", "Registro", "Estado"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[12px] uppercase font-sans font-bold text-forest/40"
                    style={{ letterSpacing: "0.08em" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5">
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm font-sans text-forest/40"
                  >
                    No se encontraron clientes.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-sans font-medium text-forest">
                        {c.name ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm font-sans text-forest/60">{c.email}</td>
                    <td className="px-4 py-3 text-sm font-sans text-forest/60">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-forest/8 text-forest text-[11px]">
                        {c._count.orders} pedido{c._count.orders !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-sans text-forest/50">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge text-[11px] ${
                          c.active
                            ? "bg-forest/10 text-forest"
                            : "bg-burgundy/10 text-burgundy"
                        }`}
                      >
                        {c.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => goPage(page - 1)}
            className="px-3 py-1.5 text-xs font-sans border border-forest/15 rounded-sm text-forest/50 hover:border-forest/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-xs font-sans text-forest/40">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => goPage(page + 1)}
            className="px-3 py-1.5 text-xs font-sans border border-forest/15 rounded-sm text-forest/50 hover:border-forest/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
