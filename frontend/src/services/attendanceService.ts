// ========================================
// ATTENDANCE MANAGEMENT SERVICE
// ========================================
// API service layer for attendance CRUD operations

import { api } from '../lib/api'

export interface AttendanceRecord {
  id: string
  employee_id: string
  date: string
  clock_in: string | null
  clock_out: string | null
  break_start: string | null
  break_end: string | null
  total_hours: number | null
  overtime_hours: number | null
  status: 'present' | 'absent' | 'late' | 'half_day' | 'holiday' | 'leave'
  notes: string | null
  location_in: string | null
  location_out: string | null
  ip_address_in: string | null
  ip_address_out: string | null
  is_approved: boolean
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateAttendanceRequest {
  employee_id: string
  date: string
  clock_in?: string
  clock_out?: string
  break_start?: string
  break_end?: string
  status?: 'present' | 'absent' | 'late' | 'half_day' | 'holiday' | 'leave'
  notes?: string
  location_in?: string
  location_out?: string
  ip_address_in?: string
  ip_address_out?: string
}

export interface UpdateAttendanceRequest {
  id: string
  clock_in?: string
  clock_out?: string
  break_start?: string
  break_end?: string
  status?: 'present' | 'absent' | 'late' | 'half_day' | 'holiday' | 'leave'
  notes?: string
  location_out?: string
  ip_address_out?: string
}

export interface ClockInRequest {
  employee_id: string
  location?: string
  ip_address?: string
  notes?: string
}

export interface ClockOutRequest {
  employee_id: string
  location?: string
  ip_address?: string
  notes?: string
}

export interface AttendanceFilters {
  employee_id?: string
  department_id?: string
  start_date?: string
  end_date?: string
  status?: string
  is_approved?: boolean
}

export interface GetAttendanceResponse {
  records: AttendanceRecord[]
  total_count: number
  page: number
  page_size: number
}

export interface AttendanceStats {
  total_days: number
  present_days: number
  absent_days: number
  late_days: number
  total_hours: number
  overtime_hours: number
  attendance_rate: number
}

class AttendanceService {
  /**
   * Clock in for the current day
   */
  async clockIn(data: ClockInRequest): Promise<{ success: boolean; record?: AttendanceRecord; error?: string }> {
    try {
      

      const today = new Date().toISOString().split('T')[0]
      const currentTime = new Date().toISOString()

      // Check if already clocked in today
      const existing = await api.get(`/api/attendance?user_id=${encodeURIComponent(data.employee_id)}&from=${today}&to=${today}`)
        .then((rows: any[]) => rows[0])

      if (existing && existing.clock_in) {
        return {
          success: false,
          error: 'Already clocked in today'
        }
      }

      const attendanceData = {
        employee_id: data.employee_id,
        date: today,
        clock_in: currentTime,
        status: 'present' as const,
        location_in: data.location,
        ip_address_in: data.ip_address,
        notes: data.notes,
        created_at: currentTime,
        updated_at: currentTime
      }

      let result
      if (existing) {
        // Update existing record
        result = await api.patch(`/api/attendance/${existing.id}`, attendanceData as any)
      } else {
        // Create new record
        result = await api.post('/api/attendance', attendanceData as any)
      }

      return {
        success: true,
        record: result
      }
    } catch (error: any) {
      console.error('Clock in error:', error)
      return {
        success: false,
        error: error.message || 'Failed to clock in'
      }
    }
  }

