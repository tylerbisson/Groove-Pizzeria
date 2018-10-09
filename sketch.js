///////////////////////////////////////////////////////////////////// VARIABLE BANK
// initial variables are set to allow immediate launch without using "update slider"
// functions or adding too many procedures into the draw loop
let numSteps = 16;
let numTeeth = 16;

//270 degrees is bc teeth are offset by quater right turn i.e. 90 degrees
//therefore, 12 o clock is at 270 rather than zero
let toothAngle = 270;
let toothArcLength = 100;
let pizzaDiam = (toothArcLength * numTeeth) / (2 * Math.PI);

var audioContext = new AudioContext();
let BPM = 120;
let steps = []; // STEP OBJECT ARRAY
let pizzaFace; // STEP OBJECT
let intervalRate = (((60 / ((BPM * 4) / numTeeth))) * 1000) / numTeeth;
let soundIntervalVar;
let soundIntervalVarTest2;
let soundIntervalRate = (60 / (BPM * 4) * 1000);
let externalStepIteratorVar = 0;
//allows to work with PizzaFace as if its center was at (0,0)
let canvasOffset = 600;

let testPizzaIterator = 0;

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
  bpmSlider.mouseReleased(updateBPM);

  sliceSlider = createSlider(2, 16, 16);
  sliceSlider.position(30, 100);
  sliceSlider.style('width', '100px');
  sliceSlider.input(updateSlices);


  toothSlider = createSlider(2, 16, 16);
  toothSlider.position(30, 120);
  toothSlider.style('width', '100px');
  toothSlider.input(updateInitialTeeth);

  greeting = loadSound(
  '/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/groovepizzaria.wav', loaded);

  //JS CLOCK
  soundIntervalVar = setInterval(incrementSoundLauncher, soundIntervalRate);

  //OOP HACKING
  testPizza = new PizzaFace(-300, -250, sliceSlider.value(), toothSlider.value());
  testPizza2 = new PizzaFace(300, -250, sliceSlider.value(), toothSlider.value());
  testPizza.sliceSlider.input(testPizza.updateSlices);
  // var _testPizza = testPizza;
  soundIntervalVarTest2 = setInterval(testPizza.incrementSoundLaunch, 1, testPizza.stepIteratorVar);
}

// function testPrint() {
//   print("testPrint");
// }

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
  if (testPizza.stepColor[externalStepIteratorVar] == 0 || testPizza2.stepColor[externalStepIteratorVar] == 0 ) {
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
  testPizza2.stepAngles = [];
  updateBPM();
  externalStepIteratorVar = 0;
}

///////////////////////////////////////////////////////////////////// UPDATE INITIAL TEETH FUNCTION
function updateInitialTeeth() {
  numTeeth = toothSlider.value();
  testPizza.initialToothAngle = 360 / toothSlider.value();
  testPizza2.initialToothAngle = 360 / toothSlider.value();
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
    testPizza.clicked(mouseX, mouseY);
    testPizza2.clicked(mouseX, mouseY);
}

// function mouseMoved() {
//   print(mouseX + " " + mouseY);
// }

///////////////////////////////////////////////////////////////////// DRAW FUNCTION
function draw() {
	background(230, 237, 233);
	translate(600,600);

	testPizza.showFace(pizzaDiam);
	testPizza.showSpokes(testPizza.sliceSlider.value());
  testPizza.showTeeth(toothSlider.value());
  testPizza.showPlayHead();

  testPizza2.showFace(pizzaDiam);
  testPizza2.showSpokes(testPizza2.sliceSlider.value());
  testPizza2.showTeeth(toothSlider.value());
  testPizza2.showPlayHead();
}
