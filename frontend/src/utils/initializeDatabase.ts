import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

// Types for database initialization
interface InitializationResult {
  success: boolean
  message: string
  error?: any
  data?: any
}

interface SampleUserProfile {
  auth_user_id: string
  employee_id: string
  email: string
  first_name: string
  last_name: string
  department_id?: string
  position_id?: string
  role_id: number
  employment_status: string
  employment_type: string
  hire_date: string
  is_active: boolean
  profile_photo_url?: string
  phone?: string
  work_location?: string
}

// Create sample user profile for new auth users
export async function createSampleUserProfile(
  authUserId: string, 
  email: string
): Promise<InitializationResult> {
  try {

    // Extract name from email (fallback)
    const emailParts = email.split('@')[0].split('.')
    const firstName = emailParts[0] ? capitalize(emailParts[0]) : 'User'
    const lastName = emailParts[1] ? capitalize(emailParts[1]) : 'Account'

    // Generate employee ID
    const timestamp = Date.now().toString().slice(-6)
    const employeeId = `EMP${timestamp}`

    // Determine role based on email domain/prefix
    let roleId = 6 // Default to employee
    if (email.includes('admin')) roleId = 2 // Admin
    else if (email.includes('hr')) roleId = 3 // HR Manager
    else if (email.includes('manager')) roleId = 4 // Manager

    const userProfile: SampleUserProfile = {
      auth_user_id: authUserId,
      employee_id: employeeId,
      email: email,
      first_name: firstName,
      last_name: lastName,
      role_id: roleId,
      employment_status: 'active',
      employment_type: 'full_time',
      hire_date: new Date().toISOString().split('T')[0],
      is_active: true,
      work_location: 'Remote'
    }

    // Insert the user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(userProfile)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        message: 'Failed to create user profile',
        error: error
      }
    }

    
    // Create initial user preferences
    await createInitialUserPreferences(authUserId, employeeId)
    
    // Create initial leave balances
    await createInitialLeaveBalances(employeeId)

    return {
      success: true,
      message: 'User profile created successfully',
      data: data
    }

  } catch (error) {
    return {
      success: false,
      message: 'Unexpected error creating user profile',
      error: error
    }
  }
}

