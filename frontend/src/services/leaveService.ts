// ========================================
// LEAVE MANAGEMENT SERVICE
// ========================================
// API service layer for leave CRUD operations

import { supabase } from '../lib/supabase'

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  days_requested: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  emergency_contact: string | null
  handover_notes: string | null
  is_half_day: boolean
  half_day_period: 'morning' | 'afternoon' | null
  created_at: string
  updated_at: string
}

export interface LeaveType {
  id: string
  name: string
  code: string
  description: string
  max_days_per_year: number
  max_consecutive_days: number
  requires_approval: boolean
  is_paid: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  employee_id: string
  leave_type_id: string
  year: number
  total_allocated: number
  used_days: number
  pending_days: number
  remaining_days: number
  carried_forward: number
  created_at: string
  updated_at: string
}

export interface CreateLeaveRequest {
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  reason: string
  emergency_contact?: string
  handover_notes?: string
  is_half_day?: boolean
  half_day_period?: 'morning' | 'afternoon'
}

export interface UpdateLeaveRequest {
  id: string
  leave_type_id?: string
  start_date?: string
  end_date?: string
  reason?: string
  emergency_contact?: string
  handover_notes?: string
  is_half_day?: boolean
  half_day_period?: 'morning' | 'afternoon'
}

export interface ApproveLeaveRequest {
  id: string
  approved_by: string
  approval_notes?: string
}

export interface RejectLeaveRequest {
  id: string
  rejected_by: string
  rejection_reason: string
}

export interface LeaveFilters {
  employee_id?: string
  department_id?: string
  leave_type_id?: string
  status?: string
  start_date?: string
  end_date?: string
  year?: number
}

export interface GetLeaveRequestsResponse {
  requests: LeaveRequest[]
  total_count: number
  page: number
  page_size: number
}

export interface LeaveStats {
  total_requests: number
  pending_requests: number
  approved_requests: number
  rejected_requests: number
  total_days_taken: number
  remaining_balance: number
}

class LeaveService {
  /**
   * Create a new leave request
   */
  async createLeaveRequest(data: CreateLeaveRequest): Promise<{ success: boolean; request?: LeaveRequest; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Calculate days requested
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)
      const timeDiff = endDate.getTime() - startDate.getTime()
      let daysRequested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

      // Adjust for half day
      if (data.is_half_day) {
        daysRequested = 0.5
      }

      const currentTime = new Date().toISOString()

      const leaveData = {
        employee_id: data.employee_id,
        leave_type_id: data.leave_type_id,
        start_date: data.start_date,
        end_date: data.end_date,
        days_requested: daysRequested,
        reason: data.reason,
        status: 'pending' as const,
        emergency_contact: data.emergency_contact,
        handover_notes: data.handover_notes,
        is_half_day: data.is_half_day || false,
        half_day_period: data.half_day_period,
        created_at: currentTime,
        updated_at: currentTime
      }

