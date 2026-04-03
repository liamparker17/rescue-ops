import { CrossLink } from "./CrossLink";
import { HamburgerMenu, HamburgerItem } from "@rescue-ops/shared";

interface HeaderProps {
  onNewTask: () => void;
}

export function Header({ onNewTask }: HeaderProps) {
  const triageUrl = process.env.NEXT_PUBLIC_TRIAGE_URL;
  const pipelineUrl = process.env.NEXT_PUBLIC_PIPELINE_URL;

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Operations Stabiliser</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-accent">
            rescue-ops
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">Mpumalanga Steel Fabricators (Pty) Ltd</p>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        <CrossLink href={triageUrl} label="Financial Triage" direction="left" />
        <CrossLink href={pipelineUrl} label="Creditor Pipeline" direction="right" />
        <button
          onClick={onNewTask}
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          New Task
        </button>
      </div>

      {/* Mobile: just hamburger (New Task becomes FAB — see page.tsx) */}
      <HamburgerMenu>
        <HamburgerItem href={triageUrl} disabled={!triageUrl}>Financial Triage</HamburgerItem>
        <HamburgerItem href={pipelineUrl} disabled={!pipelineUrl}>Creditor Pipeline</HamburgerItem>
      </HamburgerMenu>
    </header>
  );
}
