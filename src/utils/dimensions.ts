/**
 * Layout utilities
 *
 * computeDimensions — maps window size to responsive canvas dimensions
 * using the same aspect-ratio breakpoints as the original p5 sketch.
 *
 * computeSliderAnchors — maps a pizza's x-position ratio to the SVG
 * coordinates (in translated g-space) where its sliders and control
 * labels are anchored.
 */
import {
  LAYOUT_BREAKPOINTS,
  NARROW_WIDTH_RATIO,
  TALL_HEIGHT_RATIO,
  NARROW_APP_WIDTH_FACTOR,
  TALL_APP_HEIGHT_FACTOR,
  SLIDER_ANCHORS,
  PIZZA_DIAMETER_RATIO,
  PIZZA_TOOTH_ARC_LENGTH_RATIO,
  PIZZA_DIAMETER_RATIO_PORTRAIT,
  PIZZA_TOOTH_ARC_LENGTH_RATIO_PORTRAIT,
  PORTRAIT_LAYOUT,
} from '../config';
import type { Dimensions, SliderAnchors, PizzaPosition, PizzaGeometry } from '../types';

export function computeDimensions(windowWidth: number, windowHeight: number): Dimensions {
  const aspectRatio = windowWidth / windowHeight;

  if (aspectRatio <= LAYOUT_BREAKPOINTS.PORTRAIT) {
    const appWidth = windowWidth * NARROW_APP_WIDTH_FACTOR;
    const appHeight = windowHeight * NARROW_APP_WIDTH_FACTOR;
    return {
      appWidth,
      appHeight,
      portrait: true,
      transX: appWidth / 2,
      transY: appHeight / 2,
    };
  }

  if (aspectRatio <= LAYOUT_BREAKPOINTS.NARROW) {
    const appWidth = windowWidth * NARROW_APP_WIDTH_FACTOR;
    const trans = appWidth / 2;
    return {
      appWidth,
      appHeight: appWidth * NARROW_WIDTH_RATIO,
      portrait: false,
      transX: trans,
      transY: trans,
    };
  }

  const appHeight = windowHeight * TALL_APP_HEIGHT_FACTOR;
  const appWidth = appHeight * TALL_HEIGHT_RATIO;
  const trans = appWidth / 2;
  return {
    appWidth,
    appHeight,
    portrait: false,
    transX: trans,
    transY: trans,
  };
}

export function computePizzaGeometry(
  appWidth: number,
  appHeight: number,
  positions: PizzaPosition[],
  teethCounts: number[],
  portrait = false
): PizzaGeometry[] {
  // In portrait, cap the reference dimension so pizzas don't outgrow the vertical space.
  const ref = portrait ? Math.min(appWidth, appHeight * PORTRAIT_LAYOUT.HEIGHT_REF_FACTOR) : appWidth;
  const toothArcLength =
    (portrait ? PIZZA_TOOTH_ARC_LENGTH_RATIO_PORTRAIT : PIZZA_TOOTH_ARC_LENGTH_RATIO) * ref;
  const pizzaDiam = ref * (portrait ? PIZZA_DIAMETER_RATIO_PORTRAIT : PIZZA_DIAMETER_RATIO);
  return positions.map((pos, i) => ({
    position: { x: pos.x * appWidth, y: pos.y * appHeight },
    pizzaDiam,
    diameter: (toothArcLength * teethCounts[i]) / (2 * Math.PI),
  }));
}

export function computeSliderAnchors(
  pizzaXRatio: number,
  appWidth: number,
  appHeight: number
): SliderAnchors {
  const slidersX = (pizzaXRatio + SLIDER_ANCHORS.SLIDERS_X_OFFSET - 0.5) * appWidth;
  const rotateX = (pizzaXRatio + SLIDER_ANCHORS.ROTATE_X_OFFSET - 0.5) * appWidth;
  const sliceY = SLIDER_ANCHORS.SLICE_Y_RATIO * appHeight - 0.5 * appWidth;
  const toothY = SLIDER_ANCHORS.TOOTH_Y_RATIO * appHeight - 0.5 * appWidth;
  const rotateY = SLIDER_ANCHORS.ROTATE_Y_RATIO * appHeight - 0.5 * appWidth;
  return { slidersX, rotateX, sliceY, toothY, rotateY };
}
