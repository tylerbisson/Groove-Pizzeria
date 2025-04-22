// import { showControlText } from './control_text';
import { lcm_two_numbers } from './utils/math';

export function draw(p, pizza, pizza2, bpm, trans, appWidth, appHeight, backgroundColor) {
  p.textFont('Lekton');
  p.background(backgroundColor);
  p.translate(trans, trans);

  const timeUnit = (60 / bpm) / 4;
  let lcm = lcm_two_numbers(pizza.numTeeth, pizza2.numTeeth);
  const ttlPatternTime = lcm * timeUnit;

  stepRatioSetup(pizza, pizza2, timeUnit);
  drawPizzaFunctions(pizza, pizza2);
  pizza.showTotalSteps(lcm, ttlPatternTime);
  drawTimeline(pizza, pizza2, trans, appHeight, lcm);
  // drawBPM(p, bpm, trans, appWidth, appHeight);
  // showControlText(p, pizza, pizza2);
}

function stepRatioSetup(pizza, pizza2, timeUnit) {
  [pizza, pizza2].forEach((pizza) => {
    pizza.loopTime = timeUnit * pizza.numTeeth;
    pizza.stepTime = pizza.loopTime / pizza.slices;
    pizza.stepFrac = (timeUnit * 16) / pizza.stepTime;
  });
}

function drawPizzaFunctions(pizza, pizza2) {
  pizza.syncSpoke(pizza.stepIteratorVar, pizza2.stepIteratorVar);
  pizza2.syncSpoke(pizza.stepIteratorVar, pizza2.stepIteratorVar);

  [pizza, pizza2].forEach((pizza) => {
    pizza.showFace(pizza.diameter);
    pizza.showSpokes(pizza.slices);
    pizza.showShapes();
    pizza.showTeeth(pizza.numTeeth);
    pizza.showPlayHead();
    pizza.timeLineCounter(pizza.tmlnItrtr);
  });
}

function drawTimeline(pizza, pizza2, trans, appHeight) {
  let _lcm = lcm_two_numbers(pizza.numTeeth, pizza2.numTeeth);
  pizza.showTimeline(-trans + appHeight * 0.017, _lcm);
  pizza2.showTimeline(-trans + appHeight * 0.063, _lcm);
}

// function drawBPM(p, bpm, trans, appWidth, appHeight) {
//   p.stroke(170);
//   p.textSize(Math.ceil(appWidth * 0.0269));
//   p.strokeWeight(0);
//   p.fill(170);
//   p.text(
//     `${bpm} bpm`,
//     trans - appWidth * 0.1,
//     appHeight * 0.075
//   );
// }
