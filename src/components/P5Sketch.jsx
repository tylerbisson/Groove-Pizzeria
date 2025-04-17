import React, { useRef, useState } from 'react';
import useP5Sketch from '../utils/useP5Sketch';

const P5Sketch = () => {
  const [bpm, setBpm] = useState(120);
  const [paused, setPaused] = useState(true);
  const sketchRef = useRef(null);

  // Call the useP5Sketch hook directly in the component body
  useP5Sketch({ bpm, paused, sketchRef });

  const handlePlayPause = () => {
    setPaused((prev) => !prev);
  };

  const handleClear = () => {
    console.log('Clear button clicked');
    // Add logic to reset pizzas if needed
  };

  return (
    <div ref={sketchRef}>
      <button onClick={handlePlayPause} className={paused ? 'play' : 'stop'}>
        {paused ? 'Play' : 'Pause'}
      </button>
      <button onClick={handleClear}>Clear</button>
      <div style={{ position: 'absolute', top: '0%', right: '10%', textAlign: 'center' }}>
        <input
          type="range"
          min="20"
          max="300"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
        />
        <div style={{ marginTop: '5px', fontSize: '14px', color: '#333' }}>
          BPM: {bpm}
        </div>
      </div>
      <style>
        {`
          .play, .stop {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 10;
            padding: 10px 20px;
            background-color: #007BFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }

          .play:hover, .stop:hover {
            background-color: #0056b3;
          }

          button:focus {
            outline: none;
          }
        `}
      </style>
    </div>
  );
};

export default P5Sketch;