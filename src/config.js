/**
 * Centralized configuration and constants for the Groove Pizzeria application
 */

// ============================================================================
// AUDIO & TIMING
// ============================================================================
export const DEFAULT_BPM = 120;
export const SCHEDULE_AHEAD_TIME = 0.1; // seconds
export const DEFAULT_LCM = 16;

// ============================================================================
// PIZZA CONFIGURATION
// ============================================================================
export const DEFAULT_NUM_SLICES = 16;
export const DEFAULT_NUM_TEETH = 16;
export const CLICK_THRESHOLD = 0.15;

// Pizza visual properties
export const PIZZA_1_COLOR = [221, 65, 26];
export const PIZZA_2_COLOR = [60, 94, 178];
export const PIZZA_1_POSITION = { x: -0.233, y: -0.368 }; // as ratio of appWidth/appHeight
export const PIZZA_2_POSITION = { x: 0.259, y: -0.368 };
export const PIZZA_DIAMETER_RATIO = 0.2;
export const PIZZA_TEETH_OFFSET_RATIO = 0.1;

// ============================================================================
// COLORS
// ============================================================================
export const COLORS = {
  GREY: 170,
  MEDIUM_GREY: 195,
  LIGHT_GREY: 'rgb(255,255,255)',
  BACKGROUND: [211, 227, 223],
  TEXT_ALPHA: 150,
};

// ============================================================================
// UI SCALING FACTORS (as ratios of appWidth)
// ============================================================================
export const TEXT_SIZES = {
  CONTROL_TEXT: 0.0269,
  CLEAR_BUTTON: 0.0134,
  PLAY_BUTTON_SIZE: 0.0253,
  PLAY_BUTTON_OFFSET: 0.0438,
  TIMELINE_TEXT: 0.0134,
  DROPDOWN: 0.0101,
};

export const SPACING = {
  CONTROL_TEXT_OFFSET_X: 0.031,
  CONTROL_TEXT_OFFSET_Y: 0.003,
  CONTROL_TEXT_X_MULTIPLIER: 0.97, // For division symbol
  STEP_RATIO_X_OFFSET: 0.156,
  STEP_TEXT_X_OFFSET: 0.085,
  STEP_TEXT_X_OFFSET_LARGE: 6,
};

export const DROPDOWN_SIZES = {
  HEIGHT: 0.0126,
  PADDING_X: 0.0084,
};

// ============================================================================
// CANVAS & LAYOUT
// ============================================================================
export const CANVAS_PADDING_RATIO = 0.08;
export const CANVAS_WIDTH_MIN_RATIO = 0.859;
export const CANVAS_HEIGHT_TO_WIDTH_RATIO = 35 / 61;
export const NARROW_WIDTH_RATIO = 0.573;
export const TALL_HEIGHT_RATIO = 1.742;

export const LAYOUT_BREAKPOINTS = {
  NARROW: 1.9, // windowWidth / windowHeight
  TALL: 0.6,   // windowHeight / windowWidth
};

export const KIT_OPTIONS = [
  '909 kick, clap, hat',
  '808 pitched bongos',
  'wood',
  'concrete',
  'midi out (chrome only)',
];

// ============================================================================
// TOOTH ANGLE (p5 coordinate system)
// ============================================================================
export const INITIAL_TOOTH_ANGLE = 270;
// 270 degrees because teeth are offset by quarter right turn (90 degrees)
// Therefore, 12 o'clock is at 270 rather than zero
