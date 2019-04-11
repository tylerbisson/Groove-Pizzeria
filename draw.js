function draw() {

  background(230, 237, 233);
  //TEST
  background(230, 260, 250);
  //TEST
  translate(trans, trans);

  timeUnit = ((60/bpmSlider.value())/4);

  testPizza.loopTime = timeUnit * testPizza.toothSlider.value();
  testPizza.stepTime = testPizza.loopTime / testPizza.sliceSlider.value();
  testPizza.stepFrac = (timeUnit * 16) / testPizza.stepTime;

  testPizza2.loopTime = timeUnit * testPizza2.toothSlider.value();
  testPizza2.stepTime = testPizza2.loopTime / testPizza2.sliceSlider.value();
  testPizza2.stepFrac = (timeUnit * 16) / testPizza2.stepTime;

  stepRatio = testPizza2.stepFrac.toFixed(3) / testPizza.stepFrac.toFixed(3);
  stepRatio2 = testPizza.stepFrac.toFixed(3) / testPizza2.stepFrac.toFixed(3);

  ttlPatternTime = lcm * timeUnit;

  testPizza.syncSpoke(testPizza.stepIteratorVar, testPizza2.stepIteratorVar);
  testPizza2.syncSpoke(testPizza.stepIteratorVar, testPizza2.stepIteratorVar);

  testPizza.showFace(testPizza.testDiam);
  testPizza.showSpokes(testPizza.sliceSlider.value());
  testPizza.showShapes();
  testPizza.showTeeth(testPizza.toothSlider.value());
  testPizza.showPlayHead();

  testPizza2.showFace(testPizza2.testDiam);
  testPizza2.showSpokes(testPizza2.sliceSlider.value());
  testPizza2.showShapes();
  testPizza2.showTeeth(testPizza2.toothSlider.value());
  testPizza2.showPlayHead();

  testPizza.showTimeline(-trans + 12, lcm);
  testPizza2.showTimeline(-trans + 42, lcm);
  testPizza.showTotalSteps(lcm, ttlPatternTime);

  testPizza.timeLineCounter(testPizza.tmlnItrtr);
  testPizza2.timeLineCounter(testPizza2.tmlnItrtr);

  stroke(200);
  textSize(32);
  fill(bpmFontFill);
  strokeWeight(10);
  text(bpmSlider.value() + " bpm", bpmSliderXpos - trans, bpmSliderYpos - (trans - 55));

  let setSliders = setPizza("testPizza", 0);
    let control_text = setSliders("slidersXPos", "sliceSliderYPos");
        eval(control_text[0]);
        eval(control_text[1]);
        let eval_text = control_text[2](testPizza.sliceSlider.value(), 32, 40, 6);
            eval(eval_text[0]);
            eval(eval_text[1]);
        eval_text = control_text[2]("steps (1/" + testPizza.stepFrac.toFixed(3) + " note)", 16, 0, 8);
            eval(eval_text[0]);
            eval(eval_text[1]);
    control_text = setSliders("slidersXPos", "toothSliderYPos");
        eval_text = control_text[2](testPizza.toothSlider.value(), 32, 40, 6);
            eval(eval_text[0]);
            eval(eval_text[1]);
        eval_text = control_text[2]("÷", 19, 36, -9);
            eval(eval_text[0]);
            eval(eval_text[1]);
        eval_text = control_text[2]("time units (" + timeUnit.toFixed(3) + " s)", 16, 0, 8);
            eval(eval_text[0]);
            eval(eval_text[1]);
    control_text = setSliders("rotateSliderXPos", "rotateSliderYPos");
        eval_text = control_text[2](testPizza.rotateSlider.value(), 32, 40, 6);
            eval(eval_text[0]);
            eval(eval_text[1]);
        eval_text = control_text[2]("step rotations", 16, 0, 8);
            eval(eval_text[0]);
            eval(eval_text[1]);
        eval_text = control_text[2]("step ", 16, 235, 0);
            eval(eval_text[0]);
            eval(eval_text[1]);

  setSliders = setPizza("testPizza2", 0);
    control_text = setSliders("slidersXPos", "sliceSliderYPos");
        eval(control_text[0]);
        eval(control_text[1]);
        eval_text = control_text[2](testPizza2.sliceSlider.value(), 32, 40, 6);
            eval(eval_text[0]);
            eval(eval_text[1]);
        eval_text = control_text[2]("steps (1/" + testPizza2.stepFrac.toFixed(3) + " note)", 16, 0, 8);
            eval(eval_text[0]);
            eval(eval_text[1]);
    control_text = setSliders("slidersXPos", "toothSliderYPos");
        eval_text = control_text[2](testPizza2.toothSlider.value(), 32, 40, 6);
            eval(eval_text[0]);
            eval(eval_text[1]);
        eval_text = control_text[2]("÷", 19, 36, -9);
            eval(eval_text[0]);
            eval(eval_text[1]);
        eval_text = control_text[2]("time units (" + timeUnit.toFixed(3) + " s)", 16, 0, 8);
            eval(eval_text[0]);
            eval(eval_text[1]);
    control_text = setSliders("rotateSliderXPos", "rotateSliderYPos");
        eval_text = control_text[2](testPizza2.rotateSlider.value(), 32, 40, 6);
            eval(eval_text[0]);
            eval(eval_text[1]);
        eval_text = control_text[2]("step rotations", 16, 0, 8);
            eval(eval_text[0]);
            eval(eval_text[1]);
        eval_text = control_text[2]("step ", 16, 235, 0);
            eval(eval_text[0]);
            eval(eval_text[1]);

  fill(200);
  text("= " + stepRatio.toFixed(3) + " x",
  testPizza.rotateSliderXPos - trans - 200, testPizza.rotateSliderYPos - trans);

  text("= " + stepRatio2.toFixed(3) + " x",
  testPizza2.rotateSliderXPos - trans - 200, testPizza2.rotateSliderYPos - trans);

  fill(testPizza.color[0], testPizza.color[1], testPizza.color[2], 90);
  text("step ", testPizza2.rotateSliderXPos - trans - 130, testPizza2.rotateSliderYPos - trans);

  fill(testPizza2.color[0], testPizza2.color[1], testPizza2.color[2], 90);
  text("step ",
  testPizza.rotateSliderXPos - trans - 130, testPizza.rotateSliderYPos - trans);
}

