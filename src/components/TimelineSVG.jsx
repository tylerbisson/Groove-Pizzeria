/**
 * TimelineSVG
 *
 * Renders the horizontal sync timeline strip for one pizza sequencer.
 * Each tick represents one tooth position across all loop repetitions;
 * loop boundaries are emphasized with a brighter stroke. The moving
 * playhead tracks the sequencer's current loop progress.
 *
 * When showPatternInfo is true, also renders the total pattern length
 * label (intended for the first/top pizza only).
 *
 * Props: pizza, lcm, appWidth, appHeight, showPatternInfo
 */
import React from 'react';
import { TEXT_SIZES, TIMELINE_POSITIONS, SPACING } from '../config';

export default function TimelineSVG({ pizza, lcm, appWidth, appHeight, showPatternInfo = false }) {
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

      {playheadX != null && (
        <line
          x1={playheadX} y1={baseY}
          x2={playheadX} y2={baseY + lineH}
          stroke="black"
          strokeWidth={6}
        />
      )}

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
}
