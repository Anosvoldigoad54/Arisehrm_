// ========================================
// PERFORMANCE MANAGEMENT SERVICE
// ========================================
// API service layer for performance CRUD operations

import { supabase } from '../lib/supabase'

export interface PerformanceReview {
  id: string
  employee_id: string
  reviewer_id: string
  review_period_start: string
  review_period_end: string
  review_type: 'annual' | 'quarterly' | 'monthly' | 'probation' | 'project'
  status: 'draft' | 'in_progress' | 'completed' | 'approved'
  overall_rating: number | null
  goals_rating: number | null
  competencies_rating: number | null
  achievements: string | null
  areas_for_improvement: string | null
  development_goals: string | null
  reviewer_comments: string | null
  employee_comments: string | null
  next_review_date: string | null
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  employee_id: string
  title: string
  description: string
  category: 'performance' | 'development' | 'project' | 'skill' | 'career'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  target_date: string
  completion_date: string | null
  progress_percentage: number
  success_criteria: string | null
  assigned_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreatePerformanceReviewRequest {
  employee_id: string
  reviewer_id: string
  review_period_start: string
  review_period_end: string
  review_type: 'annual' | 'quarterly' | 'monthly' | 'probation' | 'project'
  next_review_date?: string
}

export interface UpdatePerformanceReviewRequest {
  id: string
  overall_rating?: number
  goals_rating?: number
  competencies_rating?: number
  achievements?: string
  areas_for_improvement?: string
  development_goals?: string
  reviewer_comments?: string
  employee_comments?: string
  status?: 'draft' | 'in_progress' | 'completed' | 'approved'
  next_review_date?: string
}

export interface CreateGoalRequest {
  employee_id: string
  title: string
  description: string
  category: 'performance' | 'development' | 'project' | 'skill' | 'career'
  priority: 'low' | 'medium' | 'high' | 'critical'
  target_date: string
  success_criteria?: string
  assigned_by?: string
  notes?: string
}

export interface UpdateGoalRequest {
  id: string
  title?: string
  description?: string
  category?: 'performance' | 'development' | 'project' | 'skill' | 'career'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  target_date?: string
  completion_date?: string
  progress_percentage?: number
  success_criteria?: string
  notes?: string
}

class PerformanceService {
  /**
   * Create a new performance review
   */
  async createPerformanceReview(data: CreatePerformanceReviewRequest): Promise<{ success: boolean; review?: PerformanceReview; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const currentTime = new Date().toISOString()
      const reviewData = {
        employee_id: data.employee_id,
        reviewer_id: data.reviewer_id,
        review_period_start: data.review_period_start,
        review_period_end: data.review_period_end,
        review_type: data.review_type,
        status: 'draft' as const,
        next_review_date: data.next_review_date,
        created_at: currentTime,
        updated_at: currentTime
      }

      const { data: created, error } = await supabase
        .from('performance_reviews')
        .insert(reviewData as any)
        .select()
        .single()

      if (error) throw error

      return { success: true, review: created }
    } catch (error: any) {
      console.error('Create performance review error:', error)
      return { success: false, error: error.message || 'Failed to create performance review' }
    }
  }

