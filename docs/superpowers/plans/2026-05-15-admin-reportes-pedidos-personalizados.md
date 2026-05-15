# Reportes descargables y pedidos personalizados — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar descarga de reportes (Excel + PDF) de ventas y clientes al panel admin, y permitir registrar pedidos personalizados en el POS sin elegir un producto del catálogo.

**Architecture:**
- **Reportes:** capa nueva en `src/lib/reports/` con helpers de período, agregadores de datos, generadores de Excel (`exceljs`) y PDF (`@react-pdf/renderer`). Dos rutas API server-side que streamean el archivo. Nuevo componente UI integrado en la página de reportes existente.
- **Pedidos personalizados:** schema change quirúrgico (`OrderItem.productId` pasa a opcional). Una nueva pestaña en `pos-client.tsx` que envía al endpoint existente `/api/orders` con items sin `productId`.

**Tech Stack:** Next.js 16 (App Router) · React 19 · Prisma 7 · TypeScript · Tailwind · vitest · exceljs · @react-pdf/renderer

**Spec:** [docs/superpowers/specs/2026-05-15-admin-reportes-pedidos-personalizados-design.md](../specs/2026-05-15-admin-reportes-pedidos-personalizados-design.md)

**Deviación menor del spec:** En lugar de agregar un campo nuevo `customDescription` a `OrderItem`, reutilizamos el campo `productName` (que ya existe y es requerido). Para pedidos personalizados, `productId` queda `null` y `productName` lleva la descripción del arreglo. Esto evita una columna nueva y la UI de listado ya funciona sin cambios (muestra `productName`). El spec se actualizará para reflejar este enfoque.

---

## Estructura de archivos

**Reportes — archivos nuevos:**
- `src/lib/reports/periods.ts` — calcula rangos `start`/`end` para `week | month | year`
- `src/lib/reports/periods.test.ts` — tests del helper de períodos
- `src/lib/reports/sales-data.ts` — agrega datos de ventas para un rango
- `src/lib/reports/sales-data.test.ts` — tests con mock de Prisma
- `src/lib/reports/clients-data.ts` — agrega datos de clientes para un rango
- `src/lib/reports/clients-data.test.ts` — tests con mock de Prisma
- `src/lib/reports/sales-excel.ts` — genera buffer XLSX para reporte de ventas
- `src/lib/reports/clients-excel.ts` — genera buffer XLSX para reporte de clientes
- `src/lib/reports/sales-pdf.tsx` — `react-pdf` document para reporte de ventas
- `src/lib/reports/clients-pdf.tsx` — `react-pdf` document para reporte de clientes
- `src/app/api/admin/reports/ventas/route.ts` — endpoint GET con `period` + `format`
- `src/app/api/admin/reports/clientes/route.ts` — endpoint GET con `period` + `format`
- `src/components/admin/download-reports-section.tsx` — UI con selector de período + 4 botones

**Reportes — archivos modificados:**
- `src/components/admin/reports-client.tsx` — insertar `<DownloadReportsSection />` arriba de las KPI cards

**Pedidos personalizados — archivos modificados:**
- `prisma/schema.prisma` — `OrderItem.productId` y `OrderItem.product` opcionales
- `src/app/api/orders/route.ts` — aceptar items sin `productId`, saltar `salesCount` update si no hay
- `src/components/admin/pos-client.tsx` — agregar pestañas Catálogo/Personalizado + formulario

---

## Tarea 1: Instalar dependencias

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar exceljs y @react-pdf/renderer**

```bash
npm install exceljs @react-pdf/renderer
```

Esperado: ambas dependencias se agregan a `dependencies` en `package.json`.

- [ ] **Step 2: Verificar versiones instaladas**

Run: `node -e "console.log(require('exceljs/package.json').version, require('@react-pdf/renderer/package.json').version)"`
Expected: imprime ambas versiones sin error.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install exceljs and @react-pdf/renderer for downloadable reports"
```

---

## Tarea 2: Helper de períodos

**Files:**
- Create: `src/lib/reports/periods.ts`
- Test: `src/lib/reports/periods.test.ts`

- [ ] **Step 1: Escribir el test fallando**

`src/lib/reports/periods.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getPeriodRange, type Period } from "./periods";

