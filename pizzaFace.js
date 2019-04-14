class PizzaFace {

	constructor(name, x_pos, y_pos, numSteps, toothSliderValue, color, canvasOffset, drumSamples){
		this.name = name;
		this.x_pos = x_pos;
		this.y_pos = y_pos;
		this.slices = numSteps;
		this.color = color;
		this.canvasOffset = canvasOffset;
		this.drumSamples = drumSamples;

		this.sliceAngle = null;
		this.grey = 170;
		this.stepAngles = []; // STEP OBJECT ARRAY

    this.buttonPos1 = 0.80;
		this.buttonPos2 = 0.60;
		this.buttonPos3 = 0.40;
		this.buttonPosArr = [0.8, 0.6, 0.4];

    this.buttonWidth = 8;
		this.buttonHeight = 8;
	
    this.initialToothAngle = 360 / toothSliderValue;
    this.toothOffset = 10;
    this.toothAngleOffset = 90;
    this.initialSliceAngle = null;
    this.randomColor = Math.random() * 500;
		this.stepIteratorVar = 1;
		this.numTeeth = 16;
		this.bpm = bpmSlider.value();

		this.toothArcLength = (.086 * appWidth);
		this.stepAngle = (360 / 16) * (15 + 1) - 90;
		
		this.slidersXPos = this.x_pos + (.265 * appWidth); 
		this.rotateSliderXPos = this.x_pos + (.617 * appWidth); 

		this.sliceSliderYPos = this.y_pos + (1.329 * appHeight); 
		this.toothSliderYPos = this.y_pos + (1.255 * appHeight); 
		this.rotateSliderYPos = this.y_pos + (1.319 * appHeight); 

		this.sliceSlider = createSlider(2, 16, 16);
		this.sliceSlider.position(this.slidersXPos, this.sliceSliderYPos);
		this.sliceSlider.style('width', '100px');
		this.sliceSlider.parent('app');

		this.toothSlider = createSlider(2, 16, 16);
		this.toothSlider.position(this.slidersXPos, this.toothSliderYPos);
		this.toothSlider.style('width', '100px');
		this.toothSlider.parent('app');

		this.testDiam = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
		this.secondsPerStep = null;

		this.rotateSlider = createSlider(0, 16, 0);
		this.rotateSlider.position(this.rotateSliderXPos, this.rotateSliderYPos);
		this.rotateSlider.style('width', '100px');
		this.rotateSlider.parent('app');

		this.loopTime = timeUnit * this.toothSlider.value();
		this.stepTime = this.loopTime / this.sliceSlider.value();
		this.stepFrac = (timeUnit * 16) / this.stepTime;

		this.setUp();
	}

	setUp(){
		this.stepColor1 =
			[this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey];
		this.stepColor2 =
			[this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey];
		this.stepColor3 =
			[this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey];
		this.stepColorArr = [this.stepColor1, this.stepColor2, this.stepColor3];

		this.distArray1 = [];
		this.distArray2 = [];
		this.distArray3 = [];
		this.distArrays = [this.distArray1, this.distArray2, this.distArray3];

		this.oldStateArray1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.newStateArray1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.oldStateArray2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.newStateArray2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.oldStateArray3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.newStateArray3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.newStateArrays = [this.newStateArray1, this.newStateArray2, this.newStateArray3]
		this.oldStateArrays = [this.oldStateArray1, this.oldStateArray2, this.oldStateArray3]

		this.clickedArray1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.clickedArray2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.clickedArray3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.clickedArrays = [this.clickedArray1, this.clickedArray2, this.clickedArray3]

		this.vertexArrayX1 =
			["no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no"];
		this.vertexArrayY1 =
			["no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no"];
		this.vertexArrayX2 =
			["no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no"];
		this.vertexArrayY2 =
			["no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no"];
		this.vertexArrayX3 =
			["no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no"];
		this.vertexArrayY3 =
			["no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no", "no"];

		this.XVerticesArray = [this.vertexArrayX1, this.vertexArrayX2, this.vertexArrayX3];
		this.YVerticesArray = [this.vertexArrayY1, this.vertexArrayY2, this.vertexArrayY3];

		this.nextNoteTime = 0;

		this.rotNum = 0;
		this.prevRotNum = 0;

		this.permColorArrays = [[], [], []];
		this.permVertexArrays = [[], [], []];

		this.tmlnPlyHdArrX = [];
		this.tmlnPlyHdArrY = [];
		this.tmlnItrtr = 0;
	}

	showFace(pizzaDiam){
		this.pizzaDiam = pizzaDiam;
		strokeWeight(1);
		stroke(this.grey);
		noFill();
		ellipse(this.x_pos, this.y_pos, (this.pizzaDiam * 2));
	}

	showSpokes(numSteps){
		this.stepAngles = [];
		this.numSteps = numSteps;
		this.intialSliceAngle = 360/ this.numSteps;
    this.sliceAngle = this.intialSliceAngle;

			this.stepAngles[0] = 360;
      let i = 1;
      while (this.sliceAngle < 361 - this.intialSliceAngle) {
        this.stepAngles[i] = this.sliceAngle;
        i++;
        this.sliceAngle = this.sliceAngle + this.intialSliceAngle;
      }

    stroke(this.grey);

		// this.buttonWidth = 0.035 * this.pizzaDiam;
		// this.buttonHeight = 0.035 * this.pizzaDiam;

    for (let i=0; i < this.numSteps; i++) {
        line(this.x_pos, this.y_pos, ((this.pizzaDiam * cos((this.stepAngles[i]) - 90)) + this.x_pos),
          ((this.pizzaDiam * sin((this.stepAngles[i]) - 90)) + this.y_pos));

				for (let j=0; j< this.buttonPosArr.length; j++){
					fill(this.stepColorArr[j][i]);
					ellipse((((this.pizzaDiam * this.buttonPosArr[j]) * cos((this.stepAngles[i]) - 90)) + this.x_pos),
					(((this.pizzaDiam * this.buttonPosArr[j]) * sin((this.stepAngles[i]) - 90)) + this.y_pos),
					this.buttonWidth, this.buttonHeight);
				}  
				// EXPERIMENTING WITH HAVING TEXT FOR ANGLES
				// text(this.stepAngles[i], (((this.pizzaDiam * this.buttonPos1) * cos((this.stepAngles[i]) - 90)) + this.x_pos),
        //   (((this.pizzaDiam * this.buttonPos1) * sin((this.stepAngles[i]) - 90)) + this.y_pos));
    }
	}

	showTeeth(toothSliderValue) {
    stroke(this.grey);
    strokeWeight(5);
    for (var i = 0; i < toothSliderValue; i++) {
      line(((this.pizzaDiam * cos((this.initialToothAngle * i) - this.toothAngleOffset)) + this.x_pos),
        ((this.pizzaDiam * sin((this.initialToothAngle * i) - this.toothAngleOffset)) + this.y_pos),
        (((this.pizzaDiam + this.toothOffset) * cos((this.initialToothAngle * i) - this.toothAngleOffset)) + this.x_pos),
        (((this.pizzaDiam + this.toothOffset) * sin((this.initialToothAngle * i) - this.toothAngleOffset)) + this.y_pos));
    }
  }

  showPlayHead() {
		stroke(this.color);
		strokeWeight(10);
		line(((this.pizzaDiam * cos(this.stepAngle)) + this.x_pos),
			((this.pizzaDiam * sin(this.stepAngle)) + this.y_pos),
			(((this.pizzaDiam + this.toothOffset) * cos(this.stepAngle)) + this.x_pos),
			(((this.pizzaDiam + this.toothOffset) * sin(this.stepAngle)) + this.y_pos));
  }

	showShapes(){
		strokeWeight(1);
		stroke(this.color[0], this.color[1], this.color[2], 100);
		fill(this.color[0], this.color[1], this.color[2], 50);

		for (var l = 0; l < this.vertexArrayX1.length; l ++) {
			for (let i = 0; i < this.XVerticesArray.length; i++){
				if (this.XVerticesArray[i][l] != "no"){
					this.XVerticesArray[i][l] = (((this.pizzaDiam * this.buttonPosArr[i]) * cos((this.stepAngles[l]) - 90)) + this.x_pos);
					this.YVerticesArray[i][l] = (((this.pizzaDiam * this.buttonPosArr[i]) * sin((this.stepAngles[l]) - 90)) + this.y_pos);
				}
			}
		}

		for (let i = 0; i < this.XVerticesArray.length; i++) {
			beginShape();
			for (let j = 0; j < this.vertexArrayX1.length; j++) {
				if (this.XVerticesArray[i][j] != "no") {
					vertex(this.XVerticesArray[i][j], this.YVerticesArray[i][j]);
				}
			}
			endShape(CLOSE);
		}
	}

	showTimeline(ypos, lcm){
		this.timeLineYPos = ypos;
		this.loopRpts = lcm / this.numTeeth;
		var bump = 0;
		for (var j = 0; j < this.loopRpts; j++){
		let nub = (appWidth * 0.0027);

			if (j == this.loopRpts - 1){
				stroke(this.grey);
				textSize(16);
				strokeWeight(0);
				fill(this.color[0], this.color[1], this.color[2], 90);
					if (j + 1 == 1){
						text((j + 1) +
						" loop (" + this.loopTime.toFixed(1) + " s)",
						(-.484 * appWidth), this.timeLineYPos + 25);
					}
					else{
						text((j + 1) +
						" loops (" + this.loopTime.toFixed(1) + " s)",
							(-.484 * appWidth), this.timeLineYPos + 25);
					}
			}

			for (var i = 0; i < this.numTeeth; i++){
				if(i == 0){
					stroke(this.color[0], this.color[1], this.color[2], 200);
					this.tmlnPlyHdArrX[j] = (-.484 * appWidth) + bump;
					this.tmlnPlyHdArrY[j] = this.timeLineYPos;
				}
				else{
					stroke(this.color[0], this.color[1], this.color[2], 90);
				}
				strokeWeight(2);
				line(((-.484 * appWidth) + bump), this.timeLineYPos, ((-.484 * appWidth) + bump), this.timeLineYPos + 10);
				bump = bump + nub;
			}
	}
	this.totalLoopLengthXPos = (appWidth * -.475) + bump;
}

showTotalSteps(lcm, ttlPatternTime){
	strokeWeight(0);
	stroke(this.grey);
	fill(this.grey);
	textSize(20);
	strokeWeight(0);
	text(lcm + " time unit", this.totalLoopLengthXPos + (appWidth * .055), this.timeLineYPos + 0.031 * appHeight);
	text("pattern (" + ttlPatternTime.toFixed(1) + " s)",
		this.totalLoopLengthXPos + (appWidth * .055), this.timeLineYPos + 0.058 * appHeight);
}

timeLineCounter(i){
	if (this.stepIteratorVar == 1){
		if (i == 0){
			i = this.tmlnPlyHdArrX.length - 1;
		}
		else{
			i = i - 1;
		}
		stroke(0);
		strokeWeight(6);
		line(this.tmlnPlyHdArrX[i], this.tmlnPlyHdArrY[i], this.tmlnPlyHdArrX[i], this.tmlnPlyHdArrY[i] + 10);
	}
}

syncSpoke(stepVar1, stepVar2) {
	if (stepVar1 == 1 && stepVar2 == 1) {
		stroke(120);
    strokeWeight(3);
		line(this.x_pos, this.y_pos, ((this.pizzaDiam * cos((this.stepAngles[0]) - 90)) + this.x_pos),
			((this.pizzaDiam * sin((this.stepAngles[0]) - 90)) + this.y_pos));
	}
	else{
		bpmFontFill = [230, 237, 233];
	}
}

	dragged(px, py) {
		px = px - this.canvasOffset;
		py = py - this.canvasOffset;

    for(let i=0; i < this.stepAngles.length; i++) {
			for (let j = 0; j < this.buttonPosArr.length; j++) {
				this.distArrays[j][i] = dist(px, py,
					(((this.pizzaDiam * this.buttonPosArr[j]) * cos(this.stepAngles[i] - 90)) + this.x_pos),
					(((this.pizzaDiam * this.buttonPosArr[j]) * sin(this.stepAngles[i] - 90)) + this.y_pos));
						if (this.distArrays[j][i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
							this.newStateArrays[j][i] = 1;
							if (this.newStateArrays[j][i] == 1 && this.oldStateArrays[j][i] == 0){
								if (this.stepColorArr[j][i] == this.grey || this.clickedArrays[j][i] == 1){
									this.stepColorArr[j][i] = 0;
									this.XVerticesArray[j][i] = (((this.pizzaDiam * this.buttonPosArr[j]) * cos((this.stepAngles[i]) - 90)) + this.x_pos);
									this.YVerticesArray[j][i] = (((this.pizzaDiam * this.buttonPosArr[j]) * sin((this.stepAngles[i]) - 90)) + this.y_pos);
								}
								else if (this.stepColorArr[j][i] == 0){
									this.stepColorArr[j][i] = this.grey;
									this.XVerticesArray[j][i] = "no";
									this.YVerticesArray[j][i] = "no";
								}
							}
							this.oldStateArrays[j][i] = this.newStateArrays[j][i];
					}
					else{
						this.newStateArrays[j][i] = 0;
						this.oldStateArrays[j][i] = 0;
					}
			}
    }
	}

	pressed(px, py) {
		px = px - this.canvasOffset;
		py = py - this.canvasOffset;

    for(let i=0; i < this.stepAngles.length; i++) {
			for (let j = 0; j < this.buttonPosArr.length; j++){
				this.distArray1[i] = dist(px, py,
					(((this.pizzaDiam * this.buttonPosArr[j]) * cos(this.stepAngles[i] - 90)) + this.x_pos),
					(((this.pizzaDiam * this.buttonPosArr[j]) * sin(this.stepAngles[i] - 90)) + this.y_pos));
						if (this.distArray1[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
								if (this.stepColorArr[j][i] == this.grey){
									this.stepColorArr[j][i] = 0;
									this.XVerticesArray[j][i] = (((this.pizzaDiam * this.buttonPosArr[j]) * cos((this.stepAngles[i]) - 90)) + this.x_pos);
									this.YVerticesArray[j][i] = (((this.pizzaDiam * this.buttonPosArr[j]) * sin((this.stepAngles[i]) - 90)) + this.y_pos);
									this.clickedArray1[i] = 1;
								}
								else if (this.stepColorArr[j][i] == 0){
									this.stepColorArr[j][i] = this.grey;
									this.XVerticesArray[j][i] = "no";
									this.YVerticesArray[j][i] = "no";
								}
						}
			}
    }
	}

	nextNote() {
	    BPM = bpmSlider.value();
	    var secondsPerBeat = 60.0 / BPM;
	    var secondsPerSixteenth = secondsPerBeat * 0.25;
	    var secondsPerRotation = secondsPerSixteenth * this.numTeeth;
	    this.secondsPerStep = secondsPerRotation / this.numSteps;
	    this.nextNoteTime += this.secondsPerStep;
	}

	incrementSoundLaunch(nextNoteTime) {

		//Controls iteration of timeline playhead
		if (this.stepIteratorVar == 0){
			if (this.tmlnItrtr ==  this.tmlnPlyHdArrX.length - 1){
				this.tmlnItrtr = 0;
			}
			else if (	this.tmlnItrtr !=  this.tmlnPlyHdArrX.length - 1){
				this.tmlnItrtr++;
			}
		}

		for(let i=0; i < this.stepColorArr.length; i++){
			if (this.stepColorArr[i][this.stepIteratorVar] == 0) {
				playNote(nextNoteTime, this.drumSamples[i]);
			}
		}

	  if (this.stepIteratorVar <= this.stepAngles.length - 2) {
	    this.stepAngle = (360 / this.sliceSlider.value()) * (this.stepIteratorVar) - 90;
	    this.stepIteratorVar++;
	  }

	  else if (this.stepIteratorVar == this.stepAngles.length - 1|| this.stepIteratorVar > this.stepAngles.length - 1) {
	    this.stepIteratorVar = this.stepAngles.length - 1;
	    this.stepAngle = (360 / this.sliceSlider.value()) * (this.stepIteratorVar) - 90;
	    this.stepIteratorVar = 0;
	}
}

	teethTest() {
		this.initialToothAngle = 360 / this.numTeeth;
		sketchUpdateBPM();
		this.testDiam = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
	}

	rotateShapes(rotNum) {
		this.rotNum = rotNum;

		let j = 0;
		for (let i = 0; i < this.sliceSlider.value(); i++) {
			if (i + this.prevRotNum < this.sliceSlider.value()) {
				for (let k = 0; k < this.permColorArrays.length; k++){
					this.permColorArrays[k][i] = this.stepColorArr[k][this.prevRotNum + i];
					this.permVertexArrays[k][i] = this.XVerticesArray[k][this.prevRotNum + i];
				}
			}
			else {
				for (let k = 0; k < this.permColorArrays.length; k++) {
					this.permColorArrays[k][i] = this.stepColorArr[k][j];
					this.permVertexArrays[k][i] = this.XVerticesArray[k][j];
				}
				j++
			}
		}

		j = 0;
		for (let i = 0; i < this.sliceSlider.value(); i++) {
				if (i + this.rotNum < this.sliceSlider.value()) {
					for (let k = 0; k < this.permColorArrays.length; k++) {
						this.stepColorArr[k][i + this.rotNum] = this.permColorArrays[k][i];
						this.XVerticesArray[k][i + this.rotNum] = this.permVertexArrays[k][i];
					} 
				}
				else {
					for (let k = 0; k < this.permColorArrays.length; k++) {
						this.stepColorArr[k][j] = this.permColorArrays[k][i];
						this.XVerticesArray[k][j] = this.permVertexArrays[k][i];
					}
					j++
				}
		}
		this.prevRotNum = this.rotNum;
	}

	clearSteps(){

	}
	
}
