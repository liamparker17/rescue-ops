interface StatsRowProps {
  openCount: number;
  criticalCount: number;
  inProgressCount: number;
  completedThisWeek: number;
}

export function StatsRow({ openCount, criticalCount, inProgressCount, completedThisWeek }: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-slate-400">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Open Tasks</p>
        <p className="text-3xl font-bold mt-2 text-slate-900">{openCount}</p>
      </div>
      <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 ${criticalCount > 0 ? "border-l-rose-500" : "border-l-slate-400"}`}>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Critical</p>
        <p className={`text-3xl font-bold mt-2 ${criticalCount > 0 ? "text-rose-600" : "text-slate-900"}`}>{criticalCount}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-amber-500">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">In Progress</p>
        <p className="text-3xl font-bold mt-2 text-amber-600">{inProgressCount}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-emerald-500">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Completed This Week</p>
        <p className="text-3xl font-bold mt-2 text-emerald-600">{completedThisWeek}</p>
      </div>
    </div>
  );
}