describe("getPeriodRange", () => {
  const now = new Date("2026-05-15T10:30:00-05:00"); // viernes

  it("returns Monday 00:00 to Sunday 23:59 for 'week'", () => {
    const { start, end } = getPeriodRange("week", now);
    expect(start.getDay()).toBe(1); // lunes
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(end.getDay()).toBe(0); // domingo
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getTime() - start.getTime()).toBeGreaterThan(6 * 86400000);
  });

  it("returns first to last day of month for 'month'", () => {
    const { start, end } = getPeriodRange("month", now);
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(4); // mayo (0-indexed)
    expect(end.getDate()).toBe(31);
    expect(end.getHours()).toBe(23);
  });

  it("returns Jan 1 to Dec 31 for 'year'", () => {
    const { start, end } = getPeriodRange("year", now);
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });

  it("returns previous period for comparison", () => {
    const { start, end } = getPeriodRange("month", now);
    const { previousStart, previousEnd } = getPeriodRange("month", now);
    expect(previousEnd.getTime()).toBeLessThan(start.getTime());
    expect(previousStart.getMonth()).toBe(3); // abril
  });

  it("returns a human-readable label", () => {
    expect(getPeriodRange("week", now).label).toMatch(/semana/i);
    expect(getPeriodRange("month", now).label).toMatch(/mayo/i);
    expect(getPeriodRange("year", now).label).toMatch(/2026/);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npm run test -- periods`
Expected: FAIL — no existe el módulo.

- [ ] **Step 3: Implementar el helper**

`src/lib/reports/periods.ts`:

```typescript
export type Period = "week" | "month" | "year";

export interface PeriodRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  label: string;
}

export function getPeriodRange(period: Period, reference: Date = new Date()): PeriodRange {
  const ref = new Date(reference);

  if (period === "week") {
    const day = ref.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    const start = new Date(ref);
    start.setDate(ref.getDate() - daysFromMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const previousStart = new Date(start);
    previousStart.setDate(start.getDate() - 7);
    const previousEnd = new Date(end);
    previousEnd.setDate(end.getDate() - 7);
    const fmt = (d: Date) =>
      d.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
    return {
      start,
      end,
      previousStart,
      previousEnd,
      label: `Semana del ${fmt(start)} al ${fmt(end)}, ${start.getFullYear()}`,
    };
  }

  if (period === "month") {
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
    const previousStart = new Date(ref.getFullYear(), ref.getMonth() - 1, 1, 0, 0, 0, 0);
    const previousEnd = new Date(ref.getFullYear(), ref.getMonth(), 0, 23, 59, 59, 999);
    const monthName = start.toLocaleDateString("es-CO", { month: "long" });
    return {
      start,
      end,
      previousStart,
      previousEnd,
      label: `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${start.getFullYear()}`,
    };
  }

  // year
  const start = new Date(ref.getFullYear(), 0, 1, 0, 0, 0, 0);
  const end = new Date(ref.getFullYear(), 11, 31, 23, 59, 59, 999);
  const previousStart = new Date(ref.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
  const previousEnd = new Date(ref.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  return {
    start,
    end,
    previousStart,
    previousEnd,
    label: `Año ${start.getFullYear()}`,
  };
}
```

- [ ] **Step 4: Verificar que pasan los tests**

Run: `npm run test -- periods`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/reports/periods.ts src/lib/reports/periods.test.ts
git commit -m "feat(reports): add period range helper for week/month/year"
```

---

## Tarea 3: Agregador de datos de ventas

**Files:**
- Create: `src/lib/reports/sales-data.ts`
- Test: `src/lib/reports/sales-data.test.ts`

- [ ] **Step 1: Escribir el test**

`src/lib/reports/sales-data.test.ts`:

```typescript
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
```

- [ ] **Step 2: Verificar que falla**

Run: `npm run test -- sales-data`
Expected: FAIL — módulo no existe.

- [ ] **Step 3: Implementar el agregador**

`src/lib/reports/sales-data.ts`:

```typescript
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
```

- [ ] **Step 4: Verificar tests**

Run: `npm run test -- sales-data`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/reports/sales-data.ts src/lib/reports/sales-data.test.ts
git commit -m "feat(reports): add sales report data aggregator"
```

---

## Tarea 4: Agregador de datos de clientes

**Files:**
- Create: `src/lib/reports/clients-data.ts`
- Test: `src/lib/reports/clients-data.test.ts`

- [ ] **Step 1: Escribir el test**

`src/lib/reports/clients-data.test.ts`:

```typescript
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
```

- [ ] **Step 2: Verificar que falla**

Run: `npm run test -- clients-data`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/lib/reports/clients-data.ts`:

```typescript
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
```

- [ ] **Step 4: Verificar tests**

Run: `npm run test -- clients-data`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/reports/clients-data.ts src/lib/reports/clients-data.test.ts
git commit -m "feat(reports): add clients report data aggregator"
```

---

## Tarea 5: Generador Excel de ventas

**Files:**
- Create: `src/lib/reports/sales-excel.ts`

- [ ] **Step 1: Implementar el generador**

`src/lib/reports/sales-excel.ts`:

```typescript
import ExcelJS from "exceljs";
import type { SalesReportData } from "./sales-data";

const PAYMENT_LABELS: Record<string, string> = {
  WOMPI: "Wompi",
  PSE: "PSE",
  BANK_TRANSFER: "Transferencia",
  CASH_ON_DELIVERY: "Efectivo (entrega)",
  POS_CASH: "POS — Efectivo",
  POS_CARD: "POS — Tarjeta",
};

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Recibido",
  ACCEPTED: "Aceptado",
  MAKING: "En preparación",
  READY: "Listo",
  IN_ROUTE: "En ruta",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFF5F0E8" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1A2E1A" },
  };
  row.alignment = { vertical: "middle" };
  row.height = 22;
}

export async function buildSalesExcel(
  data: SalesReportData,
  periodLabel: string
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Floristería Deco Imperio";
  wb.created = new Date();

  // Hoja 1: Resumen
  const summary = wb.addWorksheet("Resumen");
  summary.columns = [
    { header: "Métrica", key: "metric", width: 32 },
    { header: "Valor", key: "value", width: 24 },
  ];
  styleHeader(summary.getRow(1));
  summary.addRows([
    { metric: "Período", value: periodLabel },
    { metric: "Ingresos totales", value: data.totalRevenue },
    { metric: "Número de pedidos", value: data.totalOrders },
    { metric: "Ticket promedio", value: data.averageTicket },
    { metric: "Ingresos período anterior", value: data.previousRevenue },
    {
      metric: "Variación vs anterior",
      value:
        data.previousRevenue > 0
          ? `${(((data.totalRevenue - data.previousRevenue) / data.previousRevenue) * 100).toFixed(1)}%`
          : "—",
    },
  ]);
  summary.getColumn("value").numFmt = '"$"#,##0';
  summary.getCell("B2").numFmt = "@";
  summary.getCell("B7").numFmt = "@";

  // Hoja 2: Detalle ventas
  const detail = wb.addWorksheet("Detalle ventas");
  detail.columns = [
    { header: "Número", key: "orderNumber", width: 14 },
    { header: "Fecha", key: "createdAt", width: 18 },
    { header: "Cliente", key: "recipientName", width: 28 },
    { header: "Método de pago", key: "paymentMethod", width: 20 },
    { header: "Estado", key: "status", width: 18 },
    { header: "Items", key: "itemsSummary", width: 50 },
    { header: "Total", key: "total", width: 16 },
  ];
  styleHeader(detail.getRow(1));
  for (const o of data.orders) {
    detail.addRow({
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      recipientName: o.recipientName,
      paymentMethod: PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod,
      status: STATUS_LABELS[o.status] ?? o.status,
      itemsSummary: o.itemsSummary,
      total: o.total,
    });
  }
  detail.getColumn("createdAt").numFmt = "yyyy-mm-dd hh:mm";
  detail.getColumn("total").numFmt = '"$"#,##0';

  // Hoja 3: Productos
  const products = wb.addWorksheet("Productos");
  products.columns = [
    { header: "Producto", key: "name", width: 40 },
    { header: "Unidades vendidas", key: "unitsSold", width: 20 },
    { header: "Ingresos", key: "revenue", width: 20 },
  ];
  styleHeader(products.getRow(1));
  for (const p of data.topProducts) products.addRow(p);
  products.getColumn("revenue").numFmt = '"$"#,##0';

  // Hoja 4: Métodos de pago
  const payments = wb.addWorksheet("Métodos de pago");
  payments.columns = [
    { header: "Método", key: "method", width: 28 },
    { header: "Total", key: "total", width: 20 },
  ];
  styleHeader(payments.getRow(1));
  for (const [method, total] of Object.entries(data.paymentBreakdown)) {
    payments.addRow({ method: PAYMENT_LABELS[method] ?? method, total });
  }
  payments.getColumn("total").numFmt = '"$"#,##0';

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
```

- [ ] **Step 2: Smoke test manual**

Run:
```bash
npx tsx -e "
import('./src/lib/reports/sales-excel.ts').then(async (m) => {
  const buf = await m.buildSalesExcel({
    totalRevenue: 500000,
    totalOrders: 5,
    averageTicket: 100000,
    previousRevenue: 400000,
    topProducts: [{ name: 'Ramo rosas', unitsSold: 10, revenue: 500000 }],
    paymentBreakdown: { POS_CASH: 300000, POS_CARD: 200000 },
    orders: [],
  }, 'Mayo 2026');
  require('fs').writeFileSync('/tmp/test-sales.xlsx', buf);
  console.log('OK', buf.length);
});
"
```
Expected: `OK <number>`, archivo `/tmp/test-sales.xlsx` válido.

- [ ] **Step 3: Commit**

```bash
git add src/lib/reports/sales-excel.ts
git commit -m "feat(reports): add Excel generator for sales report"
```

---

## Tarea 6: Generador Excel de clientes

**Files:**
- Create: `src/lib/reports/clients-excel.ts`

- [ ] **Step 1: Implementar**

`src/lib/reports/clients-excel.ts`:

```typescript
import ExcelJS from "exceljs";
import type { ClientsReportData } from "./clients-data";

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFF5F0E8" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1A2E1A" },
  };
  row.height = 22;
}

