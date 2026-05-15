import { describe, it, expect } from 'vitest';
import { makeEmptySteps, resizeSteps, rotateStepsRight } from './steps';

describe('makeEmptySteps', () => {
  it('returns 3 rings each of length n', () => {
    const steps = makeEmptySteps(8);
    expect(steps).toHaveLength(3);
    steps.forEach((ring) => expect(ring).toHaveLength(8));
  });

  it('initialises all beats as inactive', () => {
    const steps = makeEmptySteps(4);
    steps.forEach((ring) => ring.forEach((beat) => expect(beat).toBe(false)));
  });
});

describe('resizeSteps', () => {
  it('extends rings with inactive beats when growing', () => {
    const original = makeEmptySteps(4);
    original[0][0] = true;
    original[0][2] = true;

    const resized = resizeSteps(original, 8);
    expect(resized[0]).toHaveLength(8);
    // existing active beats are preserved
    expect(resized[0][0]).toBe(true);
    expect(resized[0][2]).toBe(true);
    // new slots are inactive
    for (let i = 4; i < 8; i++) expect(resized[0][i]).toBe(false);
  });

  it('truncates rings when shrinking', () => {
    const original = makeEmptySteps(8);
    original[1][6] = true; // beat that will be cut off

    const resized = resizeSteps(original, 4);
    expect(resized[1]).toHaveLength(4);
    expect(resized[1][6]).toBeUndefined();
  });

  it('does not mutate the original steps', () => {
    const original = makeEmptySteps(4);
    resizeSteps(original, 8);
    original.forEach((ring) => expect(ring).toHaveLength(4));
  });
});

describe('rotateStepsRight', () => {
  it('shifts beats right by n positions', () => {
    const steps = makeEmptySteps(4);
    steps[0][0] = true; // beat at position 0

    const rotated = rotateStepsRight(steps, 1);
    expect(rotated[0][1]).toBe(true); // moved to position 1
    expect(rotated[0][0]).toBe(false);
  });

  it('wraps beats around the end of the ring', () => {
    const steps = makeEmptySteps(4);
    steps[0][3] = true; // beat at last position

    const rotated = rotateStepsRight(steps, 1);
    expect(rotated[0][0]).toBe(true); // wrapped to position 0
    expect(rotated[0][3]).toBe(false);
  });

  it('handles rotation by 0 (no change)', () => {
    const steps = makeEmptySteps(4);
    steps[0][2] = true;

    const rotated = rotateStepsRight(steps, 0);
    expect(rotated[0][2]).toBe(true);
  });

  it('handles rotation larger than ring length via modulo', () => {
    const steps = makeEmptySteps(4);
    steps[0][0] = true;

    // rotating by 4 (full cycle) is a no-op
    expect(rotateStepsRight(steps, 4)[0][0]).toBe(true);
    // rotating by 5 is the same as rotating by 1
    expect(rotateStepsRight(steps, 5)[0][1]).toBe(true);
  });

  it('does not mutate the original steps', () => {
    const steps = makeEmptySteps(4);
    steps[0][0] = true;
    rotateStepsRight(steps, 2);
    expect(steps[0][0]).toBe(true);
  });
});
