///////////////////////////////////////////////////////////////////// VARIABLE BANK
// initial variables are set to allow immediate launch without using "update slider"
// functions or adding too many procedures into the draw loop
let numSteps = 16;
let numSteps2 = 16;

let numTeeth = 16;
let numTeeth1 = 16;
let numTeeth2 = 16;

//270 degrees is bc teeth are offset by quater right turn i.e. 90 degrees
//therefore, 12 o clock is at 270 rather than zero
let toothAngle = 270;
let toothArcLength = 100;
let pizzaDiam1 = (toothArcLength * numTeeth) / (2 * Math.PI);
let pizzaDiam2 = (toothArcLength * numTeeth) / (2 * Math.PI);

var audioContext = new AudioContext();
let BPM = 120;
let steps = []; // STEP OBJECT ARRAY
let pizzaFace; // STEP OBJECT
let intervalRate = (((60 / ((BPM * 4) / numTeeth))) * 1000) / numTeeth;
let soundIntervalVar;
let soundIntervalVarTest2;

let sixteenthNotesPerMin;
let sixteenthNotesPerMin2;
let secondsPerSixteenthNote;
let secondsPerSixteenthNote2;
let millisPerRotation;
let millisPerRotation2;

let setInt1;
let setInt2;

let soundIntervalRate = (60 / (BPM * 4) * 1000);
let soundIntervalRate2 = (60 / (BPM * 4) * 1000);

let externalStepIteratorVar = 0;
//allows to work with PizzaFace as if its center was at (0,0)
let canvasOffset = 600;

// let testPizzaIterator = 0;
let stepIteratorVar1 = 0;
let stepIteratorVar2 = 0;

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

  bpmSlider = createSlider(50, 200, 120);
  bpmSlider.position(10, 10);
  bpmSlider.style('width', '100px');
  bpmSlider.mouseReleased(sketchUpdateBPM);

  greeting = loadSound(
  '/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/groovepizzaria.wav', loaded);

  //OOP HACKING
  testPizza = new PizzaFace(-300, -250, 16, 16);
  testPizza2 = new PizzaFace(300, -250, 16, 16);

  // testPizza.sliceSlider.input(testPizza.updateSlices);
  testPizza.sliceSlider.input(sketchUpdateBPM);
  testPizza2.sliceSlider.input(sketchUpdateBPM);

  testPizza.toothSlider.input(updateInitialTeeth1);
  testPizza2.toothSlider.input(updateInitialTeeth2);

//JS TIMERS
  setInt1 = setInterval(incrementSoundLaunch, soundIntervalRate);
  setInt2 = setInterval(incrementSoundLaunch2, soundIntervalRate2);
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

function incrementSoundLaunch() {
  if (testPizza.stepColor[stepIteratorVar1] == 0) {
    playBuffer();
  }

  if (stepIteratorVar1 < testPizza.stepAngles.length - 1) {
    stepIteratorVar1++;
    testPizza.toothAngle = (360 / testPizza.sliceSlider.value()) * (stepIteratorVar1 + 1) - 90;
  }

  else if (stepIteratorVar1 == testPizza.stepAngles.length - 1 || stepIteratorVar1 > testPizza.stepAngles.length - 1) {
    stepIteratorVar1 = 0;
    testPizza.toothAngle = (360 / testPizza.sliceSlider.value()) * (stepIteratorVar1 + 1) - 90;
  }
}

function incrementSoundLaunch2() {
  if (testPizza2.stepColor[stepIteratorVar2] == 0) {
    playBuffer();
  }

  if (stepIteratorVar2 < testPizza2.stepAngles.length - 1) {
    stepIteratorVar2++;
    testPizza2.toothAngle = (360 / testPizza2.sliceSlider.value()) * (stepIteratorVar2 + 1) - 90;
  }

  else if (stepIteratorVar2 == testPizza2.stepAngles.length - 1 || stepIteratorVar2 > testPizza2.stepAngles.length - 1) {
    stepIteratorVar2 = 0;
    testPizza2.toothAngle = (360 / testPizza2.sliceSlider.value()) * (stepIteratorVar2 + 1) - 90;
  }
}

function sketchUpdateBPM() {
  BPM = bpmSlider.value();

  numSteps = testPizza.sliceSlider.value();
  numSteps2 = testPizza2.sliceSlider.value();

  sixteenthNotesPerMin = BPM * 4;
  secondsPerSixteenthNote = 60/sixteenthNotesPerMin;
  millisPerRotation = secondsPerSixteenthNote * numTeeth1 * 1000;
  soundIntervalRate = millisPerRotation / numSteps;

  sixteenthNotesPerMin2 = BPM * 4;
  secondsPerSixteenthNote2 = 60/sixteenthNotesPerMin2;
  millisPerRotation2 = secondsPerSixteenthNote2 * numTeeth2 * 1000;
  soundIntervalRate2 = millisPerRotation2 / numSteps2;

  print("soundIntervalRate " + soundIntervalRate);
  print("soundIntervalRate2 " + soundIntervalRate2);
  // soundIntervalRate = (((60 / ((BPM * 4) / numTeeth1))) * 1000) / numTeeth1;
  // soundIntervalRate2 = (((60 / ((BPM * 4) / numTeeth2))) * 1000) / numTeeth2;

  stopFunction();

  stepIteratorVar1 = stepIteratorVar2 = 0;

  setInt1 = setInterval(incrementSoundLaunch, soundIntervalRate);
  setInt2 = setInterval(incrementSoundLaunch2, soundIntervalRate2);
}

function stopFunction() {
  clearInterval(setInt1);
  clearInterval(setInt2);
}

///////////////////////////////////////////////////////////////////// UPDATE INITIAL TEETH FUNCTION
function updateInitialTeeth1() {
  numTeeth1 = testPizza.toothSlider.value();
  testPizza.initialToothAngle = 360 / testPizza.toothSlider.value();
  sketchUpdateBPM();
  pizzaDiam1 = (toothArcLength * numTeeth1) / (2 * Math.PI);
}

///////////////////////////////////////////////////////////////////// UPDATE INITIAL TEETH FUNCTION
function updateInitialTeeth2() {
  numTeeth2 = testPizza2.toothSlider.value();
  testPizza2.initialToothAngle = 360 / testPizza2.toothSlider.value();
  sketchUpdateBPM();
  pizzaDiam2 = (toothArcLength * numTeeth2) / (2 * Math.PI);
}

///////////////////////////////////////////////////////////////////// MOUSE PRESSED FUNCTION
function mousePressed() {
    testPizza.clicked(mouseX, mouseY);
    testPizza2.clicked(mouseX, mouseY);
}

///////////////////////////////////////////////////////////////////// DRAW FUNCTION
function draw() {
	background(230, 237, 233);
	translate(600,600);

	testPizza.showFace(pizzaDiam1);
	testPizza.showSpokes(testPizza.sliceSlider.value());
  testPizza.showTeeth(testPizza.toothSlider.value());
  testPizza.showPlayHead();

  testPizza2.showFace(pizzaDiam2);
  testPizza2.showSpokes(testPizza2.sliceSlider.value());
  testPizza2.showTeeth(testPizza2.toothSlider.value());
  testPizza2.showPlayHead();
}
