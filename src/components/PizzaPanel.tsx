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

const CONTROL_INPUT_HEIGHT = 22; // native height of a range input in pixels
const CONTROL_COLUMN_GAP = 2;   // flex gap inside LabeledSlider

// ── PizzaPanel ────────────────────────────────────────────────────────────────

interface PizzaPanelProps {
  pizza: Sequencer;
  pizzaIdx: number;
  geometry: PizzaGeometry;      // viewBox-unit geometry from App
  steps: PizzaSteps;
  config: PizzaConfig;
  stepNoteValue: number;
  timeUnit: number;
  otherStepNoteValue: number;
  otherColor: RGB;
  syncWithOther: boolean;
  appWidth: number;             // landscape VB width (1000) for font sizing
  scale: number;                // VB units → screen pixels
  screenCenterX: number;        // pizza center in screen pixels (from App)
  screenCenterY: number;
  onDotToggle: (ring: number, step: number) => void;
  onSlicesChange: (n: number) => void;
  onTeethChange: (n: number) => void;
  onRotationChange: (n: number) => void;
}

export default function PizzaPanel({
  pizza, pizzaIdx, geometry, steps, config, stepNoteValue, timeUnit,
  otherStepNoteValue, otherColor, syncWithOther, appWidth, scale,
  screenCenterX, screenCenterY,
  onDotToggle, onSlicesChange, onTeethChange, onRotationChange,
}: PizzaPanelProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef(false);
  const draggedDotsRef = useRef(new Set<string>());

  const [r, g, b] = pizza.color;
  const [or, og, ob] = otherColor;
  const color = `rgba(${r},${g},${b},${COLORS.TEXT_ALPHA / 255})`;

  // Convert viewBox-unit geometry to pixels for the pixel-based SVG.
  // appWidth * scale gives the pixel equivalent of the full VB width so that
  // proportional sizing (e.g. playhead stroke) stays correct in the pixel SVG.
  const diameterPx = geometry.diameter * scale;
  const pizzaDiamPx = geometry.pizzaDiam * scale;
  // Fixed SVG size based on the max possible outer radius (TEETH_MAX teeth) so
  // that changing tooth count doesn't resize the panel.
  const maxDiameterPx = (PIZZA_TOOTH_ARC_LENGTH_RATIO * appWidth * TEETH_MAX) / (2 * Math.PI) * scale;
  const outerR = maxDiameterPx * (1 + PIZZA_TEETH_OFFSET_RATIO);
  const svgSize = Math.ceil(outerR * 2) + 8;
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  const geometryPx: PizzaGeometry = { position: { x: 0, y: 0 }, pizzaDiam: pizzaDiamPx, diameter: diameterPx };
  const largeFont = Math.ceil(appWidth * TEXT_SIZES.CONTROL_TEXT * scale);
  const smallFont = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT * scale);
  const divFont = Math.ceil(appWidth * TEXT_SIZES.DIV_SYMBOL * scale);
  const colWidth = Math.floor(svgSize / 3);

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

  // Shift the panel upward by half the control row height so the whole assembly
  // (SVG + controls) is vertically balanced around the pizza center, keeping
  // controls from falling off the bottom of the screen.
  // Rotation column is tallest: largeFont + smallFont label + input + smallFont step-ratio row + 3 gaps.
  const controlRowH = largeFont + 2 * smallFont + CONTROL_INPUT_HEIGHT + 3 * CONTROL_COLUMN_GAP;

  return (
    <div
      style={{
        position: 'absolute',
        left: Math.round(screenCenterX - cx),
        top: Math.round(screenCenterY - cy - controlRowH / 2),
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
            appWidth={appWidth * scale}
            syncWithOther={syncWithOther}
            onDotToggle={onDotToggle}
          />
        </g>
      </svg>

      <div style={{ display: 'flex', width: svgSize }}>
        <LabeledSlider
          color={color} colWidth={colWidth} largeFont={largeFont} smallFont={smallFont}
          value={config.slices}
          sliderMin={SLICES_MIN} sliderMax={SLICES_MAX} sliderColor={COLOR_STRINGS.GREY}
          ariaLabel="Slices"
          largeLabel={config.slices}
          smallLabel={`steps (1/${stepNoteValue.toFixed(3)} note)`}
          onChange={onSlicesChange}
        />
        <LabeledSlider
          color={color} colWidth={colWidth} largeFont={largeFont} smallFont={smallFont}
          value={config.teeth}
          sliderMin={SLICES_MIN} sliderMax={TEETH_MAX} sliderColor={COLOR_STRINGS.WHITE}
          ariaLabel="Teeth"
          largeLabel={<>{config.teeth} <span style={{ fontSize: divFont }}>÷</span></>}
          smallLabel={`time units (${timeUnit.toFixed(3)} s)`}
          onChange={onTeethChange}
        />
        <LabeledSlider
          color={color} colWidth={colWidth} largeFont={largeFont} smallFont={smallFont}
          value={config.rotation}
          sliderMin={0} sliderMax={ROTATION_MAX} sliderColor={`rgb(${r},${g},${b})`}
          ariaLabel="Rotation"
          largeLabel={config.rotation}
          smallLabel="step rotations"
          extra={
            <div style={{ display: 'flex', gap: 4 }}>
              <span style={{ fontFamily: 'Lekton', fontSize: smallFont, color, whiteSpace: 'nowrap' }}>step</span>
              <span style={{ fontFamily: 'Lekton', fontSize: smallFont, color: COLOR_STRINGS.GREY, whiteSpace: 'nowrap' }}>= {(otherStepNoteValue / stepNoteValue || 1).toFixed(3)} x</span>
              <span style={{ fontFamily: 'Lekton', fontSize: smallFont, color: `rgba(${or},${og},${ob},0.67)`, whiteSpace: 'nowrap' }}>step</span>
            </div>
          }
          onChange={onRotationChange}
        />
      </div>
    </div>
  );
}
