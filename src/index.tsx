import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import GrooveCanvas from './components/canvas/GrooveCanvas';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <GrooveCanvas />
    </ErrorBoundary>
  </StrictMode>
);
