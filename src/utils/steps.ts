/**
 * Step state utilities
 *
 * Pure functions for creating and transforming per-pizza step arrays.
 * Each pizza has 3 rings (hi/mid/low), each ring being a boolean array of
 * length SLICES_MAX. Only the first `slices` entries are active at any time;
 * the rest are preserved so that reducing and re-expanding the step count
 * never destroys previously set beats.
 */
import type { StepRing, PizzaSteps } from '../types';
import { SLICES_MAX } from '../config';

export const makeEmptySteps = (): PizzaSteps => [
  Array<boolean>(SLICES_MAX).fill(false) as StepRing,
  Array<boolean>(SLICES_MAX).fill(false) as StepRing,
  Array<boolean>(SLICES_MAX).fill(false) as StepRing,
];

// Shifts the first `activeLength` entries in each ring right by n positions,
// wrapping around within that window. Entries beyond activeLength are untouched.
export const rotateStepsRight = (steps: PizzaSteps, n: number, activeLength: number): PizzaSteps =>
  steps.map((ring) => {
    const active = ring.slice(0, activeLength);
    const rest = ring.slice(activeLength);
    const len = active.length;
    if (len === 0 || n === 0) return ring;
    const d = ((n % len) + len) % len;
    return [...active.slice(len - d), ...active.slice(0, len - d), ...rest];
  }) as PizzaSteps;
