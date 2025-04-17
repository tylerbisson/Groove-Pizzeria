import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import for React 18
import App from './components/App';
import './control_text';
import './pizzaFace';
import './sound';
import './draw';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

document.addEventListener("DOMContentLoaded", () => {
  const playStopButton = document.getElementById("play-stop");
  playStopButton.disabled = true; // Disable the button initially

  const checkInitialization = setInterval(() => {
    if (typeof bpmSlider !== "undefined" && bpmSlider !== null) {
      playStopButton.disabled = false; // Enable the button once bpmSlider is initialized
      clearInterval(checkInitialization); // Stop checking once initialized
    }
  }, 100); // Check every 100ms
});