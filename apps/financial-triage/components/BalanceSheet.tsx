import { formatZAR } from "@rescue-ops/shared";

interface BalanceSheetProps {
  data: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netPosition: number;
    assetCount: number;
    liabilityCount: number;
    equityCount: number;
  };
}

export function BalanceSheet({ data }: BalanceSheetProps) {
  const netColor = data.netPosition >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
        Balance Sheet Summary
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-600">Total Assets</span>
            <span className="font-semibold">{formatZAR(data.totalAssets)}</span>
          </div>
          <span className="text-xs text-slate-400">{data.assetCount} accounts</span>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-600">Total Liabilities</span>
            <span className="font-semibold">{formatZAR(data.totalLiabilities)}</span>
          </div>
          <span className="text-xs text-slate-400">{data.liabilityCount} accounts</span>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-600">Total Equity</span>
            <span className="font-semibold">{formatZAR(data.totalEquity)}</span>
          </div>
          <span className="text-xs text-slate-400">{data.equityCount} accounts</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium text-slate-900">Net Position</span>
            <span className={`text-lg font-bold ${netColor}`}>{formatZAR(data.netPosition)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
