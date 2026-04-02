"use client";

import { useState, useEffect, useCallback } from "react";
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-20 text-slate-400">Loading...</div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <DashboardClient
        orgName="Mpumalanga Steel Fabricators (Pty) Ltd"
        data={data}
        pipelineUrl={process.env.NEXT_PUBLIC_PIPELINE_URL}
      />
    </main>
  );
}
