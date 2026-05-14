/**
 * GrooveCanvas
 *
 * Root component — owns all application state and wires the audio sequencer
 * to the SVG canvas. Pizza state is stored in indexed arrays so that adding
 * a third sequencer requires no structural changes here: push a new entry
 * into PIZZA_POSITIONS and PIZZA_COLORS in config.ts.
 */
import { useRef, useState, useEffect, Fragment } from 'react';
import { pointRadial } from 'd3';
import PizzaSequencer from '../PizzaSequencer';
import PizzaFaceSVG from './PizzaFaceSVG';
import TimelineSVG from './TimelineSVG';
import ControlTextSVG from './ControlTextSVG';
import BPMTextSVG from './BPMTextSVG';
import StepRatioSVG from './StepRatioSVG';
import { useSequencer } from '../hooks/useSequencer';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import { lcm as calcLcm } from '../utils/math';
import { computeDimensions, computeSliderAnchors } from '../utils/dimensions';
import { makeEmptySteps, resizeSteps, rotateStepsRight } from '../utils/steps';
import type { PizzaConfig, PizzaSteps, Dimensions } from '../types';
import {
  PIZZA_POSITIONS,
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
  COLORS,
  KIT_MAP,
  KIT_OPTIONS,
  KIT_X_RATIOS,
  TEXT_SIZES,
  DROPDOWN_SIZES,
  SLIDER_WIDTH_RATIO,
  SLIDER_THUMB_OFFSET,
  BPM_SLIDER_X_RATIO,
  BPM_SLIDER_Y_RATIO,
  STOP_BUTTON_SIZE_RATIO,
  CLICK_THRESHOLD,
  KIT_DROPDOWN_Y_RATIO,
} from '../config';

const NUM_PIZZAS = PIZZA_POSITIONS.length;

