/**
 * GrooveCanvas
 *
 * Root component — owns all application state and wires the audio sequencer
 * to the SVG canvas. Responsible for:
 *   - Responsive canvas sizing
 *   - Pizza sequencer instances (PizzaSequencer class)
 *   - Step state (which beats are active) per pizza
 *   - Slider/kit/BPM controls and their handlers
 *   - Pointer events for click/drag beat toggling
 *   - Delegating rendering to the individual SVG sub-components
 */
import React, { useRef, useState, useEffect } from 'react';
import { pointRadial } from 'd3';
import PizzaSequencer from '../PizzaSequencer';
import PizzaFaceSVG from './PizzaFaceSVG';
import TimelineSVG from './TimelineSVG';
import ControlTextSVG from './ControlTextSVG';
import BPMTextSVG from './BPMTextSVG';
import StepRatioSVG from './StepRatioSVG';
import { useSequencer } from '../hooks/useSequencer';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import { lcm_two_numbers } from '../utils/math';
import { computeDimensions, computeSliderAnchors } from '../utils/dimensions';
import { makeEmptySteps, resizeSteps, rotateStepsRight } from '../utils/steps';
import {
  PIZZA_1_POSITION,
  PIZZA_2_POSITION,
  PIZZA_1_COLOR,
  PIZZA_2_COLOR,
  TIMELINE_POSITIONS,
  DEFAULT_BPM,
  DEFAULT_NUM_SLICES,
  DEFAULT_NUM_TEETH,
  BPM_MIN,
  BPM_MAX,
  SLICES_MIN,
  COLORS,
  KIT_MAP,
  KIT_OPTIONS,
  TEXT_SIZES,
  DROPDOWN_SIZES,
  SLIDER_WIDTH_RATIO,
  SLIDER_THUMB_OFFSET,
  BPM_SLIDER_X_RATIO,
  BPM_SLIDER_Y_RATIO,
  KIT_DROPDOWN_Y_RATIO,
  KIT_1_X_RATIO,
  KIT_2_X_RATIO,
  STOP_BUTTON_SIZE_RATIO,
  CLICK_THRESHOLD,
} from '../config';

