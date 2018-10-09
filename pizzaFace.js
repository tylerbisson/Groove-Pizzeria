class PizzaFace {

	constructor(x_pos, y_pos, numSlices, toothSliderValue){
		this.x_pos = x_pos;
		this.y_pos = y_pos;
		this.slices = numSlices;

		this.sliceAngle = null;
		this.beat_color = 200;
    this.buttonPos = 0.75;
    this.buttonWidth = 8;
    this.buttonHeight = 8;
    this.stepAngles = []; // STEP OBJECT ARRAY
    this.stepColor = [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200];
    this.distArray = [];
    this.initialToothAngle = 360 / toothSliderValue;
    this.toothOffset = 10;
    this.toothAngleOffset = 90;
    this.initialSliceAngle = null;
    this.randomColor = Math.random() * 500;
		this.stepIteratorVar = 0;

		this.sliceSlider = createSlider(2, 16, 16);
		this.sliceSlider.position(this.x_pos + 750, this.y_pos + 850);
		this.sliceSlider.style('width', '100px');
		// this.numberOfSlicesTest = this.sliceSlider.value();
		// this.sliceSlider.input(this.updateSlices(this.sliceSlider.value()));
		// this.sliceSlider.input(print('fart'));

		// this.toothSlider = createSlider(2, 16, 16);
		// this.toothSlider.position(this.x_pos + 750, this.y_pos + 880);
		// this.toothSlider.style('width', '100px');
		// this.toothSlider.input(updateInitialTeeth);
		var self = this;
		this.soundIntervalVarTest2 = setInterval(function() { self.incrementSoundLaunch() }, 10000);
	}

	showFace(pizzaDiam){
		this.pizzaDiam = pizzaDiam;
		strokeWeight(1);
		stroke(200);
		noFill();
		ellipse(this.x_pos, this.y_pos, (this.pizzaDiam * 2));
	}

	showSpokes(numSlices){
		this.numSlices = numSlices;
		this.intialSliceAngle = 360/ this.numSlices;
    this.sliceAngle = this.intialSliceAngle;

      let i = 0;
      while (this.sliceAngle < 361) {
        this.stepAngles[i] = this.sliceAngle;
        i++;
        this.sliceAngle = this.sliceAngle + this.intialSliceAngle;
      }

    stroke(200);

    for (i=0; i < this.numSlices; i++) {
        line(this.x_pos, this.y_pos, ((pizzaDiam * cos((this.stepAngles[i]) - 90)) + this.x_pos),
          ((pizzaDiam * sin((this.stepAngles[i]) - 90)) + this.y_pos));
          fill(this.stepColor[i]);
        ellipse((((pizzaDiam * this.buttonPos) * cos((this.stepAngles[i]) - 90)) + this.x_pos),
          (((pizzaDiam * this.buttonPos) * sin((this.stepAngles[i]) - 90)) + this.y_pos),
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
    line(((this.pizzaDiam * cos(toothAngle)) + this.x_pos),
      ((this.pizzaDiam * sin(toothAngle)) + this.y_pos),
      (((this.pizzaDiam + this.toothOffset) * cos(toothAngle)) + this.x_pos),
      (((this.pizzaDiam + this.toothOffset) * sin(toothAngle)) + this.y_pos));
  }

	clicked(px, py) {
		// print(this.stepIteratorVar);
		px = px - canvasOffset;
		py = py - canvasOffset;
    var i;
    for(i=0; i < this.stepAngles.length; i++) {
      this.distArray[i] = dist(px, py,
        (((pizzaDiam * this.buttonPos) * cos(this.stepAngles[i] - 90)) + this.x_pos),
        (((pizzaDiam * this.buttonPos) * sin(this.stepAngles[i] - 90)) + this.y_pos));
        if (this.distArray[i] < (pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized

        	if (this.stepColor[i] == 200){
        		this.stepColor[i] = 0;
        	}
          	else if (this.stepColor[i] == 0){
          		this.stepColor[i] = 200;
          	}
          }
    }
	}

	clicked2(fart) {
		this.fart = fart;
		print(this.fart);
		// print("hellp");
	}

	updateSlices() {
		print('fart');
	  // numSteps = sliceSlider.value();
	  // testPizza.stepAngles = [];
	  // testPizza2.stepAngles = [];
	  // // updateBPM();
	  // externalStepIteratorVar = 0;
	}

	incrementSoundLaunch() {
		// this.fart = fart;
		print(this.stepIteratorVar);
		// print("fart");
		//
	  // if (this.stepColor[this.fart] == 0) {
	  //   playBuffer();
		// 	print('buffer');
	  // }
		//
	  // if (this.testPizzaIterator < numSteps - 1) {
	  //   this.testPizzaIterator++;
	  // }
		//
	  // else if (this.testPizzaIterator == numSteps - 1) {
	  //   this.testPizzaIterator = 0;
	  // }
		//
	  // toothAngle = (360 / numSteps) * (this.testPizzaIterator + 1) - 90;
	}

}
