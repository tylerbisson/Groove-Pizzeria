class PizzaFace {

	constructor(x_pos, y_pos, numSteps, toothSliderValue){
		this.x_pos = x_pos;
		this.y_pos = y_pos;
		this.slices = numSteps;

		this.sliceAngle = null;
		this.beat_color = 200;
		this.stepAngles = []; // STEP OBJECT ARRAY

    this.buttonPos1 = 0.80;
		this.buttonPos2 = 0.60;
		this.buttonPos3 = 0.40;

    this.buttonWidth = 8;
    this.buttonHeight = 8;

    this.stepColor1 =
		[200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200];
		this.stepColor2 =
		[200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200];
		this.stepColor3 =
		[200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200];

    this.distArray1 = [];
		this.distArray2 = [];
		this.distArray3 = [];

		this.oldStateArray1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.newStateArray1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.oldStateArray2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.newStateArray2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.oldStateArray3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.newStateArray3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		// this.vertexArray = [(null, null), ]

    this.initialToothAngle = 360 / toothSliderValue;
    this.toothOffset = 10;
    this.toothAngleOffset = 90;
    this.initialSliceAngle = null;
    this.randomColor = Math.random() * 500;
		this.stepIteratorVar = 0;
		this.numTeeth = 16;
		this.bpm = bpmSlider.value();

		this.toothArcLength = 110;
		this.stepAngle = (360 / 16) * (15 + 1) - 90;

		this.slidersXPos = this.x_pos + 310;
		this.sliceSliderYPos = this.y_pos + 895;
		this.toothSliderYPos = this.y_pos + 925;

		this.sliceSlider = createSlider(2, 16, 16);
		this.sliceSlider.position(this.slidersXPos, this.sliceSliderYPos);
		this.sliceSlider.style('width', '100px');

		this.toothSlider = createSlider(2, 16, 16);
		this.toothSlider.position(this.slidersXPos, this.toothSliderYPos);
		this.toothSlider.style('width', '100px');

		this.nextNoteTime = 0;

		this.testDiam = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
		this.secondsPerStep = null;
	}

	showFace(pizzaDiam){
		this.pizzaDiam = pizzaDiam;
		strokeWeight(1);
		stroke(200);
		noFill();
		ellipse(this.x_pos, this.y_pos, (this.pizzaDiam * 2));
	}

	showSpokes(numSteps){
		this.stepAngles = [];
		this.numSteps = numSteps;
		this.intialSliceAngle = 360/ this.numSteps;
    this.sliceAngle = this.intialSliceAngle;

      let i = 0;
      while (this.sliceAngle < 361) {
        this.stepAngles[i] = this.sliceAngle;
        i++;
        this.sliceAngle = this.sliceAngle + this.intialSliceAngle;
      }

    stroke(200);

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
    }
	}

	showTeeth(toothSliderValue) {
    stroke(200);
    strokeWeight(5);
    for (var i = 0; i < toothSliderValue; i++) {
      line(((this.pizzaDiam * cos((this.initialToothAngle * i) - this.toothAngleOffset)) + this.x_pos),
        ((this.pizzaDiam * sin((this.initialToothAngle * i) - this.toothAngleOffset)) + this.y_pos),
        (((this.pizzaDiam + this.toothOffset) * cos((this.initialToothAngle * i) - this.toothAngleOffset)) + this.x_pos),
        (((this.pizzaDiam + this.toothOffset) * sin((this.initialToothAngle * i) - this.toothAngleOffset)) + this.y_pos));
    }
  }

  showPlayHead() {
    // stroke(94, 163, 120);
    stroke(this.randomColor, 163, 120);
    strokeWeight(10);
    line(((this.pizzaDiam * cos(this.stepAngle)) + this.x_pos),
      ((this.pizzaDiam * sin(this.stepAngle)) + this.y_pos),
      (((this.pizzaDiam + this.toothOffset) * cos(this.stepAngle)) + this.x_pos),
      (((this.pizzaDiam + this.toothOffset) * sin(this.stepAngle)) + this.y_pos));
  }

	showShapes(){
		for(i=0; i < this.stepAngles.length; i++) {
			if (this.stepColor1[i] == 0) {
				this.stepColor1[i] = 0;
			}
		}
	}

	dragged(px, py) {
		px = px - canvasOffset;
		py = py - canvasOffset;
    var i;

    for(i=0; i < this.stepAngles.length; i++) {
      this.distArray1[i] = dist(px, py,
        (((this.pizzaDiam * this.buttonPos1) * cos(this.stepAngles[i] - 90)) + this.x_pos),
        (((this.pizzaDiam * this.buttonPos1) * sin(this.stepAngles[i] - 90)) + this.y_pos));
	        if (this.distArray1[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
						this.newStateArray1[i] = 1;
						if (this.newStateArray1[i] == 1 && this.oldStateArray1[i] == 0){
		        	if (this.stepColor1[i] == 200){
		        		this.stepColor1[i] = 0;
		        	}
		          else if (this.stepColor1[i] == 0){
		            this.stepColor1[i] = 200;
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
							if (this.stepColor2[i] == 200){
								this.stepColor2[i] = 0;
							}
							else if (this.stepColor2[i] == 0){
								this.stepColor2[i] = 200;
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
							 if (this.stepColor3[i] == 200){
								 this.stepColor3[i] = 0;
							 }
							 else if (this.stepColor3[i] == 0){
								 this.stepColor3[i] = 200;
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
		px = px - canvasOffset;
		py = py - canvasOffset;
    var i;

    for(i=0; i < this.stepAngles.length; i++) {
      this.distArray1[i] = dist(px, py,
        (((this.pizzaDiam * this.buttonPos1) * cos(this.stepAngles[i] - 90)) + this.x_pos),
        (((this.pizzaDiam * this.buttonPos1) * sin(this.stepAngles[i] - 90)) + this.y_pos));
	        if (this.distArray1[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
		        	if (this.stepColor1[i] == 200){
		        		this.stepColor1[i] = 0;
		        	}
		          else if (this.stepColor1[i] == 0){
		            this.stepColor1[i] = 200;
		          }
					}

			this.distArray2[i] = dist(px, py,
		    (((this.pizzaDiam * this.buttonPos2) * cos(this.stepAngles[i] - 90)) + this.x_pos),
		    (((this.pizzaDiam * this.buttonPos2) * sin(this.stepAngles[i] - 90)) + this.y_pos));
					if (this.distArray2[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
							if (this.stepColor2[i] == 200){
								this.stepColor2[i] = 0;
							}
							else if (this.stepColor2[i] == 0){
								this.stepColor2[i] = 200;
							}
					}

			this.distArray3[i] = dist(px, py,
			   (((this.pizzaDiam * this.buttonPos3) * cos(this.stepAngles[i] - 90)) + this.x_pos),
			   (((this.pizzaDiam * this.buttonPos3) * sin(this.stepAngles[i] - 90)) + this.y_pos));
					 if (this.distArray3[i] < (this.pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
							 if (this.stepColor3[i] == 200){
								 this.stepColor3[i] = 0;
							 }
							 else if (this.stepColor3[i] == 0){
								 this.stepColor3[i] = 200;
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

	  if (this.stepColor1[this.stepIteratorVar] == 0) {
	    playNote(nextNoteTime, one);
	  }

		if (this.stepColor2[this.stepIteratorVar] == 0) {
			playNote(nextNoteTime, two);
		}

		if (this.stepColor3[this.stepIteratorVar] == 0) {
			playNote(nextNoteTime, three);
		}

	  if (this.stepIteratorVar <= this.stepAngles.length - 2) {
	    this.stepAngle = (360 / this.sliceSlider.value()) * (this.stepIteratorVar + 1) - 90;
	    this.stepIteratorVar++;
	  }

	  else if (this.stepIteratorVar == this.stepAngles.length - 1|| this.stepIteratorVar > this.stepAngles.length - 1) {
	    this.stepIteratorVar = this.stepAngles.length - 1;
	    this.stepAngle = (360 / this.sliceSlider.value()) * (this.stepIteratorVar + 1) - 90;
	    this.stepIteratorVar = 0;
	  }
	}

	teethTest() {
		this.initialToothAngle = 360 / this.numTeeth;
		sketchUpdateBPM();
		this.testDiam = (this.toothArcLength * this.numTeeth) / (2 * Math.PI);
	}
}
