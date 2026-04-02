"use client";

import { CREDITOR_STAGES, CREDITOR_STAGE_LABELS, formatZAR } from "@rescue-ops/shared";
import { CreditorCard, type Creditor } from "./CreditorCard";

interface KanbanBoardProps {
  creditors: Creditor[];
  onMoveStage: (creditorId: string, direction: "left" | "right") => void;
  onCardClick: (creditor: Creditor) => void;
}

export function KanbanBoard({ creditors, onMoveStage, onCardClick }: KanbanBoardProps) {
  const grouped = CREDITOR_STAGES.reduce((acc, stage) => {
    acc[stage] = creditors.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<string, Creditor[]>);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {CREDITOR_STAGES.map((stage, stageIndex) => {
          const stageCreditors = grouped[stage] || [];
          const totalAmount = stageCreditors.reduce((sum, c) => sum + c.claimAmountInCents, 0);

          return (
            <div key={stage} className="w-72 flex-shrink-0">
              <div className="bg-slate-50 rounded-t-lg px-4 py-3 border border-gray-200 border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold text-slate-700">
                    {CREDITOR_STAGE_LABELS[stage] || stage}
                  </h2>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {stageCreditors.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{formatZAR(totalAmount)}</p>
              </div>
              <div className="bg-slate-50/50 border border-gray-200 rounded-b-lg p-3 min-h-[200px] space-y-3">
                {stageCreditors.map((creditor) => (
                  <CreditorCard
                    key={creditor.id}
                    creditor={creditor}
                    onMoveLeft={() => onMoveStage(creditor.id, "left")}
                    onMoveRight={() => onMoveStage(creditor.id, "right")}
                    onClick={() => onCardClick(creditor)}
                    canMoveLeft={stageIndex > 0}
                    canMoveRight={stageIndex < CREDITOR_STAGES.length - 1}
                  />
                ))}
                {stageCreditors.length === 0 && (
                  <p className="text-xs text-slate-300 text-center py-8">No creditors</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
