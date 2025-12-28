// client/src/index.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import App from './App';
import './i18n';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Register service worker only in production — prevents dev caching bugs
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.warn('Service Worker registration failed:', err));
  });
}
