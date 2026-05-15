import { describe, it, expect } from 'vitest';
import { computeDimensions, computeSliderAnchors, computePizzaGeometry } from './dimensions';
import {
  NARROW_APP_WIDTH_FACTOR,
  TALL_APP_HEIGHT_FACTOR,
  PIZZA_DIAMETER_RATIO,
  PIZZA_TOOTH_ARC_LENGTH_RATIO,
} from '../config';
import type { PizzaPosition } from '../types';

const POSITIONS: PizzaPosition[] = [
  { x: -0.233, y: -0.368 },
  { x: 0.259, y: -0.368 },
];

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

describe('computePizzaGeometry', () => {
  it('returns one entry per position', () => {
    expect(computePizzaGeometry(1000, 600, POSITIONS, [16, 16])).toHaveLength(2);
  });

  it('computes pizzaDiam as appWidth * PIZZA_DIAMETER_RATIO', () => {
    const [geom] = computePizzaGeometry(1000, 600, POSITIONS, [16, 16]);
    expect(geom.pizzaDiam).toBeCloseTo(1000 * PIZZA_DIAMETER_RATIO);
  });

  it('all pizzas share the same pizzaDiam (depends only on appWidth)', () => {
    const [a, b] = computePizzaGeometry(1000, 600, POSITIONS, [16, 8]);
    expect(a.pizzaDiam).toBe(b.pizzaDiam);
  });

  it('computes position from the ratio and appWidth/appHeight', () => {
    const [geom] = computePizzaGeometry(1000, 600, POSITIONS, [16, 16]);
    expect(geom.position.x).toBeCloseTo(POSITIONS[0].x * 1000);
    expect(geom.position.y).toBeCloseTo(POSITIONS[0].y * 600);
  });

  it('computes diameter from toothArcLength and numTeeth', () => {
    const toothArcLength = PIZZA_TOOTH_ARC_LENGTH_RATIO * 1000;
    const [a, b] = computePizzaGeometry(1000, 600, POSITIONS, [16, 8]);
    expect(a.diameter).toBeCloseTo((toothArcLength * 16) / (2 * Math.PI));
    expect(b.diameter).toBeCloseTo((toothArcLength * 8) / (2 * Math.PI));
  });

  it('diameter scales with numTeeth — fewer teeth means smaller circle', () => {
    const [a, b] = computePizzaGeometry(1000, 600, POSITIONS, [16, 8]);
    expect(b.diameter).toBeCloseTo(a.diameter / 2);
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
