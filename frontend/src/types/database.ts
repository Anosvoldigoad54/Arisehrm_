export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          code: string
          legal_name: string | null
          tax_id: string | null
          registration_number: string | null
          industry: string | null
          company_size: string | null
          headquarters_address: string | null
          city: string | null
          country: string | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          timezone: string
          currency: string
          fiscal_year_start: number
          working_days_per_week: number
          working_hours_per_day: number
          is_active: boolean
          is_verified: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          legal_name?: string | null
          tax_id?: string | null
          registration_number?: string | null
          industry?: string | null
          company_size?: string | null
          headquarters_address?: string | null
          city?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          timezone?: string
          currency?: string
          fiscal_year_start?: number
          working_days_per_week?: number
          working_hours_per_day?: number
          is_active?: boolean
          is_verified?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          legal_name?: string | null
          tax_id?: string | null
          registration_number?: string | null
          industry?: string | null
          company_size?: string | null
          headquarters_address?: string | null
          city?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          timezone?: string
          currency?: string
          fiscal_year_start?: number
          working_days_per_week?: number
          working_hours_per_day?: number
          is_active?: boolean
          is_verified?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          parent_department_id: string | null
          manager_employee_id: string | null
          budget: number | null
          budget_currency: string
          cost_center_code: string | null
          location: string | null
          timezone: string
          working_hours: Json
          department_type: string
          is_billable: boolean
          is_revenue_generating: boolean
          headcount_target: number | null
          current_headcount: number
          turnover_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by_id: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          parent_department_id?: string | null
          manager_employee_id?: string | null
          budget?: number | null
          budget_currency?: string
          cost_center_code?: string | null
          location?: string | null
          timezone?: string
          working_hours?: Json
          department_type?: string
          is_billable?: boolean
          is_revenue_generating?: boolean
          headcount_target?: number | null
          current_headcount?: number
          turnover_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by_id?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          name?: string
          code?: string
          description?: string | null
          parent_department_id?: string | null
          manager_employee_id?: string | null
          budget?: number | null
          budget_currency?: string
          cost_center_code?: string | null
          location?: string | null
          timezone?: string
          working_hours?: Json
          department_type?: string
          is_billable?: boolean
          is_revenue_generating?: boolean
          headcount_target?: number | null
          current_headcount?: number
          turnover_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by_id?: string | null
          metadata?: Json
        }
      }
      positions: {
        Row: {
          id: string
          title: string
          code: string | null
          description: string | null
          department_id: string | null
          reports_to_position_id: string | null
          level: string | null
          job_family: string | null
          career_track: string | null
          min_salary: number | null
          max_salary: number | null
          target_salary: number | null
          currency: string
          salary_review_frequency: number
          responsibilities: string[] | null
          requirements: string[] | null
          preferred_qualifications: string[] | null
          required_skills: Json
          preferred_skills: Json
          competency_matrix: Json
          performance_indicators: Json
          success_metrics: Json
          location_type: string
          travel_requirement_percent: number
          remote_work_eligible: boolean
          is_leadership_role: boolean
          direct_reports_max: number
          headcount_approved: number
          current_headcount: number
          promotion_eligible_to: Json
          typical_tenure_months: number
          is_active: boolean
          effective_from: string
          effective_to: string | null
          created_at: string
          updated_at: string
          created_by_id: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          title: string
          code?: string | null
          description?: string | null
          department_id?: string | null
          reports_to_position_id?: string | null
          level?: string | null
          job_family?: string | null
          career_track?: string | null
          min_salary?: number | null
          max_salary?: number | null
          target_salary?: number | null
          currency?: string
          salary_review_frequency?: number
          responsibilities?: string[] | null
          requirements?: string[] | null
          preferred_qualifications?: string[] | null
          required_skills?: Json
          preferred_skills?: Json
          competency_matrix?: Json
          performance_indicators?: Json
          success_metrics?: Json
          location_type?: string
          travel_requirement_percent?: number
          remote_work_eligible?: boolean
          is_leadership_role?: boolean
          direct_reports_max?: number
          headcount_approved?: number
          current_headcount?: number
          promotion_eligible_to?: Json
          typical_tenure_months?: number
          is_active?: boolean
          effective_from?: string
          effective_to?: string | null
          created_at?: string
          updated_at?: string
          created_by_id?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          title?: string
          code?: string | null
          description?: string | null
          department_id?: string | null
          reports_to_position_id?: string | null
          level?: string | null
          job_family?: string | null
          career_track?: string | null
          min_salary?: number | null
          max_salary?: number | null
          target_salary?: number | null
          currency?: string
          salary_review_frequency?: number
          responsibilities?: string[] | null
          requirements?: string[] | null
          preferred_qualifications?: string[] | null
          required_skills?: Json
          preferred_skills?: Json
          competency_matrix?: Json
          performance_indicators?: Json
          success_metrics?: Json
          location_type?: string
          travel_requirement_percent?: number
          remote_work_eligible?: boolean
          is_leadership_role?: boolean
          direct_reports_max?: number
          headcount_approved?: number
          current_headcount?: number
          promotion_eligible_to?: Json
          typical_tenure_months?: number
          is_active?: boolean
          effective_from?: string
          effective_to?: string | null
          created_at?: string
          updated_at?: string
          created_by_id?: string | null
          metadata?: Json
        }
      }
      roles: {
        Row: {
          id: number
          name: string
          display_name: string
          description: string | null
          level: number
          parent_role_id: number | null
          permissions_inheritance: boolean
          is_system_role: boolean
          color_code: string
          icon: string
          max_users: number | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by_id: string | null
          metadata: Json
          permissions: Json
          company_id: string | null
        }
        Insert: {
          id?: number
          name: string
          display_name: string
          description?: string | null
          level?: number
          parent_role_id?: number | null
          permissions_inheritance?: boolean
          is_system_role?: boolean
          color_code?: string
          icon?: string
          max_users?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by_id?: string | null
          metadata?: Json
          permissions?: Json
          company_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          display_name?: string
          description?: string | null
          level?: number
          parent_role_id?: number | null
          permissions_inheritance?: boolean
          is_system_role?: boolean
          color_code?: string
          icon?: string
          max_users?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by_id?: string | null
          metadata?: Json
          permissions?: Json
          company_id?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          employee_id: string
          email: string
          secondary_email: string | null
          first_name: string
          middle_name: string | null
          last_name: string
          preferred_name: string | null
          display_name: string | null
          phone: string | null
          mobile_phone: string | null
          date_of_birth: string | null
          gender: string | null
          nationality: string | null
          marital_status: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state_province: string | null
          postal_code: string | null
          country: string | null
          emergency_contacts: Json
          hire_date: string | null
          probation_end_date: string | null
          employment_status: string
          employment_type: string
          work_location: string | null
          allowed_work_locations: string[] | null
          department_id: string | null
          position_id: string | null
          manager_employee_id: string | null
          skip_level_manager: string | null
          role_id: number
          salary: number | null
          salary_currency: string
          salary_frequency: string
          last_salary_review: string | null
          next_salary_review: string | null
          bonus_eligible: boolean
          equity_eligible: boolean
          pto_balance: number
          sick_leave_balance: number
          benefits_eligible: boolean
          benefits_start_date: string | null
          timezone: string
          preferred_language: string
          profile_photo_url: string | null
          skills: Json
          certifications: Json
          languages: Json
          education: Json
          career_interests: Json
          development_goals: Json
          performance_rating: number | null
          last_performance_review: string | null
          next_performance_review: string | null
          engagement_score: number | null
          retention_risk: string
          is_active: boolean
          last_login: string | null
          login_count: number
          failed_login_attempts: number
          account_locked: boolean
          locked_until: string | null
          two_factor_enabled: boolean
          security_clearance: string | null
          ai_insights: Json
          career_path_prediction: Json
          skill_recommendations: Json
          created_at: string
          updated_at: string
          created_by_id: string | null
          updated_by_id: string | null
          metadata: Json
          auth_user_id: string | null
          manager_id: string | null
          supervisor_id: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          email: string
          secondary_email?: string | null
          first_name: string
          middle_name?: string | null
          last_name: string
          preferred_name?: string | null
          display_name?: string | null
          phone?: string | null
          mobile_phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          nationality?: string | null
          marital_status?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state_province?: string | null
          postal_code?: string | null
          country?: string | null
          emergency_contacts?: Json
          hire_date?: string | null
          probation_end_date?: string | null
          employment_status?: string
          employment_type?: string
          work_location?: string | null
          allowed_work_locations?: string[] | null
          department_id?: string | null
          position_id?: string | null
          manager_employee_id?: string | null
          skip_level_manager?: string | null
          role_id?: number
          salary?: number | null
          salary_currency?: string
          salary_frequency?: string
          last_salary_review?: string | null
          next_salary_review?: string | null
          bonus_eligible?: boolean
          equity_eligible?: boolean
          pto_balance?: number
          sick_leave_balance?: number
          benefits_eligible?: boolean
          benefits_start_date?: string | null
          timezone?: string
          preferred_language?: string
          profile_photo_url?: string | null
          skills?: Json
          certifications?: Json
          languages?: Json
          education?: Json
          career_interests?: Json
          development_goals?: Json
          performance_rating?: number | null
          last_performance_review?: string | null
          next_performance_review?: string | null
          engagement_score?: number | null
          retention_risk?: string
          is_active?: boolean
          last_login?: string | null
          login_count?: number
          failed_login_attempts?: number
          account_locked?: boolean
          locked_until?: string | null
          two_factor_enabled?: boolean
          security_clearance?: string | null
          ai_insights?: Json
          career_path_prediction?: Json
          skill_recommendations?: Json
          created_at?: string
          updated_at?: string
          created_by_id?: string | null
          updated_by_id?: string | null
          metadata?: Json
          auth_user_id?: string | null
          manager_id?: string | null
          supervisor_id?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          email?: string
          secondary_email?: string | null
          first_name?: string
          middle_name?: string | null
          last_name?: string
          preferred_name?: string | null
          display_name?: string | null
          phone?: string | null
          mobile_phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          nationality?: string | null
          marital_status?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state_province?: string | null
          postal_code?: string | null
          country?: string | null
          emergency_contacts?: Json
          hire_date?: string | null
          probation_end_date?: string | null
          employment_status?: string
          employment_type?: string
          work_location?: string | null
          allowed_work_locations?: string[] | null
          department_id?: string | null
          position_id?: string | null
          manager_employee_id?: string | null
          skip_level_manager?: string | null
          role_id?: number
          salary?: number | null
          salary_currency?: string
          salary_frequency?: string
          last_salary_review?: string | null
          next_salary_review?: string | null
          bonus_eligible?: boolean
          equity_eligible?: boolean
          pto_balance?: number
          sick_leave_balance?: number
          benefits_eligible?: boolean
          benefits_start_date?: string | null
          timezone?: string
          preferred_language?: string
          profile_photo_url?: string | null
          skills?: Json
          certifications?: Json
          languages?: Json
          education?: Json
          career_interests?: Json
          development_goals?: Json
          performance_rating?: number | null
          last_performance_review?: string | null
          next_performance_review?: string | null
          engagement_score?: number | null
          retention_risk?: string
          is_active?: boolean
          last_login?: string | null
          login_count?: number
          failed_login_attempts?: number
          account_locked?: boolean
          locked_until?: string | null
          two_factor_enabled?: boolean
          security_clearance?: string | null
          ai_insights?: Json
          career_path_prediction?: Json
          skill_recommendations?: Json
          created_at?: string
          updated_at?: string
          created_by_id?: string | null
          updated_by_id?: string | null
          metadata?: Json
          auth_user_id?: string | null
          manager_id?: string | null
          supervisor_id?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string | null
          employee_id: string | null
          session_token: string
          refresh_token_hash: string | null
          device_info: Json
          browser_fingerprint: string | null
          user_agent: string | null
          device_type: string | null
          os_name: string | null
          browser_name: string | null
          ip_address: string | null
          country: string | null
          region: string | null
          city: string | null
          isp: string | null
          is_trusted_device: boolean
          risk_score: number
          requires_2fa: boolean
          security_flags: Json
          last_activity: string
          last_seen_page: string | null
          activity_count: number
          expires_at: string
          is_active: boolean
          logout_reason: string | null
          avg_response_time: number
          total_requests: number
          error_count: number
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id?: string | null
          employee_id?: string | null
          session_token: string
          refresh_token_hash?: string | null
          device_info?: Json
          browser_fingerprint?: string | null
          user_agent?: string | null
          device_type?: string | null
          os_name?: string | null
          browser_name?: string | null
          ip_address?: string | null
          country?: string | null
          region?: string | null
          city?: string | null
          isp?: string | null
          is_trusted_device?: boolean
          risk_score?: number
          requires_2fa?: boolean
          security_flags?: Json
          last_activity?: string
          last_seen_page?: string | null
          activity_count?: number
          expires_at: string
          is_active?: boolean
          logout_reason?: string | null
          avg_response_time?: number
          total_requests?: number
          error_count?: number
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string | null
          employee_id?: string | null
          session_token?: string
          refresh_token_hash?: string | null
          device_info?: Json
          browser_fingerprint?: string | null
          user_agent?: string | null
          device_type?: string | null
          os_name?: string | null
          browser_name?: string | null
          ip_address?: string | null
          country?: string | null
          region?: string | null
          city?: string | null
          isp?: string | null
          is_trusted_device?: boolean
          risk_score?: number
          requires_2fa?: boolean
          security_flags?: Json
          last_activity?: string
          last_seen_page?: string | null
          activity_count?: number
          expires_at?: string
          is_active?: boolean
          logout_reason?: string | null
          avg_response_time?: number
          total_requests?: number
          error_count?: number
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      failed_login_attempts: {
        Row: {
          id: string
          email: string
          attempted_password_hash: string | null
          ip_address: string | null
          user_agent: string | null
          device_fingerprint: string | null
          country: string | null
          attempt_type: string
          failure_reason: string | null
          risk_indicators: Json
          is_bot_suspected: boolean
          is_brute_force: boolean
          account_locked: boolean
          lockout_duration: number | null
          blocked_until: string | null
          security_alert_sent: boolean
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          email: string
          attempted_password_hash?: string | null
          ip_address?: string | null
          user_agent?: string | null
          device_fingerprint?: string | null
          country?: string | null
          attempt_type?: string
          failure_reason?: string | null
          risk_indicators?: Json
          is_bot_suspected?: boolean
          is_brute_force?: boolean
          account_locked?: boolean
          lockout_duration?: number | null
          blocked_until?: string | null
          security_alert_sent?: boolean
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          email?: string
          attempted_password_hash?: string | null
          ip_address?: string | null
          user_agent?: string | null
          device_fingerprint?: string | null
          country?: string | null
          attempt_type?: string
          failure_reason?: string | null
          risk_indicators?: Json
          is_bot_suspected?: boolean
          is_brute_force?: boolean
          account_locked?: boolean
          lockout_duration?: number | null
          blocked_until?: string | null
          security_alert_sent?: boolean
          created_at?: string
          metadata?: Json
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string | null
          employee_id: string | null
          theme: string
          accent_color: string
          compact_mode: boolean
          sidebar_collapsed: boolean
          language: string
          timezone: string
          date_format: string
          time_format: string
          number_format: string
          currency: string
          notification_preferences: Json
          dashboard_layout: Json
          default_approval_delegates: Json
          quick_actions: Json
          favorite_reports: Json
          profile_visibility: string
          contact_sharing_level: string
          activity_sharing: boolean
          ai_suggestions_enabled: boolean
          data_analytics_consent: boolean
          personalization_level: string
          biometric_login_enabled: boolean
          offline_mode_enabled: boolean
          background_sync_enabled: boolean
          accessibility_preferences: Json
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id?: string | null
          employee_id?: string | null
          theme?: string
          accent_color?: string
          compact_mode?: boolean
          sidebar_collapsed?: boolean
          language?: string
          timezone?: string
          date_format?: string
          time_format?: string
          number_format?: string
          currency?: string
          notification_preferences?: Json
          dashboard_layout?: Json
          default_approval_delegates?: Json
          quick_actions?: Json
          favorite_reports?: Json
          profile_visibility?: string
          contact_sharing_level?: string
          activity_sharing?: boolean
          ai_suggestions_enabled?: boolean
          data_analytics_consent?: boolean
          personalization_level?: string
          biometric_login_enabled?: boolean
          offline_mode_enabled?: boolean
          background_sync_enabled?: boolean
          accessibility_preferences?: Json
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string | null
          employee_id?: string | null
          theme?: string
          accent_color?: string
          compact_mode?: boolean
          sidebar_collapsed?: boolean
          language?: string
          timezone?: string
          date_format?: string
          time_format?: string
          number_format?: string
          currency?: string
          notification_preferences?: Json
          dashboard_layout?: Json
          default_approval_delegates?: Json
          quick_actions?: Json
          favorite_reports?: Json
          profile_visibility?: string
          contact_sharing_level?: string
          activity_sharing?: boolean
          ai_suggestions_enabled?: boolean
          data_analytics_consent?: boolean
          personalization_level?: string
          biometric_login_enabled?: boolean
          offline_mode_enabled?: boolean
          background_sync_enabled?: boolean
          accessibility_preferences?: Json
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
    }
  }
}

// Export the database type
export type SupabaseDatabase = Database['public']['Tables']
