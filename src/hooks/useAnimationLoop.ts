/**
 * useAnimationLoop
 *
 * Drives ~60fps re-renders via requestAnimationFrame while active is true.
 * Used to update the playhead and timeline positions during playback.
 * Returns the current frame count (useful as a render key if needed).
 */
import { useEffect, useReducer } from 'react';

export function useAnimationLoop(active: boolean): number {
  const [frame, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!active) return;
    let rafId = 0;
    const loop = () => {
      tick();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  return frame;
}
