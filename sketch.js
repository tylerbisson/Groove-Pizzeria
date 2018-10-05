///////////////////////////////////////////////////////////////////// VARIABLE BANK
let intialSliceAngle;
let sliceAngle;
let numSteps;
let numTeeth = 16;
let initialToothAngle = 22.5;

//270 degrees is bc teeth are offset by quater right turn i.e. 90 degrees
//therefore, 12 o clock is at 270 rather than zero
let toothAngle = 270;
let toothArcLength = 120;
let toothAngleOffset = 90;
let pizzaDiam = ((toothArcLength * numTeeth) / (2 * Math.PI)) * 2;
let toothOffset = 10;

var audioContext = new AudioContext();
let BPM = 120;
let steps = []; // STEP OBJECT ARRAY
let pizzaFace; // STEP OBJECT
let intervalRate = (((60 / ((BPM * 4) / numTeeth))) * 1000) / numTeeth;
let soundIntervalVar;
let soundIntervalRate = (60 / (BPM * 4) * 1000);
let externalStepIteratorVar = 0;

//OOP HACKING
let testPizza;

///////////////////////////////////////////////////////////////////// AUDIO BUFFER SETUP

var xhr = new XMLHttpRequest();
xhr.open('get', '/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/click.wav');
xhr.responseType = 'arraybuffer'; // directly as an ArrayBuffer
xhr.send();
var realBuffer;

xhr.onload = function () {
  var audioData = xhr.response;
  audioContext.decodeAudioData(audioData, function (buffer) {
    realBuffer = buffer;
  },

function (e) { console.log('Error with decoding audio data' + e.err); });
};

///////////////////////////////////////////////////////////////////// SET UP FUNCTION
function setup() {
  createCanvas(1200, 1200);
  angleMode(DEGREES);
  sliceSlider = createSlider(2, 16, 16);
  toothSlider = createSlider(2, 16, 16);
  bpmSlider = createSlider(50, 200, 120);
  sliceSlider.input(updateSlices);
  toothSlider.input(updateInitialTeeth);
  bpmSlider.mouseReleased(updateBPM);
  greeting = loadSound(
  '/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/groovepizzaria.wav', loaded);
  soundIntervalVar = setInterval(incrementSoundLauncher, soundIntervalRate);

  //OOP HACKING
  testPizza = new PizzaFace(sliceAngle, 0, 0, sliceSlider.value());

  stepArrayMaker(16); // Initial step amount
}

function playBuffer() {
  var source = audioContext.createBufferSource();
  source.buffer = realBuffer;
  source.connect(audioContext.destination);
  source.start(0);
}

function loaded() {
  greeting.play();
}

function incrementSoundLauncher() {

  if (steps[externalStepIteratorVar].beat_color == 0) {
    // click.play();
    playBuffer();
  }

  if (externalStepIteratorVar < numSteps - 1) {
    externalStepIteratorVar++;
  }

  else if (externalStepIteratorVar == numSteps - 1) {
    externalStepIteratorVar = 0;
  }

  toothAngle = (360 / numSteps) * (externalStepIteratorVar + 1) - 90;

}

///////////////////////////////////////////////////////////////////// INCREMENT TOOTH ANGLE FUNCTION
// function incrementToothAngle(){

// 	toothAngle = toothAngle + 3.6;

// 	if (toothAngle > 360){
// 		toothAngle = 0;
// 		// toothTimer2 = millis();
// 		// toothTimer1 = toothTimer2;
// 	}
// }

///////////////////////////////////////////////////////////////////// UPDATE SLICES FUNCTION
function updateSlices() {
  testPizza.stepAngles = [];
  stepArrayMaker(sliceSlider.value());
  updateBPM();
  externalStepIteratorVar = 0;
}

///////////////////////////////////////////////////////////////////// UPDATE INITIAL TEETH FUNCTION
function updateInitialTeeth() {
  initialToothAngle = 360 / toothSlider.value();
  updateBPM();
}

