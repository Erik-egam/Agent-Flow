'use client'

import { useState, useEffect, useCallback } from 'react'

export type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = (localStorage.getItem('af-theme') ?? 'dark') as Theme
    setTheme(stored)
    document.documentElement.setAttribute('data-theme', stored)
  }, [])

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('af-theme', next)
      return next
    })
  }, [])

  return { theme, toggle }
}
