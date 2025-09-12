/**
 * Improved database types to replace 'any' types with proper interfaces
 * This will gradually replace the 'any' types in database.ts
 */

// Emergency Contact interface
export interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

// Skill interface  
export interface Skill {
  id?: string;
  name: string;
  category?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  last_used?: string;
  is_verified?: boolean;
  verification_source?: string;
  created_at?: string;
}

// Certification interface
export interface Certification {
  id?: string;
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  is_active?: boolean;
  verification_status?: 'pending' | 'verified' | 'expired' | 'invalid';
  created_at?: string;
}

// Language proficiency interface
export interface LanguageProficiency {
  id?: string;
  language: string;
  proficiency_level: 'basic' | 'conversational' | 'fluent' | 'native';
  speaking_level?: number; // 1-10 scale
  writing_level?: number;  // 1-10 scale
  reading_level?: number;  // 1-10 scale
  is_primary?: boolean;
  created_at?: string;
}

// Education interface
export interface Education {
  id?: string;
  institution: string;
  degree_type: string;
  degree_name: string;
  field_of_study: string;
  start_date?: string;
  end_date?: string;
  graduation_date?: string;
  gpa?: number;
  max_gpa?: number;
  honors?: string[];
  is_completed?: boolean;
  created_at?: string;
}

// Career Interest interface
export interface CareerInterest {
  id?: string;
  area: string;
  interest_level: 'low' | 'medium' | 'high';
  priority_order?: number;
  notes?: string;
  created_at?: string;
}

// Development Goal interface
export interface DevelopmentGoal {
  id?: string;
  title: string;
  description?: string;
  category: 'skill' | 'leadership' | 'technical' | 'personal' | 'career';
  target_completion_date?: string;
  progress_percentage?: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  assigned_by?: string;
  manager_notes?: string;
  employee_notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Working Hours interface
export interface WorkingHours {
  monday?: {
    start: string;
    end: string;
    break_duration?: number;
    is_working_day: boolean;
  };
  tuesday?: {
    start: string;
    end: string;
    break_duration?: number;
    is_working_day: boolean;
  };
  wednesday?: {
    start: string;
    end: string;
    break_duration?: number;
    is_working_day: boolean;
  };
  thursday?: {
    start: string;
    end: string;
    break_duration?: number;
    is_working_day: boolean;
  };
  friday?: {
    start: string;
    end: string;
    break_duration?: number;
    is_working_day: boolean;
  };
  saturday?: {
    start: string;
    end: string;
    break_duration?: number;
    is_working_day: boolean;
  };
  sunday?: {
    start: string;
    end: string;
    break_duration?: number;
    is_working_day: boolean;
  };
  timezone?: string;
  total_hours_per_week?: number;
}

// Competency Matrix interface
export interface CompetencyMatrix {
  technical_skills: {
    [skillName: string]: {
      required_level: number;
      current_level?: number;
      importance: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  soft_skills: {
    [skillName: string]: {
      required_level: number;
      current_level?: number;
      importance: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  leadership_skills?: {
    [skillName: string]: {
      required_level: number;
      current_level?: number;
      importance: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  last_updated?: string;
  assessed_by?: string;
}

// Performance Indicator interface
export interface PerformanceIndicator {
  id?: string;
  name: string;
  description?: string;
  measurement_type: 'quantitative' | 'qualitative' | 'binary';
  target_value?: number | string | boolean;
  actual_value?: number | string | boolean;
  unit_of_measurement?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  weight?: number; // Percentage weight in overall performance
  status?: 'on_track' | 'at_risk' | 'behind' | 'exceeded';
  last_measured?: string;
  next_measurement?: string;
}

// Success Metrics interface
export interface SuccessMetric {
  id?: string;
  metric_name: string;
  metric_description?: string;
  baseline_value?: number;
  target_value?: number;
  current_value?: number;
  measurement_period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  data_source?: string;
  last_updated?: string;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

// AI Insights interface
export interface AIInsights {
  performance_score?: number;
  engagement_prediction?: number;
  turnover_risk?: 'low' | 'medium' | 'high';
  skill_gap_analysis?: {
    [skillName: string]: {
      current_level: number;
      required_level: number;
      priority: 'low' | 'medium' | 'high';
      recommended_actions: string[];
    };
  };
  career_progression_likelihood?: {
    [positionId: string]: {
      probability: number;
      timeframe_months: number;
      required_developments: string[];
    };
  };
  training_recommendations?: {
    course_name: string;
    provider: string;
    priority: 'low' | 'medium' | 'high';
    estimated_duration_hours: number;
    cost_estimate?: number;
    expected_impact: string;
  }[];
  last_analysis_date?: string;
  confidence_score?: number;
}

// Career Path Prediction interface
export interface CareerPathPrediction {
  predicted_next_roles: {
    position_id: string;
    position_title: string;
    probability: number;
    timeframe_months: number;
    required_skills: string[];
    skill_gaps: string[];
    development_recommendations: string[];
  }[];
  optimal_career_track?: string;
  predicted_salary_growth?: {
    year_1: number;
    year_3: number;
    year_5: number;
  };
  risk_factors?: string[];
  success_factors?: string[];
  last_updated?: string;
  model_version?: string;
}

// User Profile Metadata interface
export interface UserProfileMetadata {
  data_sources?: string[];
  last_synced?: {
    [source: string]: string;
  };
  verification_status?: {
    email: 'verified' | 'pending' | 'failed';
    phone: 'verified' | 'pending' | 'failed';
    identity: 'verified' | 'pending' | 'failed';
    background_check: 'verified' | 'pending' | 'failed' | 'not_required';
  };
  privacy_settings?: {
    profile_visibility: 'public' | 'internal' | 'team_only' | 'manager_only' | 'private';
    photo_visibility: 'public' | 'internal' | 'private';
    contact_info_visibility: 'public' | 'internal' | 'manager_only' | 'private';
  };
  preferences?: {
    notification_frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
    communication_channels: ('email' | 'slack' | 'sms' | 'in_app')[];
    working_style?: string;
    feedback_preference?: string;
  };
  integrations?: {
    [service: string]: {
      enabled: boolean;
      last_sync?: string;
      sync_status?: 'active' | 'error' | 'paused';
    };
  };
}

// Role Permissions interface
export interface RolePermissions {
  employee_management?: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
    bulk_actions: boolean;
  };
  attendance_management?: {
    view_own: boolean;
    view_team: boolean;
    view_all: boolean;
    approve_requests: boolean;
    edit_records: boolean;
    run_reports: boolean;
  };
  leave_management?: {
    view_own: boolean;
    view_team: boolean;
    view_all: boolean;
    approve_requests: boolean;
    cancel_approved: boolean;
    override_balance: boolean;
  };
  payroll?: {
    view_own: boolean;
    view_team: boolean;
    view_all: boolean;
    process_payroll: boolean;
    generate_reports: boolean;
    manage_benefits: boolean;
  };
  performance_management?: {
    view_own: boolean;
    view_team: boolean;
    view_all: boolean;
    conduct_reviews: boolean;
    set_goals: boolean;
    calibrate_ratings: boolean;
  };
  system_administration?: {
    user_management: boolean;
    role_management: boolean;
    system_settings: boolean;
    data_management: boolean;
    security_settings: boolean;
    audit_logs: boolean;
  };
  reporting?: {
    view_standard_reports: boolean;
    create_custom_reports: boolean;
    export_data: boolean;
    schedule_reports: boolean;
    view_analytics: boolean;
  };
  [key: string]: any; // Allow for custom permissions
}
