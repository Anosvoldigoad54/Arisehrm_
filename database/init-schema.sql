-- AriseHRM Database Schema Initialization
-- Execute this script in your Supabase SQL Editor to set up the required tables

-- Create enum types (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status_type') THEN
        CREATE TYPE employment_status_type AS ENUM ('active', 'inactive', 'terminated', 'on_leave');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_type_enum') THEN
        CREATE TYPE employment_type_enum AS ENUM ('full_time', 'part_time', 'contract', 'intern');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'in_review');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'early_departure', 'on_leave', 'holiday', 'weekend');
    END IF;
END $$;

-- 1. Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    manager_employee_id UUID,
    budget DECIMAL(15,2),
    headcount_target INTEGER,
    current_headcount INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    level VARCHAR(20),
    min_salary DECIMAL(15,2),
    max_salary DECIMAL(15,2),
    is_leadership_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    color_code VARCHAR(7) DEFAULT '#667eea',
    icon VARCHAR(50) DEFAULT 'person',
    permissions JSONB DEFAULT '[]',
    max_users INTEGER,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    profile_photo_url TEXT,
    phone VARCHAR(20),
    department_id UUID REFERENCES departments(id),
    role_id INTEGER REFERENCES roles(id),
    position_id UUID REFERENCES positions(id),
    employment_status employment_status_type DEFAULT 'active',
    employment_type employment_type_enum DEFAULT 'full_time',
    work_location VARCHAR(100),
    allowed_work_locations JSONB DEFAULT '[]',
    manager_employee_id UUID,
    skip_level_manager UUID,
    salary DECIMAL(15,2),
    salary_currency VARCHAR(3) DEFAULT 'USD',
    hire_date DATE,
    probation_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferred_language VARCHAR(10) DEFAULT 'en',
    skills JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    performance_rating DECIMAL(3,2),
    engagement_score INTEGER,
    retention_risk VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id VARCHAR(20) REFERENCES user_profiles(employee_id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB DEFAULT '{}',
    browser_fingerprint VARCHAR(255),
    user_agent TEXT,
    device_type VARCHAR(50),
    ip_address INET,
    country VARCHAR(100),
    city VARCHAR(100),
    is_trusted_device BOOLEAN DEFAULT FALSE,
    risk_score INTEGER DEFAULT 0,
    security_flags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    activity_count INTEGER DEFAULT 0,
    logout_reason VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Failed login attempts table
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    country VARCHAR(100),
    attempt_type VARCHAR(50) DEFAULT 'password',
    failure_reason TEXT,
    risk_indicators JSONB DEFAULT '[]',
    is_bot_suspected BOOLEAN DEFAULT FALSE,
    is_brute_force BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id VARCHAR(20) REFERENCES user_profiles(employee_id),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    notification_email BOOLEAN DEFAULT TRUE,
    notification_sms BOOLEAN DEFAULT FALSE,
    notification_push BOOLEAN DEFAULT TRUE,
    notification_in_app BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, display_name, level, color_code, icon, permissions, is_system_role) VALUES
('super_admin', 'Super Administrator', 15, '#dc2626', 'supervisor_account', '["*"]', TRUE),
('hr_manager', 'HR Manager', 8, '#059669', 'people', '["employees.*", "attendance.*", "leaves.*", "payroll.*", "reports.hr"]', FALSE),
('department_manager', 'Department Head', 7, '#7C3AED', 'domain', '["employees.view_department", "attendance.manage_department", "leaves.approve", "reports.department"]', FALSE),
('team_lead', 'Team Lead', 5, '#EA580C', 'group_work', '["employees.view_team", "attendance.manage_team", "leaves.review", "reports.team"]', FALSE),
('employee', 'Employee', 3, '#10B981', 'person', '["dashboard.view", "profile.view_own", "attendance.view_own", "leaves.view_own"]', FALSE),
('contractor', 'Contractor', 1, '#0891B2', 'business_center', '["dashboard.view", "profile.view_own", "attendance.view_own"]', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Insert default departments
INSERT INTO departments (name, code) VALUES
('Human Resources', 'HR'),
('Information Technology', 'IT'),
('Finance', 'FIN'),
('Marketing', 'MKT'),
('Operations', 'OPS')
ON CONFLICT (code) DO NOTHING;

-- Insert default positions
INSERT INTO positions (title, code, level) VALUES
('Software Engineer', 'SE', 'Mid'),
('Senior Software Engineer', 'SSE', 'Senior'),
('HR Manager', 'HRM', 'Manager'),
('Marketing Specialist', 'MS', 'Junior'),
('Finance Analyst', 'FA', 'Mid')
ON CONFLICT (code) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_employee_id ON user_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department_id ON user_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip_address ON failed_login_attempts(ip_address);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist (using more specific approach)
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
    DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
    DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
    DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
    DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
    DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
END $$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();