class PizzaFace {

	constructor(name, x_pos, y_pos, numSteps, toothSliderValue, color, canvasOffset){
		this.name = name;
		this.x_pos = x_pos;
		this.y_pos = y_pos;
		this.slices = numSteps;
		this.color = color;
		this.canvasOffset = canvasOffset;

		this.sliceAngle = null;
		this.grey = 170;
		this.stepAngles = []; // STEP OBJECT ARRAY

    this.buttonPos1 = 0.80;
		this.buttonPos2 = 0.60;
		this.buttonPos3 = 0.40;

    this.buttonWidth = 8;
    this.buttonHeight = 8;

    this.stepColor1 =
		[this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey];
		this.stepColor2 =
		[this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey];
		this.stepColor3 =
		[this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey, this.grey];

    this.distArray1 = [];
		this.distArray2 = [];
		this.distArray3 = [];

		this.oldStateArray1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.newStateArray1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.oldStateArray2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.newStateArray2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.oldStateArray3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.newStateArray3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		this.clickedArray1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.clickedArray2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.clickedArray3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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
		
		this.slidersXPos = this.x_pos + (.27 * appWidth); 
		this.rotateSliderXPos = this.x_pos + (.623 * appWidth); 

		this.sliceSliderYPos = this.y_pos + (1.314 * appHeight); 
		this.toothSliderYPos = this.y_pos + (1.25 * appHeight); 
		this.rotateSliderYPos = this.y_pos + (1.314 * appHeight); 

		this.sliceSlider = createSlider(2, 16, 16);
		this.sliceSlider.position(this.slidersXPos, this.sliceSliderYPos);
		this.sliceSlider.style('width', '100px');
		this.sliceSlider.parent('app');

		this.toothSlider = createSlider(2, 16, 16);
		this.toothSlider.position(this.slidersXPos, this.toothSliderYPos);
		this.toothSlider.style('width', '100px');
		this.toothSlider.parent('app');

		this.nextNoteTime = 0;

		this.testDiam = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
		this.secondsPerStep = null;

		this.rotNum = 0;
		this.prevRotNum = 0;

		this.rotateSlider = createSlider(0, 16, 0);
		this.rotateSlider.position(this.rotateSliderXPos, this.rotateSliderYPos);
		this.rotateSlider.style('width', '100px');
		this.rotateSlider.parent('app');

		this.permArr1 = [];
		this.permArr2 = [];
		this.permArr3 = [];
		this.permArr4 = [];
		this.permArr5 = [];
		this.permArr6 = [];

		this.tmlnPlyHdArrX = [];
		this.tmlnPlyHdArrY = [];
		this.tmlnItrtr = 0;

		this.loopTime = timeUnit * this.toothSlider.value();
		this.stepTime = this.loopTime / this.sliceSlider.value();
		this.stepFrac = (timeUnit * 16) / this.stepTime;
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

    for (i=0; i < this.numSteps; i++) {
        line(this.x_pos, this.y_pos, ((this.pizzaDiam * cos((this.stepAngles[i]) - 90)) + this.x_pos),
          ((this.pizzaDiam * sin((this.stepAngles[i]) - 90)) + this.y_pos));

        fill(this.stepColor1[i]);
        ellipse((((this.pizzaDiam * this.buttonPos1) * cos((this.stepAngles[i]) - 90)) + this.x_pos),
          (((this.pizzaDiam * this.buttonPos1) * sin((this.stepAngles[i]) - 90)) + this.y_pos),
          this.buttonWidth, this.buttonHeight);

				fill(this.stepColor2[i]);
				ellipse((((this.pizzaDiam * this.buttonPos2) * cos((this.stepAngles[i]) - 90)) + this.x_pos),
						(((this.pizzaDiam * this.buttonPos2) * sin((this.stepAngles[i]) - 90)) + this.y_pos),
						this.buttonWidth, this.buttonHeight);

				fill(this.stepColor3[i]);
				ellipse((((this.pizzaDiam * this.buttonPos3) * cos((this.stepAngles[i]) - 90)) + this.x_pos),
						(((this.pizzaDiam * this.buttonPos3) * sin((this.stepAngles[i]) - 90)) + this.y_pos),
						this.buttonWidth, this.buttonHeight);

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
			if (this.vertexArrayX1[l] != "no"){
				this.vertexArrayX1[l] = (((this.pizzaDiam * this.buttonPos1) * cos((this.stepAngles[l]) - 90)) + this.x_pos);
				this.vertexArrayY1[l] = (((this.pizzaDiam * this.buttonPos1) * sin((this.stepAngles[l]) - 90)) + this.y_pos);
			}
			if (this.vertexArrayX2[l] != "no"){
				this.vertexArrayX2[l] = (((this.pizzaDiam * this.buttonPos2) * cos((this.stepAngles[l]) - 90)) + this.x_pos);
				this.vertexArrayY2[l] = (((this.pizzaDiam * this.buttonPos2) * sin((this.stepAngles[l]) - 90)) + this.y_pos);
			}
			if (this.vertexArrayX3[l] != "no"){
				this.vertexArrayX3[l] = (((this.pizzaDiam * this.buttonPos3) * cos((this.stepAngles[l]) - 90)) + this.x_pos);
				this.vertexArrayY3[l] = (((this.pizzaDiam * this.buttonPos3) * sin((this.stepAngles[l]) - 90)) + this.y_pos);
			}
		}

			beginShape();
				for (var i = 0; i < this.vertexArrayX1.length; i ++) {
					if (this.vertexArrayX1[i] != "no"){
			  		vertex(this.vertexArrayX1[i], this.vertexArrayY1[i]);
					}
			  }
		  endShape(CLOSE);

			beginShape();
				for(var j = 0; j < this.vertexArrayX1.length; j ++){
					if (this.vertexArrayX2[j] != "no"){
						vertex(this.vertexArrayX2[j], this.vertexArrayY2[j]);
					}
			}
			endShape(CLOSE);

			beginShape();
				for(var k = 0; k < this.vertexArrayX1.length; k ++){
					if (this.vertexArrayX3[k] != "no"){
						vertex(this.vertexArrayX3[k], this.vertexArrayY3[k]);
					}
			}
			endShape(CLOSE);
	}

