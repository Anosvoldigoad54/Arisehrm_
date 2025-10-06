import { supabase } from '../lib/supabase'

/**
 * Debug Supabase connection issues
 */
export async function debugSupabaseConnection() {
  
  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl
  })
  
  // Test 1: Simple connection test
  try {
    const response = await fetch(supabaseUrl + '/rest/v1/', {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    
    console.log('Connection test:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })
  } catch (error) {
    console.error('Connection test failed:', error)
  }
  
  // Test 2: Auth connection
  try {
    const { data, error } = await supabase.auth.getSession()
    console.log('Auth test:', { data, error })
  } catch (error) {
    console.error('Auth test failed:', error)
  }
  
  // Test 3: Simple table query
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('Table query error:', error)
    } else {
      console.log('Table query success:', data)
    }
  } catch (error) {
    console.error('Table query failed:', error)
  }
  
  // Test 4: CORS and browser check
  try {
    console.log('Browser info:', {
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      host: window.location.host,
      origin: window.location.origin
    })

    // Check for common browser extensions that might interfere
    const hasExtensions = Object.keys(window).some(key =>
      key.includes('chrome') || key.includes('extension') || key.includes('webkit')
    )
    console.log('Has extensions:', hasExtensions)

  } catch (error) {
    console.error('Browser check failed:', error)
  }

  // Test 5: Direct Supabase health check
  try {
    const healthUrl = supabaseUrl + '/rest/v1/'
    const healthResponse = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Health check:', {
      ok: healthResponse.ok,
      status: healthResponse.status,
      statusText: healthResponse.statusText
    })

    if (!healthResponse.ok) {
      const errorText = await healthResponse.text()
      console.error('Health check error text:', errorText)
    }

  } catch (error) {
    console.error('Health check failed:', error)
  }

}

// Auto-run in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    debugSupabaseConnection()
  }, 1000)
}

export default debugSupabaseConnection
