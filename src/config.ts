/**
 * Centralized configuration and constants for the Groove Pizzeria application
 */
import type { RGB, PizzaPosition } from './types';

// ============================================================================
// AUDIO & TIMING
// ============================================================================
export const DEFAULT_BPM = 120;
export const BPM_MIN = 20;
export const BPM_MAX = 300;
export const SCHEDULE_AHEAD_TIME = 0.1; // seconds
export const SCHEDULER_INTERVAL_MS = 25;
export const SIXTEENTH_NOTE_RATIO = 0.25; // 1 sixteenth = 1/4 beat
export const AUDIO_START_OFFSET = 0.005; // seconds, delay before audio starts

// ============================================================================
// PIZZA CONFIGURATION
// ============================================================================
export const DEFAULT_NUM_SLICES = 16;
export const DEFAULT_NUM_TEETH = 16;
export const SLICES_MIN = 2;
export const SLICES_MAX = 16;
export const TEETH_MAX = 16;
export const ROTATION_MAX = 16;
export const CLICK_THRESHOLD = 0.13; // fraction of pizzaDiam used as hit-test radius

// Pizza visual properties — indexed arrays so adding a third pizza is one push
export const PIZZA_COLORS: RGB[] = [
  [221, 65, 26],
  [60, 94, 178],
];
export const PIZZA_POSITIONS: PizzaPosition[] = [
  { x: -0.233, y: -0.368 }, // as ratio of appWidth/appHeight
  { x: 0.259, y: -0.368 },
];
export const PIZZA_DIAMETER_RATIO = 0.2;
export const PIZZA_TEETH_OFFSET_RATIO = 0.1;

// Pizza face dimensions
export const PIZZA_TOOTH_ARC_LENGTH_RATIO = 0.086;
export const PIZZA_BUTTON_SIZE_RATIO = 0.04;
export const PIZZA_BUTTON_POSITIONS = [0.5, 0.7, 0.9]; // distance ratios from center

// Portrait-specific pizza sizing (stacked layout)
export const PIZZA_POSITIONS_PORTRAIT: PizzaPosition[] = [
  { x: 0, y: -0.247 },
  { x: 0, y: 0.195 },
];
export const PIZZA_DIAMETER_RATIO_PORTRAIT = 0.38;
export const PIZZA_TOOTH_ARC_LENGTH_RATIO_PORTRAIT = 0.128;

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

export const COLOR_STRINGS = {
  GREY: 'var(--gp-grey)',
  MEDIUM_GREY: 'var(--gp-medium-grey)',
  SYNC_SPOKE: 'var(--gp-sync-spoke)',
  BACKGROUND: 'var(--gp-bg)',
  DOT_INACTIVE: 'var(--gp-dot-inactive)',
  DOT_ACTIVE: 'var(--gp-dot-active)',
  WHITE: COLORS.LIGHT_GREY, // always white — no theming needed
} as const;

// ============================================================================
// UI SCALING FACTORS (as ratios of appWidth/appHeight)
// ============================================================================
export const TEXT_SIZES = {
  CONTROL_TEXT: 0.0269,
  CLEAR_BUTTON: 0.0134,
  PLAY_BUTTON_SIZE: 0.0253,
  PLAY_BUTTON_OFFSET: 0.0438,
  TIMELINE_TEXT: 0.0134,
  TIMELINE_TEXT_LARGE: 0.0168,
  TIMELINE_NUB: 0.0027,
  TIMELINE_LINE_HEIGHT: 0.0084,
  PLAYHEAD_STROKE: 0.0081,
  DROPDOWN: 0.0101,
  DIV_SYMBOL: 0.016,
};


export const TIMELINE_POSITIONS = {
  PIZZA_Y_RATIOS: [0.017, 0.063], // y offset per pizza, as ratio of appHeight
  LINE_X_RATIO: -0.484,
  LOOP_LENGTH_X_RATIO: -0.475,
};

export const DROPDOWN_SIZES = {
  HEIGHT: 0.0126,
  PADDING_X: 0.0084,
};

// ============================================================================
// CANVAS & LAYOUT
// ============================================================================
export const NARROW_WIDTH_RATIO = 0.573;
export const TALL_HEIGHT_RATIO = 1.742;
export const NARROW_APP_WIDTH_FACTOR = 0.92;
export const TALL_APP_HEIGHT_FACTOR = 0.96;

