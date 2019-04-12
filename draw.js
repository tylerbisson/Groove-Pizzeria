function draw() {

    background(230, 237, 233);
    //TEST
    //   background(230, 260, 250);
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

    stroke(170);
    textSize(32);
    fill(bpmFontFill);
    strokeWeight(10);
    text(bpmSlider.value() + " bpm", bpmSliderXpos - trans, bpmSliderYpos - (trans - 55));

    showControlText(testPizza);
    showControlText(testPizza2);

    fill(170)
    text("= " + stepRatio.toFixed(3) + " x",
        testPizza.rotateSliderXPos - trans - (appWidth * 0.156), testPizza.rotateSliderYPos - trans);

    text("= " + stepRatio2.toFixed(3) + " x",
        testPizza2.rotateSliderXPos - trans - (appWidth * 0.156), testPizza2.rotateSliderYPos - trans);

    fill(testPizza.color[0], testPizza.color[1], testPizza.color[2], 170);
        text("step ", testPizza2.rotateSliderXPos - trans - (appWidth * 0.098), testPizza2.rotateSliderYPos - trans);

    fill(testPizza2.color[0], testPizza2.color[1], testPizza2.color[2], 170);
    text("step ",
        testPizza.rotateSliderXPos - trans - (appWidth * 0.098), testPizza.rotateSliderYPos - trans);
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
