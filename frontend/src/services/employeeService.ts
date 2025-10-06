// ========================================
// EMPLOYEE MANAGEMENT SERVICE
// ========================================
// API service layer for employee CRUD operations

import { supabase } from '../lib/supabase'

export interface CreateEmployeeRequest {
  email: string
  first_name: string
  last_name: string
  role_name: string
  department_id?: string
  position_id?: string
  manager_employee_id?: string
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'intern'
  hire_date?: string
  salary?: number
  phone?: string
  address?: string
  emergency_contact?: string
  work_location?: string
}

export interface CreateEmployeeResponse {
  success: boolean
  employee_id?: string
  auth_user_id?: string
  email?: string
  temporary_password?: string
  message?: string
  error?: string
}

export interface BulkCreateRequest {
  employees: CreateEmployeeRequest[]
}

export interface BulkCreateResponse {
  success: boolean
  created_count?: number
  failed_count?: number
  errors?: string[]
  created_employees?: any[]
  error?: string
}

export interface PasswordResetResponse {
  success: boolean
  employee_id?: string
  temporary_password?: string
  message?: string
  error?: string
}

export interface DeactivateEmployeeResponse {
  success: boolean
  employee_id?: string
  message?: string
  error?: string
}

export interface UpdateEmployeeRequest {
  employee_id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  emergency_contact?: string
  department_id?: string
  position_id?: string
  manager_employee_id?: string
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'intern'
  salary?: number
  work_location?: string
}

export interface UpdateEmployeeResponse {
  success: boolean
  employee_id?: string
  message?: string
  error?: string
}

export interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  emergency_contact?: string
  department_id?: string
  position_id?: string
  manager_employee_id?: string
  employment_type: string
  hire_date: string
  salary?: number
  work_location?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GetEmployeesResponse {
  employees: Employee[]
  total_count: number
  page: number
  page_size: number
}

