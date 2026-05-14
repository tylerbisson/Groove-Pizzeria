/**
 * Step state utilities
 *
 * Pure functions for creating and transforming per-pizza step arrays.
 * Each pizza has 3 rings (hi/mid/low), each ring being an array of step values:
 *   0          → active beat
 *   COLORS.GREY → inactive
 */
import { COLORS } from '../config';

export const makeEmptySteps = (n) =>
  Array(3).fill(null).map(() => Array(n).fill(COLORS.GREY));

export const resizeSteps = (steps, n) =>
  steps.map(ring =>
    ring.length < n
      ? [...ring, ...Array(n - ring.length).fill(COLORS.GREY)]
      : ring.slice(0, n)
  );

// Shifts each ring right by n positions, wrapping around the end.
export const rotateStepsRight = (steps, n) =>
  steps.map(ring => {
    const len = ring.length;
    if (len === 0 || n === 0) return ring;
    const d = ((n % len) + len) % len;
    return [...ring.slice(len - d), ...ring.slice(0, len - d)];
  });
