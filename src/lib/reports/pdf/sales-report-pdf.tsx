import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20, borderBottom: "1 solid #e2e8f0", paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 10, color: "#64748b", marginTop: 4 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 8, color: "#0f172a" },
  kpiRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  kpiBox: { flex: 1, padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 },
  kpiLabel: { fontSize: 8, color: "#64748b" },
  kpiValue: { fontSize: 14, fontWeight: "bold", color: "#059669", marginTop: 4 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: { flexDirection: "row", padding: 8, borderBottom: "1 solid #e2e8f0" },
  col1: { flex: 2 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
    borderTop: "1 solid #e2e8f0",
    paddingTop: 8,
  },
});

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
}

type Props = {
  storeName: string;
  orgName: string;
  currency: string;
  totalRevenue: number;
  transactionCount: number;
  topProducts: Array<{ product_name: string; total_qty: number; total_revenue: number }>;
  generatedAt: string;
};

export function SalesReportPdf({
  storeName,
  orgName,
  currency,
  totalRevenue,
  transactionCount,
  topProducts,
  generatedAt,
}: Props) {
  const avgTicket = transactionCount ? totalRevenue / transactionCount : 0;
  const dateStr = new Date(generatedAt).toLocaleDateString("en-IN", {
    dateStyle: "long",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{orgName}</Text>
          <Text style={styles.subtitle}>{storeName}</Text>
          <Text style={styles.subtitle}>Sales Summary Report — Last 30 Days</Text>
          <Text style={styles.subtitle}>Generated: {dateStr}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Total Revenue</Text>
              <Text style={styles.kpiValue}>{formatMoney(totalRevenue, currency)}</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Transactions</Text>
              <Text style={styles.kpiValue}>{transactionCount}</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Avg. Ticket</Text>
              <Text style={styles.kpiValue}>{formatMoney(avgTicket, currency)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Products</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Product</Text>
            <Text style={styles.col2}>Qty Sold</Text>
            <Text style={styles.col3}>Revenue</Text>
          </View>
          {topProducts.length === 0 ? (
            <Text style={{ padding: 8, color: "#64748b" }}>No sales data for this period.</Text>
          ) : (
            topProducts.map((p) => (
              <View key={p.product_name} style={styles.tableRow}>
                <Text style={styles.col1}>{p.product_name}</Text>
                <Text style={styles.col2}>{p.total_qty}</Text>
                <Text style={styles.col3}>{formatMoney(p.total_revenue, currency)}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.footer}>StoreMgr — Page 1 of 1</Text>
      </Page>
    </Document>
  );
}
