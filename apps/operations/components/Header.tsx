import { CrossLink } from "./CrossLink";

interface HeaderProps {
  onNewTask: () => void;
}

export function Header({ onNewTask }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Operations Stabiliser</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-accent">
            rescue-ops
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">Mpumalanga Steel Fabricators (Pty) Ltd</p>
      </div>
      <div className="flex items-center gap-6">
        <CrossLink
          href={process.env.NEXT_PUBLIC_TRIAGE_URL}
          label="Financial Triage"
          direction="left"
        />
        <CrossLink
          href={process.env.NEXT_PUBLIC_PIPELINE_URL}
          label="Creditor Pipeline"
          direction="right"
        />
        <button
          onClick={onNewTask}
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          New Task
        </button>
      </div>
    </header>
  );
}
