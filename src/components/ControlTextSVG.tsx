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
 * Props: pizza, anchors, timeUnit, stepNoteValue, rotation, appWidth, appHeight
 */
import PizzaSequencer from '../PizzaSequencer';
import type { SliderAnchors } from '../types';
import { COLORS, TEXT_SIZES, SPACING } from '../config';

interface ControlTextSVGProps {
  pizza: PizzaSequencer;
  anchors: SliderAnchors;
  timeUnit: number;
  stepNoteValue: number;
  rotation: number;
  appWidth: number;
  appHeight: number;
}

export default function ControlTextSVG({
  pizza,
  anchors,
  timeUnit,
  stepNoteValue,
  rotation,
  appWidth,
  appHeight,
}: ControlTextSVGProps) {
  const [r, g, b] = pizza.color;
  const fill = `rgba(${r},${g},${b},${COLORS.TEXT_ALPHA / 255})`;
  const lgSize = Math.ceil(appWidth * TEXT_SIZES.CONTROL_TEXT);
  const smSize = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT);
  const divSize = Math.ceil(appWidth * TEXT_SIZES.DIV_SYMBOL);
  const { slidersX, rotateX, sliceY, toothY, rotateY } = anchors;
  const stepNoteValueStr = stepNoteValue.toFixed(3);

  return (
    <g fill={fill} stroke="none">
      {/* Slice count */}
      <text
        x={slidersX - appWidth *SPACING.CONTROL_TEXT_OFFSET_X}
        y={sliceY - appWidth *SPACING.CONTROL_TEXT_OFFSET_Y}
        fontSize={lgSize}
      >
        {pizza.slices}
      </text>
      <text x={slidersX} y={sliceY - appWidth *SPACING.CONTROL_TEXT_SMALL_Y_OFFSET} fontSize={smSize}>
        steps (1/{stepNoteValueStr} note)
      </text>

      {/* Tooth count */}
      <text
        x={slidersX - appWidth *SPACING.CONTROL_TEXT_OFFSET_X}
        y={toothY - appWidth *SPACING.CONTROL_TEXT_OFFSET_Y}
        fontSize={lgSize}
      >
        {pizza.numTeeth}
      </text>
      <text
        x={slidersX - appWidth *SPACING.DIV_SYMBOL_X_OFFSET}
        y={toothY + appHeight * SPACING.DIV_SYMBOL_Y_OFFSET}
        fontSize={divSize}
      >
        ÷
      </text>
      <text x={slidersX} y={toothY - appWidth *SPACING.CONTROL_TEXT_SMALL_Y_OFFSET} fontSize={smSize}>
        time units ({timeUnit.toFixed(3)} s)
      </text>

      {/* Rotation count */}
      <text
        x={rotateX - appWidth *SPACING.CONTROL_TEXT_OFFSET_X}
        y={rotateY - appWidth *SPACING.CONTROL_TEXT_OFFSET_Y}
        fontSize={lgSize}
      >
        {rotation}
      </text>
      <text x={rotateX} y={rotateY - appWidth *SPACING.CONTROL_TEXT_SMALL_Y_OFFSET} fontSize={smSize}>
        step rotations
      </text>
      <text x={rotateX - appWidth *SPACING.ROTATION_LABEL_X_OFFSET} y={rotateY} fontSize={smSize}>
        step
      </text>
    </g>
  );
}
