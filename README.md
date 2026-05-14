# Groove Pizzeria

A polyrhythm and polymeter sequencer visualized as two rotating pizza wheels. Each pizza is an independent step sequencer — different step counts and time-unit (tooth) counts produce rhythmic ratios and phasing patterns in real time.

## Features

- Two independent sequencers with configurable steps, time units, and step rotation
- Beat activation by clicking or drag-painting over the dot grid on each pizza
- Active beats form highlighted polygons showing the rhythmic pattern shape
- Synchronized timeline showing how many loop repetitions it takes for both pizzas to realign
- Three rings per pizza (hi, mid, low) mapped to a selectable drum kit
- WebMIDI output support (Chrome only)
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
  PizzaSequencer.js        # Audio sequencer class (timing, step advancement, note scheduling)
  audio.js                 # Web Audio + WebMIDI engine (sample loading, playback)
  config.js                # All constants — BPM, sizing ratios, kit mappings, sample paths
  index.jsx                # App entry point
  index.css                # Global styles and range-input theming
  components/
    GrooveCanvas.jsx        # Root component — owns all state and wires sequencer to SVG
    PizzaFaceSVG.jsx        # SVG rendering — pizza faces, timelines, control labels
  utils/
    audioContext.js         # Singleton AudioContext
    math.js                 # LCM / GCD utilities
    useAnimationLoop.js     # requestAnimationFrame hook (~60fps re-renders during playback)
    useSequencer.js         # Scheduling hook — drives the audio engine from React state
```
