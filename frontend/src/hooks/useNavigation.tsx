'use client'

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export function useNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { shouldNavigateToDashboard, pendingNavigation, clearNavigationFlag } = useAuth()

  useEffect(() => {
    if (shouldNavigateToDashboard && pendingNavigation) {
      
      const targetPath = (location.state as any)?.from?.pathname || pendingNavigation
      
      clearNavigationFlag()
      
      setTimeout(() => {
        navigate(targetPath, { replace: true })
        toast.success('🎉 Welcome to your dashboard!')
      }, 500)
    }
  }, [shouldNavigateToDashboard, pendingNavigation, navigate, location, clearNavigationFlag])

  return {
    navigateTo: (path: string) => navigate(path),
    currentPath: location.pathname,
  }
}
