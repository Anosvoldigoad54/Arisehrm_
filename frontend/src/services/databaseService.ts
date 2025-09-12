import { supabase } from '../lib/supabase'
import { Database } from '../types/database'
import { toast } from 'sonner'
import { executeWithRLSHandling, createFallbackData } from '../utils/rlsHandler'

type Tables = Database['public']['Tables']

export class DatabaseService {
  // Generic error handler
  private static handleError(error: any, operation: string) {
    let errorMessage = 'Unknown database error'

    if (error?.message && error.message.trim()) {
      errorMessage = error.message
    } else if (error?.error?.message && error.error.message.trim()) {
      errorMessage = error.error.message
    } else if (typeof error === 'string' && error.trim()) {
      errorMessage = error
    } else if (error?.code) {
      errorMessage = `Database error code: ${error.code}`
    } else {
      // Check for RLS-related errors
      const errorStr = JSON.stringify(error)
      if (errorStr.includes('permission') || errorStr.includes('rls') || errorStr.includes('policy')) {
        errorMessage = 'Access restricted by security policies'
      } else {
        errorMessage = 'Database connection or query error'
      }
    }


    // Don't show toast for RLS errors or network errors that have fallbacks
    const isNetworkError = this.isNetworkError(error)

    if (!errorMessage.toLowerCase().includes('security') &&
        !errorMessage.toLowerCase().includes('permission') &&
        !isNetworkError) {
      toast.error(`Failed to ${operation}`, {
        description: errorMessage || 'Please try again or contact support'
      })
    } else if (isNetworkError) {
      // Just log network errors without throwing or showing intrusive toasts
      return // Don't throw for network errors
    }

    throw new Error(errorMessage)
  }

  // Check if error is network related
  private static isNetworkError(error: any): boolean {
    if (!error) return false

    const errorMessage = (error.message || error.toString()).toLowerCase()

    return errorMessage.includes('failed to fetch') ||
           errorMessage.includes('network error') ||
           errorMessage.includes('fetch error') ||
           errorMessage.includes('connection error') ||
           errorMessage.includes('timeout') ||
           errorMessage.includes('cors') ||
           error.name === 'TypeError' && errorMessage.includes('fetch')
  }

