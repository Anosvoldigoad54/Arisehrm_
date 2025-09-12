'use client'

import { useState, useEffect } from 'react'
import { useResponsive } from './useResponsive'

interface SidebarState {
  open: boolean
  mini: boolean
}

interface UseSidebarReturn {
  sidebarOpen: boolean
  sidebarMini: boolean
  toggleSidebar: () => void
  toggleMini: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarMini: (mini: boolean) => void
}

export const useSidebar = (): UseSidebarReturn => {
  const responsive = useResponsive()
  
  // Initialize state based on device and saved preferences
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // On mobile, sidebar is closed by default
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false
    }
    
    // Try to load saved preferences
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarPreferences')
      if (saved) {
        try {
          const prefs = JSON.parse(saved) as SidebarState
          return prefs.open ?? true
        } catch {
          return true
        }
      }
    }
    
    return true // Default to open on desktop
  })
  
  const [sidebarMini, setSidebarMini] = useState(() => {
    // Try to load saved preferences
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarPreferences')
      if (saved) {
        try {
          const prefs = JSON.parse(saved) as SidebarState
          return prefs.mini ?? false
        } catch {
          return false
        }
      }
    }
    
    return false // Default to full width
  })

  // Handle responsive changes
  useEffect(() => {
    if (responsive.isMobile) {
      setSidebarOpen(false)
      setSidebarMini(false)
    } else if (responsive.isTablet) {
      setSidebarOpen(true)
      setSidebarMini(false)
    }
  }, [responsive.isMobile, responsive.isTablet])

  // Save preferences to localStorage
  useEffect(() => {
    if (!responsive.isMobile) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('sidebarPreferences', JSON.stringify({
          open: sidebarOpen,
          mini: sidebarMini,
        }))
      }, 500) // Debounce to avoid excessive writes

      return () => clearTimeout(timeoutId)
    }
  }, [sidebarOpen, sidebarMini, responsive.isMobile])

  // Toggle functions
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  const toggleMini = () => {
    setSidebarMini(prev => !prev)
    // Ensure sidebar is open when toggling mini mode
    if (!sidebarOpen) {
      setSidebarOpen(true)
    }
  }

  return {
    sidebarOpen,
    sidebarMini,
    toggleSidebar,
    toggleMini,
    setSidebarOpen,
    setSidebarMini,
  }
}

export default useSidebar
