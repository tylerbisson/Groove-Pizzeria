import React from 'react';
import { cosDeg, sinDeg } from '../pizzaFace';
import {
  CLICK_THRESHOLD,
  COLORS,
  PIZZA_BUTTON_SIZE_RATIO,
  PIZZA_TEETH_OFFSET_RATIO,
  TEXT_SIZES,
  TIMELINE_POSITIONS,
} from '../config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Computes the slider anchor positions (in translated SVG g space) that the
// original p5 code used for slider DOM placement and control-text rendering.
// All pizzas share the same y_pos ratio (-0.368), so y anchors are constant.
export function computeSliderAnchors(pizzaXRatio, appWidth, appHeight) {
  const slidersX    = (pizzaXRatio + 0.265 - 0.5) * appWidth;
  const rotateX     = (pizzaXRatio + 0.617 - 0.5) * appWidth;
  const sliceY      = 0.961 * appHeight - 0.5 * appWidth;
  const toothY      = 0.887 * appHeight - 0.5 * appWidth;
  const rotateY     = 0.951 * appHeight - 0.5 * appWidth;
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
  const lgSize = Math.ceil(appWidth * TEXT_SIZES.CONTROL_TEXT);     // 0.0269
  const smSize = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT);     // 0.0134
  const divSize = Math.ceil(appWidth * 0.016);
  const ow = appWidth;  // shorthand

  const { slidersX, rotateX, sliceY, toothY, rotateY } = anchors;
  const stepFrac = pizza.stepFrac?.toFixed(3) ?? '?';

  return (
    <g fill={fill} stroke="none">
      {/* Slice count */}
      <text x={slidersX - ow*0.031} y={sliceY - ow*0.003} fontSize={lgSize}>{pizza.slices}</text>
      <text x={slidersX}            y={sliceY - ow*0.006}  fontSize={smSize}>steps (1/{stepFrac} note)</text>

      {/* Tooth count */}
      <text x={slidersX - ow*0.031} y={toothY - ow*0.003}     fontSize={lgSize}>{pizza.numTeeth}</text>
      <text x={slidersX - ow*0.0303} y={toothY + appHeight*0.022} fontSize={divSize}>÷</text>
      <text x={slidersX}             y={toothY - ow*0.006}     fontSize={smSize}>
        time units ({timeUnit?.toFixed(3)} s)
      </text>

      {/* Rotation count */}
      <text x={rotateX - ow*0.031}  y={rotateY - ow*0.003}  fontSize={lgSize}>{pizza.rotation ?? 0}</text>
      <text x={rotateX}             y={rotateY - ow*0.006}   fontSize={smSize}>step rotations</text>
      <text x={rotateX - ow*0.190}  y={rotateY}              fontSize={smSize}>step</text>
    </g>
  );
};

// ---------------------------------------------------------------------------
// BPM text (drawn in translated g, matching original drawBPM())
// ---------------------------------------------------------------------------
export const BPMTextSVG = ({ bpm, appWidth, appHeight }) => {
  const bpmSliderXpos = 0.889 * appWidth;
  const bpmSliderYpos = 0.015 * appHeight;
  const trans = appWidth / 2;
  const x = bpmSliderXpos - trans;
  const y = bpmSliderYpos - (trans - appHeight * 0.075);
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

  const ratio  = (pizza2.stepFrac / pizza1.stepFrac) || 1;
  const ratio2 = (pizza1.stepFrac / pizza2.stepFrac) || 1;

  return (
    <g stroke="none">
      {/* Pizza1 step ratio */}
      <text x={anchors1.rotateX - ow*0.156} y={anchors1.rotateY} fontSize={sm} fill={grey}>
        = {ratio.toFixed(3)} x
      </text>
      <text x={anchors1.rotateX - ow*0.085} y={anchors1.rotateY} fontSize={sm} fill={`rgba(${r2},${g2},${b2},0.67)`}>
        step
      </text>

      {/* Pizza2 step ratio */}
      <text x={anchors2.rotateX - ow*0.156} y={anchors2.rotateY} fontSize={sm} fill={grey}>
        = {ratio2.toFixed(3)} x
      </text>
      <text x={anchors2.rotateX - ow*0.085} y={anchors2.rotateY} fontSize={sm} fill={`rgba(${r1},${g1},${b1},0.67)`}>
        step
      </text>
    </g>
  );
};

