'use client'

import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { ROLES } from '../types/permissions'

// Role detection patterns
export interface RoleDetectionRule {
  pattern: RegExp | string
  role: string
  priority: number // Higher number = higher priority
  description: string
  requiresApproval?: boolean
  additionalRequirements?: string[]
}

// Email domain-based role detection rules
export const EMAIL_ROLE_RULES: RoleDetectionRule[] = [
  // Super Admin patterns
  {
    pattern: /^(admin|superadmin|root|system)@/i,
    role: 'super_admin',
    priority: 100,
    description: 'Super Administrator - System account',
    requiresApproval: false
  },
  {
    pattern: /^.*@(admin|superadmin|system)\./i,
    role: 'super_admin',
    priority: 95,
    description: 'Super Administrator - Admin domain',
    requiresApproval: true
  },

  // Admin patterns
  {
    pattern: /^(it|tech|admin|administrator)@/i,
    role: 'admin',
    priority: 90,
    description: 'Administrator - IT/Tech account',
    requiresApproval: false
  },
  {
    pattern: /^.*@(it|admin|tech)\./i,
    role: 'admin',
    priority: 85,
    description: 'Administrator - IT domain',
    requiresApproval: true
  },

  // HR Manager patterns
  {
    pattern: /^(hr|human-?resources?|people|talent|recruiting?)@/i,
    role: 'hr_manager',
    priority: 80,
    description: 'HR Manager - Human Resources account',
    requiresApproval: false
  },
  {
    pattern: /^.*@(hr|humanresources|people|talent)\./i,
    role: 'hr_manager',
    priority: 75,
    description: 'HR Manager - HR domain',
    requiresApproval: false
  },

  // Department Manager patterns
  {
    pattern: /^(manager|dept|department|head|director|lead|chief)@/i,
    role: 'department_manager',
    priority: 70,
    description: 'Department Manager - Management account',
    requiresApproval: true
  },
  {
    pattern: /^(finance|accounting|legal|marketing|sales|operations)@/i,
    role: 'department_manager',
    priority: 65,
    description: 'Department Manager - Department head',
    requiresApproval: true
  },

  // Team Leader patterns
  {
    pattern: /^(team-?lead|supervisor|coordinator|senior)@/i,
    role: 'team_lead',
    priority: 60,
    description: 'Team Leader - Team management',
    requiresApproval: true
  },
  {
    pattern: /^senior\./i,
    role: 'senior_employee',
    priority: 55,
    description: 'Senior Employee - Experienced staff',
    requiresApproval: false
  },

  // Default Employee pattern (lowest priority)
  {
    pattern: /^.*@.*$/,
    role: 'employee',
    priority: 10,
    description: 'Employee - Standard access',
    requiresApproval: false
  }
]

// Domain-specific role mappings
export const DOMAIN_ROLE_MAPPING: Record<string, string> = {
  'arisehrm.com': 'employee',
  'admin.arisehrm.com': 'admin',
  'hr.arisehrm.com': 'hr_manager',
  'managers.arisehrm.com': 'department_manager',
  'leads.arisehrm.com': 'team_lead',
  'system.arisehrm.com': 'super_admin'
}

// Company-specific patterns
export const COMPANY_PATTERNS = {
  departments: ['finance', 'hr', 'it', 'marketing', 'sales', 'legal', 'operations'],
  managementTitles: ['manager', 'director', 'head', 'lead', 'chief', 'vp', 'president'],
  seniorityLevels: ['senior', 'lead', 'principal', 'staff']
}

export interface RoleDetectionResult {
  suggestedRole: string
  confidence: number // 0-100
  matchedRule: RoleDetectionRule
  requiresApproval: boolean
  alternativeRoles?: string[]
  securityFlags?: string[]
}

export interface TemporaryPasswordResult {
  temporaryPassword: string
  expiresAt: string
  mustChangeOnLogin: boolean
  securityToken: string
}

export interface SecurityAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskFactors: string[]
  recommendations: string[]
  allowLogin: boolean
  requiresAdditionalVerification: boolean
}

export class AdvancedLoginService {
  private static instance: AdvancedLoginService
  private rateLimitMap = new Map<string, { attempts: number; lastAttempt: number }>()
  private suspiciousIPs = new Set<string>()
  
  static getInstance(): AdvancedLoginService {
    if (!AdvancedLoginService.instance) {
      AdvancedLoginService.instance = new AdvancedLoginService()
    }
    return AdvancedLoginService.instance
  }

