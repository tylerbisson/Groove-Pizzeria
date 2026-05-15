/**
 * PizzaPanel
 *
 * Per-pizza panel: owns the interactive SVG face with pointer hit-testing,
 * and a three-column control row (steps, time units, rotation).
 */
import { useRef } from 'react';
import Sequencer from '../Sequencer';
import Pizza from './Pizza';
import SpinBox from './SpinBox';
import { hitTestBeats } from '../utils/hitTest';
import type { PizzaSteps, PizzaGeometry, PizzaConfig, RGB } from '../types';
import {
  SLICES_MIN,
  SLICES_MAX,
  TEETH_MAX,
  ROTATION_MAX,
  PIZZA_TEETH_OFFSET_RATIO,
  TEXT_SIZES,
  COLOR_STRINGS,
  COLORS,
} from '../config';

const CONTROL_COLUMN_GAP = 2;
const CONTROL_ROW_GAP = 12;

interface PizzaPanelProps {
  pizza: Sequencer;
  pizzaIdx: number;
  geometry: PizzaGeometry;
  steps: PizzaSteps;
  config: PizzaConfig;
  stepNoteValue: number;
  timeUnit: number;
  otherStepNoteValue: number;
  otherColor: RGB;
  syncWithOther: boolean;
  refPx: number;
  onDotToggle: (ring: number, step: number) => void;
  onSlicesChange: (n: number) => void;
  onTeethChange: (n: number) => void;
  onRotationChange: (n: number) => void;
}

export default function PizzaPanel({
  pizza, pizzaIdx, geometry, steps, config, stepNoteValue, timeUnit,
  otherStepNoteValue, otherColor, syncWithOther, refPx,
  onDotToggle, onSlicesChange, onTeethChange, onRotationChange,
}: PizzaPanelProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef(false);
  const draggedDotsRef = useRef(new Set<string>());

  const [r, g, b] = pizza.color;
  const [or, og, ob] = otherColor;
  const color = `rgba(${r},${g},${b},${COLORS.TEXT_ALPHA / 255})`;

  const diameterPx = geometry.diameter;
  const pizzaDiamPx = geometry.pizzaDiam;
  const maxDiameterPx = (geometry.diameter / pizza.numTeeth) * TEETH_MAX;
  const outerR = maxDiameterPx * (1 + PIZZA_TEETH_OFFSET_RATIO);
  const svgSize = Math.ceil(outerR * 2) + 8;
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  const geometryPx: PizzaGeometry = { position: { x: 0, y: 0 }, pizzaDiam: pizzaDiamPx, diameter: diameterPx };
  const largeFont = Math.ceil(refPx * TEXT_SIZES.CONTROL_TEXT);
  const smallFont = Math.ceil(refPx * TEXT_SIZES.TIMELINE_TEXT);
  const divFont = Math.ceil(refPx * TEXT_SIZES.DIV_SYMBOL);
  const fixedOuterDiam = Math.ceil(maxDiameterPx * 2 * (1 + PIZZA_TEETH_OFFSET_RATIO));

  const getSVGCoords = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: clientX - rect.left - cx, y: clientY - rect.top - cy };
  };

  const tryToggleDot = (gX: number, gY: number) => {
    const hit = hitTestBeats(pizza.stepAngles, pizzaDiamPx, diameterPx, gX, gY);
    if (hit === null) return;
    const { ringIdx, stepIdx } = hit;
    const key = `${ringIdx}-${stepIdx}`;
    if (!draggedDotsRef.current.has(key)) {
      draggedDotsRef.current.add(key);
      onDotToggle(ringIdx, stepIdx);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDraggingRef.current = true;
    draggedDotsRef.current = new Set();
    svgRef.current?.setPointerCapture(e.pointerId);
    const coords = getSVGCoords(e.clientX, e.clientY);
    if (coords) tryToggleDot(coords.x, coords.y);
  };
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return;
    const coords = getSVGCoords(e.clientX, e.clientY);
    if (coords) tryToggleDot(coords.x, coords.y);
  };
  const handlePointerUp = () => {
    isDraggingRef.current = false;
    draggedDotsRef.current = new Set();
  };

  const spinRow = (label: string, value: number, min: number, max: number, ariaLabel: string, onChange: (n: number) => void) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <SpinBox value={value} min={min} max={max} onChange={onChange} fontSize={largeFont} color={color} ariaLabel={ariaLabel} />
      <span style={{ color, whiteSpace: 'nowrap', fontSize: smallFont }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
      <svg
        ref={svgRef}
        width={svgSize}
        height={svgSize}
        style={{ display: 'block', touchAction: 'none', cursor: 'pointer' }}
        aria-label={`Pizza ${pizzaIdx + 1} beat sequencer`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <g transform={`translate(${cx},${cy})`}>
          <Pizza
            pizza={pizza}
            pizzaIdx={pizzaIdx}
            geometry={geometryPx}
            steps={steps}
            syncWithOther={syncWithOther}
            onDotToggle={onDotToggle}
          />
        </g>
      </svg>

      <div style={{ display: 'flex', gap: CONTROL_ROW_GAP, marginLeft: Math.round((svgSize - fixedOuterDiam) / 2) }}>
        {/* Col 1: time units ÷ steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: CONTROL_COLUMN_GAP }}>
          {spinRow(`time units (${timeUnit.toFixed(3)} s)`, config.teeth, SLICES_MIN, TEETH_MAX, 'Teeth', onTeethChange)}
          <span style={{ fontSize: divFont, color }}>÷</span>
          {spinRow(`steps (1/${stepNoteValue.toFixed(3)} note)`, config.slices, SLICES_MIN, SLICES_MAX, 'Slices', onSlicesChange)}
        </div>
        {/* Col 2: step ratio */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: smallFont, color, whiteSpace: 'nowrap' }}>step</span>
          <span style={{ fontSize: smallFont, color: COLOR_STRINGS.GREY, whiteSpace: 'nowrap' }}>= {(otherStepNoteValue / stepNoteValue || 1).toFixed(3)} x</span>
          <span style={{ fontSize: smallFont, color: `rgba(${or},${og},${ob},0.67)`, whiteSpace: 'nowrap' }}>step</span>
        </div>
        {/* Col 3: rotation */}
        <div>
          {spinRow('step rotations', config.rotation, 0, ROTATION_MAX, 'Rotation', onRotationChange)}
        </div>
      </div>
    </div>
  );
}
