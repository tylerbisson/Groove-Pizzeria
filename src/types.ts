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

export interface SliderAnchors {
  slidersX: number;
  rotateX: number;
  sliceY: number;
  toothY: number;
  rotateY: number;
}

export interface Dimensions {
  appWidth: number;
  appHeight: number;
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