export async function buildClientsExcel(
  data: ClientsReportData,
  periodLabel: string
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Floristería Deco Imperio";
  wb.created = new Date();

  // Hoja 1: Resumen
  const summary = wb.addWorksheet("Resumen");
  summary.columns = [
    { header: "Métrica", key: "metric", width: 32 },
    { header: "Valor", key: "value", width: 20 },
  ];
  styleHeader(summary.getRow(1));
  summary.addRows([
    { metric: "Período", value: periodLabel },
    { metric: "Clientes activos", value: data.activeClients },
    { metric: "Clientes nuevos (1 pedido)", value: data.newClients },
    { metric: "Clientes recurrentes (2+ pedidos)", value: data.recurringClients },
  ]);

  // Hoja 2: Ranking
  const ranking = wb.addWorksheet("Ranking");
  ranking.columns = [
    { header: "Cliente", key: "name", width: 32 },
    { header: "Teléfono", key: "phone", width: 18 },
    { header: "Email", key: "email", width: 28 },
    { header: "Pedidos", key: "orderCount", width: 12 },
    { header: "Total gastado", key: "totalSpent", width: 18 },
    { header: "Último pedido", key: "lastOrderAt", width: 18 },
  ];
  styleHeader(ranking.getRow(1));
  for (const r of data.ranking) {
    ranking.addRow({
      name: r.name,
      phone: r.phone,
      email: r.email,
      orderCount: r.orderCount,
      totalSpent: r.totalSpent,
      lastOrderAt: r.lastOrderAt,
    });
  }
  ranking.getColumn("totalSpent").numFmt = '"$"#,##0';
  ranking.getColumn("lastOrderAt").numFmt = "yyyy-mm-dd";

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/reports/clients-excel.ts
git commit -m "feat(reports): add Excel generator for clients report"
```

---

## Tarea 7: Generador PDF de ventas

**Files:**
- Create: `src/lib/reports/sales-pdf.tsx`

- [ ] **Step 1: Implementar el documento PDF**

`src/lib/reports/sales-pdf.tsx`:

```tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { SalesReportData } from "./sales-data";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1A2E1A" },
  header: { marginBottom: 24, borderBottomWidth: 1, borderBottomColor: "#1A2E1A", paddingBottom: 12 },
  brand: { fontSize: 16, fontFamily: "Times-Roman" },
  title: { fontSize: 22, marginTop: 6, fontFamily: "Times-Roman" },
  period: { fontSize: 10, color: "#6b7280", marginTop: 4 },
  kpiRow: { flexDirection: "row", marginBottom: 24, gap: 12 },
  kpi: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", padding: 12, borderRadius: 2 },
  kpiLabel: { fontSize: 8, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 },
  kpiValue: { fontSize: 16, marginTop: 6, fontFamily: "Times-Roman" },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 8, marginTop: 12, textTransform: "uppercase", letterSpacing: 1 },
  table: { borderWidth: 1, borderColor: "#E5E7EB" },
  trHead: { flexDirection: "row", backgroundColor: "#1A2E1A" },
  thText: { color: "#F5F0E8", fontSize: 9, padding: 6, fontWeight: "bold" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  td: { fontSize: 9, padding: 6 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: "#9ca3af", textAlign: "center" },
});

