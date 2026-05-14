import { playDrum } from './sound';
import {
  DEFAULT_BPM,
  DEFAULT_NUM_TEETH,
  COLORS,
  PIZZA_DIAMETER_RATIO,
  PIZZA_TEETH_OFFSET_RATIO,
  PIZZA_TOOTH_ARC_LENGTH_RATIO,
  PIZZA_BUTTON_POSITIONS,
  PIZZA_STEP_ANGLE_OFFSET,
  TIMELINE_POSITIONS,
  TEXT_SIZES,
  SIXTEENTH_NOTE_RATIO,
} from './config';

const DEG2RAD = Math.PI / 180;
export const cosDeg = (deg) => Math.cos(deg * DEG2RAD);
export const sinDeg = (deg) => Math.sin(deg * DEG2RAD);

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

  // Computes the spoke angles for the current slice count.
  // Replaces the angle-computation portion of the old showSpokes().
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

  // Computes timeline playhead positions without drawing.
  // Must be called each render from GrooveCanvas with current lcm.
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

  updateState({ slices, teeth, rotation }) {
    if (slices !== undefined && slices !== this.slices) {
      this.slices = slices;
      this._resizeStepArrays();
      this.computeStepAngles();
    }
    if (teeth !== undefined) {
      this.numTeeth = teeth;
    }
    if (rotation !== undefined) {
      this.rotation = rotation;
      this.rotateShapes(rotation);
    }
    this.teethTest();
  }

  _resizeStepArrays() {
    const n = this.slices;
    for (let k = 0; k < 3; k++) {
      while (this.stepColorArr[k].length < n) {
        this.stepColorArr[k].push(COLORS.GREY);
        this.XVerticesArray[k].push('no');
        this.YVerticesArray[k].push('no');
        this.clickedArrays[k].push(0);
        this.permColorArrays[k].push(COLORS.GREY);
        this.permVertexArrays[k].push('no');
      }
      if (this.stepColorArr[k].length > n) {
        this.stepColorArr[k] = this.stepColorArr[k].slice(0, n);
        this.XVerticesArray[k] = this.XVerticesArray[k].slice(0, n);
        this.YVerticesArray[k] = this.YVerticesArray[k].slice(0, n);
        this.clickedArrays[k] = this.clickedArrays[k].slice(0, n);
        this.permColorArrays[k] = this.permColorArrays[k].slice(0, n);
        this.permVertexArrays[k] = this.permVertexArrays[k].slice(0, n);
      }
    }
    this.vertexArrayX1 = Array(n).fill('no');
  }

  initializeState(toothSliderValue) {
    this.stepAngles = [];
    this.numTeeth = DEFAULT_NUM_TEETH;
    this.toothArcLength = PIZZA_TOOTH_ARC_LENGTH_RATIO * this.dimensions.appWidth;
    this.diameter = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
    this.toothOffset = this.pizzaDiam * PIZZA_TEETH_OFFSET_RATIO;
    this.stepAngle = (360 / DEFAULT_NUM_TEETH) * PIZZA_STEP_ANGLE_OFFSET - 90;
    this.loopTime = (60 / DEFAULT_BPM) / 4 * toothSliderValue;
    this.stepTime = this.loopTime / this.slices;
    this.stepFrac = ((60 / DEFAULT_BPM) / 4 * 16) / this.stepTime;
    this.rotation = 0;
    this.prevRotNum = 0;
  }

  setUp() {
    this.clickedArrays = Array(3).fill(null).map(() => Array(this.slices).fill(0));
    this.stepColorArr = Array(3).fill(null).map(() => Array(this.slices).fill(COLORS.GREY));
    this.XVerticesArray = Array(3).fill(null).map(() => Array(this.slices).fill('no'));
    this.YVerticesArray = Array(3).fill(null).map(() => Array(this.slices).fill('no'));
    this.vertexArrayX1 = Array(this.slices).fill('no');
    this.nextNoteTime = 0;
    this.stepIteratorVar = 1;
    this.tmlnPlyHdArrX = [];
    this.tmlnPlyHdArrY = [];
    this.tmlnItrtr = 0;
    this.permColorArrays = Array(3).fill(null).map(() => Array(this.slices).fill(COLORS.GREY));
    this.permVertexArrays = Array(3).fill(null).map(() => Array(this.slices).fill('no'));
  }

  // Toggles a specific dot on/off. Replaces the closest-dot search in pressed().
  toggleStep(ringIdx, stepIdx) {
    if (this.stepColorArr[ringIdx][stepIdx] === COLORS.GREY) {
      this.stepColorArr[ringIdx][stepIdx] = 0;
      this.XVerticesArray[ringIdx][stepIdx] = 'active';
      this.clickedArrays[ringIdx][stepIdx] = 1;
    } else {
      this.stepColorArr[ringIdx][stepIdx] = COLORS.GREY;
      this.XVerticesArray[ringIdx][stepIdx] = 'no';
      this.clickedArrays[ringIdx][stepIdx] = 0;
    }
  }

  clearSteps() {
    for (let k = 0; k < 3; k++) {
      this.stepColorArr[k] = Array(this.slices).fill(COLORS.GREY);
      this.XVerticesArray[k] = Array(this.slices).fill('no');
      this.YVerticesArray[k] = Array(this.slices).fill('no');
      this.clickedArrays[k] = Array(this.slices).fill(0);
    }
  }

  nextNote(globalBPM) {
    const secondsPerBeat = 60.0 / globalBPM;
    const secondsPerSixteenth = secondsPerBeat * SIXTEENTH_NOTE_RATIO;
    const secondsPerRotation = secondsPerSixteenth * this.numTeeth;
    this.secondsPerStep = secondsPerRotation / this.slices;
    this.nextNoteTime += this.secondsPerStep;
  }

  incrementSoundLaunch(nextNoteTime) {
    if (this.stepIteratorVar === 0) {
      if (this.tmlnItrtr === this.tmlnPlyHdArrX.length - 1) {
        this.tmlnItrtr = 0;
      } else {
        this.tmlnItrtr++;
      }
    }

    for (let i = 0; i < this.stepColorArr.length; i++) {
      if (this.stepColorArr[i][this.stepIteratorVar] === 0) {
        playDrum(nextNoteTime, this.drumSamples[i]);
      }
    }

    const lastIdx = this.stepAngles.length - 1;
    if (this.stepIteratorVar <= lastIdx - 1) {
      this.stepAngle = (360 / this.slices) * this.stepIteratorVar - 90;
      this.stepIteratorVar++;
    } else {
      this.stepIteratorVar = lastIdx;
      this.stepAngle = (360 / this.slices) * this.stepIteratorVar - 90;
      this.stepIteratorVar = 0;
    }
  }

  teethTest() {
    this.initialToothAngle = 360 / this.numTeeth;
    this.sketchUpdateBPM();
    this.diameter = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
  }

  rotateShapes(rotNum) {
    this.rotNum = rotNum;
    let j = 0;
    for (let i = 0; i < this.slices; i++) {
      if (i + this.prevRotNum < this.slices) {
        for (let k = 0; k < this.permColorArrays.length; k++) {
          this.permColorArrays[k][i] = this.stepColorArr[k][this.prevRotNum + i];
          this.permVertexArrays[k][i] = this.XVerticesArray[k][this.prevRotNum + i];
        }
      } else {
        for (let k = 0; k < this.permColorArrays.length; k++) {
          this.permColorArrays[k][i] = this.stepColorArr[k][j];
          this.permVertexArrays[k][i] = this.XVerticesArray[k][j];
        }
        j++;
      }
    }

    j = 0;
    for (let i = 0; i < this.slices; i++) {
      if (i + this.rotNum < this.slices) {
        for (let k = 0; k < this.permColorArrays.length; k++) {
          this.stepColorArr[k][i + this.rotNum] = this.permColorArrays[k][i];
          this.XVerticesArray[k][i + this.rotNum] = this.permVertexArrays[k][i];
        }
      } else {
        for (let k = 0; k < this.permColorArrays.length; k++) {
          this.stepColorArr[k][j] = this.permColorArrays[k][i];
          this.XVerticesArray[k][j] = this.permVertexArrays[k][i];
        }
        j++;
      }
    }
    this.prevRotNum = this.rotNum;
  }
}

export default PizzaFace;
