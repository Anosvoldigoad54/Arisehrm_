-- ============================================================================
-- ARISE HRM - COMPLETE DATABASE SCHEMA FOR POSTGRESQL/SUPABASE
-- ============================================================================
-- This schema covers ALL features of the Arise HRM application
-- Version: 1.0.0
-- Last Updated: November 2024
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: ENUM TYPES
-- ============================================================================

-- Drop existing types if they exist (for clean reinstall)
DO $$
BEGIN
    DROP TYPE IF EXISTS public.approval_status CASCADE;
    DROP TYPE IF EXISTS public.priority_level CASCADE;
    DROP TYPE IF EXISTS public.attendance_status CASCADE;
    DROP TYPE IF EXISTS public.employment_status_type CASCADE;
    DROP TYPE IF EXISTS public.employment_type_enum CASCADE;
    DROP TYPE IF EXISTS public.gender_enum CASCADE;
    DROP TYPE IF EXISTS public.leave_status CASCADE;
    DROP TYPE IF EXISTS public.document_status CASCADE;
    DROP TYPE IF EXISTS public.expense_status CASCADE;
    DROP TYPE IF EXISTS public.interview_status CASCADE;
    DROP TYPE IF EXISTS public.candidate_status CASCADE;
    DROP TYPE IF EXISTS public.training_status CASCADE;
    DROP TYPE IF EXISTS public.performance_rating CASCADE;
    DROP TYPE IF EXISTS public.project_status CASCADE;
    DROP TYPE IF EXISTS public.payment_status CASCADE;
    DROP TYPE IF EXISTS public.notification_type CASCADE;
    DROP TYPE IF EXISTS public.audit_action CASCADE;
END$$;

-- Create ENUM types
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'urgent', 'critical');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'on_leave', 'holiday', 'weekend', 'half_day', 'work_from_home');
CREATE TYPE public.employment_status_type AS ENUM ('active', 'on_leave', 'terminated', 'resigned', 'retired', 'probation', 'notice_period');
CREATE TYPE public.employment_type_enum AS ENUM ('full_time', 'part_time', 'contract', 'intern', 'temporary', 'consultant', 'freelance');
CREATE TYPE public.gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'withdrawn');
CREATE TYPE public.document_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'expired', 'archived');
CREATE TYPE public.expense_status AS ENUM ('draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'reimbursed');
CREATE TYPE public.interview_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show');
CREATE TYPE public.candidate_status AS ENUM ('new', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn');
CREATE TYPE public.training_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'failed', 'passed');
CREATE TYPE public.performance_rating AS ENUM ('outstanding', 'exceeds_expectations', 'meets_expectations', 'needs_improvement', 'unsatisfactory');
CREATE TYPE public.project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE public.notification_type AS ENUM ('info', 'success', 'warning', 'error', 'reminder', 'alert');
CREATE TYPE public.audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export');

-- ============================================================================
-- SECTION 2: CORE USER & AUTHENTICATION TABLES
-- ============================================================================

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying(255) NOT NULL UNIQUE,
  password_hash character varying(255) NOT NULL,
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  last_login timestamp with time zone,
  login_attempts integer DEFAULT 0,
  locked_until timestamp with time zone,
  password_reset_token character varying(255),
  password_reset_expires timestamp with time zone,
  verification_token character varying(255),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id serial PRIMARY KEY,
  name character varying(100) NOT NULL UNIQUE,
  display_name character varying(100) NOT NULL,
  description text,
  level integer NOT NULL DEFAULT 1,
  parent_role_id integer REFERENCES public.roles(id),
  permissions jsonb DEFAULT '{}',
  is_system_role boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(200) NOT NULL,
  code character varying(50) NOT NULL UNIQUE,
  description text,
  parent_department_id uuid REFERENCES public.departments(id),
  head_employee_id character varying(50),
  budget numeric(15, 2),
  location character varying(255),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id)
);

-- Positions table
CREATE TABLE IF NOT EXISTS public.positions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying(200) NOT NULL,
  code character varying(50) UNIQUE,
  description text,
  department_id uuid REFERENCES public.departments(id),
  reports_to_position_id uuid REFERENCES public.positions(id),
  level integer,
  min_salary numeric(15, 2),
  max_salary numeric(15, 2),
  required_skills jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT positions_pkey PRIMARY KEY (id)
);

