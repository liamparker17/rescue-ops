"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatZAR, formatDate } from "@rescue-ops/shared";

const ROWS_PER_PAGE = 20;

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica" },
  header: { textAlign: "center", marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 11, color: "#555", marginTop: 4 },
  dateText: { fontSize: 9, color: "#888", marginTop: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginVertical: 10 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", fontFamily: "Helvetica-Bold", marginBottom: 6, color: "#333" },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 180, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  value: { flex: 1 },
  // Table styles
  tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", borderBottomWidth: 1, borderBottomColor: "#CBD5E1", paddingVertical: 4, paddingHorizontal: 2 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0", paddingVertical: 3, paddingHorizontal: 2 },
  colNum: { width: 24 },
  colName: { flex: 1 },
  colClaim: { width: 80, textAlign: "right" },
  colSecurity: { width: 60, textAlign: "center" },
  colStage: { width: 70, textAlign: "center" },
  colVoting: { width: 52, textAlign: "center" },
  colContact: { width: 62, textAlign: "center" },
  headerText: { fontSize: 8, fontWeight: "bold", fontFamily: "Helvetica-Bold", color: "#475569" },
  cellText: { fontSize: 8, color: "#334155" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#94A3B8" },
});

const STAGE_LABELS: Record<string, string> = {
  Identified: "Identified",
  Notified: "Notified",
  InNegotiation: "In Neg.",
  OfferMade: "Offer",
  Agreed: "Agreed",
  Voted: "Voted",
};

interface CreditorRow {
  creditorName: string;
  claimAmountInCents: number;
  securityType: string;
  stage: string;
  votingStatus: string;
  lastContactDate: string | null;
}

interface CreditorSummaryPDFProps {
  creditors: CreditorRow[];
  orgName: string;
}

function TableHeaders() {
  return (
    <View style={styles.tableHeader}>
      <View style={styles.colNum}><Text style={styles.headerText}>#</Text></View>
      <View style={styles.colName}><Text style={styles.headerText}>Creditor Name</Text></View>
      <View style={styles.colClaim}><Text style={styles.headerText}>Claim (ZAR)</Text></View>
      <View style={styles.colSecurity}><Text style={styles.headerText}>Security</Text></View>
      <View style={styles.colStage}><Text style={styles.headerText}>Stage</Text></View>
      <View style={styles.colVoting}><Text style={styles.headerText}>Voting</Text></View>
      <View style={styles.colContact}><Text style={styles.headerText}>Last Contact</Text></View>
    </View>
  );
}

export function CreditorSummaryPDF({ creditors, orgName }: CreditorSummaryPDFProps) {
  const now = new Date();
  const dateStr = formatDate(now);

  // Sort: Secured (largest first) -> Preferent -> Concurrent
  const securityOrder: Record<string, number> = { Secured: 0, Preferent: 1, Concurrent: 2 };
  const sorted = [...creditors].sort((a, b) => {
    const typeA = securityOrder[a.securityType] ?? 3;
    const typeB = securityOrder[b.securityType] ?? 3;
    if (typeA !== typeB) return typeA - typeB;
    return b.claimAmountInCents - a.claimAmountInCents;
  });

  // Stats
  const totalClaims = creditors.reduce((s, c) => s + c.claimAmountInCents, 0);
  const byType = (type: string) => {
    const list = creditors.filter((c) => c.securityType === type);
    return { count: list.length, amount: list.reduce((s, c) => s + c.claimAmountInCents, 0) };
  };
  const secured = byType("Secured");
  const preferent = byType("Preferent");
  const concurrent = byType("Concurrent");

  const byVote = (status: string) => {
    const list = creditors.filter((c) => c.votingStatus === status);
    return { count: list.length, amount: list.reduce((s, c) => s + c.claimAmountInCents, 0) };
  };
  const voteFor = byVote("For");
  const voteAgainst = byVote("Against");
  const voteAbstained = byVote("Abstained");
  const votePending = byVote("Pending");

  // Chunk for pagination
  const chunks: CreditorRow[][] = [];
  for (let i = 0; i < sorted.length; i += ROWS_PER_PAGE) {
    chunks.push(sorted.slice(i, i + ROWS_PER_PAGE));
  }
  if (chunks.length === 0) chunks.push([]);

  const totalPages = 1 + chunks.length; // 1 summary page + data pages

  return (
    <Document>
      {/* Summary Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>CREDITOR SUMMARY REPORT</Text>
          <Text style={styles.subtitle}>{orgName}</Text>
          <Text style={styles.dateText}>Generated on {dateStr}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Claims Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Claims:</Text>
            <Text style={styles.value}>{formatZAR(totalClaims)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Secured ({secured.count} creditors):</Text>
            <Text style={styles.value}>{formatZAR(secured.amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Preferent ({preferent.count} creditors):</Text>
            <Text style={styles.value}>{formatZAR(preferent.amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Concurrent ({concurrent.count} creditors):</Text>
            <Text style={styles.value}>{formatZAR(concurrent.amount)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voting Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>For ({voteFor.count}):</Text>
            <Text style={styles.value}>{formatZAR(voteFor.amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Against ({voteAgainst.count}):</Text>
            <Text style={styles.value}>{formatZAR(voteAgainst.amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Abstained ({voteAbstained.count}):</Text>
            <Text style={styles.value}>{formatZAR(voteAbstained.amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pending ({votePending.count}):</Text>
            <Text style={styles.value}>{formatZAR(votePending.amount)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated on {dateStr}</Text>
          <Text style={styles.footerText}>Page 1 of {totalPages}</Text>
        </View>
      </Page>

      {/* Data Pages */}
      {chunks.map((chunk, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Creditor Register {chunks.length > 1 ? `(continued)` : ""}</Text>
          <TableHeaders />
          {chunk.map((creditor, rowIdx) => {
            const globalIdx = pageIdx * ROWS_PER_PAGE + rowIdx + 1;
            return (
              <View key={globalIdx} style={styles.tableRow}>
                <View style={styles.colNum}><Text style={styles.cellText}>{globalIdx}</Text></View>
                <View style={styles.colName}><Text style={styles.cellText}>{creditor.creditorName}</Text></View>
                <View style={styles.colClaim}><Text style={styles.cellText}>{formatZAR(creditor.claimAmountInCents)}</Text></View>
                <View style={styles.colSecurity}><Text style={styles.cellText}>{creditor.securityType}</Text></View>
                <View style={styles.colStage}><Text style={styles.cellText}>{STAGE_LABELS[creditor.stage] || creditor.stage}</Text></View>
                <View style={styles.colVoting}><Text style={styles.cellText}>{creditor.votingStatus}</Text></View>
                <View style={styles.colContact}>
                  <Text style={styles.cellText}>
                    {creditor.lastContactDate ? formatDate(creditor.lastContactDate) : "\u2014"}
                  </Text>
                </View>
              </View>
            );
          })}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Generated on {dateStr}</Text>
            <Text style={styles.footerText}>Page {pageIdx + 2} of {totalPages}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}
