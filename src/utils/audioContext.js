let audioContextInstance = null;

export const getAudioContext = () => {
  if (!audioContextInstance) {
    audioContextInstance = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContextInstance;
};