/** Fixed viewBox coordinate system for the landscape layout */
export const LANDSCAPE_VB_W = 1000;
export const LANDSCAPE_VB_H = Math.round(LANDSCAPE_VB_W * NARROW_WIDTH_RATIO); // 573

export const LAYOUT_BREAKPOINTS = {
  PORTRAIT: 1.0, // windowWidth / windowHeight — stacked layout below this ratio
  NARROW: 1.9, // windowWidth / windowHeight
  TALL: 0.6, // windowHeight / windowWidth
};

export const PORTRAIT_LAYOUT = {
  // Caps the reference dimension so pizzas don't outgrow vertical space
  HEIGHT_REF_FACTOR: 0.42,

  // Horizontal slider rows (one row per pizza, three sliders side-by-side)
  SLIDER_WIDTH_RATIO: 0.285, // each slider width as fraction of appWidth
  SLIDER_MARGIN: 8, // px — left edge of the slider row
  SLIDER_PIZZA_GAP: 8, // px — gap between pizza dots bottom and slider row
  SLIDER_LABEL_OFFSET: 18, // px below slider top
  SLIDER_LABEL_FONT: 10, // px font size for "16 steps / 16 teeth / 0 rot" labels
  SLIDER_ROW_HEIGHT: 28, // px — used to compute where the middle strip starts

  // Middle strip y-offsets from midTop (px)
  MID_KIT_OFFSET: 4,
  MID_BPM_LABEL_OFFSET: 24,
  MID_BPM_SLIDER_OFFSET: 36,
  MID_PLAY_OFFSET: 66,

  // Middle strip: BPM slider positioning
  BPM_SLIDER_X_RATIO: 0.15, // fraction of appWidth
  BPM_SLIDER_WIDTH_RATIO: 0.7,

  // Middle strip: kit dropdowns
  KIT_HEIGHT: 22, // px
  KIT_FONT: 11, // px

  // Font sizes (px)
  BPM_FONT: 12,
  CONTROL_FONT: 13, // clear button, settings panel

  // Bottom controls y-offsets from p1SliderTop (px)
  BOTTOM_CLEAR_OFFSET: 35,
  BOTTOM_LINK0_OFFSET: 32,
  BOTTOM_LINK1_OFFSET: 52,
};

// ============================================================================
// UI ELEMENT POSITIONS (ratios of appWidth / appHeight)
// ============================================================================
export const SLIDER_WIDTH_RATIO = 0.0842;
export const SLIDER_THUMB_OFFSET = 3.5; // px offset to align slider thumb with label
export const BPM_SLIDER_X_RATIO = 0.889;
export const BPM_SLIDER_Y_RATIO = 0.015;
export const BPM_TEXT_Y_RATIO = 0.075;
export const KIT_DROPDOWN_Y_RATIO = 0.087;
export const KIT_X_RATIOS = [0.35, 0.575]; // x position per kit dropdown, as ratio of appWidth
export const STOP_BUTTON_SIZE_RATIO = 0.0505;

// ============================================================================
// AUDIO SAMPLES & MIDI
// ============================================================================
// Maps kit display name → [hiSampleNum, midSampleNum, lowSampleNum]
export const KIT_MAP: Record<string, number[]> = {
  '909 kick, clap, hat': [1, 2, 3],
  '808 pitched bongos': [4, 5, 6],
  wood: [7, 8, 9],
  concrete: [10, 11, 12],
  'midi out (chrome only)': [13, 14, 15],
};
export const KIT_OPTIONS = Object.keys(KIT_MAP);

export const DRUM_SAMPLE_PATHS = [
  '/assets/sounds/hihat.wav',
  '/assets/sounds/clap.wav',
  '/assets/sounds/snare.wav',
  '/assets/sounds/low.wav',
  '/assets/sounds/mid.wav',
  '/assets/sounds/hi.wav',
  '/assets/sounds/wood1.wav',
  '/assets/sounds/wood2.wav',
  '/assets/sounds/Wood_Block_High.wav',
  '/assets/sounds/burp.wav',
  '/assets/sounds/noise.wav',
  '/assets/sounds/crunch.wav',
];

export const NUM_DRUM_SAMPLES = DRUM_SAMPLE_PATHS.length; // 12
export const MIDI_NOTE_START_INDEX = NUM_DRUM_SAMPLES + 1; // 13
export const NUM_MIDI_NOTES = 6;
export const MIDI_NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A5'];
export const MIDI_NOTE_DURATION_MS = 1000;
