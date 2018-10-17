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

let setInt1;
let setInt2;

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

var nextNoteTime1 = 0.0;
var nextNoteTime2 = 0.0;
var testi = 0;

///////////////////////////////////////////////////////////////////// SET UP FUNCTION

function setup() {
  // print("context.currentTime " + audioContext.currentTime);
  createCanvas(1200, 1200);
  angleMode(DEGREES);

  bpmSlider = createSlider(20, 300, 120);
  bpmSlider.position(10, 10);
  bpmSlider.style('width', '100px');
  bpmSlider.mouseReleased(sketchUpdateBPM);

  greeting = loadSound(
  '/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/groovepizzaria.wav', loaded);

  //OOP HACKING
  testPizza = new PizzaFace(-300, -250, 16, 16);
  testPizza2 = new PizzaFace(300, -250, 16, 16);

  // testPizza.sliceSlider.input(testPizza.updateSlices);
  testPizza.sliceSlider.mouseReleased(sketchUpdateBPM);
  testPizza2.sliceSlider.mouseReleased(sketchUpdateBPM);

  testPizza.toothSlider.input(updateInitialTeeth1);
  testPizza2.toothSlider.input(updateInitialTeeth2);

//JS TIMERS
  stepIteratorVar1 = testPizza.stepAngles.length - 1;
  stepIteratorVar2 = testPizza2.stepAngles.length - 1;

  // setInt1 = setInterval(incrementSoundLaunch, soundIntervalRate);
  // setInt2 = setInterval(incrementSoundLaunch2, soundIntervalRate2);

  let schedulerCaller = setInterval(scheduler, 25);

  // var source = audioContext.createBufferSource();
  // source.buffer = realBuffer;
  // source.connect(audioContext.destination);
  // // source.start(0);
  // source.start(2);
  // playBuffer(10);
}

///////////////////////////////////////////////////////////////////// PLAY AUDIO BUFFER FUNCTION

function playBuffer() {
  var source = audioContext.createBufferSource();
  source.buffer = realBuffer;
  source.connect(audioContext.destination);
  source.start(0);
}

///////////////////////////////////////////////////////////////////// INITIAL LOAD & PLAY AUDIO FUNCTION

function loaded() {
  greeting.play();
  // scheduler();
}

///////////////////////////////////////////////////////////////////// STEP INCREMENTER FUNCTION

function incrementSoundLaunch(nextNoteTime) {

  // print("incrementSoundLaunch " + nextNoteTime);
  testi = testi + 1;
  // print(testi);

  t2 = Date.now() - t1;
  t1 = Date.now();
  // print(" 1 " + t2);

  // print("context.currentTime " + audioContext.currentTime);

  if (testPizza.stepColor[stepIteratorVar1] == 0) {
    // playBuffer();
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
    // stepColorIterator = 0;
  }
}

///////////////////////////////////////////////////////////////////// STEP INCREMENTER FUNCTION 2

function incrementSoundLaunch2(nextNoteTime) {

  t22 = Date.now() - t12;
  t12 = Date.now();
  // print(" 2      " + t22);

  // print("2 " + (Date.now() - startTime));
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
  nextNoteTime1 = nextNoteTime2 = audioContext.currentTime;
  // startTime = (Date.now());
  stopFunction();

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

  stepIteratorVar1 = testPizza.stepAngles.length - 1;
  stepIteratorVar2 = testPizza2.stepAngles.length - 1;

  // setInt1 = setInterval(incrementSoundLaunch, soundIntervalRate);
  // setInt2 = setInterval(incrementSoundLaunch2, soundIntervalRate2);

  // print("soundIntervalRate " + soundIntervalRate);
  // print("soundIntervalRate2 " + soundIntervalRate2);
}

///////////////////////////////////////////////////////////////////// CLEAR SET INTERVAL FUNCTION

function stopFunction() {
  // clearInterval(setInt1);
  // clearInterval(setInt2);
}

///////////////////////////////////////////////////////////////////// UPDATE INITIAL TEETH FUNCTION

function updateInitialTeeth1() {
  // nextNoteTime1 = nextNoteTime2 = audioContext.currentTime;
  numTeeth1 = testPizza.toothSlider.value();
  testPizza.initialToothAngle = 360 / testPizza.toothSlider.value();
  sketchUpdateBPM();
  pizzaDiam1 = (toothArcLength * numTeeth1) / (2 * Math.PI);
}

///////////////////////////////////////////////////////////////////// UPDATE INITIAL TEETH FUNCTION 2

