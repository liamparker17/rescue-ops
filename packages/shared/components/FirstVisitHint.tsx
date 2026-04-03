"use client";

import { useState, useEffect } from "react";

interface FirstVisitHintProps {
  storageKey: string;
  message: string;
  position?: "top" | "bottom";
}

export function FirstVisitHint({ storageKey, message, position = "bottom" }: FirstVisitHintProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        localStorage.setItem(storageKey, "1");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(storageKey, "1");
  }

  if (!visible) return null;

  const posClass = position === "top"
    ? "bottom-full mb-2"
    : "top-full mt-2";

  return (
    <div
      className={`absolute ${posClass} left-1/2 -translate-x-1/2 z-40 animate-fade-in-up`}
    >
      <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-2">
        <span>{message}</span>
        <button
          onClick={dismiss}
          className="text-slate-400 hover:text-white ml-1"
          aria-label="Dismiss hint"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
