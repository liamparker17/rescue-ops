import { formatZAR } from "@rescue-ops/shared";

interface MetricCardProps {
  label: string;
  value: number;
  format?: "currency" | "ratio" | "days";
  colorLogic?: "solvency" | "none";
}

export function MetricCard({ label, value, format = "currency", colorLogic = "none" }: MetricCardProps) {
  let displayValue: string;
  let colorClass = "text-slate-900";

  switch (format) {
    case "currency":
      displayValue = formatZAR(value);
      break;
    case "ratio":
      displayValue = value.toFixed(2);
      if (colorLogic === "solvency") {
        if (value < 1) colorClass = "text-rose-600";
        else if (value < 1.5) colorClass = "text-amber-600";
        else colorClass = "text-emerald-600";
      }
      break;
    case "days":
      displayValue = `${value} days`;
      if (value < 30) colorClass = "text-rose-600";
      else if (value < 90) colorClass = "text-amber-600";
      break;
    default:
      displayValue = String(value);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-accent">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{displayValue}</p>
    </div>
  );
}
