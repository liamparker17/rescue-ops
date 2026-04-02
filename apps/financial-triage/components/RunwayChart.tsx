"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea,
} from "recharts";
import { centsToRand, formatZAR } from "@rescue-ops/shared";

interface RunwayChartProps {
  data: { day: number; balance: number }[];
  runwayDays: number;
}

export function RunwayChart({ data, runwayDays }: RunwayChartProps) {
  const chartData = data.map((d) => ({
    day: `Day ${d.day}`,
    balance: centsToRand(d.balance),
    dayNum: d.day,
  }));

  const minBalance = Math.min(...chartData.map((d) => d.balance));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">
        Cash Runway Projection
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Runway: <span className={runwayDays < 30 ? "text-rose-600 font-semibold" : "text-slate-600 font-semibold"}>~{runwayDays} days</span>
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ left: 20, right: 10 }}>
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748B" }} />
          <YAxis
            tickFormatter={(v: number) => `R ${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12, fill: "#64748B" }}
          />
          <Tooltip
            formatter={(value: number) => formatZAR(Math.round(value * 100))}
            labelStyle={{ color: "#0F172A" }}
          />
          <ReferenceLine y={0} stroke="#E11D48" strokeDasharray="4 4" />
          {minBalance < 0 && (
            <ReferenceArea y1={0} y2={minBalance} fill="#FEE2E2" fillOpacity={0.5} />
          )}
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#0D9488"
            strokeWidth={2}
            dot={{ r: 4, fill: "#0D9488" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
