// ========================================
// PAYROLL MANAGEMENT SERVICE
// ========================================
// API service layer for payroll CRUD operations

import { supabase } from '../lib/supabase'

export interface PayrollRecord {
  id: string
  employee_id: string
  pay_period_start: string
  pay_period_end: string
  pay_date: string
  gross_salary: number
  basic_salary: number
  allowances: number
  overtime_pay: number
  bonus: number
  deductions: number
  tax_deduction: number
  insurance_deduction: number
  provident_fund: number
  other_deductions: number
  net_salary: number
  status: 'draft' | 'pending_approval' | 'approved' | 'paid' | 'cancelled'
  approved_by: string | null
  approved_at: string | null
  processed_by: string | null
  processed_at: string | null
  payment_method: 'bank_transfer' | 'check' | 'cash' | 'digital_wallet'
  bank_reference: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SalaryStructure {
  id: string
  employee_id: string
  basic_salary: number
  hra: number
  transport_allowance: number
  medical_allowance: number
  special_allowance: number
  other_allowances: number
  provident_fund_percentage: number
  insurance_premium: number
  tax_exemption_limit: number
  effective_from: string
  effective_to: string | null
  status: 'active' | 'inactive' | 'draft'
  created_by: string
  created_at: string
  updated_at: string
}

export interface PayrollSummary {
  total_employees: number
  total_gross_salary: number
  total_deductions: number
  total_net_salary: number
  pending_approvals: number
  processed_payments: number
}

export interface CreatePayrollRequest {
  employee_id: string
  pay_period_start: string
  pay_period_end: string
  pay_date: string
  overtime_hours?: number
  bonus?: number
  other_deductions?: number
  notes?: string
}

export interface CreateSalaryStructureRequest {
  employee_id: string
  basic_salary: number
  hra?: number
  transport_allowance?: number
  medical_allowance?: number
  special_allowance?: number
  other_allowances?: number
  provident_fund_percentage?: number
  insurance_premium?: number
  tax_exemption_limit?: number
  effective_from: string
  effective_to?: string
}

class PayrollService {
  /**
   * Create payroll record for an employee
   */
  async createPayrollRecord(data: CreatePayrollRequest): Promise<{ success: boolean; record?: PayrollRecord; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Get employee's salary structure
      const { data: salaryStructure } = await supabase
        .from('salary_structures')
        .select('*')
        .eq('employee_id', data.employee_id)
        .eq('status', 'active')
        .single()

      if (!salaryStructure) {
        return { success: false, error: 'No active salary structure found for employee' }
      }

      // Calculate payroll components
      const basicSalary = (salaryStructure as any).basic_salary
      const allowances = ((salaryStructure as any).hra || 0) + 
                        ((salaryStructure as any).transport_allowance || 0) + 
                        ((salaryStructure as any).medical_allowance || 0) + 
                        ((salaryStructure as any).special_allowance || 0) + 
                        ((salaryStructure as any).other_allowances || 0)

      // Calculate overtime pay (assuming hourly rate = basic_salary / (30 * 8))
      const hourlyRate = basicSalary / (30 * 8)
      const overtimePay = (data.overtime_hours || 0) * hourlyRate * 1.5

      const grossSalary = basicSalary + allowances + overtimePay + (data.bonus || 0)

      // Calculate deductions
      const providentFund = (grossSalary * ((salaryStructure as any).provident_fund_percentage || 12)) / 100
      const insuranceDeduction = (salaryStructure as any).insurance_premium || 0
      const taxDeduction = this.calculateTax(grossSalary, (salaryStructure as any).tax_exemption_limit || 0)
      const otherDeductions = data.other_deductions || 0
      const totalDeductions = providentFund + insuranceDeduction + taxDeduction + otherDeductions

      const netSalary = grossSalary - totalDeductions

      const currentTime = new Date().toISOString()
      const payrollData = {
        employee_id: data.employee_id,
        pay_period_start: data.pay_period_start,
        pay_period_end: data.pay_period_end,
        pay_date: data.pay_date,
        gross_salary: Math.round(grossSalary * 100) / 100,
        basic_salary: basicSalary,
        allowances: allowances,
        overtime_pay: Math.round(overtimePay * 100) / 100,
        bonus: data.bonus || 0,
        deductions: Math.round(totalDeductions * 100) / 100,
        tax_deduction: Math.round(taxDeduction * 100) / 100,
        insurance_deduction: insuranceDeduction,
        provident_fund: Math.round(providentFund * 100) / 100,
        other_deductions: otherDeductions,
        net_salary: Math.round(netSalary * 100) / 100,
        status: 'draft' as const,
        payment_method: 'bank_transfer' as const,
        notes: data.notes,
        created_at: currentTime,
        updated_at: currentTime
      }

      const { data: created, error } = await supabase
        .from('payroll_records')
        .insert(payrollData as any)
        .select()
        .single()

      if (error) throw error

      return { success: true, record: created }
    } catch (error: any) {
      console.error('Create payroll record error:', error)
      return { success: false, error: error.message || 'Failed to create payroll record' }
    }
  }

