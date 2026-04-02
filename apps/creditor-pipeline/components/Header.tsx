import { CrossLink } from "./CrossLink";

interface HeaderProps {
  onNewCreditor: () => void;
  onExportPdf: () => void;
  pdfLoading: boolean;
}

export function Header({ onNewCreditor, onExportPdf, pdfLoading }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Creditor Pipeline</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-accent">
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
          href={process.env.NEXT_PUBLIC_OPS_URL}
          label="Operations"
          direction="left"
        />
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
    </header>
  );
}
