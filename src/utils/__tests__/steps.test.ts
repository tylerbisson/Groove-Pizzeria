import { describe, it, expect } from 'vitest';
import { makeEmptySteps, rotateStepsRight } from '../steps';
import { SLICES_MAX } from '../../config';

describe('makeEmptySteps', () => {
  it('returns 3 rings each of length SLICES_MAX', () => {
    const steps = makeEmptySteps();
    expect(steps).toHaveLength(3);
    steps.forEach((ring) => expect(ring).toHaveLength(SLICES_MAX));
  });

  it('initialises all beats as inactive', () => {
    const steps = makeEmptySteps();
    steps.forEach((ring) => ring.forEach((beat) => expect(beat).toBe(false)));
  });
});

describe('rotateStepsRight', () => {
  it('shifts active beats right by n positions', () => {
    const steps = makeEmptySteps();
    steps[0][0] = true;

    const rotated = rotateStepsRight(steps, 1, 4);
    expect(rotated[0][1]).toBe(true);
    expect(rotated[0][0]).toBe(false);
  });

  it('wraps active beats around the end of the active window', () => {
    const steps = makeEmptySteps();
    steps[0][3] = true; // last position in a 4-step window

    const rotated = rotateStepsRight(steps, 1, 4);
    expect(rotated[0][0]).toBe(true); // wrapped to position 0
    expect(rotated[0][3]).toBe(false);
  });

  it('handles rotation by 0 (no change)', () => {
    const steps = makeEmptySteps();
    steps[0][2] = true;

    const rotated = rotateStepsRight(steps, 0, 4);
    expect(rotated[0][2]).toBe(true);
  });

  it('handles rotation larger than active length via modulo', () => {
    const steps = makeEmptySteps();
    steps[0][0] = true;

    expect(rotateStepsRight(steps, 4, 4)[0][0]).toBe(true); // full cycle = no-op
    expect(rotateStepsRight(steps, 5, 4)[0][1]).toBe(true); // 5 mod 4 = 1
  });

  it('does not rotate beats beyond activeLength', () => {
    const steps = makeEmptySteps();
    steps[0][0] = true;  // active — will rotate
    steps[0][6] = true;  // beyond activeLength=4 — must not move

    const rotated = rotateStepsRight(steps, 1, 4);
    expect(rotated[0][1]).toBe(true); // active beat shifted right
    expect(rotated[0][6]).toBe(true); // inactive beat preserved in place
  });

  it('does not mutate the original steps', () => {
    const steps = makeEmptySteps();
    steps[0][0] = true;
    rotateStepsRight(steps, 2, 4);
    expect(steps[0][0]).toBe(true);
  });
});
