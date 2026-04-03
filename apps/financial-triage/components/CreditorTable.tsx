import { formatZAR } from "@rescue-ops/shared";

interface Creditor {
  rank: number;
  id: string;
  creditorName: string;
  claimAmountInCents: number;
  securityType: string;
  percentOfTotal: number;
  contactName: string | null;
}

interface CreditorTableProps {
  creditors: Creditor[];
  pipelineUrl?: string;
}

const SECURITY_COLORS: Record<string, string> = {
  Secured: "bg-slate-700 text-white",
  Preferent: "bg-teal-600 text-white",
  Concurrent: "bg-slate-400 text-white",
};

export function CreditorTable({ creditors, pipelineUrl }: CreditorTableProps) {
  const maxClaim = Math.max(...creditors.map((c) => c.claimAmountInCents));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
        Top 10 Creditor Exposure
      </h3>

      {/* Desktop: table rows */}
      <div className="hidden md:block space-y-2">
        {creditors.map((c, i) => {
          const barWidth = maxClaim > 0 ? (c.claimAmountInCents / maxClaim) * 100 : 0;
          return (
            <div key={c.id} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div
                className="absolute inset-y-0 left-0 bg-teal-50 rounded"
                style={{ width: `${barWidth}%` }}
              />
              <div className="relative flex items-center justify-between py-2 px-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-5">{c.rank}</span>
                  {pipelineUrl ? (
                    <a
                      href={`${pipelineUrl}?creditor=${c.id}`}
                      className="font-medium text-slate-900 hover:text-accent transition-colors"
                    >
                      {c.creditorName}
                    </a>
                  ) : (
                    <span className="font-medium text-slate-900">{c.creditorName}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${SECURITY_COLORS[c.securityType] || "bg-slate-200"}`}>
                    {c.securityType}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-900">{formatZAR(c.claimAmountInCents)}</span>
                  <span className="text-xs text-slate-400 w-12 text-right">{c.percentOfTotal.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: card view */}
      <div className="md:hidden space-y-3">
        {creditors.map((c, i) => {
          const barWidth = maxClaim > 0 ? (c.claimAmountInCents / maxClaim) * 100 : 0;
          const Wrapper = pipelineUrl ? "a" : "div";
          const wrapperProps = pipelineUrl
            ? { href: `${pipelineUrl}?creditor=${c.id}` }
            : {};

          return (
            <Wrapper
              key={c.id}
              {...wrapperProps}
              className="block bg-slate-50 rounded-lg p-3 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-slate-900">{c.creditorName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${SECURITY_COLORS[c.securityType] || "bg-slate-200"}`}>
                  {c.securityType}
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-semibold text-slate-900">{formatZAR(c.claimAmountInCents)}</span>
                <span className="text-xs text-slate-400">{c.percentOfTotal.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-accent rounded-full h-1.5 transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
