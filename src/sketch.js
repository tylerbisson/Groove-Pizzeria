//270 degrees is bc teeth are offset by quater right turn i.e. 90 degrees
//therefore, 12 o clock is at 270 rather than zero
let toothAngle = 270;
let BPM = 120;
let lcm = 16;
backgroundColor = [211, 227, 223];

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
  if (windowWidth / windowHeight <= 1.9 ) {
    appWidth = windowWidth - (.08  * windowWidth);
    appHeight = (windowWidth - (.08 * windowWidth)) * .573
  }
  else if (windowHeight / windowWidth <= .6){
    appHeight = windowHeight - (.04 * windowHeight);
    appWidth = (windowHeight - (.04 * windowHeight)) * 1.742
  } 
  else{
    appWidth = 0.859 * windowWidth;
    appHeight = appWidth * (35 / 61);
  };

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
  bpmSlider.style('width', `${Math.ceil(appWidth * .0842)}px`);
  bpmSlider.mouseReleased(sketchUpdateBPM);
  bpmSlider.parent('app');
  
  testPizza = new PizzaFace("testPizza", -.233 * appWidth, -.368 * appHeight, 16, 16, [221, 65, 26], canvasOffset, [1, 2, 3]);
  testPizza2 = new PizzaFace("testPizza2", .259 * appWidth, -.368 * appHeight, 16, 16, [60, 94, 178], canvasOffset, [4, 5, 6]);

  let pizzas = [testPizza, testPizza2];
        
  eventListenerSetUp(...pizzas);

  let leftKit = createSelect();
  leftKit.addClass('left-kit');
  leftKit.position(appWidth * .35, appHeight * .087);
  leftKit.parent('app');
  leftKit.option('909 kick, clap, hat');
  leftKit.option('808 pitched bongos');
  leftKit.option('wood');
  leftKit.option('concrete');
  leftKit.option('midi out 1 (chrome only)')
  leftKit.changed(() => changeKit(leftKit, testPizza));

  let rightKit = createSelect();
  rightKit.addClass('right-kit');
  rightKit.position(appWidth * .575, appHeight * .087);
  rightKit.parent('app');
  rightKit.option('808 pitched bongos');
  rightKit.option('909 kick, clap, hat');
  rightKit.option('wood');
  rightKit.option('concrete');
  rightKit.option('midi out 2 (chrome only)')
  rightKit.changed(() => changeKit(rightKit, testPizza2));

  let linkedInButton = document.querySelector('.linkedin');
  linkedInButton.style.opacity = '100';

  let gitHubButton = document.querySelector('.github');
  gitHubButton.style.opacity = '100';

  let clearButton = document.querySelector('#clear');
  clearButton.style.fontSize = `${Math.ceil(appWidth * .0134)}px`;
  clearButton.style.color = "rgba(170, 170, 170)";

  let playButton = document.querySelector('.play');
  playButton.style.borderColor = "transparent transparent transparent rgba(170, 170, 170)";
  playButton.style.borderWidth = `${Math.ceil(appWidth * .0253)}px 0 ${Math.ceil(appWidth * .0253)}px ${Math.ceil(appWidth * .0438)}px`;

  let dropDowns = document.querySelectorAll('select');
  [].forEach.call(dropDowns, function(dropDown){
    dropDown.style.fontSize = `${Math.ceil(appWidth * .0101)}px`;
    dropDown.style.height = `${Math.ceil(appWidth * .0126)}px`;
    dropDown.style.paddingLeft = `${Math.ceil(appWidth * .0084)}px`;
    dropDown.style.paddingRight = `${Math.ceil(appWidth * .0084)}px`;
  });

  // let sliders = document.querySelectorAll('input');
  // [].forEach.call(sliders, function (slider) {
  //   // slider.style.background = 'blue';
  // });

  // Create our stylesheet
  var style = document.createElement('style');
  style.innerHTML =
    `:root {` +
      `--sliderButtonDiameter: ${Math.ceil(appWidth * .0065)}px;` +
    `}`+
    `.stop {` +
      `width: ${Math.ceil(appWidth * .0505)}px;` +
      `height: ${Math.ceil(appWidth * .0505)}px;` +
    `}`+
    `.social{` +
      `max-height: ${Math.ceil(appWidth * .0168)}px;` +
      `max-width: ${Math.ceil(appWidth * .0168)}px;` +
    `}`+ 
      `input[type=range]:nth-of-type(1)::-webkit-slider-runnable-track {` +
      `background: rgb(170,170,170);` + 
    `}`+ 
      `input[type=range]:nth-of-type(1)::-webkit-slider-thumb {` +
      `background: rgb(170,170,170);` + 
    `}`+
      `input[type=range]:nth-of-type(1):focus::-webkit-slider-runnable-track {` +
      `background: rgb(170,170,170);`+
    `}`+
      `input[type=range]:nth-of-type(2)::-webkit-slider-runnable-track {` +
      `background: rgb(170,170,170);` + 
    `}`+ 
      `input[type=range]:nth-of-type(2)::-webkit-slider-thumb {` +
      `background: rgb(170,170,170);` + 
    `}`+
      `input[type=range]:nth-of-type(2):focus::-webkit-slider-runnable-track {` +
      `background: rgb(170,170,170);`+
    `}`+
      `input[type=range]:nth-of-type(3)::-webkit-slider-runnable-track {` +
      `background: rgb(245,245,245);` + 
    `}`+ 
      `input[type=range]:nth-of-type(3)::-webkit-slider-thumb {` +
      `background: rgb(245,245,245);` + 
    `}`+ 
      `input[type=range]:nth-of-type(3):focus::-webkit-slider-runnable-track {` +
      `background: rgb(245,245,245);`+
    `}`+
      `input[type=range]:nth-of-type(4)::-webkit-slider-runnable-track {` +
      `background: rgba(221, 65, 26, .6);` + 
    `}`+ 
      `input[type=range]:nth-of-type(4)::-webkit-slider-thumb {` +
      `background: rgba(223, 136, 114);` + 
    `}`+
      `input[type=range]:nth-of-type(4):focus::-webkit-slider-runnable-track {` +
      `background: rgba(221, 65, 26, .6);`+
    `}`+
      `input[type=range]:nth-of-type(5)::-webkit-slider-runnable-track {` +
      `background: rgba(170,170,170);` + 
    `}`+ 
      `input[type=range]:nth-of-type(5)::-webkit-slider-thumb {` +
      `background: rgba(170,170,170);` + 
    `}`+
      `input[type=range]:nth-of-type(5):focus::-webkit-slider-runnable-track {` +
      `background: rgba(170,170,170);`+
    `}`+
      `input[type=range]:nth-of-type(6)::-webkit-slider-runnable-track {` +
      `background: rgba(245,245,245);` + 
    `}`+ 
      `input[type=range]:nth-of-type(6)::-webkit-slider-thumb {` +
      `background: rgba(245,245,245);` + 
    `}`+
      `input[type=range]:nth-of-type(6):focus::-webkit-slider-runnable-track {` +
      `background: rgba(245,245,245);`+
    `}`+
      `input[type=range]:nth-of-type(7)::-webkit-slider-runnable-track {` +
      `background: rgba(60, 94, 178, .6);` + 
    `}`+ 
      `input[type=range]:nth-of-type(7)::-webkit-slider-thumb {` +
      `background: rgba(123, 149, 195);` + 
    `}`+
      `input[type=range]:nth-of-type(7):focus::-webkit-slider-runnable-track {` +
      `background: rgba(60, 94, 178, .6);`+
    `}`+
      `input[type=range]:nth-of-type(1)::-moz-range-track {` +
      `background: rgb(170,170,170);` + 
    `}`+ 
      `input[type=range]:nth-of-type(1)::-moz-range-thumb {` +
      `background: rgb(170,170,170);` + 
    `}`+
      `input[type=range]:nth-of-type(2)::-moz-range-track {` +
      `background: rgb(170,170,170);` + 
    `}`+ 
      `input[type=range]:nth-of-type(2)::-moz-range-thumb {` +
      `background: rgb(170,170,170);` + 
    `}`+
      `input[type=range]:nth-of-type(3)::-moz-range-track {` +
      `background: rgb(245,245,245);` + 
    `}`+ 
      `input[type=range]:nth-of-type(3)::-moz-range-thumb {` +
      `background: rgb(245,245,245);` + 
    `}`+ 
      `input[type=range]:nth-of-type(4)::-moz-range-track {` +
      `background: rgba(221, 65, 26, .6);` + 
    `}`+ 
      `input[type=range]:nth-of-type(4)::-moz-range-thumb {` +
      `background: rgba(223, 136, 114);` + 
    `}`+
      `input[type=range]:nth-of-type(5)::-moz-range-track {` +
      `background: rgba(170,170,170);` + 
    `}`+ 
      `input[type=range]:nth-of-type(5)::-moz-range-thumb {` +
      `background: rgba(170,170,170);` + 
    `}`+
      `input[type=range]:nth-of-type(6)::-moz-range-track {` +
      `background: rgba(245,245,245);` + 
    `}`+ 
      `input[type=range]:nth-of-type(6)::-moz-range-thumb {` +
      `background: rgba(245,245,245);` + 
    `}`+
      `input[type=range]:nth-of-type(7)::-moz-range-track {` +
      `background: rgba(60, 94, 178, .6);` + 
    `}`+ 
      `input[type=range]:nth-of-type(7)::-moz-range-thumb {` +
      `background: rgba(123, 149, 195);` + 
    `}`
    ;

  // Get the first script tag
  var ref = document.querySelector('script');

  // Insert our new styles before the first script tag
  ref.parentNode.insertBefore(style, ref);
}

