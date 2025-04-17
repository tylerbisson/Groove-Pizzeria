import { WebMidi } from "webmidi";
import { getAudioContext } from './utils/globalContext';

// Initialize WebMidi
let midiOutput;
WebMidi.enable((err) => {
  if (err) {
    console.error("WebMidi could not be enabled.", err);
  } else {
    console.log("WebMidi enabled!");
    midiOutput = WebMidi.outputs[0];
  }
});

const audioContext = getAudioContext();
const buffers = [];
const samplePaths = [
  '/assets/sounds/hihat.wav', '/assets/sounds/clap.wav', '/assets/sounds/snare.wav', 
  '/assets/sounds/low.wav', '/assets/sounds/mid.wav', '/assets/sounds/hi.wav', '/assets/sounds/wood1.wav', 
  '/assets/sounds/wood2.wav', '/assets/sounds/Wood_Block_High.wav', '/assets/sounds/burp.wav',
  '/assets/sounds/noise.wav', '/assets/sounds/crunch.wav'
];

async function setupSounds() {
  const loadSound = async (path, index) => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const audioData = await response.arrayBuffer();
      console.log(`Loading audio file: ${path}`);
      buffers[index] = await audioContext.decodeAudioData(audioData);
    } catch (error) {
      console.error(`Error loading or decoding audio file: ${path}`, error);
    }
  };

  await Promise.all(samplePaths.map((path, index) => loadSound(path, index)));
}

function playDrum(noteTime, sampleNum) {
  if (sampleNum >= 1 && sampleNum <= 12) {
    const source = audioContext.createBufferSource();
    source.buffer = buffers[sampleNum - 1];
    source.connect(audioContext.destination);
    source.start(noteTime);
  } else if (sampleNum >= 13 && sampleNum <= 18 && midiOutput) {
    const notes = ["C4", "D4", "E4", "F4", "G4", "A5"];
    const note = notes[sampleNum - 13];
    midiOutput.playNote(note, "all", { duration: 1000 });
  } else {
    console.warn(`Invalid sampleNum: ${sampleNum}`);
  }
}

export { setupSounds, playDrum };