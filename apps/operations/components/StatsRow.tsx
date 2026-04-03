"use client";

import { useCountUp } from "@rescue-ops/shared";

interface StatsRowProps {
  openCount: number;
  criticalCount: number;
  inProgressCount: number;
  completedThisWeek: number;
}

export function StatsRow({ openCount, criticalCount, inProgressCount, completedThisWeek }: StatsRowProps) {
  const animOpen = useCountUp(openCount, 800);
  const animCritical = useCountUp(criticalCount, 800);
  const animProgress = useCountUp(inProgressCount, 800);
  const animCompleted = useCountUp(completedThisWeek, 800);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-slate-400 animate-fade-in-up">
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">Open Tasks</p>
        <p className="text-2xl md:text-3xl font-bold mt-2 text-slate-900">{animOpen}</p>
      </div>
      <div className={`bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 ${criticalCount > 0 ? "border-l-rose-500" : "border-l-slate-400"} animate-fade-in-up stagger-1 ${criticalCount > 0 ? "animate-pulse-twice" : ""}`}>
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">Critical</p>
        <p className={`text-2xl md:text-3xl font-bold mt-2 ${criticalCount > 0 ? "text-rose-600" : "text-slate-900"}`}>{animCritical}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-amber-500 animate-fade-in-up stagger-2">
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">In Progress</p>
        <p className="text-2xl md:text-3xl font-bold mt-2 text-amber-600">{animProgress}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-emerald-500 animate-fade-in-up stagger-3">
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">Completed This Week</p>
        <p className="text-2xl md:text-3xl font-bold mt-2 text-emerald-600">{animCompleted}</p>
      </div>
    </div>
  );
}
