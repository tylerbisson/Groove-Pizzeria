import { describe, it, expect } from 'vitest';
import { encodeState, decodeState } from '../urlState';
import { KIT_OPTIONS, DEFAULT_BPM, DEFAULT_NUM_SLICES, DEFAULT_NUM_TEETH } from '../../config';
import { makeEmptySteps } from '../steps';
import type { PizzaConfig, PizzaSteps } from '../../types';

const NUM_PIZZAS = 2;

const defaultConfigs: PizzaConfig[] = [
  { slices: DEFAULT_NUM_SLICES, teeth: DEFAULT_NUM_TEETH, rotation: 0 },
  { slices: DEFAULT_NUM_SLICES, teeth: DEFAULT_NUM_TEETH, rotation: 0 },
];
const defaultKits = KIT_OPTIONS.slice(0, NUM_PIZZAS);
const defaultSteps: PizzaSteps[] = [
  makeEmptySteps(DEFAULT_NUM_SLICES),
  makeEmptySteps(DEFAULT_NUM_SLICES),
];

// Helper: returns URLSearchParams built from an encoded hash string.
const params = (hash: string) => new URLSearchParams(hash);

describe('encodeState', () => {
  it('returns empty string when all values are defaults', () => {
    expect(encodeState(DEFAULT_BPM, defaultConfigs, defaultKits, defaultSteps)).toBe('');
  });

  it('includes bpm only when non-default', () => {
    expect(encodeState(140, defaultConfigs, defaultKits, defaultSteps)).toContain('bpm=140');
    expect(encodeState(DEFAULT_BPM, defaultConfigs, defaultKits, defaultSteps)).not.toContain('bpm');
  });

  it('encodes non-default slices in compact labeled format', () => {
    const configs: PizzaConfig[] = [
      { slices: 12, teeth: DEFAULT_NUM_TEETH, rotation: 0 },
      defaultConfigs[1],
    ];
    expect(encodeState(DEFAULT_BPM, configs, defaultKits, defaultSteps)).toContain('p0=s12');
  });

  it('packs multiple non-default config values into one param', () => {
    const configs: PizzaConfig[] = [
      { slices: 12, teeth: 14, rotation: 3 },
      defaultConfigs[1],
    ];
    const hash = encodeState(DEFAULT_BPM, configs, defaultKits, defaultSteps);
    expect(params(hash).get('p0')).toBe('s12t14r3');
  });

  it('omits config param entirely when all values are default', () => {
    const hash = encodeState(DEFAULT_BPM, defaultConfigs, defaultKits, defaultSteps);
    expect(params(hash).get('p0')).toBeNull();
    expect(params(hash).get('p1')).toBeNull();
  });

  it('encodes active beats as a binary string', () => {
    const steps: PizzaSteps[] = [makeEmptySteps(4), makeEmptySteps(DEFAULT_NUM_SLICES)];
    steps[0][0] = [true, false, true, false];
    const configs: PizzaConfig[] = [
      { slices: 4, teeth: DEFAULT_NUM_TEETH, rotation: 0 },
      defaultConfigs[1],
    ];
    expect(params(encodeState(DEFAULT_BPM, configs, defaultKits, steps)).get('p0b')).toBe('1010');
  });

  it('omits trailing all-off rings in beat encoding', () => {
    const steps: PizzaSteps[] = [makeEmptySteps(4), makeEmptySteps(DEFAULT_NUM_SLICES)];
    steps[0][0] = [true, false, false, false]; // only inner ring active
    const configs: PizzaConfig[] = [
      { slices: 4, teeth: DEFAULT_NUM_TEETH, rotation: 0 },
      defaultConfigs[1],
    ];
    expect(params(encodeState(DEFAULT_BPM, configs, defaultKits, steps)).get('p0b')).toBe('1000');
  });

  it('preserves empty middle ring with adjacent dots', () => {
    const steps: PizzaSteps[] = [makeEmptySteps(4), makeEmptySteps(DEFAULT_NUM_SLICES)];
    steps[0][0] = [true, false, false, false]; // inner
    steps[0][2] = [false, true, false, false]; // outer; middle stays empty
    const configs: PizzaConfig[] = [
      { slices: 4, teeth: DEFAULT_NUM_TEETH, rotation: 0 },
      defaultConfigs[1],
    ];
    expect(params(encodeState(DEFAULT_BPM, configs, defaultKits, steps)).get('p0b')).toBe('1000..0100');
  });

  it('omits beat param when all rings are empty', () => {
    const hash = encodeState(DEFAULT_BPM, defaultConfigs, defaultKits, defaultSteps);
    expect(params(hash).get('p0b')).toBeNull();
    expect(params(hash).get('p1b')).toBeNull();
  });

  it('encodes non-default kit', () => {
    const kits = [KIT_OPTIONS[1], defaultKits[1]]; // pizza 0 swapped to kit index 1
    const hash = encodeState(DEFAULT_BPM, defaultConfigs, kits, defaultSteps);
    expect(params(hash).get('p0k')).toBe(KIT_OPTIONS[1]);
  });

  it('omits kit param when kit matches the index default', () => {
    const hash = encodeState(DEFAULT_BPM, defaultConfigs, defaultKits, defaultSteps);
    expect(params(hash).get('p0k')).toBeNull();
    expect(params(hash).get('p1k')).toBeNull();
  });
});

