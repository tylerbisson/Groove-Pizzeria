//270 degrees is bc teeth are offset by quater right turn i.e. 90 degrees
//therefore, 12 o clock is at 270 rather than zero
let toothAngle = 270;
let BPM = 120;
let bpmFontFill = [230, 237, 233];
let rotNum1;
let rotNum2;
let lcm = 16;

let timeUnit = ((60/120)/4);
let ttlPatternTime = lcm * timeUnit;
let stepRatio = 1;

///////////////// TALE OF TWO CLOCKS VARS
var scheduleAheadTime = 0.1;
var nextNoteTime = 0.0;

window.onload = function(){
  document.getElementById("play-stop").addEventListener("click", playPause);
}

///////////////////////////////////////////////////////////////////// SET UP FUNCTION

function setup() {

  if (windowWidth <= 1280 || windowHeight <= 730) {
    appWidth = 1220;
    appHeight = 700;
  } else{
    appWidth = 0.859 * windowWidth;
    appHeight = appWidth * (35 / 61);
  }

  trans = appWidth / 2;
  
  let cnv = createCanvas(appWidth, appHeight);
  cnv.parent('app');

  //allows to work with PizzaFace as if its center was at (0,0)
  let canvasOffset = appWidth / 2;

  angleMode(DEGREES);

  bpmSliderXpos = appWidth * .889;
  bpmSliderYpos = appHeight * .015;

  bpmSlider = createSlider(20, 300, 120);
  bpmSlider.position(bpmSliderXpos, bpmSliderYpos);
  bpmSlider.style('width', '100px');
  bpmSlider.mouseReleased(sketchUpdateBPM);
  bpmSlider.parent('app');

  testPizza = new PizzaFace("testPizza", -.238 * appWidth, -.368 * appHeight, 16, 16, [29, 135, 36], canvasOffset);
  testPizza2 = new PizzaFace("testPizza2", .254 * appWidth, -.368 * appHeight, 16, 16, [206, 94, 28], canvasOffset);

  testPizza.sliceSlider.mousePressed(returnToRotationZero1);
  testPizza2.sliceSlider.mousePressed(returnToRotationZero2);

  testPizza.sliceSlider.mouseReleased(syncAndTeethTest1);
  testPizza2.sliceSlider.mouseReleased(syncAndTeethTest2);

  testPizza.toothSlider.input(syncAndTeethTest1);
  testPizza2.toothSlider.input(syncAndTeethTest2);

  testPizza.rotateSlider.input(rotateShapes1);
  testPizza2.rotateSlider.input(rotateShapes2);
}

///////////////////////////////////////////////////////////////////// INITIAL LOAD & PLAY AUDIO FUNCTION

function returnToRotationZero1() {
  rotNum1 = 0;
  testPizza.rotateShapes(rotNum1);
  testPizza.rotateSlider.value(0);
}

function returnToRotationZero2(){
  rotNum2 = 0;
  testPizza2.rotateShapes(rotNum2);
  testPizza2.rotateSlider.value(0);
}

function syncAndTeethTest1(){
  testPizza.numTeeth = testPizza.toothSlider.value();
  testPizza.nextNoteTime = testPizza2.nextNoteTime;
  testPizza.teethTest();
  testPizza.rotateSlider.elt.max = testPizza.sliceSlider.value();
  lcm = lcm_two_numbers(testPizza.numTeeth, testPizza2.numTeeth);
  testPizza.tmlnPlyHdArrX = [];
  testPizza.tmlnPlyHdArrY = [];
  testPizza2.tmlnPlyHdArrX = [];
  testPizza2.tmlnPlyHdArry = [];
  testPizza.tmlnItrtr = 0;
  testPizza2.tmlnItrtr = 0;
}

function syncAndTeethTest2(){
  testPizza2.numTeeth = testPizza2.toothSlider.value();
  testPizza2.nextNoteTime = testPizza.nextNoteTime;
  testPizza2.teethTest();
  testPizza2.rotateSlider.elt.max = testPizza2.sliceSlider.value();
  lcm = lcm_two_numbers(testPizza.numTeeth, testPizza2.numTeeth);
  testPizza.tmlnPlyHdArrX = [];
  testPizza.tmlnPlyHdArrY = [];
  testPizza2.tmlnPlyHdArrX = [];
  testPizza2.tmlnPlyHdArry = [];
  testPizza.tmlnItrtr = 0;
  testPizza2.tmlnItrtr = 0;
}

function rotateShapes1(){
  rotNum1 = testPizza.rotateSlider.value();
  testPizza.rotateShapes(rotNum1);
}

function rotateShapes2(){
  rotNum2 = testPizza2.rotateSlider.value();
  testPizza2.rotateShapes(rotNum2);
}

///////////////////////////////////////////////////////////////////// SET BPM FUNCTION

function sketchUpdateBPM() {
  if (testPizza.secondsPerStep < testPizza2.secondsPerStep) {
      testPizza.nextNoteTime = testPizza2.nextNoteTime;
  }
  else {
    testPizza2.nextNoteTime = testPizza.nextNoteTime;
  }

  BPM = bpmSlider.value();

  testPizza.stepIteratorVar = 0;
  testPizza2.stepIteratorVar = 0;

  testPizza.tmlnPlyHdArrX = [];
  testPizza.tmlnPlyHdArrY = [];
  testPizza2.tmlnPlyHdArrX = [];
  testPizza2.tmlnPlyHdArry = [];
  testPizza.tmlnItrtr = 0;
  testPizza2.tmlnItrtr = 0;
}

///////////////////////////////////////////////////////////////////// MOUSE DRAGGED FUNCTION

function mouseDragged() {
    testPizza.dragged(mouseX, mouseY);
    testPizza2.dragged(mouseX, mouseY);
}

///////////////////////////////////////////////////////////////////// MOUSE PRESSED FUNCTION

function mousePressed() {
    testPizza.pressed(mouseX, mouseY);
    testPizza2.pressed(mouseX, mouseY);
}

///////////////////////////////////////////////////////////////////// SCHEDULER FUNCTION

function scheduler() {
  var currentTime = audioContext.currentTime;
  currentTime -= startTime;

    while (testPizza.nextNoteTime < (currentTime + scheduleAheadTime)) {
          testPizza.incrementSoundLaunch(testPizza.nextNoteTime, 1, 2, 3);
          testPizza.nextNote();
        }

    while  (testPizza2.nextNoteTime < (currentTime + scheduleAheadTime)) {
           testPizza2.incrementSoundLaunch(testPizza2.nextNoteTime, 4, 5, 6);
           testPizza2.nextNote();
        }
}
///////////////////////////////////////////////////////////////////// LCM FUNCTION

function lcm_two_numbers(x, y) {
   if ((typeof x !== 'number') || (typeof y !== 'number'))
    return false;
  return (!x || !y) ? 0 : Math.abs((x * y) / gcd_two_numbers(x, y));
}

function gcd_two_numbers(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  while(y) {
    var t = y;
    y = x % y;
    x = t;
  }
  return x;
}
