"use client";

import { useState, useRef } from "react";
import { CREDITOR_STAGES, CREDITOR_STAGE_LABELS, formatZAR, FirstVisitHint } from "@rescue-ops/shared";
import { CreditorCard, type Creditor } from "./CreditorCard";

interface KanbanBoardProps {
  creditors: Creditor[];
  onMoveStage: (creditorId: string, direction: "left" | "right") => void;
  onCardClick: (creditor: Creditor) => void;
}

export function KanbanBoard({ creditors, onMoveStage, onCardClick }: KanbanBoardProps) {
  const [expandedStage, setExpandedStage] = useState<string>(CREDITOR_STAGES[0]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const grouped = CREDITOR_STAGES.reduce((acc, stage) => {
    acc[stage] = creditors.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<string, Creditor[]>);

  function toggleStage(stage: string) {
    setExpandedStage(expandedStage === stage ? "" : stage);
  }

  function scrollToStage(stage: string) {
    setExpandedStage(stage);
    setTimeout(() => {
      sectionRefs.current[stage]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <>
      {/* Desktop: horizontal kanban */}
      <div className="hidden lg:block overflow-x-auto pb-4">
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

      {/* Mobile + Tablet: pill nav + collapsible sections */}
      <div className="lg:hidden">
        {/* Stage pills */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 md:hidden">
            {CREDITOR_STAGES.map((stage) => {
              const count = grouped[stage]?.length || 0;
              const isActive = expandedStage === stage;
              return (
                <button
                  key={stage}
                  onClick={() => scrollToStage(stage)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : "bg-slate-100 text-slate-600 active:bg-slate-200"
                  }`}
                >
                  {CREDITOR_STAGE_LABELS[stage] || stage} ({count})
                </button>
              );
            })}
          </div>
          <FirstVisitHint
            storageKey="rescue-ops-pipeline-hints-seen"
            message="Tap a stage to see its creditors"
          />
        </div>

        {/* Collapsible sections */}
        <div className="space-y-3">
          {CREDITOR_STAGES.map((stage, stageIndex) => {
            const stageCreditors = grouped[stage] || [];
            const totalAmount = stageCreditors.reduce((sum, c) => sum + c.claimAmountInCents, 0);
            const isExpanded = expandedStage === stage;

            return (
              <div
                key={stage}
                ref={(el) => { sectionRefs.current[stage] = el; }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleStage(stage)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-slate-700">
                      {CREDITOR_STAGE_LABELS[stage] || stage}
                    </h2>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {stageCreditors.length}
                    </span>
                    <span className="text-xs text-slate-400">{formatZAR(totalAmount)}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className="transition-all duration-300 overflow-hidden"
                  style={{ maxHeight: isExpanded ? `${stageCreditors.length * 200 + 100}px` : "0px" }}
                >
                  <div className="p-3 space-y-3">
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
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