export default function GrooveCanvas() {
  const [bpm,    setBpm]    = useState(DEFAULT_BPM);
  const [paused, setPaused] = useState(true);
  const [dimensions, setDimensions]   = useState(null);
  const [pizzasReady, setPizzasReady] = useState(false);

  // Per-pizza slider state — drives pizza.updateState() on change
  const [pizza1Config, setPizza1Config] = useState({ slices: DEFAULT_NUM_SLICES, teeth: DEFAULT_NUM_TEETH, rotation: 0 });
  const [pizza2Config, setPizza2Config] = useState({ slices: DEFAULT_NUM_SLICES, teeth: DEFAULT_NUM_TEETH, rotation: 0 });

  // Step state — source of truth for which beats are active
  const [pizza1Steps, setPizza1Steps] = useState(() => makeEmptySteps(DEFAULT_NUM_SLICES));
  const [pizza2Steps, setPizza2Steps] = useState(() => makeEmptySteps(DEFAULT_NUM_SLICES));

  // Refs mirror step state so the sequencer's setInterval always reads current values
  const pizza1StepsRef = useRef(pizza1Steps);
  const pizza2StepsRef = useRef(pizza2Steps);
  useEffect(() => { pizza1StepsRef.current = pizza1Steps; }, [pizza1Steps]);
  useEffect(() => { pizza2StepsRef.current = pizza2Steps; }, [pizza2Steps]);

  // Kit selector state
  const [kit1, setKit1] = useState(KIT_OPTIONS[0]);
  const [kit2, setKit2] = useState(KIT_OPTIONS[1]);

  const pizza1Ref      = useRef(null);
  const pizza2Ref      = useRef(null);
  const onTeethChangeRef = useRef(() => {});
  const svgRef           = useRef(null);
  const isDraggingRef    = useRef(false);
  const draggedDotsRef   = useRef(new Set());

  // -- Measure window on mount and resize ----------------------------------
  useEffect(() => {
    const update = () => setDimensions(computeDimensions(window.innerWidth, window.innerHeight));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // -- Spacebar toggles play/pause -----------------------------------------
  useEffect(() => {
    const onKey = (e) => {
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

    pizza1Ref.current = new PizzaSequencer({
      name: 'pizza1',
      x: PIZZA_1_POSITION.x * appWidth,
      y: PIZZA_1_POSITION.y * appHeight,
      numSteps: DEFAULT_NUM_SLICES, toothSliderValue: DEFAULT_NUM_TEETH,
      color: PIZZA_1_COLOR, drumSamples: KIT_MAP[KIT_OPTIONS[0]],
      appWidth,
      onTeethChange: stableCallback,
    });
    pizza2Ref.current = new PizzaSequencer({
      name: 'pizza2',
      x: PIZZA_2_POSITION.x * appWidth,
      y: PIZZA_2_POSITION.y * appHeight,
      numSteps: DEFAULT_NUM_SLICES, toothSliderValue: DEFAULT_NUM_TEETH,
      color: PIZZA_2_COLOR, drumSamples: KIT_MAP[KIT_OPTIONS[1]],
      appWidth,
      onTeethChange: stableCallback,
    });
    setPizzasReady(true);
  }, [dimensions]);

  // -- Propagate slider changes to pizza timing/geometry state -------------
  useEffect(() => { pizza1Ref.current?.updateState(pizza1Config); }, [pizza1Config]);
  useEffect(() => { pizza2Ref.current?.updateState(pizza2Config); }, [pizza2Config]);

  // -- Propagate kit changes to pizza drumSamples -------------------------
  useEffect(() => {
    if (pizza1Ref.current) pizza1Ref.current.drumSamples = KIT_MAP[kit1];
  }, [kit1]);
  useEffect(() => {
    if (pizza2Ref.current) pizza2Ref.current.drumSamples = KIT_MAP[kit2];
  }, [kit2]);

  // -- Audio sequencer hook ------------------------------------------------
  const { onTeethChange } = useSequencer({
    bpm, paused, pizza1Ref, pizza2Ref, pizza1StepsRef, pizza2StepsRef,
  });
  useEffect(() => { onTeethChangeRef.current = onTeethChange; }, [onTeethChange]);

  // -- 60fps animation loop while playing ----------------------------------
  useAnimationLoop(!paused);

  // -------------------------------------------------------------------------
  if (!dimensions || !pizzasReady) return null;

  const { appWidth, appHeight } = dimensions;
  const trans    = appWidth / 2;
  const p1       = pizza1Ref.current;
  const p2       = pizza2Ref.current;
  const lcm      = lcm_two_numbers(p1.numTeeth, p2.numTeeth);
  const timeUnit = (60 / bpm) / 4;

  // Keep timing values in sync each render
  [p1, p2].forEach((pizza) => {
    pizza.loopTime      = timeUnit * pizza.numTeeth;
    pizza.stepTime      = pizza.loopTime / pizza.slices;
    pizza.stepNoteValue = (timeUnit * 16) / pizza.stepTime;
  });

  // Mirror rotation value for ControlTextSVG display
  p1.rotation = pizza1Config.rotation;
  p2.rotation = pizza2Config.rotation;

  // Update timeline playhead positions each render
  p1.computeTimeline(-trans + appHeight * TIMELINE_POSITIONS.PIZZA_1_Y_RATIO, lcm, appWidth);
  p2.computeTimeline(-trans + appHeight * TIMELINE_POSITIONS.PIZZA_2_Y_RATIO, lcm, appWidth);

  const syncBoth = p1.currentStep === 1 && p2.currentStep === 1;

  const anchors1 = computeSliderAnchors(PIZZA_1_POSITION.x, appWidth, appHeight);
  const anchors2 = computeSliderAnchors(PIZZA_2_POSITION.x, appWidth, appHeight);

  // Screen-space slider positions (relative to the wrapper div)
  const sliderW   = Math.ceil(appWidth * SLIDER_WIDTH_RATIO);
  const sliders1  = {
    x:       anchors1.slidersX + trans,
    rotateX: anchors1.rotateX  + trans,
    sliceY:  anchors1.sliceY   + trans - SLIDER_THUMB_OFFSET,
    toothY:  anchors1.toothY   + trans - SLIDER_THUMB_OFFSET,
    rotateY: anchors1.rotateY  + trans - SLIDER_THUMB_OFFSET,
  };
  const sliders2  = {
    x:       anchors2.slidersX + trans,
    rotateX: anchors2.rotateX  + trans,
    sliceY:  anchors1.sliceY   + trans - SLIDER_THUMB_OFFSET,  // same y as pizza1
    toothY:  anchors1.toothY   + trans - SLIDER_THUMB_OFFSET,
    rotateY: anchors1.rotateY  + trans - SLIDER_THUMB_OFFSET,
  };

  const kitStyle = {
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

  // -- Event handlers ------------------------------------------------------
  const handleClear = () => {
    setPizza1Steps(makeEmptySteps(pizza1Config.slices));
    setPizza2Steps(makeEmptySteps(pizza2Config.slices));
  };

  const handleP1SlicesChange = (e) => {
    const n = Number(e.target.value);
    setPizza1Config(c => ({ ...c, slices: n }));
    setPizza1Steps(prev => resizeSteps(prev, n));
  };
  const handleP1RotationChange = (e) => {
    const newRot = Number(e.target.value);
    const delta  = newRot - pizza1Config.rotation;
    setPizza1Config(c => ({ ...c, rotation: newRot }));
    if (delta !== 0) setPizza1Steps(prev => rotateStepsRight(prev, delta));
  };
  const handleP2SlicesChange = (e) => {
    const n = Number(e.target.value);
    setPizza2Config(c => ({ ...c, slices: n }));
    setPizza2Steps(prev => resizeSteps(prev, n));
  };
  const handleP2RotationChange = (e) => {
    const newRot = Number(e.target.value);
    const delta  = newRot - pizza2Config.rotation;
    setPizza2Config(c => ({ ...c, rotation: newRot }));
    if (delta !== 0) setPizza2Steps(prev => rotateStepsRight(prev, delta));
  };

  const getSVGCoords = (clientX, clientY) => {
    if (!svgRef.current) return null;
    const rect   = svgRef.current.getBoundingClientRect();
    const scaleX = appWidth  / rect.width;
    const scaleY = appHeight / rect.height;
    return {
      x: (clientX - rect.left) * scaleX - trans,
      y: (clientY - rect.top)  * scaleY - trans,
    };
  };

  const tryToggleDot = (gX, gY) => {
    const threshold = p1.pizzaDiam * CLICK_THRESHOLD;
    const t2 = threshold * threshold;
    [p1, p2].forEach((pizza, pizzaIdx) => {
      pizza.stepAngles.forEach((angle, stepIdx) => {
        pizza.buttonPosArr.forEach((pos, ringIdx) => {
          const [cx, cy] = pointRadial(angle * Math.PI / 180, pos * pizza.pizzaDiam);
          const dx = gX - (pizza.position.x + cx);
          const dy = gY - (pizza.position.y + cy);
          if (dx * dx + dy * dy < t2) {
            const key = `${pizzaIdx}-${ringIdx}-${stepIdx}`;
            if (!draggedDotsRef.current.has(key)) {
              draggedDotsRef.current.add(key);
              const setter = pizzaIdx === 0 ? setPizza1Steps : setPizza2Steps;
              setter(prev => {
                const next = prev.map(ring => [...ring]);
                next[ringIdx][stepIdx] = next[ringIdx][stepIdx] === 0 ? COLORS.GREY : 0;
                return next;
              });
            }
          }
        });
      });
    });
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDraggingRef.current    = true;
    draggedDotsRef.current   = new Set();
    svgRef.current?.setPointerCapture(e.pointerId);
    const coords = getSVGCoords(e.clientX, e.clientY);
    if (coords) tryToggleDot(coords.x, coords.y);
  };
  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const coords = getSVGCoords(e.clientX, e.clientY);
    if (coords) tryToggleDot(coords.x, coords.y);
  };
  const handlePointerUp = () => {
    isDraggingRef.current  = false;
    draggedDotsRef.current = new Set();
  };

  // -- Slider styles --------------------------------------------------------
  const [r1, g1, b1] = PIZZA_1_COLOR;
  const [r2, g2, b2] = PIZZA_2_COLOR;

  const sliderBase    = { position: 'absolute', width: sliderW, margin: 0, padding: 0 };
  const sliceSlider   = { ...sliderBase, '--pizza-color': 'rgb(170,170,170)' };
  const teethSlider   = { ...sliderBase, '--pizza-color': 'rgb(255,255,255)' };
  const rotate1Slider = { ...sliderBase, '--pizza-color': `rgb(${r1},${g1},${b1})` };
  const rotate2Slider = { ...sliderBase, '--pizza-color': `rgb(${r2},${g2},${b2})` };
  const bpmSlider     = { ...sliderBase, '--pizza-color': 'rgb(170,170,170)',
                           left: appWidth * BPM_SLIDER_X_RATIO, top: appHeight * BPM_SLIDER_Y_RATIO,
                           width: Math.ceil(appWidth * SLIDER_WIDTH_RATIO) };

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

            <PizzaFaceSVG pizza={p1} steps={pizza1Steps} appWidth={appWidth} syncWithOther={syncBoth} />
            <PizzaFaceSVG pizza={p2} steps={pizza2Steps} appWidth={appWidth} syncWithOther={syncBoth} />

            <TimelineSVG pizza={p1} lcm={lcm} appWidth={appWidth} appHeight={appHeight} showPatternInfo />
            <TimelineSVG pizza={p2} lcm={lcm} appWidth={appWidth} appHeight={appHeight} />

            <ControlTextSVG pizza={p1} anchors={anchors1} timeUnit={timeUnit} appWidth={appWidth} appHeight={appHeight} />
            <ControlTextSVG pizza={p2} anchors={anchors2} timeUnit={timeUnit} appWidth={appWidth} appHeight={appHeight} />

            <StepRatioSVG pizzas={[p1, p2]} anchors={[anchors1, anchors2]} appWidth={appWidth} />

            <BPMTextSVG bpm={bpm} appWidth={appWidth} appHeight={appHeight} />

          </g>
        </svg>

        {/* Pizza 1 sliders */}
        <input type="range" min={SLICES_MIN} max="16" value={pizza1Config.slices}
          style={{ ...sliceSlider,   left: sliders1.x,       top: sliders1.sliceY  }} onChange={handleP1SlicesChange} />
        <input type="range" min={SLICES_MIN} max="16" value={pizza1Config.teeth}
          style={{ ...teethSlider,   left: sliders1.x,       top: sliders1.toothY  }} onChange={e => setPizza1Config(c => ({ ...c, teeth: Number(e.target.value) }))} />
        <input type="range" min="0"          max="16" value={pizza1Config.rotation}
          style={{ ...rotate1Slider, left: sliders1.rotateX, top: sliders1.rotateY }} onChange={handleP1RotationChange} />

        {/* Pizza 2 sliders */}
        <input type="range" min={SLICES_MIN} max="16" value={pizza2Config.slices}
          style={{ ...sliceSlider,   left: sliders2.x,       top: sliders2.sliceY  }} onChange={handleP2SlicesChange} />
        <input type="range" min={SLICES_MIN} max="16" value={pizza2Config.teeth}
          style={{ ...teethSlider,   left: sliders2.x,       top: sliders2.toothY  }} onChange={e => setPizza2Config(c => ({ ...c, teeth: Number(e.target.value) }))} />
        <input type="range" min="0"          max="16" value={pizza2Config.rotation}
          style={{ ...rotate2Slider, left: sliders2.rotateX, top: sliders2.rotateY }} onChange={handleP2RotationChange} />

        {/* BPM slider */}
        <input type="range" min={BPM_MIN} max={BPM_MAX} value={bpm}
          style={bpmSlider} onChange={e => setBpm(Number(e.target.value))} />

        {/* Kit selectors */}
        <select value={kit1}
          style={{ ...kitStyle, left: appWidth * KIT_1_X_RATIO, color: `rgb(${r1},${g1},${b1})`, background: `rgba(${r1},${g1},${b1},0.2)` }}
          onChange={e => setKit1(e.target.value)}>
          {KIT_OPTIONS.map(k => <option key={k}>{k}</option>)}
        </select>
        <select value={kit2}
          style={{ ...kitStyle, left: appWidth * KIT_2_X_RATIO, color: `rgb(${r2},${g2},${b2})`, background: `rgba(${r2},${g2},${b2},0.2)` }}
          onChange={e => setKit2(e.target.value)}>
          {KIT_OPTIONS.map(k => <option key={k}>{k}</option>)}
        </select>

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
