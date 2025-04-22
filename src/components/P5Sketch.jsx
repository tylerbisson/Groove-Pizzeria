import React, { useRef, useState } from 'react';
import useP5Sketch from '../utils/useP5Sketch';
import PizzaFaceComponent from './PizzaFaceComponent';

const P5Sketch = () => {
  const [bpm, setBpm] = useState(120);
  const [paused, setPaused] = useState(true);
  const sketchRef = useRef(null);

  const [pizzaFaces, setPizzaFaces] = useState({
    pizza1: { slices: 16, teeth: 16, rotation: 0 },
    pizza2: { slices: 16, teeth: 16, rotation: 0 },
  });

  const { sketchRef: updatedSketchRef, pizzaRef, pizza2Ref } = useP5Sketch({ bpm, paused, sketchRef, pizzaFaces });

  const handlePlayPause = () => {
    setPaused((prev) => !prev);
  };

  const handleClear = () => {
    console.log('Clear button clicked');
    // Add logic to reset pizzas if needed
  };

  const handlePizzaUpdate = (name, updatedValues) => {
    setPizzaFaces((prev) => ({
      ...prev,
      [name]: { ...prev[name], ...updatedValues },
    }));
  };

  return (
    <div ref={updatedSketchRef}>
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
      <div className="relative">
        <div className="absolute top-0 left-0 w-1/5">
          <PizzaFaceComponent
            name="pizza1"
            initialSlices={pizzaFaces.pizza1.slices}
            initialTeeth={pizzaFaces.pizza1.teeth}
            initialRotation={pizzaFaces.pizza1.rotation}
            onUpdate={handlePizzaUpdate}
            pizzaRef={pizzaRef}
          />
        </div>
        <div className="absolute top-0 right-0 w-1/5">
          <PizzaFaceComponent
            name="pizza2"
            initialSlices={pizzaFaces.pizza2.slices}
            initialTeeth={pizzaFaces.pizza2.teeth}
            initialRotation={pizzaFaces.pizza2.rotation}
            onUpdate={handlePizzaUpdate}
            pizzaRef={pizza2Ref}
          />
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