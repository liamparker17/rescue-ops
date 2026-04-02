import { DashboardClient } from "@components/DashboardClient";

async function getTriageData() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3001";

  const res = await fetch(`${baseUrl}/api/triage`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch triage data");
  return res.json();
}

async function getOrgName() {
  // Hardcoded for the demo — matches seed data
  return "Mpumalanga Steel Fabricators (Pty) Ltd";
}

export default async function TriagePage() {
  const [data, orgName] = await Promise.all([getTriageData(), getOrgName()]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <DashboardClient
        orgName={orgName}
        data={data}
        pipelineUrl={process.env.NEXT_PUBLIC_PIPELINE_URL}
      />
    </main>
  );
}
