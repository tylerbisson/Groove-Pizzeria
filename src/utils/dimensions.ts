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
  PIZZA_TEETH_OFFSET_RATIO,
  PIZZA_DIAMETER_RATIO_PORTRAIT,
  PIZZA_TOOTH_ARC_LENGTH_RATIO_PORTRAIT,
  PORTRAIT_LAYOUT,
  TEETH_MAX,
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
      refPx: appWidth, // scale=1, so refPx = appWidth * 1 = appWidth
    };
  }

  // Landscape (all aspect ratios): fixed viewBox coordinate system.
  // The SVG viewBox handles scaling to fill the screen; HTML elements use
  // scale + offsets to align with the viewBox content.
  const appWidth = LANDSCAPE_VB_W;
  const appHeight = LANDSCAPE_VB_H;
  const scale = Math.min(windowWidth / appWidth, windowHeight / appHeight);

  // Each pizza panel SVG is approximately pizzaPanelWFactor * refPx pixels square.
  // Panel total height = (pizzaPanelWFactor + 0.043) * refPx + 60, where 0.043
  // accounts for the control-row font ratios (derived from TEXT_SIZES used in PizzaPanel).
  const pizzaPanelWFactor =
    (PIZZA_TOOTH_ARC_LENGTH_RATIO * TEETH_MAX / Math.PI) * (1 + PIZZA_TEETH_OFFSET_RATIO);
  const panelHeightFactor = pizzaPanelWFactor + 0.043;

  // Width: 2 panels + center column (≈150px) + outer padding (24px) fit in viewport.
  const widthRefPx = (windowWidth - 174) / (2 * pizzaPanelWFactor);

  // Height: panel + timeline strips (≈55px) + outer padding (16px) + bottom buffer (30px).
  // 60px is the fixed overhead in the panel (SVG ceil padding + input heights + gaps).
  const heightRefPx = (windowHeight - 101 - 60) / panelHeightFactor;

  const refPx = Math.min(scale * appWidth, widthRefPx, heightRefPx);

  return {
    appWidth,
    appHeight,
    portrait: false,
    transX: appWidth / 2,
    transY: appWidth / 2, // keep transY = transX (layout tuned for this convention)
    scale,
    offsetX: (windowWidth - appWidth * scale) / 2,
    offsetY: (windowHeight - appHeight * scale) / 2,
    refPx,
  };
}

export function computePizzaGeometry(
  refPx: number,
  appHeight: number,
  positions: PizzaPosition[],
  teethCounts: number[],
  portrait = false
): PizzaGeometry[] {
  // In portrait, cap the reference dimension so pizzas don't outgrow the vertical space.
  const ref = portrait ? Math.min(refPx, appHeight * PORTRAIT_LAYOUT.HEIGHT_REF_FACTOR) : refPx;
  const toothArcLength =
    (portrait ? PIZZA_TOOTH_ARC_LENGTH_RATIO_PORTRAIT : PIZZA_TOOTH_ARC_LENGTH_RATIO) * ref;
  const pizzaDiam = ref * (portrait ? PIZZA_DIAMETER_RATIO_PORTRAIT : PIZZA_DIAMETER_RATIO);
  return positions.map((pos, i) => ({
    position: { x: pos.x * refPx, y: pos.y * appHeight },
    pizzaDiam,
    diameter: (toothArcLength * teethCounts[i]) / (2 * Math.PI),
  }));
}

