/**
 * Layout utilities — maps window size to responsive canvas dimensions
 * using the same aspect-ratio breakpoints as the original p5 sketch.
 */
import {
  LAYOUT_BREAKPOINTS,
  NARROW_APP_WIDTH_FACTOR,
  LANDSCAPE_VB_W,
  LANDSCAPE_VB_H,
  PIZZA_DIAMETER_RATIO,
  PIZZA_TOOTH_ARC_LENGTH_RATIO,
  PIZZA_DIAMETER_RATIO_PORTRAIT,
  PIZZA_TOOTH_ARC_LENGTH_RATIO_PORTRAIT,
  PORTRAIT_LAYOUT,
} from '../config';
import type { Dimensions, PizzaPosition, PizzaGeometry } from '../types';

export function computeDimensions(windowWidth: number, windowHeight: number): Dimensions {
  const aspectRatio = windowWidth / windowHeight;

  if (aspectRatio <= LAYOUT_BREAKPOINTS.PORTRAIT) {
    // Portrait: pixel-based dimensions, scale=1 (HTML elements position in pixel space)
    const appWidth = windowWidth * NARROW_APP_WIDTH_FACTOR;
    const appHeight = windowHeight * NARROW_APP_WIDTH_FACTOR;
    return {
      appWidth,
      appHeight,
      portrait: true,
      transX: appWidth / 2,
      transY: appHeight / 2,
      scale: 1,
      offsetX: (windowWidth - appWidth) / 2,
      offsetY: (windowHeight - appHeight) / 2,
    };
  }

  // Landscape (all aspect ratios): fixed viewBox coordinate system.
  // The SVG viewBox handles scaling to fill the screen; HTML elements use
  // scale + offsets to align with the viewBox content.
  const appWidth = LANDSCAPE_VB_W;
  const appHeight = LANDSCAPE_VB_H;
  const scale = Math.min(windowWidth / appWidth, windowHeight / appHeight);
  return {
    appWidth,
    appHeight,
    portrait: false,
    transX: appWidth / 2,
    transY: appWidth / 2, // keep transY = transX (layout tuned for this convention)
    scale,
    offsetX: (windowWidth - appWidth * scale) / 2,
    offsetY: (windowHeight - appHeight * scale) / 2,
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