function updateInitialTeeth2() {
  // nextNoteTime1 = nextNoteTime2 = audioContext.currentTime;
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
  // print("context.currentTime " + audioContext.currentTime);
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

///////////////////////////////////////////////////////////////////// AUDIO BUFFER SETUP

var xhr = new XMLHttpRequest();
xhr.open('get', '/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/hihat.wav');
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

///////////////////////////////////////////////////////////////////// AUDIO BUFFER SETUP

var xhr2 = new XMLHttpRequest();
xhr2.open('get', '/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/snare.wav');
xhr2.responseType = 'arraybuffer'; // directly as an ArrayBuffer
xhr2.send();
var realBuffer2;

xhr2.onload = function () {
  var audioData2 = xhr2.response;
  audioContext.decodeAudioData(audioData2, function (buffer2) {
    realBuffer2 = buffer2;
  },

function (e) { console.log('Error with decoding audio data' + e.err); });
};

///////////////// TALE OF TWO CLOCKS STUFF

function playNote(noteTime) {
  // print("hi");
  var source = audioContext.createBufferSource();
  source.buffer = realBuffer;
  source.connect(audioContext.destination);
  source.start(noteTime);
}

function playNote2(noteTime) {
  // print("hi");
  var source = audioContext.createBufferSource();
  source.buffer = realBuffer2;
  source.connect(audioContext.destination);
  source.start(noteTime);
}

// function handlePlay() {
//     // rhythmIndex = 0;
//     noteTime = 0.0;
//     startTime = audioContext.currentTime + 0.005;
//     // print("startTime " + startTime);
//     schedule();
// }

function schedule() {
  var currentTime = audioContext.currentTime;
  // print("currentTime1 " + currentTime);
  currentTime -= startTime;
  // print("currentTime2 " + currentTime);
  var contextPlayTime = noteTime + startTime;
  // print("contextPlayTime " + contextPlayTime);
  // playNote(contextPlayTime);
  // while (noteTime < currentTime + 0.200) {
  //   print("passed");
  // }
}

function scheduler() {
  // testi = testi + 1;
  var currentTime = audioContext.currentTime;
  currentTime -= startTime;
  // console.log("scheduler");
    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.

    // console.log("nextNoteTime " + testi + " " + nextNoteTime);
    // console.log("currentTime " + testi + " " + currentTime);
    // console.log("currentTime + scheduleAheadTime" + testi + " " + (currentTime + scheduleAheadTime));
    // console.log("out loop difference " + testi + " " + ((currentTime + scheduleAheadTime) - nextNoteTime));

    while (nextNoteTime1 < (currentTime + scheduleAheadTime)) {
      // console.log("in loop         difference " + testi + " " + ((currentTime + scheduleAheadTime) - nextNoteTime));
        // playNote(nextNoteTime);
        // print("scheduler " + nextNoteTime);
          incrementSoundLaunch(nextNoteTime1);
          nextNote1();
        }

    while  (nextNoteTime2 < (currentTime + scheduleAheadTime)) {
          incrementSoundLaunch2(nextNoteTime2);
          nextNote2();
        }

        // incrementSoundLaunch(nextNoteTime);
        // incrementSoundLaunch2(nextNoteTime);

        // scheduleNote( current16thNote, nextNoteTime );
        // console.log("in the while loop");
        // console.log("audioContext.currentTime " + audioContext.currentTime);
        // console.log("nextNoteTime " + nextNoteTime);
        // console.log("difference " + testi + " " + (nextNoteTime - audioContext.currentTime));
        // nextNote();
}

function nextNote1() {
    BPM = bpmSlider.value();

    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / BPM;    // Notice this picks up the CURRENT
                                          // tempo value to calculate beat length.
    var secondsPerSixteenth1 = secondsPerBeat * 0.25;
    var secondsPerRotation1 = secondsPerSixteenth1 * numTeeth1;
    var secondsPerStep1 = secondsPerRotation1 / numSteps;
    nextNoteTime1 += secondsPerStep1;    // Add beat length to last beat time
    // print("1 " + nextNoteTime1);

    // current16thNote++;    // Advance the beat number, wrap to zero
    // if (current16thNote == 16) {
    //     current16thNote = 0;
    // }
}

function nextNote2() {
    BPM = bpmSlider.value();

    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / BPM;    // Notice this picks up the CURRENT
                                          // tempo value to calculate beat length.
    var secondsPerSixteenth2 = secondsPerBeat * 0.25;
    var secondsPerRotation2 = secondsPerSixteenth2 * numTeeth2;
    var secondsPerStep2 = secondsPerRotation2 / numSteps2;
    nextNoteTime2 += secondsPerStep2;    // Add beat length to last beat time
    // print("2 " + nextNoteTime2);

    // current16thNote++;    // Advance the beat number, wrap to zero
    // if (current16thNote == 16) {
    //     current16thNote = 0;
    // }
}
