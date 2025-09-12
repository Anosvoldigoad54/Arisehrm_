export interface DeviceInfo {
  userAgent: string
  platform: string
  language: string
  timezone: string
  screenResolution: string
  colorDepth: number
  devicePixelRatio: number
  touchSupport: boolean
  deviceMemory?: number
  hardwareConcurrency: number
  fingerprint: string
  cookiesEnabled: boolean
  doNotTrack: string | null
  webGL: any
  battery: any
  connection: any
}

export interface SessionInfo {
  started_at: string
  last_activity: string
  security_risk: SecurityRiskLevel
  device_trusted: boolean
}

export type SecurityRiskLevel = 'low' | 'medium' | 'high'