///////////////////////////////////////////////////////////////////// SET UP EVENT LISTENERS

function changeKit(kit, pizza) {
  let choice = kit.value();
  switch(choice){
    case('909 kick, clap, hat'):
      pizza.drumSamples = [1, 2, 3];
      break;
    case('808 pitched bongos'):
      pizza.drumSamples = [4, 5, 6];
      break;
    case('wood'):
      pizza.drumSamples = [7, 8, 9];
      break;
    case('concrete'):
      pizza.drumSamples = [10, 11, 12];
      break;
    case('midi out 1 (chrome only)'):
      pizza.drumSamples = [13, 14, 15];
      break;
    case('midi out 2 (chrome only)'):
      pizza.drumSamples = [16, 17, 18];
      break;
  }
}

///////////////////////////////////////////////////////////////////// INITIAL LOAD & PLAY AUDIO FUNCTION

function syncAndTeethTest(pizza, pizza2){
  pizza.numTeeth = pizza.toothSlider.value();
  testPizza.nextNoteTime = pizza2.nextNoteTime;
  pizza.teethTest();
  pizza.rotateSlider.elt.max = pizza.sliceSlider.value();
  lcm = lcm_two_numbers(pizza.numTeeth, pizza2.numTeeth);
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

///////////////////////////////////////////////////////////////////// RESET PIZZAS

paused = true;

function keyTyped() {
  if (key === ' ') {
    playPause();
  } else if (key === ' ' && paused === true) {
    playPause();
  }
}

export {setup};
