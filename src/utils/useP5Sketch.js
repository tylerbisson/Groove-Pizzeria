import { useEffect, useRef } from 'react';
import p5 from 'p5';
import PizzaFace from '../pizzaFace';
import { draw } from '../draw';
import { setupSounds } from '../sound';
import { getAudioContext } from './globalContext';
import { 
  SCHEDULE_AHEAD_TIME, 
  AUDIO_START_OFFSET, 
  PIZZA_1_POSITION, 
  PIZZA_2_POSITION, 
  PIZZA_1_COLOR,
  PIZZA_2_COLOR,
  COLORS 
} from '../config';

const useP5Sketch = ({ bpm, paused, sketchRef, pizzaFaces }) => {
  const p5InstanceRef = useRef(null);
  const bpmRef = useRef(bpm);
  const schedulerCallerRef = useRef(null);
  const audioContextRef = useRef(null);
  const startTimeRef = useRef(null);
  const pizzaRef = useRef(null);
  const pizza2Ref = useRef(null);

  const resetPizzaSchedules = (type, ...pizzas) => {
    pizzas.forEach((pizza) => {
      if (!pizza) {
        console.warn("resetPizzaSchedules: Encountered a null or undefined pizza object.");
        return;
      }
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

  useEffect(() => {
    bpmRef.current = bpm; // Update the ref whenever bpm changes
    console.log("Updated bpmRef in useP5Sketch:", bpmRef.current);
  }, [bpm]);

  useEffect(() => {
    if (!sketchRef.current) {
      console.error("sketchRef is not attached to a DOM element.");
      return;
    }

    if (!p5InstanceRef.current) {
      const sketch = (p) => {
        const backgroundColor = COLORS.BACKGROUND;
        const appWidth = p.windowWidth;
        const appHeight = p.windowHeight;

        // const eventListenerSetUp = (...pizzas) => {
        //   pizzas.forEach((pizza) => {
        //     pizza.rotateSlider.input(() => rotateShapes(pizza));
        //   });
        //   pizzas[0].sliceSlider.mouseReleased(() => syncAndTeethTest(pizzas[0], pizzas[1]));
        //   pizzas[1].sliceSlider.mouseReleased(() => syncAndTeethTest(pizzas[1], pizzas[0]));
        //   pizzas[0].toothSlider.input(() => syncAndTeethTest(pizzas[0], pizzas[1]));
        //   pizzas[1].toothSlider.input(() => syncAndTeethTest(pizzas[1], pizzas[0]));
        // };

        p.setup = () => {
          console.log('p5 setup function is running');
          const canvas = p.createCanvas(appWidth, appHeight);
          canvas.parent(sketchRef.current);
          p.angleMode(p.DEGREES);
          p.background(backgroundColor);

          setupSounds(); // Initialize sounds

          const canvasOffset = appWidth / 2;
          pizzaRef.current = new PizzaFace({
            name: 'pizza',
            x: PIZZA_1_POSITION.x * appWidth,
            y: PIZZA_1_POSITION.y * appHeight,
            numSteps: 16,
            toothSliderValue: 16,
            color: PIZZA_1_COLOR,
            canvasOffset: canvasOffset,
            drumSamples: [1, 2, 3],
            appWidth: appWidth,
            appHeight: appHeight,
            p: p,
            sketchUpdateBPM: sketchUpdateBPM
          });
          pizza2Ref.current = new PizzaFace({
            name: 'pizza2',
            x: PIZZA_2_POSITION.x * appWidth,
            y: PIZZA_2_POSITION.y * appHeight,
            numSteps: 16,
            toothSliderValue: 16,
            color: PIZZA_2_COLOR,
            canvasOffset: canvasOffset,
            drumSamples: [4, 5, 6],
            appWidth: appWidth,
            appHeight: appHeight,
            p: p,
            sketchUpdateBPM: sketchUpdateBPM
          });
        };

        p.draw = () => {
          draw(p, pizzaRef.current, pizza2Ref.current, bpmRef.current, appWidth / 2, appWidth, appHeight, backgroundColor);
        };

        p.mouseDragged = () => {
          if (pizzaRef.current && pizza2Ref.current) {
            pizzaRef.current.dragged(p.mouseX, p.mouseY);
            pizza2Ref.current.dragged(p.mouseX, p.mouseY);
          }
        };

        p.mousePressed = () => {
          if (pizzaRef.current && pizza2Ref.current) {
            pizzaRef.current.pressed(p.mouseX, p.mouseY);
            pizza2Ref.current.pressed(p.mouseX, p.mouseY);
          }
        };

        // const syncAndTeethTest = (pizza, pizza2) => {
        //   pizza.numTeeth = pizza.toothSlider.value();
        //   pizzaRef.current.nextNoteTime = pizza2.nextNoteTime;
        //   pizza.teethTest(bpmRef.current);
        //   pizza.rotateSlider.elt.max = pizza.sliceSlider.value();
        // };

        // const rotateShapes = (pizza) => {
        //   let rotNum = pizza.rotateSlider.value();
        //   pizza.rotateShapes(rotNum);
        // };

        const sketchUpdateBPM = () => {
          if (pizzaRef.current.secondsPerStep < pizza2Ref.current.secondsPerStep) {
            pizzaRef.current.nextNoteTime = pizza2Ref.current.nextNoteTime;
          } else {
            pizza2Ref.current.nextNoteTime = pizzaRef.current.nextNoteTime;
          }

          resetPizzaSchedules("stop", pizzaRef.current, pizza2Ref.current);
        };
      };

      p5InstanceRef.current = new p5(sketch);
    }

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const scheduler = () => {
      let currentTime = audioContextRef.current.currentTime;
      currentTime -= startTimeRef.current;

      while (pizzaRef.current.nextNoteTime < currentTime + SCHEDULE_AHEAD_TIME) {
        pizzaRef.current.incrementSoundLaunch(pizzaRef.current.nextNoteTime);
        pizzaRef.current.nextNote(bpmRef.current);
      }

      while (pizza2Ref.current.nextNoteTime < currentTime + SCHEDULE_AHEAD_TIME) {
        pizza2Ref.current.incrementSoundLaunch(pizza2Ref.current.nextNoteTime);
        pizza2Ref.current.nextNote(bpmRef.current);
      }
    };

    if (!paused) {
      audioContextRef.current = getAudioContext();
      setupSounds();
      startTimeRef.current = audioContextRef.current.currentTime + AUDIO_START_OFFSET;
      schedulerCallerRef.current = setInterval(scheduler, 25);
    } else {
      clearInterval(schedulerCallerRef.current);
      resetPizzaSchedules("pause", pizzaRef.current, pizza2Ref.current);
    }

    return () => {
      clearInterval(schedulerCallerRef.current);
    };
  }, [paused]);

  useEffect(() => {
    if (pizzaRef.current) {
      pizzaRef.current.updateState(pizzaFaces.pizza1);
    }
    if (pizza2Ref.current) {
      pizza2Ref.current.updateState(pizzaFaces.pizza2);
    }
  }, [pizzaFaces]);

  return { sketchRef, pizzaRef, pizza2Ref };
};

export default useP5Sketch;