  /**
   * Clock out for the current day
   */
  async clockOut(data: ClockOutRequest): Promise<{ success: boolean; record?: AttendanceRecord; error?: string }> {
    try {
      

      const today = new Date().toISOString().split('T')[0]
      const currentTime = new Date().toISOString()

      // Find today's attendance record
      const existing = await api.get(`/api/attendance?user_id=${encodeURIComponent(data.employee_id)}&from=${today}&to=${today}`)
        .then((rows: any[]) => rows.find(r => r.clock_out == null))

      if (!existing) {
        return { success: false, error: 'No active clock-in record found' }
      }

      // Calculate total hours
      const clockInTime = new Date((existing as any).clock_in)
      const clockOutTime = new Date()
      const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)

      const updateData = {
        clock_out: currentTime,
        total_hours: Math.round(totalHours * 100) / 100,
        location_out: data.location,
        ip_address_out: data.ip_address,
        notes: data.notes || (existing as any).notes,
        updated_at: currentTime
      }

      const updated = await api.patch(`/api/attendance/${(existing as any).id}`, updateData as any)

      return {
        success: true,
        record: {
          id: (updated as any)?.id,
          clock_out: (updated as any)?.clock_out,
          total_hours: (updated as any)?.total_hours,
          notes: (updated as any)?.notes
        } as any
      }
    } catch (error: any) {
      console.error('Clock out error:', error)
      return {
        success: false,
        error: error.message || 'Failed to clock out'
      }
    }
  }

  /**
   * Get attendance records with pagination and filtering
   */
  async getAttendanceRecords(
    page: number = 1,
    pageSize: number = 50,
    filters?: AttendanceFilters
  ): Promise<GetAttendanceResponse> {
    try {
      

      const params = new URLSearchParams()
      if (filters?.employee_id) params.set('user_id', filters.employee_id)
      if (filters?.start_date) params.set('from', filters.start_date)
      if (filters?.end_date) params.set('to', filters.end_date)

      // Apply filters
      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id)
      }
      if (filters?.department_id) {
        query = query.eq('user_profiles.department_id', filters.department_id)
      }
      if (filters?.start_date) {
        query = query.gte('date', filters.start_date)
      }
      if (filters?.end_date) {
        query = query.lte('date', filters.end_date)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.is_approved !== undefined) {
        query = query.eq('is_approved', filters.is_approved)
      }