  // Retry mechanism for network errors
  private static async retryOnNetworkError<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        if (this.isNetworkError(error) && attempt <= maxRetries) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }

        throw error
      }
    }

    throw lastError
  }

  // Generic fetch with error handling and RLS support
  private static async safeFetch<T>(
    query: Promise<{ data: T | null; error: any }>,
    operation: string,
    tableName?: string
  ): Promise<T | null> {
    try {
      const result = await this.retryOnNetworkError(
        () => executeWithRLSHandling(
          () => query,
          tableName || operation,
          tableName ? createFallbackData(tableName) : null
        ),
        operation
      )

      if (result.error && !result.bypassed) {
        // Check if it's a network/fetch error
        if (this.isNetworkError(result.error)) {
          return tableName ? createFallbackData(tableName) as T : null
        }
        this.handleError(result.error, operation)
      } else if (result.bypassed) {
      }

      return result.data
    } catch (error) {
      // Handle network errors gracefully
      if (this.isNetworkError(error)) {
        return tableName ? createFallbackData(tableName) as T : null
      }
      this.handleError(error, operation)
      return null
    }
  }

  // User Profiles
  static async getUserProfiles(filters?: {
    isActive?: boolean
    departmentId?: string
    employmentStatus?: string[]
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('user_profiles')
      .select('*')

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive)
    }

    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId)
    }

    if (filters?.employmentStatus?.length) {
      query = query.in('employment_status', filters.employmentStatus)
    }

    if (filters?.search) {
      query = query.or(`
        first_name.ilike.%${filters.search}%,
        last_name.ilike.%${filters.search}%,
        email.ilike.%${filters.search}%,
        employee_id.ilike.%${filters.search}%
      `)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    return this.safeFetch(query, 'fetch user profiles', 'user_profiles')
  }

  static async getUserProfile(employeeId: string) {
    return this.safeFetch(
      supabase
        .from('user_profiles')
        .select('*')
        .eq('employee_id', employeeId)
        .single(),
      'fetch user profile'
    )
  }

  static async updateUserProfile(employeeId: string, updates: Partial<Tables['user_profiles']['Update']>) {
    return this.safeFetch(
      supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('employee_id', employeeId)
        .select()
        .single(),
      'update user profile'
    )
  }

  static async createUserProfile(profile: Tables['user_profiles']['Insert']) {
    return this.safeFetch(
      supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single(),
      'create user profile'
    )
  }

  // Departments
  static async getDepartments(includeInactive = false) {
    let query = supabase
      .from('departments')
      .select(`
        *,
        parent_department:departments!parent_department_id(
          id, name, code
        )
      `)
      .order('name')

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    return this.safeFetch(query, 'fetch departments', 'departments')
  }

  static async getDepartmentStats() {
    // For now return empty array since RPC function may not exist
    return []
  }

  // Positions
  static async getPositions(departmentId?: string) {
    let query = supabase
      .from('positions')
      .select('*')
      .eq('is_active', true)
      .order('title')

    if (departmentId) {
      query = query.eq('department_id', departmentId)
    }

    return this.safeFetch(query, 'fetch positions', 'positions')
  }

  // Attendance Records
  static async getAttendanceRecords(filters?: {
    employeeId?: string
    startDate?: string
    endDate?: string
    status?: string[]
    limit?: number
  }) {
    let query = supabase
      .from('attendance_records')
      .select('*')
      .order('date', { ascending: false })

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId)
    }

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte('date', filters.endDate)
    }

    if (filters?.status?.length) {
      query = query.in('status', filters.status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    return this.safeFetch(query, 'fetch attendance records', 'attendance_records')
  }

  static async createAttendanceRecord(record: Tables['attendance_records']['Insert']) {
    return this.safeFetch(
      supabase
        .from('attendance_records')
        .insert(record)
        .select()
        .single(),
      'create attendance record'
    )
  }

  static async updateAttendanceRecord(id: string, updates: Tables['attendance_records']['Update']) {
    return this.safeFetch(
      supabase
        .from('attendance_records')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single(),
      'update attendance record'
    )
  }

  // Leave Requests
  static async getLeaveRequests(filters?: {
    employeeId?: string
    status?: string[]
    startDate?: string
    endDate?: string
    approverId?: string
    limit?: number
  }) {
    let query = supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId)
    }

    if (filters?.status?.length) {
      query = query.in('status', filters.status)
    }

    if (filters?.startDate) {
      query = query.gte('start_date', filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte('end_date', filters.endDate)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    return this.safeFetch(query, 'fetch leave requests', 'leave_requests')
  }

  static async createLeaveRequest(request: Tables['leave_requests']['Insert']) {
    return this.safeFetch(
      supabase
        .from('leave_requests')
        .insert(request)
        .select()
        .single(),
      'create leave request'
    )
  }

  static async updateLeaveRequestStatus(
    id: string, 
    status: string, 
    approverId?: string, 
    comments?: string
  ) {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'approved') {
      updates.approved_at = new Date().toISOString()
      updates.final_approver_id = approverId
    }

    return this.safeFetch(
      supabase
        .from('leave_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single(),
      'update leave request status'
    )
  }

  // Leave Types
  static async getLeaveTypes() {
    return this.safeFetch(
      supabase
        .from('leave_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
      'fetch leave types',
      'leave_types'
    )
  }

  // Teams
  static async getTeams(departmentId?: string) {
    let query = supabase
      .from('teams')
      .select(`
        *,
        departments!department_id(
          id, name, code
        ),
        members:employee_teams(
          employee_id,
          role_in_team,
          employee:user_profiles(
            employee_id, first_name, last_name, profile_photo_url
          )
        )
      `)
      .eq('is_active', true)
      .order('name')

    if (departmentId) {
      query = query.eq('department_id', departmentId)
    }

    return this.safeFetch(query, 'fetch teams')
  }

  // Helper methods for count operations
  static async getEmployeeCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      if (error) {
        if (this.isNetworkError(error)) {
          return 0
        }
        return 0
      }

      return count || 0
    } catch (error) {
      if (this.isNetworkError(error)) {
        return 0
      }
      return 0
    }
  }

  static async getActiveEmployeeCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (error) {
        if (this.isNetworkError(error)) {
          return 0
        }
        return 0
      }

      return count || 0
    } catch (error) {
      if (this.isNetworkError(error)) {
        return 0
      }
      return 0
    }
  }

  static async getDepartmentCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (error) {
        if (this.isNetworkError(error)) {
          return 0
        }
        return 0
      }

      return count || 0
    } catch (error) {
      if (this.isNetworkError(error)) {
        return 0
      }
      return 0
    }
  }

  // Analytics and Reports
  static async getDashboardMetrics(employeeId?: string, dateRange?: { start: string; end: string }) {
    try {
      const today = new Date().toISOString().split('T')[0]

    
    // Get basic employee metrics
    // Get count metrics using proper handling for count queries
    const [
      totalEmployeesResult,
      activeEmployeesResult,
      attendanceToday,
      leaveRequests,
      departmentsResult
    ] = await Promise.all([
      this.getEmployeeCount(),
      this.getActiveEmployeeCount(),
      this.safeFetch(
        supabase
          .from('attendance_records')
          .select('status, employee_id')
          .eq('date', today),
        'fetch today attendance'
      ),
      this.safeFetch(
        supabase
          .from('leave_requests')
          .select('status')
          .eq('status', 'pending'),
        'fetch pending leave requests'
      ),
      this.getDepartmentCount()
    ])

    const totalEmployees = totalEmployeesResult || 0
    const activeEmployees = activeEmployeesResult || 0
    const departments = departmentsResult || 0

    // Process attendance data
    const attendanceData = attendanceToday || []
    const presentToday = attendanceData.filter(a => a.status === 'present').length
    const lateToday = attendanceData.filter(a => a.status === 'late').length
    const onLeaveToday = attendanceData.filter(a => a.status === 'on_leave').length

    const result = {
      totalEmployees,
      activeEmployees,
      presentToday,
      lateToday,
      onLeaveToday,
      pendingLeaveRequests: leaveRequests?.length || 0,
      totalDepartments: departments,
      avgAttendanceRate: attendanceData.length > 0 ? (presentToday / attendanceData.length) * 100 : 0,
      lastUpdated: new Date().toISOString()
    }

      return result
    } catch (error) {
      // Return safe defaults
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        presentToday: 0,
        lateToday: 0,
        onLeaveToday: 0,
        pendingLeaveRequests: 0,
        totalDepartments: 0,
        avgAttendanceRate: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  // Search functionality
  static async globalSearch(query: string, filters?: {
    type?: 'employees' | 'departments' | 'teams' | 'all'
    limit?: number
  }) {
    const searchLimit = filters?.limit || 10
    const results: any = {
      employees: [],
      departments: [],
      teams: []
    }

    if (!filters?.type || filters.type === 'employees' || filters.type === 'all') {
      results.employees = await this.safeFetch(
        supabase
          .from('user_profiles')
          .select('employee_id, first_name, last_name, email, profile_photo_url, positions(title)')
          .or(`first_name.ilike.%${query}%, last_name.ilike.%${query}%, email.ilike.%${query}%`)
          .eq('is_active', true)
          .limit(searchLimit),
        'search employees'
      ) || []
    }

    if (!filters?.type || filters.type === 'departments' || filters.type === 'all') {
      results.departments = await this.safeFetch(
        supabase
          .from('departments')
          .select('id, name, code, description')
          .or(`name.ilike.%${query}%, code.ilike.%${query}%`)
          .eq('is_active', true)
          .limit(searchLimit),
        'search departments'
      ) || []
    }

    if (!filters?.type || filters.type === 'teams' || filters.type === 'all') {
      results.teams = await this.safeFetch(
        supabase
          .from('teams')
          .select('id, name, code, description')
          .or(`name.ilike.%${query}%, code.ilike.%${query}%`)
          .eq('is_active', true)
          .limit(searchLimit),
        'search teams'
      ) || []
    }

    return results
  }

  // Bulk operations
  static async bulkUpdateEmployees(updates: Array<{ employee_id: string; data: Partial<Tables['user_profiles']['Update']> }>) {
    try {
      const promises = updates.map(({ employee_id, data }) =>
        this.updateUserProfile(employee_id, data)
      )
      
      const results = await Promise.allSettled(promises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      toast.success(`Bulk update completed`, {
        description: `${successful} successful, ${failed} failed`
      })

      return { successful, failed, results }
    } catch (error) {
      this.handleError(error, 'bulk update employees')
    }
  }

  // Data validation
  static async validateEmployeeId(employeeId: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_profiles')
      .select('employee_id')
      .eq('employee_id', employeeId)
      .single()
    
    return !!data
  }

  static async validateEmail(email: string, excludeEmployeeId?: string): Promise<boolean> {
    let query = supabase
      .from('user_profiles')
      .select('email')
      .eq('email', email)

    if (excludeEmployeeId) {
      query = query.neq('employee_id', excludeEmployeeId)
    }

    const { data } = await query.single()
    return !data // Returns true if email is available (not found)
  }

  // ========================================
  // TEAM HIERARCHY METHODS
  // ========================================

  // Get team members for a team leader
  static async getTeamMembers(teamLeaderId: string) {
    return this.safeFetch(
      supabase
        .from('user_profiles')
        .select(`
          *,
          departments:departments!department_id(*),
          positions:positions!position_id(*),
          roles:roles!role_id(*)
        `)
        .or(`manager_employee_id.eq.${teamLeaderId},supervisor_id.eq.${teamLeaderId}`)
        .eq('is_active', true)
        .order('last_name'),
      'fetch team members'
    )
  }

  // Get team hierarchy for a department
  static async getDepartmentHierarchy(departmentId: string) {
    return this.safeFetch(
      supabase
        .from('user_profiles')
        .select(`
          *,
          departments:departments!department_id(*),
          positions:positions!position_id(*),
          roles:roles!role_id(*)
        `)
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('last_name'),
      'fetch department hierarchy'
    )
  }

  // Get all team leaders
  static async getTeamLeaders() {
    return this.safeFetch(
      supabase
        .from('user_profiles')
        .select(`
          *,
          departments:departments!department_id(*),
          positions:positions!position_id(*),
          roles:roles!role_id(*)
        `)
        .eq('is_active', true)
        .or('positions.is_leadership_role.eq.true,roles.name.in.(team_lead,department_manager,hr_manager,admin,super_admin)')
        .order('last_name'),
      'fetch team leaders'
    )
  }

  // Assign team leader
  static async assignTeamLeader(teamMemberIds: string[], teamLeaderId: string) {
    const updates = teamMemberIds.map(memberId => ({
      employee_id: memberId,
      manager_employee_id: teamLeaderId,
      updated_at: new Date().toISOString()
    }))

    return this.safeFetch(
      supabase
        .from('user_profiles')
        .upsert(updates, {
          onConflict: 'employee_id',
          ignoreDuplicates: false
        })
        .select(),
      'assign team leader'
    )
  }

  // Get team structure with hierarchy - role-based access control
  static async getTeamStructure(employeeId?: string) {
    try {

      // Get all active employees with relations
      const employeesResult = await this.safeFetch(
        supabase
          .from('user_profiles')
          .select(`
            *,
            departments:departments!department_id(*),
            positions:positions!position_id(*),
            roles:roles!role_id(*)
          `)
          .eq('is_active', true)
          .order('last_name'),
        'fetch all employees for hierarchy'
      )

      const allEmployees = employeesResult || []
      
      // Build hierarchy tree
      const employeeMap = new Map()
      const hierarchy: any = { 
        leaders: [],
        departments: {},
        teams: {}
      }

      // Index employees by ID and add direct_reports array
      allEmployees.forEach(emp => {
        employeeMap.set(emp.employee_id, { 
          ...emp, 
          direct_reports: [] 
        })
      })

      // Build parent-child relationships
      allEmployees.forEach(emp => {
        if (emp.manager_employee_id) {
          const manager = employeeMap.get(emp.manager_employee_id)
          if (manager) {
            manager.direct_reports.push(employeeMap.get(emp.employee_id))
          }
        }
      })

      // Identify team leaders and group by departments
      allEmployees.forEach(emp => {
        const employee = employeeMap.get(emp.employee_id)
        
        // Add to leaders if they have direct reports
        if (employee.direct_reports.length > 0) {
          hierarchy.leaders.push(employee)
        }

        // Group by department
        if (emp.department_id) {
          if (!hierarchy.departments[emp.department_id]) {
            hierarchy.departments[emp.department_id] = {
              info: emp.departments,
              manager: null,
              members: []
            }
          }
          hierarchy.departments[emp.department_id].members.push(employee)
          
          // Set department manager (leadership role + has direct reports)
          if (employee.direct_reports.length > 0 && 
              (emp.roles?.name === 'department_manager' || emp.positions?.is_leadership_role)) {
            hierarchy.departments[emp.department_id].manager = employee
          }
        }
      })

      // Apply role-based filtering if specific employee requested
      if (employeeId) {
        const requestingEmployee = employeeMap.get(employeeId)
        if (requestingEmployee) {
          const role = requestingEmployee.roles?.name
          
          if (['admin', 'super_admin', 'hr_manager'].includes(role)) {
            // HR and admin see everything
            return hierarchy
          } else if (role === 'team_lead' || role === 'department_manager' || requestingEmployee.direct_reports.length > 0) {
            // Team leaders see their team and department info
            return {
              leaders: hierarchy.leaders,
              myTeam: requestingEmployee.direct_reports,
              myInfo: requestingEmployee,
              departments: requestingEmployee.department_id ? 
                { [requestingEmployee.department_id]: hierarchy.departments[requestingEmployee.department_id] } : {}
            }
          } else {
            // Regular employees see their manager and teammates only
            const myManager = allEmployees.find(emp => emp.employee_id === requestingEmployee.manager_employee_id)
            const teammates = myManager ? employeeMap.get(myManager.employee_id)?.direct_reports || [] : []
            
            return {
              myManager: myManager,
              teammates: teammates.filter((t: any) => t.employee_id !== employeeId),
              myInfo: requestingEmployee,
              departmentInfo: requestingEmployee.department_id ? 
                hierarchy.departments[requestingEmployee.department_id]?.info : null
            }
          }
        }
      }

      return hierarchy
    } catch (error: any) {
      return null
    }
  }

  // Get team performance metrics for a team leader
  static async getTeamMetrics(teamLeaderId: string) {
    try {
      const teamMembersResult = await this.getTeamMembers(teamLeaderId)
      const teamMembers = teamMembersResult || []
      
      if (!teamMembers.length) {
        return {
          teamSize: 0,
          presentToday: 0,
          pendingLeaveRequests: 0,
          avgWeeklyHours: 0,
          teamMembers: []
        }
      }

      const memberIds = teamMembers.map(member => member.employee_id)
      const today = new Date().toISOString().split('T')[0]
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      
      // Get attendance metrics for the week
      const attendanceResult = await this.safeFetch(
        supabase
          .from('attendance_records')
          .select('employee_id, status, total_hours')
          .in('employee_id', memberIds)
          .gte('date', startOfWeek.toISOString().split('T')[0]),
        'fetch team attendance'
      )
      const attendanceData = attendanceResult || []

      // Get pending leave requests
      const leaveRequestsResult = await this.safeFetch(
        supabase
          .from('leave_requests')
          .select('employee_id, status, start_date, end_date')
          .in('employee_id', memberIds)
          .eq('status', 'pending'),
        'fetch team leave requests'
      )
      const leaveRequests = leaveRequestsResult || []

      return {
        teamSize: teamMembers.length,
        presentToday: attendanceData.filter(a => a.status === 'present').length,
        pendingLeaveRequests: leaveRequests.length,
        avgWeeklyHours: attendanceData.reduce((sum, a) => sum + (a.total_hours || 0), 0) / Math.max(memberIds.length, 1),
        teamMembers: teamMembers,
        attendanceData: attendanceData,
        leaveRequests: leaveRequests
      }
    } catch (error: any) {
      return null
    }
  }

  // Get team members that current user can manage
  static async getManageableTeamMembers(currentEmployeeId: string) {
    return this.safeFetch(
      supabase
        .from('user_profiles')
        .select(`
          *,
          departments:departments!department_id(*),
          positions:positions!position_id(*),
          roles:roles!role_id(*)
        `)
        .eq('manager_employee_id', currentEmployeeId)
        .eq('is_active', true)
        .order('last_name'),
      'fetch manageable team members'
    )
  }
}

export default DatabaseService
