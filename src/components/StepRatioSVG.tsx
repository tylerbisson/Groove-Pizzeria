/**
 * StepRatioSVG
 *
 * Renders cross-pizza step-ratio labels: for each pizza, shows its step
 * duration expressed as a multiple of the other pizza's step. Accepts
 * arrays of pizzas and anchors so it can scale to more than two pizzas.
 *
 * Props: pizzas (Array), anchors (Array), stepNoteValues (Array), appWidth
 */
import { Fragment } from 'react';
import PizzaSequencer from '../PizzaSequencer';
import type { SliderAnchors } from '../types';
import { TEXT_SIZES, SPACING, COLOR_STRINGS } from '../config';

interface StepRatioSVGProps {
  pizzas: PizzaSequencer[];
  anchors: SliderAnchors[];
  stepNoteValues: number[];
  appWidth: number;
}

export default function StepRatioSVG({
  pizzas,
  anchors,
  stepNoteValues,
  appWidth,
}: StepRatioSVGProps) {
  const sm = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT);
  return (
    <g stroke="none">
      {pizzas.map((pizza, i) => {
        const otherIdx = pizzas.findIndex((_, j) => j !== i);
        const refStepValue = otherIdx >= 0 ? stepNoteValues[otherIdx] : stepNoteValues[i];
        const ratio = refStepValue / stepNoteValues[i] || 1;
        const [or, og, ob] = otherIdx >= 0 ? pizzas[otherIdx].color : pizza.color;
        const { rotateX, rotateY } = anchors[i];

        return (
          <Fragment key={i}>
            <text
              x={rotateX - appWidth * SPACING.STEP_RATIO_X_OFFSET}
              y={rotateY}
              fontSize={sm}
              style={{ fill: COLOR_STRINGS.GREY }}
            >
              = {ratio.toFixed(3)} x
            </text>
            <text
              x={rotateX - appWidth * SPACING.STEP_TEXT_X_OFFSET}
              y={rotateY}
              fontSize={sm}
              fill={`rgba(${or},${og},${ob},0.67)`}
            >
              step
            </text>
          </Fragment>
        );
      })}
    </g>
  );
}
