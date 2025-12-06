import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register';

const onOfflineReady = () => {
  console.log('App is ready to work offline');
}

const onNeedRefresh = () => {
  console.log('New content is available; please refresh.');
}

registerSW({ onOfflineReady, onNeedRefresh });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)