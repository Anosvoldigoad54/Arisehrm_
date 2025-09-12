import { supabase } from '../lib/supabase'

/**
 * Database Validation Utility
 * Tests database connectivity and schema validation
 */

export interface ValidationResult {
  success: boolean
  message: string
  details?: string[]
  errors?: string[]
}

export async function validateDatabaseConnection(): Promise<ValidationResult> {
  const details: string[] = []
  const errors: string[] = []

  try {
    // Test basic connectivity
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    
    if (error) {
      errors.push(`Database connection failed: ${error.message}`)
      return {
        success: false,
        message: 'Database connection failed',
        errors
      }
    }

    details.push('✅ Database connection successful')

    // Test all major tables
    const tablesToTest = [
      'departments', 
      'roles',
      'positions',
      'leave_types',
      'user_profiles',
      'attendance_records',
      'leave_requests'
    ]

    for (const table of tablesToTest) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (tableError) {
          errors.push(`❌ Table '${table}': ${tableError.message}`)
        } else {
          details.push(`✅ Table '${table}' accessible`)
        }
      } catch (tableErr) {
        errors.push(`❌ Table '${table}': ${tableErr}`)
      }
    }

    // Test RLS policies
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        details.push(`✅ User authenticated: ${user.email}`)
      } else {
        details.push('ℹ️ No authenticated user (this is ok for public access)')
      }
    } catch (authErr) {
      errors.push(`⚠️ Auth check failed: ${authErr}`)
    }

    return {
      success: errors.length === 0,
      message: errors.length === 0 
        ? 'All database validations passed' 
        : `${errors.length} validation errors found`,
      details,
      errors: errors.length > 0 ? errors : undefined
    }

  } catch (error) {
    return {
      success: false,
      message: 'Database validation failed',
      errors: [`Unexpected error: ${error}`]
    }
  }
}

export async function checkDataInitializationStatus(): Promise<ValidationResult> {
  try {
    const checks = await Promise.all([
      supabase.from('departments').select('*', { count: 'exact', head: true }),
      supabase.from('roles').select('*', { count: 'exact', head: true }),
      supabase.from('positions').select('*', { count: 'exact', head: true }),
      supabase.from('leave_types').select('*', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true })
    ])

    const [departments, roles, positions, leaveTypes, userProfiles] = checks

    const details = [
      `Departments: ${departments.count || 0}`,
      `Roles: ${roles.count || 0}`,
      `Positions: ${positions.count || 0}`,
      `Leave Types: ${leaveTypes.count || 0}`,
      `User Profiles: ${userProfiles.count || 0}`
    ]

    const hasRequiredData = (departments.count || 0) > 0 && 
                           (roles.count || 0) > 0

    return {
      success: true,
      message: hasRequiredData 
        ? 'Database has been initialized' 
        : 'Database needs initialization',
      details
    }

  } catch (error) {
    return {
      success: false,
      message: 'Failed to check initialization status',
      errors: [`Error: ${error}`]
    }
  }
}