describe('decodeState', () => {
  it('returns a valid default state for an empty string', () => {
    const result = decodeState('', NUM_PIZZAS);
    expect(result).not.toBeNull();
    expect(result!.bpm).toBe(DEFAULT_BPM);
    expect(result!.configs).toEqual(defaultConfigs);
    expect(result!.kits).toEqual(defaultKits);
  });

  it('returns null for BPM below the minimum', () => {
    expect(decodeState('bpm=5', NUM_PIZZAS)).toBeNull();
  });

  it('returns null for BPM above the maximum', () => {
    expect(decodeState('bpm=999', NUM_PIZZAS)).toBeNull();
  });

  it('returns null for a non-numeric BPM', () => {
    expect(decodeState('bpm=fast', NUM_PIZZAS)).toBeNull();
  });

  it('decodes a custom BPM', () => {
    expect(decodeState('bpm=140', NUM_PIZZAS)!.bpm).toBe(140);
  });

  it('decodes a labeled config string', () => {
    const result = decodeState('p0=s12t14r3', NUM_PIZZAS);
    expect(result!.configs[0]).toEqual({ slices: 12, teeth: 14, rotation: 3 });
  });

  it('fills in default config values for missing labels', () => {
    const result = decodeState('p0=s12', NUM_PIZZAS);
    expect(result!.configs[0]).toEqual({ slices: 12, teeth: DEFAULT_NUM_TEETH, rotation: 0 });
  });

  it('decodes dot-separated beat rings', () => {
    const result = decodeState('p0=s4&p0b=1010.0101.1100', NUM_PIZZAS);
    expect(result!.pizzaSteps[0][0]).toEqual([true, false, true, false]);
    expect(result!.pizzaSteps[0][1]).toEqual([false, true, false, true]);
    expect(result!.pizzaSteps[0][2]).toEqual([true, true, false, false]);
  });

  it('fills missing trailing rings with all-off beats', () => {
    const result = decodeState('p0=s4&p0b=1010', NUM_PIZZAS);
    expect(result!.pizzaSteps[0][0]).toEqual([true, false, true, false]);
    expect(result!.pizzaSteps[0][1]).toEqual([false, false, false, false]);
    expect(result!.pizzaSteps[0][2]).toEqual([false, false, false, false]);
  });

  it('decodes an empty middle ring indicated by adjacent dots', () => {
    const result = decodeState('p0=s4&p0b=1000..0100', NUM_PIZZAS);
    expect(result!.pizzaSteps[0][0]).toEqual([true, false, false, false]);
    expect(result!.pizzaSteps[0][1]).toEqual([false, false, false, false]);
    expect(result!.pizzaSteps[0][2]).toEqual([false, true, false, false]);
  });

  it('falls back to per-index default kit for an unrecognised kit name', () => {
    expect(decodeState('p0k=unknown-kit', NUM_PIZZAS)!.kits[0]).toBe(KIT_OPTIONS[0]);
  });

  it('uses per-index default kit when the param is absent', () => {
    const result = decodeState('', NUM_PIZZAS);
    expect(result!.kits[0]).toBe(KIT_OPTIONS[0]);
    expect(result!.kits[1]).toBe(KIT_OPTIONS[1]);
  });
});

describe('encode → decode roundtrip', () => {
  it('restores an all-default state from an empty hash', () => {
    const hash = encodeState(DEFAULT_BPM, defaultConfigs, defaultKits, defaultSteps);
    expect(hash).toBe('');
    const result = decodeState(hash, NUM_PIZZAS);
    expect(result!.bpm).toBe(DEFAULT_BPM);
    expect(result!.configs).toEqual(defaultConfigs);
    expect(result!.kits).toEqual(defaultKits);
  });

  it('restores a fully-customised pattern exactly', () => {
    const bpm = 145;
    const configs: PizzaConfig[] = [
      { slices: 12, teeth: 14, rotation: 3 },
      { slices: 8, teeth: 10, rotation: 0 },
    ];
    const kits = [KIT_OPTIONS[1], KIT_OPTIONS[0]];
    const steps: PizzaSteps[] = [makeEmptySteps(12), makeEmptySteps(8)];
    steps[0][0][0] = true;
    steps[0][0][4] = true;
    steps[0][2][2] = true;
    steps[1][1][1] = true;

    const result = decodeState(encodeState(bpm, configs, kits, steps), NUM_PIZZAS);

    expect(result).not.toBeNull();
    expect(result!.bpm).toBe(bpm);
    expect(result!.configs).toEqual(configs);
    expect(result!.kits).toEqual(kits);
    expect(result!.pizzaSteps[0][0][0]).toBe(true);
    expect(result!.pizzaSteps[0][0][4]).toBe(true);
    expect(result!.pizzaSteps[0][2][2]).toBe(true);
    expect(result!.pizzaSteps[1][1][1]).toBe(true);
    expect(result!.pizzaSteps[0][0][1]).toBe(false);
    expect(result!.pizzaSteps[1][0][0]).toBe(false);
  });
});
