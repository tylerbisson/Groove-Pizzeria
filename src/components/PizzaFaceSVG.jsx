import React from 'react';
import { pointRadial, line as d3Line } from 'd3';
import {
  COLORS,
  PIZZA_BUTTON_SIZE_RATIO,
  PIZZA_TEETH_OFFSET_RATIO,
  TEXT_SIZES,
  SPACING,
  TIMELINE_POSITIONS,
  SLIDER_ANCHORS,
  BPM_SLIDER_X_RATIO,
  BPM_SLIDER_Y_RATIO,
  BPM_TEXT_Y_RATIO,
} from '../config';

const DEG = Math.PI / 180;
// Polar-to-cartesian: angle in degrees where 0/360 = 12 o'clock, clockwise positive.
// Delegates to d3.pointRadial which applies the -π/2 offset internally.
const pt = (angleDeg, r) => pointRadial(angleDeg * DEG, r);

// Reusable D3 straight-line path generator (no curve interpolation).
const lineGen = d3Line();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Computes the slider anchor positions (in translated SVG g space) that the
// original p5 code used for slider DOM placement and control-text rendering.
// All pizzas share the same y_pos ratio (-0.368), so y anchors are constant.
export function computeSliderAnchors(pizzaXRatio, appWidth, appHeight) {
  const slidersX = (pizzaXRatio + SLIDER_ANCHORS.SLIDERS_X_OFFSET - 0.5) * appWidth;
  const rotateX  = (pizzaXRatio + SLIDER_ANCHORS.ROTATE_X_OFFSET  - 0.5) * appWidth;
  const sliceY   = SLIDER_ANCHORS.SLICE_Y_RATIO  * appHeight - 0.5 * appWidth;
  const toothY   = SLIDER_ANCHORS.TOOTH_Y_RATIO  * appHeight - 0.5 * appWidth;
  const rotateY  = SLIDER_ANCHORS.ROTATE_Y_RATIO * appHeight - 0.5 * appWidth;
  return { slidersX, rotateX, sliceY, toothY, rotateY };
}

// ---------------------------------------------------------------------------
// ControlTextSVG
// Renders the per-pizza stat labels in the translated SVG g, positioned
// exactly like the original showControlText() / p.text() calls.
// ---------------------------------------------------------------------------
export const ControlTextSVG = ({ pizza, anchors, timeUnit, appWidth, appHeight }) => {
  const [r, g, b] = pizza.color;
  const alpha = COLORS.TEXT_ALPHA;
  const fill = `rgba(${r},${g},${b},${alpha / 255})`;
  const lgSize  = Math.ceil(appWidth * TEXT_SIZES.CONTROL_TEXT);
  const smSize  = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT);
  const divSize = Math.ceil(appWidth * TEXT_SIZES.DIV_SYMBOL);
  const ow = appWidth;

  const { slidersX, rotateX, sliceY, toothY, rotateY } = anchors;
  const stepNoteValue = pizza.stepNoteValue?.toFixed(3) ?? '?';

  return (
    <g fill={fill} stroke="none">
      {/* Slice count */}
      <text x={slidersX - ow*SPACING.CONTROL_TEXT_OFFSET_X} y={sliceY - ow*SPACING.CONTROL_TEXT_OFFSET_Y}  fontSize={lgSize}>{pizza.slices}</text>
      <text x={slidersX}                                     y={sliceY - ow*SPACING.CONTROL_TEXT_SMALL_Y_OFFSET} fontSize={smSize}>steps (1/{stepNoteValue} note)</text>

      {/* Tooth count */}
      <text x={slidersX - ow*SPACING.CONTROL_TEXT_OFFSET_X}  y={toothY - ow*SPACING.CONTROL_TEXT_OFFSET_Y}      fontSize={lgSize}>{pizza.numTeeth}</text>
      <text x={slidersX - ow*SPACING.DIV_SYMBOL_X_OFFSET}    y={toothY + appHeight*SPACING.DIV_SYMBOL_Y_OFFSET}  fontSize={divSize}>÷</text>
      <text x={slidersX}                                      y={toothY - ow*SPACING.CONTROL_TEXT_SMALL_Y_OFFSET} fontSize={smSize}>
        time units ({timeUnit?.toFixed(3)} s)
      </text>

      {/* Rotation count */}
      <text x={rotateX - ow*SPACING.CONTROL_TEXT_OFFSET_X}    y={rotateY - ow*SPACING.CONTROL_TEXT_OFFSET_Y}      fontSize={lgSize}>{pizza.rotation ?? 0}</text>
      <text x={rotateX}                                        y={rotateY - ow*SPACING.CONTROL_TEXT_SMALL_Y_OFFSET} fontSize={smSize}>step rotations</text>
      <text x={rotateX - ow*SPACING.ROTATION_LABEL_X_OFFSET}  y={rotateY}                                          fontSize={smSize}>step</text>
    </g>
  );
};