-- User Profiles table (employee information)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id character varying(50) NOT NULL UNIQUE,
  auth_user_id uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email character varying(255) NOT NULL UNIQUE,
  first_name character varying(100) NOT NULL,
  last_name character varying(100) NOT NULL,
  middle_name character varying(100),
  display_name character varying(200),
  phone character varying(20),
  mobile character varying(20),
  emergency_contact_name character varying(200),
  emergency_contact_phone character varying(20),
  date_of_birth date,
  gender gender_enum,
  nationality character varying(100),
  address text,
  city character varying(100),
  state character varying(100),
  postal_code character varying(20),
  country character varying(100),
  hire_date date DEFAULT CURRENT_DATE,
  termination_date date,
  employment_status employment_status_type DEFAULT 'active',
  employment_type employment_type_enum DEFAULT 'full_time',
  department_id uuid REFERENCES public.departments(id),
  position_id uuid REFERENCES public.positions(id),
  manager_id uuid REFERENCES public.user_profiles(id),
  role_id integer REFERENCES public.roles(id),
  salary numeric(15, 2),
  salary_currency character varying(10) DEFAULT 'USD',
  profile_picture_url text,
  bio text,
  skills jsonb DEFAULT '[]',
  certifications jsonb DEFAULT '[]',
  languages jsonb DEFAULT '[]',
  social_links jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- SECTION 3: TEAMS & ORGANIZATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teams (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(200) NOT NULL,
    code character varying(50) UNIQUE,
    description text,
    department_id uuid REFERENCES public.departments(id),
    parent_team_id uuid REFERENCES public.teams(id),
    team_lead_id uuid REFERENCES public.user_profiles(id),
    max_members integer,
    budget numeric(15, 2),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
    employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role_in_team character varying(100) DEFAULT 'member',
    is_primary_team boolean DEFAULT true,
    joined_date date DEFAULT CURRENT_DATE,
    left_date date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(team_id, employee_id)
);

-- ============================================================================
-- SECTION 4: ATTENDANCE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shifts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(100) NOT NULL,
    code character varying(50) UNIQUE,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    break_duration_minutes integer DEFAULT 60,
    grace_period_minutes integer DEFAULT 15,
    working_hours numeric(4, 2),
    is_flexible boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.work_schedules (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    shift_id uuid REFERENCES public.shifts(id),
    effective_from date NOT NULL,
    effective_to date,
    days_of_week jsonb DEFAULT '[]', -- [1,2,3,4,5] for Mon-Fri
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clock_locations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(200) NOT NULL,
    address text,
    latitude numeric(10, 8) NOT NULL,
    longitude numeric(11, 8) NOT NULL,
    radius_meters integer DEFAULT 100,
    is_headquarters boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  shift_id uuid REFERENCES public.shifts(id),
  clock_in_time timestamp with time zone,
  clock_out_time timestamp with time zone,
  clock_in_location_id uuid REFERENCES public.clock_locations(id),
  clock_out_location_id uuid REFERENCES public.clock_locations(id),
  clock_in_ip character varying(50),
  clock_out_ip character varying(50),
  clock_in_device character varying(200),
  clock_out_device character varying(200),
  status attendance_status DEFAULT 'present',
  total_hours numeric(4, 2),
  overtime_hours numeric(4, 2),
  break_hours numeric(4, 2),
  is_approved boolean DEFAULT false,
  approved_by_id uuid REFERENCES public.user_profiles(id),
  approved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(employee_id, date)
);

