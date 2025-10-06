-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types and tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        DROP TYPE public.approval_status CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        DROP TYPE public.priority_level CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        DROP TYPE public.attendance_status CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status_type') THEN
        DROP TYPE public.employment_status_type CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_type_enum') THEN
        DROP TYPE public.employment_type_enum CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
        DROP TYPE public.gender_enum CASCADE;
    END IF;
END$$;

-- Create custom ENUM types
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'on_leave', 'holiday', 'weekend');
CREATE TYPE public.employment_status_type AS ENUM ('active', 'on_leave', 'terminated', 'resigned', 'retired');
CREATE TYPE public.employment_type_enum AS ENUM ('full_time', 'part_time', 'contract', 'intern', 'temporary');
CREATE TYPE public.gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- Create tables in dependency order

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.roles (
  id serial PRIMARY KEY,
  name character varying NOT NULL UNIQUE,
  display_name character varying NOT NULL,
  description text,
  level integer NOT NULL DEFAULT 1,
  parent_role_id integer REFERENCES public.roles(id),
  is_system_role boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  code character varying NOT NULL UNIQUE,
  parent_department_id uuid REFERENCES public.departments(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id)
);

CREATE TABLE public.positions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  reports_to_position_id uuid REFERENCES public.positions(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT positions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id character varying NOT NULL UNIQUE,
  auth_user_id uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email character varying NOT NULL UNIQUE,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  display_name character varying,
  phone character varying,
  hire_date date DEFAULT CURRENT_DATE,
  employment_status employment_status_type DEFAULT 'active'::employment_status_type,
  employment_type employment_type_enum DEFAULT 'full_time'::employment_type_enum,
  department_id uuid REFERENCES public.departments(id),
  position_id uuid REFERENCES public.positions(id),
  manager_id uuid REFERENCES public.user_profiles(id),
  role_id integer REFERENCES public.roles(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.teams (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    code character varying UNIQUE,
    description text,
    department_id uuid REFERENCES public.departments(id),
    parent_team_id uuid REFERENCES public.teams(id),
    team_lead_employee_id character varying REFERENCES public.user_profiles(employee_id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.employee_teams (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id character varying REFERENCES public.user_profiles(employee_id),
    team_id uuid REFERENCES public.teams(id),
    role_in_team character varying DEFAULT 'member'::character varying,
    is_primary_team boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.shifts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    break_duration_minutes integer DEFAULT 60,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.clock_locations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    radius_meters integer DEFAULT 100,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.attendance_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id character varying NOT NULL REFERENCES public.user_profiles(employee_id),
  user_id uuid REFERENCES public.users(id),
  date date NOT NULL,
  shift_id uuid REFERENCES public.shifts(id),
  clock_in_time timestamp with time zone,
  clock_out_time timestamp with time zone,
  clock_in_location_id uuid REFERENCES public.clock_locations(id),
  clock_out_location_id uuid REFERENCES public.clock_locations(id),
  status attendance_status DEFAULT 'present'::attendance_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.attendance_corrections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_id uuid REFERENCES public.attendance_records(id),
  employee_id character varying NOT NULL REFERENCES public.user_profiles(employee_id),
  reason text NOT NULL,
  status approval_status DEFAULT 'pending'::approval_status,
  requested_by_id character varying REFERENCES public.user_profiles(employee_id),
  approved_by_id character varying REFERENCES public.user_profiles(employee_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.leave_types (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    code character varying NOT NULL UNIQUE,
    is_paid boolean DEFAULT true,
    max_days_per_year numeric,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.employee_leave_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id character varying REFERENCES public.user_profiles(employee_id),
  leave_type_id uuid REFERENCES public.leave_types(id),
  current_balance numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.leave_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id character varying NOT NULL REFERENCES public.user_profiles(employee_id),
  leave_type_id uuid NOT NULL REFERENCES public.leave_types(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days numeric NOT NULL,
  reason text,
  status approval_status DEFAULT 'pending'::approval_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default roles
INSERT INTO public.roles (id, name, display_name, level, is_system_role) VALUES
(1, 'super_admin', 'Super Administrator', 100, true),
(2, 'admin', 'Administrator', 90, true),
(3, 'hr_manager', 'HR Manager', 80, false),
(4, 'dept_manager', 'Department Manager', 70, false),
(5, 'team_lead', 'Team Lead', 60, false),
(6, 'employee', 'Employee', 40, false),
(7, 'intern', 'Intern', 20, false)
ON CONFLICT (id) DO NOTHING;



