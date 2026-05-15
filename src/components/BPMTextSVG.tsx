/**
 * BPMTextSVG
 *
 * Renders the global BPM readout in SVG, positioned above the BPM slider.
 * Coordinates are in the parent translated <g> space.
 *
 * Props: bpm, appWidth, appHeight
 */
import {
  TEXT_SIZES,
  BPM_SLIDER_X_RATIO,
  BPM_SLIDER_Y_RATIO,
  BPM_TEXT_Y_RATIO,
  COLOR_STRINGS,
} from '../config';

interface BPMTextSVGProps {
  bpm: number;
  appWidth: number;
  appHeight: number;
  transX: number;
  transY: number;
}

export default function BPMTextSVG({ bpm, appWidth, appHeight, transX, transY }: BPMTextSVGProps) {
  const x = BPM_SLIDER_X_RATIO * appWidth - transX;
  const y = BPM_SLIDER_Y_RATIO * appHeight - (transY - appHeight * BPM_TEXT_Y_RATIO);

  return (
    <text
      x={x}
      y={y}
      style={{ fill: COLOR_STRINGS.GREY }}
      fontSize={Math.ceil(appWidth * TEXT_SIZES.CONTROL_TEXT)}
      stroke="none"
    >
      {bpm} bpm
    </text>
  );
}
