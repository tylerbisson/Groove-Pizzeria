let t1;
let t2;
let t12;
let t22;
///////////////////////////////////////////////////////////////////// VARIABLE BANK
// initial variables are set to allow immediate launch without using "update slider"
// functions or adding too many procedures into the draw loop
let numSteps = 16;
let numSteps2 = 16;

let numTeeth1 = 16;
let numTeeth2 = 16;

//270 degrees is bc teeth are offset by quater right turn i.e. 90 degrees
//therefore, 12 o clock is at 270 rather than zero
let toothAngle = 270;
let toothArcLength = 100;

let pizzaDiam1 = (toothArcLength * numTeeth1) / (2 * Math.PI);
let pizzaDiam2 = (toothArcLength * numTeeth2) / (2 * Math.PI);

var audioContext = new AudioContext();
let BPM = 120;

let sixteenthNotesPerMin;
let sixteenthNotesPerMin2;
let secondsPerSixteenthNote;
let secondsPerSixteenthNote2;
let millisPerRotation;
let millisPerRotation2;

sixteenthNotesPerMin = BPM * 4;
secondsPerSixteenthNote = 60/sixteenthNotesPerMin;
millisPerRotation = secondsPerSixteenthNote * numTeeth1 * 1000;
let soundIntervalRate = millisPerRotation / numSteps;

sixteenthNotesPerMin2 = BPM * 4;
secondsPerSixteenthNote2 = 60/sixteenthNotesPerMin2;
millisPerRotation2 = secondsPerSixteenthNote2 * numTeeth2 * 1000;
let soundIntervalRate2 = millisPerRotation2 / numSteps2;

//allows to work with PizzaFace as if its center was at (0,0)
let canvasOffset = 600;

let stepIteratorVar1 = 0;
let stepIteratorVar2 = 0;

///////////////// TALE OF TWO CLOCKS VARS
let noteTime;
let startTime = audioContext.currentTime + 0.005;
var scheduleAheadTime = 0.1;
var nextNoteTime = 0.0;

// var nextNoteTime1 = 0.0;
// var nextNoteTime2 = 0.0;
var testi = 0;

///////////////////////////////////////////////////////////////////// SET UP FUNCTION

function setup() {

  createCanvas(1200, 1200);
  angleMode(DEGREES);

  bpmSlider = createSlider(20, 300, 120);
  bpmSlider.position(10, 10);
  bpmSlider.style('width', '100px');
  bpmSlider.mouseReleased(sketchUpdateBPM);

  greeting = loadSound(
  '/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/groovepizzaria.wav', loaded);

  testPizza = new PizzaFace(-300, -250, 16, 16);
  testPizza2 = new PizzaFace(300, -250, 16, 16);

  testPizza.sliceSlider.mouseReleased(sketchUpdateBPM);
  testPizza2.sliceSlider.mouseReleased(sketchUpdateBPM);

  testPizza.toothSlider.input(updateTeeth1);
  testPizza2.toothSlider.input(updateTeeth2);

  stepIteratorVar1 = testPizza.stepAngles.length - 1;
  stepIteratorVar2 = testPizza2.stepAngles.length - 1;

  let schedulerCaller = setInterval(scheduler, 25);
}

///////////////////////////////////////////////////////////////////// INITIAL LOAD & PLAY AUDIO FUNCTION

function loaded() {
  greeting.play();
}

///////////////////////////////////////////////////////////////////// STEP INCREMENTER FUNCTION

function incrementSoundLaunch(nextNoteTime) {

  if (testPizza.stepColor[stepIteratorVar1] == 0) {
    playNote(nextNoteTime);
  }

  if (stepIteratorVar1 <= testPizza.stepAngles.length - 2) {
    testPizza.stepAngle = (360 / testPizza.sliceSlider.value()) * (stepIteratorVar1 + 1) - 90;
    stepIteratorVar1++;
  }

  else if (stepIteratorVar1 == testPizza.stepAngles.length - 1|| stepIteratorVar1 > testPizza.stepAngles.length - 1) {
    stepIteratorVar1 = testPizza.stepAngles.length - 1;
    testPizza.stepAngle = (360 / testPizza.sliceSlider.value()) * (stepIteratorVar1 + 1) - 90;
    stepIteratorVar1 = 0;
  }
}