const PAYMENT_LABELS: Record<string, string> = {
  WOMPI: "Wompi", PSE: "PSE", BANK_TRANSFER: "Transferencia",
  CASH_ON_DELIVERY: "Efectivo", POS_CASH: "POS Efectivo", POS_CARD: "POS Tarjeta",
};

function formatCOP(n: number): string {
  return `$${n.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
}

interface Props {
  data: SalesReportData;
  periodLabel: string;
}

export function SalesPdfDocument({ data, periodLabel }: Props) {
  const variation =
    data.previousRevenue > 0
      ? `${(((data.totalRevenue - data.previousRevenue) / data.previousRevenue) * 100).toFixed(1)}%`
      : "—";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Floristería Deco Imperio</Text>
          <Text style={styles.title}>Reporte de Ventas</Text>
          <Text style={styles.period}>{periodLabel}</Text>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Ingresos</Text>
            <Text style={styles.kpiValue}>{formatCOP(data.totalRevenue)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Pedidos</Text>
            <Text style={styles.kpiValue}>{data.totalOrders}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Ticket promedio</Text>
            <Text style={styles.kpiValue}>{formatCOP(data.averageTicket)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>vs anterior</Text>
            <Text style={styles.kpiValue}>{variation}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Top productos vendidos</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.thText, { flex: 4 }]}>Producto</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: "right" }]}>Unidades</Text>
            <Text style={[styles.thText, { flex: 2, textAlign: "right" }]}>Ingresos</Text>
          </View>
          {data.topProducts.slice(0, 5).map((p, i) => (
            <View key={i} style={styles.tr}>
              <Text style={[styles.td, { flex: 4 }]}>{p.name}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{p.unitsSold}</Text>
              <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>{formatCOP(p.revenue)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Ventas por método de pago</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.thText, { flex: 3 }]}>Método</Text>
            <Text style={[styles.thText, { flex: 2, textAlign: "right" }]}>Total</Text>
          </View>
          {Object.entries(data.paymentBreakdown).map(([m, t], i) => (
            <View key={i} style={styles.tr}>
              <Text style={[styles.td, { flex: 3 }]}>{PAYMENT_LABELS[m] ?? m}</Text>
              <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>{formatCOP(t)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generado el {new Date().toLocaleDateString("es-CO")} · Detalle completo en el archivo Excel
        </Text>
      </Page>
    </Document>
  );
}

export async function buildSalesPdf(data: SalesReportData, periodLabel: string): Promise<Buffer> {
  return renderToBuffer(<SalesPdfDocument data={data} periodLabel={periodLabel} />);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/reports/sales-pdf.tsx
git commit -m "feat(reports): add PDF generator for sales report"
```

---

## Tarea 8: Generador PDF de clientes

**Files:**
- Create: `src/lib/reports/clients-pdf.tsx`

- [ ] **Step 1: Implementar**

`src/lib/reports/clients-pdf.tsx`:

```tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ClientsReportData } from "./clients-data";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1A2E1A" },
  header: { marginBottom: 24, borderBottomWidth: 1, borderBottomColor: "#1A2E1A", paddingBottom: 12 },
  brand: { fontSize: 16, fontFamily: "Times-Roman" },
  title: { fontSize: 22, marginTop: 6, fontFamily: "Times-Roman" },
  period: { fontSize: 10, color: "#6b7280", marginTop: 4 },
  kpiRow: { flexDirection: "row", marginBottom: 24, gap: 12 },
  kpi: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", padding: 12, borderRadius: 2 },
  kpiLabel: { fontSize: 8, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 },
  kpiValue: { fontSize: 16, marginTop: 6, fontFamily: "Times-Roman" },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 8, marginTop: 12, textTransform: "uppercase", letterSpacing: 1 },
  table: { borderWidth: 1, borderColor: "#E5E7EB" },
  trHead: { flexDirection: "row", backgroundColor: "#1A2E1A" },
  thText: { color: "#F5F0E8", fontSize: 9, padding: 6, fontWeight: "bold" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  td: { fontSize: 9, padding: 6 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: "#9ca3af", textAlign: "center" },
});

function formatCOP(n: number): string {
  return `$${n.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
}

interface Props {
  data: ClientsReportData;
  periodLabel: string;
}

export function ClientsPdfDocument({ data, periodLabel }: Props) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Floristería Deco Imperio</Text>
          <Text style={styles.title}>Reporte de Clientes</Text>
          <Text style={styles.period}>{periodLabel}</Text>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Activos</Text>
            <Text style={styles.kpiValue}>{data.activeClients}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Nuevos</Text>
            <Text style={styles.kpiValue}>{data.newClients}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Recurrentes</Text>
            <Text style={styles.kpiValue}>{data.recurringClients}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Top 10 mejores clientes</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.thText, { flex: 4 }]}>Cliente</Text>
            <Text style={[styles.thText, { flex: 2 }]}>Teléfono</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: "right" }]}>Pedidos</Text>
            <Text style={[styles.thText, { flex: 2, textAlign: "right" }]}>Total</Text>
          </View>
          {data.ranking.slice(0, 10).map((c, i) => (
            <View key={i} style={styles.tr}>
              <Text style={[styles.td, { flex: 4 }]}>{c.name}</Text>
              <Text style={[styles.td, { flex: 2 }]}>{c.phone}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{c.orderCount}</Text>
              <Text style={[styles.td, { flex: 2, textAlign: "right" }]}>{formatCOP(c.totalSpent)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generado el {new Date().toLocaleDateString("es-CO")} · Detalle completo en el archivo Excel
        </Text>
      </Page>
    </Document>
  );
}

export async function buildClientsPdf(data: ClientsReportData, periodLabel: string): Promise<Buffer> {
  return renderToBuffer(<ClientsPdfDocument data={data} periodLabel={periodLabel} />);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/reports/clients-pdf.tsx
git commit -m "feat(reports): add PDF generator for clients report"
```

---

## Tarea 9: API route para reporte de ventas

**Files:**
- Create: `src/app/api/admin/reports/ventas/route.ts`

- [ ] **Step 1: Implementar la ruta**

`src/app/api/admin/reports/ventas/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPeriodRange, type Period } from "@/lib/reports/periods";
import { getSalesReportData } from "@/lib/reports/sales-data";
import { buildSalesExcel } from "@/lib/reports/sales-excel";
import { buildSalesPdf } from "@/lib/reports/sales-pdf";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SELLER"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const periodParam = (searchParams.get("period") ?? "month") as Period;
  const format = searchParams.get("format") ?? "xlsx";

  if (!["week", "month", "year"].includes(periodParam)) {
    return NextResponse.json({ error: "period inválido" }, { status: 400 });
  }
  if (!["xlsx", "pdf"].includes(format)) {
    return NextResponse.json({ error: "format inválido" }, { status: 400 });
  }

  const range = getPeriodRange(periodParam);
  const data = await getSalesReportData(range);

  const filenameBase = `reporte-ventas-${periodParam}-${new Date().toISOString().slice(0, 10)}`;

  if (format === "xlsx") {
    const buf = await buildSalesExcel(data, range.label);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  }

  const buf = await buildSalesPdf(data, range.label);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
    },
  });
}
```

- [ ] **Step 2: Verificación manual**

Run: `npm run dev` y abrir en navegador autenticado como ADMIN:
`http://localhost:3000/api/admin/reports/ventas?period=month&format=xlsx`

