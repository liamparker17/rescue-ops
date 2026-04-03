"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardSkeleton } from "@rescue-ops/shared";
import { DashboardClient } from "@components/DashboardClient";

export default function TriagePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/triage");
      if (!res.ok) throw new Error("Failed to fetch triage data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch triage data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return (
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <DashboardClient
        orgName="Mpumalanga Steel Fabricators (Pty) Ltd"
        data={data}
        pipelineUrl={process.env.NEXT_PUBLIC_PIPELINE_URL}
      />
    </main>
  );
}
