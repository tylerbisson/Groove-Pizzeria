import React, { useRef, useState, useEffect } from 'react';
import PizzaFace, { cosDeg, sinDeg } from '../pizzaFace';
import PizzaFaceSVG, {
  TimelineSVG,
  ControlTextSVG,
  BPMTextSVG,
  StepRatioSVG,
  computeSliderAnchors,
} from './PizzaFaceSVG';
import { useSequencer } from '../utils/useSequencer';
import { useAnimationLoop } from '../utils/useAnimationLoop';
import { lcm_two_numbers } from '../utils/math';
import {
  PIZZA_1_POSITION,
  PIZZA_2_POSITION,
  PIZZA_1_COLOR,
  PIZZA_2_COLOR,
  TIMELINE_POSITIONS,
  DEFAULT_BPM,
  COLORS,
} from '../config';

// ---------------------------------------------------------------------------
// Kit mapping
// ---------------------------------------------------------------------------
const KIT_MAP = {
  '909 kick, clap, hat':   [1, 2, 3],
  '808 pitched bongos':    [4, 5, 6],
  'wood':                  [7, 8, 9],
  'concrete':              [10, 11, 12],
  'midi out (chrome only)': [13, 14, 15],
};
const KIT_OPTIONS = Object.keys(KIT_MAP);

// ---------------------------------------------------------------------------
// Step state helpers
// ---------------------------------------------------------------------------
const makeEmptySteps = (n) => Array(3).fill(null).map(() => Array(n).fill(COLORS.GREY));

const resizeSteps = (steps, n) => steps.map(ring =>
  ring.length < n
    ? [...ring, ...Array(n - ring.length).fill(COLORS.GREY)]
    : ring.slice(0, n)
);

// Rotate step pattern right by n positions (matches original rotateShapes behaviour).
const rotateStepsRight = (steps, n) => steps.map(ring => {
  const len = ring.length;
  if (len === 0 || n === 0) return ring;
  const d = ((n % len) + len) % len;
  return [...ring.slice(len - d), ...ring.slice(0, len - d)];
});

// ---------------------------------------------------------------------------
// Dimension helper — matches original aspect-ratio breakpoints
// ---------------------------------------------------------------------------
function computeDimensions(windowWidth, windowHeight) {
  let appWidth, appHeight;
  if (windowWidth / windowHeight <= 1.9) {
    appWidth  = windowWidth * 0.92;
    appHeight = appWidth * 0.573;
  } else if (windowHeight / windowWidth <= 0.6) {
    appHeight = windowHeight * 0.96;
    appWidth  = appHeight * 1.742;
  } else {
    appWidth  = 0.859 * windowWidth;
    appHeight = appWidth * (35 / 61);
  }
  return { appWidth, appHeight };
}

