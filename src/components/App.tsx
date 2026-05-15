/**
 * App
 *
 * Root component — owns all application state and wires the audio sequencer
 * to the SVG canvas. Pizza state is stored in indexed arrays so that adding
 * a third sequencer requires no structural changes here: push a new entry
 * into PIZZA_POSITIONS and PIZZA_COLORS in config.ts.
 */
/* eslint-disable react-hooks/refs --
   Sequencer instances live in refs by design: they mutate on every
   scheduler tick (stepAngle, currentStep) and reading them during render
   is intentional, guarded by the pizzasReady flag. Storing them in state
   would cause a re-render on every audio tick. */
import { useRef, useState, useEffect, useMemo } from 'react';
import Sequencer from '../Sequencer';
import Timeline from './Timeline';
import PlayStopButton from './PlayStopButton';
import SpinBox from './SpinBox';
import PizzaPanel from './PizzaPanel';
import SettingsPanel from './panels/SettingsPanel';
import AboutPanel from './panels/AboutPanel';
import { setupSounds } from '../audio';
import { useSequencer } from '../hooks/useSequencer';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import { lcm as calcLcm } from '../utils/math';
import { computeDimensions, computePizzaGeometry } from '../utils/dimensions';
import { makeEmptySteps, rotateStepsRight } from '../utils/steps';
import { encodeState, decodeState } from '../utils/urlState';
import type { PizzaConfig, PizzaSteps, Dimensions, PizzaGeometry, LayoutMode } from '../types';
import {
  PIZZA_POSITIONS,
  PIZZA_POSITIONS_PORTRAIT,
  PIZZA_COLORS,
  DEFAULT_BPM,
  DEFAULT_NUM_SLICES,
  DEFAULT_NUM_TEETH,
  BPM_MIN,
  BPM_MAX,
  KIT_MAP,
  KIT_OPTIONS,
  TEXT_SIZES,
  STOP_BUTTON_SIZE_RATIO,
  COLOR_STRINGS,
} from '../config';

const NUM_PIZZAS = PIZZA_POSITIONS.length;

function parseHashState() {
  const hash = window.location.hash.slice(1);
  return hash ? decodeState(hash, NUM_PIZZAS) : null;
}