Expected: descarga un `.xlsx` válido.

Probar también `format=pdf`. Expected: descarga `.pdf`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/reports/ventas/route.ts
git commit -m "feat(reports): add sales report API endpoint"
```

---

## Tarea 10: API route para reporte de clientes

**Files:**
- Create: `src/app/api/admin/reports/clientes/route.ts`

- [ ] **Step 1: Implementar**

`src/app/api/admin/reports/clientes/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPeriodRange, type Period } from "@/lib/reports/periods";
import { getClientsReportData } from "@/lib/reports/clients-data";
import { buildClientsExcel } from "@/lib/reports/clients-excel";
import { buildClientsPdf } from "@/lib/reports/clients-pdf";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SELLER"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const periodParam = (searchParams.get("period") ?? "month") as Period;
  const format = searchParams.get("format") ?? "xlsx";

  if (!["week", "month", "year"].includes(periodParam)) {
    return NextResponse.json({ error: "period inválido" }, { status: 400 });
  }
  if (!["xlsx", "pdf"].includes(format)) {
    return NextResponse.json({ error: "format inválido" }, { status: 400 });
  }

  const range = getPeriodRange(periodParam);
  const data = await getClientsReportData(range);

  const filenameBase = `reporte-clientes-${periodParam}-${new Date().toISOString().slice(0, 10)}`;

  if (format === "xlsx") {
    const buf = await buildClientsExcel(data, range.label);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  }

  const buf = await buildClientsPdf(data, range.label);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
    },
  });
}
```

- [ ] **Step 2: Verificación manual**

Probar `http://localhost:3000/api/admin/reports/clientes?period=month&format=xlsx` y `format=pdf` autenticado como ADMIN.
Expected: descarga válida en ambos formatos.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/reports/clientes/route.ts
git commit -m "feat(reports): add clients report API endpoint"
```

---

## Tarea 11: Componente UI de descarga y su integración

**Files:**
- Create: `src/components/admin/download-reports-section.tsx`
- Modify: `src/components/admin/reports-client.tsx` (insertar componente arriba de los KPIs)

- [ ] **Step 1: Crear el componente**

`src/components/admin/download-reports-section.tsx`:

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

type Period = "week" | "month" | "year";
type Format = "xlsx" | "pdf";

const PERIODS: { value: Period; label: string }[] = [
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "year", label: "Este año" },
];

const REPORTS: {
  id: "ventas" | "clientes";
  title: string;
  description: string;
}[] = [
  {
    id: "ventas",
    title: "Reporte de Ventas",
    description: "Ingresos, pedidos y productos más vendidos",
  },
  {
    id: "clientes",
    title: "Reporte de Clientes",
    description: "Clientes nuevos, recurrentes y ranking de compras",
  },
];

export function DownloadReportsSection() {
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleDownload(report: "ventas" | "clientes", format: Format) {
    const key = `${report}-${format}`;
    setLoading(key);
    const t = toast.loading(`Generando ${format.toUpperCase()}…`);
    try {
      const res = await fetch(
        `/api/admin/reports/${report}?period=${period}&format=${format}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error" }));
        toast.error(err.error || "Error al generar reporte", { id: t });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disp = res.headers.get("Content-Disposition") ?? "";
      const match = disp.match(/filename="?([^"]+)"?/);
      a.download = match?.[1] ?? `reporte-${report}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Reporte descargado", { id: t });
    } catch (err) {
      toast.error("Error de red", { id: t, description: String(err) });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white border border-forest/8 rounded-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-forest/8 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
          Descargar reportes
        </p>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-xs font-sans rounded-sm border transition-colors ${
                period === p.value
                  ? "bg-forest text-cream border-forest"
                  : "bg-white text-forest/60 border-forest/15 hover:border-forest/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-forest/5">
        {REPORTS.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-4 px-5 py-4 flex-wrap"
          >
            <div>
              <p className="text-sm font-sans font-medium text-forest">{r.title}</p>
              <p className="text-xs font-sans text-forest/45 mt-0.5">
                {r.description}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(r.id, "xlsx")}
                disabled={loading !== null}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-forest text-cream text-[11px] uppercase tracking-[0.14em] font-sans font-medium hover:bg-forest-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm"
              >
                <DownloadIcon spinning={loading === `${r.id}-xlsx`} />
                Excel
              </button>
              <button
                onClick={() => handleDownload(r.id, "pdf")}
                disabled={loading !== null}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-forest border border-forest/20 text-[11px] uppercase tracking-[0.14em] font-sans font-medium hover:border-forest/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm"
              >
                <DownloadIcon spinning={loading === `${r.id}-pdf`} />
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DownloadIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={spinning ? "animate-spin" : ""}
    >
      {spinning ? (
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      ) : (
        <>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Integrar en reports-client**

En `src/components/admin/reports-client.tsx`:

1. Agregar import al inicio del archivo (después de los demás imports):

```tsx
import { DownloadReportsSection } from "./download-reports-section";
```

2. Insertar el componente justo después del bloque del encabezado y antes de `{/* KPI cards */}`. En el código actual (líneas 81-89), encontrar:

```tsx
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl text-forest">Reportes</h1>
        <p className="text-sm font-sans text-forest/50 mt-1">
          Resumen de desempeño del negocio
        </p>
      </div>

      {/* KPI cards */}