///////////////////////////////////////////////////////////////////// UPDATE INITIAL TEETH FUNCTION
function updateBPM() {
  BPM = bpmSlider.value();
  numTeeth = toothSlider.value();
  intervalRate = (((60 / ((BPM * 4) / numTeeth))) * 1000) / numTeeth;
  myStopFunction();
  let soundIntervalRate = (60 / (BPM * 4) * 1000);
  soundIntervalVar = setInterval(incrementSoundLauncher, soundIntervalRate);
}

///////////////////////////////////////////////////////////////////// MOUSE PRESSED FUNCTION
function myStopFunction() {
  clearInterval(soundIntervalVar);
}

///////////////////////////////////////////////////////////////////// MOUSE PRESSED FUNCTION
function mousePressed() {
  for (let pizzaFace of steps) {
    pizzaFace.clicked(mouseX, mouseY);
  }
    testPizza.clicked(mouseX, mouseY);
}

///////////////////////////////////////////////////////////////////// STEP ARRAY MAKER FUNCTION
function stepArrayMaker(numSlices) {
  intialSliceAngle = 360 / numSlices;
  sliceAngle = intialSliceAngle;
  //steps = [];
  i = 0;
  while (sliceAngle < 361) {
    let s = new PizzaFace(sliceAngle, 0, 0, numSlices);
    steps[i] = s;
    testPizza.stepAngles[i] = sliceAngle;
    i++;
    sliceAngle = sliceAngle + intialSliceAngle;
  }
}

