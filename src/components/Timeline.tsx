/**
 * Timeline
 *
 * Renders the horizontal sync timeline strip for one pizza sequencer.
 * Each tick is TIMELINE_NUB * refPx pixels wide (fixed size), so the strip
 * width is proportional to the number of ticks, not the container width.
 *
 * Loop boundaries are emphasised with a brighter stroke. The playhead moves
 * to the start of each loop repetition as the sequencer advances.
 *
 * When showPatternInfo is true, the total LCM pattern label is rendered
 * immediately after the tick marks.
 */
import Sequencer from '../Sequencer';
import { TEXT_SIZES, COLOR_STRINGS } from '../config';

const TICK_HEIGHT_PX = 8;
const TICK_STROKE_WIDTH = 2;
const PLAYHEAD_HALF_W = 3; // px
const PLAYHEAD_OVERHANG = 2; // px

interface TimelineProps {
  pizza: Sequencer;
  lcm: number;
  refPx: number;
  loopTime: number;
  showPatternInfo?: boolean;
}

export default function Timeline({
  pizza,
  lcm,
  refPx,
  loopTime,
  showPatternInfo = false,
}: TimelineProps) {
  const [r, g, b] = pizza.color;
  const loopRpts = Math.round(lcm / pizza.numTeeth);
  const totalTicks = loopRpts * pizza.numTeeth;

  // Each tick is one nub wide; the SVG has a fixed pixel width.
  const nubPx = refPx * TEXT_SIZES.TIMELINE_NUB;
  const tickAreaW = Math.ceil(totalTicks * nubPx);
  const svgH = TICK_HEIGHT_PX + PLAYHEAD_OVERHANG * 2;

  // Playhead: fraction (0–1) → pixel x within the tick area
  const frac = pizza.timelinePlayheadFraction[pizza.timelineIndex] ?? 0;
  const playheadX = frac * tickAreaW;

  // Labels
  const textSm = Math.ceil(refPx * TEXT_SIZES.TIMELINE_TEXT);
  const loopLabel =
    loopRpts === 1
      ? `1 loop (${loopTime.toFixed(1)} s)`
      : `${loopRpts} loops (${loopTime.toFixed(1)} s)`;
  const patternLabel = `${lcm} time unit pattern (${(lcm * (loopTime / pizza.numTeeth)).toFixed(1)} s)`;

  const labelBase: React.CSSProperties = {
    pointerEvents: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', marginBottom: 4 }}
    >
      {/* Fixed-width tick area */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg
          width={tickAreaW}
          height={svgH}
          aria-hidden="true"
          style={{ display: 'block', overflow: 'visible' }}
        >
          {Array.from({ length: totalTicks }, (_, i) => {
            const x = i * nubPx;
            const isLoopStart = i % pizza.numTeeth === 0;
            return (
              <line
                key={i}
                x1={x}
                y1={PLAYHEAD_OVERHANG}
                x2={x}
                y2={TICK_HEIGHT_PX + PLAYHEAD_OVERHANG}
                stroke={isLoopStart ? `rgba(${r},${g},${b},0.8)` : `rgba(${r},${g},${b},0.35)`}
                strokeWidth={TICK_STROKE_WIDTH}
              />
            );
          })}
          <rect
            x={playheadX - PLAYHEAD_HALF_W}
            y={0}
            width={PLAYHEAD_HALF_W * 2}
            height={svgH}
            rx={PLAYHEAD_HALF_W}
            fill="black"
          />
        </svg>

        {/* Loop label sits below the ticks */}
        <div style={{ ...labelBase, fontSize: textSm, color: `rgba(${r},${g},${b},0.9)` }}>
          {loopLabel}
        </div>
      </div>

      {/* Pattern info appears to the right of the tick area, vertically centred */}
      {showPatternInfo && (
        <div
          style={{
            ...labelBase,
            fontSize: textSm,
            color: COLOR_STRINGS.GREY,
            marginLeft: Math.ceil(nubPx),
            paddingTop: PLAYHEAD_OVERHANG,
          }}
        >
          {patternLabel}
        </div>
      )}
    </div>
  );
}
