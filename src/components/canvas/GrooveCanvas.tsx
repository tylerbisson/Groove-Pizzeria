/**
 * GrooveCanvas
 *
 * Root component — owns all application state and wires the audio sequencer
 * to the SVG canvas. Pizza state is stored in indexed arrays so that adding
 * a third sequencer requires no structural changes here: push a new entry
 * into PIZZA_POSITIONS and PIZZA_COLORS in config.ts.
 */
/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect --
   PizzaSequencer instances live in refs by design: they mutate on every
   scheduler tick (stepAngle, currentStep) and reading them during render
   is intentional, guarded by the pizzasReady flag. Storing them in state
   would cause a re-render on every audio tick. */
import { useRef, useState, useEffect, useMemo, Fragment } from 'react';
import { pointRadial } from 'd3';
import PizzaSequencer from '../../PizzaSequencer';
import PizzaFaceSVG from './PizzaFaceSVG';
import TimelineSVG from './TimelineSVG';
import ControlTextSVG from './ControlTextSVG';
import BPMTextSVG from './BPMTextSVG';
import StepRatioSVG from './StepRatioSVG';
import SettingsPanel from '../panels/SettingsPanel';
import AboutPanel from '../panels/AboutPanel';
import { setupSounds } from '../../audio';
import { useSequencer } from '../../hooks/useSequencer';
import { useAnimationLoop } from '../../hooks/useAnimationLoop';
import { lcm as calcLcm } from '../../utils/math';
import { computeDimensions, computeSliderAnchors, computePizzaGeometry } from '../../utils/dimensions';
import { makeEmptySteps, resizeSteps, rotateStepsRight } from '../../utils/steps';
import { encodeState, decodeState } from '../../utils/urlState';
import type { PizzaConfig, PizzaSteps, Dimensions, PizzaGeometry, LayoutMode } from '../../types';
import {
  PIZZA_POSITIONS,
  PIZZA_POSITIONS_PORTRAIT,
  PIZZA_COLORS,
  PIZZA_BUTTON_POSITIONS,
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
  SLIDER_THUMB_OFFSET,
  BPM_SLIDER_X_RATIO,
  BPM_SLIDER_Y_RATIO,
  STOP_BUTTON_SIZE_RATIO,
  CLICK_THRESHOLD,
  COLOR_STRINGS,
  PORTRAIT_LAYOUT,
} from '../../config';

const NUM_PIZZAS = PIZZA_POSITIONS.length;

function parseHashState() {
  const hash = window.location.hash.slice(1);
  return hash ? decodeState(hash, NUM_PIZZAS) : null;
}