///////////////////////////////////////////////////////////////////// DRAW FUNCTION
function draw() {
	background(230, 237, 233);
	translate(600,600);
	numSteps = sliceSlider.value();
	numTeeth = toothSlider.value();

	pizzaDiam = (toothArcLength * numTeeth) / (2 * Math.PI);
	// print(pizzaDiam);

	strokeWeight(1);
	stroke(200);
	noFill();
	// ellipse(0, 0, (pizzaDiam * 2));
	testPizza.showFace(pizzaDiam);
	testPizza.showSpokes(sliceSlider.value());

	// for (let pizzaFace of steps){
	// 	// pizzaFace.showFace(pizzaDiam);
	// 	pizzaFace.populate_spokes_and_dots();
	// }

	//populates teeth

	// BARS 2 - 16

	stroke(200);
	strokeWeight(5);

	line((pizzaDiam * cos(-toothAngleOffset)),
		(pizzaDiam * sin(-toothAngleOffset)),
		((pizzaDiam + toothOffset) * cos(-toothAngleOffset)),
		((pizzaDiam + toothOffset) * sin(-toothAngleOffset)));

	line((pizzaDiam * cos(initialToothAngle -toothAngleOffset)),
		(pizzaDiam * sin(initialToothAngle -toothAngleOffset)),
		((pizzaDiam + toothOffset) * cos(initialToothAngle -toothAngleOffset)),
		((pizzaDiam + toothOffset) * sin(initialToothAngle -toothAngleOffset)));

	if(initialToothAngle * 2 < 360){
		line((pizzaDiam * cos((initialToothAngle * 2) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 2) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 2) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 2) - toothAngleOffset)));
	}

	if(initialToothAngle * 3 < 360){
		line((pizzaDiam * cos((initialToothAngle * 3) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 3) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 3) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 3) - toothAngleOffset)));
	}

	if(initialToothAngle * 4 < 360){
		line((pizzaDiam * cos((initialToothAngle * 4) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 4) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 4) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 4) - toothAngleOffset)));
	}

	if(initialToothAngle * 5 < 360){
		line((pizzaDiam * cos((initialToothAngle * 5) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 5) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 5) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 5) - toothAngleOffset)));
	}

	if(initialToothAngle * 6 < 360){
		line((pizzaDiam * cos((initialToothAngle * 6) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 6) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 6) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 6) - toothAngleOffset)));
	}

	if(initialToothAngle * 7 < 360){
		line((pizzaDiam * cos((initialToothAngle * 7) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 7) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 7) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 7) - toothAngleOffset)));
	}

	if(initialToothAngle * 8 < 360){
		line((pizzaDiam * cos((initialToothAngle * 8) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 8) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 8) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 8) - toothAngleOffset)));
	}

	if(initialToothAngle * 9 < 360){
		line((pizzaDiam * cos((initialToothAngle * 9) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 9) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 9) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 9) - toothAngleOffset)));
	}

	if(initialToothAngle * 10 < 360){
		line((pizzaDiam * cos((initialToothAngle * 10) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 10) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 10) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 10) - toothAngleOffset)));
	}

	if(initialToothAngle * 11 < 360){
		line((pizzaDiam * cos((initialToothAngle * 11) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 11) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 11) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 11) - toothAngleOffset)));
	}

	if(initialToothAngle * 12 < 360){
		line((pizzaDiam * cos((initialToothAngle * 12) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 12) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 12) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 12) - toothAngleOffset)));
	}

	if(initialToothAngle * 13 < 360){
		line((pizzaDiam * cos((initialToothAngle * 13) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 13) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 13) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 13) - toothAngleOffset)));
	}

	if(initialToothAngle * 14 < 360){
		line((pizzaDiam * cos((initialToothAngle * 14) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 14) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 14) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 14) - toothAngleOffset)));
	}

	if(initialToothAngle * 15 < 360){
		line((pizzaDiam * cos((initialToothAngle * 15) - toothAngleOffset)),
			(pizzaDiam * sin((initialToothAngle * 15) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * cos((initialToothAngle * 15) - toothAngleOffset)),
			((pizzaDiam + toothOffset) * sin((initialToothAngle * 15) - toothAngleOffset)));
	}

	// PLAY HEAD
	stroke(94, 163, 120);
	strokeWeight(10);
	line((pizzaDiam * cos(toothAngle)),
		(pizzaDiam * sin(toothAngle)),
		((pizzaDiam + toothOffset) * cos(toothAngle)),
		((pizzaDiam + toothOffset) * sin(toothAngle)));

}//////////////////////////////////////////////////////////////////// END OF DRAW

