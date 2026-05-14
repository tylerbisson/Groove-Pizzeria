import { playDrum } from './sound';
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


class PizzaFace {
  constructor({ name, x, y, numSteps, toothSliderValue, color, drumSamples, appWidth, appHeight, sketchUpdateBPM }) {
    this.name = name;
    this.position = { x, y };
    this.slices = numSteps;
    this.color = color;
    this.drumSamples = drumSamples;
    this.dimensions = { appWidth, appHeight };
    this.sketchUpdateBPM = sketchUpdateBPM;
    this.pizzaDiam = appWidth * PIZZA_DIAMETER_RATIO;
    this.buttonPosArr = PIZZA_BUTTON_POSITIONS;

    this.initializeState(toothSliderValue);
    this.setUp();
    this.computeStepAngles();
  }

  computeStepAngles() {
    const stepAngles = [];
    const sliceAngle = 360 / this.slices;
    stepAngles[0] = 360;
    let angle = sliceAngle;
    let i = 1;
    while (angle < 361 - sliceAngle) {
      stepAngles[i] = angle;
      i++;
      angle += sliceAngle;
    }
    this.stepAngles = stepAngles;
    this.numSteps = this.slices;
  }

  computeTimeline(ypos, lcm, appWidth) {
    this.timeLineYPos = ypos;
    this.loopRpts = lcm / this.numTeeth;
    const nub = appWidth * TEXT_SIZES.TIMELINE_NUB;
    let bump = 0;
    this.tmlnPlyHdArrX = [];
    this.tmlnPlyHdArrY = [];
    for (let j = 0; j < this.loopRpts; j++) {
      for (let i = 0; i < this.numTeeth; i++) {
        if (i === 0) {
          this.tmlnPlyHdArrX[j] = TIMELINE_POSITIONS.LINE_X_RATIO * appWidth + bump;
          this.tmlnPlyHdArrY[j] = ypos;
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
    this.teethTest();
  }

  initializeState(toothSliderValue) {
    this.stepAngles = [];
    this.numTeeth = DEFAULT_NUM_TEETH;
    this.toothArcLength = PIZZA_TOOTH_ARC_LENGTH_RATIO * this.dimensions.appWidth;
    this.diameter = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
    this.toothOffset = this.pizzaDiam * PIZZA_TEETH_OFFSET_RATIO;
    // 360 = first spoke position (12 o'clock), matching stepAngles[0]
    this.stepAngle = 360;
    this.loopTime = (60 / DEFAULT_BPM) / 4 * toothSliderValue;
    this.stepTime = this.loopTime / this.slices;
    this.stepFrac = ((60 / DEFAULT_BPM) / 4 * 16) / this.stepTime;
  }

  setUp() {
    this.nextNoteTime = 0;
    this.stepIteratorVar = 1;
    this.tmlnPlyHdArrX = [];
    this.tmlnPlyHdArrY = [];
    this.tmlnItrtr = 0;
  }

  nextNote(globalBPM) {
    const secondsPerBeat = 60.0 / globalBPM;
    const secondsPerSixteenth = secondsPerBeat * SIXTEENTH_NOTE_RATIO;
    const secondsPerRotation = secondsPerSixteenth * this.numTeeth;
    this.secondsPerStep = secondsPerRotation / this.slices;
    this.nextNoteTime += this.secondsPerStep;
  }

  // stepColorArr is passed in from React state so the sequencer always reads current values.
  incrementSoundLaunch(nextNoteTime, stepColorArr) {
    if (this.stepIteratorVar === 0) {
      if (this.tmlnItrtr === this.tmlnPlyHdArrX.length - 1) {
        this.tmlnItrtr = 0;
      } else {
        this.tmlnItrtr++;
      }
    }

    for (let i = 0; i < stepColorArr.length; i++) {
      if (stepColorArr[i][this.stepIteratorVar] === 0) {
        playDrum(nextNoteTime, this.drumSamples[i]);
      }
    }

    const lastIdx = this.stepAngles.length - 1;
    if (this.stepIteratorVar <= lastIdx - 1) {
      this.stepAngle = (360 / this.slices) * this.stepIteratorVar || 360;
      this.stepIteratorVar++;
    } else {
      this.stepIteratorVar = lastIdx;
      this.stepAngle = (360 / this.slices) * this.stepIteratorVar || 360;
      this.stepIteratorVar = 0;
    }
  }

  teethTest() {
    this.initialToothAngle = 360 / this.numTeeth;
    this.sketchUpdateBPM();
    this.diameter = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
  }
}

export default PizzaFace;
