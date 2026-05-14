import { useEffect, useRef } from 'react';
import { setupSounds } from '../sound';
import { getAudioContext } from './globalContext';
import { SCHEDULE_AHEAD_TIME, AUDIO_START_OFFSET } from '../config';

export function useSequencer({ bpm, paused, pizza1Ref, pizza2Ref, pizza1StepsRef, pizza2StepsRef, onBPMSync }) {
  const bpmRef = useRef(bpm);
  const schedulerRef = useRef(null);
  const audioContextRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const resetPizzaSchedules = (type, ...pizzas) => {
    pizzas.forEach((pizza) => {
      if (!pizza) return;
      pizza.tmlnPlyHdArrX = [];
      pizza.tmlnPlyHdArrY = [];
      pizza.tmlnItrtr = 0;
      if (type === 'stop') {
        pizza.stepIteratorVar = 0;
      } else if (type === 'pause') {
        pizza.nextNoteTime = 0;
      }
    });
  };

  // Called by PizzaFace.teethTest() when tooth count changes.
  // Syncs the two pizza clocks and resets their schedules.
  const sketchUpdateBPM = () => {
    const p1 = pizza1Ref.current;
    const p2 = pizza2Ref.current;
    if (!p1 || !p2) return;
    if (p1.secondsPerStep < p2.secondsPerStep) {
      p1.nextNoteTime = p2.nextNoteTime;
    } else {
      p2.nextNoteTime = p1.nextNoteTime;
    }
    resetPizzaSchedules('stop', p1, p2);
    onBPMSync?.();
  };

  useEffect(() => {
    if (!paused) {
      audioContextRef.current = getAudioContext();
      setupSounds();
      startTimeRef.current = audioContextRef.current.currentTime + AUDIO_START_OFFSET;

      schedulerRef.current = setInterval(() => {
        const p1 = pizza1Ref.current;
        const p2 = pizza2Ref.current;
        if (!p1 || !p2) return;

        const currentTime = audioContextRef.current.currentTime - startTimeRef.current;

        while (p1.nextNoteTime < currentTime + SCHEDULE_AHEAD_TIME) {
          p1.incrementSoundLaunch(p1.nextNoteTime, pizza1StepsRef.current);
          p1.nextNote(bpmRef.current);
        }
        while (p2.nextNoteTime < currentTime + SCHEDULE_AHEAD_TIME) {
          p2.incrementSoundLaunch(p2.nextNoteTime, pizza2StepsRef.current);
          p2.nextNote(bpmRef.current);
        }
      }, 25);
    } else {
      clearInterval(schedulerRef.current);
      resetPizzaSchedules('pause', pizza1Ref.current, pizza2Ref.current);
    }

    return () => clearInterval(schedulerRef.current);
  }, [paused]);

  return { sketchUpdateBPM, resetPizzaSchedules };
}
