/**
 * StepRatioSVG
 *
 * Renders cross-pizza step-ratio labels: for each pizza, shows its step
 * duration expressed as a multiple of the other pizza's step. Accepts
 * arrays of pizzas and anchors so it can scale to more than two pizzas.
 *
 * Props: pizzas (Array), anchors (Array), appWidth
 */
import React from 'react';
import { TEXT_SIZES, SPACING } from '../config';

export default function StepRatioSVG({ pizzas, anchors, appWidth }) {
  const grey = 'rgb(170,170,170)';
  const sm   = Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT);
  const ow   = appWidth;

  return (
    <g stroke="none">
      {pizzas.map((pizza, i) => {
        const otherPizzas = pizzas.filter((_, j) => j !== i);
        const refStepValue = otherPizzas[0]?.stepNoteValue ?? pizza.stepNoteValue;
        const ratio = (refStepValue / pizza.stepNoteValue) || 1;
        const [or, og, ob] = otherPizzas[0]?.color ?? pizza.color;
        const { rotateX, rotateY } = anchors[i];

        return (
          <React.Fragment key={i}>
            <text x={rotateX - ow*SPACING.STEP_RATIO_X_OFFSET} y={rotateY} fontSize={sm} fill={grey}>
              = {ratio.toFixed(3)} x
            </text>
            <text x={rotateX - ow*SPACING.STEP_TEXT_X_OFFSET}  y={rotateY} fontSize={sm} fill={`rgba(${or},${og},${ob},0.67)`}>
              step
            </text>
          </React.Fragment>
        );
      })}
    </g>
  );
}
