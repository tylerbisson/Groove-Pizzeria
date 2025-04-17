import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import PizzaFace from '../pizzaFace';
import { draw } from '../draw';
import { setupSounds } from '../sound';
import { setBpmSlider } from '../utils/globalContext';


const P5Sketch = () => {
  const sketchRef = useRef();

  useEffect(() => {
    const sketch = (p) => {
      let testPizza, testPizza2;
      let bpmSlider;
      let trans;
      const backgroundColor = [211, 227, 223];

      const appWidth = p.windowWidth;
      const appHeight = p.windowHeight;

      // Define paused and schedulerCaller variables
      let paused = true;
      let schedulerCaller;

      // Define BPM variable
      let BPM = 120;

      // Define audioContext and startTime variables
      let audioContext;
      let startTime;

      // Define scheduleAheadTime variable
      const scheduleAheadTime = 0.1;

      const eventListenerSetUp = (...pizzas) => {
        pizzas.forEach((pizza) => {
          pizza.rotateSlider.input(() => rotateShapes(pizza));
        });
        pizzas[0].sliceSlider.mouseReleased(() => syncAndTeethTest(pizzas[0], pizzas[1]));
        pizzas[1].sliceSlider.mouseReleased(() => syncAndTeethTest(pizzas[1], pizzas[0]));
        pizzas[0].toothSlider.input(() => syncAndTeethTest(pizzas[0], pizzas[1]));
        pizzas[1].toothSlider.input(() => syncAndTeethTest(pizzas[1], pizzas[0]));
      };

      p.setup = () => {
        console.log('p5 setup function is running');
        trans = appWidth / 2;

        const canvas = p.createCanvas(appWidth, appHeight);
        canvas.parent(sketchRef.current);
        p.angleMode(p.DEGREES);
        p.background(backgroundColor);

        setupSounds(); // Initialize sounds

        bpmSlider = p.createSlider(20, 300, 120);
        setBpmSlider(bpmSlider);
        bpmSlider.position(appWidth * 0.889, appHeight * 0.215);
        bpmSlider.style('width', `${Math.ceil(appWidth * 0.0842)}px`);

        const canvasOffset = appWidth / 2;
        testPizza = new PizzaFace({
          name: 'testPizza',
          x: -0.233 * appWidth,
          y: -0.368 * appHeight,
          numSteps: 16,
          toothSliderValue: 16,
          color: [221, 65, 26],
          canvasOffset: canvasOffset,
          drumSamples: [1, 2, 3],
          appWidth: appWidth,
          appHeight: appHeight,
          p: p,
          sketchUpdateBPM: sketchUpdateBPM
        });
        testPizza2 = new PizzaFace({
          name: 'testPizza2',
          x: 0.259 * appWidth,
          y: -0.368 * appHeight,
          numSteps: 16,
          toothSliderValue: 16,
          color: [60, 94, 178],
          canvasOffset: canvasOffset,
          drumSamples: [4, 5, 6],
          appWidth: appWidth,
          appHeight: appHeight,
          p: p,
          sketchUpdateBPM: sketchUpdateBPM
        });

        eventListenerSetUp(testPizza, testPizza2);
      };

      p.draw = () => {
        draw(p, testPizza, testPizza2, bpmSlider, trans, appWidth, appHeight, backgroundColor);
      };

      p.mouseDragged = () => {
        if (testPizza && testPizza2) {
          testPizza.dragged(p.mouseX, p.mouseY);
          testPizza2.dragged(p.mouseX, p.mouseY);
        }
      };

      p.mousePressed = () => {
        if (testPizza && testPizza2) {
          testPizza.pressed(p.mouseX, p.mouseY);
          testPizza2.pressed(p.mouseX, p.mouseY);
        }
      };

      const syncAndTeethTest = (pizza, pizza2) => {
        pizza.numTeeth = pizza.toothSlider.value();
        testPizza.nextNoteTime = pizza2.nextNoteTime;
        pizza.teethTest();
        pizza.rotateSlider.elt.max = pizza.sliceSlider.value();
      };

      const rotateShapes = (pizza) => {
        let rotNum = pizza.rotateSlider.value();
        pizza.rotateShapes(rotNum);
      };

      const resetPizzaSchedules = (type, ...pizzas) => {
        pizzas.forEach((pizza) => {
          pizza.tmlnPlyHdArrX = [];
          pizza.tmlnPlyHdArrY = [];
          pizza.tmlnItrtr = 0;
          if (type === "stop") {
            pizza.stepIteratorVar = 0;
          } else if (type === "pause") {
            pizza.nextNoteTime = 0;
          }
        });
      };

      const playPause = () => {
        const playStopButton = document.getElementById("play-stop");
        playStopButton.classList.toggle("play");
        playStopButton.classList.toggle("stop");
        if (paused === false) {
          paused = true;
          clearInterval(schedulerCaller);
        } else {
          paused = false;
          BPM = bpmSlider.value();

          resetPizzaSchedules("pause", testPizza, testPizza2);

          audioContext = new AudioContext();
          setupSounds();
          startTime = audioContext.currentTime + 0.005;
          schedulerCaller = setInterval(scheduler, 25);
        }
      };

      const scheduler = () => {
        let currentTime = audioContext.currentTime;
        currentTime -= startTime;

        while (testPizza.nextNoteTime < currentTime + scheduleAheadTime) {
          testPizza.incrementSoundLaunch(testPizza.nextNoteTime);
          testPizza.nextNote();
        }

        while (testPizza2.nextNoteTime < currentTime + scheduleAheadTime) {
          testPizza2.incrementSoundLaunch(testPizza2.nextNoteTime);
          testPizza2.nextNote();
        }     
      };


      const sketchUpdateBPM = () => {
        if (testPizza.secondsPerStep < testPizza2.secondsPerStep) {
          testPizza.nextNoteTime = testPizza2.nextNoteTime;
        }
        else {
          testPizza2.nextNoteTime = testPizza.nextNoteTime;
        }

        BPM = bpmSlider.value();
        resetPizzaSchedules("stop", testPizza, testPizza2);
      }

      // Attach event listeners
      document.getElementById("play-stop").addEventListener("click", playPause);
      document.getElementById("clear").addEventListener("click", () => {
        testPizza.setUp();
        testPizza2.setUp();
      });
    };

    const p5Instance = new p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div ref={sketchRef}>
      <button id="play-stop" className="play">Play</button>
      <button id="clear">Clear</button>
    </div>
  );
};

export default P5Sketch;