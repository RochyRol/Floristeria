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
