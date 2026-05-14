/**
 * useSequencer
 *
 * Drives the Web Audio scheduling loop. While unpaused, a setInterval fires
 * every SCHEDULER_INTERVAL_MS and looks ahead SCHEDULE_AHEAD_TIME seconds,
 * calling incrementSoundLaunch for any steps that fall within the window.
 *
 * Accepts arrays of pizza refs so it scales to any number of pizzas.
 *
 * Returns { onTeethChange } — call when any pizza's tooth count changes to
 * re-sync all pizza clocks to the same reference time.
 */
import { useEffect, useRef } from 'react';
import { setupSounds } from '../audio';
import { getAudioContext } from '../utils/audioContext';
import { SCHEDULE_AHEAD_TIME, AUDIO_START_OFFSET, SCHEDULER_INTERVAL_MS } from '../config';

export function useSequencer({ bpm, paused, pizzaRefs, pizzaStepsRef, onBPMSync }) {
  const bpmRef       = useRef(bpm);
  const schedulerRef = useRef(null);
  const audioContextRef = useRef(null);
  const startTimeRef    = useRef(null);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  const resetSchedules = (type, pizzas) => {
    pizzas.forEach((pizza) => {
      if (!pizza) return;
      pizza.timelinePlayheadX = [];
      pizza.timelineIndex     = 0;
      if (type === 'stop') {
        pizza.currentStep = 0;
      } else if (type === 'pause') {
        pizza.nextNoteTime = 0;
      }
    });
  };

  // Called by PizzaSequencer.onTeethCountChange() when any tooth count changes.
  // Syncs all pizza clocks to the slowest pizza (largest secondsPerStep) and resets.
  const onTeethChange = () => {
    const pizzas = pizzaRefs.current.filter(Boolean);
    if (pizzas.length < 2) return;
    const reference = pizzas.reduce((a, b) => a.secondsPerStep > b.secondsPerStep ? a : b);
    pizzas.forEach(p => { p.nextNoteTime = reference.nextNoteTime; });
    resetSchedules('stop', pizzas);
    onBPMSync?.();
  };

  useEffect(() => {
    if (!paused) {
      audioContextRef.current = getAudioContext();
      setupSounds();
      startTimeRef.current = audioContextRef.current.currentTime + AUDIO_START_OFFSET;

      schedulerRef.current = setInterval(() => {
        const pizzas = pizzaRefs.current.filter(Boolean);
        if (pizzas.length === 0) return;

        const currentTime = audioContextRef.current.currentTime - startTimeRef.current;

        pizzas.forEach((pizza, i) => {
          while (pizza.nextNoteTime < currentTime + SCHEDULE_AHEAD_TIME) {
            pizza.incrementSoundLaunch(pizza.nextNoteTime, pizzaStepsRef.current[i]);
            pizza.nextNote(bpmRef.current);
          }
        });
      }, SCHEDULER_INTERVAL_MS);
    } else {
      clearInterval(schedulerRef.current);
      resetSchedules('pause', pizzaRefs.current.filter(Boolean));
    }

    return () => clearInterval(schedulerRef.current);
  }, [paused]);

  return { onTeethChange };
}
