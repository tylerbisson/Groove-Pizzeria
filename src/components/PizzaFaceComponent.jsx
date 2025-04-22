import React, { useState, useEffect } from 'react';

const PizzaFaceComponent = ({ name, initialSlices, initialTeeth, initialRotation, onUpdate, pizzaRef }) => {
  const [slices, setSlices] = useState(initialSlices);
  const [teeth, setTeeth] = useState(initialTeeth);
  const [rotation, setRotation] = useState(initialRotation);

  const handleSlicesChange = (e) => {
    const value = Number(e.target.value);
    setSlices(value);
    onUpdate(name, { slices: value, teeth, rotation });
    if (pizzaRef) pizzaRef.updateState({ slices: value });
  };

  const handleTeethChange = (e) => {
    const value = Number(e.target.value);
    setTeeth(value);
    onUpdate(name, { slices, teeth: value, rotation });
    if (pizzaRef) pizzaRef.updateState({ teeth: value });
  };

  const handleRotationChange = (e) => {
    const value = Number(e.target.value);
    setRotation(value);
    onUpdate(name, { slices, teeth, rotation: value });
    if (pizzaRef) pizzaRef.updateState({ rotation: value });
  };

  return (
    <div>
      <h3>{name}</h3>
      <div>
        <label>Slices:</label>
        <input
          type="range"
          min="1"
          max="16"
          value={slices}
          onChange={handleSlicesChange}
        />
        <span>{slices}</span>
      </div>
      <div>
        <label>Teeth:</label>
        <input
          type="range"
          min="1"
          max="16"
          value={teeth}
          onChange={handleTeethChange}
        />
        <span>{teeth}</span>
      </div>
      <div>
        <label>Rotation:</label>
        <input
          type="range"
          min="0"
          max="16"
          value={rotation}
          onChange={handleRotationChange}
        />
        <span>{rotation}</span>
      </div>
    </div>
  );
};

export default PizzaFaceComponent;