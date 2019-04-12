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
  resetPizzas("stop", testPizza, testPizza2);
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

///////////////////////////////////////////////////////////////////// RESET PIZZAS

function resetPizzas(type, ...pizzas){
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

    resetPizzas("pause", testPizza, testPizza2);

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