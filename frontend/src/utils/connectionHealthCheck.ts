import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

interface HealthCheckResult {
  overall: 'healthy' | 'warning' | 'error'
  database: {
    connected: boolean
    authenticated: boolean
    rlsActive: boolean
    message: string
  }
  environment: {
    hasUrl: boolean
    hasAnonKey: boolean
    message: string
  }
  recommendations: string[]
}

/**
 * Comprehensive health check for database connectivity
 * Provides clear, user-friendly status information
 */
export async function performConnectionHealthCheck(): Promise<HealthCheckResult> {
  
  const result: HealthCheckResult = {
    overall: 'healthy',
    database: {
      connected: false,
      authenticated: false,
      rlsActive: false,
      message: ''
    },
    environment: {
      hasUrl: false,
      hasAnonKey: false,
      message: ''
    },
    recommendations: []
  }

  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  result.environment.hasUrl = !!supabaseUrl
  result.environment.hasAnonKey = !!supabaseAnonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    result.overall = 'error'
    result.environment.message = 'Missing required environment variables'
    result.recommendations.push('Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    return result
  } else {
    result.environment.message = 'Environment variables configured correctly'
  }

  // Check authentication status
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      result.database.authenticated = false
    } else if (user) {
      result.database.authenticated = true
    } else {
      result.database.authenticated = false
    }
  } catch (error) {
  }

  // Test database connectivity
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)

    if (error) {
      // Check if it's an RLS/permission error
      const isRLSError = error.message?.toLowerCase().includes('permission denied') ||
                        error.message?.toLowerCase().includes('rls') ||
                        error.message?.toLowerCase().includes('policy')

      if (isRLSError) {
        result.database.connected = true
        result.database.rlsActive = true
        result.database.message = 'Database connected. RLS policies are active (security working correctly)'
        
        if (!result.database.authenticated) {
          result.overall = 'warning'
          result.recommendations.push('Consider signing in for full functionality')
        }
        
      } else {
        result.database.connected = false
        result.database.message = `Database connection error: ${error.message}`
        result.overall = 'error'
        result.recommendations.push('Check your Supabase project status and network connectivity')
      }
    } else {
      result.database.connected = true
      result.database.message = 'Database connected and accessible'
    }
  } catch (error: any) {
    result.database.connected = false
    result.database.message = `Connection test failed: ${error.message}`
    result.overall = 'error'
    result.recommendations.push('Check your internet connection and Supabase project status')
  }

  // Final assessment
  if (result.overall === 'healthy' && result.database.rlsActive && !result.database.authenticated) {
    result.overall = 'warning'
  }

  return result
}

/**
 * Display user-friendly health check results
 */
export function displayHealthCheckResults(result: HealthCheckResult) {
  const { overall, database, environment, recommendations } = result

  
  if (recommendations.length > 0) {
  }

  // Show appropriate toast notifications
  switch (overall) {
    case 'healthy':
      toast.success('System Status: Healthy', {
        description: 'All systems are operational'
      })
      break
    case 'warning':
      toast.info('System Status: Functional', {
        description: database.rlsActive 
          ? 'Database security is active. Sign in for full access.'
          : 'System is running with limited functionality'
      })
      break
    case 'error':
      toast.error('System Status: Issues Detected', {
        description: 'Some components need attention. Check console for details.'
      })
      break
  }
}

/**
 * Quick status check for display in UI
 */
export async function getQuickConnectionStatus(): Promise<{
  status: 'connected' | 'rls_protected' | 'disconnected'
  message: string
  authenticated: boolean
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)

    if (error) {
      const isRLSError = error.message?.toLowerCase().includes('permission denied')
      
      if (isRLSError) {
        return {
          status: 'rls_protected',
          message: 'Database secured by RLS policies',
          authenticated: !!user
        }
      } else {
        return {
          status: 'disconnected',
          message: 'Database connection issue',
          authenticated: !!user
        }
      }
    }

    return {
      status: 'connected',
      message: 'Database fully accessible',
      authenticated: !!user
    }
  } catch (error) {
    return {
      status: 'disconnected',
      message: 'Connection test failed',
      authenticated: false
    }
  }
}

// Auto-run health check in development with better messaging
if (import.meta.env.DEV) {
  setTimeout(async () => {
    const result = await performConnectionHealthCheck()
    displayHealthCheckResults(result)
    
    if (result.overall === 'error') {
    } else if (result.overall === 'warning') {
    } else {
    }
  }, 1000)
}

export default {
  performConnectionHealthCheck,
  displayHealthCheckResults,
  getQuickConnectionStatus
}
