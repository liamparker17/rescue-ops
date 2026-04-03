"use client";

import { formatZAR, useCountUp } from "@rescue-ops/shared";

interface MetricCardProps {
  label: string;
  value: number;
  format?: "currency" | "ratio" | "days";
  colorLogic?: "solvency" | "none";
  delay?: number;
}

export function MetricCard({ label, value, format = "currency", colorLogic = "none", delay = 0 }: MetricCardProps) {
  // Scale value for count-up based on format
  const countTarget = format === "ratio" ? Math.round(value * 100) : value;
  const animated = useCountUp(countTarget, 800);

  let displayValue: string;
  let colorClass = "text-slate-900";

  switch (format) {
    case "currency":
      displayValue = formatZAR(animated);
      break;
    case "ratio":
      displayValue = (animated / 100).toFixed(2);
      if (colorLogic === "solvency") {
        if (value < 1) colorClass = "text-rose-600";
        else if (value < 1.5) colorClass = "text-amber-600";
        else colorClass = "text-emerald-600";
      }
      break;
    case "days":
      displayValue = `${animated} days`;
      if (value < 30) colorClass = "text-rose-600";
      else if (value < 90) colorClass = "text-amber-600";
      break;
    default:
      displayValue = String(animated);
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-accent animate-fade-in-up animate-border-grow"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold mt-2 ${colorClass}`}>{displayValue}</p>
    </div>
  );
}
