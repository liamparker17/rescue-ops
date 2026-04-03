"use client";

import { formatZAR, useCountUp } from "@rescue-ops/shared";

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
  const animatedTotal = useCountUp(totalClaims);
  const animatedSecured = useCountUp(securedAmount);
  const animatedPreferent = useCountUp(preferentAmount);
  const animatedConcurrent = useCountUp(concurrentAmount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-accent animate-fade-in-up">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Claims</p>
        <p className="text-2xl md:text-3xl font-bold mt-2 text-slate-900">{formatZAR(animatedTotal)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-accent animate-fade-in-up stagger-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Secured</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{securedCount}</span>
        </div>
        <p className="text-2xl md:text-3xl font-bold mt-2 text-slate-900">{formatZAR(animatedSecured)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-accent animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Preferent</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">{preferentCount}</span>
        </div>
        <p className="text-2xl md:text-3xl font-bold mt-2 text-slate-900">{formatZAR(animatedPreferent)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-accent animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Concurrent</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{concurrentCount}</span>
        </div>
        <p className="text-2xl md:text-3xl font-bold mt-2 text-slate-900">{formatZAR(animatedConcurrent)}</p>
      </div>
    </div>
  );
}
