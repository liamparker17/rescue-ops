"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CREDITOR_STAGES, MetricCardSkeleton, CardSkeleton } from "@rescue-ops/shared";
import { Header } from "@components/Header";
import { StatsRow } from "@components/StatsRow";
import { KanbanBoard } from "@components/KanbanBoard";
import { SlideOver } from "@components/SlideOver";
import { CreditorSlideOver } from "@components/CreditorSlideOver";
import { CreditorSummaryPDF } from "@components/CreditorSummaryPDF";
import { type Creditor } from "@components/CreditorCard";
import { printPdf } from "../lib/printPdf";

interface Contact {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
}

interface CreditorDetail {
  id: string;
  creditorName: string;
  claimAmountInCents: number;
  securityType: string;
  stage: string;
  contactId: string | null;
  lastContactDate: string | null;
  votingStatus: string;
  notes: string | null;
  contact: { id: string; name: string; role: string | null; company: string | null } | null;
  communications: { id: string; method: string; summary: string; date: string; createdAt: string }[];
}

const ORG_NAME = "Mpumalanga Steel Fabricators (Pty) Ltd";

export default function CreditorPipelinePage() {
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Slide-over state
  const [slideOpen, setSlideOpen] = useState(false);
  const [selectedCreditor, setSelectedCreditor] = useState<CreditorDetail | null>(null);
  const [isNewCreditor, setIsNewCreditor] = useState(false);

  // PDF loading
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [creditorsRes, contactsRes] = await Promise.all([
        fetch("/api/creditors?limit=200"),
        fetch("/api/contacts"),
      ]);
      const creditorsData = await creditorsRes.json();
      const contactsData = await contactsRes.json();
      setCreditors(creditorsData.data || []);
      setContacts(contactsData || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats
  const stats = useMemo(() => {
    const totalClaims = creditors.reduce((s, c) => s + c.claimAmountInCents, 0);
    const byType = (type: string) => {
      const list = creditors.filter((c) => c.securityType === type);
      return { amount: list.reduce((s, c) => s + c.claimAmountInCents, 0), count: list.length };
    };
    return {
      totalClaims,
      secured: byType("Secured"),
      preferent: byType("Preferent"),
      concurrent: byType("Concurrent"),
    };
  }, [creditors]);

  // Stage move with optimistic UI
  async function handleMoveStage(creditorId: string, direction: "left" | "right") {
    const creditor = creditors.find((c) => c.id === creditorId);
    if (!creditor) return;

    const currentIdx = CREDITOR_STAGES.indexOf(creditor.stage as typeof CREDITOR_STAGES[number]);
    if (currentIdx === -1) return;

    const newIdx = direction === "left" ? currentIdx - 1 : currentIdx + 1;
    if (newIdx < 0 || newIdx >= CREDITOR_STAGES.length) return;

    const newStage = CREDITOR_STAGES[newIdx];

    // Optimistic update
    setCreditors((prev) =>
      prev.map((c) => (c.id === creditorId ? { ...c, stage: newStage } : c))
    );

    try {
      const res = await fetch(`/api/creditors/${creditorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
    } catch {
      // Revert on error
      setCreditors((prev) =>
        prev.map((c) => (c.id === creditorId ? { ...c, stage: creditor.stage } : c))
      );
    }
  }

  // Card click — fetch full details
  async function handleCardClick(creditor: Creditor) {
    try {
      const res = await fetch(`/api/creditors/${creditor.id}`);
      if (!res.ok) throw new Error("Failed to fetch creditor");
      const data = await res.json();
      setSelectedCreditor(data);
      setIsNewCreditor(false);
      setSlideOpen(true);
    } catch (err) {
      console.error("Failed to fetch creditor details", err);
    }
  }

  // New creditor
  function handleNewCreditor() {
    setSelectedCreditor({
      id: "",
      creditorName: "",
      claimAmountInCents: 0,
      securityType: "Concurrent",
      stage: "Identified",
      contactId: null,
      lastContactDate: null,
      votingStatus: "Pending",
      notes: null,
      contact: null,
      communications: [],
    });
    setIsNewCreditor(true);
    setSlideOpen(true);
  }

  // Save creditor (create or update)
  async function handleSave(data: Record<string, unknown>) {
    if (isNewCreditor) {
      const res = await fetch("/api/creditors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create creditor");
        return;
      }
    } else if (selectedCreditor) {
      const res = await fetch(`/api/creditors/${selectedCreditor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update creditor");
        return;
      }
    }

    setSlideOpen(false);
    setSelectedCreditor(null);
    setLoading(true);
    await fetchData();
  }

  // Add communication
  async function handleAddCommunication(data: { method: string; summary: string; date: string }) {
    if (!selectedCreditor || isNewCreditor) return;

    const res = await fetch(`/api/creditors/${selectedCreditor.id}/communications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to add communication");
      return;
    }

    // Refresh creditor details
    const detailRes = await fetch(`/api/creditors/${selectedCreditor.id}`);
    if (detailRes.ok) {
      const detail = await detailRes.json();
      setSelectedCreditor(detail);
    }

    // Refresh list for updated lastContactDate
    await fetchData();
  }

  // Export PDF
  async function handleExportPdf() {
    setPdfLoading(true);
    try {
      await printPdf(
        <CreditorSummaryPDF creditors={creditors} orgName={ORG_NAME} />
      );
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setPdfLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8">
      <Header
        onNewCreditor={handleNewCreditor}
        onExportPdf={handleExportPdf}
        pdfLoading={pdfLoading}
      />

      <StatsRow
        totalClaims={stats.totalClaims}
        securedAmount={stats.secured.amount}
        securedCount={stats.secured.count}
        preferentAmount={stats.preferent.amount}
        preferentCount={stats.preferent.count}
        concurrentAmount={stats.concurrent.amount}
        concurrentCount={stats.concurrent.count}
      />

      <KanbanBoard
        creditors={creditors}
        onMoveStage={handleMoveStage}
        onCardClick={handleCardClick}
      />

      <SlideOver
        open={slideOpen}
        onClose={() => { setSlideOpen(false); setSelectedCreditor(null); }}
        title={isNewCreditor ? "Add Creditor" : (selectedCreditor?.creditorName || "Creditor Details")}
        width="max-w-lg"
      >
        {selectedCreditor && (
          <CreditorSlideOver
            creditor={selectedCreditor}
            contacts={contacts}
            onSave={handleSave}
            onAddCommunication={handleAddCommunication}
            onClose={() => { setSlideOpen(false); setSelectedCreditor(null); }}
          />
        )}
      </SlideOver>
    </main>
  );
}
