import { CrossLink } from "./CrossLink";
import { HamburgerMenu, HamburgerItem } from "@rescue-ops/shared";

interface HeaderProps {
  onNewCreditor: () => void;
  onExportPdf: () => void;
  pdfLoading: boolean;
}

export function Header({ onNewCreditor, onExportPdf, pdfLoading }: HeaderProps) {
  const triageUrl = process.env.NEXT_PUBLIC_TRIAGE_URL;
  const opsUrl = process.env.NEXT_PUBLIC_OPS_URL;

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Creditor Pipeline</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-accent">
            rescue-ops
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">Mpumalanga Steel Fabricators (Pty) Ltd</p>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        <CrossLink href={triageUrl} label="Financial Triage" direction="left" />
        <CrossLink href={opsUrl} label="Operations" direction="left" />
        <button
          onClick={onExportPdf}
          disabled={pdfLoading}
          className="px-4 py-2 bg-white border border-accent text-accent text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {pdfLoading && (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
            </svg>
          )}
          Export Summary PDF
        </button>
        <button
          onClick={onNewCreditor}
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Creditor
        </button>
      </div>

      {/* Mobile: Add Creditor visible, rest in hamburger */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onNewCreditor}
          className="px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Creditor
        </button>
        <HamburgerMenu>
          <HamburgerItem href={triageUrl} disabled={!triageUrl}>Financial Triage</HamburgerItem>
          <HamburgerItem href={opsUrl} disabled={!opsUrl}>Operations</HamburgerItem>
          <div className="border-t border-gray-100 my-1" />
          <HamburgerItem onClick={onExportPdf} disabled={pdfLoading}>
            {pdfLoading ? "Exporting..." : "Export Summary PDF"}
          </HamburgerItem>
        </HamburgerMenu>
      </div>
    </header>
  );
}
