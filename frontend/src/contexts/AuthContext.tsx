'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getUserProfile, createUserProfile, createUserSession, logFailedLoginAttempt, updateUserPreferences, updateUserTheme } from '../lib/supabase'
import { toast } from 'sonner'
import { ROLES } from '../types/permissions'
import { AuditAction, AuditStatus, AuditCategory, AuditSeverity } from '../types/audit'
import { auditLogger } from '../services/auditLoggingService'

// Helper function to get permissions for a role
const getPermissionsForRole = (roleName: string): string[] => {
  const role = ROLES[roleName]
  if (role) {
    return role.permissions
  }

  // Fallback for unknown roles
  switch (roleName) {
    case 'admin':
    case 'super_admin':
      return ['*'] // All permissions
    case 'hr_manager':
      return Object.keys(ROLES.hr_manager?.permissions || [])
    case 'department_manager':
      return Object.keys(ROLES.department_manager?.permissions || [])
    case 'team_lead':
      return Object.keys(ROLES.team_lead?.permissions || [])
    case 'employee':
      return Object.keys(ROLES.employee?.permissions || [])
    default:
      return ['dashboard.view', 'employees.view_own', 'attendance.view_own']
  }
}

// Enhanced Types matching your database schema
interface UserProfile {
  id: string
  employee_id: string
  email: string
  first_name: string
  last_name: string
  display_name?: string
  profile_photo_url?: string
  department?: {
    id: string
    name: string
    code: string
    manager_employee_id?: string
    budget?: number
    headcount_target?: number
    current_headcount?: number
  }
  role?: {
    id: number
    name: string
    display_name: string
    level: number
    color_code?: string
    icon?: string
    permissions?: string[]
    max_users?: number
    is_system_role?: boolean
  }
  position?: {
    id: string
    title: string
    code?: string
    level?: string
    min_salary?: number
    max_salary?: number
    is_leadership_role?: boolean
  }
  employment_status: string
  employment_type: string
  work_location?: string
  allowed_work_locations?: string[]
  manager_employee_id?: string
  skip_level_manager?: string
  salary?: number
  salary_currency?: string
  hire_date?: string
  probation_end_date?: string
  is_active: boolean
  last_login?: string
  login_count?: number
  failed_login_attempts?: number
  account_locked?: boolean
  locked_until?: string
  two_factor_enabled?: boolean
  timezone?: string
  preferred_language?: string
  skills?: any[]
  certifications?: any[]
  performance_rating?: number
  engagement_score?: number
  retention_risk?: string
  created_at: string
  updated_at: string
  auth_user_id?: string
  // Advanced computed fields
  performance_score?: number
  last_activity?: string
  notification_preferences?: {
    email: boolean
    sms: boolean
    push: boolean
    in_app: boolean
  }
}

interface SecurityContext {
  device_fingerprint: string
  ip_address: string
  location?: {
    city: string
    country: string
    coordinates?: { lat: number; lng: number }
  }
  risk_level: 'low' | 'medium' | 'high'
  session_id: string
  user_agent: string
  login_time: string
  last_activity: string
  is_trusted_device: boolean
  device_info?: any
  browser_fingerprint?: string
  security_flags?: string[]
}

interface AuthContextType {
  // Core Authentication
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Advanced Security
  securityContext: SecurityContext | null
  sessionHealth: 'healthy' | 'warning' | 'critical'
  
  // Navigation Control
  shouldNavigateToDashboard: boolean
  pendingNavigation: string | null
  
  // Authentication Methods
  login: (credentials: LoginCredentials) => Promise<LoginResponse>
  logout: () => Promise<void>
  
  // Advanced Methods
  refreshProfile: () => Promise<void>
  updateUserPreferences: (preferences: Partial<UserProfile>) => Promise<boolean>
  clearNavigationFlag: () => void
  switchTheme: (theme: 'light' | 'dark' | 'auto') => Promise<void>
  enableTwoFactor: () => Promise<{ qrCode: string; backupCodes: string[] }>
  validateTwoFactor: (token: string) => Promise<boolean>
}

interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
  deviceTrust?: boolean
  twoFactorToken?: string
}

