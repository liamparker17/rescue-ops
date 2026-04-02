import { formatZAR } from "@rescue-ops/shared";

interface StatsRowProps {
  totalClaims: number;
  securedAmount: number;
  securedCount: number;
  preferentAmount: number;
  preferentCount: number;
  concurrentAmount: number;
  concurrentCount: number;
}

export function StatsRow({
  totalClaims,
  securedAmount,
  securedCount,
  preferentAmount,
  preferentCount,
  concurrentAmount,
  concurrentCount,
}: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-accent">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Claims</p>
        <p className="text-3xl font-bold mt-2 text-slate-900">{formatZAR(totalClaims)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-accent">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Secured</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{securedCount}</span>
        </div>
        <p className="text-3xl font-bold mt-2 text-slate-900">{formatZAR(securedAmount)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-accent">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Preferent</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">{preferentCount}</span>
        </div>
        <p className="text-3xl font-bold mt-2 text-slate-900">{formatZAR(preferentAmount)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-accent">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Concurrent</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{concurrentCount}</span>
        </div>
        <p className="text-3xl font-bold mt-2 text-slate-900">{formatZAR(concurrentAmount)}</p>
      </div>
    </div>
  );
}
