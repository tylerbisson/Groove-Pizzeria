/**
 * PizzaFaceSVG
 *
 * Renders one pizza sequencer face as an SVG group: circular outline,
 * spokes per step, active-beat polygons (one per ring), step dots, gear
 * teeth, and the animated playhead.
 *
 * Dots are keyboard-accessible via roving tabindex: Tab enters the pizza at
 * the last focused dot (or dot 0), arrow keys navigate, Space/Enter toggles.
 *
 * Props: pizza, pizzaIdx, geometry, steps, appWidth, syncWithOther, onDotToggle
 */
import { useState, useRef } from 'react';
import { pointRadial, line as d3Line } from 'd3';
import PizzaSequencer from '../PizzaSequencer';
import type { PizzaSteps, PizzaGeometry } from '../types';
import {
  COLORS,
  COLOR_STRINGS,
  PIZZA_BUTTON_SIZE_RATIO,
  PIZZA_BUTTON_POSITIONS,
  PIZZA_TEETH_OFFSET_RATIO,
  TEXT_SIZES,
} from '../config';

const DEG = Math.PI / 180;
// Polar-to-cartesian: angle in degrees where 0/360 = 12 o'clock, clockwise positive.
// Delegates to d3.pointRadial which applies the -π/2 offset internally.
const pt = (angleDeg: number, r: number): [number, number] => pointRadial(angleDeg * DEG, r);

const lineGen = d3Line<[number, number]>();

const RING_NAMES = ['inner', 'middle', 'outer'] as const;
const NUM_RINGS = PIZZA_BUTTON_POSITIONS.length;

interface PizzaFaceSVGProps {
  pizza: PizzaSequencer;
  pizzaIdx: number;
  geometry: PizzaGeometry;
  steps: PizzaSteps;
  appWidth: number;
  syncWithOther: boolean;
  onDotToggle: (ringIdx: number, stepIdx: number) => void;
}

