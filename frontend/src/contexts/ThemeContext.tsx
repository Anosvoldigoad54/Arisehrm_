'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { createDenimThemeOptions } from '../styles/denimTheme'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  isDarkMode: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeMode must be used inside ThemeContextProvider')
  return ctx
}

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')

  /* ────────────────────────────────────────────────────────── */
  /* keep system preference updated                             */
  /* ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setSystemTheme(mq.matches ? 'dark' : 'light')
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* ────────────────────────────────────────────────────────── */
  /* load / persist choice                                      */
  /* ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const stored = localStorage.getItem('themeMode') as ThemeMode | null
    if (stored) setThemeMode(stored)
  }, [])

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode)
  }, [themeMode])

  const isDarkMode = themeMode === 'system' ? systemTheme === 'dark' : themeMode === 'dark'

  const muiTheme = useMemo(
    () => createTheme(createDenimThemeOptions(isDarkMode)),
    [isDarkMode]
  )

  const toggleTheme = () =>
    setThemeMode((prev) =>
      prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'
    )

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, toggleTheme, isDarkMode }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
