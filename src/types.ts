/**
 * Shared TypeScript interfaces and type aliases used across the application.
 */

export type RGB = [number, number, number];

export interface PizzaPosition {
  x: number;
  y: number;
}

export interface PizzaConfig {
  slices: number;
  teeth: number;
  rotation: number;
}

export interface Dimensions {
  appWidth: number;
  appHeight: number;
  portrait: boolean;
  transX: number;
  transY: number;
  /** viewBox units → screen pixels (for positioning HTML elements alongside the SVG) */
  scale: number;
  /** horizontal letterbox offset in screen pixels */
  offsetX: number;
  /** vertical letterbox offset in screen pixels */
  offsetY: number;
}

export interface PizzaRenderProps {
  loopTime: number;
  stepNoteValue: number;
  rotation: number;
  yPos: number;
}

export interface PizzaGeometry {
  position: { x: number; y: number };
  pizzaDiam: number;
  diameter: number;
}

// true = active beat, false = inactive
export type StepRing = boolean[];
export type PizzaSteps = [StepRing, StepRing, StepRing];

export type LayoutMode = 'auto' | 'portrait' | 'landscape';
