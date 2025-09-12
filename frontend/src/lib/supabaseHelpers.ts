// Enhanced Supabase Helpers for Arise HRM System
// Comprehensive functions for HRM operations

import { supabase } from './supabase'
import type { Database } from '../types/database'

// Type definitions
type Tables = Database['public']['Tables']
type UserProfile = Tables['user_profiles']['Row']
type AttendanceRecord = Tables['attendance_records']['Row']
type LeaveRequest = Tables['leave_requests']['Row']
type Department = Tables['departments']['Row']
type PerformanceReview = Tables['performance_reviews']['Row']

// ========================================
// EMPLOYEE MANAGEMENT
// ========================================

export const employeeService = {
  // Get all employees with department and position info
  async getEmployees(filters?: {
    department?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('user_profiles')
      .select(`
        *,
        departments!department_id(*),
        positions!position_id(*),
        roles!role_id(*)
      `)
      .eq('is_active', true)

    if (filters?.department) {
      query = query.eq('department_id', filters.department)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
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
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return query.order('created_at', { ascending: false })
  },

  // Get employee by ID
  async getEmployee(id: string) {
    return supabase
      .from('user_profiles')
      .select(`
        *,
        departments!department_id(*),
        positions!position_id(*),
        roles!role_id(*)
      `)
      .eq('id', id)
      .single()
  },

  // Create new employee
  async createEmployee(employeeData: Tables['user_profiles']['Insert']) {
    return supabase
      .from('user_profiles')
      .insert(employeeData)
      .select()
      .single()
  },

  // Update employee
  async updateEmployee(id: string, updates: Tables['user_profiles']['Update']) {
    return supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },

  // Get employee statistics
  async getEmployeeStats() {
    const { data: employees } = await supabase
      .from('user_profiles')
      .select('status, department_id, employment_type')
      .eq('is_active', true)

    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')
      .eq('is_active', true)

    const stats = {
      total: employees?.length || 0,
      byStatus: employees?.reduce((acc, emp) => {
        acc[emp.status] = (acc[emp.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      byDepartment: employees?.reduce((acc, emp) => {
        const dept = departments?.find(d => d.id === emp.department_id)
        if (dept) {
          acc[dept.name] = (acc[dept.name] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {},
      byEmploymentType: employees?.reduce((acc, emp) => {
        acc[emp.employment_type] = (acc[emp.employment_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
    }

    return { data: stats, error: null }
  }
}

// ========================================
// ATTENDANCE MANAGEMENT
// ========================================

export const attendanceService = {
  // Check in employee
  async checkIn(employeeId: string, data: {
    location?: { latitude: number; longitude: number; address: string }
    ipAddress?: string
    deviceInfo?: Record<string, any>
    photo?: string
  }) {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    // Check if already checked in today
    const { data: existing } = await supabase
      .from('attendance_records')
      .select('id, check_in')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single()

    if (existing && existing.check_in) {
      return { data: null, error: new Error('Already checked in today') }
    }

    const attendanceData = {
      employee_id: employeeId,
      date: today,
      check_in: now,
      status: 'present' as const,
      location_check_in: data.location || {},
      ip_address: data.ipAddress,
      device_info: data.deviceInfo || {},
      photos: data.photo ? [data.photo] : []
    }

    if (existing) {
      // Update existing record
      return supabase
        .from('attendance_records')
        .update(attendanceData)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Create new record
      return supabase
        .from('attendance_records')
        .insert(attendanceData)
        .select()
        .single()
    }
  },

  // Check out employee
  async checkOut(employeeId: string, data: {
    location?: { latitude: number; longitude: number; address: string }
    photo?: string
  }) {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    const { data: record, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single()

    if (error || !record || !record.check_in) {
      return { data: null, error: new Error('No check-in record found for today') }
    }

    // Calculate total hours
    const checkInTime = new Date(record.check_in)
    const checkOutTime = new Date(now)
    const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)

    // Calculate break time if exists
    let breakTime = 0
    if (record.break_start && record.break_end) {
      breakTime = (new Date(record.break_end).getTime() - new Date(record.break_start).getTime()) / (1000 * 60 * 60)
    }

    const workingHours = totalHours - breakTime

    return supabase
      .from('attendance_records')
      .update({
        check_out: now,
        total_hours: Number(workingHours.toFixed(2)),
        location_check_out: data.location || {},
        photos: [...(record.photos as string[] || []), ...(data.photo ? [data.photo] : [])]
      })
      .eq('id', record.id)
      .select()
      .single()
  },

  // Get attendance records
  async getAttendanceRecords(filters?: {
    employeeId?: string
    startDate?: string
    endDate?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        employee:user_profiles(first_name, last_name, employee_id)
      `)

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId)
    }

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte('date', filters.endDate)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return query.order('date', { ascending: false })
  },

  // Get attendance statistics
  async getAttendanceStats(employeeId?: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('attendance_records')
      .select('status, total_hours, overtime_hours')

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data: records } = await query

    const stats = {
      totalDays: records?.length || 0,
      presentDays: records?.filter(r => r.status === 'present').length || 0,
      absentDays: records?.filter(r => r.status === 'absent').length || 0,
      lateDays: records?.filter(r => r.status === 'late').length || 0,
      totalHours: records?.reduce((sum, r) => sum + (r.total_hours || 0), 0) || 0,
      overtimeHours: records?.reduce((sum, r) => sum + (r.overtime_hours || 0), 0) || 0,
      attendanceRate: records?.length ? 
        ((records.filter(r => r.status === 'present').length / records.length) * 100) : 0
    }

    return { data: stats, error: null }
  }
}

// ========================================
// LEAVE MANAGEMENT
// ========================================

export const leaveService = {
  // Get leave types
  async getLeaveTypes() {
    return supabase
      .from('leave_types')
      .select('*')
      .eq('is_active', true)
      .order('name')
  },

  // Submit leave request
  async submitLeaveRequest(leaveData: Tables['leave_requests']['Insert']) {
    return supabase
      .from('leave_requests')
      .insert(leaveData)
      .select(`
        *,
        employee:user_profiles(first_name, last_name, employee_id),
        leave_type:leave_types(name, code, color)
      `)
      .single()
  },

  // Get leave requests
  async getLeaveRequests(filters?: {
    employeeId?: string
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        employee:user_profiles(first_name, last_name, employee_id, departments!department_id(name)),
        leave_type:leave_types(name, code, color)
      `)

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
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

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return query.order('created_at', { ascending: false })
  },

  // Approve/Reject leave request
  async reviewLeaveRequest(
    requestId: string, 
    status: 'approved' | 'rejected', 
    reviewerId: string,
    rejectionReason?: string
  ) {
    return supabase
      .from('leave_requests')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: status === 'rejected' ? rejectionReason : null
      })
      .eq('id', requestId)
      .select()
      .single()
  },

  // Get leave balances
  async getLeaveBalances(employeeId: string, year?: number) {
    const currentYear = year || new Date().getFullYear()
    
    return supabase
      .from('leave_balances')
      .select(`
        *,
        leave_type:leave_types(name, code, color)
      `)
      .eq('employee_id', employeeId)
      .eq('year', currentYear)
  },

  // Get leave statistics (enhanced version)
  async getLeaveStats(options?: { employeeId?: string; userRole?: string } | string) {
    // Support both old and new API
    const employeeId = typeof options === 'string' ? options : options?.employeeId
    const userRole = typeof options === 'object' ? options?.userRole : 'employee'

    let query = supabase
      .from('leave_requests')
      .select('status, days_requested, leave_type_id, start_date, end_date')

    if (employeeId && userRole === 'employee') {
      query = query.eq('employee_id', employeeId)
    } else if (employeeId && userRole === 'manager') {
      // Get requests for team members
      const { data: teamMembers } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('manager_id', employeeId)

      const memberIds = teamMembers?.map(m => m.id) || []
      memberIds.push(employeeId)

      query = query.in('employee_id', memberIds)
    }
    // HR and Admin see all requests

    const { data: requests } = await query

    const stats = {
      totalRequests: requests?.length || 0,
      pendingRequests: requests?.filter(r => r.status === 'pending').length || 0,
      pendingApprovals: requests?.filter(r => r.status === 'pending').length || 0,
      approvedRequests: requests?.filter(r => r.status === 'approved').length || 0,
      rejectedRequests: requests?.filter(r => r.status === 'rejected').length || 0,
      totalDaysRequested: requests?.reduce((sum, r) => sum + r.days_requested, 0) || 0,
      teamUtilization: 85, // Calculate based on actual data
      averageLeaveLength: requests?.reduce((acc, r) => acc + (r.days_requested || 0), 0) / (requests?.length || 1) || 0,
      upcomingLeaves: requests?.filter(r =>
        r.status === 'approved' &&
        new Date(r.start_date) > new Date()
      ).length || 0,
      criticalCoverage: 3, // Calculate based on team overlap
      byStatus: requests?.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
    }

    return { data: stats, error: null }
  },

  // Check for leave conflicts
  async checkLeaveConflicts(options: {
    employeeId: string
    startDate: string
    endDate: string
    leaveType: string
  }) {
    const { employeeId, startDate, endDate } = options

    // Get employee info
    const { data: employee } = await supabase
      .from('user_profiles')
      .select('department_id, manager_id')
      .eq('employee_id', employeeId)
      .single()

    if (!employee) return []

    // Check overlapping requests in the same department
    const { data: overlappingRequests } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:user_profiles(first_name, last_name, department_id)
      `)
      .eq('status', 'approved')
      .eq('employee.department_id', employee.department_id)
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

    const conflicts = []

    // Check team understaffing
    if (overlappingRequests && overlappingRequests.length >= 3) {
      conflicts.push({
        type: 'team_understaffed',
        severity: 'high',
        message: `${overlappingRequests.length} team members will be on leave during this period`,
        affectedEmployees: overlappingRequests.map(r => r.employee),
      })
    }

    // Check critical periods
    const startDateObj = new Date(startDate)
    const isEndOfMonth = startDateObj.getDate() > 25
    const isEndOfQuarter = [3, 6, 9, 12].includes(startDateObj.getMonth() + 1) && isEndOfMonth

    if (isEndOfQuarter) {
      conflicts.push({
        type: 'critical_period',
        severity: 'medium',
        message: 'This period coincides with end-of-quarter activities',
        suggestedAlternatives: ['Consider rescheduling to early next month'],
      })
    }

    return conflicts
  },

  // Create leave request
  async createLeaveRequest(requestData: any) {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(requestData)
      .select()

    if (error) throw error
    return data?.[0]
  },

  // Get team members
  async getTeamMembers(employeeId: string) {
    const { data: employee } = await supabase
      .from('user_profiles')
      .select('department_id')
      .eq('employee_id', employeeId)
      .single()

    if (!employee) return []

    const { data: teamMembers, error } = await supabase
      .from('user_profiles')
      .select('id, employee_id, first_name, last_name, email, department_id')
      .eq('department_id', employee.department_id)
      .neq('employee_id', employeeId)

    if (error) throw error
    return teamMembers?.map(member => ({
      ...member,
      full_name: `${member.first_name} ${member.last_name}`
    })) || []
  },

  // Get leave balance for specific type
  async getLeaveBalance(employeeId: string) {
    const currentYear = new Date().getFullYear()

    // For demo purposes, return mock data
    return {
      annual: 15,
      sick: 8,
      personal: 3,
      emergency: 2,
      maternity: 0,
      paternity: 0,
      study: 5,
      compensatory: 1,
    }
  },

  // Process leave approval
  async processLeaveApproval(action: {
    type: 'approve' | 'reject' | 'request_info'
    requestId: string
    comments: string
    conditions?: string[]
  }) {
    const { type, requestId, comments } = action

    const updateData: any = {
      status: type === 'approve' ? 'approved' : type === 'reject' ? 'rejected' : 'pending',
      updated_at: new Date().toISOString(),
    }

    if (comments) {
      updateData.manager_comments = comments
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()

    if (error) throw error
    return data?.[0]
  },

  // Enhanced get leave requests with role-based filtering
  async getLeaveRequestsEnhanced(options: { employeeId: string, userRole: string }) {
    const { employeeId, userRole } = options

    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        employee:user_profiles(first_name, last_name, department_id, avatar_url)
      `)
      .order('created_at', { ascending: false })

    // Filter based on role
    if (userRole === 'employee') {
      query = query.eq('employee_id', employeeId)
    } else if (userRole === 'manager') {
      // Get requests for team members
      const { data: teamMembers } = await supabase
        .from('user_profiles')
        .select('employee_id')
        .eq('manager_id', employeeId)

      const memberIds = teamMembers?.map(m => m.employee_id) || []
      memberIds.push(employeeId)

      query = query.in('employee_id', memberIds)
    }
    // HR and Admin see all requests

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Mock functions for enhanced features

  async getAccrualHistory(employeeId: string, year: number) {
    return []
  },

  async getLeaveProjections(employeeId: string, year: number) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((month, index) => ({
      month,
      annual: Math.max(0, 25 - (index * 1.5)),
      sick: Math.max(0, 10 - (index * 0.5)),
      personal: Math.max(0, 5 - (index * 0.3)),
      total: Math.max(0, 40 - (index * 2.3)),
    }))
  }
}

// ========================================
// DEPARTMENT MANAGEMENT
// ========================================

export const departmentService = {
  // Get all departments
  async getDepartments() {
    return supabase
      .from('departments')
      .select(`
        *,
        parent:departments!parent_department_id(name)
      `)
      .eq('is_active', true)
      .order('name')
  },

  // Get department analytics
  async getDepartmentAnalytics(departmentId?: string) {
    let employeeQuery = supabase
      .from('user_profiles')
      .select('id, status, salary')
      .eq('is_active', true)

    if (departmentId) {
      employeeQuery = employeeQuery.eq('department_id', departmentId)
    }

    const { data: employees } = await employeeQuery

    // Get attendance data for the department
    const employeeIds = employees?.map(e => e.id) || []
    
    if (employeeIds.length === 0) {
      return { 
        data: { 
          totalEmployees: 0, 
          activeEmployees: 0, 
          averageSalary: 0,
          attendanceRate: 0 
        }, 
        error: null 
      }
    }

    const { data: attendanceRecords } = await supabase
      .from('attendance_records')
      .select('status')
      .in('employee_id', employeeIds)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    const analytics = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === 'active').length,
      averageSalary: employees.reduce((sum, e) => sum + (e.salary || 0), 0) / employees.length,
      attendanceRate: attendanceRecords?.length ? 
        (attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100 : 0
    }

    return { data: analytics, error: null }
  }
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================

export const notificationService = {
  // Send notification
  async sendNotification(notification: Tables['notifications']['Insert']) {
    return supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()
  },

  // Get user notifications
  async getUserNotifications(userId: string, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    return query
      .order('created_at', { ascending: false })
      .limit(50)
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    return supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId)
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    return supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('recipient_id', userId)
      .eq('is_read', false)
  }
}

// ========================================
// AUDIT LOGGING
// ========================================

export const auditService = {
  // Log user action
  async logAction(action: Tables['audit_logs']['Insert']) {
    return supabase
      .from('audit_logs')
      .insert(action)
  },

  // Get audit logs
  async getAuditLogs(filters?: {
    userId?: string
    resourceType?: string
    action?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('audit_logs')
      .select('*')

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.resourceType) {
      query = query.eq('resource_type', filters.resourceType)
    }

    if (filters?.action) {
      query = query.eq('action', filters.action)
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return query.order('created_at', { ascending: false })
  }
}

// ========================================
// ANALYTICS & REPORTING
// ========================================

export const analyticsService = {
  // Get dashboard metrics
  async getDashboardMetrics() {
    const [
      employeeStats,
      attendanceStats,
      leaveStats,
      departmentStats
    ] = await Promise.all([
      employeeService.getEmployeeStats(),
      attendanceService.getAttendanceStats(),
      leaveService.getLeaveStats(),
      departmentService.getDepartmentAnalytics()
    ])

    return {
      employees: employeeStats.data,
      attendance: attendanceStats.data,
      leaves: leaveStats.data,
      departments: departmentStats.data
    }
  },

  // Get trends data
  async getTrends(metric: string, period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[period]

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]

    // Implementation depends on the specific metric
    // This is a placeholder structure
    return {
      data: [],
      period,
      metric
    }
  }
}

// Additional enhanced leave management functions have been merged into the existing leaveService above

// Error handling wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<{ data: T; error: any }>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const { data, error } = await operation()
    if (error) {
      return { data: null, error: error.message || 'Unknown error occurred' }
    }
    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unexpected error occurred'
    }
  }
}
