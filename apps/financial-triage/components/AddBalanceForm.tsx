"use client";

import { useState } from "react";
import { randToCents } from "@rescue-ops/shared";

interface AddBalanceFormProps {
  onSaved: () => void;
}

interface BalanceRow {
  accountCode: string;
  accountName: string;
  accountType: string;
  balance: string;
  asAtDate: string;
}

const EMPTY_ROW: BalanceRow = {
  accountCode: "",
  accountName: "",
  accountType: "Asset",
  balance: "",
  asAtDate: new Date().toISOString().split("T")[0],
};

export function AddBalanceForm({ onSaved }: AddBalanceFormProps) {
  const [rows, setRows] = useState<BalanceRow[]>([{ ...EMPTY_ROW }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addRow() {
    setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  }

  function updateRow(index: number, field: keyof BalanceRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveAll() {
    setError(null);
    setSaving(true);
    try {
      for (const row of rows) {
        if (!row.accountCode || !row.accountName || !row.balance) continue;
        const res = await fetch("/api/balances", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountCode: row.accountCode,
            accountName: row.accountName,
            accountType: row.accountType,
            balanceInCents: randToCents(parseFloat(row.balance)),
            asAtDate: row.asAtDate,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save balance");
        }
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded text-sm">{error}</div>
      )}
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-2">
            <label className="text-xs text-slate-500">Code</label>
            <input
              value={row.accountCode}
              onChange={(e) => updateRow(i, "accountCode", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="1000"
            />
          </div>
          <div className="col-span-3">
            <label className="text-xs text-slate-500">Name</label>
            <input
              value={row.accountName}
              onChange={(e) => updateRow(i, "accountName", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="FNB Current"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-500">Type</label>
            <select
              value={row.accountType}
              onChange={(e) => updateRow(i, "accountType", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
            >
              <option>Asset</option>
              <option>Liability</option>
              <option>Equity</option>
              <option>Revenue</option>
              <option>Expense</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-500">Balance (R)</label>
            <input
              type="number"
              value={row.balance}
              onChange={(e) => updateRow(i, "balance", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="340000"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-500">As At</label>
            <input
              type="date"
              value={row.asAtDate}
              onChange={(e) => updateRow(i, "asAtDate", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div className="col-span-1">
            <button onClick={() => removeRow(i)} className="text-slate-400 hover:text-rose-500 text-sm">
              ✕
            </button>
          </div>
        </div>
      ))}
      <div className="flex gap-3">
        <button
          onClick={addRow}
          className="text-sm text-accent hover:text-teal-700 font-medium"
        >
          + Add Row
        </button>
      </div>
      <button
        onClick={saveAll}
        disabled={saving}
        className="w-full py-2 bg-accent text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : "Save All"}
      </button>
    </div>
  );
}
