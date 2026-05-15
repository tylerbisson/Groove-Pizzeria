import type { PizzaConfig, PizzaSteps } from '../types';
import {
  KIT_OPTIONS,
  DEFAULT_BPM,
  DEFAULT_NUM_SLICES,
  DEFAULT_NUM_TEETH,
  BPM_MIN,
  BPM_MAX,
} from '../config';

export interface DecodedState {
  bpm: number;
  configs: PizzaConfig[];
  kits: string[];
  pizzaSteps: PizzaSteps[];
}

// --- helpers ---------------------------------------------------------------

function stepsToString(steps: boolean[]): string {
  return steps.map((b) => (b ? '1' : '0')).join('');
}

function stringToSteps(s: string): boolean[] {
  return [...s].map((c) => c === '1');
}

const emptyRing = (n: number): boolean[] => Array<boolean>(n).fill(false);
const isAllOff = (ring: boolean[]): boolean => ring.every((b) => !b);

// Config → "s12t14r2" — only include letters for non-default values.
function encodeConfig(c: PizzaConfig): string {
  let s = '';
  if (c.slices !== DEFAULT_NUM_SLICES) s += `s${c.slices}`;
  if (c.teeth !== DEFAULT_NUM_TEETH) s += `t${c.teeth}`;
  if (c.rotation !== 0) s += `r${c.rotation}`;
  return s;
}

function decodeConfig(s: string): PizzaConfig {
  return {
    slices: Number(s.match(/s(\d+)/)?.[1] ?? DEFAULT_NUM_SLICES),
    teeth: Number(s.match(/t(\d+)/)?.[1] ?? DEFAULT_NUM_TEETH),
    rotation: Number(s.match(/r(\d+)/)?.[1] ?? 0),
  };
}

// Rings → "ring0.ring1.ring2" — trailing all-off rings are omitted.
// An empty segment between dots means that ring is all off.
function encodeBeats(rings: PizzaSteps): string {
  const parts = rings.map((r) => (isAllOff(r) ? '' : stepsToString(r)));
  while (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
  return parts.join('.');
}

function decodeBeats(s: string, slices: number): PizzaSteps {
  const parts = s.split('.');
  return [0, 1, 2].map((ri) => {
    const p = parts[ri] ?? '';
    return p ? stringToSteps(p) : emptyRing(slices);
  }) as PizzaSteps;
}

// --- public API ------------------------------------------------------------

export function encodeState(
  bpm: number,
  configs: PizzaConfig[],
  kits: string[],
  pizzaSteps: PizzaSteps[]
): string {
  const params = new URLSearchParams();

  if (bpm !== DEFAULT_BPM) params.set('bpm', String(bpm));

  configs.forEach((c, i) => {
    const cfg = encodeConfig(c);
    if (cfg) params.set(`p${i}`, cfg);
    if (kits[i] !== KIT_OPTIONS[i]) params.set(`p${i}k`, kits[i]);
    const beats = encodeBeats(pizzaSteps[i]);
    if (beats) params.set(`p${i}b`, beats);
  });

  return params.toString();
}

export function decodeState(hash: string, numPizzas: number): DecodedState | null {
  try {
    const params = new URLSearchParams(hash);

    const bpmRaw = params.get('bpm');
    const bpm = bpmRaw !== null ? Number(bpmRaw) : DEFAULT_BPM;
    if (isNaN(bpm) || bpm < BPM_MIN || bpm > BPM_MAX) return null;

    const configs: PizzaConfig[] = [];
    const kits: string[] = [];
    const pizzaSteps: PizzaSteps[] = [];

    for (let i = 0; i < numPizzas; i++) {
      const config = decodeConfig(params.get(`p${i}`) ?? '');
      const kit = params.get(`p${i}k`) ?? KIT_OPTIONS[i];
      const beatsRaw = params.get(`p${i}b`);
      const rings = beatsRaw
        ? decodeBeats(beatsRaw, config.slices)
        : ([emptyRing(config.slices), emptyRing(config.slices), emptyRing(config.slices)] as PizzaSteps);

      configs.push(config);
      kits.push(KIT_OPTIONS.includes(kit) ? kit : KIT_OPTIONS[i]);
      pizzaSteps.push(rings);
    }

    return { bpm, configs, kits, pizzaSteps };
  } catch {
    return null;
  }
}
