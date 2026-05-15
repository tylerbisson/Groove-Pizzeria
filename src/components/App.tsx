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
import { useRef, useState, useEffect, useMemo, Fragment } from 'react';
import Sequencer from '../Sequencer';
import Pizza from './Pizza';
import Timeline from './Timeline';
import PlayStopButton from './PlayStopButton';
import PizzaPanel from './PizzaPanel';
import SettingsPanel from './panels/SettingsPanel';
import AboutPanel from './panels/AboutPanel';
import { setupSounds } from '../audio';
import { useSequencer } from '../hooks/useSequencer';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import { lcm as calcLcm } from '../utils/math';
import { computeDimensions, computePizzaGeometry } from '../utils/dimensions';
import { hitTestBeats } from '../utils/hitTest';
import { makeEmptySteps, rotateStepsRight } from '../utils/steps';
import { encodeState, decodeState } from '../utils/urlState';
import type { PizzaConfig, PizzaSteps, Dimensions, PizzaGeometry, LayoutMode } from '../types';
import {
  PIZZA_POSITIONS,
  PIZZA_POSITIONS_PORTRAIT,
  PIZZA_COLORS,
  TIMELINE_POSITIONS,
  DEFAULT_BPM,
  DEFAULT_NUM_SLICES,
  DEFAULT_NUM_TEETH,
  BPM_MIN,
  BPM_MAX,
  SLICES_MIN,
  SLICES_MAX,
  TEETH_MAX,
  ROTATION_MAX,
  KIT_MAP,
  KIT_OPTIONS,
  TEXT_SIZES,
  SLIDER_WIDTH_RATIO,
  BPM_SLIDER_X_RATIO,
  BPM_SLIDER_Y_RATIO,
  BPM_TEXT_Y_RATIO,
  STOP_BUTTON_SIZE_RATIO,
  COLOR_STRINGS,
  PORTRAIT_LAYOUT,
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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef(false);
  const draggedDotsRef = useRef(new Set<string>());
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
            dimensions.appWidth,
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
  const transX = appWidth / 2;
  const transY = portrait ? appHeight / 2 : appWidth / 2;

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
    const yPos = -transY + appHeight * TIMELINE_POSITIONS.PIZZA_Y_RATIOS[i];
    pizza.computeTimeline(lcm, appWidth);
    return { loopTime, stepNoteValue, rotation, yPos };
  });
  const syncAll = pizzas.every((p) => p.currentStep === 0);

  const { scale, offsetX: offX, offsetY: offY } = dimensions;
  const pbSize = Math.ceil(appWidth * TEXT_SIZES.PLAY_BUTTON_SIZE * scale);
  const pbLong = Math.ceil(appWidth * TEXT_SIZES.PLAY_BUTTON_OFFSET * scale);
  const stopSize = Math.ceil(appWidth * STOP_BUTTON_SIZE_RATIO * scale);

  // -- Event handlers -------------------------------------------------------
  const handleClear = () => {
    setPizzaSteps(PIZZA_POSITIONS.map(() => makeEmptySteps()));
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

  const getSVGCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: svgPt.x - transX, y: svgPt.y - transY };
  };

  const tryToggleDot = (gX: number, gY: number) => {
    pizzas.forEach((pizza, pizzaIdx) => {
      const geom = pizzaGeometry[pizzaIdx];
      const hit = hitTestBeats(
        pizza.stepAngles, geom.pizzaDiam, geom.diameter,
        gX - geom.position.x, gY - geom.position.y
      );
      if (hit === null) return;
      const { ringIdx, stepIdx } = hit;
      const key = `${pizzaIdx}-${ringIdx}-${stepIdx}`;
      if (!draggedDotsRef.current.has(key)) {
        draggedDotsRef.current.add(key);
        setPizzaSteps((prev) =>
          prev.map((steps, j) => {
            if (j !== pizzaIdx) return steps;
            const next = steps.map((ring) => [...ring]) as PizzaSteps;
            next[ringIdx][stepIdx] = !next[ringIdx][stepIdx];
            return next;
          })
        );
      }
    });
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDraggingRef.current = true;
    draggedDotsRef.current = new Set();
    svgRef.current?.setPointerCapture(e.pointerId);
    const coords = getSVGCoords(e.clientX, e.clientY);
    if (coords) tryToggleDot(coords.x, coords.y);
  };
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return;
    const coords = getSVGCoords(e.clientX, e.clientY);
    if (coords) tryToggleDot(coords.x, coords.y);
  };
  const handlePointerUp = () => {
    isDraggingRef.current = false;
    draggedDotsRef.current = new Set();
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
  // Portrait layout — stacked pizzas, horizontal slider rows, HTML controls
  // =========================================================================
  if (portrait) {
    const PL = PORTRAIT_LAYOUT;

    // Compute portrait slider positions from pizza geometry
    const sliderW = Math.ceil(appWidth * PL.SLIDER_WIDTH_RATIO);
    const gap = Math.floor((appWidth - 3 * sliderW - 2 * PL.SLIDER_MARGIN) / 2);
    const s0X = PL.SLIDER_MARGIN;
    const s1X = PL.SLIDER_MARGIN + sliderW + gap;
    const s2X = PL.SLIDER_MARGIN + 2 * (sliderW + gap);

    const p0CenterY = transY + pizzaGeometry[0].position.y;
    const p0SliderTop = Math.ceil(p0CenterY + 0.9 * pizzaGeometry[0].diameter) + PL.SLIDER_PIZZA_GAP;

    const p1CenterY = transY + pizzaGeometry[1].position.y;
    const p1SliderTop = Math.ceil(p1CenterY + 0.9 * pizzaGeometry[1].diameter) + PL.SLIDER_PIZZA_GAP;

    const midTop = p0SliderTop + PL.SLIDER_ROW_HEIGHT;

    const portSliderBase: React.CSSProperties = { position: 'absolute', margin: 0, padding: 0, width: sliderW };

    const playStopTop = midTop + PL.MID_PLAY_OFFSET;

    return (
      <div style={outerStyle}>
        <div style={{ position: 'relative', width: appWidth, height: appHeight }}>
          {/* SVG canvas — pizzas + loop labels only */}
          <svg
            ref={svgRef}
            width={appWidth}
            height={appHeight}
            aria-label="Beat sequencer"
            style={{ display: 'block', touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <g transform={`translate(${transX},${transY})`}>
  
              {/* Interactive pizza faces */}
              {pizzas.map((pizza, i) => (
                <Pizza
                  key={i}
                  pizza={pizza}
                  pizzaIdx={i}
                  geometry={pizzaGeometry[i]}
                  steps={pizzaSteps[i]}
                  appWidth={appWidth}
                  syncWithOther={syncAll}
                  onDotToggle={(ring, step) => handleDotToggle(i, ring, step)}
                />
              ))}
            </g>
          </svg>

          {/* Loop duration labels — one per pizza, above the pizza face */}
          {pizzas.map((pizza, i) => {
            const [pr, pg, pb] = pizza.color;
            const loopRpts = Math.round(lcm / pizza.numTeeth);
            const loopLabel =
              loopRpts === 1
                ? `1 loop (${pizzaProps[i].loopTime.toFixed(1)} s)`
                : `${loopRpts} loops (${pizzaProps[i].loopTime.toFixed(1)} s)`;
            return (
              <span
                key={i}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 8,
                  top: appHeight * TIMELINE_POSITIONS.PIZZA_Y_RATIOS[i],
                  fontSize: Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT),
                  fontFamily: 'Lekton',
                  color: `rgba(${pr},${pg},${pb},0.9)`,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {loopLabel}
              </span>
            );
          })}

          {/* Per-pizza horizontal slider rows */}
          {pizzas.map((_, i) => {
            const [r, g, b] = PIZZA_COLORS[i];
            const sliderTop = i === 0 ? p0SliderTop : p1SliderTop;
            return (
              <Fragment key={i}>
                <input
                  type="range"
                  aria-label={`Pizza ${i + 1} slices`}
                  min={SLICES_MIN}
                  max={SLICES_MAX}
                  value={pizzaConfigs[i].slices}
                  style={{ ...portSliderBase, left: s0X, top: sliderTop, '--pizza-color': COLOR_STRINGS.GREY } as React.CSSProperties}
                  onChange={(e) => handleSlicesChange(i, Number(e.target.value))}
                />
                <input
                  type="range"
                  aria-label={`Pizza ${i + 1} teeth`}
                  min={SLICES_MIN}
                  max={TEETH_MAX}
                  value={pizzaConfigs[i].teeth}
                  style={{ ...portSliderBase, left: s1X, top: sliderTop, '--pizza-color': COLOR_STRINGS.WHITE } as React.CSSProperties}
                  onChange={(e) => handleTeethChange(i, Number(e.target.value))}
                />
                <input
                  type="range"
                  aria-label={`Pizza ${i + 1} rotation`}
                  min="0"
                  max={ROTATION_MAX}
                  value={pizzaConfigs[i].rotation}
                  style={{ ...portSliderBase, left: s2X, top: sliderTop, '--pizza-color': `rgb(${r},${g},${b})` } as React.CSSProperties}
                  onChange={(e) => handleRotationChange(i, Number(e.target.value))}
                />
                {/* Condensed value labels below each slider */}
                {[
                  { x: s0X, label: `${pizzaConfigs[i].slices} steps` },
                  { x: s1X, label: `${pizzaConfigs[i].teeth} teeth` },
                  { x: s2X, label: `${pizzaConfigs[i].rotation} rot` },
                ].map(({ x, label }) => (
                  <span
                    key={label}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: sliderTop + PL.SLIDER_LABEL_OFFSET,
                      width: sliderW,
                      textAlign: 'center',
                      fontSize: PL.SLIDER_LABEL_FONT,
                      fontFamily: 'Lekton',
                      color: COLOR_STRINGS.GREY,
                      pointerEvents: 'none',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </Fragment>
            );
          })}


          {/* Middle strip: BPM slider */}
          <input
            type="range"
            aria-label="BPM"
            min={BPM_MIN}
            max={BPM_MAX}
            value={bpm}
            style={{
              position: 'absolute',
              top: midTop + PL.MID_BPM_SLIDER_OFFSET,
              left: Math.ceil(appWidth * PL.BPM_SLIDER_X_RATIO),
              width: Math.ceil(appWidth * PL.BPM_SLIDER_WIDTH_RATIO),
              margin: 0,
              padding: 0,
              '--pizza-color': COLOR_STRINGS.GREY,
            } as React.CSSProperties}
            onChange={(e) => setBpm(Number(e.target.value))}
          />
          <span
            style={{
              position: 'absolute',
              top: midTop + PL.MID_BPM_LABEL_OFFSET,
              left: 0,
              width: appWidth,
              textAlign: 'center',
              fontFamily: 'Lekton',
              fontSize: PL.BPM_FONT,
              color: COLOR_STRINGS.GREY,
              pointerEvents: 'none',
            }}
          >
            {bpm} bpm
          </span>

          {/* Middle strip: play / stop button */}
          <PlayStopButton
            paused={paused}
            soundsReady={soundsReady}
            top={playStopTop}
            playLeft="49.55%"
            stopLeft="48.55%"
            pbSize={pbSize}
            pbLong={pbLong}
            stopSize={stopSize}
            onPlay={() => setPaused(false)}
            onStop={() => setPaused(true)}
          />

          {/* Clear button */}
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              fontFamily: 'Lekton',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              right: '3.5%',
              top: p1SliderTop + PL.BOTTOM_CLEAR_OFFSET,
              fontSize: PL.CONTROL_FONT,
              color: COLOR_STRINGS.GREY,
            }}
          >
            clear
          </button>

          {/* Screen-reader announcement for play/pause state */}
          <div role="status" aria-live="polite" className="sr-only">
            {paused ? 'Stopped' : 'Playing'}
          </div>

          <AboutPanel />
          <SettingsPanel
            highContrast={highContrast}
            onHighContrastChange={setHighContrast}
            fontSize={PL.CONTROL_FONT}
            kits={kits}
            onKitChange={handleKitChange}
            pizzaColors={PIZZA_COLORS}
            layoutMode={layoutMode}
            onLayoutModeChange={setLayoutMode}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // Landscape layout — side-by-side pizzas, bottom sliders, SVG labels
  // =========================================================================
  // All HTML element sizes and positions are computed in screen pixels from
  // viewBox coordinates: screenPx = viewBoxUnit * scale + letterboxOffset.
  const sliderW = Math.ceil(appWidth * SLIDER_WIDTH_RATIO * scale);

  const sliderBase: React.CSSProperties = {
    position: 'absolute',
    width: sliderW,
    margin: 0,
    padding: 0,
  };

  // -------------------------------------------------------------------------
  return (
    <div style={outerStyle}>
      {/* Full-viewport wrapper; SVG scales content via viewBox */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Timeline SVG — decorative overlay, no pointer events */}
        <svg
          viewBox={`0 0 ${appWidth} ${appHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <g transform={`translate(${transX},${transY})`}>
            {pizzas.map((pizza, i) => (
              <Timeline
                key={i}
                pizza={pizza}
                lcm={lcm}
                loopTime={pizzaProps[i].loopTime}
                yPos={pizzaProps[i].yPos}
                appWidth={appWidth}
                appHeight={appHeight}
                showPatternInfo={i === 0}
              />
            ))}
          </g>
        </svg>

        {/* Per-pizza panels — face SVG + controls, positioned by pizza center */}
        {pizzas.map((pizza, i) => (
          <PizzaPanel
            key={i}
            pizza={pizza}
            pizzaIdx={i}
            geometry={pizzaGeometry[i]}
            steps={pizzaSteps[i]}
            config={pizzaConfigs[i]}
            stepNoteValue={pizzaProps[i].stepNoteValue}
            timeUnit={timeUnit}
            otherStepNoteValue={pizzaProps[1 - i].stepNoteValue}
            otherColor={PIZZA_COLORS[1 - i]}
            syncWithOther={syncAll}
            appWidth={appWidth}
            scale={scale}
            screenCenterX={(transX + pizzaGeometry[i].position.x) * scale + offX}
            screenCenterY={(transY + pizzaGeometry[i].position.y) * scale + offY}
            onDotToggle={(ring, step) => handleDotToggle(i, ring, step)}
            onSlicesChange={(n) => handleSlicesChange(i, n)}
            onTeethChange={(n) => handleTeethChange(i, n)}
            onRotationChange={(n) => handleRotationChange(i, n)}
          />
        ))}

        {/* BPM readout */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: appWidth * BPM_SLIDER_X_RATIO * scale + offX,
            top: appHeight * (BPM_SLIDER_Y_RATIO + BPM_TEXT_Y_RATIO) * scale + offY,
            fontSize: Math.ceil(appWidth * TEXT_SIZES.CONTROL_TEXT * scale),
            fontFamily: 'Lekton',
            color: COLOR_STRINGS.GREY,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {bpm} bpm
        </span>

        {/* BPM slider */}
        <input
          type="range"
          aria-label="BPM"
          min={BPM_MIN}
          max={BPM_MAX}
          value={bpm}
          style={{
            ...sliderBase,
            '--pizza-color': COLOR_STRINGS.GREY,
            left: appWidth * BPM_SLIDER_X_RATIO * scale + offX,
            top: appHeight * BPM_SLIDER_Y_RATIO * scale + offY,
          } as React.CSSProperties}
          onChange={(e) => setBpm(Number(e.target.value))}
        />

        <SettingsPanel
          highContrast={highContrast}
          onHighContrastChange={setHighContrast}
          fontSize={Math.ceil(appWidth * TEXT_SIZES.CLEAR_BUTTON * scale)}
          kits={kits}
          onKitChange={handleKitChange}
          pizzaColors={PIZZA_COLORS}
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
        />

        {/* Clear button */}
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            fontFamily: 'Lekton',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            right: offX + appWidth * 0.035 * scale,
            top: appHeight * 0.13 * scale + offY,
            fontSize: Math.ceil(appWidth * TEXT_SIZES.CLEAR_BUTTON * scale),
            color: COLOR_STRINGS.GREY,
          }}
        >
          clear
        </button>

        {/* Play / Stop button */}
        <PlayStopButton
          paused={paused}
          soundsReady={soundsReady}
          top={appHeight * 0.70 * scale + offY}
          playLeft={appWidth * 0.4955 * scale + offX}
          stopLeft={appWidth * 0.4855 * scale + offX}
          pbSize={pbSize}
          pbLong={pbLong}
          stopSize={stopSize}
          onPlay={() => setPaused(false)}
          onStop={() => setPaused(true)}
        />

        {/* Screen-reader announcement for play/pause state */}
        <div role="status" aria-live="polite" className="sr-only">
          {paused ? 'Stopped' : 'Playing'}
        </div>

        <AboutPanel />
      </div>
    </div>
  );
}
