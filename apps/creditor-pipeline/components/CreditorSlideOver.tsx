"use client";

import { useState } from "react";
import {
  CREDITOR_STAGES,
  CREDITOR_STAGE_LABELS,
  COMMUNICATION_METHODS,
  formatDate,
  centsToRand,
  randToCents,
} from "@rescue-ops/shared";

interface Communication {
  id: string;
  method: string;
  summary: string;
  date: string;
  createdAt: string;
}

interface CreditorDetail {
  id: string;
  creditorName: string;
  claimAmountInCents: number;
  securityType: string;
  stage: string;
  contactId: string | null;
  lastContactDate: string | null;
  votingStatus: string;
  notes: string | null;
  contact: { id: string; name: string; role: string | null; company: string | null } | null;
  communications: Communication[];
}

interface Contact {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
}

interface CreditorSlideOverProps {
  creditor: CreditorDetail;
  contacts: Contact[];
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onAddCommunication: (data: { method: string; summary: string; date: string }) => Promise<void>;
  onClose: () => void;
}

const methodBadgeColors: Record<string, string> = {
  Email: "bg-blue-100 text-blue-700",
  Phone: "bg-green-100 text-green-700",
  Meeting: "bg-purple-100 text-purple-700",
  Letter: "bg-slate-100 text-slate-700",
};

export function CreditorSlideOver({
  creditor,
  contacts,
  onSave,
  onAddCommunication,
  onClose,
}: CreditorSlideOverProps) {
  const [creditorName, setCreditorName] = useState(creditor.creditorName);
  const [claimRand, setClaimRand] = useState(String(centsToRand(creditor.claimAmountInCents)));
  const [securityType, setSecurityType] = useState(creditor.securityType);
  const [stage, setStage] = useState(creditor.stage);
  const [contactId, setContactId] = useState(creditor.contactId || "");
  const [votingStatus, setVotingStatus] = useState(creditor.votingStatus);
  const [notes, setNotes] = useState(creditor.notes || "");
  const [saving, setSaving] = useState(false);

  // Communication form
  const [commMethod, setCommMethod] = useState<string>("Email");
  const [commSummary, setCommSummary] = useState("");
  const [commDate, setCommDate] = useState(new Date().toISOString().slice(0, 10));
  const [addingComm, setAddingComm] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        creditorName,
        claimAmountInCents: randToCents(parseFloat(claimRand) || 0),
        securityType,
        stage,
        contactId: contactId || null,
        votingStatus,
        notes: notes || null,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddComm() {
    if (!commSummary.trim()) return;
    setAddingComm(true);
    try {
      await onAddCommunication({
        method: commMethod,
        summary: commSummary,
        date: commDate,
      });
      setCommSummary("");
    } finally {
      setAddingComm(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Editable form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Creditor Name</label>
          <input
            type="text"
            value={creditorName}
            onChange={(e) => setCreditorName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Claim Amount (ZAR)</label>
          <input
            type="number"
            value={claimRand}
            onChange={(e) => setClaimRand(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Security Type</label>
          <div className="flex gap-4">
            {(["Secured", "Preferent", "Concurrent"] as const).map((t) => (
              <label key={t} className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="securityType"
                  value={t}
                  checked={securityType === t}
                  onChange={() => setSecurityType(t)}
                  className="text-accent focus:ring-accent"
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          >
            {CREDITOR_STAGES.map((s) => (
              <option key={s} value={s}>{CREDITOR_STAGE_LABELS[s] || s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="">None</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Voting Status</label>
          <div className="flex gap-4">
            {(["Pending", "For", "Against", "Abstained"] as const).map((v) => (
              <label key={v} className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="votingStatus"
                  value={v}
                  checked={votingStatus === v}
                  onChange={() => setVotingStatus(v)}
                  className="text-accent focus:ring-accent"
                />
                {v}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-slate-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Communication Timeline */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Communication Timeline</h3>

        {/* Add communication form */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="date"
                value={commDate}
                onChange={(e) => setCommDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
            <div>
              <select
                value={commMethod}
                onChange={(e) => setCommMethod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              >
                {COMMUNICATION_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            value={commSummary}
            onChange={(e) => setCommSummary(e.target.value)}
            placeholder="Communication summary..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          />
          <button
            onClick={handleAddComm}
            disabled={addingComm || !commSummary.trim()}
            className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {addingComm ? "Adding..." : "Add"}
          </button>
        </div>

        {/* Timeline entries */}
        <div className="space-y-3">
          {creditor.communications.map((comm) => (
            <div key={comm.id} className="flex gap-3 items-start">
              <div className="text-xs text-slate-400 w-20 flex-shrink-0 pt-0.5">
                {formatDate(comm.date)}
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${methodBadgeColors[comm.method] || "bg-gray-100 text-gray-600"}`}
              >
                {comm.method}
              </span>
              <p className="text-sm text-slate-700 leading-snug">{comm.summary}</p>
            </div>
          ))}
          {creditor.communications.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No communications recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}
