-- ===================================================================
-- RLS POLICY FIXES FOR ARISE HRM AUTHENTICATION
-- ===================================================================
-- This script fixes Row Level Security policies that are blocking authentication

-- ===================================================================
-- 1. PERMISSIONS TABLE - Critical for role-based access
-- ===================================================================

-- Enable RLS for permissions table
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all permissions
CREATE POLICY "authenticated_users_can_read_permissions" ON permissions
    FOR SELECT 
    TO authenticated
    USING (true);

-- Allow service role and admins to manage permissions
CREATE POLICY "service_role_can_manage_permissions" ON permissions
    FOR ALL
    TO service_role
    USING (true);

-- ===================================================================
-- 2. USER_PERMISSIONS TABLE - Essential for user access control
-- ===================================================================

-- Enable RLS for user_permissions table
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Users can read their own permissions
CREATE POLICY "users_can_read_own_permissions" ON user_permissions
    FOR SELECT 
    TO authenticated
    USING (user_id = auth.uid());

-- Allow reading permissions for user profiles (for authorization)
CREATE POLICY "authenticated_can_read_user_permissions" ON user_permissions
    FOR SELECT 
    TO authenticated
    USING (true);

-- Service role can manage all permissions
CREATE POLICY "service_role_can_manage_user_permissions" ON user_permissions
    FOR ALL
    TO service_role
    USING (true);

-- ===================================================================
-- 3. ROLES TABLE - Ensure proper role access
-- ===================================================================

-- Clean up duplicate policies and ensure proper access
DROP POLICY IF EXISTS "roles_read_policy" ON roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON roles;
DROP POLICY IF EXISTS "Authenticated users can read roles" ON roles;

-- Unified role read policy
CREATE POLICY "unified_roles_read_policy" ON roles
    FOR SELECT 
    TO authenticated
    USING (true);

-- Allow service role to manage roles
CREATE POLICY "service_role_can_manage_roles" ON roles
    FOR ALL
    TO service_role
    USING (true);

-- ===================================================================
-- 4. USER_PROFILES TABLE - Clean up duplicate policies
-- ===================================================================

-- Remove duplicate policies
DROP POLICY IF EXISTS "Allow all authenticated users to read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read all active profiles" ON user_profiles;

-- Simplified user profiles policies
CREATE POLICY "users_can_read_profiles" ON user_profiles
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "users_can_insert_own_profile" ON user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Service role full access
CREATE POLICY "service_role_full_access_profiles" ON user_profiles
    FOR ALL
    TO service_role
    USING (true);

-- ===================================================================
-- 5. USER_SESSIONS TABLE - Critical for session management
-- ===================================================================

-- Clean up duplicate policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;

-- Users can manage their own sessions
CREATE POLICY "users_can_manage_own_sessions" ON user_sessions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Service role can manage all sessions
CREATE POLICY "service_role_can_manage_sessions" ON user_sessions
    FOR ALL
    TO service_role
    USING (true);

-- System can create sessions for authentication
CREATE POLICY "system_can_create_sessions" ON user_sessions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- ===================================================================
-- 6. DEPARTMENTS TABLE - Clean up duplicate policies
-- ===================================================================

-- Remove duplicate policies
DROP POLICY IF EXISTS "departments_access_policy" ON departments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON departments;
DROP POLICY IF EXISTS "Authenticated users can read departments" ON departments;

-- Unified department access
CREATE POLICY "authenticated_can_read_departments" ON departments
    FOR SELECT 
    TO authenticated
    USING (true);

-- Service role can manage departments
CREATE POLICY "service_role_can_manage_departments" ON departments
    FOR ALL
    TO service_role
    USING (true);

-- ===================================================================
-- 7. POSITIONS TABLE - Clean up duplicate policies
-- ===================================================================

-- Remove duplicate policies
DROP POLICY IF EXISTS "Authenticated users can read positions" ON positions;
DROP POLICY IF EXISTS "Users can view positions" ON positions;

-- Unified position access
CREATE POLICY "authenticated_can_read_positions" ON positions
    FOR SELECT 
    TO authenticated
    USING (true);

-- Service role can manage positions
CREATE POLICY "service_role_can_manage_positions" ON positions
    FOR ALL
    TO service_role
    USING (true);

-- ===================================================================
-- 8. ENABLE PROPER RLS ON CRITICAL TABLES
-- ===================================================================

-- Make sure RLS is enabled on all critical auth tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 9. EMERGENCY AUTHENTICATION BYPASS (Temporary)
-- ===================================================================

-- If authentication is completely broken, temporarily allow broader access
-- UNCOMMENT THESE LINES ONLY IF AUTHENTICATION COMPLETELY FAILS:

-- CREATE POLICY "emergency_auth_bypass" ON user_profiles
--     FOR SELECT 
--     TO anon, authenticated
--     USING (true);

-- CREATE POLICY "emergency_session_bypass" ON user_sessions
--     FOR ALL
--     TO anon, authenticated
--     USING (true);

-- ===================================================================
-- 10. VERIFICATION QUERIES
-- ===================================================================

-- Run these queries after applying the policies to verify they work:

-- Check if policies exist
-- SELECT schemaname, tablename, policyname, cmd, roles 
-- FROM pg_policies 
-- WHERE tablename IN ('user_profiles', 'user_sessions', 'roles', 'permissions', 'user_permissions')
-- ORDER BY tablename, policyname;

-- Test user profile access (replace with actual UUID)
-- SELECT * FROM user_profiles WHERE id = 'your-user-uuid-here';

-- Test permission access
-- SELECT * FROM permissions LIMIT 5;

-- Test role access  
-- SELECT * FROM roles LIMIT 5;

COMMIT;
