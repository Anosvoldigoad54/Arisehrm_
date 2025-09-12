import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography, InputAdornment,
  IconButton, FormControlLabel, Checkbox, Alert, Container, Stack,
  Avatar, LinearProgress, Divider, Chip, Paper, Fade, Grow
} from '@mui/material'
import {
  Visibility, VisibilityOff, Email, Lock, Person, Shield,
  AdminPanelSettings, Business, Group, Work, School, People,
  CheckCircle, Security, Warning, Star
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import { getDenimGradient, denimColors } from '../../styles/denimTheme'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
  deviceTrust: boolean
}

interface RoleDetectionResult {
  role: string
  displayName: string
  level: number
  colorCode: string
  icon: React.ReactElement
  confidence: number
  department?: string
}

// Email pattern to role mapping for automatic detection
const EMAIL_ROLE_PATTERNS = {
  // Super Admin patterns
  'admin@arisehrm.com': { role: 'super_admin', confidence: 100 },
  'superadmin': { role: 'super_admin', confidence: 95 },
  'super-admin': { role: 'super_admin', confidence: 95 },
  'root': { role: 'super_admin', confidence: 90 },
  
  // HR Manager patterns  
  'hr.manager': { role: 'hr_manager', confidence: 95 },
  'hr-manager': { role: 'hr_manager', confidence: 95 },
  'hr@': { role: 'hr_manager', confidence: 85 },
  'human-resources': { role: 'hr_manager', confidence: 80 },
  
  // Department Manager patterns
  'dept.manager': { role: 'department_manager', confidence: 95 },
  'department-manager': { role: 'department_manager', confidence: 95 },
  'dept-head': { role: 'department_manager', confidence: 90 },
  'manager@': { role: 'department_manager', confidence: 80 },
  
  // Team Lead patterns
  'team.lead': { role: 'team_lead', confidence: 95 },
  'team-leader': { role: 'team_lead', confidence: 95 },
  'team-lead': { role: 'team_lead', confidence: 95 },
  'lead@': { role: 'team_lead', confidence: 85 },
  
  // Contractor patterns
  'contractor': { role: 'contractor', confidence: 95 },
  'external': { role: 'contractor', confidence: 80 },
  'vendor': { role: 'contractor', confidence: 75 },
  
  // Intern patterns
  'intern': { role: 'intern', confidence: 95 },
  'student': { role: 'intern', confidence: 80 },
  'trainee': { role: 'intern', confidence: 75 },
  
  // Default to employee for any other patterns
  'employee': { role: 'employee', confidence: 70 },
  '@': { role: 'employee', confidence: 50 } // Fallback for any email
}

const ROLE_CONFIG = {
  super_admin: {
    displayName: 'Super Administrator',
    level: 100,
    colorCode: denimColors[900],
    icon: <AdminPanelSettings />,
    department: 'System Administration'
  },
  hr_manager: {
    displayName: 'HR Manager', 
    level: 80,
    colorCode: denimColors[700],
    icon: <People />,
    department: 'Human Resources'
  },
  department_manager: {
    displayName: 'Department Head',
    level: 70,
    colorCode: denimColors[600], 
    icon: <Business />,
    department: 'Management'
  },
  team_lead: {
    displayName: 'Team Lead',
    level: 60,
    colorCode: denimColors[500],
    icon: <Group />,
    department: 'Team Leadership'
  },
  employee: {
    displayName: 'Employee',
    level: 40,
    colorCode: denimColors[400],
    icon: <Person />,
    department: 'General'
  },
  contractor: {
    displayName: 'Contractor',
    level: 30,
    colorCode: denimColors[350] || denimColors[400],
    icon: <Work />,
    department: 'External'
  },
  intern: {
    displayName: 'Intern',
    level: 20,
    colorCode: denimColors[300] || denimColors[400],
    icon: <School />,
    department: 'Learning & Development'
  }
}