class EmployeeService {
  /**
   * Create a new employee (Admin/HR only)
   */
  async createEmployee(data: CreateEmployeeRequest): Promise<CreateEmployeeResponse> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data: result, error } = await supabase.rpc('create_employee_admin', {
        p_email: data.email,
        p_first_name: data.first_name,
        p_last_name: data.last_name,
        p_role_name: data.role_name,
        p_department_id: data.department_id,
        p_position_id: data.position_id,
        p_manager_employee_id: data.manager_employee_id,
        p_employment_type: data.employment_type || 'full_time',
        p_hire_date: data.hire_date || new Date().toISOString().split('T')[0],
        p_salary: data.salary,
        p_phone: data.phone,
        p_address: data.address,
        p_emergency_contact: data.emergency_contact,
        p_work_location: data.work_location
      } as any)

      if (error) {
        console.error('Employee creation error:', error)
        throw error
      }

      const response = result as CreateEmployeeResponse

      if (response.success) {
        console.log('Employee created successfully!')
      } else {
        console.error('Failed to create employee', response.error)
        throw new Error(response.error || 'Failed to create employee')
      }

      return response
    } catch (error: any) {
      console.error('Error creating employee:', error)
      throw error
    }
  }

  /**
   * Create multiple employees in bulk
   */
  async createEmployeesBulk(data: BulkCreateRequest): Promise<BulkCreateResponse> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const parseCSVData = (csvText: string): Record<string, string>[] => {
        const lines = csvText.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        
        return lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const item: Record<string, string> = {}
          headers.forEach((header, index) => {
            item[header] = values[index] || ''
          })
          return item
        })
      }

      const { data: result, error } = await supabase.rpc('bulk_create_employees', {
        p_employees_data: JSON.stringify(data.employees)
      })

      if (error) {
        console.error('Bulk employee creation error:', error)
        throw error
      }

      const response = result as BulkCreateResponse

      if (response.success) {
        console.log('Bulk creation completed!')
      } else {
        console.error('Bulk creation failed')
        throw new Error(response.error || response.errors?.join(', ') || 'Failed to create employees')
      }

      return response
    } catch (error: any) {
      console.error('Error creating employees in bulk:', error)
      throw error
    }
  }

  /**
   * Reset employee password to default
   */
  async resetEmployeePassword(employeeId: string): Promise<PasswordResetResponse> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data: result, error } = await supabase.rpc('reset_employee_password', {
        p_employee_id: employeeId
      })

      if (error) {
        console.error('Password reset error:', error)
        throw error
      }

      const response = result as PasswordResetResponse

      if (response.success) {
        console.log('Password reset successfully!')
      } else {
        console.error('Password reset failed', response.error)
        throw new Error(response.error || 'Failed to reset password')
      }

      return response
    } catch (error: any) {
      console.error('Error resetting password:', error)
      throw error
    }
  }

  /**
   * Deactivate employee
   */
  async deactivateEmployee(employeeId: string, reason?: string): Promise<DeactivateEmployeeResponse> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data: result, error } = await supabase.rpc('deactivate_employee', {
        p_employee_id: employeeId,
        p_reason: reason
      })

      if (error) {
        console.error('Employee deactivation error:', error)
        throw error
      }

      const response = result as DeactivateEmployeeResponse

      if (response.success) {
        console.log('Employee deactivated successfully!')
      } else {
        console.error('Deactivation failed', response.error)
        throw new Error(response.error || 'Failed to deactivate employee')
      }

      return response
    } catch (error: any) {
      console.error('Error deactivating employee:', error)
      throw error
    }
  }

  /**
   * Get next available employee ID
   */
  async getNextEmployeeId(): Promise<string> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data: result, error } = await supabase.rpc('generate_employee_id')

      if (error) {
        console.error('Employee ID generation error:', error)
        throw error
      }

      return result as string
    } catch (error: any) {
      console.error('Failed to generate employee ID:', error)
      // Fallback to timestamp-based ID
      return `EMP${Date.now().toString().slice(-4)}`
    }
  }

  /**
   * Get available roles for employee creation
   */
  async getAvailableRoles(): Promise<Array<{ id: number; name: string; display_name: string; level: number }>> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('roles')
        .select('id, name, display_name, level')
        .order('level', { ascending: true })

      if (error) {
        console.error('Roles fetch error:', error)
        throw error
      }

      return data || []
    } catch (error: any) {
      console.error('Failed to fetch roles:', error)
      return []
    }
  }

  /**
   * Get available departments
   */
  async getAvailableDepartments(): Promise<Array<{ id: string; name: string; code: string }>> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .order('name', { ascending: true })

      if (error) {
        console.error('Departments fetch error:', error)
        throw error
      }

      return data || []
    } catch (error: any) {
      console.error('Failed to fetch departments:', error)
      return []
    }
  }

  /**
   * Get available positions
   */
  async getAvailablePositions(): Promise<Array<{ id: string; title: string; code: string; level: string }>> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('positions')
        .select('id, title, code, level')
        .order('title', { ascending: true })

      if (error) {
        console.error('Positions fetch error:', error)
        throw error
      }

      return data || []
    } catch (error: any) {
      console.error('Failed to fetch positions:', error)
      return []
    }
  }

  /**
   * Get potential managers (employees who can be managers)
   */
  async getPotentialManagers(): Promise<Array<{ employee_id: string; display_name: string; role: string }>> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          employee_id,
          display_name,
          first_name,
          last_name,
          roles!inner(name, level)
        `)
        .eq('is_active', true)
        .gte('roles.level', 60) // Team Lead level and above
        .order('display_name', { ascending: true })

      if (error) {
        console.error('Managers fetch error:', error)
        throw error
      }

      const processedData = data.map((item: any) => ({
        employee_id: item.employee_id,
        display_name: item.display_name || `${item.first_name} ${item.last_name}`,
        role: (item.roles as any)?.name || 'Unknown'
      }))

      return processedData
    } catch (error: any) {
      console.error('Failed to fetch potential managers:', error)
      return []
    }
  }

  /**
   * Get all employees with pagination and filtering
   */
  async getEmployees(page: number = 1, pageSize: number = 50, filters?: {
    search?: string
    department_id?: string
    is_active?: boolean
    employment_type?: string
  }): Promise<GetEmployeesResponse> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          employee_id,
          first_name,
          last_name,
          email,
          phone,
          address,
          emergency_contact,
          department_id,
          position_id,
          manager_employee_id,
          employment_type,
          hire_date,
          salary,
          work_location,
          is_active,
          created_at,
          updated_at
        `, { count: 'exact' })

      // Apply filters
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_id.ilike.%${filters.search}%`)
      }
      if (filters?.department_id) {
        query = query.eq('department_id', filters.department_id)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      if (filters?.employment_type) {
        query = query.eq('employment_type', filters.employment_type)
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      // Order by employee_id
      query = query.order('employee_id', { ascending: true })

      const { data, error, count } = await query

      if (error) {
        console.error('Employees fetch error:', error)
        throw error
      }

      return {
        employees: data || [],
        total_count: count || 0,
        page,
        page_size: pageSize
      }
    } catch (error: any) {
      console.error('Failed to fetch employees:', error)
      throw error
    }
  }

  /**
   * Get single employee by ID
   */
  async getEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          employee_id,
          first_name,
          last_name,
          email,
          phone,
          address,
          emergency_contact,
          department_id,
          position_id,
          manager_employee_id,
          employment_type,
          hire_date,
          salary,
          work_location,
          is_active,
          created_at,
          updated_at
        `)
        .eq('employee_id', employeeId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Employee not found
        }
        console.error('Employee fetch error:', error)
        throw error
      }

      return data
    } catch (error: any) {
      console.error('Failed to fetch employee:', error)
      throw error
    }
  }

  /**
   * Update employee information
   */
  async updateEmployee(data: UpdateEmployeeRequest): Promise<UpdateEmployeeResponse> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const updateData: any = {}
      
      // Only include fields that are provided
      if (data.first_name !== undefined) updateData.first_name = data.first_name
      if (data.last_name !== undefined) updateData.last_name = data.last_name
      if (data.email !== undefined) updateData.email = data.email
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.address !== undefined) updateData.address = data.address
      if (data.emergency_contact !== undefined) updateData.emergency_contact = data.emergency_contact
      if (data.department_id !== undefined) updateData.department_id = data.department_id
      if (data.position_id !== undefined) updateData.position_id = data.position_id
      if (data.manager_employee_id !== undefined) updateData.manager_employee_id = data.manager_employee_id
      if (data.employment_type !== undefined) updateData.employment_type = data.employment_type
      if (data.salary !== undefined) updateData.salary = data.salary
      if (data.work_location !== undefined) updateData.work_location = data.work_location
      
      updateData.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData as any)
        .eq('employee_id', data.employee_id)

      if (error) {
        console.error('Employee update error:', error)
        throw error
      }

      return {
        success: true,
        employee_id: data.employee_id,
        message: 'Employee updated successfully'
      }
    } catch (error: any) {
      console.error('Error updating employee:', error)
      return {
        success: false,
        error: error.message || 'Failed to update employee'
      }
    }
  }

  /**
   * Delete employee (soft delete by deactivating)
   */
  async deleteEmployee(employeeId: string, reason?: string): Promise<DeactivateEmployeeResponse> {
    return this.deactivateEmployee(employeeId, reason)
  }

  /**
   * Reactivate employee
   */
  async reactivateEmployee(employeeId: string): Promise<UpdateEmployeeResponse> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        } as any)
        .eq('employee_id', employeeId)

      if (error) {
        console.error('Employee reactivation error:', error)
        throw error
      }

      return {
        success: true,
        employee_id: employeeId,
        message: 'Employee reactivated successfully'
      }
    } catch (error: any) {
      console.error('Error reactivating employee:', error)
      return {
        success: false,
        error: error.message || 'Failed to reactivate employee'
      }
    }
  }
}

export const employeeService = new EmployeeService()
export default employeeService
