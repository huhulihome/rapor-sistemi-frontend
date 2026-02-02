import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { measureWebVitals, preconnectDomains } from './utils/performance'

// Preconnect to external domains for better performance
preconnectDomains([
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
]);

// Measure Web Vitals in development
if (import.meta.env.DEV) {
  measureWebVitals();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
