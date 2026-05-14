/**
 * Step state utilities
 *
 * Pure functions for creating and transforming per-pizza step arrays.
 * Each pizza has 3 rings (hi/mid/low), each ring being an array of step values:
 *   0          → active beat
 *   COLORS.GREY → inactive
 */
import { COLORS } from '../config';
import type { StepRing, PizzaSteps } from '../types';

export const makeEmptySteps = (n: number): PizzaSteps => [
  Array(n).fill(COLORS.GREY) as StepRing,
  Array(n).fill(COLORS.GREY) as StepRing,
  Array(n).fill(COLORS.GREY) as StepRing,
];

export const resizeSteps = (steps: PizzaSteps, n: number): PizzaSteps =>
  steps.map(ring =>
    ring.length < n
      ? [...ring, ...Array(n - ring.length).fill(COLORS.GREY)]
      : ring.slice(0, n)
  ) as PizzaSteps;

// Shifts each ring right by n positions, wrapping around the end.
export const rotateStepsRight = (steps: PizzaSteps, n: number): PizzaSteps =>
  steps.map(ring => {
    const len = ring.length;
    if (len === 0 || n === 0) return ring;
    const d = ((n % len) + len) % len;
    return [...ring.slice(len - d), ...ring.slice(0, len - d)];
  }) as PizzaSteps;