///////////////////////////////////////////////////////////////////// STEP INCREMENTER FUNCTION 2

function incrementSoundLaunch2(nextNoteTime) {

  if (testPizza2.stepColor[stepIteratorVar2] == 0) {
    playNote2(nextNoteTime);
  }

  if (stepIteratorVar2 <= testPizza2.stepAngles.length - 2) {
    testPizza2.stepAngle = (360 / testPizza2.sliceSlider.value()) * (stepIteratorVar2 + 1) - 90;
    stepIteratorVar2++;
  }

  else if (stepIteratorVar2 == testPizza2.stepAngles.length - 1|| stepIteratorVar2 > testPizza2.stepAngles.length - 1) {
    stepIteratorVar2 = testPizza2.stepAngles.length - 1;
    testPizza2.stepAngle = (360 / testPizza2.sliceSlider.value()) * (stepIteratorVar2 + 1) - 90;
    stepIteratorVar2 = 0;
  }
}

///////////////////////////////////////////////////////////////////// SET BPM FUNCTION

function sketchUpdateBPM() {

  BPM = bpmSlider.value();

  numSteps = testPizza.sliceSlider.value();
  numSteps2 = testPizza2.sliceSlider.value();

  sixteenthNotesPerMin = BPM * 4;
  secondsPerSixteenthNote = 60/sixteenthNotesPerMin;
  millisPerRotation = secondsPerSixteenthNote * testPizza.numTeeth * 1000;
  soundIntervalRate = millisPerRotation / numSteps;

  sixteenthNotesPerMin2 = BPM * 4;
  secondsPerSixteenthNote2 = 60/sixteenthNotesPerMin2;
  millisPerRotation2 = secondsPerSixteenthNote2 * testPizza2.numTeeth * 1000;
  soundIntervalRate2 = millisPerRotation2 / numSteps2;

  stepIteratorVar1 = testPizza.stepAngles.length - 1;
  stepIteratorVar2 = testPizza2.stepAngles.length - 1;
}

///////////////////////////////////////////////////////////////////// UPDATE TEETH FUNCTION

function updateTeeth1() {
  testPizza.numTeeth = testPizza.toothSlider.value();
  testPizza.initialToothAngle = 360 / testPizza.toothSlider.value();
  sketchUpdateBPM();
  pizzaDiam1 = (toothArcLength * testPizza.numTeeth) / (2 * Math.PI);
}

///////////////////////////////////////////////////////////////////// UPDATE TEETH FUNCTION 2

function updateTeeth2() {
  testPizza2.numTeeth = testPizza2.toothSlider.value();
  testPizza2.initialToothAngle = 360 / testPizza2.toothSlider.value();
  sketchUpdateBPM();
  pizzaDiam2 = (toothArcLength * testPizza2.numTeeth) / (2 * Math.PI);
}

///////////////////////////////////////////////////////////////////// MOUSE PRESSED FUNCTION

function mousePressed() {
    testPizza.clicked(mouseX, mouseY);
    testPizza2.clicked(mouseX, mouseY);
}

///////////////////////////////////////////////////////////////////// SCHEDULER FUNCTION

function scheduler() {
  var currentTime = audioContext.currentTime;
  currentTime -= startTime;

    while (testPizza.nextNoteTime < (currentTime + scheduleAheadTime)) {
          incrementSoundLaunch(testPizza.nextNoteTime);
          testPizza.nextNote();
        }

    while  (testPizza2.nextNoteTime < (currentTime + scheduleAheadTime)) {
           incrementSoundLaunch2(testPizza2.nextNoteTime);
           testPizza2.nextNote();
        }
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