  /**
   * Detect user role based on email address and patterns
   */
  async detectRoleFromEmail(email: string): Promise<RoleDetectionResult> {
    try {
      const normalizedEmail = email.toLowerCase().trim()
      const domain = normalizedEmail.split('@')[1]
      
      // Check domain-specific mappings first
      if (DOMAIN_ROLE_MAPPING[domain]) {
        const role = DOMAIN_ROLE_MAPPING[domain]
        const rule: RoleDetectionRule = {
          pattern: domain,
          role,
          priority: 100,
          description: `Direct domain mapping for ${domain}`,
          requiresApproval: false
        }
        
        return {
          suggestedRole: role,
          confidence: 95,
          matchedRule: rule,
          requiresApproval: false
        }
      }

      // Apply pattern-based detection
      let bestMatch: RoleDetectionResult | null = null
      let highestPriority = 0

      for (const rule of EMAIL_ROLE_RULES) {
        const pattern = typeof rule.pattern === 'string' 
          ? new RegExp(rule.pattern, 'i') 
          : rule.pattern

        if (pattern.test(normalizedEmail) && rule.priority > highestPriority) {
          highestPriority = rule.priority
          
          const confidence = this.calculateConfidence(normalizedEmail, rule)
          const alternativeRoles = this.getAlternativeRoles(normalizedEmail, rule)
          const securityFlags = this.analyzeSecurityFlags(normalizedEmail)

          bestMatch = {
            suggestedRole: rule.role,
            confidence,
            matchedRule: rule,
            requiresApproval: rule.requiresApproval || confidence < 80,
            alternativeRoles,
            securityFlags
          }
        }
      }

      if (!bestMatch) {
        // Fallback to employee role
        const fallbackRule: RoleDetectionRule = {
          pattern: /.*@.*/,
          role: 'employee',
          priority: 0,
          description: 'Default employee role - manual review recommended'
        }

        bestMatch = {
          suggestedRole: 'employee',
          confidence: 50,
          matchedRule: fallbackRule,
          requiresApproval: true,
          securityFlags: ['unknown_pattern']
        }
      }

      return bestMatch
    } catch (error) {
      throw new Error('Failed to detect user role from email')
    }
  }

  /**
   * Create temporary password for new user
   */
  async createTemporaryPassword(
    email: string, 
    role: string, 
    createdBy?: string
  ): Promise<TemporaryPasswordResult> {
    try {
      // Generate secure temporary password
      const tempPassword = this.generateSecureTemporaryPassword()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry
      
      const securityToken = crypto.randomUUID()

      // Store in database
      const { error } = await supabase
        .from('temporary_passwords')
        .insert({
          email: email.toLowerCase(),
          role_name: role,
          temporary_password_hash: await this.hashPassword(tempPassword),
          expires_at: expiresAt.toISOString(),
          security_token: securityToken,
          created_by: createdBy || 'system',
          is_used: false,
          must_change_on_login: true,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // Log creation event
      await this.logSecurityEvent({
        event_type: 'TEMPORARY_PASSWORD_CREATED',
        email,
        role,
        created_by: createdBy || 'system',
        security_token: securityToken
      })

      return {
        temporaryPassword: tempPassword,
        expiresAt: expiresAt.toISOString(),
        mustChangeOnLogin: true,
        securityToken
      }
    } catch (error) {
      throw new Error('Failed to create temporary password')
    }
  }

  /**
   * Validate temporary password and create user account
   */
  async validateTemporaryPasswordLogin(
    email: string, 
    tempPassword: string,
    newPassword?: string
  ): Promise<{ success: boolean; user?: any; requiresPasswordChange?: boolean; error?: string }> {
    try {
      const normalizedEmail = email.toLowerCase().trim()

      // Get temporary password record
      const { data: tempRecord, error: fetchError } = await supabase
        .from('temporary_passwords')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError || !tempRecord) {
        return { 
          success: false, 
          error: 'Invalid or expired temporary password' 
        }
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(tempPassword, tempRecord.temporary_password_hash)
      
      if (!isValidPassword) {
        await this.logSecurityEvent({
          event_type: 'INVALID_TEMPORARY_PASSWORD',
          email: normalizedEmail,
          ip_address: await this.getCurrentIP()
        })
        
        return { 
          success: false, 
          error: 'Invalid temporary password' 
        }
      }

      // Check if user needs to set new password
      if (!newPassword && tempRecord.must_change_on_login) {
        return {
          success: false,
          requiresPasswordChange: true,
          error: 'Please set a new password'
        }
      }

      // Create or update Supabase auth user
      let authUser
      const finalPassword = newPassword || tempPassword

      // Try to create new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: finalPassword,
        options: {
          data: {
            role: tempRecord.role_name,
            created_via_temp_password: true,
            temp_password_token: tempRecord.security_token
          }
        }
      })

      if (signUpError) {
        // If user already exists, try to update
        if (signUpError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: finalPassword
          })

          if (signInError) {
            return {
              success: false,
              error: 'Account exists but password doesn\'t match'
            }
          }

          authUser = signInData.user
        } else {
          throw signUpError
        }
      } else {
        authUser = signUpData.user
      }

