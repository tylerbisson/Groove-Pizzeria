/**
 * PizzaSequencer
 *
 * Audio-only sequencer class. Tracks timing state (nextNoteTime, currentStep,
 * stepAngle) and fires drum samples or MIDI notes on schedule. One instance
 * per pizza; all visual geometry lives in PizzaGeometry (see dimensions.ts).
 *
 * Key methods called by the scheduler loop (useSequencer):
 *   incrementSoundLaunch(nextNoteTime, steps) — fire sounds for the current
 *     step, advance the playhead angle, then move to the next step.
 *   nextNote(bpm) — advance nextNoteTime by one step duration.
 */
import { playDrum } from './audio';
import type { RGB, PizzaSteps } from './types';
import {
  DEFAULT_NUM_TEETH,
  TIMELINE_POSITIONS,
  TEXT_SIZES,
  SIXTEENTH_NOTE_RATIO,
} from './config';

export interface PizzaSequencerOptions {
  name: string;
  numSteps: number;
  color: RGB;
  drumSamples: number[];
  onTeethChange: () => void;
}

class PizzaSequencer {
  name: string;
  slices: number;
  color: RGB;
  drumSamples: number[];
  onTeethChange: () => void;
  numTeeth: number;
  stepAngle: number;
  nextNoteTime: number;
  currentStep: number;
  timelinePlayheadX: number[];
  timelineIndex: number;
  stepAngles: number[];
  secondsPerStep: number;

  constructor({ name, numSteps, color, drumSamples, onTeethChange }: PizzaSequencerOptions) {
    this.name = name;
    this.slices = numSteps;
    this.color = color;
    this.drumSamples = drumSamples;
    this.onTeethChange = onTeethChange;
    this.numTeeth = DEFAULT_NUM_TEETH;
    this.stepAngle = 0;
    this.nextNoteTime = 0;
    this.currentStep = 0;
    this.timelinePlayheadX = [];
    this.timelineIndex = 0;
    this.stepAngles = [];
    this.secondsPerStep = 0;
    this.computeStepAngles();
  }

  // Recomputes spoke angles for the current slice count. Index 0 = 0° (12 o'clock).
  computeStepAngles(): void {
    const sliceAngle = 360 / this.slices;
    this.stepAngles = Array.from({ length: this.slices }, (_, i) => i * sliceAngle);
  }

  // Computes the x positions for the timeline playhead at each loop repetition.
  computeTimeline(lcm: number, appWidth: number): void {
    const loopRpts = Math.round(lcm / this.numTeeth);
    const nub = appWidth * TEXT_SIZES.TIMELINE_NUB;
    let bump = 0;
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
    this.onTeethChange();
  }

  nextNote(globalBPM: number): void {
    const secondsPerBeat = 60.0 / globalBPM;
    const secondsPerSixteenth = secondsPerBeat * SIXTEENTH_NOTE_RATIO;
    const secondsPerRotation = secondsPerSixteenth * this.numTeeth;
    this.secondsPerStep = secondsPerRotation / this.slices;
    this.nextNoteTime += this.secondsPerStep;
  }

  // Fires sounds for the current step, advances the playhead angle, then moves to the next step.
  // Timeline advances when a full loop completes (currentStep wraps back to 0).
  // steps is passed from React state so the scheduler always reads current values.
  incrementSoundLaunch(nextNoteTime: number, steps: PizzaSteps): void {
    for (let i = 0; i < steps.length; i++) {
      if (steps[i][this.currentStep]) {
        playDrum(nextNoteTime, this.drumSamples[i]);
      }
    }

    this.stepAngle = this.stepAngles[this.currentStep];
    const nextStep = (this.currentStep + 1) % this.slices;
    if (nextStep === 0) {
      this.timelineIndex =
        this.timelineIndex === this.timelinePlayheadX.length - 1 ? 0 : this.timelineIndex + 1;
    }
    this.currentStep = nextStep;
  }
}

export default PizzaSequencer;
