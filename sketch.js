//270 degrees is bc teeth are offset by quater right turn i.e. 90 degrees
//therefore, 12 o clock is at 270 rather than zero
let toothAngle = 270;
let BPM = 120;
let bpmFontFill = [230, 237, 233];
let lcm = 16;

let timeUnit = ((60/120)/4);
let ttlPatternTime = lcm * timeUnit;
let stepRatio = 1;

///////////////// TALE OF TWO CLOCKS VARS
var scheduleAheadTime = 0.1;
var nextNoteTime = 0.0;

window.onload = function(){
  document.getElementById("play-stop").addEventListener("click", playPause);
  document.getElementById("clear").addEventListener("click", clearPizzas);
}

///////////////////////////////////////////////////////////////////// SET UP FUNCTION

function setup() {
  console.log(windowWidth);
  console.log(windowHeight);
  if (windowWidth <= 1239 || windowHeight <= 666) {
    appWidth = 1159;
    appHeight = 665;
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
  
  testPizza = new PizzaFace("testPizza", -.233 * appWidth, -.368 * appHeight, 16, 16, [221, 65, 26], canvasOffset, [1, 2, 3]);
  testPizza2 = new PizzaFace("testPizza2", .259 * appWidth, -.368 * appHeight, 16, 16, [60, 94, 178], canvasOffset, [4, 5, 6]);

  let pizzas = [testPizza, testPizza2];
        
  eventListenerSetUp(...pizzas);
}

///////////////////////////////////////////////////////////////////// SET UP EVENT LISTENERS

function eventListenerSetUp(...pizzas){
  pizzas.forEach(pizza => {
    pizza.rotateSlider.input(() => rotateShapes(pizza));
  })
  pizzas[0].sliceSlider.mouseReleased(() => syncAndTeethTest(pizzas[0], pizzas[1]));
  pizzas[1].sliceSlider.mouseReleased(() => syncAndTeethTest(pizzas[1], pizzas[0]));
  pizzas[0].toothSlider.input(() => syncAndTeethTest(pizzas[0], pizzas[1]));
  pizzas[1].toothSlider.input(() => syncAndTeethTest(pizzas[1], pizzas[0]));
}

function mouseDragged() {
    testPizza.dragged(mouseX, mouseY);
    testPizza2.dragged(mouseX, mouseY);
}

function mousePressed() {
    testPizza.pressed(mouseX, mouseY);
    testPizza2.pressed(mouseX, mouseY);
}

///////////////////////////////////////////////////////////////////// INITIAL LOAD & PLAY AUDIO FUNCTION

function syncAndTeethTest(pizza, pizza2){
  pizza.numTeeth = pizza.toothSlider.value();
  testPizza.nextNoteTime = pizza2.nextNoteTime;
  pizza.teethTest();
  pizza.rotateSlider.elt.max = pizza.sliceSlider.value();
  lcm = lcm_two_numbers(pizza.numTeeth, pizza2.numTeeth);
}

function rotateShapes(pizza){
  let rotNum = pizza.rotateSlider.value();
  pizza.rotateShapes(rotNum);
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
  resetPizzaSchedules("stop", testPizza, testPizza2);
}


///////////////////////////////////////////////////////////////////// SCHEDULER FUNCTION

function scheduler() {
  var currentTime = audioContext.currentTime;
  currentTime -= startTime;

    while (testPizza.nextNoteTime < (currentTime + scheduleAheadTime)) {
          testPizza.incrementSoundLaunch(testPizza.nextNoteTime);
          testPizza.nextNote();
        }

    while  (testPizza2.nextNoteTime < (currentTime + scheduleAheadTime)) {
           testPizza2.incrementSoundLaunch(testPizza2.nextNoteTime);
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

///////////////////////////////////////////////////////////////////// RESET PIZZAS

function resetPizzaSchedules(type, ...pizzas){
  pizzas.forEach(pizza => {
    pizza.tmlnPlyHdArrX = [];
    pizza.tmlnPlyHdArrY = [];
    pizza.tmlnItrtr = 0;
    if (type === "stop"){
      pizza.stepIteratorVar = 0;
    } else if (type === "pause"){
      pizza.nextNoteTime = 0;
    }
  })
}

paused = true;

function playPause() {
  document.getElementById("play-stop").classList.toggle("play");
  document.getElementById("play-stop").classList.toggle("stop");
  if (paused === false) {
    paused = true;
    clearInterval(schedulerCaller);
  } else if (paused === true) {
    paused = false;
    BPM = bpmSlider.value();

    resetPizzaSchedules("pause", testPizza, testPizza2);

    audioContext = new AudioContext();
    setupSounds();
    startTime = audioContext.currentTime + 0.005;
    schedulerCaller = setInterval(scheduler, 25);
  }
}

function keyTyped() {
  if (key === ' ') {
    playPause();
  } else if (key === ' ' && paused === true) {
    playPause();
  }
}

function clearPizzas() {
  testPizza.setUp();
  testPizza2.setUp();
}