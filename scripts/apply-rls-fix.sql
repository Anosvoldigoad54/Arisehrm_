-- Apply RLS fixes for user_profiles table to resolve recursion issue

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "HR can view all profiles" ON user_profiles;

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