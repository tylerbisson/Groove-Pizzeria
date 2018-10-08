///////////////////////////////////////////////////////////////////// VARIABLE BANK
// initial variables are set to allow immediate launch without using "update slider"
// functions or adding too many procedures into the draw loop
let numSteps = 16;
let numTeeth = 16;

//270 degrees is bc teeth are offset by quater right turn i.e. 90 degrees
//therefore, 12 o clock is at 270 rather than zero
let toothAngle = 270;
let toothArcLength = 120;
let pizzaDiam = (toothArcLength * numTeeth) / (2 * Math.PI);

var audioContext = new AudioContext();
let BPM = 120;
let steps = []; // STEP OBJECT ARRAY
let pizzaFace; // STEP OBJECT
let intervalRate = (((60 / ((BPM * 4) / numTeeth))) * 1000) / numTeeth;
let soundIntervalVar;
let soundIntervalRate = (60 / (BPM * 4) * 1000);
let externalStepIteratorVar = 0;
//allows to work with PizzaFace as if its center was at (0,0)
let canvasOffset = 600;

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
  testPizza = new PizzaFace(0, 0, sliceSlider.value(), toothSlider.value());
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
  if (testPizza.stepColor[externalStepIteratorVar] == 0) {
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

///////////////////////////////////////////////////////////////////// UPDATE SLICES FUNCTION
function updateSlices() {
  numSteps = sliceSlider.value();
  testPizza.stepAngles = [];
  updateBPM();
  externalStepIteratorVar = 0;
}

///////////////////////////////////////////////////////////////////// UPDATE INITIAL TEETH FUNCTION
function updateInitialTeeth() {
  numTeeth = toothSlider.value();
  testPizza.initialToothAngle = 360 / toothSlider.value();
  updateBPM();
  pizzaDiam = (toothArcLength * numTeeth) / (2 * Math.PI);
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

///////////////////////////////////////////////////////////////////// DRAW FUNCTION
function draw() {
	background(230, 237, 233);
	translate(600,600);

	testPizza.showFace(pizzaDiam);
	testPizza.showSpokes(sliceSlider.value());
  testPizza.showTeeth(toothSlider.value());
  testPizza.showPlayHead();
}

///////////////////////////////////////////////////////////////////// STEP CLASS
class PizzaFace {
	constructor(x_pos, y_pos, numSlices, toothSliderValue){
		this.sliceAngle = null;
		this.beat_color = 200;
		this.x_pos = x_pos;
		this.y_pos = y_pos;
		this.slices = numSlices;
    this.buttonPos = 0.75;
    this.buttonWidth = 10;
    this.buttonHeight = 10;
    this.stepAngles = []; // STEP OBJECT ARRAY
    this.stepColor = [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200];
    this.distArray = [];
    this.initialToothAngle = 360 / toothSliderValue;
    this.toothOffset = 10;
    this.toothAngleOffset = 90;
    this.initialSliceAngle = null;
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
        line(0, 0, (pizzaDiam * cos((this.stepAngles[i]) - 90)),
          (pizzaDiam * sin((this.stepAngles[i]) - 90)));
          fill(this.stepColor[i]);
        ellipse(((pizzaDiam * this.buttonPos) * cos((this.stepAngles[i]) - 90)),
          ((pizzaDiam * this.buttonPos) * sin((this.stepAngles[i]) - 90)),
          this.buttonWidth, this.buttonHeight);
    }
	}

  showTeeth(toothSliderValue) {
    stroke(200);
    strokeWeight(5);
    for (var i = 0; i < toothSliderValue; i++) {
      line((this.pizzaDiam * cos((this.initialToothAngle * i) - this.toothAngleOffset)),
        (this.pizzaDiam * sin((this.initialToothAngle * i) - this.toothAngleOffset)),
        ((this.pizzaDiam + this.toothOffset) * cos((this.initialToothAngle * i) - this.toothAngleOffset)),
        ((this.pizzaDiam + this.toothOffset) * sin((this.initialToothAngle * i) - this.toothAngleOffset)));
    }
  }

  showPlayHead() {
    stroke(94, 163, 120);
    strokeWeight(10);
    line((this.pizzaDiam * cos(toothAngle)),
      (this.pizzaDiam * sin(toothAngle)),
      ((this.pizzaDiam + this.toothOffset) * cos(toothAngle)),
      ((this.pizzaDiam + this.toothOffset) * sin(toothAngle)));
  }

	clicked(px, py) {
		px = px - canvasOffset;
		py = py - canvasOffset;
    var i;
    for(i=0; i < this.stepAngles.length; i++) {
      this.distArray[i] = dist(px, py,
        ((pizzaDiam * this.buttonPos) * cos(this.stepAngles[i] - 90)),
        ((pizzaDiam * this.buttonPos) * sin(this.stepAngles[i] - 90)));
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