  /**
   * Get performance reviews with filtering
   */
  async getPerformanceReviews(filters?: {
    employee_id?: string
    reviewer_id?: string
    review_type?: string
    status?: string
    year?: number
  }): Promise<PerformanceReview[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('performance_reviews')
        .select(`
          *,
          employee:user_profiles!employee_id(first_name, last_name),
          reviewer:user_profiles!reviewer_id(first_name, last_name)
        `)

      if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id)
      if (filters?.reviewer_id) query = query.eq('reviewer_id', filters.reviewer_id)
      if (filters?.review_type) query = query.eq('review_type', filters.review_type)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.year) {
        const yearStart = `${filters.year}-01-01`
        const yearEnd = `${filters.year}-12-31`
        query = query.gte('review_period_start', yearStart).lte('review_period_end', yearEnd)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch performance reviews:', error)
      return []
    }
  }

  /**
   * Update performance review
   */
  async updatePerformanceReview(data: UpdatePerformanceReviewRequest): Promise<{ success: boolean; review?: PerformanceReview; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const updateData: any = { updated_at: new Date().toISOString() }

      if (data.overall_rating !== undefined) updateData.overall_rating = data.overall_rating
      if (data.goals_rating !== undefined) updateData.goals_rating = data.goals_rating
      if (data.competencies_rating !== undefined) updateData.competencies_rating = data.competencies_rating
      if (data.achievements !== undefined) updateData.achievements = data.achievements
      if (data.areas_for_improvement !== undefined) updateData.areas_for_improvement = data.areas_for_improvement
      if (data.development_goals !== undefined) updateData.development_goals = data.development_goals
      if (data.reviewer_comments !== undefined) updateData.reviewer_comments = data.reviewer_comments
      if (data.employee_comments !== undefined) updateData.employee_comments = data.employee_comments
      if (data.status !== undefined) updateData.status = data.status
      if (data.next_review_date !== undefined) updateData.next_review_date = data.next_review_date

      const { data: updated, error } = await supabase
        .from('performance_reviews')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, review: updated }
    } catch (error: any) {
      console.error('Update performance review error:', error)
      return { success: false, error: error.message || 'Failed to update performance review' }
    }
  }

  /**
   * Create a new goal
   */
  async createGoal(data: CreateGoalRequest): Promise<{ success: boolean; goal?: Goal; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const currentTime = new Date().toISOString()
      const goalData = {
        employee_id: data.employee_id,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: 'not_started' as const,
        target_date: data.target_date,
        progress_percentage: 0,
        success_criteria: data.success_criteria,
        assigned_by: data.assigned_by,
        notes: data.notes,
        created_at: currentTime,
        updated_at: currentTime
      }

      const { data: created, error } = await supabase
        .from('goals')
        .insert(goalData as any)
        .select()
        .single()

      if (error) throw error

      return { success: true, goal: created }
    } catch (error: any) {
      console.error('Create goal error:', error)
      return { success: false, error: error.message || 'Failed to create goal' }
    }
  }

  /**
   * Get goals with filtering
   */
  async getGoals(filters?: {
    employee_id?: string
    assigned_by?: string
    category?: string
    status?: string
    priority?: string
  }): Promise<Goal[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('goals')
        .select(`
          *,
          employee:user_profiles!employee_id(first_name, last_name),
          assigner:user_profiles!assigned_by(first_name, last_name)
        `)

      if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id)
      if (filters?.assigned_by) query = query.eq('assigned_by', filters.assigned_by)
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.priority) query = query.eq('priority', filters.priority)

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch goals:', error)
      return []
    }
  }

  /**
   * Update goal
   */
  async updateGoal(data: UpdateGoalRequest): Promise<{ success: boolean; goal?: Goal; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const updateData: any = { updated_at: new Date().toISOString() }

      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.category !== undefined) updateData.category = data.category
      if (data.priority !== undefined) updateData.priority = data.priority
      if (data.status !== undefined) updateData.status = data.status
      if (data.target_date !== undefined) updateData.target_date = data.target_date
      if (data.completion_date !== undefined) updateData.completion_date = data.completion_date
      if (data.progress_percentage !== undefined) updateData.progress_percentage = data.progress_percentage
      if (data.success_criteria !== undefined) updateData.success_criteria = data.success_criteria
      if (data.notes !== undefined) updateData.notes = data.notes

      // Auto-set completion date when status changes to completed
      if (data.status === 'completed' && !data.completion_date) {
        updateData.completion_date = new Date().toISOString().split('T')[0]
        updateData.progress_percentage = 100
      }

      const { data: updated, error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, goal: updated }
    } catch (error: any) {
      console.error('Update goal error:', error)
      return { success: false, error: error.message || 'Failed to update goal' }
    }
  }

  /**
   * Delete goal
   */
  async deleteGoal(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Delete goal error:', error)
      return { success: false, error: error.message || 'Failed to delete goal' }
    }
  }

  /**
   * Get performance statistics for an employee
   */
  async getPerformanceStats(employeeId: string, year?: number): Promise<{
    total_reviews: number
    completed_reviews: number
    average_rating: number
    total_goals: number
    completed_goals: number
    goal_completion_rate: number
  }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const currentYear = year || new Date().getFullYear()
      const yearStart = `${currentYear}-01-01`
      const yearEnd = `${currentYear}-12-31`

      // Get reviews
      const { data: reviews } = await supabase
        .from('performance_reviews')
        .select('status, overall_rating')
        .eq('employee_id', employeeId)
        .gte('review_period_start', yearStart)
        .lte('review_period_end', yearEnd)

      // Get goals
      const { data: goals } = await supabase
        .from('goals')
        .select('status')
        .eq('employee_id', employeeId)
        .gte('created_at', yearStart)
        .lte('created_at', yearEnd)

      const reviewData = reviews || []
      const goalData = goals || []

      const totalReviews = reviewData.length
      const completedReviews = reviewData.filter(r => r.status === 'completed' || r.status === 'approved').length
      const ratingsSum = reviewData.reduce((sum, r) => sum + (r.overall_rating || 0), 0)
      const averageRating = totalReviews > 0 ? ratingsSum / totalReviews : 0

      const totalGoals = goalData.length
      const completedGoals = goalData.filter(g => g.status === 'completed').length
      const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

      return {
        total_reviews: totalReviews,
        completed_reviews: completedReviews,
        average_rating: Math.round(averageRating * 100) / 100,
        total_goals: totalGoals,
        completed_goals: completedGoals,
        goal_completion_rate: Math.round(goalCompletionRate * 100) / 100
      }
    } catch (error: any) {
      console.error('Failed to fetch performance stats:', error)
      return {
        total_reviews: 0,
        completed_reviews: 0,
        average_rating: 0,
        total_goals: 0,
        completed_goals: 0,
        goal_completion_rate: 0
      }
    }
  }
}

export const performanceService = new PerformanceService()
export default performanceService
