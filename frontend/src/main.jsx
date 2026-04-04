import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initOfflineDB } from './lib/offlineStorage'

// Initialiser le stockage offline au démarrage
initOfflineDB().then(() => {
  console.log('✅ Base de données offline initialisée');
}).catch((err) => {
  console.warn('⚠️ Erreur initialisation DB offline:', err);
});

// Enregistrer le service worker pour le mode offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker géré par vite-plugin-pwa
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
