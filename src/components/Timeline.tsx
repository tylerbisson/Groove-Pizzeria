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
 * All output is in screen pixels: tick lines in a full-viewport SVG overlay,
 * text labels as absolutely-positioned HTML spans.
 */
import Sequencer from '../Sequencer';
import { TEXT_SIZES, TIMELINE_POSITIONS, COLOR_STRINGS } from '../config';

const TICK_STROKE_WIDTH = 2;
const PLAYHEAD_HALF_W = 3;  // viewBox units — scaled to px at render time
const PLAYHEAD_OVERHANG = 2; // viewBox units — scaled to px at render time

interface TimelineProps {
  pizza: Sequencer;
  lcm: number;
  yPos: number;          // viewBox-relative y (within the translate(transX,transY) group)
  appWidth: number;
  appHeight: number;
  scale: number;
  offX: number;
  offY: number;
  transX: number;
  transY: number;
  loopTime: number;
  showPatternInfo?: boolean;
}

export default function Timeline({
  pizza, lcm, yPos, appWidth, appHeight,
  scale, offX, offY, transX, transY,
  loopTime, showPatternInfo = false,
}: TimelineProps) {
  const [r, g, b] = pizza.color;
  const loopRpts = Math.round(lcm / pizza.numTeeth);
  const nub = appWidth * TEXT_SIZES.TIMELINE_NUB;
  const lineH = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_LINE_HEIGHT);

  // Convert viewBox-relative coordinates to screen pixels
  const toSX = (vbX: number) => (transX + vbX) * scale + offX;
  const toSY = (vbY: number) => (transY + vbY) * scale + offY;

  // Build tick positions in screen pixels
  const firstVbX = TIMELINE_POSITIONS.LINE_X_RATIO * appWidth;
  const ticks: { sx: number; isLoopStart: boolean }[] = [];
  let bump = 0;
  for (let j = 0; j < loopRpts; j++) {
    for (let i = 0; i < pizza.numTeeth; i++) {
      ticks.push({ sx: toSX(firstVbX + bump), isLoopStart: i === 0 });
      bump += nub;
    }
  }

  const tickTop = toSY(yPos);
  const lineHPx = lineH * scale;
  const halfWPx = PLAYHEAD_HALF_W * scale;
  const overhangPx = PLAYHEAD_OVERHANG * scale;
  const tickStrokePx = TICK_STROKE_WIDTH * scale;

  // Playhead
  const tmlnIdx = pizza.timelineIndex;
  const playheadVbX = pizza.timelinePlayheadX[tmlnIdx];
  const playheadSX = playheadVbX != null ? toSX(playheadVbX) : null;

  // Loop label
  const textSm = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT * scale);
  const loopLabel = loopRpts === 1
    ? `1 loop (${loopTime.toFixed(1)} s)`
    : `${loopRpts} loops (${loopTime.toFixed(1)} s)`;

  // Pattern info (showPatternInfo === true for first pizza only)
  const textLg = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT_LARGE * scale);
  const totalVbX = TIMELINE_POSITIONS.LOOP_LENGTH_X_RATIO * appWidth + bump;
  const patternLeft = toSX(totalVbX + nub);
  const patternTop1 = toSY(yPos);
  const patternTop2 = toSY(yPos + appHeight * (TIMELINE_POSITIONS.PIZZA_Y_RATIOS[1] - TIMELINE_POSITIONS.PIZZA_Y_RATIOS[0]));

  const labelBase: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  return (
    <>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        {ticks.map(({ sx, isLoopStart }, idx) => (
          <line
            key={idx}
            x1={sx} y1={tickTop}
            x2={sx} y2={tickTop + lineHPx}
            stroke={isLoopStart ? `rgba(${r},${g},${b},0.8)` : `rgba(${r},${g},${b},0.35)`}
            strokeWidth={tickStrokePx}
          />
        ))}
        {playheadSX != null && (
          <rect
            x={playheadSX - halfWPx}
            y={tickTop - overhangPx}
            width={halfWPx * 2}
            height={lineHPx + overhangPx * 2}
            rx={halfWPx}
            fill="black"
          />
        )}
      </svg>

      <span aria-hidden="true" style={{ ...labelBase, left: toSX(firstVbX), top: toSY(yPos + lineH), fontSize: textSm, color: `rgba(${r},${g},${b},0.9)` }}>
        {loopLabel}
      </span>

      {showPatternInfo && (
        <>
          <span aria-hidden="true" style={{ ...labelBase, left: patternLeft, top: patternTop1, fontSize: textLg, color: COLOR_STRINGS.GREY }}>
            {lcm} time unit
          </span>
          <span aria-hidden="true" style={{ ...labelBase, left: patternLeft, top: patternTop2, fontSize: textLg, color: COLOR_STRINGS.GREY }}>
            pattern ({(lcm * (loopTime / pizza.numTeeth)).toFixed(1)} s)
          </span>
        </>
      )}
    </>
  );
}
