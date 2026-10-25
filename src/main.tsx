import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/arimo/400.css';
import '@fontsource/arimo/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import App from './App';
import './index.css';
import './layouts/standard-ats-v2/standard-ats-v2.css';

// Early trigger for font loading to ensure all weights are ready before print/render
if (typeof document !== 'undefined' && 'fonts' in document) {
  void Promise.all([
    document.fonts.load('400 12px Inter'),
    document.fonts.load('500 12px Inter'),
    document.fonts.load('600 12px Inter'),
    document.fonts.load('700 12px Inter'),
    document.fonts.load('400 12px Arimo'),
    document.fonts.load('700 12px Arimo'),
  ]);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
