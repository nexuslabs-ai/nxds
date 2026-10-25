import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, type StorageManager, ThemeProvider, useColorScheme } from '@mui/material/styles'
import { readStoredNxdsAppearance } from '@nxds/core'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import App from './App'
import { APPEARANCE_STORAGE_KEY, defaultAppearance } from './appearance-state'
import { createNxdsAppearance, useNxdsAppearance } from './components/nxds/components/appearance/provider'

import './nxds.css'

const theme = createTheme({
  colorSchemes: { dark: true },
  cssVariables: { colorSchemeSelector: 'class' },
})

const { NxdsAppearanceProvider } = createNxdsAppearance({
  storageKey: APPEARANCE_STORAGE_KEY,
  defaultState: defaultAppearance,
})

const nxdsModeStorage: StorageManager = ({ key }) => ({
  get: (fallback) =>
    key === 'mui-mode' ? readStoredNxdsAppearance(APPEARANCE_STORAGE_KEY, defaultAppearance).mode : fallback,
  set() {},
  subscribe: () => () => {},
})

function MuiFollowsNxds() {
  const { state, mounted } = useNxdsAppearance()
  const { setMode } = useColorScheme()

  useEffect(() => {
    if (mounted) setMode(state.mode)
  }, [mounted, state.mode, setMode])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NxdsAppearanceProvider>
      <ThemeProvider theme={theme} storageManager={nxdsModeStorage}>
        <CssBaseline />
        <MuiFollowsNxds />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </NxdsAppearanceProvider>
  </StrictMode>,
)