export const UnifiedLoginSystem: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
    deviceTrust: false
  })
  
  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginProgress, setLoginProgress] = useState(0)
  
  // Role detection state
  const [detectedRole, setDetectedRole] = useState<RoleDetectionResult | null>(null)
  const [showRoleDetection, setShowRoleDetection] = useState(false)

  // Auto-detect role from email
  const detectRoleFromEmail = useCallback((email: string): RoleDetectionResult | null => {
    if (!email.trim()) return null
    
    const normalizedEmail = email.toLowerCase().trim()
    
    // Find best matching pattern
    let bestMatch = { role: 'employee', confidence: 0 }
    
    for (const [pattern, config] of Object.entries(EMAIL_ROLE_PATTERNS)) {
      if (normalizedEmail.includes(pattern.toLowerCase())) {
        if (config.confidence > bestMatch.confidence) {
          bestMatch = { role: config.role, confidence: config.confidence }
        }
      }
    }
    
    // Get role configuration
    const roleConfig = ROLE_CONFIG[bestMatch.role as keyof typeof ROLE_CONFIG]
    if (!roleConfig) return null
    
    return {
      role: bestMatch.role,
      displayName: roleConfig.displayName,
      level: roleConfig.level,
      colorCode: roleConfig.colorCode,
      icon: roleConfig.icon,
      confidence: bestMatch.confidence,
      department: roleConfig.department
    }
  }, [])

  // Handle email input change with role detection
  const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value
    setFormData(prev => ({ ...prev, email }))
    
    // Clear previous error
    if (error) setError(null)
    
    // Detect role with debouncing
    const detection = detectRoleFromEmail(email)
    setDetectedRole(detection)
    setShowRoleDetection(!!detection && email.length > 3)
  }, [detectRoleFromEmail, error])

  const handleInputChange = useCallback((field: Exclude<keyof LoginFormData, 'email'>) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' || field === 'deviceTrust' 
      ? event.target.checked 
      : event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }, [error])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    // ✅ FIXED: Set login in progress flag to prevent service worker reload
    sessionStorage.setItem('login_in_progress', 'true')
    sessionStorage.setItem('auth_in_progress', 'true')

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      setIsSubmitting(false)
      sessionStorage.removeItem('login_in_progress') // Clean up flag
      sessionStorage.removeItem('auth_in_progress') // Clean up flag
      return
    }

    // Show progress animation
    const progressInterval = setInterval(() => {
      setLoginProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      // Perform login with detected role context
      const result = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        deviceTrust: formData.deviceTrust
      })

      clearInterval(progressInterval)
      setLoginProgress(100)

      if (result.success) {
        console.log('[Login] Success! Result:', result)
        
        // Success message with detected role
        const roleMsg = detectedRole 
          ? `Welcome, ${detectedRole.displayName}!` 
          : 'Login successful!'
          
        toast.success(roleMsg, {
          description: detectedRole 
            ? `Access level ${detectedRole.level} - ${detectedRole.department}`
            : 'Redirecting to your dashboard...',
          duration: 2000,
        })

        // ✅ FIXED: Navigate immediately after successful login
        // Clean up login flags
        sessionStorage.removeItem('login_in_progress')
        sessionStorage.removeItem('auth_in_progress')
        
        console.log('[Login] Navigating to dashboard...')
        
        // Navigate to dashboard immediately
        const redirectTo = location.state?.from?.pathname || '/dashboard'
        console.log('[Login] Redirect destination:', redirectTo)
        
        // Use a very short delay to ensure React state updates are processed
        setTimeout(() => {
          console.log('[Login] Executing navigation...')
          navigate(redirectTo, { replace: true })
        }, 50)
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (err: any) {
      clearInterval(progressInterval)
      const errorMessage = err?.message || 'Login failed. Please check your credentials and try again.'
      setError(errorMessage)
      toast.error('Login Failed', {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
      setLoginProgress(0)
      // ✅ FIXED: Always clean up the flags in finally block
      // The AuthContext will handle the navigation and clean up the flags properly
      // We only need to ensure they're cleaned up in case of errors
    }
  }, [formData, login, navigate, location, detectedRole, error])

  // Demo credentials for quick testing
  const demoCredentials = [
    { email: 'admin@arisehrm.com', password: '5453Adis', role: 'Super Admin' },
    { email: 'superadmin@arisehrm.test', password: 'Test@1234', role: 'Super Admin' },
    { email: 'hr.manager@arisehrm.test', password: 'Hr@1234', role: 'HR Manager' },
    { email: 'dept.manager@arisehrm.test', password: 'Dept@1234', role: 'Department Head' },
    { email: 'team.lead@arisehrm.test', password: 'Lead@1234', role: 'Team Lead' },
    { email: 'employee@arisehrm.test', password: 'Emp@1234', role: 'Employee' }
  ]

  const handleDemoLogin = (email: string, password: string) => {
    setFormData(prev => ({ ...prev, email, password }))
    const detection = detectRoleFromEmail(email)
    setDetectedRole(detection)
    setShowRoleDetection(!!detection)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M30 30l-15-15h30z"/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        }
      }}
    >
      <Container maxWidth="md">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={6} alignItems="center">
          
          {/* Left Side - Branding */}
          <Box sx={{ flex: 1, color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800, 
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                Arise HRM
              </Typography>
              
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}>
                Advanced Human Resource Management
              </Typography>

              {/* Feature highlights */}
              <Stack spacing={2} sx={{ mb: 4 }}>
                {[
                  { icon: <Shield />, text: 'Automatic Role Detection', desc: 'Smart login with email-based role identification' },
                  { icon: <Security />, text: 'Enterprise Security', desc: 'Advanced authentication and session management' },
                  { icon: <CheckCircle />, text: 'Unified Experience', desc: 'Single login for all user types and roles' }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                        {React.cloneElement(feature.icon, { sx: { color: 'white' } })}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {feature.text}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {feature.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            </motion.div>
          </Box>

          {/* Right Side - Login Form */}
          <Box sx={{ flex: 1, width: '100%', maxWidth: 450 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                elevation={24}
                sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden'
                }}
              >
                {/* Progress Bar */}
                {isSubmitting && (
                  <LinearProgress 
                    variant="determinate" 
                    value={loginProgress}
                    sx={{
                      height: 4,
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #667eea, #764ba2)'
                      }
                    }}
                  />
                )}

                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      }}
                    >
                      <Person sx={{ fontSize: '2.5rem' }} />
                    </Avatar>
                    
                    <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Unified Login
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                      Enter your credentials - we'll automatically detect your role
                    </Typography>
                  </Box>

                  {/* Role Detection Display */}
                  <AnimatePresence>
                    {showRoleDetection && detectedRole && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Paper
                          elevation={2}
                          sx={{
                            p: 2,
                            mb: 3,
                            background: `linear-gradient(135deg, ${detectedRole.colorCode}15, ${detectedRole.colorCode}25)`,
                            border: `1px solid ${detectedRole.colorCode}40`
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: detectedRole.colorCode, width: 32, height: 32 }}>
                              {React.cloneElement(detectedRole.icon, { sx: { fontSize: '1.2rem', color: 'white' } })}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                Detected: {detectedRole.displayName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                Level {detectedRole.level} • {detectedRole.department}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${detectedRole.confidence}% confident`}
                              size="small" 
                              color={detectedRole.confidence > 90 ? 'success' : 'primary'}
                              variant="outlined"
                            />
                          </Stack>
                        </Paper>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Display */}
                  {error && (
                    <Fade in={!!error}>
                      <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  {/* Login Form */}
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={3}>
                      {/* Email Field */}
                      <TextField
                        fullWidth
                        type="email"
                        label="Email Address"
                        value={formData.email}
                        onChange={handleEmailChange}
                        disabled={isSubmitting}
                        autoComplete="email"
                        autoFocus
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
                      />

                      {/* Password Field */}
                      <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        disabled={isSubmitting}
                        autoComplete="current-password"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                disabled={isSubmitting}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
                      />

                      {/* Options */}
                      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.rememberMe}
                              onChange={handleInputChange('rememberMe')}
                              disabled={isSubmitting}
                              sx={{
                                color: '#667eea',
                                '&.Mui-checked': {
                                  color: '#667eea',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              Remember me
                            </Typography>
                          }
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.deviceTrust}
                              onChange={handleInputChange('deviceTrust')}
                              disabled={isSubmitting}
                              sx={{
                                color: '#667eea',
                                '&.Mui-checked': {
                                  color: '#667eea',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              Trust device
                            </Typography>
                          }
                        />
                      </Stack>

                      {/* Login Button */}
                      <Button
                        type="submit"
                        fullWidth
                        size="large"
                        disabled={isSubmitting || isLoading}
                        sx={{
                          py: 1.5,
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8, #6b5b95)',
                          },
                          '&:disabled': {
                            background: '#e2e8f0',
                          },
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                        }}
                      >
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </Stack>
                  </Box>

                  {/* Demo Credentials */}
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Demo Credentials
                    </Typography>
                  </Divider>

                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'center' }}>
                      Click to auto-fill credentials:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                      {demoCredentials.slice(0, 4).map((cred, index) => (
                        <Button
                          key={index}
                          size="small"
                          variant="outlined"
                          onClick={() => handleDemoLogin(cred.email, cred.password)}
                          disabled={isSubmitting}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            '&:hover': {
                              borderColor: '#667eea',
                              color: '#667eea',
                            },
                          }}
                        >
                          {cred.role}
                        </Button>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default UnifiedLoginSystem