export default function PizzaFaceSVG({
  pizza,
  pizzaIdx,
  geometry,
  steps,
  appWidth,
  syncWithOther,
  onDotToggle,
}: PizzaFaceSVGProps) {
  const { stepAngles, numTeeth, color, stepAngle } = pizza;
  const { position, diameter } = geometry;
  const [r, g, b] = color;
  const toothOffset = diameter * PIZZA_TEETH_OFFSET_RATIO;
  const buttonR = (diameter * PIZZA_BUTTON_SIZE_RATIO) / 2;
  const playheadStroke = Math.ceil(appWidth * TEXT_SIZES.PLAYHEAD_STROKE);

  const activeColor = `rgba(${r},${g},${b},1)`;
  const shapeFill = `rgba(${r},${g},${b},0.15)`;
  const shapeStroke = `rgba(${r},${g},${b},0.4)`;

  // Roving tabindex: activeDot = [ringIdx, stepIdx] of the dot that holds tabIndex=0.
  const [activeDot, setActiveDot] = useState<[number, number]>([0, 0]);
  // isFocused drives the visible focus ring; deferred via blurTimerRef to avoid
  // flickering when arrow keys move focus from one dot to the next.
  const [isFocused, setIsFocused] = useState(false);
  const dotRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusDot = (ringIdx: number, stepIdx: number) => {
    setActiveDot([ringIdx, stepIdx]);
    dotRefs.current.get(`${ringIdx}-${stepIdx}`)?.focus();
  };

  const handleDotKeyDown = (e: React.KeyboardEvent, ringIdx: number, stepIdx: number) => {
    const numSteps = stepAngles.length;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusDot(ringIdx, (stepIdx + 1) % numSteps);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusDot(ringIdx, (stepIdx - 1 + numSteps) % numSteps);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusDot((ringIdx - 1 + NUM_RINGS) % NUM_RINGS, stepIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusDot((ringIdx + 1) % NUM_RINGS, stepIdx);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onDotToggle(ringIdx, stepIdx);
    }
  };

  const handleDotFocus = (ringIdx: number, stepIdx: number) => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    setActiveDot([ringIdx, stepIdx]);
    setIsFocused(true);
  };

  const handleDotBlur = () => {
    blurTimerRef.current = setTimeout(() => setIsFocused(false), 0);
  };

  const [activeRing, activeStep] = activeDot;
  const focusedAngle = stepAngles[activeStep];
  const focusedRadius = PIZZA_BUTTON_POSITIONS[activeRing] * diameter;
  const [focusCx, focusCy] = isFocused && focusedAngle !== undefined ? pt(focusedAngle, focusedRadius) : [0, 0];

  return (
    <g transform={`translate(${position.x},${position.y})`} style={{ cursor: 'pointer' }}>
      {/* Face outline — decorative */}
      <circle r={diameter} fill="none" stroke="white" strokeWidth={1} aria-hidden="true" />

      {/* Spokes — decorative */}
      <g aria-hidden="true">
        {stepAngles.map((angle, i) => {
          const [x2, y2] = pt(angle, diameter);
          const isSyncSpoke = i === 0 && syncWithOther;
          return (
            <line
              key={`spoke-${i}`}
              x1={0}
              y1={0}
              x2={x2}
              y2={y2}
              stroke={
                isSyncSpoke
                  ? COLOR_STRINGS.SYNC_SPOKE
                  : `rgb(${COLORS.MEDIUM_GREY},${COLORS.MEDIUM_GREY},${COLORS.MEDIUM_GREY})`
              }
              strokeWidth={isSyncSpoke ? 3 : 1}
            />
          );
        })}
      </g>

      {/* Active-step shapes — one closed path per ring, decorative */}
      <g aria-hidden="true">
        {[0, 1, 2].map((ringIdx) => {
          const pts = stepAngles
            .map((angle, stepIdx): [number, number] | null =>
              steps[ringIdx][stepIdx]
                ? pt(angle, PIZZA_BUTTON_POSITIONS[ringIdx] * diameter)
                : null
            )
            .filter((p): p is [number, number] => p !== null);
          if (pts.length < 2) return null;
          const d = lineGen(pts);
          if (!d) return null;
          return (
            <path
              key={`shape-${ringIdx}`}
              d={d + 'Z'}
              fill={shapeFill}
              stroke={shapeStroke}
              strokeWidth={1}
            />
          );
        })}
      </g>

      {/* Step dots — interactive, keyboard-accessible via roving tabindex */}
      {stepAngles.map((angle, stepIdx) =>
        PIZZA_BUTTON_POSITIONS.map((pos, ringIdx) => {
          const [cx, cy] = pt(angle, pos * diameter);
          const isActive = steps[ringIdx][stepIdx];
          const isActiveTab = activeRing === ringIdx && activeStep === stepIdx;
          return (
            <circle
              key={`dot-${stepIdx}-${ringIdx}`}
              ref={(el) => {
                const key = `${ringIdx}-${stepIdx}`;
                if (el) dotRefs.current.set(key, el);
                else dotRefs.current.delete(key);
              }}
              cx={cx}
              cy={cy}
              r={buttonR}
              fill={isActive ? 'black' : `rgb(${COLORS.GREY},${COLORS.GREY},${COLORS.GREY})`}
              stroke="none"
              role="checkbox"
              aria-checked={isActive}
              aria-label={`Pizza ${pizzaIdx + 1} ${RING_NAMES[ringIdx]} ring step ${stepIdx + 1}`}
              tabIndex={isActiveTab ? 0 : -1}
              style={{ cursor: 'pointer' }}
              onKeyDown={(e) => handleDotKeyDown(e, ringIdx, stepIdx)}
              onFocus={() => handleDotFocus(ringIdx, stepIdx)}
              onBlur={handleDotBlur}
            />
          );
        })
      )}

      {/* Teeth — decorative */}
      <g aria-hidden="true">
        {Array.from({ length: numTeeth }, (_, i) => {
          const angle = (360 / numTeeth) * i;
          const [x1, y1] = pt(angle, diameter);
          const [x2, y2] = pt(angle, diameter + toothOffset);
          return (
            <line
              key={`tooth-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth={2}
            />
          );
        })}
      </g>

      {/* Playhead — decorative */}
      <line
        aria-hidden="true"
        x1={pt(stepAngle, diameter)[0]}
        y1={pt(stepAngle, diameter)[1]}
        x2={pt(stepAngle, diameter + toothOffset)[0]}
        y2={pt(stepAngle, diameter + toothOffset)[1]}
        stroke={activeColor}
        strokeWidth={playheadStroke}
        strokeLinecap="round"
      />

      {/* Keyboard focus ring — rendered last so it sits above all other elements */}
      {isFocused && (
        <circle
          cx={focusCx}
          cy={focusCy}
          r={buttonR + 4}
          fill="none"
          stroke="white"
          strokeWidth={2}
          pointerEvents="none"
          aria-hidden="true"
        />
      )}
    </g>
  );
}