      // Apply pagination
      const data = await api.get(`/api/attendance?${params.toString()}`)
      const total = (data as any[]).length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = (data as any[]).slice(start, end)
      return { records: pageData, total_count: total, page, page_size: pageSize }
    } catch (error: any) {
      console.error('Failed to fetch attendance records:', error)
      throw error
    }
  }

  /**
   * Get attendance record by ID
   */
  async getAttendanceById(id: string): Promise<AttendanceRecord | null> {
    try {
      return api.get(`/api/attendance?id=${encodeURIComponent(id)}`)
    } catch (error: any) {
      console.error('Failed to fetch attendance record:', error)
      throw error
    }
  }

  /**
   * Create attendance record manually (Admin/HR only)
   */
  async createAttendanceRecord(data: CreateAttendanceRequest): Promise<{ success: boolean; record?: AttendanceRecord; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const currentTime = new Date().toISOString()
      
      // Calculate total hours if both clock_in and clock_out are provided
      let totalHours = null
      if ((data as any).clock_in && (data as any).clock_out) {
        const clockInTime = new Date((data as any).clock_in)
        const clockOutTime = new Date((data as any).clock_out)
        totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
      }

      const attendanceData = {
        employee_id: data.employee_id,
        date: data.date,
        clock_in: data.clock_in,
        clock_out: data.clock_out,
        break_start: data.break_start,
        break_end: data.break_end,
        total_hours: totalHours ? Math.round(totalHours * 100) / 100 : null,
        status: data.status || 'present',
        notes: data.notes,
        location_in: data.location_in,
        location_out: data.location_out,
        ip_address_in: data.ip_address_in,
        ip_address_out: data.ip_address_out,
        created_at: currentTime,
        updated_at: currentTime
      }

      const { data: result, error } = await supabase.rpc('clock_in', {
        employee_id: data.employee_id,
        location: data.location_in || '',
        notes: data.notes || ''
      } as any)

      if (error) throw error

      return {
        success: true,
        record: {
          id: (result as any)?.id,
          clock_in: (result as any)?.clock_in
        } as any
      }
    } catch (error: any) {
      console.error('Create attendance record error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create attendance record'
      }
    }
  }

  /**
   * Update attendance record
   */
  async updateAttendanceRecord(data: UpdateAttendanceRequest): Promise<{ success: boolean; record?: AttendanceRecord; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      // Only include fields that are provided
      if (data.clock_in !== undefined) updateData.clock_in = data.clock_in
      if (data.clock_out !== undefined) updateData.clock_out = data.clock_out
      if (data.break_start !== undefined) updateData.break_start = data.break_start
      if (data.break_end !== undefined) updateData.break_end = data.break_end
      if (data.status !== undefined) updateData.status = data.status
      if (data.notes !== undefined) updateData.notes = data.notes
      if (data.location_out !== undefined) updateData.location_out = data.location_out
      if (data.ip_address_out !== undefined) updateData.ip_address_out = data.ip_address_out

      // Recalculate total hours if clock times are updated
      if (data.clock_in !== undefined || data.clock_out !== undefined) {
        const { data: existing } = await supabase
          .from('attendance_records')
          .select('clock_in, clock_out')
          .eq('id', data.id)
          .single()

        if (existing) {
          const clockIn = data.clock_in || existing.clock_in
          const clockOut = data.clock_out || existing.clock_out

          if (clockIn && clockOut) {
            const clockInTime = new Date(clockIn)
            const clockOutTime = new Date(clockOut)
            const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
            updateData.total_hours = Math.round(totalHours * 100) / 100
          }
        }
      }

      const { data: updated, error } = await supabase
        .from('attendance_records')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        record: updated
      }
    } catch (error: any) {
      console.error('Update attendance record error:', error)
      return {
        success: false,
        error: error.message || 'Failed to update attendance record'
      }
    }
  }

  /**
   * Delete attendance record
   */
  async deleteAttendanceRecord(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Delete attendance record error:', error)
      return {
        success: false,
        error: error.message || 'Failed to delete attendance record'
      }
    }
  }

  /**
   * Approve attendance record
   */
  async approveAttendanceRecord(id: string, approvedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('attendance_records')
        .update({
          is_approved: true,
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Approve attendance record error:', error)
      return {
        success: false,
        error: error.message || 'Failed to approve attendance record'
      }
    }
  }

  /**
   * Get attendance statistics for an employee
   */
  async getAttendanceStats(employeeId: string, startDate: string, endDate: string): Promise<AttendanceStats> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('attendance_records')
        .select('status, total_hours, overtime_hours')
        .eq('employee_id', employeeId)
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) throw error

      const records = data || []
      const totalDays = records.length
      const totalPresent = records.filter(record => (record as any)?.status === 'present').length
      const totalAbsent = records.filter(record => (record as any)?.status === 'absent').length
      const totalLate = records.filter(record => (record as any)?.status === 'late').length
      const totalHours = records.reduce((sum, record) => sum + ((record as any)?.total_hours || 0), 0)
      const totalOvertime = records.reduce((sum, record) => sum + ((record as any)?.overtime_hours || 0), 0)
      const attendanceRate = totalDays > 0 ? (totalPresent / totalDays) * 100 : 0

      return {
        total_days: totalDays,
        present_days: totalPresent,
        absent_days: totalAbsent,
        late_days: totalLate,
        total_hours: Math.round(totalHours * 100) / 100,
        overtime_hours: Math.round(totalOvertime * 100) / 100,
        attendance_rate: Math.round(attendanceRate * 100) / 100
      }
    } catch (error: any) {
      console.error('Failed to fetch attendance stats:', error)
      return {
        total_days: 0,
        present_days: 0,
        absent_days: 0,
        late_days: 0,
        total_hours: 0,
        overtime_hours: 0,
        attendance_rate: 0
      }
    }
  }

  /**
   * Get today's attendance status for an employee
   */
  async getTodayAttendance(employeeId: string): Promise<AttendanceRecord | null> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data || null
    } catch (error: any) {
      console.error('Failed to fetch today attendance:', error)
      return null
    }
  }
}

export const attendanceService = new AttendanceService()
export default attendanceService