// ---------------------------------------------------------------------------
// BPM text (drawn in translated g, matching original drawBPM())
// ---------------------------------------------------------------------------
export const BPMTextSVG = ({ bpm, appWidth, appHeight }) => {
  const bpmSliderXpos = BPM_SLIDER_X_RATIO * appWidth;
  const bpmSliderYpos = BPM_SLIDER_Y_RATIO * appHeight;
  const trans = appWidth / 2;
  const x = bpmSliderXpos - trans;
  const y = bpmSliderYpos - (trans - appHeight * BPM_TEXT_Y_RATIO);
  return (
    <text
      x={x} y={y}
      fill="rgb(170,170,170)"
      fontSize={Math.ceil(appWidth * TEXT_SIZES.CONTROL_TEXT)}
      stroke="none"
    >
      {bpm} bpm
    </text>
  );
};

// ---------------------------------------------------------------------------
// Step ratio text (drawn in translated g between the two pizza areas)
// ---------------------------------------------------------------------------
export const StepRatioSVG = ({ pizza1, pizza2, anchors1, anchors2, appWidth }) => {
  const [r1, g1, b1] = pizza1.color;
  const [r2, g2, b2] = pizza2.color;
  const grey = 'rgb(170,170,170)';
  const sm = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT);
  const ow = appWidth;

  const ratio  = (pizza2.stepNoteValue / pizza1.stepNoteValue) || 1;
  const ratio2 = (pizza1.stepNoteValue / pizza2.stepNoteValue) || 1;

  return (
    <g stroke="none">
      {/* Pizza1 step ratio */}
      <text x={anchors1.rotateX - ow*SPACING.STEP_RATIO_X_OFFSET} y={anchors1.rotateY} fontSize={sm} fill={grey}>
        = {ratio.toFixed(3)} x
      </text>
      <text x={anchors1.rotateX - ow*SPACING.STEP_TEXT_X_OFFSET}  y={anchors1.rotateY} fontSize={sm} fill={`rgba(${r2},${g2},${b2},0.67)`}>
        step
      </text>

      {/* Pizza2 step ratio */}
      <text x={anchors2.rotateX - ow*SPACING.STEP_RATIO_X_OFFSET} y={anchors2.rotateY} fontSize={sm} fill={grey}>
        = {ratio2.toFixed(3)} x
      </text>
      <text x={anchors2.rotateX - ow*SPACING.STEP_TEXT_X_OFFSET}  y={anchors2.rotateY} fontSize={sm} fill={`rgba(${r1},${g1},${b1},0.67)`}>
        step
      </text>
    </g>
  );
};