export default function App() {
  const [bpm, setBpm] = useState<number>(() => parseHashState()?.bpm ?? DEFAULT_BPM);
  const [paused, setPaused] = useState(true);
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const stored = localStorage.getItem('groove-pizzeria-high-contrast');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-contrast: more)').matches;
  });
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const stored = localStorage.getItem('groove-pizzeria-layout');
    if (stored === 'portrait' || stored === 'landscape') return stored;
    return 'auto';
  });
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [pizzasReady, setPizzasReady] = useState(false);
  const [soundsReady, setSoundsReady] = useState(false);

  // Per-pizza slider state — one entry per pizza, drives pizza.updateState() on change
  const [pizzaConfigs, setPizzaConfigs] = useState<PizzaConfig[]>(
    () =>
      parseHashState()?.configs ??
      PIZZA_POSITIONS.map(() => ({
        slices: DEFAULT_NUM_SLICES,
        teeth: DEFAULT_NUM_TEETH,
        rotation: 0,
      }))
  );

  // Per-pizza step state — source of truth for which beats are active
  const [pizzaSteps, setPizzaSteps] = useState<PizzaSteps[]>(
    () => parseHashState()?.pizzaSteps ?? PIZZA_POSITIONS.map(() => makeEmptySteps())
  );

  // Ref mirrors step state so the sequencer's setInterval always reads current values
  const pizzaStepsRef = useRef<PizzaSteps[]>(pizzaSteps);
  useEffect(() => {
    pizzaStepsRef.current = pizzaSteps;
  }, [pizzaSteps]);

  // Per-pizza kit selection
  const [kits, setKits] = useState<string[]>(
    () => parseHashState()?.kits ?? KIT_OPTIONS.slice(0, NUM_PIZZAS)
  );

  // Sequencer instances — one per pizza, held in a single ref array
  const pizzaRefs = useRef<(Sequencer | null)[]>(PIZZA_POSITIONS.map(() => null));
  const pizzasInitializedRef = useRef(false);
  const onTeethChangeRef = useRef<() => void>(() => {});
  const windowSizeRef = useRef({ w: window.innerWidth, h: window.innerHeight });

  // -- Sync pattern state to URL hash so it can be shared ----------------
  useEffect(() => {
    const hash = encodeState(bpm, pizzaConfigs, kits, pizzaSteps);
    history.replaceState(null, '', '#' + hash);
  }, [bpm, pizzaConfigs, kits, pizzaSteps]);

  // -- Preload audio samples on mount -------------------------------------
  useEffect(() => {
    setupSounds().then(() => setSoundsReady(true)).catch(() => setSoundsReady(true));
  }, []);

  // -- Apply high-contrast class and persist preference -------------------
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('groove-pizzeria-high-contrast', String(highContrast));
  }, [highContrast]);

  // -- Persist layout override -------------------------------------------
  useEffect(() => {
    localStorage.setItem('groove-pizzeria-layout', layoutMode);
  }, [layoutMode]);

  // -- Measure window on mount and resize ----------------------------------
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      windowSizeRef.current = { w, h };
      // Swap axes when the forced layout opposes the actual window orientation
      // so the rotated canvas gets the correct dimensions.
      const swap = (layoutMode === 'landscape' && w <= h) || (layoutMode === 'portrait' && w > h);
      setDimensions(swap ? computeDimensions(h, w) : computeDimensions(w, h));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [layoutMode]);

  // -- Spacebar toggles play/pause -----------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const tag = (e.target as Element).tagName;
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'A') return;
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // -- Initialise Sequencer instances once dimensions are known -------
  useEffect(() => {
    // Guard against re-running on resize: recreating Sequencer instances resets
    // their timing state, which restarts playback mid-loop on every resize event.
    if (!dimensions || pizzasInitializedRef.current) return;
    pizzasInitializedRef.current = true;
    const stableCallback = () => onTeethChangeRef.current();

    PIZZA_POSITIONS.forEach((_, i) => {
      const seq = new Sequencer({
        name: `pizza${i + 1}`,
        numSteps: pizzaConfigs[i].slices,
        color: PIZZA_COLORS[i],
        drumSamples: KIT_MAP[kits[i]],
        onTeethChange: stableCallback,
      });
      seq.updateState(pizzaConfigs[i]);
      pizzaRefs.current[i] = seq;
    });
    setPizzasReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-time init on dimensions; pizzaConfigs/kit changes after init are handled in separate effects
  }, [dimensions]);

  // -- Propagate config changes to pizza timing/geometry state -------------
  useEffect(() => {
    pizzaRefs.current.forEach((pizza, i) => pizza?.updateState(pizzaConfigs[i]));
  }, [pizzaConfigs]);

  // -- Propagate kit changes to pizza drumSamples -------------------------
  useEffect(() => {
    pizzaRefs.current.forEach((pizza, i) => {
      if (pizza) pizza.drumSamples = KIT_MAP[kits[i]];
    });
  }, [kits]);

  // -- Audio sequencer hook ------------------------------------------------
  const { onTeethChange } = useSequencer({ bpm, paused, pizzaRefs, pizzaStepsRef });
  useEffect(() => {
    onTeethChangeRef.current = onTeethChange;
  }, [onTeethChange]);

  // -- 60fps animation loop while playing ----------------------------------
  useAnimationLoop(!paused);

  // Derive effective portrait mode: layout override takes precedence over auto-detection.
  const effectivePortrait =
    dimensions == null
      ? false
      : layoutMode === 'auto'
        ? dimensions.portrait
        : layoutMode === 'portrait';

  const pizzaGeometry = useMemo(
    (): PizzaGeometry[] =>
      dimensions
        ? computePizzaGeometry(
            dimensions.refPx,
            dimensions.appHeight,
            effectivePortrait ? PIZZA_POSITIONS_PORTRAIT : PIZZA_POSITIONS,
            pizzaConfigs.map((c) => c.teeth),
            effectivePortrait
          )
        : [],
    [dimensions, pizzaConfigs, effectivePortrait]
  );

  // -------------------------------------------------------------------------
  if (!dimensions || !pizzasReady) return null;

  const { appWidth, appHeight } = dimensions;
  const portrait = effectivePortrait;

  // Rotation: forced layout that opposes the actual window orientation rotates -90deg.
  const { w: winW, h: winH } = windowSizeRef.current;
  const needsRotation =
    (layoutMode === 'landscape' && winW <= winH) ||
    (layoutMode === 'portrait' && winW > winH);
  const outerStyle: React.CSSProperties = needsRotation
    ? {
        position: 'fixed',
        width: '100vh',
        height: '100vw',
        top: 'calc((100vh - 100vw) / 2)',
        left: 'calc((100vw - 100vh) / 2)',
        transform: 'rotate(-90deg)',
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLOR_STRINGS.BACKGROUND,
      }
    : {
        background: COLOR_STRINGS.BACKGROUND,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
  const pizzas = pizzaRefs.current as Sequencer[];
  const lcm = pizzas.reduce((acc, p) => calcLcm(acc, p.numTeeth), 1);
  const timeUnit = 60 / bpm / 4;

  // Compute display-only derived values and update timeline playhead positions
  const pizzaProps = pizzas.map((pizza, i) => {
    const loopTime = timeUnit * pizza.numTeeth;
    const stepTime = loopTime / pizza.slices;
    const stepNoteValue = (timeUnit * 16) / stepTime;
    const rotation = pizzaConfigs[i].rotation;
    pizza.computeTimeline(lcm);
    return { loopTime, stepNoteValue, rotation };
  });
  const syncAll = pizzas.every((p) => p.currentStep === 0);

  const { refPx } = dimensions;
  const pbSize = Math.ceil(refPx * TEXT_SIZES.PLAY_BUTTON_SIZE);
  const pbLong = Math.ceil(refPx * TEXT_SIZES.PLAY_BUTTON_OFFSET);
  const stopSize = Math.ceil(refPx * STOP_BUTTON_SIZE_RATIO);
  const tinyPbSize = Math.ceil(pbSize * 0.6);
  const tinyPbLong = Math.ceil(pbLong * 0.6);
  const tinyStopSize = Math.ceil(stopSize * 0.6);
  const tinyWrapW = Math.max(tinyPbLong, tinyStopSize);
  const tinyWrapH = Math.max(tinyPbSize * 2, tinyStopSize);

  // -- Event handlers -------------------------------------------------------
  const handleClear = () => {
    setPizzaSteps(PIZZA_POSITIONS.map(() => makeEmptySteps()));
  };

  const handleReset = () => {
    setPizzaSteps(PIZZA_POSITIONS.map(() => makeEmptySteps()));
    setPizzaConfigs(PIZZA_POSITIONS.map(() => ({ slices: DEFAULT_NUM_SLICES, teeth: DEFAULT_NUM_TEETH, rotation: 0 })));
    setBpm(DEFAULT_BPM);
  };

  const handleKitChange = (i: number, kit: string) => {
    setKits((prev) => prev.map((k, j) => (j === i ? kit : k)));
  };

  const handleSlicesChange = (i: number, n: number) => {
    pizzaRefs.current[i]?.updateState({ slices: n });
    setPizzaConfigs((prev) => prev.map((c, j) => (j === i ? { ...c, slices: n } : c)));
  };
  const handleTeethChange = (i: number, n: number) => {
    pizzaRefs.current[i]?.updateState({ teeth: n });
    setPizzaConfigs((prev) => prev.map((c, j) => (j === i ? { ...c, teeth: n } : c)));
  };
  const handleRotationChange = (i: number, newRot: number) => {
    const delta = newRot - pizzaConfigs[i].rotation;
    setPizzaConfigs((prev) => prev.map((c, j) => (j === i ? { ...c, rotation: newRot } : c)));
    if (delta !== 0)
      setPizzaSteps((prev) =>
        prev.map((steps, j) => (j === i ? rotateStepsRight(steps, delta, pizzaConfigs[i].slices) : steps))
      );
  };

  const handleDotToggle = (pizzaIdx: number, ringIdx: number, stepIdx: number) => {
    setPizzaSteps((prev) =>
      prev.map((steps, j) => {
        if (j !== pizzaIdx) return steps;
        const next = steps.map((ring) => [...ring]) as PizzaSteps;
        next[ringIdx][stepIdx] = !next[ringIdx][stepIdx];
        return next;
      })
    );
  };

  // =========================================================================
  // Portrait layout — stacked PizzaPanels with flex column
  // =========================================================================
  if (portrait) {
    const portRefPx = dimensions.refPx;
    const portBpmFont = Math.ceil(portRefPx * TEXT_SIZES.CONTROL_TEXT);
    const portSmFont = Math.ceil(portRefPx * TEXT_SIZES.TIMELINE_TEXT);

    const loopLabel = (i: number) => {
      const [r, g, b] = pizzas[i].color;
      const loopRpts = Math.round(lcm / pizzas[i].numTeeth);
      const text =
        loopRpts === 1
          ? `1 loop (${pizzaProps[i].loopTime.toFixed(1)} s)`
          : `${loopRpts} loops (${pizzaProps[i].loopTime.toFixed(1)} s)`;
      return (
        <span style={{ fontSize: portSmFont, color: `rgba(${r},${g},${b},0.9)`, whiteSpace: 'nowrap' }}>
          {text}
        </span>
      );
    };

    return (
      <div style={outerStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: appWidth, height: appHeight, overflow: 'hidden' }}>

          {/* Pizza 0 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {loopLabel(0)}
            <PizzaPanel
              pizza={pizzas[0]}
              pizzaIdx={0}
              geometry={pizzaGeometry[0]}
              steps={pizzaSteps[0]}
              config={pizzaConfigs[0]}
              stepNoteValue={pizzaProps[0].stepNoteValue}
              timeUnit={timeUnit}
              otherStepNoteValue={pizzaProps[1].stepNoteValue}
              otherColor={PIZZA_COLORS[1]}
              syncWithOther={syncAll}
              refPx={portRefPx}
              onDotToggle={(ring, step) => handleDotToggle(0, ring, step)}
              onSlicesChange={(n) => handleSlicesChange(0, n)}
              onTeethChange={(n) => handleTeethChange(0, n)}
              onRotationChange={(n) => handleRotationChange(0, n)}
            />
          </div>

          {/* Middle strip: BPM + play/stop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <SpinBox
              value={bpm} min={BPM_MIN} max={BPM_MAX}
              step={1} shiftStep={10} pixelsPerStep={2}
              onChange={setBpm}
              fontSize={portBpmFont} color={COLOR_STRINGS.GREY}
              ariaLabel="BPM"
            />
            <span style={{ fontSize: portBpmFont, color: COLOR_STRINGS.GREY, userSelect: 'none' }}>bpm</span>
            <div style={{ position: 'relative', width: tinyWrapW, height: tinyWrapH, flexShrink: 0 }}>
              <PlayStopButton
                paused={paused} soundsReady={soundsReady}
                top={0} playLeft={0} stopLeft={0}
                pbSize={tinyPbSize} pbLong={tinyPbLong} stopSize={tinyStopSize}
                onPlay={() => setPaused(false)} onStop={() => setPaused(true)}
              />
            </div>
          </div>

          {/* Pizza 1 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <PizzaPanel
              pizza={pizzas[1]}
              pizzaIdx={1}
              geometry={pizzaGeometry[1]}
              steps={pizzaSteps[1]}
              config={pizzaConfigs[1]}
              stepNoteValue={pizzaProps[1].stepNoteValue}
              timeUnit={timeUnit}
              otherStepNoteValue={pizzaProps[0].stepNoteValue}
              otherColor={PIZZA_COLORS[0]}
              syncWithOther={syncAll}
              refPx={portRefPx}
              onDotToggle={(ring, step) => handleDotToggle(1, ring, step)}
              onSlicesChange={(n) => handleSlicesChange(1, n)}
              onTeethChange={(n) => handleTeethChange(1, n)}
              onRotationChange={(n) => handleRotationChange(1, n)}
            />
            {loopLabel(1)}
          </div>

          {/* Bottom bar: clear + settings + about */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 8, flexShrink: 0 }}>
            <button onClick={handleClear} style={{ fontSize: portSmFont, color: COLOR_STRINGS.GREY }}>clear</button>
            <SettingsPanel
              highContrast={highContrast}
              onHighContrastChange={setHighContrast}
              fontSize={portSmFont}
              kits={kits}
              onKitChange={handleKitChange}
              pizzaColors={PIZZA_COLORS}
              layoutMode={layoutMode}
              onLayoutModeChange={setLayoutMode}
              onReset={handleReset}
            />
            <AboutPanel />
          </div>

          <div role="status" aria-live="polite" className="sr-only">
            {paused ? 'Stopped' : 'Playing'}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Landscape layout — CSS flex, pizzas side-by-side with a center controls column
  // =========================================================================
  const controlFontSm = Math.ceil(refPx * TEXT_SIZES.CLEAR_BUTTON);
  const controlFontLg = Math.ceil(refPx * TEXT_SIZES.CONTROL_TEXT);

  return (
    <div style={outerStyle}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '8px 12px', boxSizing: 'border-box' }}>

        {/* Timeline strips — stacked, each spanning full width */}
        <div>
          {pizzas.map((pizza, i) => (
            <Timeline
              key={i}
              pizza={pizza}
              lcm={lcm}
              refPx={refPx}
              loopTime={pizzaProps[i].loopTime}
              showPatternInfo={i === 0}
            />
          ))}
        </div>

        {/* Main row: pizza | play/stop + icons | pizza */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around' }}>

          <PizzaPanel
            pizza={pizzas[0]}
            pizzaIdx={0}
            geometry={pizzaGeometry[0]}
            steps={pizzaSteps[0]}
            config={pizzaConfigs[0]}
            stepNoteValue={pizzaProps[0].stepNoteValue}
            timeUnit={timeUnit}
            otherStepNoteValue={pizzaProps[1].stepNoteValue}
            otherColor={PIZZA_COLORS[1]}
            syncWithOther={syncAll}
            refPx={refPx}
            onDotToggle={(ring, step) => handleDotToggle(0, ring, step)}
            onSlicesChange={(n) => handleSlicesChange(0, n)}
            onTeethChange={(n) => handleTeethChange(0, n)}
            onRotationChange={(n) => handleRotationChange(0, n)}
          />

          {/* Center column — settings, about; vertically centred */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'center', gap: 12 }}>
            <SettingsPanel
              highContrast={highContrast}
              onHighContrastChange={setHighContrast}
              fontSize={controlFontSm}
              kits={kits}
              onKitChange={handleKitChange}
              pizzaColors={PIZZA_COLORS}
              layoutMode={layoutMode}
              onLayoutModeChange={setLayoutMode}
              onReset={handleReset}
            />
            <AboutPanel />
            <div role="status" aria-live="polite" className="sr-only">
              {paused ? 'Stopped' : 'Playing'}
            </div>
          </div>

          <PizzaPanel
            pizza={pizzas[1]}
            pizzaIdx={1}
            geometry={pizzaGeometry[1]}
            steps={pizzaSteps[1]}
            config={pizzaConfigs[1]}
            stepNoteValue={pizzaProps[1].stepNoteValue}
            timeUnit={timeUnit}
            otherStepNoteValue={pizzaProps[0].stepNoteValue}
            otherColor={PIZZA_COLORS[0]}
            syncWithOther={syncAll}
            refPx={refPx}
            onDotToggle={(ring, step) => handleDotToggle(1, ring, step)}
            onSlicesChange={(n) => handleSlicesChange(1, n)}
            onTeethChange={(n) => handleTeethChange(1, n)}
            onRotationChange={(n) => handleRotationChange(1, n)}
          />

        </div>

        {/* BPM readout, slider, clear, and play/stop — top right, absolutely positioned */}
        <div style={{
          position: 'absolute',
          top: 8,
          right: 12,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 16,
        }}>
          {/* BPM column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <SpinBox
                value={bpm}
                min={BPM_MIN}
                max={BPM_MAX}
                step={1}
                shiftStep={10}
                pixelsPerStep={2}
                onChange={setBpm}
                fontSize={controlFontLg}
                color={COLOR_STRINGS.GREY}
                ariaLabel="BPM"
              />
              <span style={{ fontSize: controlFontLg, color: COLOR_STRINGS.GREY, userSelect: 'none' }}>bpm</span>
            </div>
            <button
              onClick={handleClear}
              style={{ fontSize: controlFontSm, color: COLOR_STRINGS.GREY }}
            >
              clear
            </button>
          </div>
          {/* Play/stop — sized wrapper so the CSS-triangle button participates in flex layout */}
          <div style={{ position: 'relative', width: tinyWrapW, height: tinyWrapH, flexShrink: 0, alignSelf: 'center' }}>
            <PlayStopButton
              paused={paused}
              soundsReady={soundsReady}
              top={0}
              playLeft={0}
              stopLeft={0}
              pbSize={tinyPbSize}
              pbLong={tinyPbLong}
              stopSize={tinyStopSize}
              onPlay={() => setPaused(false)}
              onStop={() => setPaused(true)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
