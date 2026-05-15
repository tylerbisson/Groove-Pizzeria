/**
 * PizzaPanel
 *
 * Per-pizza panel: owns the interactive SVG face with pointer hit-testing,
 * and a three-column control row (steps, time units, rotation). Positions
 * itself absolutely so that its SVG center aligns with the pizza center
 * coordinates passed from App.
 */
import { useRef } from 'react';
import Sequencer from '../Sequencer';
import Pizza from './Pizza';
import LabeledSlider from './LabeledSlider';
import { hitTestBeats } from '../utils/hitTest';
import type { PizzaSteps, PizzaGeometry, PizzaConfig, RGB } from '../types';
import {
  SLICES_MIN, SLICES_MAX, TEETH_MAX, ROTATION_MAX,
  PIZZA_TEETH_OFFSET_RATIO, PIZZA_TOOTH_ARC_LENGTH_RATIO,
  TEXT_SIZES, COLOR_STRINGS, COLORS,
} from '../config';

const CONTROL_COLUMN_GAP = 2;   // gap between items stacked in column 1
const CONTROL_ROW_GAP = 12;     // gap between the three control columns

// ── PizzaPanel ────────────────────────────────────────────────────────────────

interface PizzaPanelProps {
  pizza: Sequencer;
  pizzaIdx: number;
  geometry: PizzaGeometry;      // pixel-space geometry from App
  steps: PizzaSteps;
  config: PizzaConfig;
  stepNoteValue: number;
  timeUnit: number;
  otherStepNoteValue: number;
  otherColor: RGB;
  syncWithOther: boolean;
  refPx: number;                // reference pixel size (scale * VB width) for font/geometry sizing
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

  // geometry.diameter and geometry.pizzaDiam are already in screen pixels (refPx-based).
  const diameterPx = geometry.diameter;
  const pizzaDiamPx = geometry.pizzaDiam;
  // Fixed SVG size based on the max possible outer radius (TEETH_MAX teeth) so
  // that changing tooth count doesn't resize the panel.
  const maxDiameterPx = (PIZZA_TOOTH_ARC_LENGTH_RATIO * refPx * TEETH_MAX) / (2 * Math.PI);
  const outerR = maxDiameterPx * (1 + PIZZA_TEETH_OFFSET_RATIO);
  const svgSize = Math.ceil(outerR * 2) + 8;
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  const geometryPx: PizzaGeometry = { position: { x: 0, y: 0 }, pizzaDiam: pizzaDiamPx, diameter: diameterPx };
  const largeFont = Math.ceil(refPx * TEXT_SIZES.CONTROL_TEXT);
  const smallFont = Math.ceil(refPx * TEXT_SIZES.TIMELINE_TEXT);
  const divFont = Math.ceil(refPx * TEXT_SIZES.DIV_SYMBOL);
  // Slider panel uses the fixed max outer diameter so it never resizes as tooth count changes.
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
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
          <LabeledSlider
            color={color} largeFont={largeFont} smallFont={smallFont}
            value={config.teeth}
            sliderMin={SLICES_MIN} sliderMax={TEETH_MAX} sliderColor={COLOR_STRINGS.WHITE}
            ariaLabel="Teeth"
            largeLabel={config.teeth}
            smallLabel={`time units (${timeUnit.toFixed(3)} s)`}
            onChange={onTeethChange}
          />
          <span style={{ fontSize: divFont, color }}>÷</span>
          <LabeledSlider
            color={color} largeFont={largeFont} smallFont={smallFont}
            value={config.slices}
            sliderMin={SLICES_MIN} sliderMax={SLICES_MAX} sliderColor={COLOR_STRINGS.GREY}
            ariaLabel="Slices"
            largeLabel={config.slices}
            smallLabel={`steps (1/${stepNoteValue.toFixed(3)} note)`}
            onChange={onSlicesChange}
          />
        </div>
        {/* Col 2: step ratio display — single line */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: smallFont, color, whiteSpace: 'nowrap' }}>step</span>
          <span style={{ fontSize: smallFont, color: COLOR_STRINGS.GREY, whiteSpace: 'nowrap' }}>= {(otherStepNoteValue / stepNoteValue || 1).toFixed(3)} x</span>
          <span style={{ fontSize: smallFont, color: `rgba(${or},${og},${ob},0.67)`, whiteSpace: 'nowrap' }}>step</span>
        </div>
        {/* Col 3: rotation */}
        <div>
          <LabeledSlider
            color={color} largeFont={largeFont} smallFont={smallFont}
            value={config.rotation}
            sliderMin={0} sliderMax={ROTATION_MAX} sliderColor={`rgb(${r},${g},${b})`}
            ariaLabel="Rotation"
            largeLabel={config.rotation}
            smallLabel="step rotations"
            onChange={onRotationChange}
          />
        </div>
      </div>
    </div>
  );
}