	showTimeline(ypos, lcm){
		this.timeLineYPos = ypos;
		this.loopRpts = lcm / this.numTeeth;
		var bump = 0;
		var bump2 = 0;
		for (var j = 0; j < this.loopRpts; j++){
			var nub = 3.5;

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
		// 	nub = (nub * this.numTeeth) / this.numSteps;
		// 	for (i = 0; i < this.numSteps; i++){
		// 		strokeWeight(0);
		// 		fill(this.color[0], this.color[1], this.color[2], 90);
		// 		ellipse((-590 + bump2), this.timeLineYPos - 7, testPizza.buttonWidth - 5, testPizza.buttonHeight - 5);
		// 		bump2 = bump2 + nub;
		// }
	}
	// this.totalLoopLengthXPos = -580 + bump;
	this.totalLoopLengthXPos = (appWidth * -.475) + bump;
}

showTotalSteps(lcm, ttlPatternTime){
	strokeWeight(0);
	stroke(this.grey);
	fill(this.grey);
	textSize(20);
	strokeWeight(0);
	text(lcm + " time unit", this.totalLoopLengthXPos + (appWidth * .045), this.timeLineYPos + 15);
	text("pattern (" + ttlPatternTime.toFixed(1) + " s)",
	this.totalLoopLengthXPos + (appWidth * .045), this.timeLineYPos + 35);
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
    var i;

    for(i=0; i < this.stepAngles.length; i++) {
      this.distArray1[i] = dist(px, py,
        (((this.pizzaDiam * this.buttonPos1) * cos(this.stepAngles[i] - 90)) + this.x_pos),
        (((this.pizzaDiam * this.buttonPos1) * sin(this.stepAngles[i] - 90)) + this.y_pos));
	        if (this.distArray1[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
						this.newStateArray1[i] = 1;
						if (this.newStateArray1[i] == 1 && this.oldStateArray1[i] == 0){
		        	if (this.stepColor1[i] == this.grey || this.clickedArray1[i] == 1){
		        		this.stepColor1[i] = 0;
								this.vertexArrayX1[i] = (((this.pizzaDiam * this.buttonPos1) * cos((this.stepAngles[i]) - 90)) + this.x_pos);
								this.vertexArrayY1[i] = (((this.pizzaDiam * this.buttonPos1) * sin((this.stepAngles[i]) - 90)) + this.y_pos);
		        	}
		          else if (this.stepColor1[i] == 0){
		            this.stepColor1[i] = this.grey;
								this.vertexArrayX1[i] = "no";
								this.vertexArrayY1[i] = "no";
		          }
						}
						this.oldStateArray1[i] = this.newStateArray1[i];
	      }
				else{
					this.newStateArray1[i] = 0;
					this.oldStateArray1[i] = 0;
				}

			this.distArray2[i] = dist(px, py,
		    (((this.pizzaDiam * this.buttonPos2) * cos(this.stepAngles[i] - 90)) + this.x_pos),
		    (((this.pizzaDiam * this.buttonPos2) * sin(this.stepAngles[i] - 90)) + this.y_pos));
					if (this.distArray2[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
						this.newStateArray2[i] = 1;
						if (this.newStateArray2[i] == 1 && this.oldStateArray2[i] == 0){
							if (this.stepColor2[i] == this.grey || this.clickedArray2[i] == 1){
								this.stepColor2[i] = 0;
								this.vertexArrayX2[i] = (((this.pizzaDiam * this.buttonPos2) * cos((this.stepAngles[i]) - 90)) + this.x_pos);
								this.vertexArrayY2[i] = (((this.pizzaDiam * this.buttonPos2) * sin((this.stepAngles[i]) - 90)) + this.y_pos);
							}
							else if (this.stepColor2[i] == 0){
								this.stepColor2[i] = this.grey;
								this.vertexArrayX2[i] = "no";
								this.vertexArrayY2[i] = "no";
							}
						}
						this.oldStateArray2[i] = this.newStateArray2[i];
				}
				else{
					this.newStateArray2[i] = 0;
					this.oldStateArray2[i] = 0;
				}

			this.distArray3[i] = dist(px, py,
			   (((this.pizzaDiam * this.buttonPos3) * cos(this.stepAngles[i] - 90)) + this.x_pos),
			   (((this.pizzaDiam * this.buttonPos3) * sin(this.stepAngles[i] - 90)) + this.y_pos));
					 if (this.distArray3[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
						 this.newStateArray3[i] = 1;
						 if (this.newStateArray3[i] == 1 && this.oldStateArray3[i] == 0){
							 if (this.stepColor3[i] == this.grey || this.clickedArray3[i] == 1){
								 this.stepColor3[i] = 0;
								 this.vertexArrayX3[i] = (((this.pizzaDiam * this.buttonPos3) * cos((this.stepAngles[i]) - 90)) + this.x_pos);
 								 this.vertexArrayY3[i] = (((this.pizzaDiam * this.buttonPos3) * sin((this.stepAngles[i]) - 90)) + this.y_pos);
							 }
							 else if (this.stepColor3[i] == 0){
								 this.stepColor3[i] = this.grey;
								 this.vertexArrayX3[i] = "no";
 								 this.vertexArrayY3[i] = "no";
							 }
						 }
						 this.oldStateArray3[i] = this.newStateArray3[i];
				 }
				 else{
					 this.newStateArray3[i] = 0;
					 this.oldStateArray3[i] = 0;
				 }
    }
	}

	pressed(px, py) {
		px = px - this.canvasOffset;
		py = py - this.canvasOffset;
    var i;

    for(i=0; i < this.stepAngles.length; i++) {
      this.distArray1[i] = dist(px, py,
        (((this.pizzaDiam * this.buttonPos1) * cos(this.stepAngles[i] - 90)) + this.x_pos),
        (((this.pizzaDiam * this.buttonPos1) * sin(this.stepAngles[i] - 90)) + this.y_pos));
	        if (this.distArray1[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
		        	if (this.stepColor1[i] == this.grey){
		        		this.stepColor1[i] = 0;
								this.vertexArrayX1[i] = (((this.pizzaDiam * this.buttonPos1) * cos((this.stepAngles[i]) - 90)) + this.x_pos);
								this.vertexArrayY1[i] = (((this.pizzaDiam * this.buttonPos1) * sin((this.stepAngles[i]) - 90)) + this.y_pos);
								this.clickedArray1[i] = 1;
		        	}
		          else if (this.stepColor1[i] == 0){
		            this.stepColor1[i] = this.grey;
								this.vertexArrayX1[i] = "no";
								this.vertexArrayY1[i] = "no";
		          }
					}

			this.distArray2[i] = dist(px, py,
		    (((this.pizzaDiam * this.buttonPos2) * cos(this.stepAngles[i] - 90)) + this.x_pos),
		    (((this.pizzaDiam * this.buttonPos2) * sin(this.stepAngles[i] - 90)) + this.y_pos));
					if (this.distArray2[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
							if (this.stepColor2[i] == this.grey){
								this.stepColor2[i] = 0;
								this.vertexArrayX2[i] = (((this.pizzaDiam * this.buttonPos2) * cos((this.stepAngles[i]) - 90)) + this.x_pos);
								this.vertexArrayY2[i] = (((this.pizzaDiam * this.buttonPos2) * sin((this.stepAngles[i]) - 90)) + this.y_pos);
								this.clickedArray2[i] = 1;
							}
							else if (this.stepColor2[i] == 0){
								this.stepColor2[i] = this.grey;
								this.vertexArrayX2[i] = "no";
								this.vertexArrayY2[i] = "no";
							}
					}

			this.distArray3[i] = dist(px, py,
			   (((this.pizzaDiam * this.buttonPos3) * cos(this.stepAngles[i] - 90)) + this.x_pos),
			   (((this.pizzaDiam * this.buttonPos3) * sin(this.stepAngles[i] - 90)) + this.y_pos));
					 if (this.distArray3[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
							 if (this.stepColor3[i] == this.grey){
								 this.stepColor3[i] = 0;
								 this.vertexArrayX3[i] = (((this.pizzaDiam * this.buttonPos3) * cos((this.stepAngles[i]) - 90)) + this.x_pos);
 								 this.vertexArrayY3[i] = (((this.pizzaDiam * this.buttonPos3) * sin((this.stepAngles[i]) - 90)) + this.y_pos);
								 this.clickedArray3[i] = 1;
							 }
							 else if (this.stepColor3[i] == 0){
								 this.stepColor3[i] = this.grey;
								 this.vertexArrayX3[i] = "no";
 									this.vertexArrayY3[i] = "no";
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

	incrementSoundLaunch(nextNoteTime, one, two, three) {
		this.one = one;
		this.two = two;
		this.three = three;

		//Controls iteration of timeline playhead
		if (this.stepIteratorVar == 0){
			if (this.tmlnItrtr ==  this.tmlnPlyHdArrX.length - 1){
				this.tmlnItrtr = 0;
			}
			else if (	this.tmlnItrtr !=  this.tmlnPlyHdArrX.length - 1){
				this.tmlnItrtr++;
			}
		}

	  if (this.stepColor1[this.stepIteratorVar] == 0) {
	    playNote(nextNoteTime, one);
			// print("this.stepIteratorVar " + this.stepIteratorVar);
			// ("this.stepAngle " + this.stepAngle);
	  }

		if (this.stepColor2[this.stepIteratorVar] == 0) {
			playNote(nextNoteTime, two);
		}

		if (this.stepColor3[this.stepIteratorVar] == 0) {
			playNote(nextNoteTime, three);
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
			  this.permArr1[i] = this.stepColor1[this.prevRotNum + i];
				this.permArr2[i] = this.vertexArrayX1[this.prevRotNum + i];

				this.permArr3[i] = this.stepColor2[this.prevRotNum + i];
				this.permArr4[i] = this.vertexArrayX2[this.prevRotNum + i];

				this.permArr5[i] = this.stepColor3[this.prevRotNum + i];
				this.permArr6[i] = this.vertexArrayX3[this.prevRotNum + i];
			}
			else {
				this.permArr1[i] = this.stepColor1[j];
				this.permArr2[i] = this.vertexArrayX1[j];

				this.permArr3[i] = this.stepColor2[j];
				this.permArr4[i] = this.vertexArrayX2[j];

				this.permArr5[i] = this.stepColor3[j];
				this.permArr6[i] = this.vertexArrayX3[j];
				j++
			}
		}

		j = 0;
		for (let i = 0; i < this.sliceSlider.value(); i++) {
				if (i + this.rotNum < this.sliceSlider.value()) {
				  this.stepColor1[i + this.rotNum] = this.permArr1[i];
					this.vertexArrayX1[i + this.rotNum] = this.permArr2[i];

					this.stepColor2[i + this.rotNum] = this.permArr3[i];
					this.vertexArrayX2[i + this.rotNum] = this.permArr4[i];

					this.stepColor3[i + this.rotNum] = this.permArr5[i];
					this.vertexArrayX3[i + this.rotNum] = this.permArr6[i];
				}
				else {
				  this.stepColor1[j] = this.permArr1[i];
					this.vertexArrayX1[j] = this.permArr2[i];

					this.stepColor2[j] = this.permArr3[i];
					this.vertexArrayX2[j] = this.permArr4[i];

					this.stepColor3[j] = this.permArr5[i];
					this.vertexArrayX3[j] = this.permArr6[i];
					j++
				}
		}
		this.prevRotNum = this.rotNum;
	}
}