// ///////////////////////////////////////////////////////////////////// DRAW FUNCTION

// function draw() {
//   // appWidth = windowHeight * (13 / 7);
//   // appHeight = windowWidth * (7 / 13);
//   // console.log("windowWidth")
//   // console.log(windowWidth)
//   // console.log("windowHeight")
//   // console.log(windowHeight)
//   // console.log("appWidth")
//   // console.log(appWidth)
//   // translate(600, 600); //RWRD


//   background(230, 237, 233);

//   //TEST BACKGROUND
//   // background(240, 207, 300);
//   //TEST BACKGROUND

//   translate((0.48 * appWidth), (0.48 * appWidth));

//   timeUnit = ((60 / bpmSlider.value()) / 4);
//   testPizza.loopTime = timeUnit * testPizza.toothSlider.value();
//   testPizza.stepTime = testPizza.loopTime / testPizza.sliceSlider.value();
//   testPizza.stepFrac = (timeUnit * 16) / testPizza.stepTime;

//   testPizza2.loopTime = timeUnit * testPizza2.toothSlider.value();
//   testPizza2.stepTime = testPizza2.loopTime / testPizza2.sliceSlider.value();
//   testPizza2.stepFrac = (timeUnit * 16) / testPizza2.stepTime;

//   stepRatio = testPizza2.stepFrac.toFixed(3) / testPizza.stepFrac.toFixed(3);
//   stepRatio2 = testPizza.stepFrac.toFixed(3) / testPizza2.stepFrac.toFixed(3);


//   ttlPatternTime = lcm * timeUnit;

//   testPizza.syncSpoke(testPizza.stepIteratorVar, testPizza2.stepIteratorVar);
//   testPizza2.syncSpoke(testPizza.stepIteratorVar, testPizza2.stepIteratorVar);

//   testPizza.showFace(testPizza.testDiam);
//   testPizza.showSpokes(testPizza.sliceSlider.value());
//   testPizza.showShapes();
//   testPizza.showTeeth(testPizza.toothSlider.value());
//   testPizza.showPlayHead();

//   testPizza2.showFace(testPizza2.testDiam);
//   testPizza2.showSpokes(testPizza2.sliceSlider.value());
//   testPizza2.showShapes();
//   testPizza2.showTeeth(testPizza2.toothSlider.value());
//   testPizza2.showPlayHead();

//   testPizza.showTimeline((-0.84 * appHeight), lcm);
//   testPizza2.showTimeline((-0.79 * appHeight), lcm);
//   // testPizza.showTimeline(-588, lcm); //RWRD
//   // testPizza2.showTimeline(-558, lcm); //RWRD
//   testPizza.showTotalSteps(lcm, ttlPatternTime);

//   testPizza.timeLineCounter(testPizza.tmlnItrtr);
//   testPizza2.timeLineCounter(testPizza2.tmlnItrtr);

//   stroke(200);
//   textSize(32);
//   fill(bpmFontFill);
//   strokeWeight(10);
//   text(bpmSlider.value() + " bpm", bpmSliderXpos - (appWidth * 0.469), bpmSliderYpos - (appHeight * 0.789)); //RWRD

