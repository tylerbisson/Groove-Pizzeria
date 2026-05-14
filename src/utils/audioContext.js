/**
 * AudioContext singleton
 *
 * Returns the shared AudioContext instance, creating it on first call.
 * webkitAudioContext is included for Safari compatibility.
 * A singleton is required because browsers limit the number of concurrent
 * AudioContext instances and warn when more than one is created.
 */

let audioContextInstance = null;

export function getAudioContext() {
  if (!audioContextInstance) {
    audioContextInstance = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContextInstance;
}
