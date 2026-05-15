import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playDrum } from './audio';
import PizzaSequencer from './PizzaSequencer';
import { makeEmptySteps } from './utils/steps';
import type { RGB } from './types';

vi.mock('./audio', () => ({ playDrum: vi.fn() }));

const TEST_COLOR: RGB = [255, 0, 0];

const makePizza = (slices = 4) =>
  new PizzaSequencer({
    name: 'test',
    x: 0,
    y: 0,
    numSteps: slices,
    color: TEST_COLOR,
    drumSamples: [1, 2, 3],
    appWidth: 1000,
    onTeethChange: () => {},
  });

const mockPlayDrum = vi.mocked(playDrum);

describe('PizzaSequencer', () => {
  beforeEach(() => mockPlayDrum.mockClear());

  describe('initial state', () => {
    it('starts at step 0', () => {
      expect(makePizza().currentStep).toBe(0);
    });

    it('stepAngle starts at 0', () => {
      expect(makePizza().stepAngle).toBe(0);
    });
  });

  describe('computeStepAngles', () => {
    it('stepAngles[0] is 0 degrees (12 o\'clock)', () => {
      expect(makePizza().stepAngles[0]).toBe(0);
    });

    it('angles are evenly spaced by 360/slices', () => {
      const pizza = makePizza(4);
      const sliceAngle = 360 / 4;
      pizza.stepAngles.forEach((angle, i) => {
        expect(angle).toBeCloseTo(i * sliceAngle);
      });
    });

    it('stepAngles length equals slices', () => {
      expect(makePizza(8).stepAngles).toHaveLength(8);
    });

    it('recomputes correctly after a slice count change', () => {
      const pizza = makePizza(4);
      pizza.updateState({ slices: 6 });
      expect(pizza.stepAngles).toHaveLength(6);
      expect(pizza.stepAngles[0]).toBe(0);
      expect(pizza.stepAngles[1]).toBeCloseTo(60);
    });
  });

  describe('incrementSoundLaunch — step advancement', () => {
    it('advances currentStep from 0 to 1 on the first call', () => {
      const pizza = makePizza(4);
      pizza.incrementSoundLaunch(0, makeEmptySteps(4));
      expect(pizza.currentStep).toBe(1);
    });

    it('advances through all steps sequentially before wrapping', () => {
      const pizza = makePizza(4);
      const steps = makeEmptySteps(4);
      [0, 1, 2, 3].forEach((expected) => {
        expect(pizza.currentStep).toBe(expected);
        pizza.incrementSoundLaunch(0, steps);
      });
    });

    it('wraps back to 0 after all slices have played', () => {
      const pizza = makePizza(4);
      const steps = makeEmptySteps(4);
      for (let i = 0; i < 4; i++) pizza.incrementSoundLaunch(0, steps);
      expect(pizza.currentStep).toBe(0);
    });

    it('wraps correctly for non-power-of-2 slice counts', () => {
      const pizza = makePizza(6);
      const steps = makeEmptySteps(6);
      for (let i = 0; i < 6; i++) pizza.incrementSoundLaunch(0, steps);
      expect(pizza.currentStep).toBe(0);
    });
  });

  describe('incrementSoundLaunch — stepAngle', () => {
    it('sets stepAngle to the angle of the step that just played', () => {
      const pizza = makePizza(4);
      const steps = makeEmptySteps(4);
      const sliceAngle = 360 / 4; // 90°

      pizza.incrementSoundLaunch(0, steps); // played step 0 → angle 0
      expect(pizza.stepAngle).toBe(0);

      pizza.incrementSoundLaunch(0, steps); // played step 1 → angle 90
      expect(pizza.stepAngle).toBeCloseTo(sliceAngle);
    });

    it('stepAngle at step 0 is 0, not 360', () => {
      const pizza = makePizza(4);
      const steps = makeEmptySteps(4);
      for (let i = 0; i < 4; i++) pizza.incrementSoundLaunch(0, steps); // complete loop, wrap to 0
      pizza.incrementSoundLaunch(0, steps); // play step 0 again
      expect(pizza.stepAngle).toBe(0);
    });
  });

  describe('incrementSoundLaunch — timeline advancement', () => {
    it('does not advance timelineIndex within a loop', () => {
      const pizza = makePizza(4);
      pizza.computeTimeline(32, 1000); // 2 repetitions → 2 entries
      const initial = pizza.timelineIndex;
      const steps = makeEmptySteps(4);
      for (let i = 0; i < 3; i++) pizza.incrementSoundLaunch(0, steps); // 3 of 4 steps
      expect(pizza.timelineIndex).toBe(initial);
    });

    it('advances timelineIndex once after a full loop completes', () => {
      const pizza = makePizza(4);
      pizza.computeTimeline(32, 1000); // 2 entries → index goes 0→1
      const steps = makeEmptySteps(4);
      for (let i = 0; i < 4; i++) pizza.incrementSoundLaunch(0, steps);
      expect(pizza.timelineIndex).toBe(1);
    });

    it('wraps timelineIndex back to 0 after the full LCM cycle', () => {
      const pizza = makePizza(4);
      pizza.computeTimeline(32, 1000); // 2 entries
      const steps = makeEmptySteps(4);
      for (let i = 0; i < 8; i++) pizza.incrementSoundLaunch(0, steps); // 2 full loops
      expect(pizza.timelineIndex).toBe(0);
    });
  });

  describe('incrementSoundLaunch — sound triggering', () => {
    it('plays sound for an active beat at the correct step index', () => {
      const pizza = makePizza(4);
      const steps = makeEmptySteps(4);
      steps[0][2] = true; // ring 0, step 2

      pizza.incrementSoundLaunch(0, steps); // step 0 — silent
      pizza.incrementSoundLaunch(0, steps); // step 1 — silent
      expect(mockPlayDrum).not.toHaveBeenCalled();

      pizza.incrementSoundLaunch(0, steps); // step 2 — fires
      expect(mockPlayDrum).toHaveBeenCalledOnce();
      expect(mockPlayDrum).toHaveBeenCalledWith(0, pizza.drumSamples[0]);
    });

    it('does not play any sound when all beats are inactive', () => {
      const pizza = makePizza(4);
      const steps = makeEmptySteps(4);
      for (let i = 0; i < 4; i++) pizza.incrementSoundLaunch(0, steps);
      expect(mockPlayDrum).not.toHaveBeenCalled();
    });

    it('fires one sound per active ring when multiple rings are active on the same step', () => {
      const pizza = makePizza(4);
      const steps = makeEmptySteps(4);
      steps[0][0] = true;
      steps[1][0] = true;
      steps[2][0] = true;

      pizza.incrementSoundLaunch(0, steps); // step 0 — all 3 rings fire
      expect(mockPlayDrum).toHaveBeenCalledTimes(3);
    });

    it('passes the correct nextNoteTime to playDrum', () => {
      const pizza = makePizza(4);
      const steps = makeEmptySteps(4);
      steps[0][0] = true;
      pizza.incrementSoundLaunch(1.23, steps);
      expect(mockPlayDrum).toHaveBeenCalledWith(1.23, expect.any(Number));
    });
  });
});
