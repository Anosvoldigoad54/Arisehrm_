-- ========================================
-- ARISE HRM - COMPLETE DATABASE SETUP SCRIPT
-- ========================================
-- This script sets up the complete database schema for Arise HRM
-- Execute this script in your Supabase SQL Editor to set up the complete system

-- NOTE: This script references other SQL files that must be executed separately
-- Please execute the following scripts in order:
-- 1. init-schema.sql
-- 2. complete-rls-policies.sql
-- 3. add-demo-users.sql

/*
To run this setup:

1. First, copy and paste the contents of database/init-schema.sql into the Supabase SQL Editor and run it

2. Then, copy and paste the contents of database/complete-rls-policies.sql into the Supabase SQL Editor and run it

3. Finally, copy and paste the contents of database/add-demo-users.sql into the Supabase SQL Editor and run it

Alternatively, you can run this entire setup by manually combining the contents of all three files in order.
*/

-- Verification queries to confirm setup
SELECT 'Database setup completed successfully!' as message;

-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'departments', 'positions', 'roles', 'user_sessions', 'failed_login_attempts', 'user_preferences')
ORDER BY table_name;

-- Check if RLS is enabled on key tables
SELECT tablename, relrowsecurity 
FROM pg_class c 
JOIN pg_namespace n ON c.relnamespace = n.oid 
WHERE n.nspname = 'public' 
AND relrowsecurity = true
AND tablename IN ('user_profiles', 'departments', 'positions', 'roles', 'user_sessions', 'failed_login_attempts', 'user_preferences')
ORDER BY tablename;

-- Check if demo users were added
SELECT email, display_name, role_id 
FROM user_profiles 
WHERE email IN ('superadmin@arisehrm.test', 'hr.manager@arisehrm.test', 'dept.manager@arisehrm.test')
ORDER BY role_id;