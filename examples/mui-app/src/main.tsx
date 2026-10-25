import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider, useColorScheme } from '@mui/material/styles'
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

// nxds owns light and dark mode; MUI follows it, so the two never disagree
// about the shared .dark class on <html>.
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NxdsAppearanceProvider>
        <MuiFollowsNxds />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NxdsAppearanceProvider>
    </ThemeProvider>
  </StrictMode>,
)
