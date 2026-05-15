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
