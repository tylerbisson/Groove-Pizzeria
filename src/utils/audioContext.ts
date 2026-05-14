/**
 * AudioContext singleton
 *
 * Returns the shared AudioContext instance, creating it on first call.
 * webkitAudioContext is included for Safari compatibility.
 * A singleton is required because browsers limit the number of concurrent
 * AudioContext instances and warn when more than one is created.
 */

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

let audioContextInstance: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContextInstance) {
    const AudioCtx = window.AudioContext ?? window.webkitAudioContext!;
    audioContextInstance = new AudioCtx();
  }
  return audioContextInstance;
}