```

y reemplazarlo por:

```tsx
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl text-forest">Reportes</h1>
        <p className="text-sm font-sans text-forest/50 mt-1">
          Resumen de desempeño del negocio
        </p>
      </div>

      <DownloadReportsSection />

      {/* KPI cards */}
```

- [ ] **Step 3: Verificación manual**

Run: `npm run dev` y entrar a `/admin/reportes` autenticado como ADMIN.

Expected:
- Sección "Descargar reportes" visible arriba de las KPI cards
- Los 3 botones de período funcionan (el activo cambia color)
- Click en Excel/PDF de cada reporte descarga el archivo correcto
- Toast de éxito al completar

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/download-reports-section.tsx src/components/admin/reports-client.tsx
git commit -m "feat(reports): add download UI integrated into reports page"
```

---

## Tarea 12: Schema change — productId opcional en OrderItem

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_optional_product_in_order_item/migration.sql` (generado por Prisma)

- [ ] **Step 1: Modificar schema.prisma**

Buscar el bloque `model OrderItem` (línea con `model OrderItem {`). Reemplazar:

```prisma
model OrderItem {
  id           String  @id @default(cuid())
  orderId      String
  productId    String
  productName  String
  productImage String?
  size         String?
  quantity     Int
  unitPrice    Decimal @db.Decimal(10, 2)
  subtotal     Decimal @db.Decimal(10, 2)
  dedication   String? @db.Text

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])
}
```

por:

```prisma
model OrderItem {
  id           String  @id @default(cuid())
  orderId      String
  productId    String?
  productName  String
  productImage String?
  size         String?
  quantity     Int
  unitPrice    Decimal @db.Decimal(10, 2)
  subtotal     Decimal @db.Decimal(10, 2)
  dedication   String? @db.Text

  order   Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id])
}
```

(Solo dos cambios: `productId String?` y `product Product?`)

- [ ] **Step 2: Crear y aplicar migración**

Run: `npm run db:migrate -- --name optional_product_in_order_item`
Expected: Prisma genera la migración, la aplica a la BD de desarrollo, y regenera el cliente. La migración debe consistir en `ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;`.

- [ ] **Step 3: Verificar tipos generados**

Run: `npx tsc --noEmit`
Expected: PASS. Si hay errores referenciando `OrderItem.productId` esperando string, son los que arreglamos en la siguiente tarea.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): make OrderItem.productId optional for custom POS orders"
```

---

## Tarea 13: Aceptar items sin producto en API de orders

**Files:**
- Modify: `src/app/api/orders/route.ts`

- [ ] **Step 1: Actualizar el endpoint POST**

Reemplazar el bloque actual de `items.map(...)` dentro de `prisma.order.create` (líneas 54-74) y el loop de `Update product sales count` (líneas 86-91).

Sección actual a modificar — dentro de `items: { create: items.map((item: { ... }) => ({...})) }`:

```typescript
        items: {
          create: items.map((item: {
            productId: string;
            productName: string;
            productImage?: string;
            size?: string;
            quantity: number;
            unitPrice: number;
            subtotal: number;
            dedication?: string;
          }) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            dedication: item.dedication,
          })),
        },
```

Reemplazar por (la diferencia: `productId` ahora es opcional en el tipo y se pasa `null` si está vacío):

```typescript
        items: {
          create: items.map((item: {
            productId?: string | null;
            productName: string;
            productImage?: string;
            size?: string;
            quantity: number;
            unitPrice: number;
            subtotal: number;
            dedication?: string;
          }) => ({
            productId: item.productId || null,
            productName: item.productName,
            productImage: item.productImage,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            dedication: item.dedication,
          })),
        },
```

Y reemplazar el loop de salesCount (líneas 86-91):

```typescript
    // Update product sales count
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { salesCount: { increment: item.quantity } },
      }).catch(() => null);
    }
```

Por:

```typescript
    // Update product sales count (solo para items con productId del catálogo)
    for (const item of items) {
      if (!item.productId) continue;
      await prisma.product.update({
        where: { id: item.productId },
        data: { salesCount: { increment: item.quantity } },
      }).catch(() => null);
    }
```

- [ ] **Step 2: Validar al menos un item con productName**

Justo después del `await req.json();` y antes de `const orderNumber = ...`, agregar:

```typescript
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "El pedido debe tener al menos un item" }, { status: 400 });
    }
    for (const item of items) {
      if (!item.productName || typeof item.productName !== "string" || item.productName.trim().length < 3) {
        return NextResponse.json(
          { error: "Cada item requiere una descripción (mínimo 3 caracteres)" },
          { status: 400 }
        );
      }
      if (!item.quantity || item.quantity < 1) {
        return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
      }
    }
```

- [ ] **Step 3: Smoke test manual**