export default function GrooveCanvas() {
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
    () => parseHashState()?.pizzaSteps ?? PIZZA_POSITIONS.map(() => makeEmptySteps(DEFAULT_NUM_SLICES))
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

  // PizzaSequencer instances — one per pizza, held in a single ref array
  const pizzaRefs = useRef<(PizzaSequencer | null)[]>(PIZZA_POSITIONS.map(() => null));
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

  // -- Initialise PizzaSequencer instances once dimensions are known -------
  useEffect(() => {
    if (!dimensions) return;
    const stableCallback = () => onTeethChangeRef.current();

    PIZZA_POSITIONS.forEach((_, i) => {
      pizzaRefs.current[i] = new PizzaSequencer({
        name: `pizza${i + 1}`,
        numSteps: DEFAULT_NUM_SLICES,
        color: PIZZA_COLORS[i],
        drumSamples: KIT_MAP[kits[i]],
        onTeethChange: stableCallback,
      });
    });
    setPizzasReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-time init on dimensions; kit changes are handled in a separate effect
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

  const pizzaAnchors = useMemo(
    () =>
      dimensions && !effectivePortrait
        ? PIZZA_POSITIONS.map((pos) =>
            computeSliderAnchors(pos.x, dimensions.appWidth, dimensions.appHeight)
          )
        : [],
    [dimensions, effectivePortrait]
  );

  const pizzaSliderPositions = useMemo(
    () =>
      dimensions && !effectivePortrait
        ? pizzaAnchors.map((anchors) => {
            const t = dimensions.transX; // transX === appWidth/2 in landscape
            return {
              x: anchors.slidersX + t,
              rotateX: anchors.rotateX + t,
              sliceY: anchors.sliceY + t - SLIDER_THUMB_OFFSET,
              toothY: anchors.toothY + t - SLIDER_THUMB_OFFSET,
              rotateY: anchors.rotateY + t - SLIDER_THUMB_OFFSET,
            };
          })
        : [],
    [dimensions, pizzaAnchors, effectivePortrait]
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
  const pizzas = pizzaRefs.current as PizzaSequencer[];
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
  const stepNoteValues = pizzaProps.map((p) => p.stepNoteValue);

  const syncAll = pizzas.every((p) => p.currentStep === 0);

  const pbSize = Math.ceil(appWidth * TEXT_SIZES.PLAY_BUTTON_SIZE);
  const pbLong = Math.ceil(appWidth * TEXT_SIZES.PLAY_BUTTON_OFFSET);

  // -- Event handlers -------------------------------------------------------
  const handleClear = () => {
    setPizzaSteps(pizzaConfigs.map((c) => makeEmptySteps(c.slices)));
  };

  const handleKitChange = (i: number, kit: string) => {
    setKits((prev) => prev.map((k, j) => (j === i ? kit : k)));
  };

  const handleSlicesChange = (i: number, n: number) => {
    setPizzaConfigs((prev) => prev.map((c, j) => (j === i ? { ...c, slices: n } : c)));
    setPizzaSteps((prev) => prev.map((steps, j) => (j === i ? resizeSteps(steps, n) : steps)));
  };
  const handleTeethChange = (i: number, n: number) => {
    setPizzaConfigs((prev) => prev.map((c, j) => (j === i ? { ...c, teeth: n } : c)));
  };
  const handleRotationChange = (i: number, newRot: number) => {
    const delta = newRot - pizzaConfigs[i].rotation;
    setPizzaConfigs((prev) => prev.map((c, j) => (j === i ? { ...c, rotation: newRot } : c)));
    if (delta !== 0)
      setPizzaSteps((prev) =>
        prev.map((steps, j) => (j === i ? rotateStepsRight(steps, delta) : steps))
      );
  };

  const getSVGCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scaleX = appWidth / rect.width;
    const scaleY = appHeight / rect.height;
    return {
      x: (clientX - rect.left) * scaleX - transX,
      y: (clientY - rect.top) * scaleY - transY,
    };
  };

  const tryToggleDot = (gX: number, gY: number) => {
    const threshold = pizzaGeometry[0].pizzaDiam * CLICK_THRESHOLD;
    const t2 = threshold * threshold;
    pizzas.forEach((pizza, pizzaIdx) => {
      const geom = pizzaGeometry[pizzaIdx];
      pizza.stepAngles.forEach((angle, stepIdx) => {
        PIZZA_BUTTON_POSITIONS.forEach((pos, ringIdx) => {
          const [cx, cy] = pointRadial((angle * Math.PI) / 180, pos * geom.pizzaDiam);
          const dx = gX - (geom.position.x + cx);
          const dy = gY - (geom.position.y + cy);
          if (dx * dx + dy * dy < t2) {
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
          }
        });
      });
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
              <g aria-hidden="true">
                {/* Condensed loop labels in top strip */}
                {pizzas.map((pizza, i) => (
                  <TimelineSVG
                    key={i}
                    pizza={pizza}
                    lcm={lcm}
                    loopTime={pizzaProps[i].loopTime}
                    yPos={pizzaProps[i].yPos}
                    appWidth={appWidth}
                    appHeight={appHeight}
                    portrait
                  />
                ))}
              </g>

              {/* Interactive pizza faces */}
              {pizzas.map((pizza, i) => (
                <PizzaFaceSVG
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
          {paused ? (
            <button
              aria-label={soundsReady ? 'Play' : 'Loading audio…'}
              aria-keyshortcuts="Space"
              disabled={!soundsReady}
              onClick={() => setPaused(false)}
              style={{
                position: 'absolute',
                top: playStopTop,
                left: '49.55%',
                width: 0,
                height: 0,
                padding: 0,
                background: 'none',
                border: 'none',
                borderStyle: 'solid',
                cursor: 'pointer',
                borderColor: `transparent transparent transparent ${COLOR_STRINGS.GREY}`,
                borderWidth: `${pbSize}px 0 ${pbSize}px ${pbLong}px`,
              }}
            />
          ) : (
            <button
              aria-label="Stop"
              aria-keyshortcuts="Space"
              onClick={() => setPaused(true)}
              style={{
                position: 'absolute',
                top: playStopTop,
                left: '48.55%',
                padding: 0,
                border: 'none',
                cursor: 'pointer',
                width: Math.ceil(appWidth * STOP_BUTTON_SIZE_RATIO),
                height: Math.ceil(appWidth * STOP_BUTTON_SIZE_RATIO),
                background: COLOR_STRINGS.GREY,
              }}
            />
          )}

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
  const sliderW = Math.ceil(appWidth * SLIDER_WIDTH_RATIO);

  // -- Slider styles --------------------------------------------------------
  const sliderBase: React.CSSProperties = {
    position: 'absolute',
    width: sliderW,
    margin: 0,
    padding: 0,
  };
  const sliceSlider: React.CSSProperties = {
    ...sliderBase,
    '--pizza-color': COLOR_STRINGS.GREY,
  } as React.CSSProperties;
  const teethSlider: React.CSSProperties = {
    ...sliderBase,
    '--pizza-color': COLOR_STRINGS.WHITE,
  } as React.CSSProperties;
  const bpmSlider: React.CSSProperties = {
    ...sliderBase,
    '--pizza-color': COLOR_STRINGS.GREY,
    left: appWidth * BPM_SLIDER_X_RATIO,
    top: appHeight * BPM_SLIDER_Y_RATIO,
    width: Math.ceil(appWidth * SLIDER_WIDTH_RATIO),
  } as React.CSSProperties;

  // -------------------------------------------------------------------------
  return (
    <div style={outerStyle}>
      {/* Wrapper sized to the SVG canvas so absolutely-positioned children align */}
      <div style={{ position: 'relative', width: appWidth, height: appHeight }}>
        {/* SVG canvas */}
        <svg
          ref={svgRef}
          width={appWidth}
          height={appHeight}
          aria-label="Beat sequencer"
          style={{ display: 'block' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <g transform={`translate(${transX},${transY})`}>
            {/* Decorative labels — screen readers use slider/button labels instead */}
            <g aria-hidden="true">
              {pizzas.map((pizza, i) => (
                <TimelineSVG
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
              {pizzas.map((pizza, i) => (
                <ControlTextSVG
                  key={i}
                  pizza={pizza}
                  anchors={pizzaAnchors[i]}
                  timeUnit={timeUnit}
                  stepNoteValue={pizzaProps[i].stepNoteValue}
                  rotation={pizzaProps[i].rotation}
                  appWidth={appWidth}
                  appHeight={appHeight}
                />
              ))}
              <StepRatioSVG
                pizzas={pizzas}
                anchors={pizzaAnchors}
                stepNoteValues={stepNoteValues}
                appWidth={appWidth}
              />
              <BPMTextSVG
                bpm={bpm}
                appWidth={appWidth}
                appHeight={appHeight}
                transX={transX}
                transY={transY}
              />
            </g>

            {/* Interactive pizza faces */}
            {pizzas.map((pizza, i) => (
              <PizzaFaceSVG
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

        {/* Per-pizza sliders */}
        {pizzas.map((_, i) => {
          const [r, g, b] = PIZZA_COLORS[i];
          const sp = pizzaSliderPositions[i];
          return (
            <Fragment key={i}>
              <input
                type="range"
                aria-label={`Pizza ${i + 1} slices`}
                min={SLICES_MIN}
                max={SLICES_MAX}
                value={pizzaConfigs[i].slices}
                style={{ ...sliceSlider, left: sp.x, top: sp.sliceY }}
                onChange={(e) => handleSlicesChange(i, Number(e.target.value))}
              />
              <input
                type="range"
                aria-label={`Pizza ${i + 1} teeth`}
                min={SLICES_MIN}
                max={TEETH_MAX}
                value={pizzaConfigs[i].teeth}
                style={{ ...teethSlider, left: sp.x, top: sp.toothY }}
                onChange={(e) => handleTeethChange(i, Number(e.target.value))}
              />
              <input
                type="range"
                aria-label={`Pizza ${i + 1} rotation`}
                min="0"
                max={ROTATION_MAX}
                value={pizzaConfigs[i].rotation}
                style={
                  {
                    ...sliderBase,
                    '--pizza-color': `rgb(${r},${g},${b})`,
                    left: sp.rotateX,
                    top: sp.rotateY,
                  } as React.CSSProperties
                }
                onChange={(e) => handleRotationChange(i, Number(e.target.value))}
              />
            </Fragment>
          );
        })}

        {/* BPM slider */}
        <input
          type="range"
          aria-label="BPM"
          min={BPM_MIN}
          max={BPM_MAX}
          value={bpm}
          style={bpmSlider}
          onChange={(e) => setBpm(Number(e.target.value))}
        />

        <SettingsPanel
          highContrast={highContrast}
          onHighContrastChange={setHighContrast}
          fontSize={Math.ceil(appWidth * TEXT_SIZES.CLEAR_BUTTON)}
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
            right: '3.5%',
            top: '13%',
            fontSize: Math.ceil(appWidth * TEXT_SIZES.CLEAR_BUTTON),
            color: COLOR_STRINGS.GREY,
          }}
        >
          clear
        </button>

        {/* Play / Pause button */}
        {paused ? (
          <button
            aria-label={soundsReady ? 'Play' : 'Loading audio…'}
            aria-keyshortcuts="Space"
            disabled={!soundsReady}
            onClick={() => setPaused(false)}
            style={{
              position: 'absolute',
              top: '70%',
              left: '49.55%',
              width: 0,
              height: 0,
              padding: 0,
              background: 'none',
              border: 'none',
              borderStyle: 'solid',
              cursor: 'pointer',
              borderColor: `transparent transparent transparent ${COLOR_STRINGS.GREY}`,
              borderWidth: `${pbSize}px 0 ${pbSize}px ${pbLong}px`,
            }}
          />
        ) : (
          <button
            aria-label="Stop"
            aria-keyshortcuts="Space"
            onClick={() => setPaused(true)}
            style={{
              position: 'absolute',
              top: '70%',
              left: '48.55%',
              padding: 0,
              border: 'none',
              cursor: 'pointer',
              width: Math.ceil(appWidth * STOP_BUTTON_SIZE_RATIO),
              height: Math.ceil(appWidth * STOP_BUTTON_SIZE_RATIO),
              background: COLOR_STRINGS.GREY,
            }}
          />
        )}

        {/* Screen-reader announcement for play/pause state */}
        <div role="status" aria-live="polite" className="sr-only">
          {paused ? 'Stopped' : 'Playing'}
        </div>

        <AboutPanel />
      </div>
    </div>
  );
}
