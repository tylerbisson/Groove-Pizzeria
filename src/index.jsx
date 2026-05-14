import React from 'react';
import ReactDOM from 'react-dom/client';
import GrooveCanvas from './components/GrooveCanvas';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GrooveCanvas />
  </React.StrictMode>
);