///////////////////////////////////////////////////////////////////// STEP CLASS
class PizzaFace {
	constructor(sliceAngle, x_pos, y_pos, numSlices){
		this.sliceAngle = sliceAngle;
		this.beat_color = 200;
		this.x_pos = x_pos;
		this.y_pos = y_pos;
		this.slices = numSlices;
    this.buttonPos = 0.75;
    this.buttonWidth = 10;
    this.buttonHeight = 10;
    this.stepAngles = []; // STEP OBJECT ARRAY
    this.stepColor = [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200];
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
		intialSliceAngle = 360/ this.numSlices;

		stroke(200);
    // fill(this.beat_color);
    // print(this.beat_color);

		line(0, 0, (pizzaDiam * cos(- 90)),
			(pizzaDiam * sin(- 90)));
      fill(this.stepColor[0]);
    ellipse(((pizzaDiam * this.buttonPos) * cos(- 90)),
      ((pizzaDiam * this.buttonPos) * sin(- 90)),
      this.buttonWidth, this.buttonHeight);

		line(0, 0, (pizzaDiam * cos(this.stepAngles[0] - 90)),
			(pizzaDiam * sin(this.stepAngles[0] - 90)));
      fill(this.stepColor[1]);
    ellipse(((pizzaDiam * this.buttonPos) * cos(this.stepAngles[0] - 90)),
  		((pizzaDiam * this.buttonPos) * sin(this.stepAngles[0] - 90)),
      this.buttonWidth, this.buttonHeight);

		if(this.stepAngles[1] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[1]) - 90)),
				(pizzaDiam * sin((this.stepAngles[1]) - 90)));
        fill(this.stepColor[2]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[1]) - 90)),
  			((pizzaDiam * this.buttonPos) * sin((this.stepAngles[1]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[2] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[2]) - 90)),
				(pizzaDiam * sin((this.stepAngles[2]) - 90)));
        fill(this.stepColor[3]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[2]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[2]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[3] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[3]) - 90)),
				(pizzaDiam * sin((this.stepAngles[3]) - 90)));
        fill(this.stepColor[4]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[3]) - 90)),
  			((pizzaDiam * this.buttonPos) * sin((this.stepAngles[3]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[4] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[4]) - 90)),
				(pizzaDiam * sin((this.stepAngles[4]) - 90)));
        fill(this.stepColor[5]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[4]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[4]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[5] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[5]) - 90)),
        (pizzaDiam * sin((this.stepAngles[5]) - 90)));
        fill(this.stepColor[6]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[5]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[5]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[6] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[6]) - 90)),
				(pizzaDiam * sin((this.stepAngles[6]) - 90)));
        fill(this.stepColor[7]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[6]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[6]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[7] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[7]) - 90)),
				(pizzaDiam * sin((this.stepAngles[7]) - 90)));
        fill(this.stepColor[8]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[7]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[7]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[8] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[8]) - 90)),
				(pizzaDiam * sin((this.stepAngles[8]) - 90)));
        fill(this.stepColor[9]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[8]) - 90)),
          ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[8]) - 90)),
          this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[9] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[9]) - 90)),
				(pizzaDiam * sin((this.stepAngles[9]) - 90)));
        fill(this.stepColor[10]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[9]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[9]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[10] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[10]) - 90)),
				(pizzaDiam * sin((this.stepAngles[10]) - 90)));
        fill(this.stepColor[11]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[10]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[10]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[11] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[11]) - 90)),
				(pizzaDiam * sin((this.stepAngles[11]) - 90)));
        fill(this.stepColor[12]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[11]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[11]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[12] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[12]) - 90)),
				(pizzaDiam * sin((this.stepAngles[12]) - 90)));
        fill(this.stepColor[13]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[12]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[12]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[13] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[13]) - 90)),
				(pizzaDiam * sin((this.stepAngles[13]) - 90)));
        fill(this.stepColor[14]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[13]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[13]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}

		if(this.stepAngles[14] < 360){
			line(0, 0, (pizzaDiam * cos((this.stepAngles[14]) - 90)),
				(pizzaDiam * sin((this.stepAngles[14]) - 90)));
        fill(this.stepColor[15]);
      ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[14]) - 90)),
        ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[14]) - 90)),
        this.buttonWidth, this.buttonHeight);
		}
	}

	// populate_spokes_and_dots(){
	// 	stroke(200);
	// 	line(0,
	// 		0, p
	// 		(pizzaDiam * cos(this.sliceAngle - 90)),
	// 		(pizzaDiam * sin(this.sliceAngle - 90)));
	// 	fill(this.beat_color);
	// 	ellipse(((pizzaDiam * this.buttonPos) * cos(this.sliceAngle - 90)),
	// 		((pizzaDiam * this.buttonPos) * sin(this.sliceAngle - 90)),
	// 		10,
	// 		10);
	// }

	clicked(px, py) {
		px = px - 600;
		py = py - 600;
    print(this.sliceAngle);
		let d = dist(px, py,
			((pizzaDiam * this.buttonPos) * cos(this.sliceAngle - 90)),
			((pizzaDiam * this.buttonPos) * sin(this.sliceAngle - 90)));
      // print(this.sliceAngle);
      // print(d);
		if (d < (pizzaDiam * 0.13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
			if (this.beat_color == 200){
				this.beat_color = 0;
			}
			else if (this.beat_color == 0){
				this.beat_color = 200;
			}
		}
	}
}
