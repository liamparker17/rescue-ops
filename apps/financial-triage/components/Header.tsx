import { CrossLink } from "./CrossLink";
import { HamburgerMenu, HamburgerItem } from "@rescue-ops/shared";

interface HeaderProps {
  orgName: string;
  onAddBalance: () => void;
}

export function Header({ orgName, onAddBalance }: HeaderProps) {
  const opsUrl = process.env.NEXT_PUBLIC_OPS_URL;
  const pipelineUrl = process.env.NEXT_PUBLIC_PIPELINE_URL;

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Financial Triage</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal-50 text-accent">
            rescue-ops
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{orgName}</p>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        <CrossLink href={opsUrl} label="Operations" direction="right" />
        <CrossLink href={pipelineUrl} label="Creditor Pipeline" direction="right" />
        <button
          onClick={onAddBalance}
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          Add Opening Balances
        </button>
      </div>

      {/* Mobile hamburger */}
      <HamburgerMenu>
        <HamburgerItem href={opsUrl} disabled={!opsUrl}>Operations</HamburgerItem>
        <HamburgerItem href={pipelineUrl} disabled={!pipelineUrl}>Creditor Pipeline</HamburgerItem>
        <div className="border-t border-gray-100 my-1" />
        <HamburgerItem onClick={onAddBalance}>Add Opening Balances</HamburgerItem>
      </HamburgerMenu>
    </header>
  );
}
