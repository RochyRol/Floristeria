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
    return new NextResponse(buf as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  }

  const buf = await buildSalesPdf(data, range.label);
  return new NextResponse(buf as any, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
    },
  });
}