export default function GrooveCanvas() {
  const [bpm,    setBpm]    = useState(DEFAULT_BPM);
  const [paused, setPaused] = useState(true);
  const [dimensions, setDimensions]   = useState<Dimensions | null>(null);
  const [pizzasReady, setPizzasReady] = useState(false);

  // Per-pizza slider state — one entry per pizza, drives pizza.updateState() on change
  const [pizzaConfigs, setPizzaConfigs] = useState<PizzaConfig[]>(() =>
    PIZZA_POSITIONS.map(() => ({ slices: DEFAULT_NUM_SLICES, teeth: DEFAULT_NUM_TEETH, rotation: 0 }))
  );

  // Per-pizza step state — source of truth for which beats are active
  const [pizzaSteps, setPizzaSteps] = useState<PizzaSteps[]>(() =>
    PIZZA_POSITIONS.map(() => makeEmptySteps(DEFAULT_NUM_SLICES))
  );

  // Ref mirrors step state so the sequencer's setInterval always reads current values
  const pizzaStepsRef = useRef<PizzaSteps[]>(pizzaSteps);
  useEffect(() => { pizzaStepsRef.current = pizzaSteps; }, [pizzaSteps]);

  // Per-pizza kit selection
  const [kits, setKits] = useState<string[]>(() => KIT_OPTIONS.slice(0, NUM_PIZZAS));

  // PizzaSequencer instances — one per pizza, held in a single ref array
  const pizzaRefs        = useRef<(PizzaSequencer | null)[]>(PIZZA_POSITIONS.map(() => null));
  const onTeethChangeRef = useRef<() => void>(() => {});
  const svgRef           = useRef<SVGSVGElement | null>(null);
  const isDraggingRef    = useRef(false);
  const draggedDotsRef   = useRef(new Set<string>());

  // -- Measure window on mount and resize ----------------------------------
  useEffect(() => {
    const update = () => setDimensions(computeDimensions(window.innerWidth, window.innerHeight));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // -- Spacebar toggles play/pause -----------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setPaused(p => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // -- Initialise PizzaSequencer instances once dimensions are known -------
  useEffect(() => {
    if (!dimensions) return;
    const { appWidth, appHeight } = dimensions;
    const stableCallback = () => onTeethChangeRef.current();

    PIZZA_POSITIONS.forEach((pos, i) => {
      pizzaRefs.current[i] = new PizzaSequencer({
        name: `pizza${i + 1}`,
        x: pos.x * appWidth,
        y: pos.y * appHeight,
        numSteps: DEFAULT_NUM_SLICES,
        color: PIZZA_COLORS[i],
        drumSamples: KIT_MAP[kits[i]],
        appWidth,
        onTeethChange: stableCallback,
      });
    });
    setPizzasReady(true);
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
  useEffect(() => { onTeethChangeRef.current = onTeethChange; }, [onTeethChange]);

  // -- 60fps animation loop while playing ----------------------------------
  useAnimationLoop(!paused);

  // -------------------------------------------------------------------------
  if (!dimensions || !pizzasReady) return null;

  const { appWidth, appHeight } = dimensions;
  const trans    = appWidth / 2;
  const pizzas   = pizzaRefs.current as PizzaSequencer[];
  const lcm      = pizzas.reduce((acc, p) => calcLcm(acc, p.numTeeth), 1);
  const timeUnit = (60 / bpm) / 4;

  // Compute display-only derived values and update timeline playhead positions
  const pizzaProps = pizzas.map((pizza, i) => {
    const loopTime      = timeUnit * pizza.numTeeth;
    const stepTime      = loopTime / pizza.slices;
    const stepNoteValue = (timeUnit * 16) / stepTime;
    const rotation      = pizzaConfigs[i].rotation;
    const yPos          = -trans + appHeight * TIMELINE_POSITIONS.PIZZA_Y_RATIOS[i];
    pizza.computeTimeline(lcm, appWidth);
    return { loopTime, stepNoteValue, rotation, yPos };
  });
  const stepNoteValues = pizzaProps.map(p => p.stepNoteValue);

  const syncAll      = pizzas.every(p => p.currentStep === 1);
  const pizzaAnchors = PIZZA_POSITIONS.map(pos => computeSliderAnchors(pos.x, appWidth, appHeight));
  const sliderW      = Math.ceil(appWidth * SLIDER_WIDTH_RATIO);
  const pizzaSliderPositions = pizzaAnchors.map(anchors => ({
    x:       anchors.slidersX + trans,
    rotateX: anchors.rotateX  + trans,
    sliceY:  anchors.sliceY   + trans - SLIDER_THUMB_OFFSET,
    toothY:  anchors.toothY   + trans - SLIDER_THUMB_OFFSET,
    rotateY: anchors.rotateY  + trans - SLIDER_THUMB_OFFSET,
  }));

  const kitStyle: React.CSSProperties = {
    position: 'absolute',
    top:          appHeight * KIT_DROPDOWN_Y_RATIO,
    fontFamily:   'Lekton',
    fontSize:     Math.ceil(appWidth * TEXT_SIZES.DROPDOWN),
    height:       Math.ceil(appWidth * DROPDOWN_SIZES.HEIGHT),
    paddingLeft:  Math.ceil(appWidth * DROPDOWN_SIZES.PADDING_X),
    paddingRight: Math.ceil(appWidth * DROPDOWN_SIZES.PADDING_X),
    borderRadius: '0.5em',
    border: 'none',
    appearance: 'none',
    cursor: 'pointer',
  };

  const pbSize = Math.ceil(appWidth * TEXT_SIZES.PLAY_BUTTON_SIZE);
  const pbLong = Math.ceil(appWidth * TEXT_SIZES.PLAY_BUTTON_OFFSET);

  // -- Event handlers -------------------------------------------------------
  const handleClear = () => {
    setPizzaSteps(pizzaConfigs.map(c => makeEmptySteps(c.slices)));
  };

  const handleSlicesChange = (i: number, n: number) => {
    setPizzaConfigs(prev => prev.map((c, j) => j === i ? { ...c, slices: n } : c));
    setPizzaSteps(prev => prev.map((steps, j) => j === i ? resizeSteps(steps, n) : steps));
  };
  const handleTeethChange = (i: number, n: number) => {
    setPizzaConfigs(prev => prev.map((c, j) => j === i ? { ...c, teeth: n } : c));
  };
  const handleRotationChange = (i: number, newRot: number) => {
    const delta = newRot - pizzaConfigs[i].rotation;
    setPizzaConfigs(prev => prev.map((c, j) => j === i ? { ...c, rotation: newRot } : c));
    if (delta !== 0) setPizzaSteps(prev => prev.map((steps, j) => j === i ? rotateStepsRight(steps, delta) : steps));
  };

  const getSVGCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect   = svg.getBoundingClientRect();
    const scaleX = appWidth  / rect.width;
    const scaleY = appHeight / rect.height;
    return {
      x: (clientX - rect.left) * scaleX - trans,
      y: (clientY - rect.top)  * scaleY - trans,
    };
  };

  const tryToggleDot = (gX: number, gY: number) => {
    const threshold = pizzas[0].pizzaDiam * CLICK_THRESHOLD;
    const t2 = threshold * threshold;
    pizzas.forEach((pizza, pizzaIdx) => {
      pizza.stepAngles.forEach((angle, stepIdx) => {
        pizza.buttonPosArr.forEach((pos, ringIdx) => {
          const [cx, cy] = pointRadial(angle * Math.PI / 180, pos * pizza.pizzaDiam);
          const dx = gX - (pizza.position.x + cx);
          const dy = gY - (pizza.position.y + cy);
          if (dx * dx + dy * dy < t2) {
            const key = `${pizzaIdx}-${ringIdx}-${stepIdx}`;
            if (!draggedDotsRef.current.has(key)) {
              draggedDotsRef.current.add(key);
              setPizzaSteps(prev => prev.map((steps, j) => {
                if (j !== pizzaIdx) return steps;
                const next = steps.map(ring => [...ring]) as PizzaSteps;
                next[ringIdx][stepIdx] = next[ringIdx][stepIdx] === 0 ? COLORS.GREY : 0;
                return next;
              }));
            }
          }
        });
      });
    });
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDraggingRef.current  = true;
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
    isDraggingRef.current  = false;
    draggedDotsRef.current = new Set();
  };

  // -- Slider styles --------------------------------------------------------
  const sliderBase: React.CSSProperties  = { position: 'absolute', width: sliderW, margin: 0, padding: 0 };
  const sliceSlider: React.CSSProperties = { ...sliderBase, '--pizza-color': 'rgb(170,170,170)' } as React.CSSProperties;
  const teethSlider: React.CSSProperties = { ...sliderBase, '--pizza-color': 'rgb(255,255,255)' } as React.CSSProperties;
  const bpmSlider: React.CSSProperties   = {
    ...sliderBase,
    '--pizza-color': 'rgb(170,170,170)',
    left: appWidth * BPM_SLIDER_X_RATIO,
    top: appHeight * BPM_SLIDER_Y_RATIO,
    width: Math.ceil(appWidth * SLIDER_WIDTH_RATIO),
  } as React.CSSProperties;

  // -------------------------------------------------------------------------
  return (
    <div style={{ background: 'rgb(211,227,223)', width: '100vw', height: '100vh', overflow: 'hidden', userSelect: 'none' }}>

      {/* Wrapper sized to the SVG canvas so absolutely-positioned children align */}
      <div style={{ position: 'relative', width: appWidth, height: appHeight, margin: '0 auto' }}>

        {/* SVG canvas */}
        <svg ref={svgRef} width={appWidth} height={appHeight} style={{ display: 'block' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}>
          <g transform={`translate(${trans},${trans})`}>

            {pizzas.map((pizza, i) => (
              <PizzaFaceSVG key={i} pizza={pizza} steps={pizzaSteps[i]} appWidth={appWidth} syncWithOther={syncAll} />
            ))}

            {pizzas.map((pizza, i) => (
              <TimelineSVG key={i} pizza={pizza} lcm={lcm} loopTime={pizzaProps[i].loopTime} yPos={pizzaProps[i].yPos} appWidth={appWidth} appHeight={appHeight} showPatternInfo={i === 0} />
            ))}

            {pizzas.map((pizza, i) => (
              <ControlTextSVG key={i} pizza={pizza} anchors={pizzaAnchors[i]} timeUnit={timeUnit} stepNoteValue={pizzaProps[i].stepNoteValue} rotation={pizzaProps[i].rotation} appWidth={appWidth} appHeight={appHeight} />
            ))}

            <StepRatioSVG pizzas={pizzas} anchors={pizzaAnchors} stepNoteValues={stepNoteValues} appWidth={appWidth} />

            <BPMTextSVG bpm={bpm} appWidth={appWidth} appHeight={appHeight} />

          </g>
        </svg>

        {/* Per-pizza sliders */}
        {pizzas.map((_, i) => {
          const [r, g, b] = PIZZA_COLORS[i];
          const sp = pizzaSliderPositions[i];
          return (
            <Fragment key={i}>
              <input type="range" min={SLICES_MIN}   max={SLICES_MAX}   value={pizzaConfigs[i].slices}
                style={{ ...sliceSlider, left: sp.x, top: sp.sliceY }}
                onChange={e => handleSlicesChange(i, Number(e.target.value))} />
              <input type="range" min={SLICES_MIN}   max={TEETH_MAX}    value={pizzaConfigs[i].teeth}
                style={{ ...teethSlider, left: sp.x, top: sp.toothY }}
                onChange={e => handleTeethChange(i, Number(e.target.value))} />
              <input type="range" min="0"             max={ROTATION_MAX} value={pizzaConfigs[i].rotation}
                style={{ ...sliderBase, '--pizza-color': `rgb(${r},${g},${b})`, left: sp.rotateX, top: sp.rotateY } as React.CSSProperties}
                onChange={e => handleRotationChange(i, Number(e.target.value))} />
            </Fragment>
          );
        })}

        {/* BPM slider */}
        <input type="range" min={BPM_MIN} max={BPM_MAX} value={bpm}
          style={bpmSlider} onChange={e => setBpm(Number(e.target.value))} />

        {/* Kit selectors */}
        {pizzas.map((_, i) => {
          const [r, g, b] = PIZZA_COLORS[i];
          return (
            <select key={i} value={kits[i]}
              style={{ ...kitStyle, left: appWidth * KIT_X_RATIOS[i], color: `rgb(${r},${g},${b})`, background: `rgba(${r},${g},${b},0.2)` }}
              onChange={e => setKits(prev => prev.map((k, j) => j === i ? e.target.value : k))}>
              {KIT_OPTIONS.map(k => <option key={k}>{k}</option>)}
            </select>
          );
        })}

        {/* Clear button */}
        <button onClick={handleClear}
          style={{ position: 'absolute', fontFamily: 'Lekton', background: 'none',
                   border: 'none', cursor: 'pointer', right: '3.5%', top: '13%',
                   fontSize: Math.ceil(appWidth * TEXT_SIZES.CLEAR_BUTTON),
                   color: 'rgba(170,170,170,1)' }}>
          clear
        </button>

        {/* Play / Pause button */}
        {paused ? (
          <div className="play" onClick={() => setPaused(false)}
            style={{ position: 'absolute', top: '70%', left: '49.55%',
                     width: 0, height: 0, borderStyle: 'solid', cursor: 'pointer',
                     borderColor: 'transparent transparent transparent rgba(170,170,170,1)',
                     borderWidth: `${pbSize}px 0 ${pbSize}px ${pbLong}px` }} />
        ) : (
          <div className="stop" onClick={() => setPaused(true)}
            style={{ position: 'absolute', top: '70%', left: '48.55%', cursor: 'pointer',
                     width:  Math.ceil(appWidth * STOP_BUTTON_SIZE_RATIO),
                     height: Math.ceil(appWidth * STOP_BUTTON_SIZE_RATIO),
                     background: 'rgba(170,170,170,1)' }} />
        )}

        {/* Social links */}
        <a href="https://www.linkedin.com/in/tyler-bisson/" target="_blank" rel="noreferrer"
          style={{ position: 'absolute', left: '1%', top: '50%' }}>
          <img src="/img/linkedin.png" alt="LinkedIn"
            style={{ maxHeight: Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT_LARGE),
                     maxWidth:  Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT_LARGE) }} />
        </a>
        <a href="https://github.com/tylerbisson" target="_blank" rel="noreferrer"
          style={{ position: 'absolute', left: '1%', top: '60%' }}>
          <img src="/img/github.png" alt="GitHub"
            style={{ maxHeight: Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT_LARGE),
                     maxWidth:  Math.ceil(appWidth * TEXT_SIZES.TIMELINE_TEXT_LARGE) }} />
        </a>

      </div>
    </div>
  );
}
