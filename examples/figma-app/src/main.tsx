import { createRoot } from 'react-dom/client';

import { App } from './App';
import './nxds.css';
import { NxdsAppearanceProvider } from './components/nxds/components/appearance/provider';
import { defaultAppearance } from './appearance-state';

createRoot(document.getElementById('root')!).render(
  <NxdsAppearanceProvider storageKey="nxds-appearance" defaultState={defaultAppearance}>
    <App />
  </NxdsAppearanceProvider>
);
