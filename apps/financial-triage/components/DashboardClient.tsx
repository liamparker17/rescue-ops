"use client";

import { useState, useCallback } from "react";
import { Header } from "./Header";
import { MetricCard } from "./MetricCard";
import { SecurityChart } from "./SecurityChart";
import { RunwayChart } from "./RunwayChart";
import { CreditorTable } from "./CreditorTable";
import { BalanceSheet } from "./BalanceSheet";
import { SlideOver } from "./SlideOver";
import { AddBalanceForm } from "./AddBalanceForm";

interface DashboardClientProps {
  orgName: string;
  data: {
    metrics: {
      cashPosition: number;
      totalCreditorExposure: number;
      solvencyRatio: number;
      monthlyBurnRate: number;
      runwayDays: number;
    };
    runway: { day: number; balance: number }[];
    securityBreakdown: { Secured: number; Preferent: number; Concurrent: number };
    top10: {
      rank: number;
      id: string;
      creditorName: string;
      claimAmountInCents: number;
      securityType: string;
      percentOfTotal: number;
      contactName: string | null;
    }[];
    balanceSheet: {
      totalAssets: number;
      totalLiabilities: number;
      totalEquity: number;
      netPosition: number;
      assetCount: number;
      liabilityCount: number;
      equityCount: number;
    };
  };
  pipelineUrl?: string;
}

export function DashboardClient({ orgName, data, pipelineUrl }: DashboardClientProps) {
  const [slideOpen, setSlideOpen] = useState(false);

  const handleSaved = useCallback(() => {
    setSlideOpen(false);
    // Refresh the page to re-fetch server data
    window.location.reload();
  }, []);

  return (
    <>
      <Header orgName={orgName} onAddBalance={() => setSlideOpen(true)} />

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Cash Position" value={data.metrics.cashPosition} />
        <MetricCard label="Total Creditor Exposure" value={data.metrics.totalCreditorExposure} />
        <MetricCard label="Solvency Ratio" value={data.metrics.solvencyRatio} format="ratio" colorLogic="solvency" />
        <MetricCard label="Monthly Burn Rate" value={data.metrics.monthlyBurnRate} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <SecurityChart data={data.securityBreakdown} />
        <RunwayChart data={data.runway} runwayDays={data.metrics.runwayDays} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <CreditorTable creditors={data.top10} pipelineUrl={pipelineUrl} />
        </div>
        <div className="lg:col-span-2">
          <BalanceSheet data={data.balanceSheet} />
        </div>
      </div>

      {/* Slide-Over */}
      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title="Add Opening Balances">
        <AddBalanceForm onSaved={handleSaved} />
      </SlideOver>
    </>
  );
}