// Create initial user preferences
async function createInitialUserPreferences(
  authUserId: string, 
  employeeId: string
): Promise<void> {
  try {
    const preferences = {
      user_id: authUserId,
      employee_id: employeeId,
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      notifications: {
        email: true,
        push: true,
        sms: false,
        desktop: true
      },
      dashboard_layout: 'default',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_preferences')
      .insert(preferences)

    if (error) {
    } else {
    }
  } catch (error) {
  }
}

// Create initial leave balances
async function createInitialLeaveBalances(employeeId: string): Promise<void> {
  try {
    // Default leave types and balances
    const leaveBalances = [
      {
        employee_id: employeeId,
        leave_type_id: 'annual', // Would normally be a UUID
        year: new Date().getFullYear(),
        total_days: 20,
        used_days: 0,
        remaining_days: 20,
        carried_over: 0,
        expires_at: `${new Date().getFullYear()}-12-31`,
        created_at: new Date().toISOString()
      },
      {
        employee_id: employeeId,
        leave_type_id: 'sick', 
        year: new Date().getFullYear(),
        total_days: 10,
        used_days: 0,
        remaining_days: 10,
        carried_over: 0,
        expires_at: `${new Date().getFullYear()}-12-31`,
        created_at: new Date().toISOString()
      }
    ]

    const { error } = await supabase
      .from('leave_balances')
      .insert(leaveBalances)

    if (error) {
    } else {
    }
  } catch (error) {
  }
}

// Initialize complete demo database
export async function initializeCompleteDatabase(): Promise<InitializationResult> {
  try {

    const results = await Promise.all([
      initializeDepartments(),
      initializePositions(),
      initializeRoles(),
      initializeLeaveTypes(),
      initializePermissions(),
    ])

    const failedResults = results.filter(r => !r.success)
    
    if (failedResults.length > 0) {
      return {
        success: false,
        message: `Initialization partially failed: ${failedResults.length} errors`,
        error: failedResults
      }
    }

    toast.success('Database Initialized', {
      description: 'All demo data has been created successfully'
    })

    return {
      success: true,
      message: 'Database initialization completed successfully',
      data: results
    }

  } catch (error) {
    return {
      success: false,
      message: 'Database initialization failed',
      error: error
    }
  }
}

// Initialize departments
async function initializeDepartments(): Promise<InitializationResult> {
  try {
    const departments = [
      {
        id: 'dept-admin',
        name: 'Administration',
        code: 'ADMIN',
        description: 'Administrative and executive functions',
        manager_id: 'EMP001',
        budget: 200000,
        headcount_target: 5,
        current_headcount: 3,
        location: 'Main Office',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'dept-eng',
        name: 'Engineering',
        code: 'ENG',
        description: 'Software development and technology',
        budget: 800000,
        headcount_target: 25,
        current_headcount: 18,
        location: 'Tech Hub',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'dept-hr',
        name: 'Human Resources',
        code: 'HR',
        description: 'Human resources and people operations',
        budget: 300000,
        headcount_target: 8,
        current_headcount: 6,
        location: 'Main Office',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'dept-sales',
        name: 'Sales',
        code: 'SALES',
        description: 'Sales and business development',
        budget: 600000,
        headcount_target: 15,
        current_headcount: 12,
        location: 'Sales Office',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'dept-marketing',
        name: 'Marketing',
        code: 'MKT',
        description: 'Marketing and communications',
        budget: 400000,
        headcount_target: 10,
        current_headcount: 8,
        location: 'Creative Studio',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]

    const { data, error } = await supabase
      .from('departments')
      .upsert(departments, { onConflict: 'id' })

    if (error) throw error

    return { success: true, message: 'Departments initialized', data }
  } catch (error) {
    return { success: false, message: 'Failed to initialize departments', error }
  }
}

// Initialize positions
async function initializePositions(): Promise<InitializationResult> {
  try {
    const positions = [
      {
        id: 'pos-ceo',
        title: 'Chief Executive Officer',
        code: 'CEO',
        department_id: 'dept-admin',
        level: 'executive',
        min_salary: 150000,
        max_salary: 300000,
        is_leadership_role: true,
        reports_to: null,
        is_active: true
      },
      {
        id: 'pos-cto',
        title: 'Chief Technology Officer',
        code: 'CTO',
        department_id: 'dept-eng',
        level: 'executive',
        min_salary: 140000,
        max_salary: 250000,
        is_leadership_role: true,
        reports_to: 'pos-ceo',
        is_active: true
      },
      {
        id: 'pos-hr-dir',
        title: 'HR Director',
        code: 'HR_DIR',
        department_id: 'dept-hr',
        level: 'director',
        min_salary: 90000,
        max_salary: 130000,
        is_leadership_role: true,
        reports_to: 'pos-ceo',
        is_active: true
      },
      {
        id: 'pos-sw-eng',
        title: 'Software Engineer',
        code: 'SW_ENG',
        department_id: 'dept-eng',
        level: 'mid',
        min_salary: 70000,
        max_salary: 120000,
        is_leadership_role: false,
        reports_to: 'pos-cto',
        is_active: true
      },
      {
        id: 'pos-sr-sw-eng',
        title: 'Senior Software Engineer',
        code: 'SR_SW_ENG',
        department_id: 'dept-eng',
        level: 'senior',
        min_salary: 90000,
        max_salary: 150000,
        is_leadership_role: false,
        reports_to: 'pos-cto',
        is_active: true
      }
    ]

    const { data, error } = await supabase
      .from('positions')
      .upsert(positions, { onConflict: 'id' })

    if (error) throw error

    return { success: true, message: 'Positions initialized', data }
  } catch (error) {
    return { success: false, message: 'Failed to initialize positions', error }
  }
}

// Initialize roles
async function initializeRoles(): Promise<InitializationResult> {
  try {
    const roles = [
      {
        id: 1,
        name: 'super_admin',
        display_name: 'Super Administrator',
        description: 'Full system access and control',
        level: 100,
        color_code: '#d32f2f',
        icon: 'admin_panel_settings',
        max_users: 2,
        is_system_role: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'admin',
        display_name: 'Administrator',
        description: 'Administrative access to most features',
        level: 90,
        color_code: '#f57c00',
        icon: 'admin_panel_settings',
        max_users: 5,
        is_system_role: true,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'hr_manager',
        display_name: 'HR Manager',
        description: 'Human resources management',
        level: 80,
        color_code: '#388e3c',
        icon: 'supervisor_account',
        max_users: 10,
        is_system_role: false,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'manager',
        display_name: 'Manager',
        description: 'Department or team management',
        level: 70,
        color_code: '#1976d2',
        icon: 'work',
        max_users: null,
        is_system_role: false,
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        name: 'team_lead',
        display_name: 'Team Lead',
        description: 'Team leadership and coordination',
        level: 60,
        color_code: '#7b1fa2',
        icon: 'group',
        max_users: null,
        is_system_role: false,
        created_at: new Date().toISOString()
      },
      {
        id: 6,
        name: 'employee',
        display_name: 'Employee',
        description: 'Standard employee access',
        level: 50,
        color_code: '#616161',
        icon: 'person',
        max_users: null,
        is_system_role: false,
        created_at: new Date().toISOString()
      }
    ]

    const { data, error } = await supabase
      .from('roles')
      .upsert(roles, { onConflict: 'id' })

    if (error) throw error

    return { success: true, message: 'Roles initialized', data }
  } catch (error) {
    return { success: false, message: 'Failed to initialize roles', error }
  }
}

// Initialize leave types
async function initializeLeaveTypes(): Promise<InitializationResult> {
  try {
    const leaveTypes = [
      {
        id: 'annual',
        name: 'Annual Leave',
        code: 'ANNUAL',
        description: 'Yearly vacation and personal time off',
        days_per_year: 20,
        max_consecutive_days: 10,
        requires_approval: true,
        carry_over_allowed: true,
        max_carry_over: 5,
        color_code: '#4caf50',
        is_active: true,
        display_order: 1
      },
      {
        id: 'sick',
        name: 'Sick Leave',
        code: 'SICK',
        description: 'Medical and health-related leave',
        days_per_year: 10,
        max_consecutive_days: 5,
        requires_approval: false,
        carry_over_allowed: false,
        max_carry_over: 0,
        color_code: '#f44336',
        is_active: true,
        display_order: 2
      },
      {
        id: 'personal',
        name: 'Personal Leave',
        code: 'PERSONAL',
        description: 'Personal matters and family time',
        days_per_year: 5,
        max_consecutive_days: 3,
        requires_approval: true,
        carry_over_allowed: false,
        max_carry_over: 0,
        color_code: '#ff9800',
        is_active: true,
        display_order: 3
      },
      {
        id: 'maternity',
        name: 'Maternity Leave',
        code: 'MATERNITY',
        description: 'Maternity and parental leave',
        days_per_year: 90,
        max_consecutive_days: 90,
        requires_approval: true,
        carry_over_allowed: false,
        max_carry_over: 0,
        color_code: '#e91e63',
        is_active: true,
        display_order: 4
      }
    ]

    const { data, error } = await supabase
      .from('leave_types')
      .upsert(leaveTypes, { onConflict: 'id' })

    if (error) throw error

    return { success: true, message: 'Leave types initialized', data }
  } catch (error) {
    return { success: false, message: 'Failed to initialize leave types', error }
  }
}

// Initialize permissions
async function initializePermissions(): Promise<InitializationResult> {
  try {
    const permissions = [
      { id: 'dashboard.view', name: 'View Dashboard', description: 'Access to main dashboard', category: 'Dashboard' },
      { id: 'employees.view', name: 'View Employees', description: 'View employee directory', category: 'Employees' },
      { id: 'employees.create', name: 'Create Employees', description: 'Add new employees', category: 'Employees' },
      { id: 'employees.edit', name: 'Edit Employees', description: 'Modify employee information', category: 'Employees' },
      { id: 'employees.delete', name: 'Delete Employees', description: 'Remove employees', category: 'Employees' },
      { id: 'attendance.view', name: 'View Attendance', description: 'View attendance records', category: 'Attendance' },
      { id: 'attendance.manage', name: 'Manage Attendance', description: 'Edit attendance records', category: 'Attendance' },
      { id: 'leave.view', name: 'View Leave Requests', description: 'View leave requests', category: 'Leave' },
      { id: 'leave.approve', name: 'Approve Leave', description: 'Approve/reject leave requests', category: 'Leave' },
      { id: 'payroll.view', name: 'View Payroll', description: 'View payroll information', category: 'Payroll' },
      { id: 'payroll.process', name: 'Process Payroll', description: 'Process payroll payments', category: 'Payroll' },
      { id: 'settings.view', name: 'View Settings', description: 'View system settings', category: 'Settings' },
      { id: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings', category: 'Settings' },
      { id: 'reports.view', name: 'View Reports', description: 'Access reports and analytics', category: 'Reports' }
    ]

    const { data, error } = await supabase
      .from('permissions')
      .upsert(permissions, { onConflict: 'id' })

    if (error) throw error

    return { success: true, message: 'Permissions initialized', data }
  } catch (error) {
    return { success: false, message: 'Failed to initialize permissions', error }
  }
}

// Test database connectivity
export async function testDatabaseConnection(): Promise<InitializationResult> {
  try {

    const { data, error } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      return {
        success: false,
        message: 'Database connection failed',
        error: error
      }
    }

    return {
      success: true,
      message: 'Database connection successful',
      data: { count: data }
    }

  } catch (error) {
    return {
      success: false,
      message: 'Database connection test failed',
      error: error
    }
  }
}

// Utility function
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export default {
  createSampleUserProfile,
  initializeCompleteDatabase,
  testDatabaseConnection
}
