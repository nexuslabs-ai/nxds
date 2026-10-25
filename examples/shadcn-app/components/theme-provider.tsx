"use client"

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { useEffect } from "react"

import { useNxdsAppearance } from "@/components/nxds/components/appearance/provider"

function NextThemesFollowsNxds() {
  const { state, mounted } = useNxdsAppearance()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (mounted) setTheme(state.mode)
  }, [mounted, state.mode, setTheme])

  return null
}

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <NextThemesFollowsNxds />
      {children}
    </NextThemesProvider>
  )
}
