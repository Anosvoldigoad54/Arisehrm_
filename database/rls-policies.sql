-- RLS Policies for Arise HRM System
-- These policies enable Row Level Security while allowing authenticated users access

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view departments" ON departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
DROP POLICY IF EXISTS "Users can view positions" ON positions;
DROP POLICY IF EXISTS "Admins can manage positions" ON positions;
DROP POLICY IF EXISTS "Users can view roles" ON roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON roles;
DROP POLICY IF EXISTS "Users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Users can view role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Users can view own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Users can create own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Users can update own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Users can view leave types" ON leave_types;
DROP POLICY IF EXISTS "Admins can manage leave types" ON leave_types;
DROP POLICY IF EXISTS "Users can view own attendance" ON attendance_records;
DROP POLICY IF EXISTS "Users can create own attendance" ON attendance_records;
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "System can manage sessions" ON user_sessions;
DROP POLICY IF EXISTS "System can log failed attempts" ON failed_login_attempts;
DROP POLICY IF EXISTS "Admins can view failed attempts" ON failed_login_attempts;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = auth_user_id);

CREATE POLICY "System can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Departments Policies
CREATE POLICY "Users can view departments" ON departments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage departments" ON departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text 
      AND role_id IN (1, 2, 3)
    )
  );

-- Positions Policies
CREATE POLICY "Users can view positions" ON positions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage positions" ON positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text 
      AND role_id IN (1, 2, 3)
    )
  );

-- Roles Policies
CREATE POLICY "Users can view roles" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can manage roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text 
      AND role_id = 1
    )
  );

-- Permissions Policies
CREATE POLICY "Users can view permissions" ON permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Role Permissions Policies
CREATE POLICY "Users can view role permissions" ON role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Leave Requests Policies
CREATE POLICY "Users can view own leave requests" ON leave_requests
  FOR SELECT USING (
    employee_id IN (
      SELECT employee_id FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text 
      AND role_id IN (1, 2, 3)
    )
  );

CREATE POLICY "Users can create own leave requests" ON leave_requests
  FOR INSERT WITH CHECK (
    employee_id IN (
      SELECT employee_id FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own leave requests" ON leave_requests
  FOR UPDATE USING (
    employee_id IN (
      SELECT employee_id FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text 
      AND role_id IN (1, 2, 3)
    )
  );

-- Leave Types Policies
CREATE POLICY "Users can view leave types" ON leave_types
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage leave types" ON leave_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text 
      AND role_id IN (1, 2, 3)
    )
  );

-- Attendance Records Policies
CREATE POLICY "Users can view own attendance" ON attendance_records
  FOR SELECT USING (
    employee_id IN (
      SELECT employee_id FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text 
      AND role_id IN (1, 2, 3)
    )
  );

CREATE POLICY "Users can create own attendance" ON attendance_records
  FOR INSERT WITH CHECK (
    employee_id IN (
      SELECT employee_id FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text
    )
  );

-- User Sessions Policies
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (
    user_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text 
      AND role_id IN (1, 2)
    )
  );

CREATE POLICY "System can manage sessions" ON user_sessions
  FOR ALL WITH CHECK (true);

-- Failed Login Attempts Policies
CREATE POLICY "System can log failed attempts" ON failed_login_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view failed attempts" ON failed_login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_user_id = auth.uid()::text 
      AND role_id IN (1, 2)
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;