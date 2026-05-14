/**
 * BPMTextSVG
 *
 * Renders the global BPM readout in SVG, positioned above the BPM slider.
 * Coordinates are in the parent translated <g> space.
 *
 * Props: bpm, appWidth, appHeight
 */
import React from 'react';
import { TEXT_SIZES, BPM_SLIDER_X_RATIO, BPM_SLIDER_Y_RATIO, BPM_TEXT_Y_RATIO } from '../config';

export default function BPMTextSVG({ bpm, appWidth, appHeight }) {
  const trans = appWidth / 2;
  const x = BPM_SLIDER_X_RATIO * appWidth - trans;
  const y = BPM_SLIDER_Y_RATIO * appHeight - (trans - appHeight * BPM_TEXT_Y_RATIO);

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
}
