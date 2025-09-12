-- Complete RLS Policies for Arise HRM System
-- These policies enable Row Level Security while allowing authenticated users access based on their roles

-- Enable RLS on all core tables (only if not already enabled)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departments') THEN
        ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'positions') THEN
        ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'failed_login_attempts') THEN
        ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on all additional tables (if they exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'benefits_plans') THEN
        ALTER TABLE benefits_plans ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_benefits') THEN
        ALTER TABLE employee_benefits ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_postings') THEN
        ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_applications') THEN
        ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interview_schedules') THEN
        ALTER TABLE interview_schedules ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'onboarding_checklists') THEN
        ALTER TABLE onboarding_checklists ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_onboarding') THEN
        ALTER TABLE employee_onboarding ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_categories') THEN
        ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_permissions') THEN
        ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_members') THEN
        ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_tasks') THEN
        ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_time_entries') THEN
        ALTER TABLE project_time_entries ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'asset_categories') THEN
        ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assets') THEN
        ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_templates') THEN
        ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_reports') THEN
        ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_settings') THEN
        ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates') THEN
        ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist and recreate them (using DO blocks for better compatibility)
-- ========================================
-- USER PROFILES POLICIES
-- ========================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "HR can view all profiles" ON user_profiles;
END $$;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Admins can view all profiles (simplified to avoid recursion)
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.auth_user_id = auth.uid()
      AND up.role_id IN (1, 2)
    )
  );

-- Admins can update all profiles (simplified to avoid recursion)
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.auth_user_id = auth.uid()
      AND up.role_id IN (1, 2)
    )
  );

-- HR can view all profiles (simplified to avoid recursion)
CREATE POLICY "HR can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.auth_user_id = auth.uid()
      AND up.role_id = 3
    )
  );

-- ========================================
-- DEPARTMENTS POLICIES
-- ========================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view departments" ON departments;
    DROP POLICY IF EXISTS "Admins and HR can manage departments" ON departments;
END $$;

-- Users can view all departments
CREATE POLICY "Users can view departments" ON departments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and HR can manage departments
CREATE POLICY "Admins and HR can manage departments" ON departments
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated' AND
    (auth.uid() IN (
      SELECT auth_user_id FROM user_profiles 
      WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
    ))
  );

-- ========================================
-- POSITIONS POLICIES
-- ========================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view positions" ON positions;
    DROP POLICY IF EXISTS "Admins and HR can manage positions" ON positions;
END $$;

-- Users can view all positions
CREATE POLICY "Users can view positions" ON positions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and HR can manage positions
CREATE POLICY "Admins and HR can manage positions" ON positions
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated' AND
    (auth.uid() IN (
      SELECT auth_user_id FROM user_profiles 
      WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
    ))
  );

-- ========================================
-- ROLES POLICIES
-- ========================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view roles" ON roles;
    DROP POLICY IF EXISTS "Super admins can manage roles" ON roles;
END $$;

-- Users can view all roles
CREATE POLICY "Users can view roles" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Super admins can manage roles
CREATE POLICY "Super admins can manage roles" ON roles
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'authenticated' AND
    (auth.uid() IN (
      SELECT auth_user_id FROM user_profiles 
      WHERE role_id = 1 AND auth_user_id IS NOT NULL
    ))
  );

-- ========================================
-- USER SESSIONS POLICIES
-- ========================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
    DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
    DROP POLICY IF EXISTS "Admins can view all sessions" ON user_sessions;
    DROP POLICY IF EXISTS "System can manage sessions" ON user_sessions;
END $$;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'authenticated' AND
    (auth.uid() IN (
      SELECT auth_user_id FROM user_profiles 
      WHERE role_id IN (1, 2) AND auth_user_id IS NOT NULL
    ))
  );

-- System can manage sessions
CREATE POLICY "System can manage sessions" ON user_sessions
  FOR ALL WITH CHECK (true);

-- ========================================
-- FAILED LOGIN ATTEMPTS POLICIES
-- ========================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "System can log failed attempts" ON failed_login_attempts;
    DROP POLICY IF EXISTS "Admins and HR can view failed attempts" ON failed_login_attempts;
END $$;

