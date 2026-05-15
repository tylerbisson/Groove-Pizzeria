/**
 * Audio engine
 *
 * Manages Web Audio sample buffers and WebMIDI output. Exposes two functions:
 *   setupSounds — loads all drum samples and initialises WebMIDI (call once on play).
 *   playDrum    — schedules a sample or MIDI note at a precise AudioContext time.
 *
 * Sample indices are 1-based (matching the KIT_MAP values in config.ts).
 * Indices above NUM_DRUM_SAMPLES are routed to MIDI output.
 */
import { WebMidi } from 'webmidi';
import type { Output } from 'webmidi';
import { getAudioContext } from './utils/audioContext';
import {
  DRUM_SAMPLE_PATHS,
  NUM_DRUM_SAMPLES,
  MIDI_NOTE_START_INDEX,
  MIDI_NOTES,
  MIDI_NOTE_DURATION_MS,
} from './config';

const audioSystem: {
  buffers: AudioBuffer[];
  midiOutput: Output | null;
  loaded: boolean;
  loading: Promise<void> | null;
} = {
  buffers: [],
  midiOutput: null,
  loaded: false,
  loading: null,
};

async function initWebMidi(): Promise<void> {
  try {
    await WebMidi.enable();
    audioSystem.midiOutput = WebMidi.outputs[0] ?? null;
    if (!audioSystem.midiOutput) {
      console.warn('No MIDI output devices found');
    }
  } catch (err) {
    console.warn('WebMidi unavailable:', err);
  }
}

async function loadSample(path: string, index: number): Promise<void> {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const audioData = await response.arrayBuffer();
    audioSystem.buffers[index] = await getAudioContext().decodeAudioData(audioData);
  } catch (err) {
    console.error(`Failed to load audio sample: ${path}`, err);
  }
}

export function setupSounds(): Promise<void> {
  if (audioSystem.loaded) return Promise.resolve();
  if (audioSystem.loading) return audioSystem.loading;
  audioSystem.loading = (async () => {
    await Promise.all([
      initWebMidi(),
      ...DRUM_SAMPLE_PATHS.map((path, i) => loadSample(path, i)),
    ]);
    audioSystem.loaded = true;
    audioSystem.loading = null;
  })();
  return audioSystem.loading;
}

export function playDrum(noteTime: number, sampleNum: number): void {
  if (sampleNum >= 1 && sampleNum <= NUM_DRUM_SAMPLES) {
    const buffer = audioSystem.buffers[sampleNum - 1];
    if (!buffer) {
      console.warn(`Audio buffer ${sampleNum} not loaded`);
      return;
    }
    const source = getAudioContext().createBufferSource();
    source.buffer = buffer;
    source.connect(getAudioContext().destination);
    source.start(noteTime);
  } else if (
    sampleNum >= MIDI_NOTE_START_INDEX &&
    sampleNum < MIDI_NOTE_START_INDEX + MIDI_NOTES.length
  ) {
    if (!audioSystem.midiOutput) {
      console.warn('MIDI output not available');
      return;
    }
    const note = MIDI_NOTES[sampleNum - MIDI_NOTE_START_INDEX];
    audioSystem.midiOutput.playNote(note, { duration: MIDI_NOTE_DURATION_MS });
  }
}
