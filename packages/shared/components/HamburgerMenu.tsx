"use client";

import { useState, useEffect, useRef } from "react";

interface HamburgerMenuProps {
  children: React.ReactNode;
}

export function HamburgerMenu({ children }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Menu"
        aria-expanded={open}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fade-in-up">
          <div onClick={() => setOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function HamburgerItem({
  href,
  onClick,
  children,
  disabled = false,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const className = disabled
    ? "block w-full text-left px-4 py-2.5 text-sm text-slate-300 cursor-not-allowed"
    : "block w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors";

  if (href && !disabled) {
    return <a href={href} className={className}>{children}</a>;
  }

  return (
    <button onClick={disabled ? undefined : onClick} className={className} disabled={disabled}>
      {children}
    </button>
  );
}
