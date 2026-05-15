/**
 * PizzaFaceSVG
 *
 * Renders one pizza sequencer face as an SVG group: circular outline,
 * spokes per step, active-beat polygons (one per ring), step dots, gear
 * teeth, and the animated playhead. Positioned by pizza.position in the
 * parent translated <g>.
 *
 * Props: pizza, steps, appWidth, syncWithOther
 */
import { pointRadial, line as d3Line } from 'd3';
import PizzaSequencer from '../PizzaSequencer';
import type { PizzaSteps } from '../types';
import { COLORS, PIZZA_BUTTON_SIZE_RATIO, PIZZA_TEETH_OFFSET_RATIO, TEXT_SIZES } from '../config';

const DEG = Math.PI / 180;
// Polar-to-cartesian: angle in degrees where 0/360 = 12 o'clock, clockwise positive.
// Delegates to d3.pointRadial which applies the -π/2 offset internally.
const pt = (angleDeg: number, r: number): [number, number] => pointRadial(angleDeg * DEG, r);

const lineGen = d3Line<[number, number]>();

interface PizzaFaceSVGProps {
  pizza: PizzaSequencer;
  steps: PizzaSteps;
  appWidth: number;
  syncWithOther: boolean;
}

export default function PizzaFaceSVG({ pizza, steps, appWidth, syncWithOther }: PizzaFaceSVGProps) {
  const { position, stepAngles, numTeeth, color, stepAngle } = pizza;
  const pizzaDiam = pizza.diameter;
  const [r, g, b] = color;
  const toothOffset = pizzaDiam * PIZZA_TEETH_OFFSET_RATIO;
  const buttonR = (pizzaDiam * PIZZA_BUTTON_SIZE_RATIO) / 2;
  const playheadStroke = Math.ceil(appWidth * TEXT_SIZES.PLAYHEAD_STROKE);

  const activeColor = `rgba(${r},${g},${b},1)`;
  const shapeFill = `rgba(${r},${g},${b},0.15)`;
  const shapeStroke = `rgba(${r},${g},${b},0.4)`;

  return (
    <g transform={`translate(${position.x},${position.y})`} style={{ cursor: 'pointer' }}>
      {/* Face outline */}
      <circle r={pizzaDiam} fill="none" stroke="white" strokeWidth={1} />

      {/* Spokes */}
      {stepAngles.map((angle, i) => {
        const [x2, y2] = pt(angle, pizzaDiam);
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
                ? 'rgb(120,120,120)'
                : `rgb(${COLORS.MEDIUM_GREY},${COLORS.MEDIUM_GREY},${COLORS.MEDIUM_GREY})`
            }
            strokeWidth={isSyncSpoke ? 3 : 1}
          />
        );
      })}

      {/* Active-step shapes — one closed path per ring */}
      {[0, 1, 2].map((ringIdx) => {
        const pts = stepAngles
          .map((angle, stepIdx): [number, number] | null =>
            steps[ringIdx][stepIdx]
              ? pt(angle, pizza.buttonPosArr[ringIdx] * pizzaDiam)
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

      {/* Step dots */}
      {stepAngles.map((angle, stepIdx) =>
        pizza.buttonPosArr.map((pos, ringIdx) => {
          const [cx, cy] = pt(angle, pos * pizzaDiam);
          const isActive = steps[ringIdx][stepIdx];
          return (
            <circle
              key={`dot-${stepIdx}-${ringIdx}`}
              cx={cx}
              cy={cy}
              r={buttonR}
              fill={isActive ? 'black' : `rgb(${COLORS.GREY},${COLORS.GREY},${COLORS.GREY})`}
              stroke="none"
              style={{ cursor: 'pointer' }}
            />
          );
        })
      )}

      {/* Teeth */}
      {Array.from({ length: numTeeth }, (_, i) => {
        const angle = (360 / numTeeth) * i;
        const [x1, y1] = pt(angle, pizzaDiam);
        const [x2, y2] = pt(angle, pizzaDiam + toothOffset);
        return (
          <line key={`tooth-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={2} />
        );
      })}

      {/* Playhead — round linecap gives the pill/tic-tac shape */}
      <line
        x1={pt(stepAngle, pizzaDiam)[0]}
        y1={pt(stepAngle, pizzaDiam)[1]}
        x2={pt(stepAngle, pizzaDiam + toothOffset)[0]}
        y2={pt(stepAngle, pizzaDiam + toothOffset)[1]}
        stroke={activeColor}
        strokeWidth={playheadStroke}
        strokeLinecap="round"
      />
    </g>
  );
}
