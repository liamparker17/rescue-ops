import { CrossLink } from "./CrossLink";

interface HeaderProps {
  orgName: string;
  onAddBalance: () => void;
}

export function Header({ orgName, onAddBalance }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Financial Triage</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal-50 text-accent">
            rescue-ops
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{orgName}</p>
      </div>
      <div className="flex items-center gap-6">
        <CrossLink
          href={process.env.NEXT_PUBLIC_OPS_URL}
          label="Operations"
          direction="right"
        />
        <CrossLink
          href={process.env.NEXT_PUBLIC_PIPELINE_URL}
          label="Creditor Pipeline"
          direction="right"
        />
        <button
          onClick={onAddBalance}
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          Add Opening Balances
        </button>
      </div>
    </header>
  );
}
