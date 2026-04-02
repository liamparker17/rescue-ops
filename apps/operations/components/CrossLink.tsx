interface CrossLinkProps {
  href: string | undefined;
  label: string;
  direction?: "left" | "right";
}

export function CrossLink({ href, label, direction = "right" }: CrossLinkProps) {
  const arrow = direction === "left" ? "\u2190" : "\u2192";
  const text = direction === "left" ? `${arrow} ${label}` : `${label} ${arrow}`;

  if (!href) {
    return (
      <span className="text-sm text-slate-300 cursor-not-allowed">{text}</span>
    );
  }

  return (
    <a
      href={href}
      className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
    >
      {text}
    </a>
  );
}
