/**
 * ControlTextSVG
 *
 * Renders the per-pizza slider labels in SVG: the numeric value for each
 * slider (slices, teeth, rotation) alongside a descriptive label showing
 * the musical meaning (note value, time unit duration, step count).
 *
 * Coordinates are in the parent translated <g> space, anchored to the
 * slider positions returned by computeSliderAnchors().
 *
 * Props: pizza, anchors, timeUnit, appWidth, appHeight
 */
import React from 'react';
import { COLORS, TEXT_SIZES, SPACING } from '../config';

export default function ControlTextSVG({ pizza, anchors, timeUnit, appWidth, appHeight }) {
  const [r, g, b] = pizza.color;
  const fill = `rgba(${r},${g},${b},${COLORS.TEXT_ALPHA / 255})`;
  const lgSize  = Math.ceil(appWidth * TEXT_SIZES.CONTROL_TEXT);
  const smSize  = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT);
  const divSize = Math.ceil(appWidth * TEXT_SIZES.DIV_SYMBOL);
  const ow = appWidth;

  const { slidersX, rotateX, sliceY, toothY, rotateY } = anchors;
  const stepNoteValue = pizza.stepNoteValue?.toFixed(3) ?? '?';

  return (
    <g fill={fill} stroke="none">
      {/* Slice count */}
      <text x={slidersX - ow*SPACING.CONTROL_TEXT_OFFSET_X} y={sliceY - ow*SPACING.CONTROL_TEXT_OFFSET_Y}      fontSize={lgSize}>{pizza.slices}</text>
      <text x={slidersX}                                     y={sliceY - ow*SPACING.CONTROL_TEXT_SMALL_Y_OFFSET} fontSize={smSize}>steps (1/{stepNoteValue} note)</text>

      {/* Tooth count */}
      <text x={slidersX - ow*SPACING.CONTROL_TEXT_OFFSET_X}  y={toothY - ow*SPACING.CONTROL_TEXT_OFFSET_Y}      fontSize={lgSize}>{pizza.numTeeth}</text>
      <text x={slidersX - ow*SPACING.DIV_SYMBOL_X_OFFSET}    y={toothY + appHeight*SPACING.DIV_SYMBOL_Y_OFFSET}  fontSize={divSize}>÷</text>
      <text x={slidersX}                                      y={toothY - ow*SPACING.CONTROL_TEXT_SMALL_Y_OFFSET} fontSize={smSize}>
        time units ({timeUnit?.toFixed(3)} s)
      </text>

      {/* Rotation count */}
      <text x={rotateX - ow*SPACING.CONTROL_TEXT_OFFSET_X}   y={rotateY - ow*SPACING.CONTROL_TEXT_OFFSET_Y}      fontSize={lgSize}>{pizza.rotation ?? 0}</text>
      <text x={rotateX}                                       y={rotateY - ow*SPACING.CONTROL_TEXT_SMALL_Y_OFFSET} fontSize={smSize}>step rotations</text>
      <text x={rotateX - ow*SPACING.ROTATION_LABEL_X_OFFSET} y={rotateY}                                          fontSize={smSize}>step</text>
    </g>
  );
}