      const { data: created, error } = await supabase
        .from('leave_requests')
        .insert(leaveData as any)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        request: created
      }
    } catch (error: any) {
      console.error('Create leave request error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create leave request'
      }
    }
  }

  /**
   * Get leave requests with pagination and filtering
   */
  async getLeaveRequests(
    page: number = 1,
    pageSize: number = 50,
    filters?: LeaveFilters
  ): Promise<GetLeaveRequestsResponse> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          user_profiles!inner(
            employee_id,
            first_name,
            last_name,
            department_id
          ),
          leave_types!inner(
            name,
            code,
            is_paid
          )
        `, { count: 'exact' })

      // Apply filters
      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id)
      }
      if (filters?.department_id) {
        query = query.eq('user_profiles.department_id', filters.department_id)
      }
      if (filters?.leave_type_id) {
        query = query.eq('leave_type_id', filters.leave_type_id)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.start_date) {
        query = query.gte('start_date', filters.start_date)
      }
      if (filters?.end_date) {
        query = query.lte('end_date', filters.end_date)
      }
      if (filters?.year) {
        const yearStart = `${filters.year}-01-01`
        const yearEnd = `${filters.year}-12-31`
        query = query.gte('start_date', yearStart).lte('start_date', yearEnd)
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      // Order by created_at desc
      query = query.order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) {
        console.error('Leave requests fetch error:', error)
        throw error
      }

      return {
        requests: data || [],
        total_count: count || 0,
        page,
        page_size: pageSize
      }
    } catch (error: any) {
      console.error('Failed to fetch leave requests:', error)
      throw error
    }
  }

  /**
   * Get leave request by ID
   */
  async getLeaveRequestById(id: string): Promise<LeaveRequest | null> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          user_profiles!inner(
            employee_id,
            first_name,
            last_name,
            department_id
          ),
          leave_types!inner(
            name,
            code,
            is_paid
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Request not found
        }
        console.error('Leave request fetch error:', error)
        throw error
      }

      return data
    } catch (error: any) {
      console.error('Failed to fetch leave request:', error)
      throw error
    }
  }

  /**
   * Update leave request
   */
  async updateLeaveRequest(data: UpdateLeaveRequest): Promise<{ success: boolean; request?: LeaveRequest; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      // Only include fields that are provided
      if (data.leave_type_id !== undefined) updateData.leave_type_id = data.leave_type_id
      if (data.start_date !== undefined) updateData.start_date = data.start_date
      if (data.end_date !== undefined) updateData.end_date = data.end_date
      if (data.reason !== undefined) updateData.reason = data.reason
      if (data.emergency_contact !== undefined) updateData.emergency_contact = data.emergency_contact
      if (data.handover_notes !== undefined) updateData.handover_notes = data.handover_notes
      if (data.is_half_day !== undefined) updateData.is_half_day = data.is_half_day
      if (data.half_day_period !== undefined) updateData.half_day_period = data.half_day_period

      // Recalculate days if dates are updated
      if (data.start_date !== undefined || data.end_date !== undefined) {
        const { data: existing } = await supabase
          .from('leave_requests')
          .select('start_date, end_date, is_half_day')
          .eq('id', data.id)
          .single()

        if (existing) {
          const startDate = new Date(data.start_date || existing.start_date)
          const endDate = new Date(data.end_date || existing.end_date)
          const timeDiff = endDate.getTime() - startDate.getTime()
          let daysRequested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

          if (data.is_half_day !== undefined ? data.is_half_day : existing.is_half_day) {
            daysRequested = 0.5
          }

          updateData.days_requested = daysRequested
        }
      }

      const { data: updated, error } = await supabase
        .from('leave_requests')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        request: updated
      }
    } catch (error: any) {
      console.error('Update leave request error:', error)
      return {
        success: false,
        error: error.message || 'Failed to update leave request'
      }
    }
  }

  /**
   * Approve leave request
   */
  async approveLeaveRequest(data: ApproveLeaveRequest): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: data.approved_by,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', data.id)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Approve leave request error:', error)
      return {
        success: false,
        error: error.message || 'Failed to approve leave request'
      }
    }
  }

  /**
   * Reject leave request
   */
  async rejectLeaveRequest(data: RejectLeaveRequest): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          approved_by: data.rejected_by,
          approved_at: new Date().toISOString(),
          rejection_reason: data.rejection_reason,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', data.id)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Reject leave request error:', error)
      return {
        success: false,
        error: error.message || 'Failed to reject leave request'
      }
    }
  }

  /**
   * Cancel leave request
   */
  async cancelLeaveRequest(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Cancel leave request error:', error)
      return {
        success: false,
        error: error.message || 'Failed to cancel leave request'
      }
    }
  }

  /**
   * Delete leave request
   */
  async deleteLeaveRequest(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Delete leave request error:', error)
      return {
        success: false,
        error: error.message || 'Failed to delete leave request'
      }
    }
  }

  /**
   * Get leave types
   */
  async getLeaveTypes(): Promise<LeaveType[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('Leave types fetch error:', error)
        throw error
      }

      return data || []
    } catch (error: any) {
      console.error('Failed to fetch leave types:', error)
      return []
    }
  }

  /**
   * Get leave balances for an employee
   */
  async getLeaveBalances(employeeId: string, year?: number): Promise<LeaveBalance[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('leave_balances')
        .select(`
          *,
          leave_types!inner(
            name,
            code,
            max_days_per_year
          )
        `)
        .eq('employee_id', employeeId)

      if (year) {
        query = query.eq('year', year)
      } else {
        query = query.eq('year', new Date().getFullYear())
      }

      const { data, error } = await query.order('leave_types.name', { ascending: true })

      if (error) {
        console.error('Leave balances fetch error:', error)
        throw error
      }

      return data || []
    } catch (error: any) {
      console.error('Failed to fetch leave balances:', error)
      return []
    }
  }

  /**
   * Get leave statistics for an employee
   */
  async getLeaveStats(employeeId: string, year?: number): Promise<LeaveStats> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const currentYear = year || new Date().getFullYear()
      const yearStart = `${currentYear}-01-01`
      const yearEnd = `${currentYear}-12-31`

      const { data, error } = await supabase
        .from('leave_requests')
        .select('status, days_requested')
        .eq('employee_id', employeeId)
        .gte('start_date', yearStart)
        .lte('start_date', yearEnd)

      if (error) throw error

      const requests = data || []
      const totalRequests = requests.length
      const pendingRequests = requests.filter(r => r.status === 'pending').length
      const approvedRequests = requests.filter(r => r.status === 'approved').length
      const rejectedRequests = requests.filter(r => r.status === 'rejected').length
      const totalDaysTaken = requests
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + (r.days_requested || 0), 0)

      // Get total leave balance
      const balances = await this.getLeaveBalances(employeeId, currentYear)
      const remainingBalance = balances.reduce((sum, b) => sum + (b.remaining_days || 0), 0)

      return {
        total_requests: totalRequests,
        pending_requests: pendingRequests,
        approved_requests: approvedRequests,
        rejected_requests: rejectedRequests,
        total_days_taken: Math.round(totalDaysTaken * 100) / 100,
        remaining_balance: Math.round(remainingBalance * 100) / 100
      }
    } catch (error: any) {
      console.error('Failed to fetch leave stats:', error)
      return {
        total_requests: 0,
        pending_requests: 0,
        approved_requests: 0,
        rejected_requests: 0,
        total_days_taken: 0,
        remaining_balance: 0
      }
    }
  }

  /**
   * Check leave conflicts for an employee
   */
  async checkLeaveConflicts(employeeId: string, startDate: string, endDate: string, excludeId?: string): Promise<LeaveRequest[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .in('status', ['pending', 'approved'])
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Failed to check leave conflicts:', error)
      return []
    }
  }

  /**
   * Get team leave calendar
   */
  async getTeamLeaveCalendar(departmentId: string, startDate: string, endDate: string): Promise<LeaveRequest[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          user_profiles!inner(
            employee_id,
            first_name,
            last_name,
            department_id
          ),
          leave_types!inner(
            name,
            code
          )
        `)
        .eq('user_profiles.department_id', departmentId)
        .eq('status', 'approved')
        .gte('start_date', startDate)
        .lte('end_date', endDate)
        .order('start_date', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Failed to fetch team leave calendar:', error)
      return []
    }
  }
}

export const leaveService = new LeaveService()
export default leaveService