Iniciar `npm run dev`. Con la app corriendo, ejecutar:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "productName": "Ramo personalizado de prueba",
      "quantity": 1,
      "unitPrice": 85000,
      "subtotal": 85000
    }],
    "recipientName": "Cliente prueba",
    "recipientPhone": "3001234567",
    "deliveryAddress": "Mostrador",
    "subtotal": 85000,
    "shippingCost": 0,
    "total": 85000,
    "paymentMethod": "POS_CASH"
  }'
```
Expected: `{"orderNumber":"FL-...","id":"..."}` (HTTP 200). El pedido aparece en `/admin/pedidos` con productName = "Ramo personalizado de prueba" y sin productId.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/orders/route.ts
git commit -m "feat(api): accept order items without catalog productId"
```

---

## Tarea 14: Pestaña Personalizado en el POS

**Files:**
- Modify: `src/components/admin/pos-client.tsx`

- [ ] **Step 1: Refactor mínimo para introducir tabs**

Reemplazar el archivo completo. Mantiene la funcionalidad actual del catálogo y agrega el modo personalizado.

`src/components/admin/pos-client.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCOP } from "@/lib/utils";

interface PosProduct {
  id: string;
  name: string;
  basePrice: number;
  images: string[];
  stock: number;
  category: { name: string } | null;
}

interface CartItem extends PosProduct {
  quantity: number;
}

type Mode = "catalog" | "custom";

export function PosClient({ products }: { products: PosProduct[] }) {
  const [mode, setMode] = useState<Mode>("catalog");

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl text-forest">Punto de venta</h1>
        <div className="inline-flex border border-forest/15 rounded-sm overflow-hidden">
          <button
            onClick={() => setMode("catalog")}
            className={`px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] font-sans font-medium transition-colors ${
              mode === "catalog"
                ? "bg-forest text-cream"
                : "bg-cream text-forest/40 hover:text-forest/70"
            }`}
          >
            Catálogo
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] font-sans font-medium transition-colors border-l border-forest/15 ${
              mode === "custom"
                ? "bg-forest text-cream"
                : "bg-cream text-forest/40 hover:text-forest/70"
            }`}
          >
            Personalizado
          </button>
        </div>
      </div>

      {mode === "catalog" ? (
        <CatalogMode products={products} />
      ) : (
        <CustomMode />
      )}
    </div>
  );
}

/* ---------- Modo catálogo (lógica original) ---------- */

