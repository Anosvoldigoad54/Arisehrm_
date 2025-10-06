// ========================================
// TRAINING MANAGEMENT SERVICE
// ========================================
// API service layer for training and development CRUD operations

import { supabase } from '../lib/supabase'

export interface TrainingProgram {
  id: string
  title: string
  description: string
  category: 'technical' | 'soft_skills' | 'compliance' | 'leadership' | 'safety' | 'onboarding'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration_hours: number
  format: 'online' | 'in_person' | 'hybrid' | 'self_paced'
  instructor_id: string | null
  max_participants: number | null
  prerequisites: string | null
  learning_objectives: string[]
  materials: string[]
  certification_provided: boolean
  certification_valid_months: number | null
  status: 'draft' | 'active' | 'inactive' | 'archived'
  created_by: string
  created_at: string
  updated_at: string
}

export interface TrainingEnrollment {
  id: string
  employee_id: string
  program_id: string
  enrollment_date: string
  start_date: string | null
  completion_date: string | null
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'failed'
  progress_percentage: number
  score: number | null
  feedback: string | null
  certificate_issued: boolean
  certificate_url: string | null
  assigned_by: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TrainingSession {
  id: string
  program_id: string
  title: string
  description: string | null
  session_date: string
  start_time: string
  end_time: string
  location: string | null
  meeting_url: string | null
  instructor_id: string | null
  max_participants: number | null
  current_participants: number
  materials: string[]
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface CreateTrainingProgramRequest {
  title: string
  description: string
  category: 'technical' | 'soft_skills' | 'compliance' | 'leadership' | 'safety' | 'onboarding'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration_hours: number
  format: 'online' | 'in_person' | 'hybrid' | 'self_paced'
  instructor_id?: string
  max_participants?: number
  prerequisites?: string
  learning_objectives: string[]
  materials?: string[]
  certification_provided?: boolean
  certification_valid_months?: number
}

export interface CreateEnrollmentRequest {
  employee_id: string
  program_id: string
  start_date?: string
  assigned_by?: string
  due_date?: string
}

export interface CreateSessionRequest {
  program_id: string
  title: string
  description?: string
  session_date: string
  start_time: string
  end_time: string
  location?: string
  meeting_url?: string
  instructor_id?: string
  max_participants?: number
  materials?: string[]
}

class TrainingService {
  /**
   * Create a new training program
   */
  async createTrainingProgram(data: CreateTrainingProgramRequest): Promise<{ success: boolean; program?: TrainingProgram; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const currentTime = new Date().toISOString()
      const programData = {
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        duration_hours: data.duration_hours,
        format: data.format,
        instructor_id: data.instructor_id,
        max_participants: data.max_participants,
        prerequisites: data.prerequisites,
        learning_objectives: data.learning_objectives,
        materials: data.materials || [],
        certification_provided: data.certification_provided || false,
        certification_valid_months: data.certification_valid_months,
        status: 'draft' as const,
        created_at: currentTime,
        updated_at: currentTime
      }

      const { data: created, error } = await supabase
        .from('training_programs')
        .insert(programData as any)
        .select()
        .single()

      if (error) throw error

      return { success: true, program: created }
    } catch (error: any) {
      console.error('Create training program error:', error)
      return { success: false, error: error.message || 'Failed to create training program' }
    }
  }

  /**
   * Get training programs with filtering
   */
  async getTrainingPrograms(filters?: {
    category?: string
    level?: string
    format?: string
    status?: string
    instructor_id?: string
  }): Promise<TrainingProgram[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('training_programs')
        .select(`
          *,
          instructor:user_profiles!instructor_id(first_name, last_name),
          creator:user_profiles!created_by(first_name, last_name)
        `)

      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.level) query = query.eq('level', filters.level)
      if (filters?.format) query = query.eq('format', filters.format)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.instructor_id) query = query.eq('instructor_id', filters.instructor_id)

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch training programs:', error)
      return []
    }
  }

  /**
   * Update training program
   */
  async updateTrainingProgram(id: string, updates: Partial<CreateTrainingProgramRequest & { status: string }>): Promise<{ success: boolean; program?: TrainingProgram; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const updateData: any = { 
        ...updates,
        updated_at: new Date().toISOString() 
      }

      const { data: updated, error } = await supabase
        .from('training_programs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, program: updated }
    } catch (error: any) {
      console.error('Update training program error:', error)
      return { success: false, error: error.message || 'Failed to update training program' }
    }
  }

  /**
   * Enroll employee in training program
   */
  async enrollEmployee(data: CreateEnrollmentRequest): Promise<{ success: boolean; enrollment?: TrainingEnrollment; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('training_enrollments')
        .select('id')
        .eq('employee_id', data.employee_id)
        .eq('program_id', data.program_id)
        .in('status', ['enrolled', 'in_progress'])
        .single()

      if (existing) {
        return { success: false, error: 'Employee is already enrolled in this program' }
      }

      const currentTime = new Date().toISOString()
      const enrollmentData = {
        employee_id: data.employee_id,
        program_id: data.program_id,
        enrollment_date: currentTime,
        start_date: data.start_date,
        status: 'enrolled' as const,
        progress_percentage: 0,
        certificate_issued: false,
        assigned_by: data.assigned_by,
        due_date: data.due_date,
        created_at: currentTime,
        updated_at: currentTime
      }

      const { data: created, error } = await supabase
        .from('training_enrollments')
        .insert(enrollmentData as any)
        .select()
        .single()

      if (error) throw error

      return { success: true, enrollment: created }
    } catch (error: any) {
      console.error('Enroll employee error:', error)
      return { success: false, error: error.message || 'Failed to enroll employee' }
    }
  }

  /**
   * Get training enrollments
   */
  async getTrainingEnrollments(filters?: {
    employee_id?: string
    program_id?: string
    status?: string
    assigned_by?: string
  }): Promise<TrainingEnrollment[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('training_enrollments')
        .select(`
          *,
          employee:user_profiles!employee_id(first_name, last_name),
          program:training_programs!program_id(title, category, duration_hours),
          assigner:user_profiles!assigned_by(first_name, last_name)
        `)

      if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id)
      if (filters?.program_id) query = query.eq('program_id', filters.program_id)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.assigned_by) query = query.eq('assigned_by', filters.assigned_by)

      query = query.order('enrollment_date', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch training enrollments:', error)
      return []
    }
  }

  /**
   * Update training enrollment progress
   */
  async updateEnrollmentProgress(id: string, updates: {
    status?: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'failed'
    progress_percentage?: number
    score?: number
    feedback?: string
    completion_date?: string
  }): Promise<{ success: boolean; enrollment?: TrainingEnrollment; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const updateData: any = { 
        ...updates,
        updated_at: new Date().toISOString() 
      }

      // Auto-set completion date when status changes to completed
      if (updates.status === 'completed' && !updates.completion_date) {
        updateData.completion_date = new Date().toISOString().split('T')[0]
        updateData.progress_percentage = 100
      }

      const { data: updated, error } = await supabase
        .from('training_enrollments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, enrollment: updated }
    } catch (error: any) {
      console.error('Update enrollment progress error:', error)
      return { success: false, error: error.message || 'Failed to update enrollment progress' }
    }
  }

  /**
   * Create training session
   */
  async createTrainingSession(data: CreateSessionRequest): Promise<{ success: boolean; session?: TrainingSession; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const currentTime = new Date().toISOString()
      const sessionData = {
        program_id: data.program_id,
        title: data.title,
        description: data.description,
        session_date: data.session_date,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location,
        meeting_url: data.meeting_url,
        instructor_id: data.instructor_id,
        max_participants: data.max_participants,
        current_participants: 0,
        materials: data.materials || [],
        status: 'scheduled' as const,
        created_at: currentTime,
        updated_at: currentTime
      }

      const { data: created, error } = await supabase
        .from('training_sessions')
        .insert(sessionData as any)
        .select()
        .single()

      if (error) throw error

      return { success: true, session: created }
    } catch (error: any) {
      console.error('Create training session error:', error)
      return { success: false, error: error.message || 'Failed to create training session' }
    }
  }

  /**
   * Get training sessions
   */
  async getTrainingSessions(filters?: {
    program_id?: string
    instructor_id?: string
    status?: string
    date_from?: string
    date_to?: string
  }): Promise<TrainingSession[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('training_sessions')
        .select(`
          *,
          program:training_programs!program_id(title, category),
          instructor:user_profiles!instructor_id(first_name, last_name)
        `)

      if (filters?.program_id) query = query.eq('program_id', filters.program_id)
      if (filters?.instructor_id) query = query.eq('instructor_id', filters.instructor_id)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.date_from) query = query.gte('session_date', filters.date_from)
      if (filters?.date_to) query = query.lte('session_date', filters.date_to)

      query = query.order('session_date', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch training sessions:', error)
      return []
    }
  }

  /**
   * Get training statistics for an employee
   */
  async getTrainingStats(employeeId: string, year?: number): Promise<{
    total_enrollments: number
    completed_programs: number
    in_progress_programs: number
    completion_rate: number
    total_hours_completed: number
    certificates_earned: number
    average_score: number
  }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const currentYear = year || new Date().getFullYear()
      const yearStart = `${currentYear}-01-01`
      const yearEnd = `${currentYear}-12-31`

      const { data: enrollments } = await supabase
        .from('training_enrollments')
        .select(`
          status,
          score,
          certificate_issued,
          program:training_programs!program_id(duration_hours)
        `)
        .eq('employee_id', employeeId)
        .gte('enrollment_date', yearStart)
        .lte('enrollment_date', yearEnd)

      const enrollmentData = enrollments || []

      const totalEnrollments = enrollmentData.length
      const completedPrograms = enrollmentData.filter(e => e.status === 'completed').length
      const inProgressPrograms = enrollmentData.filter(e => e.status === 'in_progress').length
      const completionRate = totalEnrollments > 0 ? (completedPrograms / totalEnrollments) * 100 : 0

      const totalHoursCompleted = enrollmentData
        .filter(e => e.status === 'completed')
        .reduce((sum, e) => sum + ((e.program as any)?.duration_hours || 0), 0)

      const certificatesEarned = enrollmentData.filter(e => e.certificate_issued).length

      const scores = enrollmentData.filter(e => e.score !== null).map(e => e.score as number)
      const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0

      return {
        total_enrollments: totalEnrollments,
        completed_programs: completedPrograms,
        in_progress_programs: inProgressPrograms,
        completion_rate: Math.round(completionRate * 100) / 100,
        total_hours_completed: totalHoursCompleted,
        certificates_earned: certificatesEarned,
        average_score: Math.round(averageScore * 100) / 100
      }
    } catch (error: any) {
      console.error('Failed to fetch training stats:', error)
      return {
        total_enrollments: 0,
        completed_programs: 0,
        in_progress_programs: 0,
        completion_rate: 0,
        total_hours_completed: 0,
        certificates_earned: 0,
        average_score: 0
      }
    }
  }

  /**
   * Issue certificate for completed training
   */
  async issueCertificate(enrollmentId: string, certificateUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('training_enrollments')
        .update({
          certificate_issued: true,
          certificate_url: certificateUrl,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', enrollmentId)
        .eq('status', 'completed')

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Issue certificate error:', error)
      return { success: false, error: error.message || 'Failed to issue certificate' }
    }
  }
}

export const trainingService = new TrainingService()
export default trainingService