//   strokeWeight(0);
//   fill(testPizza.color[0], testPizza.color[1], testPizza.color[2], 90);
//   // x pos of slider - 600 + width + 10; y pos of slider + 11
//   text(testPizza.sliceSlider.value(),
//     testPizza.slidersXPos - (appWidth * 0.5), testPizza.sliceSliderYPos - (appHeight * 0.845)); //RWRD
//   textSize(16);
//   text("steps (1/" + testPizza.stepFrac.toFixed(3) + " note)",
//     testPizza.slidersXPos - (appWidth * 0.469), testPizza.sliceSliderYPos - (appHeight * 0.842)); //RWRD
//   textSize(32);
//   text(testPizza.toothSlider.value(),
//     testPizza.slidersXPos - (appWidth * 0.5), testPizza.toothSliderYPos - (appHeight * 0.845)); //RWRD
//   textSize(19);
//   text("÷",
//     testPizza.slidersXPos - (appWidth * 0.496), testPizza.toothSliderYPos - (appHeight * 0.841)); //RWRD
//   textSize(16);
//   text("time units (" + timeUnit.toFixed(3) + " s)",
//     testPizza.slidersXPos - (appWidth * 0.469), testPizza.toothSliderYPos - (appHeight * 0.842)); //RWRD

//   strokeWeight(0);
//   textSize(32);
//   text(testPizza.rotateSlider.value(),
//     testPizza.rotateSliderXPos - (appWidth * 0.5), testPizza.rotateSliderYPos - (appHeight * 0.845)); //RWRD
//   textSize(16);
//   text("step rotations",
//     testPizza.rotateSliderXPos - (appWidth * 0.469), testPizza.rotateSliderYPos - (appHeight * 0.842)); //RWRD

//   textSize(16);
//   strokeWeight(0);
//   text("step ",
//     testPizza.rotateSliderXPos - (appWidth * 0.652), testPizza.rotateSliderYPos - (appHeight * 0.853)); //RWRD

//   fill(200);
//   text("= " + stepRatio.toFixed(3) + " x",
//     testPizza.rotateSliderXPos - (appWidth * 0.625), testPizza.rotateSliderYPos - (appHeight * 0.853)); //RWRD

//   fill(testPizza2.color[0], testPizza2.color[1], testPizza2.color[2], 90);
//   text("step ",
//     testPizza.rotateSliderXPos - (appWidth * 0.57), testPizza.rotateSliderYPos - (appHeight * 0.853)); //RWRD


//   textSize(32);
//   fill(testPizza2.color[0], testPizza2.color[1], testPizza2.color[2], 90);
//   // x pos of slider - 600 + width + 10; y pos of slider + 11
//   text(testPizza2.sliceSlider.value(),
//     testPizza2.slidersXPos - (appWidth * 0.5), testPizza2.sliceSliderYPos - (appHeight * 0.845)); //RWRD
//   textSize(16);
//   text("steps (1/" + testPizza2.stepFrac.toFixed(3) + " note)",
//     testPizza2.slidersXPos - (appWidth * 0.469), testPizza2.sliceSliderYPos - (appHeight * 0.842)); //RWRD
//   textSize(32);
//   text(testPizza2.toothSlider.value(),
//     testPizza2.slidersXPos - (appWidth * 0.5), testPizza2.toothSliderYPos - (appHeight * 0.845)); //RWRD
//   textSize(19);
//   text("÷",
//     testPizza2.slidersXPos - (appWidth * 0.496), testPizza2.toothSliderYPos - (appHeight * 0.841)); //RWRD
//   textSize(16);
//   text("time units (" + timeUnit.toFixed(3) + " s)",
//     testPizza2.slidersXPos - (appWidth * 0.469), testPizza2.toothSliderYPos - (appHeight * 0.842)); //RWRD

//   textSize(32);
//   text(testPizza2.rotateSlider.value(),
//     testPizza2.rotateSliderXPos - (appWidth * 0.5), testPizza2.rotateSliderYPos - (appHeight * 0.845)); //RWRD
//   textSize(16);
//   text("step rotations",
//     testPizza2.rotateSliderXPos - (appWidth * 0.469), testPizza2.rotateSliderYPos - (appHeight * 0.842)); //RWRD

//   textSize(16);
//   strokeWeight(0);
//   text("step ",
//     testPizza2.rotateSliderXPos - (appWidth * 0.652), testPizza2.rotateSliderYPos - (appHeight * 0.853)); //RWRD

//   fill(200);
//   text("= " + stepRatio2.toFixed(3) + " x",
//     testPizza2.rotateSliderXPos - (appWidth * 0.625), testPizza2.rotateSliderYPos - (appHeight * 0.853)); //RWRD

//   fill(testPizza.color[0], testPizza.color[1], testPizza.color[2], 90);
//   text("step ",
//     testPizza2.rotateSliderXPos - (appWidth * 0.57), testPizza2.rotateSliderYPos - (appHeight * 0.853)); //RWRD

// }