function CatalogMode({ products }: { products: PosProduct[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("POS_CASH");
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cashGiven, setCashGiven] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(product: PosProduct) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  const subtotal = cart.reduce((s, i) => s + i.basePrice * i.quantity, 0);
  const change = Number(cashGiven) - subtotal;

  async function handleSell() {
    if (!cart.length) return toast.error("El carrito está vacío");
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.id,
            productName: i.name,
            productImage: i.images[0],
            quantity: i.quantity,
            unitPrice: i.basePrice,
            subtotal: i.basePrice * i.quantity,
          })),
          recipientName: customerName || "Cliente mostrador",
          recipientPhone: "—",
          deliveryAddress: "Mostrador — Av 33 No. 54-52",
          subtotal,
          shippingCost: 0,
          total: subtotal,
          paymentMethod: payment,
        }),
      });
      if (!res.ok) throw new Error();
      const order = await res.json();
      toast.success(`Venta registrada: ${order.orderNumber}`, {
        description:
          payment === "POS_CASH" && cashGiven
            ? `Cambio: ${formatCOP(change)}`
            : undefined,
      });
      setCart([]);
      setCustomerName("");
      setCashGiven("");
    } catch {
      toast.error("Error al registrar la venta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-4 flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm font-sans border border-forest/15 rounded-sm bg-white focus:outline-none focus:border-forest/40 placeholder:text-forest/30"
        />
        <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white border border-forest/8 rounded-sm p-2 text-left hover:border-forest/30 hover:shadow-card transition-all group"
            >
              <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-cream-darker mb-2">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-forest/20 text-2xl">🌸</div>
                )}
              </div>
              <p className="text-xs font-sans font-medium text-forest line-clamp-2 mb-1">{p.name}</p>
              <p className="font-serif text-sm text-forest price">{formatCOP(p.basePrice)}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 py-12 text-center text-sm font-sans text-forest/40">
              Sin resultados para &quot;{search}&quot;
            </div>
          )}
        </div>
      </div>

      <div className="w-72 flex flex-col bg-white border border-forest/8 rounded-sm overflow-hidden flex-shrink-0">
        <div className="px-4 py-3 border-b border-forest/8">
          <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
            Carrito ({cart.length})
          </p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-forest/5">
          {cart.length === 0 ? (
            <div className="p-6 text-center text-xs font-sans text-forest/30">
              Toca un producto para agregar
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-4 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-sans font-medium text-forest truncate">{item.name}</p>
                  <p className="text-[11px] font-sans text-forest/50 price">{formatCOP(item.basePrice)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 rounded border border-forest/15 text-forest/50 text-xs hover:border-forest/40 transition-colors flex items-center justify-center">−</button>
                  <span className="w-5 text-center text-xs font-sans text-forest">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 rounded border border-forest/15 text-forest/50 text-xs hover:border-forest/40 transition-colors flex items-center justify-center">+</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-forest/8 p-4 flex flex-col gap-3">
          <Input label="Cliente (opcional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre del cliente" />
          <PaymentSelector value={payment} onChange={setPayment} />
          {payment === "POS_CASH" && (
            <Input label="Efectivo recibido" type="number" value={cashGiven} onChange={(e) => setCashGiven(e.target.value)} placeholder="0" />
          )}
          <div className="flex justify-between items-center pt-1 border-t border-forest/8">
            <span className="text-xs font-sans font-medium text-forest/60">Total</span>
            <span className="font-serif text-lg text-forest price">{formatCOP(subtotal)}</span>
          </div>
          {payment === "POS_CASH" && cashGiven && Number(cashGiven) >= subtotal && (
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-forest/50">Cambio</span>
              <span className="text-forest font-medium price">{formatCOP(change)}</span>
            </div>
          )}
          <Button className="w-full" onClick={handleSell} loading={submitting} disabled={!cart.length}>
            Registrar venta
          </Button>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs font-sans text-center text-forest/30 hover:text-burgundy transition-colors">
              Vaciar carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Modo personalizado ---------- */

function CustomMode() {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [payment, setPayment] = useState("POS_CASH");
  const [submitting, setSubmitting] = useState(false);

  const priceNum = Number(price) || 0;

  async function handleSubmit() {
    if (description.trim().length < 3) {
      return toast.error("La descripción debe tener al menos 3 caracteres");
    }
    if (priceNum <= 0) {
      return toast.error("El precio debe ser mayor a 0");
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              productName: description.trim(),
              quantity: 1,
              unitPrice: priceNum,
              subtotal: priceNum,
            },
          ],
          recipientName: customerName || "Cliente mostrador",
          recipientPhone: customerPhone || "—",
          deliveryAddress: "Mostrador — Av 33 No. 54-52",
          deliveryDate,
          subtotal: priceNum,
          shippingCost: 0,
          total: priceNum,
          paymentMethod: payment,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(err.error || "Error al registrar");
      }
      const order = await res.json();
      toast.success(`Pedido registrado: ${order.orderNumber}`);
      setDescription("");
      setPrice("");
      setCustomerName("");
      setCustomerPhone("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-4 flex-1 overflow-hidden">
      <div className="flex-1 bg-white border border-forest/8 rounded-sm p-5 flex flex-col gap-4 overflow-y-auto">
        <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
          Detalles del arreglo
        </p>
        <div>
          <label className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/40 block mb-1.5">
            Descripción del arreglo
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Ramo de rosas rojas con girasoles, papel kraft, moño dorado..."
            rows={4}
            className="w-full px-3 py-2 text-sm font-sans border border-forest/15 rounded-sm bg-white focus:outline-none focus:border-forest/40 placeholder:text-forest/30 resize-none"
          />
        </div>
        <Input
          label="Precio"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
        />
        <Input
          label="Fecha de entrega"
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
        />
      </div>

      <div className="w-72 flex flex-col bg-white border border-forest/8 rounded-sm overflow-hidden flex-shrink-0">
        <div className="px-4 py-3 border-b border-forest/8">
          <p className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
            Cliente y pago
          </p>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3">
          <Input
            label="Nombre del cliente"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Opcional"
          />
          <Input
            label="Teléfono"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Opcional"
          />
          <PaymentSelector value={payment} onChange={setPayment} />
        </div>
        <div className="border-t border-forest/8 p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-sans font-medium text-forest/60">Total</span>
            <span className="font-serif text-lg text-forest price">
              {formatCOP(priceNum)}
            </span>
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!description.trim() || priceNum <= 0}
          >
            Registrar pedido
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Selector de método de pago (compartido) ---------- */

function PaymentSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const methods = [
    { v: "POS_CASH", label: "Efectivo" },
    { v: "POS_CARD", label: "Tarjeta" },
    { v: "BANK_TRANSFER", label: "Transferencia" },
  ];
  return (
    <div>
      <p className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/40 mb-1.5">
        Método de pago
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {methods.map((m) => (
          <button
            key={m.v}
            onClick={() => onChange(m.v)}
            className={`py-1.5 text-[11px] font-sans rounded-sm border transition-colors ${
              value === m.v
                ? "bg-forest text-cream border-forest"
                : "bg-white text-forest/50 border-forest/15 hover:border-forest/40"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Nota sobre PaymentMethod:** este archivo cambia los valores enviados de `"CASH"|"CARD"|"TRANSFER"|"NEQUI"` (strings que no existían en el enum del schema) a `"POS_CASH"|"POS_CARD"|"BANK_TRANSFER"` (valores reales del enum `PaymentMethod`). Esto **corrige** un bug existente en el POS que enviaba valores inválidos.

- [ ] **Step 2: Verificación manual completa**

Run: `npm run dev`. Entrar a `/admin/pos` autenticado como ADMIN o SELLER.

**Modo Catálogo:**
- Buscar y agregar productos al carrito sigue funcionando
- Registrar venta crea el pedido y aparece en `/admin/pedidos`

**Modo Personalizado:**
- Cambiar a la pestaña "Personalizado"
- Validación: dejar descripción vacía → error toast
- Validación: precio en 0 → botón deshabilitado
- Llenar descripción "Arreglo de prueba", precio 50000, registrar
- Toast de éxito con número de pedido
- Ir a `/admin/pedidos`, verificar que aparece con la descripción correcta como nombre del item

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/pos-client.tsx
git commit -m "feat(pos): add Personalizado tab for custom in-store orders"
```

---

## Verificación final

- [ ] **Run all tests**

Run: `npm run test`
Expected: Todos los tests pasan (los existentes + los nuevos en `src/lib/reports/`).

- [ ] **Run type check**

Run: `npx tsc --noEmit`
Expected: 0 errores.

- [ ] **Run lint**

Run: `npm run lint`
Expected: Sin errores nuevos.

- [ ] **Smoke test end-to-end**

Con `npm run dev` corriendo:

1. `/admin/reportes` — descarga Excel y PDF de Ventas y de Clientes (4 archivos total, todos válidos)
2. `/admin/pos` — registrar una venta de catálogo y una personalizada
3. `/admin/pedidos` — verificar que ambos pedidos aparecen correctamente

- [ ] **Spec self-review final**

Verificar contra el spec:
- ✅ Botones de descarga Excel y PDF para Ventas y Clientes
- ✅ Filtros de período: semana, mes, año
- ✅ Integrado en la página existente sin romper layout
- ✅ Pestaña Personalizado en POS
- ✅ Schema actualizado y migrado
- ✅ Validaciones en API y UI
