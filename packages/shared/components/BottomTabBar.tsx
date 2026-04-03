"use client";

interface Tab {
  label: string;
  href: string | undefined;
  icon: React.ReactNode;
  accentColor: string;
}

interface BottomTabBarProps {
  activeApp: "triage" | "operations" | "pipeline";
  triageUrl?: string;
  opsUrl?: string;
  pipelineUrl?: string;
}

function TriageIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function OpsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function PipelineIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

const ACCENT_COLORS = {
  triage: "#0D9488",
  operations: "#D97706",
  pipeline: "#4F46E5",
};

export function BottomTabBar({ activeApp, triageUrl, opsUrl, pipelineUrl }: BottomTabBarProps) {
  const tabs: (Tab & { key: typeof activeApp })[] = [
    { key: "triage", label: "Triage", href: triageUrl, icon: <TriageIcon />, accentColor: ACCENT_COLORS.triage },
    { key: "operations", label: "Operations", href: opsUrl, icon: <OpsIcon />, accentColor: ACCENT_COLORS.operations },
    { key: "pipeline", label: "Pipeline", href: pipelineUrl, icon: <PipelineIcon />, accentColor: ACCENT_COLORS.pipeline },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const isActive = tab.key === activeApp;
          const isDisabled = !tab.href && !isActive;

          if (isActive) {
            return (
              <div
                key={tab.key}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
                style={{ color: tab.accentColor }}
              >
                {tab.icon}
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </div>
            );
          }

          if (isDisabled) {
            return (
              <div
                key={tab.key}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-slate-300"
              >
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </div>
            );
          }

          return (
            <a
              key={tab.key}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-slate-400 active:text-slate-600 transition-colors"
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
