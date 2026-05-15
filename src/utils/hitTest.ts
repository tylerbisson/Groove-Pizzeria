import { pointRadial } from 'd3';
import { PIZZA_BUTTON_POSITIONS, CLICK_THRESHOLD } from '../config';

/**
 * Returns the first beat dot within click/tap threshold of (localX, localY),
 * where coordinates are relative to the pizza center.
 * Threshold radius is scaled by pizzaDiam; dot positions are computed from diameter.
 */
export function hitTestBeats(
  stepAngles: number[],
  pizzaDiam: number,
  diameter: number,
  localX: number,
  localY: number
): { ringIdx: number; stepIdx: number } | null {
  const threshold = pizzaDiam * CLICK_THRESHOLD;
  const t2 = threshold * threshold;
  for (let stepIdx = 0; stepIdx < stepAngles.length; stepIdx++) {
    const angle = stepAngles[stepIdx];
    for (let ringIdx = 0; ringIdx < PIZZA_BUTTON_POSITIONS.length; ringIdx++) {
      const [dotX, dotY] = pointRadial(
        (angle * Math.PI) / 180,
        PIZZA_BUTTON_POSITIONS[ringIdx] * diameter
      );
      const dx = localX - dotX;
      const dy = localY - dotY;
      if (dx * dx + dy * dy < t2) return { ringIdx, stepIdx };
    }
  }
  return null;
}
