import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global styles, in dependency order: reset → tokens → base.
// Nothing else in the app imports these; component styles are CSS Modules.
import '@/styles/reset.css';
import '@/styles/tokens.css';
import '@/styles/global.css';

/**
 * Entry point. Only three responsibilities:
 *   1. Fail loudly if the mount node is missing (a broken index.html should
 *      not degrade into a silent blank page).
 *   2. Load global styles once, in a deterministic order.
 *   3. Mount <App /> in StrictMode.
 *
 * Note: `@/config/env` validates configuration at import time, reached via
 * App's import graph — a misconfigured deployment throws here rather than
 * rendering a subtly wrong site.
 */

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found — check index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
