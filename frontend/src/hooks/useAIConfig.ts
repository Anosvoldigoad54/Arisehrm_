import { useMemo } from 'react'
import aiConfig from '../config/aiConfig.json'

export interface AIConfig {
  resumeAnalysis: {
    skillWeights: Record<string, number>
    experienceMultipliers: Record<string, number>
    scoringThresholds: Record<string, number>
    recommendations: Record<string, string>
  }
  insights: {
    categories: string[]
    severityLevels: Record<string, {
      color: string
      priority: number
      urgency: string
    }>
    impactLevels: string[]
    confidenceThresholds: Record<string, number>
  }
  performance: {
    cacheTimeout: number
    batchSize: number
    enableVirtualization: boolean
    lazyLoadThreshold: number
  }
  ui: {
    cardMaxWidth: string
    gridBreakpoints: Record<string, string>
    animations: {
      enabled: boolean
      duration: number
    }
  }
}

export const useAIConfig = () => {
  const config = useMemo(() => aiConfig as AIConfig, [])
  
  const getSkillWeight = (skill: string): number => {
    return config.resumeAnalysis.skillWeights[skill] || 0.05
  }
  
  const getScoreCategory = (score: number): string => {
    const thresholds = config.resumeAnalysis.scoringThresholds
    if (score >= thresholds.excellent) return 'excellent'
    if (score >= thresholds.good) return 'good'
    if (score >= thresholds.average) return 'average'
    return 'poor'
  }
  
  const getSeverityConfig = (severity: string) => {
    return config.insights.severityLevels[severity] || config.insights.severityLevels.low
  }
  
  const getGridBreakpoints = () => {
    return config.ui.gridBreakpoints
  }
  
  const shouldUseVirtualization = (itemCount: number): boolean => {
    return config.performance.enableVirtualization && itemCount > config.performance.lazyLoadThreshold
  }
  
  return {
    config,
    getSkillWeight,
    getScoreCategory,
    getSeverityConfig,
    getGridBreakpoints,
    shouldUseVirtualization
  }
}
