import { WebMidi } from "webmidi";
import { getAudioContext } from './utils/globalContext';
import {
  DRUM_SAMPLE_PATHS,
  NUM_DRUM_SAMPLES,
  MIDI_NOTE_START_INDEX,
  MIDI_NOTES,
  MIDI_NOTE_DURATION_MS,
} from './config';

/**
 * Audio system state
 */
const audioSystem = {
  buffers: [],
  midiOutput: null,
  isInitialized: false,
  error: null,
};

/**
 * Initialize WebMidi with Promise-based API
 * @returns {Promise<void>}
 */
async function initWebMidi() {
  try {
    await WebMidi.enable();
    console.log("WebMidi enabled!");
    audioSystem.midiOutput = WebMidi.outputs[0];
    if (!audioSystem.midiOutput) {
      console.warn("No MIDI output devices available");
    }
  } catch (error) {
    console.warn("WebMidi could not be enabled:", error);
    audioSystem.error = error;
  }
}

/**
 * Load a single audio sample
 * @param {string} path - Path to audio file
 * @param {number} index - Buffer index
 * @returns {Promise<void>}
 */
async function loadSound(path, index) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const audioData = await response.arrayBuffer();
    const audioContext = getAudioContext();
    audioSystem.buffers[index] = await audioContext.decodeAudioData(audioData);
    console.log(`Loaded audio sample ${index + 1}/${DRUM_SAMPLE_PATHS.length}: ${path}`);
  } catch (error) {
    console.error(`Error loading audio file: ${path}`, error);
    audioSystem.error = error;
  }
}

/**
 * Initialize all audio samples and MIDI
 * @returns {Promise<void>}
 */
async function setupSounds() {
  try {
    console.log("Initializing audio system...");
    
    // Initialize WebMidi (non-blocking, errors are handled gracefully)
    await initWebMidi();
    
    // Load all audio samples in parallel
    await Promise.all(
      DRUM_SAMPLE_PATHS.map((path, index) => loadSound(path, index))
    );
    
    audioSystem.isInitialized = true;
    console.log("Audio system initialized successfully");
  } catch (error) {
    console.error("Error during audio system setup:", error);
    audioSystem.error = error;
  }
}

/**
 * Play a drum sound or MIDI note
 * @param {number} noteTime - Time to start playback (for audio context scheduling)
 * @param {number} sampleNum - Sample number (1-based index)
 */
function playDrum(noteTime, sampleNum) {
  // Play audio sample
  if (sampleNum >= 1 && sampleNum <= NUM_DRUM_SAMPLES) {
    try {
      const audioContext = getAudioContext();
      const bufferIndex = sampleNum - 1;
      
      if (!audioSystem.buffers[bufferIndex]) {
        console.warn(`Audio buffer ${sampleNum} not loaded yet`);
        return;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = audioSystem.buffers[bufferIndex];
      source.connect(audioContext.destination);
      source.start(noteTime);
    } catch (error) {
      console.error(`Error playing drum sample ${sampleNum}:`, error);
    }
  }
  // Play MIDI note
  else if (sampleNum >= MIDI_NOTE_START_INDEX && sampleNum < MIDI_NOTE_START_INDEX + MIDI_NOTES.length) {
    if (!audioSystem.midiOutput) {
      console.warn("MIDI output not available");
      return;
    }
    
    try {
      const noteIndex = sampleNum - MIDI_NOTE_START_INDEX;
      const note = MIDI_NOTES[noteIndex];
      audioSystem.midiOutput.playNote(note, "all", { duration: MIDI_NOTE_DURATION_MS });
    } catch (error) {
      console.error(`Error playing MIDI note ${sampleNum}:`, error);
    }
  }
  // Invalid sample number
  else {
    console.warn(`Invalid sampleNum: ${sampleNum}. Valid range: 1-${NUM_DRUM_SAMPLES + MIDI_NOTES.length}`);
  }
}

export { setupSounds, playDrum };