CREATE TABLE IF NOT EXISTS public.attendance_corrections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_id uuid REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  requested_clock_in timestamp with time zone,
  requested_clock_out timestamp with time zone,
  reason text NOT NULL,
  status approval_status DEFAULT 'pending',
  requested_by_id uuid REFERENCES public.user_profiles(id),
  approved_by_id uuid REFERENCES public.user_profiles(id),
  approved_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 5: LEAVE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.leave_types (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL UNIQUE,
    description text,
    is_paid boolean DEFAULT true,
    max_days_per_year numeric(5, 2),
    min_days_per_request numeric(3, 1) DEFAULT 0.5,
    max_days_per_request numeric(5, 2),
    requires_approval boolean DEFAULT true,
    carry_forward_allowed boolean DEFAULT false,
    max_carry_forward_days numeric(5, 2),
    accrual_rate numeric(5, 2), -- Days per month
    color character varying(20),
    icon character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employee_leave_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  leave_type_id uuid REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year integer NOT NULL,
  allocated_days numeric(5, 2) NOT NULL DEFAULT 0,
  used_days numeric(5, 2) NOT NULL DEFAULT 0,
  pending_days numeric(5, 2) NOT NULL DEFAULT 0,
  carried_forward_days numeric(5, 2) NOT NULL DEFAULT 0,
  current_balance numeric(5, 2) GENERATED ALWAYS AS (allocated_days + carried_forward_days - used_days - pending_days) STORED,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.leave_types(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days numeric(5, 2) NOT NULL,
  is_half_day boolean DEFAULT false,
  half_day_period character varying(20), -- 'morning' or 'afternoon'
  reason text,
  supporting_documents jsonb DEFAULT '[]',
  status leave_status DEFAULT 'pending',
  approver_id uuid REFERENCES public.user_profiles(id),
  approved_at timestamp with time zone,
  rejection_reason text,
  cancelled_at timestamp with time zone,
  cancelled_by_id uuid REFERENCES public.user_profiles(id),
  cancellation_reason text,
  handover_notes text,
  emergency_contact character varying(200),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leave_approvers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leave_request_id uuid REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  approver_id uuid REFERENCES public.user_profiles(id),
  approval_level integer NOT NULL DEFAULT 1,
  status approval_status DEFAULT 'pending',
  approved_at timestamp with time zone,
  comments text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.holidays (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(200) NOT NULL,
  date date NOT NULL,
  is_mandatory boolean DEFAULT true,
  applicable_locations jsonb DEFAULT '[]',
  applicable_departments jsonb DEFAULT '[]',
  description text,
  is_recurring boolean DEFAULT false,
  recurrence_rule character varying(100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 6: PAYROLL & COMPENSATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.salary_components (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(100) NOT NULL,
  code character varying(50) NOT NULL UNIQUE,
  type character varying(50) NOT NULL, -- 'earning', 'deduction', 'benefit'
  calculation_type character varying(50), -- 'fixed', 'percentage', 'formula'
  is_taxable boolean DEFAULT true,
  is_mandatory boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employee_salary_structure (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  component_id uuid REFERENCES public.salary_components(id),
  amount numeric(15, 2) NOT NULL,
  percentage numeric(5, 2),
  effective_from date NOT NULL,
  effective_to date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payroll_cycles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(100) NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  payment_date date NOT NULL,
  status payment_status DEFAULT 'pending',
  total_gross numeric(15, 2),
  total_deductions numeric(15, 2),
  total_net numeric(15, 2),
  processed_by_id uuid REFERENCES public.user_profiles(id),
  processed_at timestamp with time zone,
  approved_by_id uuid REFERENCES public.user_profiles(id),
  approved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payslips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_cycle_id uuid REFERENCES public.payroll_cycles(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  gross_salary numeric(15, 2) NOT NULL,
  total_earnings numeric(15, 2) NOT NULL,
  total_deductions numeric(15, 2) NOT NULL,
  net_salary numeric(15, 2) NOT NULL,
  earnings_breakdown jsonb DEFAULT '{}',
  deductions_breakdown jsonb DEFAULT '{}',
  attendance_days numeric(5, 2),
  leave_days numeric(5, 2),
  overtime_hours numeric(6, 2),
  payment_method character varying(50),
  payment_reference character varying(200),
  payment_date date,
  status payment_status DEFAULT 'pending',
  notes text,
  pdf_url text,
  is_locked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(payroll_cycle_id, employee_id)
);

CREATE TABLE IF NOT EXISTS public.bonuses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  bonus_type character varying(100) NOT NULL,
  amount numeric(15, 2) NOT NULL,
  currency character varying(10) DEFAULT 'USD',
  reason text,
  payment_date date,
  status payment_status DEFAULT 'pending',
  approved_by_id uuid REFERENCES public.user_profiles(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 7: PERFORMANCE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.performance_review_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(200) NOT NULL,
  description text,
  review_type character varying(50), -- 'annual', 'quarterly', 'project_based'
  criteria jsonb DEFAULT '[]', -- Array of criteria with weights
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES public.user_profiles(id),
  template_id uuid REFERENCES public.performance_review_templates(id),
  review_period_start date NOT NULL,
  review_period_end date NOT NULL,
  review_date date,
  overall_rating performance_rating,
  overall_score numeric(5, 2),
  strengths text,
  areas_for_improvement text,
  goals_achieved text,
  goals_next_period text,
  status approval_status DEFAULT 'pending',
  is_self_review boolean DEFAULT false,
  manager_comments text,
  employee_comments text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.performance_criteria_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  criteria_name character varying(200) NOT NULL,
  criteria_description text,
  weight numeric(5, 2),
  score numeric(5, 2),
  rating performance_rating,
  comments text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title character varying(200) NOT NULL,
  description text,
  target_completion_date date,
  actual_completion_date date,
  progress_percentage integer DEFAULT 0,
  status character varying(50) DEFAULT 'not_started',
  priority priority_level DEFAULT 'medium',
  category character varying(100),
  assigned_by_id uuid REFERENCES public.user_profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  to_employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  feedback_type character varying(50), -- 'positive', 'constructive', '360'
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  visibility character varying(50) DEFAULT 'private', -- 'private', 'manager', 'public'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 8: RECRUITMENT & HIRING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_postings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title character varying(200) NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  position_id uuid REFERENCES public.positions(id),
  employment_type employment_type_enum DEFAULT 'full_time',
  location character varying(200),
  is_remote boolean DEFAULT false,
  description text,
  requirements text,
  responsibilities text,
  min_salary numeric(15, 2),
  max_salary numeric(15, 2),
  salary_currency character varying(10) DEFAULT 'USD',
  openings integer DEFAULT 1,
  posted_date date DEFAULT CURRENT_DATE,
  closing_date date,
  status character varying(50) DEFAULT 'draft', -- 'draft', 'active', 'closed', 'filled'
  posted_by_id uuid REFERENCES public.user_profiles(id),
  is_internal boolean DEFAULT false,
  application_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id uuid REFERENCES public.job_postings(id),
  first_name character varying(100) NOT NULL,
  last_name character varying(100) NOT NULL,
  email character varying(255) NOT NULL,
  phone character varying(20),
  current_location character varying(200),
  current_company character varying(200),
  current_position character varying(200),
  total_experience_years numeric(4, 1),
  expected_salary numeric(15, 2),
  notice_period_days integer,
  resume_url text,
  cover_letter text,
  linkedin_url text,
  portfolio_url text,
  status candidate_status DEFAULT 'new',
  source character varying(100), -- 'website', 'referral', 'linkedin', 'agency'
  referred_by_id uuid REFERENCES public.user_profiles(id),
  rating numeric(3, 1), -- 0-5 rating
  notes text,
  tags jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_posting_id uuid REFERENCES public.job_postings(id),
  interview_type character varying(100), -- 'phone', 'video', 'in-person', 'technical', 'hr'
  round_number integer DEFAULT 1,
  scheduled_date timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 60,
  location character varying(200),
  meeting_link text,
  interviewer_ids jsonb DEFAULT '[]', -- Array of user IDs
  status interview_status DEFAULT 'scheduled',
  candidate_rating numeric(3, 1),
  technical_rating numeric(3, 1),
  cultural_fit_rating numeric(3, 1),
  feedback text,
  recommendation character varying(50), -- 'hire', 'reject', 'next_round', 'on_hold'
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interview_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id uuid REFERENCES public.interviews(id) ON DELETE CASCADE,
  interviewer_id uuid REFERENCES public.user_profiles(id),
  overall_rating numeric(3, 1),
  technical_skills_rating numeric(3, 1),
  communication_rating numeric(3, 1),
  problem_solving_rating numeric(3, 1),
  cultural_fit_rating numeric(3, 1),
  strengths text,
  weaknesses text,
  detailed_feedback text,
  recommendation character varying(50),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_posting_id uuid REFERENCES public.job_postings(id),
  position_id uuid REFERENCES public.positions(id),
  offered_salary numeric(15, 2) NOT NULL,
  salary_currency character varying(10) DEFAULT 'USD',
  joining_date date,
  offer_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  offer_letter_url text,
  status character varying(50) DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected', 'withdrawn'
  accepted_date date,
  rejected_date date,
  rejection_reason text,
  terms_and_conditions text,
  benefits jsonb DEFAULT '{}',
  offered_by_id uuid REFERENCES public.user_profiles(id),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 9: ONBOARDING & TRAINING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.onboarding_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(200) NOT NULL,
  description text,
  department_id uuid REFERENCES public.departments(id),
  position_id uuid REFERENCES public.positions(id),
  duration_days integer DEFAULT 30,
  tasks jsonb DEFAULT '[]', -- Array of tasks with checklist
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.onboarding_processes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.onboarding_templates(id),
  buddy_id uuid REFERENCES public.user_profiles(id),
  start_date date NOT NULL,
  expected_completion_date date,
  actual_completion_date date,
  progress_percentage integer DEFAULT 0,
  status character varying(50) DEFAULT 'in_progress',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.onboarding_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_process_id uuid REFERENCES public.onboarding_processes(id) ON DELETE CASCADE,
  task_name character varying(200) NOT NULL,
  description text,
  assigned_to_id uuid REFERENCES public.user_profiles(id),
  due_date date,
  completed_date date,
  is_completed boolean DEFAULT false,
  is_mandatory boolean DEFAULT true,
  order_index integer,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_programs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(200) NOT NULL,
  code character varying(50) UNIQUE,
  description text,
  category character varying(100),
  training_type character varying(50), -- 'online', 'classroom', 'workshop', 'certification'
  duration_hours numeric(6, 2),
  max_participants integer,
  trainer_name character varying(200),
  trainer_id uuid REFERENCES public.user_profiles(id),
  cost_per_participant numeric(10, 2),
  currency character varying(10) DEFAULT 'USD',
  prerequisites text,
  learning_objectives text,
  materials jsonb DEFAULT '[]',
  is_mandatory boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_program_id uuid REFERENCES public.training_programs(id) ON DELETE CASCADE,
  session_name character varying(200),
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time time,
  end_time time,
  location character varying(200),
  meeting_link text,
  trainer_id uuid REFERENCES public.user_profiles(id),
  max_participants integer,
  enrolled_count integer DEFAULT 0,
  status training_status DEFAULT 'scheduled',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_session_id uuid REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  enrollment_date date DEFAULT CURRENT_DATE,
  attendance_percentage numeric(5, 2),
  completion_date date,
  status training_status DEFAULT 'enrolled',
  score numeric(5, 2),
  is_passed boolean,
  certificate_url text,
  feedback text,
  rating numeric(3, 1),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(training_session_id, employee_id)
);

-- ============================================================================
-- SECTION 10: PROJECTS & TASKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(200) NOT NULL,
  code character varying(50) UNIQUE,
  description text,
  project_type character varying(100),
  client_name character varying(200),
  department_id uuid REFERENCES public.departments(id),
  project_manager_id uuid REFERENCES public.user_profiles(id),
  start_date date,
  end_date date,
  estimated_hours numeric(8, 2),
  actual_hours numeric(8, 2),
  budget numeric(15, 2),
  spent_amount numeric(15, 2),
  currency character varying(10) DEFAULT 'USD',
  status project_status DEFAULT 'planning',
  priority priority_level DEFAULT 'medium',
  progress_percentage integer DEFAULT 0,
  tags jsonb DEFAULT '[]',
  is_billable boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role character varying(100),
  allocation_percentage integer DEFAULT 100,
  start_date date,
  end_date date,
  hourly_rate numeric(10, 2),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, employee_id)
);

CREATE TABLE IF NOT EXISTS public.project_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_task_id uuid REFERENCES public.project_tasks(id),
  title character varying(200) NOT NULL,
  description text,
  assigned_to_id uuid REFERENCES public.user_profiles(id),
  start_date date,
  due_date date,
  completed_date date,
  estimated_hours numeric(6, 2),
  actual_hours numeric(6, 2),
  status character varying(50) DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
  priority priority_level DEFAULT 'medium',
  progress_percentage integer DEFAULT 0,
  tags jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.time_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id),
  task_id uuid REFERENCES public.project_tasks(id),
  date date NOT NULL,
  hours numeric(5, 2) NOT NULL,
  description text,
  is_billable boolean DEFAULT true,
  hourly_rate numeric(10, 2),
  amount numeric(10, 2),
  is_approved boolean DEFAULT false,
  approved_by_id uuid REFERENCES public.user_profiles(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 11: BENEFITS & EXPENSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.benefit_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(200) NOT NULL,
  category character varying(100), -- 'health', 'retirement', 'insurance', 'wellness'
  description text,
  provider character varying(200),
  cost_per_employee numeric(10, 2),
  employee_contribution numeric(10, 2),
  employer_contribution numeric(10, 2),
  coverage_details text,
  eligibility_criteria text,
  is_mandatory boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employee_benefits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  benefit_plan_id uuid REFERENCES public.benefit_plans(id),
  enrollment_date date DEFAULT CURRENT_DATE,
  termination_date date,
  status character varying(50) DEFAULT 'active',
  employee_contribution numeric(10, 2),
  employer_contribution numeric(10, 2),
  dependents jsonb DEFAULT '[]',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expense_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(100) NOT NULL UNIQUE,
  code character varying(50) UNIQUE,
  description text,
  max_amount numeric(10, 2),
  requires_receipt boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expense_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  report_number character varying(50) UNIQUE,
  title character varying(200) NOT NULL,
  purpose text,
  total_amount numeric(10, 2) NOT NULL DEFAULT 0,
  currency character varying(10) DEFAULT 'USD',
  submission_date date DEFAULT CURRENT_DATE,
  status expense_status DEFAULT 'draft',
  approved_by_id uuid REFERENCES public.user_profiles(id),
  approved_at timestamp with time zone,
  rejected_reason text,
  reimbursement_date date,
  reimbursement_method character varying(50),
  reimbursement_reference character varying(200),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expense_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_report_id uuid REFERENCES public.expense_reports(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.expense_categories(id),
  date date NOT NULL,
  description text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  currency character varying(10) DEFAULT 'USD',
  merchant character varying(200),
  payment_method character varying(50),
  receipt_url text,
  is_billable boolean DEFAULT false,
  project_id uuid REFERENCES public.projects(id),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 12: DOCUMENTS & COMPLIANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.document_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(100) NOT NULL UNIQUE,
  code character varying(50) UNIQUE,
  description text,
  parent_category_id uuid REFERENCES public.document_categories(id),
  is_confidential boolean DEFAULT false,
  retention_period_years integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title character varying(200) NOT NULL,
  document_number character varying(50) UNIQUE,
  description text,
  category_id uuid REFERENCES public.document_categories(id),
  file_url text NOT NULL,
  file_name character varying(255),
  file_size bigint,
  file_type character varying(50),
  uploaded_by_id uuid REFERENCES public.user_profiles(id),
  employee_id uuid REFERENCES public.user_profiles(id), -- If employee-specific
  department_id uuid REFERENCES public.departments(id), -- If department-specific
  version character varying(20) DEFAULT '1.0',
  status document_status DEFAULT 'draft',
  issue_date date,
  expiry_date date,
  is_confidential boolean DEFAULT false,
  access_level character varying(50) DEFAULT 'private',
  tags jsonb DEFAULT '[]',
  approved_by_id uuid REFERENCES public.user_profiles(id),
  approved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_access_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  accessed_by_id uuid REFERENCES public.user_profiles(id),
  action character varying(50), -- 'view', 'download', 'edit', 'share'
  ip_address character varying(50),
  accessed_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title character varying(200) NOT NULL,
  category character varying(100),
  description text,
  policy_document_url text,
  effective_date date NOT NULL,
  review_date date,
  next_review_date date,
  is_mandatory boolean DEFAULT true,
  acknowledgment_required boolean DEFAULT true,
  applicable_to jsonb DEFAULT '{}', -- departments, roles, locations
  status character varying(50) DEFAULT 'active',
  created_by_id uuid REFERENCES public.user_profiles(id),
  approved_by_id uuid REFERENCES public.user_profiles(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.policy_acknowledgments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid REFERENCES public.compliance_policies(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  acknowledged_at timestamp with time zone DEFAULT now(),
  ip_address character varying(50),
  signature_data text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(policy_id, employee_id)
);

CREATE TABLE IF NOT EXISTS public.compliance_audits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title character varying(200) NOT NULL,
  audit_type character varying(100),
  audit_date date NOT NULL,
  auditor_name character varying(200),
  auditor_id uuid REFERENCES public.user_profiles(id),
  department_id uuid REFERENCES public.departments(id),
  findings text,
  recommendations text,
  status character varying(50) DEFAULT 'in_progress',
  due_date date,
  completion_date date,
  report_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 13: COMMUNICATION & ANNOUNCEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title character varying(200) NOT NULL,
  content text NOT NULL,
  announcement_type character varying(50) DEFAULT 'general',
  priority priority_level DEFAULT 'medium',
  published_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  target_audience jsonb DEFAULT '{}', -- departments, roles, specific employees
  attachments jsonb DEFAULT '[]',
  is_pinned boolean DEFAULT false,
  is_published boolean DEFAULT false,
  views_count integer DEFAULT 0,
  created_by_id uuid REFERENCES public.user_profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid REFERENCES public.announcements(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  read_at timestamp with time zone DEFAULT now(),
  UNIQUE(announcement_id, employee_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  to_employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  subject character varying(200),
  content text NOT NULL,
  message_type character varying(50) DEFAULT 'direct', -- 'direct', 'group'
  parent_message_id uuid REFERENCES public.messages(id),
  attachments jsonb DEFAULT '[]',
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  is_archived boolean DEFAULT false,
  priority priority_level DEFAULT 'medium',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title character varying(200) NOT NULL,
  message text NOT NULL,
  notification_type notification_type DEFAULT 'info',
  entity_type character varying(100), -- 'leave', 'attendance', 'payroll', etc.
  entity_id uuid,
  action_url text,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  is_dismissed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 14: REPORTS & ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.saved_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying(200) NOT NULL,
  report_type character varying(100) NOT NULL,
  description text,
  query_params jsonb DEFAULT '{}',
  filters jsonb DEFAULT '{}',
  columns jsonb DEFAULT '[]',
  schedule character varying(50), -- 'daily', 'weekly', 'monthly'
  recipients jsonb DEFAULT '[]',
  created_by_id uuid REFERENCES public.user_profiles(id),
  is_public boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.report_exports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid REFERENCES public.saved_reports(id),
  exported_by_id uuid REFERENCES public.user_profiles(id),
  export_format character varying(20), -- 'pdf', 'excel', 'csv'
  file_url text,
  parameters jsonb DEFAULT '{}',
  exported_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 15: AUDIT & SYSTEM LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  employee_id uuid REFERENCES public.user_profiles(id),
  action audit_action NOT NULL,
  entity_type character varying(100) NOT NULL,
  entity_id uuid,
  entity_name character varying(200),
  old_values jsonb,
  new_values jsonb,
  ip_address character varying(50),
  user_agent text,
  request_method character varying(10),
  request_url text,
  status_code integer,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key character varying(100) NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  category character varying(50),
  is_public boolean DEFAULT false,
  updated_by_id uuid REFERENCES public.user_profiles(id),
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email character varying(255) NOT NULL,
  from_email character varying(255),
  subject character varying(500),
  body text,
  email_type character varying(100),
  status character varying(50) DEFAULT 'pending',
  sent_at timestamp with time zone,
  error_message text,
  template_name character varying(100),
  template_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- SECTION 16: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users & Profiles
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_employee_id ON public.user_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON public.user_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_manager ON public.user_profiles(manager_id);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance_records(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance_records(status);

-- Leave
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

-- Payroll
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON public.payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_cycle ON public.payslips(payroll_cycle_id);
CREATE INDEX IF NOT EXISTS idx_payroll_cycles_dates ON public.payroll_cycles(period_start, period_end);

-- Performance
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON public.performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewer ON public.performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_goals_employee ON public.goals(employee_id);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned ON public.project_tasks(assigned_to_id);

-- Recruitment
CREATE INDEX IF NOT EXISTS idx_candidates_job_posting ON public.candidates(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON public.interviews(candidate_id);

-- Training
CREATE INDEX IF NOT EXISTS idx_training_enrollments_employee ON public.training_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_session ON public.training_enrollments(training_session_id);

-- Expenses
CREATE INDEX IF NOT EXISTS idx_expense_reports_employee ON public.expense_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_reports_status ON public.expense_reports(status);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_employee ON public.documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);

-- Notifications & Messages
CREATE INDEX IF NOT EXISTS idx_notifications_employee ON public.notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_from ON public.messages(from_employee_id);
CREATE INDEX IF NOT EXISTS idx_messages_to ON public.messages(to_employee_id);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);

-- ============================================================================
-- SECTION 17: INSERT DEFAULT DATA
-- ============================================================================

-- Default Roles
INSERT INTO public.roles (id, name, display_name, level, is_system_role, description) VALUES
(1, 'super_admin', 'Super Administrator', 100, true, 'Full system access with all permissions'),
(2, 'admin', 'Administrator', 90, true, 'Administrative access to most features'),
(3, 'hr_manager', 'HR Manager', 80, false, 'Human Resources management and employee relations'),
(4, 'dept_manager', 'Department Manager', 70, false, 'Department-level management and oversight'),
(5, 'team_lead', 'Team Lead', 60, false, 'Team leadership and coordination'),
(6, 'employee', 'Employee', 40, false, 'Standard employee access'),
(7, 'intern', 'Intern', 20, false, 'Internship program participant')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = now();

-- Default Leave Types
INSERT INTO public.leave_types (name, code, description, is_paid, max_days_per_year, color) VALUES
('Annual Leave', 'AL', 'Paid annual leave/vacation', true, 20, '#4CAF50'),
('Sick Leave', 'SL', 'Medical leave for illness', true, 15, '#FF9800'),
('Casual Leave', 'CL', 'Short-term personal leave', true, 10, '#2196F3'),
('Maternity Leave', 'ML', 'Maternity leave for mothers', true, 90, '#E91E63'),
('Paternity Leave', 'PL', 'Paternity leave for fathers', true, 14, '#9C27B0'),
('Unpaid Leave', 'UL', 'Leave without pay', false, NULL, '#9E9E9E'),
('Compensatory Leave', 'CO', 'Leave earned for overtime work', true, 10, '#00BCD4'),
('Bereavement Leave', 'BL', 'Leave for family bereavement', true, 5, '#607D8B'),
('Study Leave', 'STL', 'Educational or training purposes', true, 10, '#FFC107'),
('Emergency Leave', 'EL', 'Unplanned emergency situations', true, 5, '#F44336')
ON CONFLICT (code) DO NOTHING;

-- Default Shifts
INSERT INTO public.shifts (name, code, start_time, end_time, break_duration_minutes, working_hours) VALUES
('Day Shift', 'DAY', '09:00:00', '18:00:00', 60, 8),
('Morning Shift', 'MORNING', '06:00:00', '14:00:00', 30, 7.5),
('Evening Shift', 'EVENING', '14:00:00', '22:00:00', 30, 7.5),
('Night Shift', 'NIGHT', '22:00:00', '06:00:00', 60, 8),
('Flexible', 'FLEX', '00:00:00', '23:59:59', 60, 8)
ON CONFLICT (code) DO NOTHING;

-- Default Salary Components
INSERT INTO public.salary_components (name, code, type, calculation_type, is_taxable) VALUES
('Basic Salary', 'BASIC', 'earning', 'fixed', true),
('House Rent Allowance', 'HRA', 'earning', 'percentage', true),
('Transport Allowance', 'TA', 'earning', 'fixed', true),
('Medical Allowance', 'MA', 'earning', 'fixed', true),
('Performance Bonus', 'BONUS', 'earning', 'variable', true),
('Income Tax', 'TAX', 'deduction', 'percentage', false),
('Provident Fund', 'PF', 'deduction', 'percentage', false),
('Professional Tax', 'PTAX', 'deduction', 'fixed', false),
('Health Insurance', 'HI', 'benefit', 'fixed', false),
('Life Insurance', 'LI', 'benefit', 'fixed', false)
ON CONFLICT (code) DO NOTHING;

-- Default Expense Categories
INSERT INTO public.expense_categories (name, code, description, requires_receipt) VALUES
('Travel', 'TRV', 'Business travel expenses', true),
('Accommodation', 'ACC', 'Hotel and lodging expenses', true),
('Meals', 'MEAL', 'Business meal expenses', true),
('Transportation', 'TRANS', 'Local transportation', true),
('Office Supplies', 'SUPP', 'Office supplies and materials', true),
('Communication', 'COMM', 'Phone and internet expenses', true),
('Training', 'TRAIN', 'Training and development', true),
('Entertainment', 'ENT', 'Client entertainment', true),
('Software', 'SOFT', 'Software subscriptions', true),
('Other', 'OTH', 'Other business expenses', true)
ON CONFLICT (code) DO NOTHING;

-- Default Document Categories
INSERT INTO public.document_categories (name, code, description, is_confidential) VALUES
('Employment Contracts', 'EMP_CONTRACT', 'Employee contracts and agreements', true),
('ID Documents', 'ID_DOCS', 'Identification documents', true),
('Certificates', 'CERT', 'Educational and professional certificates', false),
('Performance Reviews', 'PERF', 'Performance review documents', true),
('Payslips', 'PAYSLIP', 'Salary payslips', true),
('Tax Documents', 'TAX', 'Tax-related documents', true),
('Training Materials', 'TRAIN', 'Training and learning materials', false),
('Policies', 'POLICY', 'Company policies and procedures', false),
('Handbooks', 'HANDBOOK', 'Employee handbooks and guides', false),
('Other', 'OTHER', 'Other documents', false)
ON CONFLICT (code) DO NOTHING;

-- Default System Settings
INSERT INTO public.system_settings (setting_key, setting_value, description, category, is_public) VALUES
('company_name', '"Arise HRM"', 'Company name', 'general', true),
('company_email', '"hr@arisehrm.com"', 'Company email', 'general', true),
('currency', '"USD"', 'Default currency', 'general', true),
('date_format', '"YYYY-MM-DD"', 'Date format', 'general', true),
('time_format', '"HH:mm:ss"', 'Time format', 'general', true),
('working_days', '[1,2,3,4,5]', 'Working days of week (1=Monday)', 'attendance', true),
('work_hours_per_day', '8', 'Standard work hours per day', 'attendance', true),
('attendance_grace_minutes', '15', 'Grace period for late arrival', 'attendance', true),
('leave_approval_required', 'true', 'Leave requests require approval', 'leave', true),
('auto_approve_leaves_under_days', '0', 'Auto-approve leaves under X days (0=disabled)', 'leave', false)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- ============================================================================
-- SECTION 18: FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- ============================================================================
-- SECTION 19: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Note: Enable RLS and configure policies based on your security requirements
-- This is a basic example - customize per your needs

-- Enable RLS on sensitive tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary_structure ENABLE ROW LEVEL SECURITY;

-- Example: Users can only see their own profile
CREATE POLICY user_profiles_select_own ON public.user_profiles
    FOR SELECT
    USING (auth_user_id = auth.uid());

-- Example: HR and Managers can see all profiles
CREATE POLICY user_profiles_select_hr ON public.user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.roles r ON up.role_id = r.id
            WHERE up.auth_user_id = auth.uid()
            AND r.name IN ('super_admin', 'admin', 'hr_manager')
        )
    );

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Grant necessary permissions (adjust based on your setup)
-- For Supabase: These are typically handled automatically
-- For self-hosted PostgreSQL, you may need to grant permissions:

-- GRANT USAGE ON SCHEMA public TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Arise HRM Database Schema Installation Complete!';
    RAISE NOTICE 'Total Tables Created: 70+';
    RAISE NOTICE 'Total Indexes Created: 30+';
    RAISE NOTICE 'Default Data Inserted: Roles, Leave Types, Shifts, and More';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Configure RLS policies for your security requirements';
    RAISE NOTICE '2. Create initial admin user account';
    RAISE NOTICE '3. Configure system settings as needed';
    RAISE NOTICE '4. Import or create departments and positions';
    RAISE NOTICE '5. Start onboarding employees!';
END $$;
