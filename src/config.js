/**
 * Centralized configuration and constants for the Groove Pizzeria application
 */

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
export const CLICK_THRESHOLD = 0.13; // fraction of pizzaDiam used as hit-test radius

// Pizza visual properties
export const PIZZA_1_COLOR = [221, 65, 26];
export const PIZZA_2_COLOR = [60, 94, 178];
export const PIZZA_1_POSITION = { x: -0.233, y: -0.368 }; // as ratio of appWidth/appHeight
export const PIZZA_2_POSITION = { x: 0.259, y: -0.368 };
export const PIZZA_DIAMETER_RATIO = 0.2;
export const PIZZA_TEETH_OFFSET_RATIO = 0.1;

// Pizza face dimensions
export const PIZZA_TOOTH_ARC_LENGTH_RATIO = 0.086;
export const PIZZA_BUTTON_SIZE_RATIO = 0.05;
export const PIZZA_BUTTON_POSITIONS = [0.5, 0.7, 0.9]; // distance ratios from center

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

export const SPACING = {
  CONTROL_TEXT_OFFSET_X: 0.031,
  CONTROL_TEXT_OFFSET_Y: 0.003,
  CONTROL_TEXT_SMALL_Y_OFFSET: 0.006,
  DIV_SYMBOL_X_OFFSET: 0.0303,
  DIV_SYMBOL_Y_OFFSET: 0.022,
  ROTATION_LABEL_X_OFFSET: 0.190,
  STEP_RATIO_X_OFFSET: 0.156,
  STEP_TEXT_X_OFFSET: 0.085,
  TIMELINE_TOTAL_STEPS_X_OFFSET: 0.055,
  TIMELINE_TOTAL_STEPS_Y_OFFSET_1: 0.031,
  TIMELINE_TOTAL_STEPS_Y_OFFSET_2: 0.058,
};

export const TIMELINE_POSITIONS = {
  PIZZA_1_Y_RATIO: 0.017,
  PIZZA_2_Y_RATIO: 0.063,
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
export const CANVAS_WIDTH_MIN_RATIO = 0.859;
export const CANVAS_HEIGHT_TO_WIDTH_RATIO = 35 / 61;
export const NARROW_WIDTH_RATIO = 0.573;
export const TALL_HEIGHT_RATIO = 1.742;
export const NARROW_APP_WIDTH_FACTOR = 0.92;
export const TALL_APP_HEIGHT_FACTOR = 0.96;

export const LAYOUT_BREAKPOINTS = {
  NARROW: 1.9, // windowWidth / windowHeight
  TALL: 0.6,   // windowHeight / windowWidth
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
export const KIT_1_X_RATIO = 0.35;
export const KIT_2_X_RATIO = 0.575;
export const STOP_BUTTON_SIZE_RATIO = 0.0505;

// Slider anchor offsets — determine where the slice/tooth/rotate sliders
// sit relative to each pizza's x position (in translated g space).
export const SLIDER_ANCHORS = {
  SLIDERS_X_OFFSET: 0.265,
  ROTATE_X_OFFSET: 0.617,
  SLICE_Y_RATIO: 0.961,
  TOOTH_Y_RATIO: 0.887,
  ROTATE_Y_RATIO: 0.951,
};

// ============================================================================
// AUDIO SAMPLES & MIDI
// ============================================================================
// Maps kit display name → [hiSampleNum, midSampleNum, lowSampleNum]
export const KIT_MAP = {
  '909 kick, clap, hat':    [1, 2, 3],
  '808 pitched bongos':     [4, 5, 6],
  'wood':                   [7, 8, 9],
  'concrete':               [10, 11, 12],
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