  /**
   * Get payroll records with filtering
   */
  async getPayrollRecords(filters?: {
    employee_id?: string
    status?: string
    pay_period_start?: string
    pay_period_end?: string
    year?: number
    month?: number
  }): Promise<PayrollRecord[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('payroll_records')
        .select(`
          *,
          employee:user_profiles!employee_id(first_name, last_name, employee_id),
          approver:user_profiles!approved_by(first_name, last_name),
          processor:user_profiles!processed_by(first_name, last_name)
        `)

      if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.pay_period_start) query = query.gte('pay_period_start', filters.pay_period_start)
      if (filters?.pay_period_end) query = query.lte('pay_period_end', filters.pay_period_end)
      
      if (filters?.year && filters?.month) {
        const monthStr = filters.month.toString().padStart(2, '0')
        const yearMonth = `${filters.year}-${monthStr}`
        query = query.like('pay_period_start', `${yearMonth}%`)
      } else if (filters?.year) {
        query = query.like('pay_period_start', `${filters.year}%`)
      }

      query = query.order('pay_period_start', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch payroll records:', error)
      return []
    }
  }

  /**
   * Update payroll record
   */
  async updatePayrollRecord(id: string, updates: {
    overtime_pay?: number
    bonus?: number
    other_deductions?: number
    status?: 'draft' | 'pending_approval' | 'approved' | 'paid' | 'cancelled'
    payment_method?: 'bank_transfer' | 'check' | 'cash' | 'digital_wallet'
    bank_reference?: string
    notes?: string
  }): Promise<{ success: boolean; record?: PayrollRecord; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const updateData: any = { 
        ...updates,
        updated_at: new Date().toISOString() 
      }

      // Recalculate totals if financial components change
      if (updates.overtime_pay !== undefined || updates.bonus !== undefined || updates.other_deductions !== undefined) {
        const { data: current } = await supabase
          .from('payroll_records')
          .select('*')
          .eq('id', id)
          .single()

        if (current) {
          const currentRecord = current as any
          const newOvertimePay = updates.overtime_pay ?? currentRecord.overtime_pay
          const newBonus = updates.bonus ?? currentRecord.bonus
          const newOtherDeductions = updates.other_deductions ?? currentRecord.other_deductions

          const newGrossSalary = currentRecord.basic_salary + currentRecord.allowances + newOvertimePay + newBonus
          const newTotalDeductions = currentRecord.tax_deduction + currentRecord.insurance_deduction + 
                                   currentRecord.provident_fund + newOtherDeductions
          const newNetSalary = newGrossSalary - newTotalDeductions

          updateData.gross_salary = Math.round(newGrossSalary * 100) / 100
          updateData.deductions = Math.round(newTotalDeductions * 100) / 100
          updateData.net_salary = Math.round(newNetSalary * 100) / 100
        }
      }

      const { data: updated, error } = await supabase
        .from('payroll_records')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, record: updated }
    } catch (error: any) {
      console.error('Update payroll record error:', error)
      return { success: false, error: error.message || 'Failed to update payroll record' }
    }
  }

  /**
   * Approve payroll record
   */
  async approvePayrollRecord(id: string, approvedBy: string): Promise<{ success: boolean; record?: PayrollRecord; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const currentTime = new Date().toISOString()
      const { data: updated, error } = await supabase
        .from('payroll_records')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: currentTime,
          updated_at: currentTime
        } as any)
        .eq('id', id)
        .eq('status', 'pending_approval')
        .select()
        .single()

      if (error) throw error

      return { success: true, record: updated }
    } catch (error: any) {
      console.error('Approve payroll record error:', error)
      return { success: false, error: error.message || 'Failed to approve payroll record' }
    }
  }

  /**
   * Process payment for payroll record
   */
  async processPayment(id: string, processedBy: string, bankReference?: string): Promise<{ success: boolean; record?: PayrollRecord; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const currentTime = new Date().toISOString()
      const { data: updated, error } = await supabase
        .from('payroll_records')
        .update({
          status: 'paid',
          processed_by: processedBy,
          processed_at: currentTime,
          bank_reference: bankReference,
          updated_at: currentTime
        } as any)
        .eq('id', id)
        .eq('status', 'approved')
        .select()
        .single()

      if (error) throw error

      return { success: true, record: updated }
    } catch (error: any) {
      console.error('Process payment error:', error)
      return { success: false, error: error.message || 'Failed to process payment' }
    }
  }

  /**
   * Create salary structure for employee
   */
  async createSalaryStructure(data: CreateSalaryStructureRequest): Promise<{ success: boolean; structure?: SalaryStructure; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Deactivate existing active salary structures
      await supabase
        .from('salary_structures')
        .update({ 
          status: 'inactive',
          effective_to: data.effective_from,
          updated_at: new Date().toISOString() 
        } as any)
        .eq('employee_id', data.employee_id)
        .eq('status', 'active')

      const currentTime = new Date().toISOString()
      const structureData = {
        employee_id: data.employee_id,
        basic_salary: data.basic_salary,
        hra: data.hra || 0,
        transport_allowance: data.transport_allowance || 0,
        medical_allowance: data.medical_allowance || 0,
        special_allowance: data.special_allowance || 0,
        other_allowances: data.other_allowances || 0,
        provident_fund_percentage: data.provident_fund_percentage || 12,
        insurance_premium: data.insurance_premium || 0,
        tax_exemption_limit: data.tax_exemption_limit || 250000,
        effective_from: data.effective_from,
        effective_to: data.effective_to,
        status: 'active' as const,
        created_at: currentTime,
        updated_at: currentTime
      }

      const { data: created, error } = await supabase
        .from('salary_structures')
        .insert(structureData as any)
        .select()
        .single()

      if (error) throw error

      return { success: true, structure: created }
    } catch (error: any) {
      console.error('Create salary structure error:', error)
      return { success: false, error: error.message || 'Failed to create salary structure' }
    }
  }

  /**
   * Get salary structures
   */
  async getSalaryStructures(filters?: {
    employee_id?: string
    status?: string
  }): Promise<SalaryStructure[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('salary_structures')
        .select(`
          *,
          employee:user_profiles!employee_id(first_name, last_name, employee_id),
          creator:user_profiles!created_by(first_name, last_name)
        `)

      if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id)
      if (filters?.status) query = query.eq('status', filters.status)

      query = query.order('effective_from', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch salary structures:', error)
      return []
    }
  }

  /**
   * Get payroll summary for a period
   */
  async getPayrollSummary(startDate: string, endDate: string): Promise<PayrollSummary> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('payroll_records')
        .select('status, gross_salary, deductions, net_salary')
        .gte('pay_period_start', startDate)
        .lte('pay_period_end', endDate)

      if (error) throw error

      const records = data || []
      const totalEmployees = records.length
      const totalGrossSalary = records.reduce((sum, r) => sum + ((r as any).gross_salary || 0), 0)
      const totalDeductions = records.reduce((sum, r) => sum + ((r as any).deductions || 0), 0)
      const totalNetSalary = records.reduce((sum, r) => sum + ((r as any).net_salary || 0), 0)
      const pendingApprovals = records.filter(r => (r as any).status === 'pending_approval').length
      const processedPayments = records.filter(r => (r as any).status === 'paid').length

      return {
        total_employees: totalEmployees,
        total_gross_salary: Math.round(totalGrossSalary * 100) / 100,
        total_deductions: Math.round(totalDeductions * 100) / 100,
        total_net_salary: Math.round(totalNetSalary * 100) / 100,
        pending_approvals: pendingApprovals,
        processed_payments: processedPayments
      }
    } catch (error: any) {
      console.error('Failed to fetch payroll summary:', error)
      return {
        total_employees: 0,
        total_gross_salary: 0,
        total_deductions: 0,
        total_net_salary: 0,
        pending_approvals: 0,
        processed_payments: 0
      }
    }
  }

  /**
   * Generate bulk payroll for multiple employees
   */
  async generateBulkPayroll(data: {
    employee_ids: string[]
    pay_period_start: string
    pay_period_end: string
    pay_date: string
  }): Promise<{ success: boolean; created: number; errors: string[] }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let created = 0
      const errors: string[] = []

      for (const employeeId of data.employee_ids) {
        const result = await this.createPayrollRecord({
          employee_id: employeeId,
          pay_period_start: data.pay_period_start,
          pay_period_end: data.pay_period_end,
          pay_date: data.pay_date
        })

        if (result.success) {
          created++
        } else {
          errors.push(`Employee ${employeeId}: ${result.error}`)
        }
      }

      return { success: true, created, errors }
    } catch (error: any) {
      console.error('Generate bulk payroll error:', error)
      return { success: false, created: 0, errors: [error.message || 'Failed to generate bulk payroll'] }
    }
  }

  /**
   * Calculate income tax (simplified calculation)
   */
  private calculateTax(grossSalary: number, exemptionLimit: number): number {
    const annualSalary = grossSalary * 12
    const taxableIncome = Math.max(0, annualSalary - exemptionLimit)
    
    let tax = 0
    
    // Simplified tax slabs (India-like structure)
    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.3
      taxableIncome = 1000000
    }
    if (taxableIncome > 500000) {
      tax += (taxableIncome - 500000) * 0.2
      taxableIncome = 500000
    }
    if (taxableIncome > 250000) {
      tax += (taxableIncome - 250000) * 0.05
    }
    
    // Return monthly tax
    return tax / 12
  }
}

export const payrollService = new PayrollService()
export default payrollService
