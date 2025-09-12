import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const demoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// Create a dummy client for demo mode
const createDemoClient = () => {
  console.warn('⚠️ Running in demo mode - Supabase not configured');
  return null;
};

// Only throw error if not in demo mode
if (!demoMode && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables')
}

// Enhanced client configuration with better error handling
export const supabase = demoMode || !supabaseUrl || !supabaseAnonKey 
  ? createDemoClient()
  : createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Info': 'arisehrm-web'
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        }
      }
    })

// Helper function to get user profile with proper typing
export const getUserProfile = async (userId: string) => {
  if (!supabase) {
    console.warn('🔄 Demo mode: Using fallback user profile data');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .eq('is_active', true)
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: error as Error };
  }
}

// Helper function to create user profile with proper typing
export const createUserProfile = async (profile: Database['public']['Tables']['user_profiles']['Insert']) => {
  if (!supabase) {
    console.warn('🔄 Demo mode: Simulating user profile creation');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { data: null, error: error as Error };
  }
}

// Helper function to update user profile with proper typing
export const updateUserProfile = async (
  userId: string, 
  updates: Database['public']['Tables']['user_profiles']['Update']
) => {
  if (!supabase) {
    console.warn('🔄 Demo mode: Simulating user profile update');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('auth_user_id', userId)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error: error as Error };
  }
}

// Helper function to create user session with proper typing
export const createUserSession = async (session: Database['public']['Tables']['user_sessions']['Insert']) => {
  if (!supabase) {
    console.warn('🔄 Demo mode: Simulating user session creation');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert(session)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error creating user session:', error);
    return { data: null, error: error as Error };
  }
}

// Helper function to log failed login attempt with proper typing
export const logFailedLoginAttempt = async (attempt: Database['public']['Tables']['failed_login_attempts']['Insert']) => {
  if (!supabase) {
    console.warn('🔄 Demo mode: Simulating failed login attempt logging');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('failed_login_attempts')
      .insert(attempt)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error logging failed login attempt:', error);
    return { data: null, error: error as Error };
  }
}

// Helper function to update user preferences with proper typing
export const updateUserPreferences = async (
  userId: string, 
  updates: Database['public']['Tables']['user_preferences']['Update']
) => {
  if (!supabase) {
    console.warn('🔄 Demo mode: Simulating user preferences update');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        employee_id: userId, // Assuming employee_id is same as user_id for now
        ...updates
      })
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { data: null, error: error as Error };
  }
}

// Helper function to update user theme with proper typing
export const updateUserTheme = async (
  userId: string, 
  updates: Database['public']['Tables']['user_themes']['Update']
) => {
  if (!supabase) {
    console.warn('🔄 Demo mode: Simulating user theme update');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_themes')
      .upsert({
        user_id: userId,
        employee_id: userId, // Assuming employee_id is same as user_id for now
        ...updates
      })
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error updating user theme:', error);
    return { data: null, error: error as Error };
  }
}