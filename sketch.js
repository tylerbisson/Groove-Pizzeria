var audioContext = new AudioContext();

//270 degrees is bc teeth are offset by quater right turn i.e. 90 degrees
//therefore, 12 o clock is at 270 rather than zero
let toothAngle = 270;
let BPM = 120;

//allows to work with PizzaFace as if its center was at (0,0)
let canvasOffset = 600;

///////////////// TALE OF TWO CLOCKS VARS
let startTime = audioContext.currentTime + 0.005;
var scheduleAheadTime = 0.1;
var nextNoteTime = 0.0;

///////////////////////////////////////////////////////////////////// SET UP FUNCTION

function setup() {

  createCanvas(1220, 680);
  angleMode(DEGREES);

  bpmSlider = createSlider(20, 300, 120);
  bpmSlider.position(20, 10);
  bpmSlider.style('width', '100px');
  bpmSlider.mouseReleased(sketchUpdateBPM);

  greeting = loadSound(
  '/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/groovepizzaria.wav', loaded);

  testPizza = new PizzaFace(-290, -270, 16, 16, [10, 150, 120]);
  testPizza2 = new PizzaFace(310, -270, 16, 16, [206, 94, 28]);

  // testPizza.sliceSlider.mouseReleased(sketchUpdateBPM);
  // testPizza2.sliceSlider.mouseReleased(sketchUpdateBPM);

  testPizza.sliceSlider.mouseReleased(syncAndTeethTest1);
  testPizza2.sliceSlider.mouseReleased(syncAndTeethTest2);

  testPizza.toothSlider.input(syncAndTeethTest1);
  testPizza2.toothSlider.input(syncAndTeethTest2);

  let schedulerCaller = setInterval(scheduler, 25);
}

///////////////////////////////////////////////////////////////////// INITIAL LOAD & PLAY AUDIO FUNCTION

function loaded() {
  greeting.play();
}

function syncAndTeethTest1(){
  testPizza.numTeeth = testPizza.toothSlider.value();
  testPizza.nextNoteTime = testPizza2.nextNoteTime;
  testPizza.teethTest();
}

function syncAndTeethTest2(){
  testPizza2.numTeeth = testPizza2.toothSlider.value();
  testPizza2.nextNoteTime = testPizza.nextNoteTime;
  testPizza2.teethTest();
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

///////////////////////////////////////////////////////////////////// DRAW FUNCTION

function draw() {

	background(230, 237, 233);
	translate(600,600);

  testPizza.showFace(testPizza.testDiam);
  testPizza.showSpokes(testPizza.sliceSlider.value());
  testPizza.showTeeth(testPizza.toothSlider.value());
  testPizza.showShapes();
  testPizza.showPlayHead();

  testPizza2.showFace(testPizza2.testDiam);
  testPizza2.showSpokes(testPizza2.sliceSlider.value());
  testPizza2.showTeeth(testPizza2.toothSlider.value());
  testPizza2.showShapes();
  testPizza2.showPlayHead();

  stroke(200);
  textSize(32);
  fill(230, 237, 233);


  text(bpmSlider.value() + " bpm", -580, -545);

  strokeWeight(0);
  fill(testPizza.color[0], testPizza.color[1], testPizza.color[2], 90);
  // x pos of slider - 600 + width + 10; y pos of slider + 11
  text(testPizza.sliceSlider.value(),
  testPizza.slidersXPos - 600 + 110, testPizza.sliceSliderYPos - 600 + 11);
  text(testPizza.toothSlider.value(),
  testPizza.slidersXPos - 600 + 110, testPizza2.toothSliderYPos - 600 + 11);

  fill(testPizza2.color[0], testPizza2.color[1], testPizza2.color[2], 90);
  text(testPizza2.sliceSlider.value(),
  testPizza2.slidersXPos - 600 + 110, testPizza2.sliceSliderYPos - 600 + 11);
  text(testPizza2.toothSlider.value(),
  testPizza2.slidersXPos - 600 + 110, testPizza2.toothSliderYPos - 600 + 11);
}