-- System can log failed attempts
CREATE POLICY "System can log failed attempts" ON failed_login_attempts
  FOR INSERT WITH CHECK (true);

-- Admins and HR can view failed attempts
CREATE POLICY "Admins and HR can view failed attempts" ON failed_login_attempts
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'authenticated' AND
    (auth.uid() IN (
      SELECT auth_user_id FROM user_profiles 
      WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
    ))
  );

-- ========================================
-- USER PREFERENCES POLICIES
-- ========================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
END $$;

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- EMPLOYEE BENEFITS POLICIES (if table exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_benefits') THEN
        DROP POLICY IF EXISTS "Users can view their own benefits" ON employee_benefits;
        DROP POLICY IF EXISTS "HR and admins can view all benefits" ON employee_benefits;
        DROP POLICY IF EXISTS "HR and admins can manage benefits" ON employee_benefits;
        
        -- Users can view their own benefits
        CREATE POLICY "Users can view their own benefits" ON employee_benefits
          FOR SELECT USING (
            employee_id IN (
              SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
            )
          );

        -- HR and admins can view all benefits
        CREATE POLICY "HR and admins can view all benefits" ON employee_benefits
          FOR SELECT USING (
            auth.jwt() ->> 'role' = 'authenticated' AND
            (auth.uid() IN (
              SELECT auth_user_id FROM user_profiles 
              WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
            ))
          );

        -- Users can manage their own benefits (HR/admins only)
        CREATE POLICY "HR and admins can manage benefits" ON employee_benefits
          FOR ALL USING (
            auth.jwt() ->> 'role' = 'authenticated' AND
            (auth.uid() IN (
              SELECT auth_user_id FROM user_profiles 
              WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
            ))
          );
    END IF;
END $$;

-- ========================================
-- DOCUMENTS POLICIES (if table exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        DROP POLICY IF EXISTS "Users can view documents they have permission to" ON documents;
        DROP POLICY IF EXISTS "Users with edit permissions can update documents" ON documents;
        DROP POLICY IF EXISTS "Users with manage permissions can create documents" ON documents;
        
        -- Users can view documents they have permission to
        CREATE POLICY "Users can view documents they have permission to" ON documents
          FOR SELECT USING (
            id IN (
              SELECT document_id FROM document_permissions dp
              JOIN user_profiles up ON dp.user_id = up.id
              WHERE up.auth_user_id = auth.uid()
            )
            OR is_public = true
            OR (
              auth.jwt() ->> 'role' = 'authenticated' AND
              (auth.uid() IN (
                SELECT auth_user_id FROM user_profiles 
                WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
              ))
            )
          );

        -- Users with edit permissions can update documents
        CREATE POLICY "Users with edit permissions can update documents" ON documents
          FOR UPDATE USING (
            id IN (
              SELECT document_id FROM document_permissions dp
              JOIN user_profiles up ON dp.user_id = up.id
              WHERE up.auth_user_id = auth.uid()
              AND dp.permission_level IN ('edit', 'manage', 'owner')
            )
            OR (
              auth.jwt() ->> 'role' = 'authenticated' AND
              (auth.uid() IN (
                SELECT auth_user_id FROM user_profiles 
                WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
              ))
            )
          );

        -- Users with manage permissions can create documents
        CREATE POLICY "Users with manage permissions can create documents" ON documents
          FOR INSERT WITH CHECK (
            auth.jwt() ->> 'role' = 'authenticated' AND
            (auth.uid() IN (
              SELECT auth_user_id FROM user_profiles 
              WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
            ))
          );
    END IF;
END $$;

-- ========================================
-- PROJECTS POLICIES (if table exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        DROP POLICY IF EXISTS "Users can view projects they are members of" ON projects;
        DROP POLICY IF EXISTS "Project managers and admins can manage projects" ON projects;
        
        -- Users can view projects they are members of or admins
        CREATE POLICY "Users can view projects they are members of" ON projects
          FOR SELECT USING (
            id IN (
              SELECT project_id FROM project_members pm
              JOIN user_profiles up ON pm.user_id = up.id
              WHERE up.auth_user_id = auth.uid()
            )
            OR (
              auth.jwt() ->> 'role' = 'authenticated' AND
              (auth.uid() IN (
                SELECT auth_user_id FROM user_profiles 
                WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
              ))
            )
          );

        -- Project managers and admins can manage projects
        CREATE POLICY "Project managers and admins can manage projects" ON projects
          FOR ALL USING (
            manager_id IN (
              SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
            )
            OR (
              auth.jwt() ->> 'role' = 'authenticated' AND
              (auth.uid() IN (
                SELECT auth_user_id FROM user_profiles 
                WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
              ))
            )
          );
    END IF;
END $$;

-- ========================================
-- ASSETS POLICIES (if table exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assets') THEN
        DROP POLICY IF EXISTS "Users can view assets assigned to them" ON assets;
        DROP POLICY IF EXISTS "Asset managers and admins can manage assets" ON assets;
        
        -- Users can view assets assigned to them or admins
        CREATE POLICY "Users can view assets assigned to them" ON assets
          FOR SELECT USING (
            assigned_to IN (
              SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
            )
            OR (
              auth.jwt() ->> 'role' = 'authenticated' AND
              (auth.uid() IN (
                SELECT auth_user_id FROM user_profiles 
                WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
              ))
            )
          );

        -- Asset managers and admins can manage assets
        CREATE POLICY "Asset managers and admins can manage assets" ON assets
          FOR ALL USING (
            auth.jwt() ->> 'role' = 'authenticated' AND
            (auth.uid() IN (
              SELECT auth_user_id FROM user_profiles 
              WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
            ))
          );
    END IF;
END $$;

-- ========================================
-- LEAVE REQUESTS POLICIES (if table exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leave_requests') THEN
        DROP POLICY IF EXISTS "Users can view own leave requests" ON leave_requests;
        DROP POLICY IF EXISTS "Users can create own leave requests" ON leave_requests;
        DROP POLICY IF EXISTS "Users can update own leave requests" ON leave_requests;
        
        -- Users can view their own leave requests
        CREATE POLICY "Users can view own leave requests" ON leave_requests
          FOR SELECT USING (
            employee_id IN (
              SELECT employee_id FROM user_profiles 
              WHERE auth_user_id = auth.uid()
            )
            OR (
              auth.jwt() ->> 'role' = 'authenticated' AND
              (auth.uid() IN (
                SELECT auth_user_id FROM user_profiles 
                WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
              ))
            )
          );

        -- Users can create their own leave requests
        CREATE POLICY "Users can create own leave requests" ON leave_requests
          FOR INSERT WITH CHECK (
            employee_id IN (
              SELECT employee_id FROM user_profiles 
              WHERE auth_user_id = auth.uid()
            )
          );

        -- Users can update their own leave requests
        CREATE POLICY "Users can update own leave requests" ON leave_requests
          FOR UPDATE USING (
            employee_id IN (
              SELECT employee_id FROM user_profiles 
              WHERE auth_user_id = auth.uid()
            )
            OR (
              auth.jwt() ->> 'role' = 'authenticated' AND
              (auth.uid() IN (
                SELECT auth_user_id FROM user_profiles 
                WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
              ))
            )
          );
    END IF;
END $$;

-- ========================================
-- ATTENDANCE RECORDS POLICIES (if table exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance_records') THEN
        DROP POLICY IF EXISTS "Users can view own attendance" ON attendance_records;
        DROP POLICY IF EXISTS "Users can create own attendance" ON attendance_records;
        
        -- Users can view their own attendance records
        CREATE POLICY "Users can view own attendance" ON attendance_records
          FOR SELECT USING (
            employee_id IN (
              SELECT employee_id FROM user_profiles 
              WHERE auth_user_id = auth.uid()
            )
            OR (
              auth.jwt() ->> 'role' = 'authenticated' AND
              (auth.uid() IN (
                SELECT auth_user_id FROM user_profiles 
                WHERE role_id IN (1, 2, 3) AND auth_user_id IS NOT NULL
              ))
            )
          );

        -- Users can create their own attendance records
        CREATE POLICY "Users can create own attendance" ON attendance_records
          FOR INSERT WITH CHECK (
            employee_id IN (
              SELECT employee_id FROM user_profiles 
              WHERE auth_user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- ========================================
-- GRANT NECESSARY PERMISSIONS
-- ========================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;