// ---------------------------------------------------------------------------
// GrooveCanvas
// ---------------------------------------------------------------------------
export default function GrooveCanvas() {
  const [bpm,    setBpm]    = useState(DEFAULT_BPM);
  const [paused, setPaused] = useState(true);
  const [dimensions, setDimensions]  = useState(null);
  const [pizzasReady, setPizzasReady] = useState(false);

  // Per-pizza slider state — drives pizza.updateState() on change
  const [pizza1Config, setPizza1Config] = useState({ slices: 16, teeth: 16, rotation: 0 });
  const [pizza2Config, setPizza2Config] = useState({ slices: 16, teeth: 16, rotation: 0 });

  // Step state — source of truth for which beats are active
  const [pizza1Steps, setPizza1Steps] = useState(() => makeEmptySteps(16));
  const [pizza2Steps, setPizza2Steps] = useState(() => makeEmptySteps(16));

  // Refs mirror step state so the sequencer's setInterval always reads current values
  const pizza1StepsRef = useRef(pizza1Steps);
  const pizza2StepsRef = useRef(pizza2Steps);
  useEffect(() => { pizza1StepsRef.current = pizza1Steps; }, [pizza1Steps]);
  useEffect(() => { pizza2StepsRef.current = pizza2Steps; }, [pizza2Steps]);

  // Kit selector state
  const [kit1, setKit1] = useState('909 kick, clap, hat');
  const [kit2, setKit2] = useState('808 pitched bongos');

  const pizza1Ref = useRef(null);
  const pizza2Ref = useRef(null);
  const sketchUpdateBPMRef = useRef(() => {});
  const svgRef = useRef(null);
  const isDraggingRef = useRef(false);
  const draggedDotsRef = useRef(new Set());

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

  // -- Initialise PizzaFace instances once dimensions are known ------------
  useEffect(() => {
    if (!dimensions) return;
    const { appWidth, appHeight } = dimensions;
    const stableCallback = () => sketchUpdateBPMRef.current();

    pizza1Ref.current = new PizzaFace({
      name: 'pizza',
      x: PIZZA_1_POSITION.x * appWidth,
      y: PIZZA_1_POSITION.y * appHeight,
      numSteps: 16, toothSliderValue: 16,
      color: PIZZA_1_COLOR, drumSamples: [1, 2, 3],
      appWidth, appHeight,
      sketchUpdateBPM: stableCallback,
    });
    pizza2Ref.current = new PizzaFace({
      name: 'pizza2',
      x: PIZZA_2_POSITION.x * appWidth,
      y: PIZZA_2_POSITION.y * appHeight,
      numSteps: 16, toothSliderValue: 16,
      color: PIZZA_2_COLOR, drumSamples: [4, 5, 6],
      appWidth, appHeight,
      sketchUpdateBPM: stableCallback,
    });
    setPizzasReady(true);
  }, [dimensions]);

  // -- Propagate slider changes to pizza timing/geometry state -------------
  useEffect(() => {
    pizza1Ref.current?.updateState(pizza1Config);
  }, [pizza1Config]);

  useEffect(() => {
    pizza2Ref.current?.updateState(pizza2Config);
  }, [pizza2Config]);

  // -- Propagate kit changes to pizza drumSamples -------------------------
  useEffect(() => {
    if (pizza1Ref.current) pizza1Ref.current.drumSamples = KIT_MAP[kit1];
  }, [kit1]);

  useEffect(() => {
    if (pizza2Ref.current) pizza2Ref.current.drumSamples = KIT_MAP[kit2];
  }, [kit2]);

  // -- Audio sequencer -----------------------------------------------------
  const { sketchUpdateBPM } = useSequencer({
    bpm, paused, pizza1Ref, pizza2Ref, pizza1StepsRef, pizza2StepsRef,
  });
  useEffect(() => { sketchUpdateBPMRef.current = sketchUpdateBPM; }, [sketchUpdateBPM]);

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
    pizza.loopTime  = timeUnit * pizza.numTeeth;
    pizza.stepTime  = pizza.loopTime / pizza.slices;
    pizza.stepFrac  = (timeUnit * 16) / pizza.stepTime;
  });

  // Mirror rotation value for ControlTextSVG display
  p1.rotation = pizza1Config.rotation;
  p2.rotation = pizza2Config.rotation;

  // Update timeline playhead positions each render
  p1.computeTimeline(-trans + appHeight * TIMELINE_POSITIONS.PIZZA_1_Y_RATIO, lcm, appWidth);
  p2.computeTimeline(-trans + appHeight * TIMELINE_POSITIONS.PIZZA_2_Y_RATIO, lcm, appWidth);

  const syncBoth = p1.stepIteratorVar === 1 && p2.stepIteratorVar === 1;

  // Slider anchor positions (translated-g space) — mirror original p5 math
  const anchors1 = computeSliderAnchors(PIZZA_1_POSITION.x, appWidth, appHeight);
  const anchors2 = computeSliderAnchors(PIZZA_2_POSITION.x, appWidth, appHeight);

  // Screen-space slider positions (relative to the SVG / wrapper div)
  const sliderW  = Math.ceil(appWidth * 0.0842);
  const sliders1 = {
    x:        anchors1.slidersX + trans,
    rotateX:  anchors1.rotateX  + trans,
    sliceY:   anchors1.sliceY   + trans - 3.5,
    toothY:   anchors1.toothY   + trans - 3.5,
    rotateY:  anchors1.rotateY  + trans - 3.5,
  };
  const sliders2 = {
    x:        anchors2.slidersX + trans,
    rotateX:  anchors2.rotateX  + trans,
    sliceY:   anchors1.sliceY   + trans - 3.5,  // same y as pizza1
    toothY:   anchors1.toothY   + trans - 3.5,
    rotateY:  anchors1.rotateY  + trans - 3.5,
  };

  // Kit dropdown positions (screen-space, matching original .position() calls)
  const kitY     = appHeight * 0.087;
  const kit1X    = appWidth * 0.35;
  const kit2X    = appWidth * 0.575;
  const kitStyle = {
    position: 'absolute',
    top: kitY,
    fontFamily: 'Lekton',
    fontSize: Math.ceil(appWidth * 0.0101),
    height:   Math.ceil(appWidth * 0.0126),
    paddingLeft:  Math.ceil(appWidth * 0.0084),
    paddingRight: Math.ceil(appWidth * 0.0084),
    borderRadius: '0.5em',
    border: 'none',
    appearance: 'none',
    cursor: 'pointer',
  };

  // Play button size (CSS triangle)
  const pbSize = Math.ceil(appWidth * 0.0253);
  const pbLong = Math.ceil(appWidth * 0.0438);

  const handleClear = () => {
    setPizza1Steps(makeEmptySteps(pizza1Config.slices));
    setPizza2Steps(makeEmptySteps(pizza2Config.slices));
  };

  // -- Slice / rotation change handlers ------------------------------------
  const handleP1SlicesChange = (e) => {
    const n = Number(e.target.value);
    setPizza1Config(c => ({ ...c, slices: n }));
    setPizza1Steps(prev => resizeSteps(prev, n));
  };
  const handleP1RotationChange = (e) => {
    const newRot = Number(e.target.value);
    const delta = newRot - pizza1Config.rotation;
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
    const delta = newRot - pizza2Config.rotation;
    setPizza2Config(c => ({ ...c, rotation: newRot }));
    if (delta !== 0) setPizza2Steps(prev => rotateStepsRight(prev, delta));
  };

  // -- SVG-level pointer handling (click + drag over dots) -----------------
  const getSVGCoords = (clientX, clientY) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = appWidth / rect.width;
    const scaleY = appHeight / rect.height;
    return {
      x: (clientX - rect.left) * scaleX - trans,
      y: (clientY - rect.top)  * scaleY - trans,
    };
  };

  const tryToggleDot = (gX, gY) => {
    const threshold = p1.pizzaDiam * 0.13;
    const t2 = threshold * threshold;
    [p1, p2].forEach((pizza, pizzaIdx) => {
      pizza.stepAngles.forEach((angle, stepIdx) => {
        pizza.buttonPosArr.forEach((pos, ringIdx) => {
          const dx = gX - (pizza.position.x + pos * pizza.pizzaDiam * cosDeg(angle - 90));
          const dy = gY - (pizza.position.y + pos * pizza.pizzaDiam * sinDeg(angle - 90));
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
    isDraggingRef.current = true;
    draggedDotsRef.current = new Set();
    svgRef.current?.setPointerCapture(e.pointerId);
    const pt = getSVGCoords(e.clientX, e.clientY);
    if (pt) tryToggleDot(pt.x, pt.y);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const pt = getSVGCoords(e.clientX, e.clientY);
    if (pt) tryToggleDot(pt.x, pt.y);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    draggedDotsRef.current = new Set();
  };

  const [r1, g1, b1] = PIZZA_1_COLOR;
  const [r2, g2, b2] = PIZZA_2_COLOR;

  const sliderBase   = { position: 'absolute', width: sliderW, margin: 0, padding: 0 };
  const sliceSlider  = { ...sliderBase, '--pizza-color': 'rgb(170,170,170)' };
  const teethSlider  = { ...sliderBase, '--pizza-color': 'rgb(255,255,255)' };
  const rotate1Slider = { ...sliderBase, '--pizza-color': `rgb(${r1},${g1},${b1})` };
  const rotate2Slider = { ...sliderBase, '--pizza-color': `rgb(${r2},${g2},${b2})` };
  const bpmSlider    = { '--pizza-color': 'rgb(170,170,170)', position: 'absolute', margin: 0, padding: 0, width: Math.ceil(appWidth * 0.0842) };

  return (
    <div style={{ background: 'rgb(211,227,223)', width: '100vw', height: '100vh', overflow: 'hidden', userSelect: 'none' }}>

      {/* ---- Wrapper sized to the SVG canvas so absolute children align ---- */}
      <div style={{ position: 'relative', width: appWidth, height: appHeight,
                    margin: '0 auto' }}>

        {/* ---- SVG canvas ------------------------------------------------- */}
        <svg ref={svgRef} width={appWidth} height={appHeight} style={{ display: 'block' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}>
          <g transform={`translate(${trans},${trans})`}>
            <PizzaFaceSVG pizza={p1} steps={pizza1Steps} appWidth={appWidth} appHeight={appHeight} syncWithOther={syncBoth} />
            <PizzaFaceSVG pizza={p2} steps={pizza2Steps} appWidth={appWidth} appHeight={appHeight} syncWithOther={syncBoth} />

            <TimelineSVG pizza={p1} lcm={lcm} appWidth={appWidth} appHeight={appHeight} showPatternInfo />
            <TimelineSVG pizza={p2} lcm={lcm} appWidth={appWidth} appHeight={appHeight} />

            <ControlTextSVG pizza={p1} anchors={anchors1} timeUnit={timeUnit}
              appWidth={appWidth} appHeight={appHeight} />
            <ControlTextSVG pizza={p2} anchors={anchors2} timeUnit={timeUnit}
              appWidth={appWidth} appHeight={appHeight} />

            <StepRatioSVG pizza1={p1} pizza2={p2}
              anchors1={anchors1} anchors2={anchors2} appWidth={appWidth} />

            <BPMTextSVG bpm={bpm} appWidth={appWidth} appHeight={appHeight} />
          </g>
        </svg>

        {/* ---- Pizza 1 sliders -------------------------------------------- */}
        <input type="range" min="2"  max="16" value={pizza1Config.slices}
          style={{ ...sliceSlider,   left: sliders1.x,       top: sliders1.sliceY }}
          onChange={handleP1SlicesChange} />
        <input type="range" min="2"  max="16" value={pizza1Config.teeth}
          style={{ ...teethSlider,   left: sliders1.x,       top: sliders1.toothY }}
          onChange={e => setPizza1Config(c => ({ ...c, teeth: Number(e.target.value) }))} />
        <input type="range" min="0"  max="16" value={pizza1Config.rotation}
          style={{ ...rotate1Slider, left: sliders1.rotateX, top: sliders1.rotateY }}
          onChange={handleP1RotationChange} />

        {/* ---- Pizza 2 sliders -------------------------------------------- */}
        <input type="range" min="2"  max="16" value={pizza2Config.slices}
          style={{ ...sliceSlider,   left: sliders2.x,       top: sliders2.sliceY }}
          onChange={handleP2SlicesChange} />
        <input type="range" min="2"  max="16" value={pizza2Config.teeth}
          style={{ ...teethSlider,   left: sliders2.x,       top: sliders2.toothY }}
          onChange={e => setPizza2Config(c => ({ ...c, teeth: Number(e.target.value) }))} />
        <input type="range" min="0"  max="16" value={pizza2Config.rotation}
          style={{ ...rotate2Slider, left: sliders2.rotateX, top: sliders2.rotateY }}
          onChange={handleP2RotationChange} />

        {/* ---- BPM slider ------------------------------------------------- */}
        <input type="range" min="20" max="300" value={bpm}
          style={{ ...bpmSlider, left: appWidth * 0.889, top: appHeight * 0.015 }}
          onChange={e => setBpm(Number(e.target.value))} />

        {/* ---- Kit selectors ---------------------------------------------- */}
        <select className="left-kit" value={kit1}
          style={{ ...kitStyle, left: kit1X, color: `rgb(${r1},${g1},${b1})`,
                   background: `rgba(${r1},${g1},${b1},0.2)` }}
          onChange={e => setKit1(e.target.value)}>
          {KIT_OPTIONS.map(k => <option key={k}>{k}</option>)}
        </select>
        <select className="right-kit" value={kit2}
          style={{ ...kitStyle, left: kit2X, color: `rgb(${r2},${g2},${b2})`,
                   background: `rgba(${r2},${g2},${b2},0.2)` }}
          onChange={e => setKit2(e.target.value)}>
          {KIT_OPTIONS.map(k => <option key={k}>{k}</option>)}
        </select>

        {/* ---- Clear button ----------------------------------------------- */}
        <button id="clear" onClick={handleClear}
          style={{ position: 'absolute', fontFamily: 'Lekton', background: 'none',
                   border: 'none', cursor: 'pointer', right: '3.5%', top: '13%',
                   fontSize: Math.ceil(appWidth * 0.0134),
                   color: 'rgba(170,170,170,1)' }}>
          clear
        </button>

        {/* ---- Play / Pause button (CSS triangle / square) ---------------- */}
        {paused ? (
          <div className="play" onClick={() => setPaused(false)}
            style={{ position: 'absolute', top: '70%', left: '49.55%',
                     width: 0, height: 0, borderStyle: 'solid', cursor: 'pointer',
                     borderColor: `transparent transparent transparent rgba(170,170,170,1)`,
                     borderWidth: `${pbSize}px 0 ${pbSize}px ${pbLong}px` }} />
        ) : (
          <div className="stop" onClick={() => setPaused(true)}
            style={{ position: 'absolute', top: '70%', left: '48.55%', cursor: 'pointer',
                     width: Math.ceil(appWidth * 0.0505),
                     height: Math.ceil(appWidth * 0.0505),
                     background: 'rgba(170,170,170,1)' }} />
        )}

        {/* ---- Social links ----------------------------------------------- */}
        <a href="https://www.linkedin.com/in/tyler-bisson/" target="_blank" rel="noreferrer"
          style={{ position: 'absolute', left: '1%', top: '50%' }}>
          <img src="/img/linkedin.png" className="social"
            style={{ maxHeight: Math.ceil(appWidth * 0.0168), maxWidth: Math.ceil(appWidth * 0.0168) }}
            alt="LinkedIn" />
        </a>
        <a href="https://github.com/tylerbisson" target="_blank" rel="noreferrer"
          style={{ position: 'absolute', left: '1%', top: '60%' }}>
          <img src="/img/github.png" className="social"
            style={{ maxHeight: Math.ceil(appWidth * 0.0168), maxWidth: Math.ceil(appWidth * 0.0168) }}
            alt="GitHub" />
        </a>

      </div>{/* end wrapper */}
    </div>
  );
}