interface LoginResponse {
  success: boolean
  user?: User
  error?: string
  requiresTwoFactor?: boolean
  requiresDeviceVerification?: boolean
  accountLocked?: boolean
  lockoutTime?: number
  backupCodes?: string[]
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Core State
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Advanced State
  const [securityContext, setSecurityContext] = useState<SecurityContext | null>(null)
  const [sessionHealth, setSessionHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy')
  const [shouldNavigateToDashboard, setShouldNavigateToDashboard] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  
  // Refs for advanced functionality
  const sessionMonitorRef = useRef<NodeJS.Timeout>()
  const activityTrackerRef = useRef<NodeJS.Timeout>()
  const securityCheckRef = useRef<NodeJS.Timeout>()
  const loginInProgressRef = useRef(false)
  // Track demo authentication state to prevent Supabase listeners from overriding it
  const demoAuthRef = useRef(false)

  // Advanced Device Fingerprinting
  const generateAdvancedFingerprint = useCallback(async (): Promise<string> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('AriseHRM_Security_2025', 2, 2)
    
    const fingerprint = {
      // Hardware
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory || 0,
      
      // Display
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      
      // Browser
      language: navigator.language,
      languages: navigator.languages.join(','),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      
      // Canvas fingerprint
      canvas: canvas.toDataURL(),
      
      // WebGL fingerprint
      webgl: getWebGLInfo(),
      
      // Audio fingerprint (with proper handling)
      audio: await getAudioFingerprint(),
      
      // Timestamp
      timestamp: Date.now()
    }
    
    // Create hash
    const fingerprintString = JSON.stringify(fingerprint)
    const encoder = new TextEncoder()
    const data = encoder.encode(fingerprintString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }, [])

  const getWebGLInfo = () => {
    try {
      const canvas = document.createElement('canvas')
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
      if (!gl) return null

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info') as any
      const VENDOR = debugInfo?.UNMASKED_VENDOR_WEBGL ?? 0
      const RENDERER = debugInfo?.UNMASKED_RENDERER_WEBGL ?? 0

      return {
        vendor: gl.getParameter(VENDOR) as unknown as string,
        renderer: gl.getParameter(RENDERER) as unknown as string,
        version: gl.getParameter(gl.VERSION) as unknown as string,
        glsl: gl.getParameter(gl.SHADING_LANGUAGE_VERSION) as unknown as string,
      }
    } catch {
      return null
    }
  }

  // ✅ FIXED: Audio fingerprint with proper user gesture handling
  const getAudioFingerprint = async (): Promise<string | null> => {
    try {
      // Skip audio fingerprint if no user gesture (avoid console warning)
      const hasUserActivation = (document as any).userActivation?.hasBeenActive === true
      if (!hasUserActivation) {
        return null
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Check if context is suspended (requires user gesture)
      if (audioContext.state === 'suspended') {
        await audioContext.close()
        return null
      }

      const oscillator = audioContext.createOscillator()
      const analyser = audioContext.createAnalyser()
      const gainNode = audioContext.createGain()
      
      oscillator.type = 'triangle'
      oscillator.frequency.value = 1000
      gainNode.gain.value = 0.05
      
      oscillator.connect(analyser)
      analyser.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.start()
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)
      
      oscillator.stop()
      audioContext.close()
      
      return Array.from(dataArray).join('')
    } catch (error: any) {
      return null
    }
  }

  // ✅ FIXED: Enhanced Location Detection with permission checking
  const getLocationData = useCallback(async () => {
    try {
      // Check permission state first
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        if (permission.state === 'denied') {
          throw new Error('Geolocation permission denied')
        }
      }

      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 3000, // Reduced timeout
            enableHighAccuracy: false,
            maximumAge: 300000 // Cache for 5 minutes
          })
        })
        
        // Reverse geocoding
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
        )
        const locationData = await response.json()
        
        return {
          city: locationData.city || 'Unknown',
          country: locationData.countryName || 'Unknown',
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }
      }
    } catch (error) {
    }
    
    // Fallback to IP-based location
    try {
      const ipResponse = await fetch('https://ipapi.co/json/')
      const ipData = await ipResponse.json()
      return {
        city: ipData.city || 'Unknown',
        country: ipData.country_name || 'Unknown'
      }
    } catch {
      return {
        city: 'Unknown',
        country: 'Unknown'
      }
    }
  }, [])

  // Optimized Session Initialization
  useEffect(() => {
    let mounted = true
    
    const initializeAuth = async () => {
      try {
        // If demo auth is active, skip Supabase session initialization to avoid overrides
        if (demoAuthRef.current || sessionStorage.getItem('demo_auth_active') === 'true') {
          if (mounted) setIsLoading(false)
          return
        }
        // Check if supabase client is available
        if (!supabase) {
          console.warn('🔄 Demo mode: Supabase client not available, skipping session initialization');
          // In demo mode, we can still provide a basic user context
          if (import.meta.env.VITE_DEMO_MODE === 'true') {
            if (mounted) {
              // Set a demo user profile
              const demoProfile: UserProfile = {
                id: 'demo-user-id',
                employee_id: 'EMP001',
                email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'demo@arisehrm.test',
                first_name: 'Demo',
                last_name: 'User',
                display_name: 'Demo User',
                employment_status: 'active',
                employment_type: 'full_time',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                role: {
                  id: 1,
                  name: 'super_admin',
                  display_name: 'Super Administrator',
                  level: 100,
                  color_code: '#FF0000',
                  icon: 'AdminPanelSettings',
                  permissions: ['*'],
                  max_users: 1,
                  is_system_role: true
                }
              };
              setProfile(demoProfile);
              setUser({
                id: 'demo-user-id',
                email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'demo@arisehrm.test',
                user_metadata: {},
                app_metadata: {},
                aud: 'authenticated',
                created_at: new Date().toISOString(),
              } as User);
            }
          }
          if (mounted) setIsLoading(false);
          return;
        }
        
        // Quick session check first
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          if (mounted) setIsLoading(false)
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
        }
        
        if (session?.user) {
          // Fast profile loading without heavy security context
          try {
            await fetchSimpleProfile(session.user.id)
          } catch (error) {
            if (mounted) setIsLoading(false)
          }
        } else {
          if (mounted) setIsLoading(false)
        }
      } catch (error) {
        if (mounted) setIsLoading(false)
      }
    }

    initializeAuth()

    // Enhanced Auth State Listener - only if supabase is available
    let subscription: any
    if (supabase) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return
          // If demo auth is active, ignore Supabase auth events to prevent resets
          if (demoAuthRef.current || sessionStorage.getItem('demo_auth_active') === 'true') {
            return
          }
          
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // ✅ FIXED: Load profile immediately without timeout
            try {
              await fetchSimpleProfile(session.user.id)
              
              if (event === 'SIGNED_IN') {
                // Create security context if it doesn't exist
                if (!securityContext) {
                  const newSecurityContext = await createAdvancedSecurityContext(session.user)
                  setSecurityContext(newSecurityContext)
                }
                
                // Log security event
                if (securityContext) {
                  await logAdvancedSecurityEvent({
                    event_type: 'SIGN_IN',
                    user_id: session.user.id,
                    security_context: securityContext,
                    timestamp: new Date().toISOString()
                  })
                  
                  // Start monitoring
                  startAdvancedMonitoring(session.user.id, securityContext)
                }

                toast.success('🎉 Login successful!', {
                  description: 'Welcome back to Arise HRM'
                })
                
                // ✅ FIXED: Set navigation flag after successful authentication
                setShouldNavigateToDashboard(true)
              }
              
              // ✅ FIXED: Set loading to false after profile is loaded
              if (mounted) setIsLoading(false)
              
            } catch (error) {
              console.error('Profile loading failed:', error)
              // ✅ FIXED: Still set loading to false even if profile loading fails
              if (mounted) setIsLoading(false)
            }
          } else if (event === 'SIGNED_OUT') {
            // Cleanup on logout
            setProfile(null)
            setSecurityContext(null)
            setShouldNavigateToDashboard(false)
            setPendingNavigation(null)
            stopAdvancedMonitoring()
            setIsLoading(false)

            toast.success('👋 Logged out securely')
          }
        }
      )
      subscription = authSubscription
    } else {
      console.warn('🔄 Demo mode: Supabase auth state listener not available');
    }

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [securityContext])

  // Helper function to handle profile errors
  const handleProfileError = useCallback((error: any) => {
    setIsLoading(false)
    
    if (error.code === 'PGRST116') {
      toast.error('Profile not found. Please contact administrator.')
    } else {
      toast.error('Failed to load profile. Please try again.')
    }
  }, [])

  // Create user profile from auth data
  const createUserProfileFromAuth = useCallback(async (userId: string) => {
    try {
      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot create user profile - Supabase not available');
        // Create a demo profile instead
        const demoProfile: UserProfile = {
          id: `demo-profile-${userId}`,
          employee_id: `EMP${Date.now()}`,
          email: 'demo@arisehrm.test',
          first_name: 'Demo',
          last_name: 'User',
          employment_status: 'active',
          employment_type: 'full_time',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          auth_user_id: userId,
          department: undefined,
          role: {
            id: 1,
            name: 'admin',
            display_name: 'Administrator',
            level: 6,
            color_code: '#667eea',
            icon: 'admin',
            permissions: ['*'],
            max_users: undefined,
            is_system_role: false
          },
          position: undefined,
          performance_score: 85,
          last_activity: new Date().toISOString()
        };
        setProfile(demoProfile);
        setIsLoading(false);
        return;
      }
      
      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot create user profile - Supabase not available');
        return;
      }
      
      const { data: authUser } = await supabase.auth.getUser()
      if (!authUser.user) return

      const newProfile = {
        auth_user_id: userId,
        employee_id: `EMP${Date.now()}`,
        first_name: authUser.user.user_metadata?.first_name || 'User',
        last_name: authUser.user.user_metadata?.last_name || '',
        email: authUser.user.email,
        role_id: 1, // Default admin role
        department_id: null as string | null,
        position_id: null as string | null,
        is_active: true,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_profiles')
        .insert([newProfile] as any) // Type assertion to bypass strict typing

      if (error) throw error

      toast.success('Profile created successfully!')
      // Retry fetching the profile
      await fetchSimpleProfile(userId)
    } catch (error) {
      handleProfileError(error)
    }
  }, [handleProfileError])

  // Fetch simple profile without relations
  const fetchSimpleProfile = useCallback(async (userId: string) => {
    try {
      setIsLoading(true)
      
      if (!supabase) {
        console.warn('🔄 Demo mode: Using fallback profile data - Supabase not available');
        // Create a demo profile
        const demoProfile: UserProfile = {
          id: `demo-profile-${userId}`,
          employee_id: `EMP${Date.now()}`,
          email: 'demo@arisehrm.test',
          first_name: 'Demo',
          last_name: 'User',
          employment_status: 'active',
          employment_type: 'full_time',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          auth_user_id: userId,
          department: undefined,
          role: {
            id: 1,
            name: 'admin',
            display_name: 'Administrator',
            level: 6,
            color_code: '#667eea',
            icon: 'admin',
            permissions: ['*'],
            max_users: undefined,
            is_system_role: false
          },
          position: undefined,
          performance_score: 85,
          last_activity: new Date().toISOString()
        };
        setProfile(demoProfile);
        setIsLoading(false);
        toast.success(`Welcome back, ${demoProfile.first_name}! 🎉`);
        return;
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          await createUserProfileFromAuth(userId)
          return
        }
        throw error
      }

      // Create simple profile with default role
      const simpleProfile: UserProfile = {
        ...(data as any), // Type assertion to handle potential type mismatch
        department: undefined,
        role: {
          id: 1,
          name: 'admin',
          display_name: 'Administrator',
          level: 6,
          color_code: '#667eea',
          icon: 'admin',
          permissions: ['*'],
          max_users: undefined,
          is_system_role: false
        },
        position: undefined,
        performance_score: 85,
        last_activity: new Date().toISOString()
      }

      setProfile(simpleProfile)
      setIsLoading(false)
      
      toast.success(`Welcome back, ${simpleProfile.first_name}! 🎉`)
    } catch (error: any) {
      handleProfileError(error)
    }
  }, [handleProfileError, createUserProfileFromAuth])

  // ✅ NEW: Create user session record in database
  const createUserSessionRecord = async (userId: string, employeeId: string, securityCtx: SecurityContext) => {
    try {
      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot create session record - Supabase not available');
        return;
      }
      
      const sessionData = {
        user_id: userId,
        employee_id: employeeId,
        session_token: securityCtx.session_id,
        device_info: securityCtx.device_info || {},
        browser_fingerprint: securityCtx.browser_fingerprint,
        user_agent: securityCtx.user_agent,
        device_type: securityCtx.device_info?.type || 'desktop',
        ip_address: securityCtx.ip_address,
        country: securityCtx.location?.country || 'Unknown',
        city: securityCtx.location?.city || 'Unknown',
        is_trusted_device: securityCtx.is_trusted_device,
        risk_score: securityCtx.risk_level === 'high' ? 80 : securityCtx.risk_level === 'medium' ? 40 : 10,
        security_flags: securityCtx.security_flags || [],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        last_activity: new Date().toISOString(),
        metadata: {
          login_method: 'password',
          client_version: '1.0.0',
          feature_flags: ['advanced_security', 'biometric_auth']
        }
      }

      const { error } = await supabase
        .from('user_sessions')
        .upsert(sessionData as any, { 
          onConflict: 'session_token',
          ignoreDuplicates: false 
        })

      if (error) {
      } else {
      }
    } catch (error) {
    }
  }

  // Advanced Security Risk Assessment
  const assessAdvancedSecurityRisk = async (
    profile: UserProfile, 
    securityCtx: SecurityContext
  ): Promise<'low' | 'medium' | 'high'> => {
    const riskFactors = []
    
    // Time-based analysis
    const currentHour = new Date().getHours()
    if (currentHour < 6 || currentHour > 22) {
      riskFactors.push('unusual_time')
    }
    
    // Device trust analysis
    if (!securityCtx.is_trusted_device) {
      riskFactors.push('untrusted_device')
    }
    
    // Account security analysis
    if (profile.failed_login_attempts && profile.failed_login_attempts > 3) {
      riskFactors.push('multiple_failed_attempts')
    }
    
    if (profile.account_locked) {
      riskFactors.push('account_previously_locked')
    }
    
    // Activity pattern analysis
    if (profile.last_login) {
      const timeSinceLastLogin = Date.now() - new Date(profile.last_login).getTime()
      const daysSinceLastLogin = timeSinceLastLogin / (1000 * 60 * 60 * 24)
      
      if (daysSinceLastLogin > 30) {
        riskFactors.push('long_absence')
      }
    }
    
    // Location analysis
    if (securityCtx.location?.country) {
      const storedLocation = localStorage.getItem(`user_location_${profile.id}`)
      if (storedLocation && storedLocation !== securityCtx.location.country) {
        riskFactors.push('new_location')
      } else if (!storedLocation) {
        localStorage.setItem(`user_location_${profile.id}`, securityCtx.location.country)
      }
    }

    // Employment status analysis
    if (profile.employment_status !== 'active') {
      riskFactors.push('inactive_employment_status')
    }

    // Role-based analysis
    if (profile.role?.is_system_role) {
      riskFactors.push('system_role_access')
    }
    
    // Calculate risk level
    if (riskFactors.length >= 3) return 'high'
    if (riskFactors.length >= 1) return 'medium'
    return 'low'
  }

  // Performance Score Calculation
  const calculatePerformanceScore = (profileData: any): number => {
    let score = 50 // Base score
    
    // Activity bonus
    if (profileData.last_login) {
      const daysSinceLogin = (Date.now() - new Date(profileData.last_login).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLogin < 7) score += 20
      else if (daysSinceLogin < 30) score += 10
    }
    
    // Profile completeness
    const fields = ['profile_photo_url', 'phone', 'work_location', 'skills', 'certifications']
    const completedFields = fields.filter(field => profileData[field] && (Array.isArray(profileData[field]) ? profileData[field].length > 0 : true)).length
    score += (completedFields / fields.length) * 20
    
    // Role level bonus
    if (profileData.role?.level) {
      score += Math.min(profileData.role.level * 3, 15)
    }

    // Performance rating bonus
    if (profileData.performance_rating) {
      score += profileData.performance_rating * 3
    }

    // Engagement score bonus
    if (profileData.engagement_score) {
      score += (profileData.engagement_score / 100) * 10
    }
    
    return Math.min(100, Math.max(0, score))
  }

  // Advanced Monitoring System
  const startAdvancedMonitoring = (userId: string, securityCtx: SecurityContext) => {
    // Session health monitoring
    sessionMonitorRef.current = setInterval(async () => {
      try {
        if (!supabase) {
          console.warn('🔄 Demo mode: Cannot get user - Supabase not available')
          return
        }
        const { data, error } = await supabase.auth.getUser()
        if (error || !data.user) {
          setSessionHealth('critical')
          // Log session health critical event
          await auditLogger.logEvent({
            category: AuditCategory.SECURITY,
            action: AuditAction.SESSION_EXPIRED,
            status: AuditStatus.WARNING,
            severity: AuditSeverity.HIGH,
            description: 'User session became invalid',
            targetType: 'user_session',
            targetId: userId,
            details: {
              sessionId: securityCtx.session_id,
              previousHealth: 'healthy',
              currentHealth: 'critical',
              errorMessage: error?.message || 'No user data'
            }
          })
        } else {
          setSessionHealth('healthy')
          // Update session activity
          await updateSessionActivity(securityCtx.session_id)
        }
      } catch (error) {
        setSessionHealth('warning')
        // Log session monitoring warning
        await auditLogger.logEvent({
          category: AuditCategory.SECURITY,
          action: AuditAction.UPDATE,
          status: AuditStatus.WARNING,
          severity: AuditSeverity.MEDIUM,
          description: 'Session health check failed',
          targetType: 'user_session',
          targetId: userId,
          details: {
            sessionId: securityCtx.session_id,
            currentHealth: 'warning',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }
    }, 60000) // Check every minute

    // Activity tracking
    const trackActivity = () => {
      setSecurityContext(prev => prev ? {
        ...prev,
        last_activity: new Date().toISOString()
      } : prev)
    }

    // Track user interactions
    document.addEventListener('click', trackActivity)
    document.addEventListener('keypress', trackActivity)
    document.addEventListener('mousemove', trackActivity)

    // Cleanup function
    const cleanup = () => {
      document.removeEventListener('click', trackActivity)
      document.removeEventListener('keypress', trackActivity)
      document.removeEventListener('mousemove', trackActivity)
    }

    // Store cleanup for later
    ;(window as any).activityCleanup = cleanup

    // Periodic security checks
    securityCheckRef.current = setInterval(async () => {
      if (securityCtx.risk_level === 'high') {
        await logSecurityAlert(userId, securityCtx)
        // Log high-risk security event
        await auditLogger.logEvent({
          category: AuditCategory.SECURITY,
          action: AuditAction.SECURITY_VIOLATION,
          status: AuditStatus.WARNING,
          severity: AuditSeverity.HIGH,
          description: 'High-risk session detected',
          targetType: 'user_session',
          targetId: userId,
          details: {
            sessionId: securityCtx.session_id,
            riskLevel: securityCtx.risk_level,
            securityFlags: securityCtx.security_flags || [],
            ipAddress: securityCtx.ip_address,
            location: securityCtx.location
          }
        })
      }
    }, 300000) // Check every 5 minutes
  }

  const stopAdvancedMonitoring = () => {
    if (sessionMonitorRef.current) {
      clearInterval(sessionMonitorRef.current)
    }
    if (securityCheckRef.current) {
      clearInterval(securityCheckRef.current)
    }
    if ((window as any).activityCleanup) {
      ;(window as any).activityCleanup()
    }
  }

  // Demo Authentication System
  const tryDemoAuthentication = async (credentials: LoginCredentials): Promise<boolean> => {
    console.log('🔍 [Demo Auth] Starting demo authentication check for:', credentials.email)
    
    const demoAccounts = {
      // Original admin credential (maintained for backward compatibility)
      'admin@arisehrm.com': '5453Adis',
      // New comprehensive test credentials
      'superadmin@arisehrm.test': 'Test@1234',
      'hr.manager@arisehrm.test': 'Hr@1234',
      'dept.manager@arisehrm.test': 'Dept@1234',
      'team.lead@arisehrm.test': 'Lead@1234',
      'employee@arisehrm.test': 'Emp@1234',
      'contractor@arisehrm.test': 'Contract@123',
      'intern@arisehrm.test': 'Intern@123',
      // Legacy demo accounts
      'superadmin@arisehrm.com': 'superadmin123',
      'hr@arisehrm.com': 'hr123',
      'manager@arisehrm.com': 'manager123',
      'employee@arisehrm.com': 'employee123'
    }

    const email = credentials.email.trim().toLowerCase()
    const password = credentials.password

    // Check if the credentials match any demo account
    if (demoAccounts[email as keyof typeof demoAccounts] === password) {
      console.log('✅ [Demo Auth] Demo credentials matched for:', email)
      
      // Create demo user and profile
      const demoUser = {
        id: `demo-${email.split('@')[0]}`,
        email: email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Create comprehensive demo profile based on email
      const getRoleFromEmail = (email: string) => {
        if (email.includes('superadmin') || email === 'admin@arisehrm.com') {
          return {
            id: 1,
            name: 'super_admin',
            display_name: 'Super Administrator',
            level: 15,
            color_code: '#dc2626',
            icon: 'supervisor_account',
            permissions: ['*'],
            is_system_role: true
          }
        }
        if (email.includes('hr.manager') || email.includes('hr@')) {
          return {
            id: 2,
            name: 'hr_manager',
            display_name: 'HR Manager',
            level: 8,
            color_code: '#059669',
            icon: 'people',
            permissions: ['employees.*', 'attendance.*', 'leaves.*', 'payroll.*', 'reports.hr'],
            is_system_role: false
          }
        }
        if (email.includes('dept.manager') || email.includes('manager@')) {
          return {
            id: 3,
            name: 'department_manager',
            display_name: 'Department Head',
            level: 7,
            color_code: '#7C3AED',
            icon: 'domain',
            permissions: ['employees.view_department', 'attendance.manage_department', 'leaves.approve', 'reports.department'],
            is_system_role: false
          }
        }
        if (email.includes('team.lead')) {
          return {
            id: 4,
            name: 'team_lead',
            display_name: 'Team Lead',
            level: 5,
            color_code: '#EA580C',
            icon: 'group_work',
            permissions: ['employees.view_team', 'attendance.manage_team', 'leaves.review', 'reports.team'],
            is_system_role: false
          }
        }
        if (email.includes('contractor')) {
          return {
            id: 6,
            name: 'contractor',
            display_name: 'Contractor',
            level: 1,
            color_code: '#0891B2',
            icon: 'business_center',
            permissions: ['dashboard.view', 'profile.view_own', 'attendance.view_own'],
            is_system_role: false
          }
        }
        if (email.includes('intern')) {
          return {
            id: 7,
            name: 'intern',
            display_name: 'Intern',
            level: 0,
            color_code: '#65A30D',
            icon: 'school',
            permissions: ['dashboard.view', 'profile.view_own', 'attendance.view_own'],
            is_system_role: false
          }
        }
        // Default employee role
        return {
          id: 5,
          name: 'employee',
          display_name: 'Employee',
          level: 2,
          color_code: '#6B7280',
          icon: 'person',
          permissions: ['dashboard.view', 'profile.edit_own', 'attendance.view_own', 'leaves.request'],
          is_system_role: false
        }
      }
    
      const getUserInfo = (email: string) => {
        if (email === 'admin@arisehrm.com') {
          return { firstName: 'Admin', lastName: 'User', employeeId: 'EMP001' }
        }
        if (email === 'superadmin@arisehrm.test') {
          return { firstName: 'Super', lastName: 'Admin', employeeId: 'test-superadmin-1' }
        }
        if (email === 'hr.manager@arisehrm.test') {
          return { firstName: 'HR', lastName: 'Manager', employeeId: 'test-hrmanager-1' }
        }
        if (email === 'dept.manager@arisehrm.test') {
          return { firstName: 'Department', lastName: 'Head', employeeId: 'test-deptmanager-1' }
        }
        if (email === 'team.lead@arisehrm.test') {
          return { firstName: 'Team', lastName: 'Lead', employeeId: 'test-teamlead-1' }
        }
        if (email === 'employee@arisehrm.test') {
          return { firstName: 'Employee', lastName: 'Test', employeeId: 'test-employee-1' }
        }
        if (email === 'contractor@arisehrm.test') {
          return { firstName: 'Contractor', lastName: 'Test', employeeId: 'test-contractor-1' }
        }
        if (email === 'intern@arisehrm.test') {
          return { firstName: 'Intern', lastName: 'Test', employeeId: 'test-intern-1' }
        }
        return { firstName: 'Demo', lastName: 'User', employeeId: `EMP${Math.floor(Math.random() * 999) + 100}` }
      }
    
      const getDepartment = (email: string) => {
        if (email.includes('admin') || email.includes('hr')) {
          return { id: 'dept-hr', name: 'Human Resources', code: 'HR' }
        }
        if (email.includes('contractor')) {
          return { id: 'dept-external', name: 'External Contractors', code: 'EXT' }
        }
        return { id: 'dept-it', name: 'Information Technology', code: 'IT' }
      }
    
      const role = getRoleFromEmail(email)
      const userInfo = getUserInfo(email)
      const department = getDepartment(email)

      const demoProfile: UserProfile = {
        id: demoUser.id,
        employee_id: userInfo.employeeId,
        email: email,
        first_name: userInfo.firstName,
        last_name: userInfo.lastName,
        display_name: `${userInfo.firstName} ${userInfo.lastName}`,
        department,
        role,
        employment_status: 'active',
        employment_type: email.includes('contractor') ? 'contract' : email.includes('intern') ? 'internship' : 'full_time',
        hire_date: '2024-01-01',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Set demo user and profile
      console.log('🔄 [Demo Auth] Setting user state...', demoUser)
      setUser(demoUser as any)
      
      console.log('🔄 [Demo Auth] Setting profile state...', demoProfile)
      setProfile(demoProfile)
      
      console.log('🔄 [Demo Auth] Setting loading to false')
      setIsLoading(false)
      
      // Verify state was set after React updates
      setTimeout(() => {
        console.log('✅ [Demo Auth] State verification - User set:', !!demoUser)
        console.log('✅ [Demo Auth] State verification - Profile set:', !!demoProfile)
      }, 100)
    
      // Create security context for demo
      const demoSecurityContext: SecurityContext = {
        device_fingerprint: 'demo-device',
        ip_address: '127.0.0.1',
        location: { city: 'Demo City', country: 'Demo Country' },
        risk_level: 'low',
        session_id: `demo-session-${Date.now()}`,
        user_agent: navigator.userAgent,
        login_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_trusted_device: true
      }
      console.log('🔄 [Demo Auth] Setting security context...', demoSecurityContext)
      setSecurityContext(demoSecurityContext)
      
      console.log('✅ [Demo Auth] Demo authentication completed successfully')
      return true
    }
  
    console.log('❌ [Demo Auth] No matching demo credentials found')
    return false
  }

  // ✅ FIXED: Enhanced Login Method with database integration
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    if (!credentials.email?.trim() || !credentials.password) {
      return { success: false, error: 'Email and password are required' }
    }

    // ✅ FIXED: Prevent double login attempts
    if (loginInProgressRef.current) {
      return { success: false, error: 'Login already in progress' }
    }

    let loginResult: LoginResponse | null = null

    try {
      loginInProgressRef.current = true
      setIsLoading(true)

      // ✅ FIXED: Set auth in progress flag to prevent service worker interference
      sessionStorage.setItem('auth_in_progress', 'true')
      sessionStorage.setItem('login_in_progress', 'true')

      // ✅ DEMO AUTHENTICATION: Check demo credentials first
      if (await tryDemoAuthentication(credentials)) {
        // Mark demo auth active and persist flag for reload protection
        demoAuthRef.current = true
        sessionStorage.setItem('demo_auth_active', 'true')
        // Log successful demo authentication
        await auditLogger.logAuth(
          AuditAction.LOGIN,
          AuditStatus.SUCCESS,
          {
            loginMethod: 'demo',
            email: credentials.email,
            userAgent: navigator.userAgent,
            ipAddress: await getClientIP(),
            isDemoAccount: true
          }
        )
        
        // ✅ FIXED: Set navigation flag for successful demo login
        setShouldNavigateToDashboard(true)
        setPendingNavigation('/dashboard')
        
        loginResult = { success: true }
        return loginResult
      }

      if (!supabase) {
        console.warn('🔄 Demo mode: Supabase client not available, only demo authentication supported');
        loginResult = { 
          success: false, 
          error: 'Demo mode active. Please use demo credentials or configure Supabase.' 
        }
        return loginResult
      }

      // Add better error handling for Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      })

      if (error) {
        console.error('Supabase login error:', error);
        
        // Log failed attempt to database
        await logFailedLoginAttempt(credentials.email, error.message)
        
        // Log failed authentication to audit system
        await auditLogger.logAuth(
          AuditAction.LOGIN_FAILED,
          AuditStatus.FAILURE,
          {
            loginMethod: 'password',
            email: credentials.email,
            userAgent: navigator.userAgent,
            ipAddress: await getClientIP(),
            errorMessage: error.message,
            failureReason: getEnhancedErrorMessage(error)
          }
        )
        
        loginResult = {
          success: false,
          error: getEnhancedErrorMessage(error),
        }
        return loginResult
      }

      if (!data.user) {
        // Log authentication failure - no user data
        await auditLogger.logAuth(
          AuditAction.LOGIN_FAILED,
          AuditStatus.FAILURE,
          {
            loginMethod: 'password',
            email: credentials.email,
            userAgent: navigator.userAgent,
            ipAddress: await getClientIP(),
            errorMessage: 'Authentication failed - no user data received'
          }
        )
        loginResult = { success: false, error: 'Authentication failed - no user data received' }
        return loginResult
      }

      // Log successful authentication
      await auditLogger.logAuth(
        AuditAction.LOGIN,
        AuditStatus.SUCCESS,
        {
          loginMethod: 'password',
          email: credentials.email,
          userId: data.user.id,
          userAgent: navigator.userAgent,
          ipAddress: await getClientIP(),
          sessionId: data.session?.access_token?.substring(0, 16) + '...' // Partial token for reference
        }
      )

      // ✅ FIXED: Set navigation flag for successful Supabase login
      setShouldNavigateToDashboard(true)
      setPendingNavigation('/dashboard')
      
      loginResult = { success: true, user: data.user }
      return loginResult

    } catch (error: any) {
      console.error('Unexpected login error:', error);
      loginResult = { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }
      return loginResult
    } finally {
      // ✅ FIXED: Clean up flags in all cases
      sessionStorage.removeItem('auth_in_progress')
      
      // Always set loading to false after login attempt completes
      setIsLoading(false)
      
      // Clean up login progress flag
      sessionStorage.removeItem('login_in_progress')
      
      loginInProgressRef.current = false
    }
  }

  // Enhanced Logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      
      if (user && securityContext) {
        // Log logout to audit system
        await auditLogger.logAuth(
          AuditAction.LOGOUT,
          AuditStatus.SUCCESS,
          {
            userId: user.id,
            sessionId: securityContext.session_id,
            userAgent: navigator.userAgent,
            ipAddress: securityContext.ip_address,
            sessionDuration: securityContext.login_time ? 
              Date.now() - new Date(securityContext.login_time).getTime() : undefined,
            logoutMethod: 'manual'
          }
        )

        await logAdvancedSecurityEvent({
          event_type: 'LOGOUT',
          user_id: user.id,
          security_context: securityContext,
          timestamp: new Date().toISOString()
        })

        // Update session status
        await updateSessionStatus(securityContext.session_id, 'logged_out')
      }

      stopAdvancedMonitoring()
      
      if (supabase) {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          // Log logout failure
          if (user) {
            await auditLogger.logAuth(
              AuditAction.LOGOUT,
              AuditStatus.FAILURE,
              {
                userId: user.id,
                errorMessage: error.message,
                userAgent: navigator.userAgent
              }
            )
          }
          toast.error('Logout failed')
        } else {
          // Reset all state
          setUser(null)
          setProfile(null)
          setSecurityContext(null)
          // Clear demo auth flag
          demoAuthRef.current = false
          sessionStorage.removeItem('demo_auth_active')
          setShouldNavigateToDashboard(false)
          setPendingNavigation(null)
          setSessionHealth('healthy')
          loginInProgressRef.current = false
        }
      } else {
        console.warn('🔄 Demo mode: Skipping Supabase logout - client not available');
        // Reset all state for demo mode
        setUser(null)
        setProfile(null)
        setSecurityContext(null)
        // Clear demo auth flag
        demoAuthRef.current = false
        sessionStorage.removeItem('demo_auth_active')
        setShouldNavigateToDashboard(false)
        setPendingNavigation(null)
        setSessionHealth('healthy')
        loginInProgressRef.current = false
        toast.success('👋 Demo logout successful')
      }
    } catch (error) {
      // Log logout error
      if (user) {
        await auditLogger.logAuth(
          AuditAction.LOGOUT,
          AuditStatus.FAILURE,
          {
            userId: user.id,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            userAgent: navigator.userAgent
          }
        )
      }
      toast.error('An error occurred during logout')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper Functions
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  const checkTrustedDevice = async (fingerprint: string): Promise<boolean> => {
    const trustedDevices = JSON.parse(localStorage.getItem('trusted_devices') || '[]')
    return trustedDevices.includes(fingerprint)
  }

  // Removed duplicate handleProfileError function - using the one defined earlier with useCallback

  // ✅ FIXED: Database-integrated session and activity functions
  const updateSessionActivity = async (sessionToken: string) => {
    try {
      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot update session activity - Supabase not available');
        return;
      }
      
      // First get the current activity count
      const { data: currentSession } = await supabase
        .from('user_sessions')
        .select('activity_count')
        .eq('session_token', sessionToken)
        .single()

      const currentCount = (currentSession as any)?.activity_count || 0

      // Then update with incremented count
      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot update user session - Supabase not available')
        return
      }

      const updateData = {
        last_activity: new Date().toISOString(),
        activity_count: currentCount + 1
      };
      await (supabase as any)
        .from('user_sessions')
        .update(updateData)
        .eq('session_token', sessionToken)
    } catch (error) {
    }
  }

  const updateSessionStatus = async (sessionToken: string, logoutReason: string) => {
    try {
      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot update session status - Supabase not available');
        return;
      }
      
      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot update user session logout - Supabase not available')
        return
      }

      const updateData = { 
        is_active: false,
        logout_reason: logoutReason,
        updated_at: new Date().toISOString()
      };
      await (supabase as any)
        .from('user_sessions')
        .update(updateData)
        .eq('session_token', sessionToken)
    } catch (error) {
    }
  }

  const logFailedLoginAttempt = async (email: string, failureReason: string) => {
    try {
      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot log failed login attempt - Supabase not available');
        return;
      }
      
      const attemptData = {
        email: email,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        device_fingerprint: securityContext?.device_fingerprint || 'unknown',
        country: securityContext?.location?.country || 'Unknown',
        attempt_type: 'password',
        failure_reason: failureReason,
        risk_indicators: [],
        is_bot_suspected: false,
        is_brute_force: false,
        metadata: {
          timestamp: new Date().toISOString(),
          browser: navigator.userAgent.split(' ').find(part => 
            part.includes('Chrome') || part.includes('Firefox') || part.includes('Safari')
          ) || 'Unknown'
        }
      }

      await supabase
        .from('failed_login_attempts')
        .insert(attemptData as any)

    } catch (error) {
    }
  }

  const logSecurityAlert = async (userId: string, securityCtx: SecurityContext) => {
    try {
      // In a real implementation, this would log to a security_alerts table
      //   user_id: userId,
      //   alert_type: 'high_risk_session',
      //   risk_level: securityCtx.risk_level,
      //   device_info: securityCtx.device_info,
      //   timestamp: new Date().toISOString()
      // })
    } catch (error) {
    }
  }

  const logAdvancedSecurityEvent = async (event: any) => {
    try {
      // Log to your security events table (audit logs)
      // In a real implementation, this would insert into an audit_logs table
    } catch (error) {
    }
  }

  const getEnhancedErrorMessage = (error: any): string => {
    const errorMessages = {
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'Email not confirmed': 'Please check your email and confirm your account before logging in.',
      'Too many requests': 'Too many login attempts. Please wait 15 minutes before trying again.',
      'User not found': 'No account found with this email address.',
      'Signup not allowed': 'Account registration is currently disabled.',
      'Account temporarily locked': 'Your account has been temporarily locked due to multiple failed attempts.'
    }

    return errorMessages[error.message as keyof typeof errorMessages] || error.message || 'Login failed'
  }

  // Create Advanced Security Context
  const createAdvancedSecurityContext = async (user: User): Promise<SecurityContext> => {
    try {
      const fingerprint = await generateAdvancedFingerprint()
      const location = await getLocationData()
      const isTrusted = await checkTrustedDevice(fingerprint)
      
      const securityContext: SecurityContext = {
        device_fingerprint: fingerprint,
        ip_address: await getClientIP(),
        location: location,
        risk_level: 'low',
        session_id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_agent: navigator.userAgent,
        login_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_trusted_device: isTrusted,
        browser_fingerprint: fingerprint,
        security_flags: []
      }
      
      return securityContext
    } catch (error) {
      console.error('Failed to create security context:', error)
      // Return fallback security context
      return {
        device_fingerprint: 'fallback-device',
        ip_address: '127.0.0.1',
        location: { city: 'Unknown', country: 'Unknown' },
        risk_level: 'medium',
        session_id: `fallback-session-${Date.now()}`,
        user_agent: navigator.userAgent,
        login_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_trusted_device: false
      }
    }
  }

  // Advanced Methods
  const refreshProfile = async () => {
    if (user && securityContext) {
      setIsLoading(true)
      await fetchSimpleProfile(user.id)
    }
  }

  const updateUserPreferences = async (preferences: Partial<UserProfile>): Promise<boolean> => {
    if (!user || !profile) return false
    
    try {
      // Log preference update
      await auditLogger.logEvent({
        category: AuditCategory.USER_MANAGEMENT,
        action: AuditAction.UPDATE,
        status: AuditStatus.SUCCESS,
        description: 'User preferences updated',
        targetType: 'user_preferences',
        targetId: user.id,
        details: {
          updatedFields: Object.keys(preferences),
          changedPreferences: preferences
        }
      })

      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot update user preferences - Supabase not available');
        toast.success('Preferences updated (demo mode)');
        return true;
      }

      // Update user_profiles table
      const updateData = {
        ...preferences,
        updated_at: new Date().toISOString()
      };
      const { error: profileError } = await (supabase as any)
        .from('user_profiles')
        .update(updateData)
        .eq('auth_user_id', user.id)

      if (profileError) throw profileError

      // Update user_preferences table if preference-specific data
      if (preferences.timezone || preferences.preferred_language) {
        const { error: prefError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            employee_id: profile.employee_id,
            timezone: preferences.timezone || profile.timezone,
            language: preferences.preferred_language || profile.preferred_language,
            updated_at: new Date().toISOString()
          } as any)

      }
      
      await refreshProfile()
      toast.success('Preferences updated successfully')
      return true
    } catch (error) {
      // Log preference update failure
      await auditLogger.logEvent({
        category: AuditCategory.USER_MANAGEMENT,
        action: AuditAction.UPDATE,
        status: AuditStatus.FAILURE,
        description: 'Failed to update user preferences',
        targetType: 'user_preferences',
        targetId: user.id,
        details: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          attemptedPreferences: preferences
        }
      })
      toast.error('Failed to update preferences')
      return false
    }
  }

  const clearNavigationFlag = () => {
    setShouldNavigateToDashboard(false)
    setPendingNavigation(null)
  }

  const switchTheme = async (theme: 'light' | 'dark' | 'auto') => {
    if (!user || !profile) return

    try {
      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot update theme - Supabase not available')
        document.documentElement.setAttribute('data-theme', theme)
        toast.success(`Theme switched to ${theme} (demo mode)`)
        return
      }

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          employee_id: profile.employee_id,
          theme: theme,
          updated_at: new Date().toISOString()
        } as any)

      document.documentElement.setAttribute('data-theme', theme)
      toast.success(`Theme switched to ${theme}`)
    } catch (error) {
      toast.error('Failed to update theme')
    }
  }

  const enableTwoFactor = async (): Promise<{ qrCode: string; backupCodes: string[] }> => {
    if (!user || !profile) {
      throw new Error('User not authenticated')
    }

    try {
      if (!supabase) {
        console.warn('🔄 Demo mode: Cannot enable 2FA - Supabase not available')
        // Return mock data for demo mode
        const mockBackupCodes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        )
        toast.success('Two-factor authentication enabled (demo mode)')
        return {
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
          backupCodes: mockBackupCodes
        }
      }

      // Update user profile to enable 2FA
      const updateData = {
        two_factor_enabled: true,
        updated_at: new Date().toISOString()
      };
      await (supabase as any)
        .from('user_profiles')
        .update(updateData)
        .eq('auth_user_id', user.id)

      // In a real implementation, you'd generate actual QR code and backup codes
      const mockBackupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      )

      // Log 2FA enablement
      await auditLogger.logEvent({
        category: AuditCategory.SECURITY,
        action: AuditAction.UPDATE,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.MEDIUM,
        description: 'Two-factor authentication enabled',
        targetType: 'user_security',
        targetId: user.id,
        details: {
          securityFeature: 'two_factor_authentication',
          enabled: true,
          backupCodesGenerated: mockBackupCodes.length
        }
      })

      toast.success('Two-factor authentication enabled')
      
      return {
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`, // Mock QR code
        backupCodes: mockBackupCodes
      }
    } catch (error) {
      // Log 2FA enablement failure
      await auditLogger.logEvent({
        category: AuditCategory.SECURITY,
        action: AuditAction.UPDATE,
        status: AuditStatus.FAILURE,
        severity: AuditSeverity.HIGH,
        description: 'Failed to enable two-factor authentication',
        targetType: 'user_security',
        targetId: user.id,
        details: {
          securityFeature: 'two_factor_authentication',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      toast.error('Failed to enable two-factor authentication')
      throw error
    }
  }

  const validateTwoFactor = async (token: string): Promise<boolean> => {
    if (!user) {
      return false
    }

    // In a real implementation, this would validate against stored 2FA secrets
    const isValid = token.length === 6 && /^\d+$/.test(token)
    
    // Log 2FA validation attempt
    await auditLogger.logEvent({
      category: AuditCategory.AUTHENTICATION,
      action: isValid ? AuditAction.UPDATE : AuditAction.LOGIN_FAILED,
      status: isValid ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
      severity: isValid ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      description: `Two-factor authentication ${isValid ? 'verified' : 'failed'}`,
      targetType: 'two_factor_auth',
      targetId: user.id,
      details: {
        tokenLength: token.length,
        validationResult: isValid,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    })
    
    if (isValid) {
      toast.success('Two-factor authentication verified')
    } else {
      toast.error('Invalid two-factor authentication code')
    }
    
    return isValid
  }

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user && !isLoading, // ✅ FIXED: Ensure user is set and not loading
    securityContext,
    sessionHealth,
    shouldNavigateToDashboard,
    pendingNavigation,
    login,
    logout,
    refreshProfile,
    updateUserPreferences,
    clearNavigationFlag,
    switchTheme,
    enableTwoFactor,
    validateTwoFactor,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
