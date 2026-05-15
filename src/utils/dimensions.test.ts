import { describe, it, expect } from 'vitest';
import { computeDimensions, computePizzaGeometry } from './dimensions';
import {
  NARROW_APP_WIDTH_FACTOR,
  LANDSCAPE_VB_W,
  LANDSCAPE_VB_H,
  PIZZA_DIAMETER_RATIO,
  PIZZA_TOOTH_ARC_LENGTH_RATIO,
  PIZZA_DIAMETER_RATIO_PORTRAIT,
  PIZZA_TOOTH_ARC_LENGTH_RATIO_PORTRAIT,
} from '../config';
import type { PizzaPosition } from '../types';

const POSITIONS: PizzaPosition[] = [
  { x: -0.233, y: -0.368 },
  { x: 0.259, y: -0.368 },
];

describe('computeDimensions', () => {
  it('uses the portrait layout when aspect ratio is at or below 1.0', () => {
    // 375x812 → ratio ≈ 0.46 (portrait phone)
    const d = computeDimensions(375, 812);
    expect(d.portrait).toBe(true);
    expect(d.appWidth).toBeCloseTo(375 * NARROW_APP_WIDTH_FACTOR);
    expect(d.appHeight).toBeCloseTo(812 * NARROW_APP_WIDTH_FACTOR);
    expect(d.transX).toBeCloseTo(d.appWidth / 2);
    expect(d.transY).toBeCloseTo(d.appHeight / 2);
  });

  it('portrait returns scale=1 with margin offsets', () => {
    const d = computeDimensions(375, 812);
    expect(d.scale).toBe(1);
    expect(d.offsetX).toBeCloseTo(375 * (1 - NARROW_APP_WIDTH_FACTOR) / 2);
    expect(d.offsetY).toBeCloseTo(812 * (1 - NARROW_APP_WIDTH_FACTOR) / 2);
  });

  it('landscape uses fixed viewBox dimensions regardless of window size', () => {
    const narrow = computeDimensions(900, 600);   // aspect 1.5
    const tall = computeDimensions(1200, 400);    // aspect 3.0
    const typical = computeDimensions(1440, 900); // aspect 1.6
    for (const d of [narrow, tall, typical]) {
      expect(d.portrait).toBe(false);
      expect(d.appWidth).toBe(LANDSCAPE_VB_W);
      expect(d.appHeight).toBe(LANDSCAPE_VB_H);
    }
  });

  it('landscape scale fits the viewBox into the window with meet semantics', () => {
    const d = computeDimensions(1440, 900);
    // scale = min(1440/1000, 900/573) ≈ min(1.44, 1.571) = 1.44
    expect(d.scale).toBeCloseTo(Math.min(1440 / LANDSCAPE_VB_W, 900 / LANDSCAPE_VB_H), 5);
    expect(d.offsetX).toBeGreaterThanOrEqual(0);
    expect(d.offsetY).toBeGreaterThanOrEqual(0);
  });

  it('portrait transY differs from transX (uses appHeight/2 not appWidth/2)', () => {
    const d = computeDimensions(375, 812);
    expect(d.transX).not.toBeCloseTo(d.transY);
    expect(d.transX).toBeCloseTo(d.appWidth / 2);
    expect(d.transY).toBeCloseTo(d.appHeight / 2);
  });

  it('landscape transX equals transY (both appWidth/2)', () => {
    const d = computeDimensions(1280, 720);
    expect(d.transX).toBeCloseTo(d.transY);
    expect(d.transX).toBeCloseTo(d.appWidth / 2);
  });

  it('returns positive dimensions for typical screen sizes', () => {
    const sizes: [number, number][] = [
      [1280, 720],
      [1920, 1080],
      [375, 812], // mobile portrait
      [768, 1024], // tablet portrait
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

  it('computes landscape pizzaDiam as appWidth * PIZZA_DIAMETER_RATIO', () => {
    const [geom] = computePizzaGeometry(1000, 600, POSITIONS, [16, 16]);
    expect(geom.pizzaDiam).toBeCloseTo(1000 * PIZZA_DIAMETER_RATIO);
  });

  it('computes portrait pizzaDiam using min(appWidth, appHeight * 0.42)', () => {
    const ref = Math.min(360, 780 * 0.42);
    const [geom] = computePizzaGeometry(360, 780, POSITIONS, [16, 16], true);
    expect(geom.pizzaDiam).toBeCloseTo(ref * PIZZA_DIAMETER_RATIO_PORTRAIT);
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

  it('computes landscape diameter from toothArcLength and numTeeth', () => {
    const toothArcLength = PIZZA_TOOTH_ARC_LENGTH_RATIO * 1000;
    const [a, b] = computePizzaGeometry(1000, 600, POSITIONS, [16, 8]);
    expect(a.diameter).toBeCloseTo((toothArcLength * 16) / (2 * Math.PI));
    expect(b.diameter).toBeCloseTo((toothArcLength * 8) / (2 * Math.PI));
  });

  it('computes portrait diameter using the portrait tooth arc ratio and capped ref', () => {
    const ref = Math.min(360, 780 * 0.42);
    const toothArcLength = PIZZA_TOOTH_ARC_LENGTH_RATIO_PORTRAIT * ref;
    const [geom] = computePizzaGeometry(360, 780, POSITIONS, [16, 16], true);
    expect(geom.diameter).toBeCloseTo((toothArcLength * 16) / (2 * Math.PI));
  });

  it('diameter scales with numTeeth — fewer teeth means smaller circle', () => {
    const [a, b] = computePizzaGeometry(1000, 600, POSITIONS, [16, 8]);
    expect(b.diameter).toBeCloseTo(a.diameter / 2);
  });

  it('portrait diameter is larger than landscape diameter for same appWidth and teeth', () => {
    const [landscape] = computePizzaGeometry(360, 780, POSITIONS, [16, 16], false);
    const [portrait] = computePizzaGeometry(360, 780, POSITIONS, [16, 16], true);
    expect(portrait.diameter).toBeGreaterThan(landscape.diameter);
  });
});

