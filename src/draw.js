import { showControlText } from './control_text';
import { lcm_two_numbers } from './utils/math';

export function draw(p, testPizza, testPizza2, bpmSlider, trans, appWidth, appHeight, backgroundColor) {
  p.textFont('Lekton');
  p.background(backgroundColor);
  p.translate(trans, trans);

  const timeUnit = (60 / bpmSlider.value()) / 4;
  let lcm = lcm_two_numbers(testPizza.numTeeth, testPizza2.numTeeth);
  const ttlPatternTime = lcm * timeUnit;

  stepRatioSetup(testPizza, testPizza2, timeUnit);
  drawPizzaFunctions(p, testPizza, testPizza2);
  testPizza.showTotalSteps(lcm, ttlPatternTime);
  drawTimeline(testPizza, testPizza2, trans, appHeight, lcm);
  drawBPM(p, testPizza, testPizza2, bpmSlider, trans, appWidth, appHeight);
  
  showControlText(p, testPizza, testPizza2);
}

function stepRatioSetup(testPizza, testPizza2, timeUnit) {
  [testPizza, testPizza2].forEach((pizza) => {
    pizza.loopTime = timeUnit * pizza.toothSlider.value();
    pizza.stepTime = pizza.loopTime / pizza.sliceSlider.value();
    pizza.stepFrac = (timeUnit * 16) / pizza.stepTime;
  });
}

function drawPizzaFunctions(p, testPizza, testPizza2) {
  testPizza.syncSpoke(testPizza.stepIteratorVar, testPizza2.stepIteratorVar);
  testPizza2.syncSpoke(testPizza.stepIteratorVar, testPizza2.stepIteratorVar);

  [testPizza, testPizza2].forEach((pizza) => {
    pizza.showFace(pizza.diameter);
    pizza.showSpokes(pizza.sliceSlider.value());
    pizza.showShapes();
    pizza.showTeeth(pizza.toothSlider.value());
    pizza.showPlayHead();
    pizza.timeLineCounter(pizza.tmlnItrtr);
  });
}

function drawTimeline(testPizza, testPizza2, trans, appHeight) {
  let _lcm = lcm_two_numbers(testPizza.numTeeth, testPizza2.numTeeth);
  testPizza.showTimeline(-trans + appHeight * 0.017, _lcm);
  testPizza2.showTimeline(-trans + appHeight * 0.063, _lcm);
}

function drawBPM(p, testPizza, testPizza2, bpmSlider, trans, appWidth, appHeight) {
  p.stroke(170);
  p.textSize(Math.ceil(appWidth * 0.0269));
  p.strokeWeight(0);
  p.fill(testPizza.grey || 170); // Fallback for grey
  p.text(
    `${bpmSlider.value()} bpm`,
    bpmSlider.x - trans,
    bpmSlider.y - (trans - appHeight * 0.075)
  );
}
