import { useState, useEffect } from 'react'
import hrmConfig from '../config/hrmConfig.json'

interface HRMConfig {
  system: {
    name: string
    version: string
    environment: string
    features: Record<string, boolean>
  }
  authentication: {
    session_timeout: number
    password_policy: {
      min_length: number
      require_uppercase: boolean
      require_lowercase: boolean
      require_numbers: boolean
      require_special_chars: boolean
    }
    login_attempts: {
      max_attempts: number
      lockout_duration: number
    }
  }
  roles: Record<string, {
    level: number
    permissions: string[]
    dashboard: string
  }>
  modules: Record<string, any>
  ui: {
    theme: {
      primary_color: string
      secondary_color: string
      sidebar_width: number
      sidebar_mini_width: number
    }
    navigation: {
      breadcrumbs: boolean
      sidebar_collapsible: boolean
      mobile_bottom_nav: boolean
    }
    tables: {
      rows_per_page: number[]
      default_rows: number
      export_formats: string[]
    }
  }
  notifications: Record<string, any>
  integrations: Record<string, any>
  security: Record<string, any>
  backup: Record<string, any>
}

export const useConfig = () => {
  const [config, setConfig] = useState<HRMConfig>(hrmConfig as HRMConfig)

  const getModuleConfig = (moduleName: string) => {
    return config.modules[moduleName] || {}
  }

  const isModuleEnabled = (moduleName: string): boolean => {
    return config.modules[moduleName]?.enabled === true
  }

  const getFeatureFlag = (featureName: string): boolean => {
    return config.system.features[featureName] === true
  }

  const getRoleConfig = (roleName: string) => {
    return config.roles[roleName] || null
  }

  const getUIConfig = () => {
    return config.ui
  }

  const updateConfig = (updates: Partial<HRMConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  return {
    config,
    getModuleConfig,
    isModuleEnabled,
    getFeatureFlag,
    getRoleConfig,
    getUIConfig,
    updateConfig
  }
}

export default useConfig
