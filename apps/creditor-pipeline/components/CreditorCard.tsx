"use client";

import { formatZAR, formatDate } from "@rescue-ops/shared";

export interface Creditor {
  id: string;
  creditorName: string;
  claimAmountInCents: number;
  securityType: string;
  stage: string;
  contactId: string | null;
  lastContactDate: string | null;
  votingStatus: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  contact: { id: string; name: string } | null;
  _count: { communications: number };
}

interface CreditorCardProps {
  creditor: Creditor;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onClick: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

const securityBadgeColors: Record<string, string> = {
  Secured: "bg-slate-700 text-white",
  Preferent: "bg-accent text-white",
  Concurrent: "bg-slate-400 text-white",
};

const securityBadgeLetters: Record<string, string> = {
  Secured: "S",
  Preferent: "P",
  Concurrent: "C",
};

const votingBadgeColors: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  For: "bg-emerald-100 text-emerald-700",
  Against: "bg-rose-100 text-rose-700",
  Abstained: "bg-amber-100 text-amber-700",
};

export function CreditorCard({
  creditor,
  onMoveLeft,
  onMoveRight,
  onClick,
  canMoveLeft,
  canMoveRight,
}: CreditorCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm border-l-4 border-l-accent animate-fade-in-up">
      <div
        className="p-3 md:p-4 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-900 leading-tight">
            {creditor.creditorName}
          </h3>
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded animate-scale-in ${securityBadgeColors[creditor.securityType] || "bg-gray-200 text-gray-700"}`}
          >
            {securityBadgeLetters[creditor.securityType] || "?"}
          </span>
        </div>

        <p className="text-lg font-bold text-slate-900 mb-2">
          {formatZAR(creditor.claimAmountInCents)}
        </p>

        <p className="text-xs text-slate-500 mb-1">
          {creditor.contact?.name || "\u2014"}
        </p>

        <p className="text-xs text-slate-400 mb-2">
          {creditor.lastContactDate ? formatDate(creditor.lastContactDate) : "\u2014"}
        </p>

        <span
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full animate-scale-in ${votingBadgeColors[creditor.votingStatus] || "bg-gray-100 text-gray-600"}`}
        >
          {creditor.votingStatus}
        </span>
      </div>

      <div className="flex border-t border-gray-100">
        <button
          onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
          disabled={!canMoveLeft}
          className="flex-1 py-2.5 min-h-[44px] text-sm font-medium text-slate-400 hover:text-accent hover:bg-indigo-50 active:bg-indigo-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-100"
        >
          &larr;
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
          disabled={!canMoveRight}
          className="flex-1 py-2.5 min-h-[44px] text-sm font-medium text-slate-400 hover:text-accent hover:bg-indigo-50 active:bg-indigo-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