// ---------------------------------------------------------------------------
// PizzaFaceSVG
// Renders one pizza face as SVG elements inside the global translated g.
// steps: Array(3) of Array(slices) — 0 = active beat, COLORS.GREY = inactive
// ---------------------------------------------------------------------------
const PizzaFaceSVG = ({ pizza, steps, appWidth, appHeight, syncWithOther }) => {
  const { position, stepAngles, numTeeth, color, stepAngle } = pizza;
  const pizzaDiam = pizza.diameter;
  const [r, g, b] = color;
  const toothOffset = pizzaDiam * PIZZA_TEETH_OFFSET_RATIO;
  const buttonR = (pizzaDiam * PIZZA_BUTTON_SIZE_RATIO) / 2;
  const playheadStroke = Math.ceil(appWidth * TEXT_SIZES.PLAYHEAD_STROKE);

  const activeColor = `rgba(${r},${g},${b},1)`;
  const shapeFill   = `rgba(${r},${g},${b},0.15)`;
  const shapeStroke = `rgba(${r},${g},${b},0.4)`;

  return (
    <g transform={`translate(${position.x},${position.y})`}
       style={{ cursor: 'pointer' }}>

      {/* Face outline */}
      <circle r={pizzaDiam} fill="none" stroke="white" strokeWidth={1} />

      {/* Spokes */}
      {stepAngles.map((angle, i) => {
        const [x2, y2] = pt(angle, pizzaDiam);
        const isSyncSpoke = i === 0 && syncWithOther;
        return (
          <line
            key={`spoke-${i}`}
            x1={0} y1={0}
            x2={x2} y2={y2}
            stroke={isSyncSpoke ? 'rgb(120,120,120)' : 'rgb(195,195,195)'}
            strokeWidth={isSyncSpoke ? 3 : 1}
          />
        );
      })}

      {/* Active-step shapes — one closed path per ring, generated by d3.line */}
      {[0, 1, 2].map((ringIdx) => {
        const pts = stepAngles
          .map((angle, stepIdx) =>
            steps[ringIdx][stepIdx] !== 0
              ? null
              : pt(angle, pizza.buttonPosArr[ringIdx] * pizzaDiam)
          )
          .filter(Boolean);
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
          const isActive = steps[ringIdx][stepIdx] === 0;
          return (
            <circle
              key={`dot-${stepIdx}-${ringIdx}`}
              cx={cx} cy={cy}
              r={buttonR}
              fill={isActive ? 'black' : 'rgb(170,170,170)'}
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
          <line
            key={`tooth-${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="white"
            strokeWidth={2}
          />
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
};

// ---------------------------------------------------------------------------
// TimelineSVG
// ---------------------------------------------------------------------------
export const TimelineSVG = ({ pizza, lcm, appWidth, appHeight, showPatternInfo = false }) => {
  const [r, g, b] = pizza.color;
  const nub    = appWidth * TEXT_SIZES.TIMELINE_NUB;
  const lineH  = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_LINE_HEIGHT);
  const textSm = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT);
  const textLg = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT_LARGE);
  const loopRpts = Math.round(lcm / pizza.numTeeth);

  const ticks = [];
  let bump = 0;
  for (let j = 0; j < loopRpts; j++) {
    for (let i = 0; i < pizza.numTeeth; i++) {
      const x = TIMELINE_POSITIONS.LINE_X_RATIO * appWidth + bump;
      const y = pizza.timeLineYPos ?? 0;
      ticks.push({ x, y, isLoopStart: i === 0, loopIdx: j });
      bump += nub;
    }
  }

  const totalX    = TIMELINE_POSITIONS.LOOP_LENGTH_X_RATIO * appWidth + bump;
  const tmlnIdx   = pizza.timelineIndex;
  const playheadX = pizza.timelinePlayheadX?.[tmlnIdx];
  const baseY     = pizza.timeLineYPos ?? 0;

  const loopLabel = loopRpts === 1
    ? `1 loop (${pizza.loopTime?.toFixed(1)} s)`
    : `${loopRpts} loops (${pizza.loopTime?.toFixed(1)} s)`;

  return (
    <g>
      {ticks.map(({ x, y, isLoopStart }, idx) => (
        <line
          key={idx}
          x1={x} y1={y}
          x2={x} y2={y + lineH}
          stroke={isLoopStart ? `rgba(${r},${g},${b},0.8)` : `rgba(${r},${g},${b},0.35)`}
          strokeWidth={2}
        />
      ))}

      {/* Loop label at last loop start */}
      {loopRpts > 0 && (
        <text
          x={ticks.find(t => t.loopIdx === loopRpts - 1 && t.isLoopStart)?.x ?? 0}
          y={baseY + lineH + textSm}
          fill={`rgba(${r},${g},${b},0.9)`}
          fontSize={textSm}
          stroke="none"
        >
          {loopLabel}
        </text>
      )}

      {/* Moving timeline playhead */}
      {playheadX != null && (
        <line
          x1={playheadX} y1={baseY}
          x2={playheadX} y2={baseY + lineH}
          stroke="black"
          strokeWidth={6}
        />
      )}

      {/* Total pattern info — rendered once only (pizza 1) since both timelines end at the same x */}
      {showPatternInfo && (
        <>
          <text x={totalX + appWidth*SPACING.TIMELINE_TOTAL_STEPS_X_OFFSET} y={baseY + appHeight*SPACING.TIMELINE_TOTAL_STEPS_Y_OFFSET_1}
            fill="rgb(170,170,170)" fontSize={textLg} stroke="none">
            {lcm} time unit
          </text>
          <text x={totalX + appWidth*SPACING.TIMELINE_TOTAL_STEPS_X_OFFSET} y={baseY + appHeight*SPACING.TIMELINE_TOTAL_STEPS_Y_OFFSET_2}
            fill="rgb(170,170,170)" fontSize={textLg} stroke="none">
            pattern ({(lcm * (pizza.loopTime / pizza.numTeeth))?.toFixed(1)} s)
          </text>
        </>
      )}
    </g>
  );
};

export default PizzaFaceSVG;
