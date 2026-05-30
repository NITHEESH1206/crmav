import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

/**
 * Branded invoice PDF — pure @react-pdf/renderer (no DOM). Rendered on the
 * server and streamed by the API route.
 *
 * Brand: Ink #0A0A0A · Signal #FF5A1F · Bone #F4F2EC.
 */

export type InvoicePdfData = {
  workspaceName: string;
  workspaceCurrency: string;
  number: string;
  status: string;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  accountName: string;
  accountContact?: { name: string; email: string | null } | null;
  lines: { description: string; quantity: number; unitPriceCents: number }[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
};

const c = {
  ink: "#0A0A0A",
  signal: "#FF5A1F",
  bone: "#F4F2EC",
  bone300: "#DDD6C8",
  muted: "#6B665C",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingHorizontal: 48,
    paddingBottom: 64,
    fontSize: 10,
    color: c.ink,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  // Header
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: c.ink },
  brandAccent: { color: c.signal },
  invoiceLabel: { fontSize: 22, fontFamily: "Helvetica-Bold", color: c.ink, textAlign: "right" },
  invoiceNumber: { fontSize: 10, color: c.muted, textAlign: "right", marginTop: 2 },
  accentBar: { height: 3, backgroundColor: c.signal, marginTop: 16, marginBottom: 24, borderRadius: 2 },
  // Meta blocks
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  metaBlock: { width: "30%" },
  metaLabel: { fontSize: 8, color: c.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  metaValue: { fontSize: 10, color: c.ink, lineHeight: 1.5 },
  // Table
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: c.ink,
    paddingBottom: 6,
    marginBottom: 4,
  },
  th: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.5, color: c.muted },
  tr: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: c.bone300,
  },
  td: { fontSize: 10, color: c.ink },
  colDesc: { width: "50%" },
  colQty: { width: "14%", textAlign: "right" },
  colUnit: { width: "18%", textAlign: "right" },
  colAmt: { width: "18%", textAlign: "right" },
  // Totals
  totalsWrap: { marginTop: 16, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 220, paddingVertical: 3 },
  totalsLabel: { fontSize: 10, color: c.muted },
  totalsValue: { fontSize: 10, color: c.ink, fontFamily: "Helvetica-Bold" },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: c.ink,
  },
  grandLabel: { fontSize: 12, fontFamily: "Helvetica-Bold", color: c.ink },
  grandValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: c.signal },
  // Status pill
  statusPill: {
    alignSelf: "flex-end",
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 0.5,
    borderTopColor: c.bone300,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: c.muted },
});

function money(cents: number, currency: string): string {
  const symbol =
    currency === "USD" ? "$" :
    currency === "EUR" ? "€" :
    currency === "GBP" ? "£" :
    currency === "INR" ? "₹" :
    currency === "AED" ? "AED " :
    currency === "SGD" ? "S$" : "$";
  return symbol + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusColors(status: string): { bg: string; fg: string } {
  switch (status) {
    case "PAID":    return { bg: "#E8F4EC", fg: "#11703A" };
    case "OVERDUE": return { bg: "#FBE9E7", fg: "#A8201A" };
    case "SENT":    return { bg: "#E8EEF6", fg: "#1F3A6B" };
    default:        return { bg: "#F1EFE9", fg: "#3F3B33" };
  }
}

export function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  const sc = statusColors(data.status);
  return (
    <Document title={`Invoice ${data.number}`} author={data.workspaceName}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>
              {data.workspaceName}
            </Text>
            <Text style={{ fontSize: 8, color: c.muted, marginTop: 2 }}>
              AV systems integration
            </Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.number}</Text>
            <Text style={[styles.statusPill, { backgroundColor: sc.bg, color: sc.fg }]}>
              {data.status}
            </Text>
          </View>
        </View>

        <View style={styles.accentBar} />

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Billed to</Text>
            <Text style={styles.metaValue}>{data.accountName}</Text>
            {data.accountContact?.name && (
              <Text style={styles.metaValue}>{data.accountContact.name}</Text>
            )}
            {data.accountContact?.email && (
              <Text style={[styles.metaValue, { color: c.muted }]}>{data.accountContact.email}</Text>
            )}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Issued</Text>
            <Text style={styles.metaValue}>{data.issuedAt ?? "—"}</Text>
            <Text style={[styles.metaLabel, { marginTop: 10 }]}>Due</Text>
            <Text style={styles.metaValue}>{data.dueAt ?? "—"}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Amount due</Text>
            <Text style={[styles.metaValue, { fontSize: 16, fontFamily: "Helvetica-Bold", color: c.signal }]}>
              {money(data.totalCents, data.workspaceCurrency)}
            </Text>
            {data.paidAt && (
              <>
                <Text style={[styles.metaLabel, { marginTop: 8 }]}>Paid</Text>
                <Text style={styles.metaValue}>{data.paidAt}</Text>
              </>
            )}
          </View>
        </View>

        {/* Line items */}
        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.colDesc]}>Description</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colUnit]}>Unit</Text>
          <Text style={[styles.th, styles.colAmt]}>Amount</Text>
        </View>
        {data.lines.length === 0 ? (
          <View style={styles.tr}>
            <Text style={[styles.td, { color: c.muted }]}>No line items.</Text>
          </View>
        ) : (
          data.lines.map((line, i) => (
            <View style={styles.tr} key={i}>
              <Text style={[styles.td, styles.colDesc]}>{line.description}</Text>
              <Text style={[styles.td, styles.colQty]}>{line.quantity}</Text>
              <Text style={[styles.td, styles.colUnit]}>{money(line.unitPriceCents, data.workspaceCurrency)}</Text>
              <Text style={[styles.td, styles.colAmt]}>
                {money(line.quantity * line.unitPriceCents, data.workspaceCurrency)}
              </Text>
            </View>
          ))
        )}

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{money(data.subtotalCents, data.workspaceCurrency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text style={styles.totalsValue}>{money(data.taxCents, data.workspaceCurrency)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{money(data.totalCents, data.workspaceCurrency)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{data.workspaceName} · Invoice {data.number}</Text>
          <Text style={styles.footerText}>Generated by ZynexAV</Text>
        </View>
      </Page>
    </Document>
  );
}
