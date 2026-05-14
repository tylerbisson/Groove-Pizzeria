import { useEffect, useReducer } from 'react';

// Drives re-renders at ~60fps while active is true.
// Returns the current frame count (useful as a render key if needed).
export function useAnimationLoop(active) {
  const [frame, tick] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    if (!active) return;
    let rafId;
    const loop = () => {
      tick();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  return frame;
}
