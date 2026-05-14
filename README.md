# Groove Pizzeria

A polyrhythm and polymeter sequencer visualized as two rotating pizza wheels. Each pizza is an independent step sequencer — different step counts and time-unit (tooth) counts produce rhythmic ratios and phasing patterns in real time.

## Background and Musical Context

Groove Pizzeria is a re-implementation of the prototype web app of the same name that I built for my NYU Music Technology Master's thesis. It's a remix of NYU MusEDLab's [Groove Pizza](https://apps.musedlab.org/groovepizza/) — a single circular drum machine based on the idea of a *rhythm necklace*, where a looping rhythm is laid out around a circle and each onset becomes a point on the perimeter. Where Groove Pizza gives you one circle with three concentric tracks (kick / snare / hat), Groove Pizzeria gives you two such circles side-by-side, and lets each one have its own number of steps *and* its own subdivision length. That second axis is what makes polyrhythm and polymeter possible in a single interface.

### On Polyrhythm vs. Polymeter

Polyrhythm and polymeter are often used interchangeably, but they're distinct ideas. Here's my working definition:

- **Polyrhythm**: two loops of the *same total duration* with *different* numbers of evenly-spaced onsets, where those onset counts don't divide evenly into each other (e.g. 5 against 4, 11 against 5).
- **Polymeter**: two loops of *different* total duration whose subdivisions are the *same* length but whose onset counts differ.

In Groove Pizzeria's terms: change only the step count and you get polyrhythm; change the time-unit count too and you get polymeter.

If any of this is interesting, Ethan Hein's article[The Groove Pizzeria](https://www.ethanhein.com/wp/2019/the-groove-pizzeria/) gets into greater detail and really fleshes out what I was trying to accomplish with this tool as a learning aid and an instrument.

## Features

- Two independent sequencers with configurable steps, time units, and step rotation
- Beat activation by clicking or drag-painting over the dot grid on each pizza
- Active beats form highlighted polygons showing the rhythmic pattern shape
- Synchronized timeline showing how many loop repetitions it takes for both pizzas to realign
- Three rings per pizza (hi, mid, low) mapped to a selectable drum kit
- WebMIDI output support (Chrome only) — route to a DAW via the IAC bus on macOS
- BPM control — spacebar or the play button starts and stops playback

## Tech Stack

- **React 19** — UI and state management
- **D3** — polar coordinate geometry (`d3.pointRadial`, `d3.line`) for the SVG rendering
- **Web Audio API** — sample-based audio scheduling with lookahead
- **WebMIDI** — MIDI note output via the `webmidi` library
- **Vite + Tailwind CSS** — build tooling and styling

## Getting Started

```bash
yarn install
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in a browser.

## Project Structure

```
src/
  PizzaSequencer.js     # Audio-only sequencer class — timing, step advancement, note scheduling
  audio.js              # Web Audio + WebMIDI engine — sample loading and playback
  config.js             # All constants — BPM, sizing ratios, kit mappings, sample paths
  index.jsx             # App entry point
  index.css             # Global styles and range-input theming
  components/
    GrooveCanvas.jsx    # Root component — owns all state, wires sequencer to SVG
    PizzaFaceSVG.jsx    # One pizza face — spokes, step dots, active-beat polygons, teeth, playhead
    TimelineSVG.jsx     # Sync timeline strip — tick marks, loop boundaries, moving playhead
    ControlTextSVG.jsx  # Per-pizza slider labels — slice count, tooth count, rotation
    BPMTextSVG.jsx      # Global BPM readout
    StepRatioSVG.jsx    # Cross-pizza step ratio display (prop-driven, scales to N pizzas)
  hooks/
    useSequencer.js     # Audio scheduling loop — fires sounds via Web Audio lookahead
    useAnimationLoop.js # ~60fps re-render loop via requestAnimationFrame
  utils/
    audioContext.js     # Singleton AudioContext (one instance shared across the app)
    math.js             # lcm / gcd utilities
    steps.js            # Pure step-state helpers — create, resize, rotate step arrays
    dimensions.js       # Responsive canvas sizing and slider anchor coordinate math
```

## Credits and Acknowledgments

- The original Groove Pizzeria prototype was built by [Tyler Bisson](https://tylerbisson.com/) as his NYU music technology master's thesis.
- It extends [Groove Pizza](https://apps.musedlab.org/groovepizza/), which began as [Ethan Hein](https://www.ethanhein.com/wp/)'s 2013 NYU masters thesis and was then developed into a production tool under NYU's MusEDLab umbrella — co-developed with Adam November and a broader team. Both projects draw on the rhythm-necklace tradition popularized by Godfried Toussaint.
- Thanks to Ethan for [his writeup of Groove Pizzeria](https://www.ethanhein.com/wp/2019/the-groove-pizzeria/) and his ongoing support of this project. 