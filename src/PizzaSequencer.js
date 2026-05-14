import { playDrum } from './audio';
import {
  DEFAULT_BPM,
  DEFAULT_NUM_TEETH,
  PIZZA_DIAMETER_RATIO,
  PIZZA_TEETH_OFFSET_RATIO,
  PIZZA_TOOTH_ARC_LENGTH_RATIO,
  PIZZA_BUTTON_POSITIONS,
  TIMELINE_POSITIONS,
  TEXT_SIZES,
  SIXTEENTH_NOTE_RATIO,
} from './config';

class PizzaSequencer {
  constructor({ name, x, y, numSteps, toothSliderValue, color, drumSamples, appWidth, onTeethChange }) {
    this.name         = name;
    this.position     = { x, y };
    this.slices       = numSteps;
    this.color        = color;
    this.drumSamples  = drumSamples;
    this.onTeethChange = onTeethChange;
    this.pizzaDiam    = appWidth * PIZZA_DIAMETER_RATIO;
    this.buttonPosArr = PIZZA_BUTTON_POSITIONS;

    this.initialize(toothSliderValue, appWidth);
    this.computeStepAngles();
  }

  // Sets up all timing and playback state. Called once at construction.
  initialize(toothSliderValue, appWidth) {
    this.numTeeth         = DEFAULT_NUM_TEETH;
    this.toothArcLength   = PIZZA_TOOTH_ARC_LENGTH_RATIO * appWidth;
    this.diameter         = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
    this.toothOffset      = this.pizzaDiam * PIZZA_TEETH_OFFSET_RATIO;
    this.stepAngle        = 360; // 12 o'clock — matches stepAngles[0]
    this.loopTime         = (60 / DEFAULT_BPM) / 4 * toothSliderValue;
    this.stepTime         = this.loopTime / this.slices;
    this.stepNoteValue    = ((60 / DEFAULT_BPM) / 4 * 16) / this.stepTime;
    this.nextNoteTime     = 0;
    this.currentStep      = 1;
    this.timelinePlayheadX = [];
    this.timelinePlayheadY = [];
    this.timelineIndex    = 0;
    this.stepAngles       = [];
  }

  // Recomputes spoke angles for the current slice count.
  computeStepAngles() {
    const angles = [];
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
  computeTimeline(ypos, lcm, appWidth) {
    this.timeLineYPos      = ypos;
    this.loopRpts          = lcm / this.numTeeth;
    const nub              = appWidth * TEXT_SIZES.TIMELINE_NUB;
    let bump               = 0;
    this.timelinePlayheadX = [];
    this.timelinePlayheadY = [];
    for (let j = 0; j < this.loopRpts; j++) {
      for (let i = 0; i < this.numTeeth; i++) {
        if (i === 0) {
          this.timelinePlayheadX[j] = TIMELINE_POSITIONS.LINE_X_RATIO * appWidth + bump;
          this.timelinePlayheadY[j] = ypos;
        }
        bump += nub;
      }
    }
    this.totalLoopLengthXPos = TIMELINE_POSITIONS.LOOP_LENGTH_X_RATIO * appWidth + bump;
  }

  updateState({ slices, teeth }) {
    if (slices !== undefined && slices !== this.slices) {
      this.slices = slices;
      this.computeStepAngles();
    }
    if (teeth !== undefined) {
      this.numTeeth = teeth;
    }
    this.onTeethCountChange();
  }

  nextNote(globalBPM) {
    const secondsPerBeat      = 60.0 / globalBPM;
    const secondsPerSixteenth = secondsPerBeat * SIXTEENTH_NOTE_RATIO;
    const secondsPerRotation  = secondsPerSixteenth * this.numTeeth;
    this.secondsPerStep       = secondsPerRotation / this.slices;
    this.nextNoteTime        += this.secondsPerStep;
  }

  // Fires sounds for the current step, then advances to the next step.
  // stepColorArr is passed from React state so the scheduler always reads current values.
  incrementSoundLaunch(nextNoteTime, stepColorArr) {
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
  onTeethCountChange() {
    this.onTeethChange();
    this.diameter = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
  }
}

export default PizzaSequencer;
