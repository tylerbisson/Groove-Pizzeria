class PizzaFace {
	constructor(x_pos, y_pos, numSlices, toothSliderValue){
		this.sliceAngle = null;
		this.beat_color = 200;
		this.x_pos = x_pos;
		this.y_pos = y_pos;
		this.slices = numSlices;
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
}