// ---------------------------------------------------------------------------
// PizzaFaceSVG
// Renders one pizza face as SVG elements inside the global translated g.
// ---------------------------------------------------------------------------
const PizzaFaceSVG = ({ pizza, appWidth, appHeight, syncWithOther }) => {
  const { position, stepAngles, stepColorArr, numTeeth, color, stepAngle } = pizza;
  // Use pizza.diameter (dynamically scaled by tooth count) so the pizza grows/shrinks
  // as the user moves the time-units slider, matching the original behaviour.
  const pizzaDiam = pizza.diameter;
  const [r, g, b] = color;
  const toothOffset = pizzaDiam * PIZZA_TEETH_OFFSET_RATIO;
  const buttonR = (pizzaDiam * PIZZA_BUTTON_SIZE_RATIO) / 2;
  const playheadStroke = Math.ceil(appWidth * TEXT_SIZES.PLAYHEAD_STROKE);

  const activeColor = `rgba(${r},${g},${b},1)`;
  const shapeFill   = `rgba(${r},${g},${b},0.15)`;
  const shapeStroke = `rgba(${r},${g},${b},0.4)`;

  // Group-level click: convert client coords to pizza-local SVG coords,
  // then find the nearest dot and toggle it. Mirrors the original p5 nearest-dot
  // detection while keeping each dot a real focusable SVG element.
  const handleGroupClick = (e) => {
    const g = e.currentTarget;
    const pt = g.ownerSVGElement.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const local = pt.matrixTransform(g.getScreenCTM().inverse());

    let minDist = Infinity;
    let closestRing = -1, closestStep = -1;
    stepAngles.forEach((angle, stepIdx) => {
      pizza.buttonPosArr.forEach((pos, ringIdx) => {
        const cx = pos * pizzaDiam * cosDeg(angle - 90);
        const cy = pos * pizzaDiam * sinDeg(angle - 90);
        const dist = Math.sqrt((local.x - cx) ** 2 + (local.y - cy) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closestRing = ringIdx;
          closestStep = stepIdx;
        }
      });
    });

    if (minDist <= pizzaDiam * CLICK_THRESHOLD && closestRing >= 0) {
      onToggleStep(closestRing, closestStep);
    }
  };

  return (
    <g transform={`translate(${position.x},${position.y})`}
       onClick={handleGroupClick}
       style={{ cursor: 'pointer' }}>

      {/* Face outline */}
      <circle r={pizzaDiam} fill="none" stroke="white" strokeWidth={1} />

      {/* Spokes */}
      {stepAngles.map((angle, i) => {
        const isSyncSpoke = i === 0 && syncWithOther;
        return (
          <line
            key={`spoke-${i}`}
            x1={0} y1={0}
            x2={pizzaDiam * cosDeg(angle - 90)}
            y2={pizzaDiam * sinDeg(angle - 90)}
            stroke={isSyncSpoke ? 'rgb(120,120,120)' : 'rgb(195,195,195)'}
            strokeWidth={isSyncSpoke ? 3 : 1}
          />
        );
      })}

      {/* Active-step shapes — one polygon per ring */}
      {[0, 1, 2].map((ringIdx) => {
        const points = stepAngles
          .map((angle, stepIdx) => {
            if (stepColorArr[ringIdx][stepIdx] !== 0) return null;
            return `${pizza.buttonPosArr[ringIdx] * pizzaDiam * cosDeg(angle - 90)},${pizza.buttonPosArr[ringIdx] * pizzaDiam * sinDeg(angle - 90)}`;
          })
          .filter(Boolean);
        if (points.length < 2) return null;
        return (
          <polygon
            key={`shape-${ringIdx}`}
            points={points.join(' ')}
            fill={shapeFill}
            stroke={shapeStroke}
            strokeWidth={1}
          />
        );
      })}

      {/* Step dots — real SVG elements (support future keyboard nav via tabIndex/role) */}
      {stepAngles.map((angle, stepIdx) =>
        pizza.buttonPosArr.map((pos, ringIdx) => {
          const cx = pos * pizzaDiam * cosDeg(angle - 90);
          const cy = pos * pizzaDiam * sinDeg(angle - 90);
          const isActive = stepColorArr[ringIdx][stepIdx] === 0;
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
        const angle = (360 / numTeeth) * i - 90;
        return (
          <line
            key={`tooth-${i}`}
            x1={pizzaDiam * cosDeg(angle)}
            y1={pizzaDiam * sinDeg(angle)}
            x2={(pizzaDiam + toothOffset) * cosDeg(angle)}
            y2={(pizzaDiam + toothOffset) * sinDeg(angle)}
            stroke="white"
            strokeWidth={2}
          />
        );
      })}

      {/* Playhead — round linecap gives the pill/tic-tac shape */}
      <line
        x1={pizzaDiam * cosDeg(stepAngle)}
        y1={pizzaDiam * sinDeg(stepAngle)}
        x2={(pizzaDiam + toothOffset) * cosDeg(stepAngle)}
        y2={(pizzaDiam + toothOffset) * sinDeg(stepAngle)}
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
  const tmlnIdx   = pizza.tmlnItrtr;
  const playheadX = pizza.tmlnPlyHdArrX?.[tmlnIdx];
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
          <text x={totalX + appWidth*0.055} y={baseY + appHeight*0.031}
            fill="rgb(170,170,170)" fontSize={textLg} stroke="none">
            {lcm} time unit
          </text>
          <text x={totalX + appWidth*0.055} y={baseY + appHeight*0.058}
            fill="rgb(170,170,170)" fontSize={textLg} stroke="none">
            pattern ({(lcm * (pizza.loopTime / pizza.numTeeth))?.toFixed(1)} s)
          </text>
        </>
      )}
    </g>
  );
};

export default PizzaFaceSVG;
