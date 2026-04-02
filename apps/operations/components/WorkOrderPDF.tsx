"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { textAlign: "center", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 12, color: "#555", marginTop: 4 },
  row: { flexDirection: "row", marginBottom: 8 },
  label: { width: 160, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  value: { flex: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginVertical: 12 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", fontFamily: "Helvetica-Bold", marginBottom: 8, color: "#333" },
  signatureSection: { marginTop: 40, flexDirection: "row", justifyContent: "space-between" },
  signatureBlock: { width: "45%" },
  signatureLine: { borderBottomWidth: 1, borderBottomColor: "#000", marginTop: 30, marginBottom: 4 },
  signatureLabel: { fontSize: 8, color: "#555" },
});

interface WorkOrderPDFProps {
  task: {
    taskNumber: number;
    title: string;
    description: string;
    priority: string;
    createdAt: string;
    dueDate?: string | null;
    responsible?: { name: string } | null;
  };
  orgName: string;
}

export function WorkOrderPDF({ task, orgName }: WorkOrderPDFProps) {
  const taskCode = `OT-${String(task.taskNumber).padStart(4, "0")}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>WORK ORDER</Text>
          <Text style={styles.subtitle}>{taskCode}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Organisation:</Text>
            <Text style={styles.value}>{orgName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Work Order Number:</Text>
            <Text style={styles.value}>{taskCode}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date Issued:</Text>
            <Text style={styles.value}>
              {new Date(task.createdAt).toLocaleDateString("en-ZA")}
            </Text>
          </View>
          {task.dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>
                {new Date(task.dueDate).toLocaleDateString("en-ZA")}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Priority:</Text>
            <Text style={styles.value}>{task.priority}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Title:</Text>
            <Text style={styles.value}>{task.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{task.description}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Responsible Party:</Text>
            <Text style={styles.value}>{task.responsible?.name || "\u2014"}</Text>
          </View>
        </View>
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Assigned By (Signature)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Accepted By (Signature)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
