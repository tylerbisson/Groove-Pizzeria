/**
 * PizzaSequencer
 *
 * Audio-only sequencer class. Tracks timing state (nextNoteTime, currentStep,
 * stepAngle) and fires drum samples or MIDI notes on schedule. One instance
 * per pizza; all visual state lives in React.
 *
 * Key methods called by the scheduler loop (useSequencer):
 *   incrementSoundLaunch(nextNoteTime, stepColorArr) — fire sounds for the
 *     current step, then advance currentStep and stepAngle.
 *   nextNote(bpm) — advance nextNoteTime by one step duration.
 */
import { playDrum } from './audio';
import type { RGB, PizzaSteps } from './types';
import {
  DEFAULT_NUM_TEETH,
  PIZZA_DIAMETER_RATIO,
  PIZZA_TEETH_OFFSET_RATIO,
  PIZZA_TOOTH_ARC_LENGTH_RATIO,
  PIZZA_BUTTON_POSITIONS,
  TIMELINE_POSITIONS,
  TEXT_SIZES,
  SIXTEENTH_NOTE_RATIO,
} from './config';

export interface PizzaSequencerOptions {
  name: string;
  x: number;
  y: number;
  numSteps: number;
  color: RGB;
  drumSamples: number[];
  appWidth: number;
  onTeethChange: () => void;
}

class PizzaSequencer {
  name: string;
  position: { x: number; y: number };
  slices: number;
  color: RGB;
  drumSamples: number[];
  onTeethChange: () => void;
  pizzaDiam: number;
  buttonPosArr: number[];
  numTeeth: number;
  toothArcLength: number;
  diameter: number;
  toothOffset: number;
  stepAngle: number;
  nextNoteTime: number;
  currentStep: number;
  timelinePlayheadX: number[];
  timelineIndex: number;
  stepAngles: number[];
  numSteps: number;
  secondsPerStep: number;

  constructor({ name, x, y, numSteps, color, drumSamples, appWidth, onTeethChange }: PizzaSequencerOptions) {
    this.name          = name;
    this.position      = { x, y };
    this.slices        = numSteps;
    this.color         = color;
    this.drumSamples   = drumSamples;
    this.onTeethChange = onTeethChange;
    this.pizzaDiam     = appWidth * PIZZA_DIAMETER_RATIO;
    this.buttonPosArr  = PIZZA_BUTTON_POSITIONS;
    this.numTeeth      = DEFAULT_NUM_TEETH;
    this.toothArcLength = PIZZA_TOOTH_ARC_LENGTH_RATIO * appWidth;
    this.diameter      = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
    this.toothOffset   = this.pizzaDiam * PIZZA_TEETH_OFFSET_RATIO;
    this.stepAngle     = 360; // 12 o'clock — matches stepAngles[0]
    this.nextNoteTime  = 0;
    this.currentStep   = 1;
    this.timelinePlayheadX = [];
    this.timelineIndex = 0;
    this.stepAngles    = [];
    this.numSteps      = numSteps;
    this.secondsPerStep = 0;
    this.computeStepAngles();
  }

  // Recomputes spoke angles for the current slice count.
  computeStepAngles(): void {
    const angles: number[] = [];
    const sliceAngle = 360 / this.slices;
    angles[0] = 360;
    let angle = sliceAngle;
    let i = 1;
    while (angle < 361 - sliceAngle) {
      angles[i++] = angle;
      angle += sliceAngle;
    }
    this.stepAngles = angles;
    this.numSteps   = this.slices;
  }

  // Computes the x positions for the timeline playhead at each loop repetition.
  computeTimeline(lcm: number, appWidth: number): void {
    const loopRpts         = Math.round(lcm / this.numTeeth);
    const nub              = appWidth * TEXT_SIZES.TIMELINE_NUB;
    let bump               = 0;
    this.timelinePlayheadX = [];
    for (let j = 0; j < loopRpts; j++) {
      for (let i = 0; i < this.numTeeth; i++) {
        if (i === 0) {
          this.timelinePlayheadX[j] = TIMELINE_POSITIONS.LINE_X_RATIO * appWidth + bump;
        }
        bump += nub;
      }
    }
  }

  updateState({ slices, teeth }: { slices?: number; teeth?: number }): void {
    if (slices !== undefined && slices !== this.slices) {
      this.slices = slices;
      this.computeStepAngles();
    }
    if (teeth !== undefined) {
      this.numTeeth = teeth;
    }
    this.onTeethCountChange();
  }

  nextNote(globalBPM: number): void {
    const secondsPerBeat      = 60.0 / globalBPM;
    const secondsPerSixteenth = secondsPerBeat * SIXTEENTH_NOTE_RATIO;
    const secondsPerRotation  = secondsPerSixteenth * this.numTeeth;
    this.secondsPerStep       = secondsPerRotation / this.slices;
    this.nextNoteTime        += this.secondsPerStep;
  }

  // Fires sounds for the current step, then advances to the next step.
  // stepColorArr is passed from React state so the scheduler always reads current values.
  incrementSoundLaunch(nextNoteTime: number, stepColorArr: PizzaSteps): void {
    if (this.currentStep === 0) {
      this.timelineIndex =
        this.timelineIndex === this.timelinePlayheadX.length - 1
          ? 0
          : this.timelineIndex + 1;
    }

    for (let i = 0; i < stepColorArr.length; i++) {
      if (stepColorArr[i][this.currentStep] === 0) {
        playDrum(nextNoteTime, this.drumSamples[i]);
      }
    }

    const lastIdx = this.stepAngles.length - 1;
    if (this.currentStep <= lastIdx - 1) {
      this.stepAngle = (360 / this.slices) * this.currentStep || 360;
      this.currentStep++;
    } else {
      this.currentStep = lastIdx;
      this.stepAngle   = (360 / this.slices) * this.currentStep || 360;
      this.currentStep = 0;
    }
  }

  // Called whenever tooth count changes — syncs the clock callback and recomputes diameter.
  private onTeethCountChange(): void {
    this.onTeethChange();
    this.diameter = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
  }
}

export default PizzaSequencer;
