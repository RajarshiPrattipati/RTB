import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'components';
import { GlobalStateProvider } from './context/GlobalStateProvider';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStateProvider>
      <App />
    </GlobalStateProvider>
  </React.StrictMode>
);
