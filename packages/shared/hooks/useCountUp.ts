"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number, duration = 800, active = true): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (target === 0) { setCurrent(0); return; }

    let raf: number;
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);

  return current;
}
