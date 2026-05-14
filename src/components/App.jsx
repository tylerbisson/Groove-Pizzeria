import React, { useEffect } from 'react';
import P5Sketch from './P5Sketch';

// Initialize side-effect modules (control text rendering, sound, etc)
// These are imported here rather than in index.jsx to keep concerns localized
import '../control_text';
import '../pizzaFace';
import '../sound';
import '../draw';

const App = () => {
  useEffect(() => {
    // Ensure DOM is ready before any p5 sketch initialization
    // P5Sketch component handles its own setup via useEffect
    console.log('App mounted - initializing');

    return () => {
      // Cleanup if needed
      console.log('App unmounting');
    };
  }, []);

  return (
    <div>
      <P5Sketch />
    </div>
  );
};

export default App;