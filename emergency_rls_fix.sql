-- ===================================================================
-- EMERGENCY RLS FIX - TEMPORARY AUTHENTICATION BYPASS
-- ===================================================================
-- Use this ONLY if authentication is completely broken
-- This provides temporary broader access to fix authentication issues

-- ===================================================================
-- 1. TEMPORARY BYPASS FOR CRITICAL AUTH TABLES
-- ===================================================================

-- Temporarily allow broader access to user profiles
CREATE POLICY "emergency_user_profiles_access" ON user_profiles
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- Temporarily allow broader session access  
CREATE POLICY "emergency_sessions_access" ON user_sessions
    FOR ALL
    TO anon, authenticated
    USING (true);

-- Enable permissions table access
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emergency_permissions_access" ON permissions
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- Enable user_permissions table access
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emergency_user_permissions_access" ON user_permissions
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- Enable roles access
CREATE POLICY "emergency_roles_access" ON roles
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- ===================================================================
-- 2. VERIFICATION
-- ===================================================================

-- Test these queries to verify access:
-- SELECT COUNT(*) FROM user_profiles;
-- SELECT COUNT(*) FROM permissions; 
-- SELECT COUNT(*) FROM roles;
-- SELECT COUNT(*) FROM user_permissions;

COMMIT;

-- ===================================================================
-- IMPORTANT SECURITY NOTE:
-- ===================================================================
-- These policies provide broad access and should be replaced with 
-- proper restrictive policies once authentication is working.
-- 
-- After authentication works, run the main fix_rls_policies.sql
-- to implement proper security policies.
-- ===================================================================
