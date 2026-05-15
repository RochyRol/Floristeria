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
