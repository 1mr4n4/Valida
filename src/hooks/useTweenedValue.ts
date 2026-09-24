import { useEffect, useRef, useState } from 'react';

const DEFAULT_DURATION_MS = 1100;

/**
 * Chase `target` with a rAF-driven ease-out tween. Each new target starts
 * from whatever is currently on screen, so a stream of updates (dragging a
 * grade slider) glides instead of jumping. Pure CSS/DOM — no animation lib.
 */
export function useTweenedValue(target: number, durationMs = DEFAULT_DURATION_MS): number {
  const [value, setValue] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const from = currentRef.current;
    const to = target;

    if (Math.abs(to - from) < 0.005) {
      currentRef.current = to;
      setValue(to);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (to - from) * eased;
      currentRef.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