      if (!authUser) {
        return { success: false, error: 'Failed to create user account' }
      }

      // Mark temporary password as used
      await supabase
        .from('temporary_passwords')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          auth_user_id: authUser.id
        })
        .eq('id', tempRecord.id)

      // Create user profile
      await this.createUserProfileFromTempPassword(authUser.id, tempRecord)

      // Log successful activation
      await this.logSecurityEvent({
        event_type: 'TEMPORARY_PASSWORD_ACTIVATED',
        email: normalizedEmail,
        user_id: authUser.id,
        role: tempRecord.role_name,
        security_token: tempRecord.security_token
      })

      return {
        success: true,
        user: authUser
      }

    } catch (error) {
      return {
        success: false,
        error: 'Failed to validate temporary password'
      }
    }
  }

  /**
   * Advanced security assessment before login
   */
  async assessLoginSecurity(
    email: string, 
    ipAddress: string,
    deviceFingerprint: string
  ): Promise<SecurityAssessment> {
    try {
      const riskFactors: string[] = []
      const recommendations: string[] = []
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

      // Check rate limiting
      const rateLimitResult = this.checkRateLimit(email, ipAddress)
      if (!rateLimitResult.allowed) {
        riskFactors.push('rate_limit_exceeded')
        riskLevel = 'high'
        recommendations.push(`Wait ${Math.ceil(rateLimitResult.waitTime! / 60000)} minutes before trying again`)
      }

      // Check suspicious IP
      if (this.suspiciousIPs.has(ipAddress)) {
        riskFactors.push('suspicious_ip')
        riskLevel = riskLevel === 'low' ? 'medium' : 'high'
        recommendations.push('Additional verification required')
      }

      // Check failed attempts from database
      const { data: recentFailures } = await supabase
        .from('failed_login_attempts')
        .select('*')
        .eq('email', email.toLowerCase())
        .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('created_at', { ascending: false })

      if (recentFailures && recentFailures.length >= 5) {
        riskFactors.push('multiple_failed_attempts')
        riskLevel = 'high'
        recommendations.push('Account may be under attack')
      }

      // Check for unusual time access
      const currentHour = new Date().getHours()
      if (currentHour < 6 || currentHour > 22) {
        riskFactors.push('unusual_time')
        if (riskLevel === 'low') riskLevel = 'medium'
        recommendations.push('Unusual login time detected')
      }

      // Check device fingerprint against known devices
      const { data: knownDevices } = await supabase
        .from('user_sessions')
        .select('device_fingerprint')
        .eq('email', email.toLowerCase())
        .eq('is_trusted_device', true)

      const isKnownDevice = knownDevices?.some(d => d.device_fingerprint === deviceFingerprint)
      if (!isKnownDevice && knownDevices && knownDevices.length > 0) {
        riskFactors.push('unknown_device')
        if (riskLevel === 'low') riskLevel = 'medium'
        recommendations.push('New device detected - verification recommended')
      }

      // Determine final assessment
      const allowLogin = riskLevel !== 'critical' && !riskFactors.includes('rate_limit_exceeded')
      const requiresAdditionalVerification = riskLevel === 'high' || riskLevel === 'critical'

      return {
        riskLevel,
        riskFactors,
        recommendations,
        allowLogin,
        requiresAdditionalVerification
      }

    } catch (error) {
      // Fail secure - high risk if we can't assess
      return {
        riskLevel: 'high',
        riskFactors: ['assessment_failed'],
        recommendations: ['Additional verification required'],
        allowLogin: true, // Don't block completely on assessment failure
        requiresAdditionalVerification: true
      }
    }
  }

  /**
   * Enhanced login with role detection and security
   */
  async performAdvancedLogin(
    email: string,
    password: string,
    options: {
      deviceFingerprint?: string
      ipAddress?: string
      userAgent?: string
      rememberMe?: boolean
      deviceTrust?: boolean
    } = {}
  ) {
    try {
      const normalizedEmail = email.toLowerCase().trim()
      const ipAddress = options.ipAddress || (await this.getCurrentIP())
      const deviceFingerprint = options.deviceFingerprint || (await this.generateDeviceFingerprint())

      // Security assessment
      const securityAssessment = await this.assessLoginSecurity(
        normalizedEmail,
        ipAddress,
        deviceFingerprint
      )

      if (!securityAssessment.allowLogin) {
        throw new Error('Login blocked due to security concerns: ' + securityAssessment.riskFactors.join(', '))
      }

      // Attempt authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      })

      if (authError) {
        await this.logFailedAttempt(normalizedEmail, ipAddress, authError.message)
        throw authError
      }

      if (!data.user) {
        throw new Error('Authentication successful but no user data received')
      }

      // Role detection for existing users
      const roleDetection = await this.detectRoleFromEmail(normalizedEmail)
      
      // Update user profile with detected role if needed
      await this.updateUserRoleIfNeeded(data.user.id, roleDetection)

      // Create enhanced session
      await this.createEnhancedSession(data.user.id, {
        ipAddress,
        deviceFingerprint,
        userAgent: options.userAgent || navigator.userAgent,
        riskLevel: securityAssessment.riskLevel,
        isTrustedDevice: options.deviceTrust || false,
        securityFlags: roleDetection.securityFlags || []
      })

      // Log successful login
      await this.logSecurityEvent({
        event_type: 'ADVANCED_LOGIN_SUCCESS',
        user_id: data.user.id,
        email: normalizedEmail,
        role: roleDetection.suggestedRole,
        risk_level: securityAssessment.riskLevel,
        ip_address: ipAddress,
        device_fingerprint: deviceFingerprint
      })

      return {
        success: true,
        user: data.user,
        roleDetection,
        securityAssessment,
        requiresAdditionalVerification: securityAssessment.requiresAdditionalVerification
      }

    } catch (error) {
      throw error
    }
  }

  // Private helper methods

  private calculateConfidence(email: string, rule: RoleDetectionRule): number {
    let confidence = rule.priority

    // Boost confidence for exact domain matches
    if (email.includes('@' + rule.pattern.toString().replace(/[^\w.]/g, ''))) {
      confidence += 20
    }

    // Reduce confidence for generic patterns
    if (rule.pattern.toString().includes('.*')) {
      confidence -= 10
    }

    // Boost confidence for specific role keywords
    const roleKeywords = {
      admin: ['admin', 'administrator', 'root', 'system'],
      hr_manager: ['hr', 'human', 'people', 'talent'],
      department_manager: ['manager', 'director', 'head', 'chief'],
      team_lead: ['lead', 'supervisor', 'coordinator']
    }

    const keywords = roleKeywords[rule.role as keyof typeof roleKeywords] || []
    for (const keyword of keywords) {
      if (email.toLowerCase().includes(keyword)) {
        confidence += 5
      }
    }

    return Math.min(100, Math.max(0, confidence))
  }

  private getAlternativeRoles(email: string, primaryRule: RoleDetectionRule): string[] {
    const alternatives: string[] = []
    
    for (const rule of EMAIL_ROLE_RULES) {
      if (rule.role !== primaryRule.role) {
        const pattern = typeof rule.pattern === 'string' 
          ? new RegExp(rule.pattern, 'i') 
          : rule.pattern
        
        if (pattern.test(email) && rule.priority > 40) {
          alternatives.push(rule.role)
        }
      }
    }

    return alternatives.slice(0, 3) // Limit to top 3 alternatives
  }

  private analyzeSecurityFlags(email: string): string[] {
    const flags: string[] = []

    // Check for potentially suspicious patterns
    if (/\d{4,}/.test(email)) {
      flags.push('numeric_sequence')
    }

    if (/test|temp|demo|fake/i.test(email)) {
      flags.push('test_account_pattern')
    }

    if (email.split('@')[0].length < 3) {
      flags.push('short_username')
    }

    const domain = email.split('@')[1]
    if (domain && (domain.includes('gmail') || domain.includes('yahoo') || domain.includes('hotmail'))) {
      flags.push('personal_email_domain')
    }

    return flags
  }

  private generateSecureTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*'
    let password = ''
    
    // Ensure at least one of each character type
    password += 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)] // Uppercase
    password += 'abcdefghijkmnpqrstuvwxyz'[Math.floor(Math.random() * 23)] // Lowercase
    password += '23456789'[Math.floor(Math.random() * 8)] // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)] // Special
    
    // Fill remaining length
    for (let i = 4; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }

  private checkRateLimit(
    identifier: string, 
    ipAddress: string
  ): { allowed: boolean; waitTime?: number } {
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxAttempts = 5

    const emailKey = `email:${identifier}`
    const ipKey = `ip:${ipAddress}`

    // Check email-based rate limit
    const emailLimit = this.rateLimitMap.get(emailKey)
    if (emailLimit && now - emailLimit.lastAttempt < windowMs) {
      if (emailLimit.attempts >= maxAttempts) {
        return {
          allowed: false,
          waitTime: windowMs - (now - emailLimit.lastAttempt)
        }
      }
      emailLimit.attempts++
      emailLimit.lastAttempt = now
    } else {
      this.rateLimitMap.set(emailKey, { attempts: 1, lastAttempt: now })
    }

    // Check IP-based rate limit
    const ipLimit = this.rateLimitMap.get(ipKey)
    if (ipLimit && now - ipLimit.lastAttempt < windowMs) {
      if (ipLimit.attempts >= maxAttempts * 3) { // Higher limit for IP
        this.suspiciousIPs.add(ipAddress)
        return {
          allowed: false,
          waitTime: windowMs - (now - ipLimit.lastAttempt)
        }
      }
      ipLimit.attempts++
      ipLimit.lastAttempt = now
    } else {
      this.rateLimitMap.set(ipKey, { attempts: 1, lastAttempt: now })
    }

    return { allowed: true }
  }

  private async getCurrentIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  private async generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('AriseHRM_DeviceID', 2, 2)

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL()
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(fingerprint))
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async createUserProfileFromTempPassword(userId: string, tempRecord: any) {
    try {
      const userProfile = {
        auth_user_id: userId,
        employee_id: `EMP${Date.now()}`,
        email: tempRecord.email,
        first_name: tempRecord.first_name || tempRecord.email.split('@')[0],
        last_name: tempRecord.last_name || '',
        role_name: tempRecord.role_name,
        is_active: true,
        created_via_temp_password: true,
        temp_password_token: tempRecord.security_token,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_profiles')
        .insert(userProfile)

      if (error) throw error

    } catch (error) {
    }
  }

  private async updateUserRoleIfNeeded(userId: string, roleDetection: RoleDetectionResult) {
    try {
      // Only update if confidence is high and doesn't require approval
      if (roleDetection.confidence >= 80 && !roleDetection.requiresApproval) {
        await supabase
          .from('user_profiles')
          .update({
            role_name: roleDetection.suggestedRole,
            role_detection_confidence: roleDetection.confidence,
            role_detection_method: 'email_pattern',
            updated_at: new Date().toISOString()
          })
          .eq('auth_user_id', userId)
      }
    } catch (error) {
    }
  }

  private async createEnhancedSession(userId: string, sessionData: any) {
    try {
      const session = {
        user_id: userId,
        session_token: crypto.randomUUID(),
        device_fingerprint: sessionData.deviceFingerprint,
        ip_address: sessionData.ipAddress,
        user_agent: sessionData.userAgent,
        risk_level: sessionData.riskLevel,
        is_trusted_device: sessionData.isTrustedDevice,
        security_flags: sessionData.securityFlags,
        is_active: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      }

      await supabase
        .from('user_sessions')
        .insert(session)

    } catch (error) {
    }
  }

  private async logFailedAttempt(email: string, ipAddress: string, reason: string) {
    try {
      await supabase
        .from('failed_login_attempts')
        .insert({
          email: email.toLowerCase(),
          ip_address: ipAddress,
          failure_reason: reason,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        })
    } catch (error) {
    }
  }

  private async logSecurityEvent(event: any) {
    try {
      await supabase
        .from('security_audit_logs')
        .insert({
          ...event,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
    }
  }
}

// Export singleton instance
export const advancedLoginService = AdvancedLoginService.getInstance()
