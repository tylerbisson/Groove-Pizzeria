/**
 * Timeline
 *
 * Renders the horizontal sync timeline strip for one pizza sequencer.
 * Each tick represents one tooth position across all loop repetitions;
 * loop boundaries are emphasized with a brighter stroke. The moving
 * playhead tracks the sequencer's current loop progress.
 *
 * When showPatternInfo is true, also renders the total pattern length
 * label (intended for the first/top pizza only).
 *
 * Props: pizza, lcm, loopTime, yPos, appWidth, appHeight, showPatternInfo
 */
import Sequencer from '../Sequencer';
import { TEXT_SIZES, TIMELINE_POSITIONS, SPACING, COLOR_STRINGS } from '../config';

const TICK_STROKE_WIDTH = 2;
const PLAYHEAD_HALF_W = 3;  // pill half-width; also used as rx for fully-rounded ends
const PLAYHEAD_OVERHANG = 2; // px above/below the tick line

interface TimelineProps {
  pizza: Sequencer;
  lcm: number;
  loopTime: number;
  yPos?: number;
  appWidth: number;
  appHeight: number;
  showPatternInfo?: boolean;
}

export default function Timeline({
  pizza,
  lcm,
  loopTime,
  yPos = 0,
  appWidth,
  appHeight,
  showPatternInfo = false,
}: TimelineProps) {
  const [r, g, b] = pizza.color;
  const textSm = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT);
  const loopRpts = Math.round(lcm / pizza.numTeeth);
  const loopLabel =
    loopRpts === 1
      ? `1 loop (${loopTime.toFixed(1)} s)`
      : `${loopRpts} loops (${loopTime.toFixed(1)} s)`;

  const nub = appWidth * TEXT_SIZES.TIMELINE_NUB;
  const lineH = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_LINE_HEIGHT);
  const textLg = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT_LARGE);

  const ticks: { x: number; y: number; isLoopStart: boolean; loopIdx: number }[] = [];
  let bump = 0;
  for (let j = 0; j < loopRpts; j++) {
    for (let i = 0; i < pizza.numTeeth; i++) {
      const x = TIMELINE_POSITIONS.LINE_X_RATIO * appWidth + bump;
      ticks.push({ x, y: yPos, isLoopStart: i === 0, loopIdx: j });
      bump += nub;
    }
  }

  const totalX = TIMELINE_POSITIONS.LOOP_LENGTH_X_RATIO * appWidth + bump;
  const tmlnIdx = pizza.timelineIndex;
  const playheadX = pizza.timelinePlayheadX[tmlnIdx];

  return (
    <g>
      {ticks.map(({ x, y, isLoopStart }, idx) => (
        <line
          key={idx}
          x1={x}
          y1={y}
          x2={x}
          y2={y + lineH}
          stroke={isLoopStart ? `rgba(${r},${g},${b},0.8)` : `rgba(${r},${g},${b},0.35)`}
          strokeWidth={TICK_STROKE_WIDTH}
        />
      ))}

      {loopRpts > 0 && (
        <text
          x={ticks.find((t) => t.loopIdx === loopRpts - 1 && t.isLoopStart)?.x ?? 0}
          y={yPos + lineH + textSm}
          fill={`rgba(${r},${g},${b},0.9)`}
          fontSize={textSm}
          stroke="none"
        >
          {loopLabel}
        </text>
      )}

      {playheadX != null && (
        <rect
          x={playheadX - PLAYHEAD_HALF_W}
          y={yPos - PLAYHEAD_OVERHANG}
          width={PLAYHEAD_HALF_W * 2}
          height={lineH + PLAYHEAD_OVERHANG * 2}
          rx={PLAYHEAD_HALF_W}
          fill="black"
        />
      )}

      {showPatternInfo && (
        <>
          <text
            x={totalX + appWidth * SPACING.TIMELINE_TOTAL_STEPS_X_OFFSET}
            y={yPos + appHeight * SPACING.TIMELINE_TOTAL_STEPS_Y_OFFSET_1}
            style={{ fill: COLOR_STRINGS.GREY }}
            fontSize={textLg}
            stroke="none"
          >
            {lcm} time unit
          </text>
          <text
            x={totalX + appWidth * SPACING.TIMELINE_TOTAL_STEPS_X_OFFSET}
            y={yPos + appHeight * SPACING.TIMELINE_TOTAL_STEPS_Y_OFFSET_2}
            style={{ fill: COLOR_STRINGS.GREY }}
            fontSize={textLg}
            stroke="none"
          >
            pattern ({(lcm * (loopTime / pizza.numTeeth)).toFixed(1)} s)
          </text>
        </>
      )}
    </g>
  );
}
