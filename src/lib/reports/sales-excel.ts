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
