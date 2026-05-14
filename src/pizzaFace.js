import { playDrum } from './sound';
import {
  DEFAULT_BPM,
  DEFAULT_NUM_TEETH,
  COLORS,
  CLICK_THRESHOLD,
  PIZZA_DIAMETER_RATIO,
  PIZZA_TEETH_OFFSET_RATIO,
} from './config';

class PizzaFace {
  constructor({ name, x, y, numSteps, toothSliderValue, color, canvasOffset, drumSamples, appWidth, appHeight, p, sketchUpdateBPM }) {
    if (!p) {
      throw new Error('p5 instance (p) is required for PizzaFace but was not provided.');
    }

    this.name = name;
    this.position = { x, y };
    this.slices = numSteps;
    this.color = color;
    this.canvasOffset = canvasOffset;
    this.drumSamples = drumSamples;
    this.dimensions = { appWidth, appHeight };
    this.p = p;
    this.sketchUpdateBPM = sketchUpdateBPM;

    this.pizzaDiam = appWidth * PIZZA_DIAMETER_RATIO;

    console.log(`${this.name} initialized at position:`, this.position); // Debug log for position

    this.initializeState(toothSliderValue);
    this.setUp();
  }

  updateState({ slices, teeth, rotation }) {
    if (slices !== undefined) {
      this.slices = slices;
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

  initializeState(toothSliderValue) {
    this.sliceAngle = null;
    this.stepAngles = [];
    this.numTeeth = DEFAULT_NUM_TEETH;
    this.toothArcLength = 0.086 * this.dimensions.appWidth;
    this.diameter = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
    this.stepAngle = (360 / DEFAULT_NUM_TEETH) * (15 + 1) - 90;
    this.loopTime = (60 / DEFAULT_BPM) / 4 * toothSliderValue;
    this.stepTime = this.loopTime / this.slices;
    this.stepFrac = ((60 / DEFAULT_BPM) / 4 * 16) / this.stepTime;
  }

  setUp() {
    this.stepColors = Array(3).fill().map(() => Array(this.slices).fill(COLORS.GREY));
    this.clickedArrays = Array(3).fill().map(() => Array(this.slices).fill(0));
    this.vertexArrays = {
      x: Array(3).fill().map(() => Array(this.slices).fill('no')),
      y: Array(3).fill().map(() => Array(this.slices).fill('no')),
    };
    this.buttonPosArr = [0.5, 0.7, 0.9];
    this.stepColorArr = Array(3).fill().map(() => Array(this.slices).fill(COLORS.GREY));
    this.XVerticesArray = Array(3).fill().map(() => Array(this.slices).fill('no'));
    this.YVerticesArray = Array(3).fill().map(() => Array(this.slices).fill('no'));
    this.vertexArrayX1 = Array(this.slices).fill('no');
    this.nextNoteTime = 0;
    this.stepIteratorVar = 1;
    this.tmlnPlyHdArrX = [];
    this.tmlnPlyHdArrY = [];
    this.tmlnItrtr = 0;
    this.permColorArrays = Array(3).fill().map(() => Array(this.slices).fill(COLORS.GREY));
    this.permVertexArrays = Array(3).fill().map(() => Array(this.slices).fill('no'));
  }

  showFace(pizzaDiam) {
    this.pizzaDiam = pizzaDiam;
    this.p.strokeWeight(1);
    this.p.stroke(COLORS.LIGHT_GREY); // Use white for the border
    this.p.noFill();
    this.p.ellipse(this.position.x, this.position.y, this.pizzaDiam * 2); // Draw the outer border
  }

  showSpokes(numSteps) {
    this.stepAngles = [];
    this.numSteps = numSteps;
    this.intialSliceAngle = 360 / this.numSteps;
    this.sliceAngle = this.intialSliceAngle;

    this.stepAngles[0] = 360;
    let i = 1;
    while (this.sliceAngle < 361 - this.intialSliceAngle) {
      this.stepAngles[i] = this.sliceAngle;
      i++;
      this.sliceAngle = this.sliceAngle + this.intialSliceAngle;
    }

    this.p.stroke(COLORS.MEDIUM_GREY);

    for (let i = 0; i < this.numSteps; i++) {
      this.p.strokeWeight(1);
      this.p.line(
        this.position.x,
        this.position.y,
        this.position.x + this.pizzaDiam * this.p.cos(this.stepAngles[i] - 90),
        this.position.y + this.pizzaDiam * this.p.sin(this.stepAngles[i] - 90)
      );

      for (let j = 0; j < this.buttonPosArr.length; j++) {
        this.p.strokeWeight(0);
        const fillColor = this.stepColorArr[j][i] === 0 ? this.p.color(0) : this.stepColorArr[j][i] || COLORS.GREY;
        this.p.fill(fillColor);
        this.p.ellipse(
          this.position.x + this.pizzaDiam * this.buttonPosArr[j] * this.p.cos(this.stepAngles[i] - 90),
          this.position.y + this.pizzaDiam * this.buttonPosArr[j] * this.p.sin(this.stepAngles[i] - 90),
          this.pizzaDiam * 0.05,
          this.pizzaDiam * 0.05
        );
      }
    }
  }

  showTeeth(toothSliderValue) {
    this.p.stroke(COLORS.LIGHT_GREY);
    this.p.strokeWeight(2); // Adjust stroke weight for teeth

    this.initialToothAngle = 360 / toothSliderValue; // Calculate angle between teeth
    this.toothOffset = this.pizzaDiam * PIZZA_TEETH_OFFSET_RATIO; // Set offset for teeth length

    for (let i = 0; i < toothSliderValue; i++) {
      const angle = this.initialToothAngle * i - 90;
      this.p.line(
        this.position.x + this.pizzaDiam * this.p.cos(angle),
        this.position.y + this.pizzaDiam * this.p.sin(angle),
        this.position.x + (this.pizzaDiam + this.toothOffset) * this.p.cos(angle),
        this.position.y + (this.pizzaDiam + this.toothOffset) * this.p.sin(angle)
      );
    }
  }

  showPlayHead() {
    this.p.stroke(this.color);
    this.p.strokeWeight(Math.ceil(this.dimensions.appWidth * 0.0081));
    this.p.line(
      this.position.x + this.pizzaDiam * this.p.cos(this.stepAngle),
      this.position.y + this.pizzaDiam * this.p.sin(this.stepAngle),
      this.position.x + (this.pizzaDiam + this.toothOffset) * this.p.cos(this.stepAngle),
      this.position.y + (this.pizzaDiam + this.toothOffset) * this.p.sin(this.stepAngle)
    );
  }

  showShapes() {
    this.p.strokeWeight(1);
    this.p.stroke(this.color[0], this.color[1], this.color[2], 100);
    this.p.fill(this.color[0], this.color[1], this.color[2], 50);
  
    for (let l = 0; l < this.vertexArrayX1.length; l++) {
      for (let i = 0; i < this.XVerticesArray.length; i++) {
        if (this.XVerticesArray[i][l] !== "no") {
          this.XVerticesArray[i][l] =
            this.position.x +
            this.pizzaDiam * this.buttonPosArr[i] * this.p.cos(this.stepAngles[l] - 90);
          this.YVerticesArray[i][l] =
            this.position.y +
            this.pizzaDiam * this.buttonPosArr[i] * this.p.sin(this.stepAngles[l] - 90);
        }
      }
    }
  
    for (let i = 0; i < this.XVerticesArray.length; i++) {
      this.p.beginShape();
      for (let j = 0; j < this.vertexArrayX1.length; j++) {
        if (this.XVerticesArray[i][j] !== "no") {
          this.p.vertex(this.XVerticesArray[i][j], this.YVerticesArray[i][j]);
        }
      }
      this.p.endShape(this.p.CLOSE);
    }
  }

  showTimeline(ypos, lcm) {
    this.timeLineYPos = ypos;
    this.loopRpts = lcm / this.numTeeth;
    let bump = 0;
    for (let j = 0; j < this.loopRpts; j++) {
      const nub = this.dimensions.appWidth * 0.0027;
  
      if (j === this.loopRpts - 1) {
        this.p.stroke(COLORS.GREY);
        this.p.textSize(Math.ceil(this.dimensions.appWidth * 0.0134));
        this.p.strokeWeight(0);
        this.p.fill(this.color[0], this.color[1], this.color[2], 90);
        const loopText = j + 1 === 1 ? "loop" : "loops";
        this.p.text(
          `${j + 1} ${loopText} (${this.loopTime.toFixed(1)} s)`,
          -0.484 * this.dimensions.appWidth,
          this.timeLineYPos + Math.ceil(this.dimensions.appWidth * 0.0211)
        );
      }
  
      for (let i = 0; i < this.numTeeth; i++) {
        if (i === 0) {
          this.p.stroke(this.color[0], this.color[1], this.color[2], 200);
          this.tmlnPlyHdArrX[j] = -0.484 * this.dimensions.appWidth + bump;
          this.tmlnPlyHdArrY[j] = this.timeLineYPos;
        } else {
          this.p.stroke(this.color[0], this.color[1], this.color[2], 90);
        }
        this.p.strokeWeight(2);
        this.p.line(
          -0.484 * this.dimensions.appWidth + bump,
          this.timeLineYPos,
          -0.484 * this.dimensions.appWidth + bump,
          this.timeLineYPos + Math.ceil(this.dimensions.appWidth * 0.0084)
        );
        bump += nub;
      }
    }
    this.totalLoopLengthXPos = -0.475 * this.dimensions.appWidth + bump;
  }

  showTotalSteps(lcm, ttlPatternTime) {
    this.p.strokeWeight(0);
    this.p.stroke(COLORS.GREY);
    this.p.fill(COLORS.GREY);
    this.p.textSize(Math.ceil(this.dimensions.appWidth * 0.0168));
    this.p.text(
      `${lcm} time unit`,
      this.totalLoopLengthXPos + this.dimensions.appWidth * 0.055,
      this.timeLineYPos + 0.031 * this.dimensions.appHeight
    );
    this.p.text(
      `pattern (${ttlPatternTime.toFixed(1)} s)`,
      this.totalLoopLengthXPos + this.dimensions.appWidth * 0.055,
      this.timeLineYPos + 0.058 * this.dimensions.appHeight
    );
  }

  timeLineCounter(i) {
    if (this.stepIteratorVar === 1) {
      if (i === 0) {
        i = this.tmlnPlyHdArrX.length - 1;
      } else {
        i = i - 1;
      }
      this.p.stroke(0);
      this.p.strokeWeight(6);
      this.p.line(
        this.tmlnPlyHdArrX[i],
        this.tmlnPlyHdArrY[i],
        this.tmlnPlyHdArrX[i],
        this.tmlnPlyHdArrY[i] + Math.ceil(this.dimensions.appWidth * 0.0084)
      );
    }
  }

  syncSpoke(stepVar1, stepVar2) {
    if (stepVar1 == 1 && stepVar2 == 1) {
      this.p.stroke(120);
      this.p.strokeWeight(3);
      this.p.line(
        this.position.x,
        this.position.y,
        this.position.x + this.pizzaDiam * this.p.cos(this.stepAngles[0] - 90),
        this.position.y + this.pizzaDiam * this.p.sin(this.stepAngles[0] - 90)
      );
    }
  }

  dragged(px, py) {
    const distance = this.p.dist(px, py, this.position.x, this.position.y);
    if (distance < this.pizzaDiam / 2) {
      this.position.x = px;
      this.position.y = py;
    }
  }

  pressed(px, py) {
    px = px - this.canvasOffset;
    py = py - this.canvasOffset;
    
    let closestDot = null;
    let minDistance = Infinity;

    for (let i = 0; i < this.stepAngles.length; i++) {
      for (let j = 0; j < this.buttonPosArr.length; j++) {
        const dotX = this.position.x + this.pizzaDiam * this.buttonPosArr[j] * this.p.cos(this.stepAngles[i] - 90);
        const dotY = this.position.y + this.pizzaDiam * this.buttonPosArr[j] * this.p.sin(this.stepAngles[i] - 90);
        const distance = this.p.dist(px, py, dotX, dotY);

        if (distance < minDistance && distance < this.pizzaDiam * CLICK_THRESHOLD) {
          minDistance = distance;
          closestDot = { i, j, dotX, dotY };
        }
      }
    }

    if (closestDot) {
      const { i, j, dotX, dotY } = closestDot;
      console.log(`Closest dot clicked at index [${j}][${i}]`); // Debugging log

      if (this.stepColorArr[j][i] === COLORS.GREY) {
        this.stepColorArr[j][i] = 0;
        console.log(`stepColorArr[${j}][${i}] set to 0`); // Debugging log
        this.XVerticesArray[j][i] = dotX;
        this.YVerticesArray[j][i] = dotY;
        this.clickedArrays[j][i] = 1; // Update the correct clicked array
      } else if (this.stepColorArr[j][i] === 0) {
        this.stepColorArr[j][i] = COLORS.GREY;
        console.log(`stepColorArr[${j}][${i}] reset to GREY`); // Debugging log
        this.XVerticesArray[j][i] = "no";
        this.YVerticesArray[j][i] = "no";
        this.clickedArrays[j][i] = 0; // Reset the correct clicked array
      }
    }
  }

  nextNote(globalBPM) {
    const secondsPerBeat = 60.0 / globalBPM;
    const secondsPerSixteenth = secondsPerBeat * 0.25;
    const secondsPerRotation = secondsPerSixteenth * this.numTeeth;
    this.secondsPerStep = secondsPerRotation / this.slices;
    this.nextNoteTime += this.secondsPerStep;
  }

  incrementSoundLaunch(nextNoteTime) {
    if (this.stepIteratorVar == 0) {
      if (this.tmlnItrtr == this.tmlnPlyHdArrX.length - 1) {
        this.tmlnItrtr = 0;
      } else if (this.tmlnItrtr != this.tmlnPlyHdArrX.length - 1) {
        this.tmlnItrtr++;
      }
    }

    for (let i = 0; i < this.stepColorArr.length; i++) {
      if (this.stepColorArr[i][this.stepIteratorVar] == 0) {
        playDrum(nextNoteTime, this.drumSamples[i]);
      }
    }

    if (this.stepIteratorVar <= this.stepAngles.length - 2) {
      this.stepAngle = (360 / this.slices) * this.stepIteratorVar - 90;
      this.stepIteratorVar++;
    } else if (this.stepIteratorVar == this.stepAngles.length - 1 || this.stepIteratorVar > this.stepAngles.length - 1) {
      this.stepIteratorVar = this.stepAngles.length - 1;
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

  clearSteps() {
    // Implementation for clearing steps
  }
}

export default PizzaFace;
