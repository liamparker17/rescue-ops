"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { centsToRand, formatZAR } from "@rescue-ops/shared";

interface SecurityChartProps {
  data: { Secured: number; Preferent: number; Concurrent: number };
}

const COLORS: Record<string, string> = {
  Secured: "#334155",   // slate-700
  Preferent: "#0D9488", // teal-500
  Concurrent: "#94A3B8", // slate-400
};

export function SecurityChart({ data }: SecurityChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value: centsToRand(value),
    fill: COLORS[name],
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
        Exposure by Security Class
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => `R ${(v / 1000000).toFixed(1)}M`}
            tick={{ fontSize: 12, fill: "#64748B" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "#64748B" }}
            width={80}
          />
          <Tooltip
            formatter={(value: number) => formatZAR(Math.round(value * 100))}
            labelStyle={{ color: "#0F172A" }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
