import { describe, it, expect } from 'vitest';
import { computeDimensions, computeSliderAnchors } from './dimensions';
import { NARROW_APP_WIDTH_FACTOR, TALL_APP_HEIGHT_FACTOR } from '../config';

describe('computeDimensions', () => {
  it('uses the narrow layout when width/height ratio is below the narrow breakpoint', () => {
    // 900x600 → ratio 1.5, below LAYOUT_BREAKPOINTS.NARROW (1.9)
    const { appWidth, appHeight } = computeDimensions(900, 600);
    expect(appWidth).toBeCloseTo(900 * NARROW_APP_WIDTH_FACTOR);
    expect(appWidth).toBeGreaterThan(0);
    expect(appHeight).toBeGreaterThan(0);
  });

  it('uses the tall layout when height/width ratio is below the tall breakpoint', () => {
    // 1200x400 → ratio 2.0 (wide), height/width = 0.33 below LAYOUT_BREAKPOINTS.TALL (0.6)
    const { appWidth, appHeight } = computeDimensions(1200, 400);
    expect(appHeight).toBeCloseTo(400 * TALL_APP_HEIGHT_FACTOR);
    expect(appWidth).toBeGreaterThan(appHeight);
  });

  it('returns positive dimensions for typical screen sizes', () => {
    const sizes = [
      [1280, 720],
      [1920, 1080],
      [375, 812], // mobile portrait
      [2560, 1440],
    ];
    sizes.forEach(([w, h]) => {
      const { appWidth, appHeight } = computeDimensions(w, h);
      expect(appWidth).toBeGreaterThan(0);
      expect(appHeight).toBeGreaterThan(0);
    });
  });
});

describe('computeSliderAnchors', () => {
  it('returns an object with all five anchor properties', () => {
    const anchors = computeSliderAnchors(0, 1000, 600);
    expect(anchors).toHaveProperty('slidersX');
    expect(anchors).toHaveProperty('rotateX');
    expect(anchors).toHaveProperty('sliceY');
    expect(anchors).toHaveProperty('toothY');
    expect(anchors).toHaveProperty('rotateY');
  });

  it('shifts anchors horizontally when pizzaXRatio changes', () => {
    const left = computeSliderAnchors(-0.233, 1000, 600);
    const right = computeSliderAnchors(0.259, 1000, 600);
    expect(right.slidersX).toBeGreaterThan(left.slidersX);
    expect(right.rotateX).toBeGreaterThan(left.rotateX);
  });

  it('produces consistent vertical anchors regardless of pizzaXRatio', () => {
    const left = computeSliderAnchors(-0.233, 1000, 600);
    const right = computeSliderAnchors(0.259, 1000, 600);
    // vertical positions depend only on appHeight/appWidth, not on x ratio
    expect(left.sliceY).toBeCloseTo(right.sliceY);
    expect(left.toothY).toBeCloseTo(right.toothY);
    expect(left.rotateY).toBeCloseTo(right.rotateY);
  });
});
