# 🔐 How to Fix "Row Level Security is Blocking Database Access" Error

This document provides a step-by-step guide to resolve the RLS error and enable live data access in AriseHRM.

## 📋 Problem Summary

You're seeing this error message:
> "Row Level Security is blocking database access. The app is using fallback data for demonstration."

This happens when the application cannot access the database due to:
1. Incorrect environment configuration
2. Missing or conflicting RLS policies
3. Incomplete database setup

## ✅ Solution Overview

To fix this issue, you need to:

1. **Update Environment Configuration**
2. **Run Database Setup Scripts**
3. **Verify the Fix**

## 🔧 Step-by-Step Fix

### Step 1: Update Environment Configuration

Edit `frontend/.env` and ensure these settings are correct:

```env
# Set to 'false' to disable demo mode
VITE_DEMO_MODE=false

# Set to 'false' to disable fallback data
VITE_USE_FALLBACK_DATA=false

# Set to 'false' to enable RLS
VITE_ENABLE_RLS_BYPASS=false
```

### Step 2: Run Database Setup

You have two options:

#### Option A: Run the Complete Setup Script (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/setup-database.sql`
4. Run the script

This will execute all setup steps in the correct order.

#### Option B: Run Each Script Separately

1. **Initialize Database Schema**
   - In the Supabase SQL Editor, open a new query
   - Copy and paste the contents of `database/init-schema.sql`
   - Run the script

2. **Apply Complete RLS Policies**
   - In the Supabase SQL Editor, create a new query
   - Copy and paste the contents of `database/complete-rls-policies.sql`
   - Run the script

3. **Add Demo Users (Optional)**
   - In the Supabase SQL Editor, create a new query
   - Copy and paste the contents of `database/add-demo-users.sql`
   - Run the script

### Step 3: Verify the Fix

Run these verification queries in the Supabase SQL Editor:

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'departments', 'positions', 'roles')
ORDER BY table_name;

-- Check if RLS is enabled on key tables
SELECT tablename, relrowsecurity 
FROM pg_class c 
JOIN pg_namespace n ON c.relnamespace = n.oid 
WHERE n.nspname = 'public' 
AND relrowsecurity = true
AND tablename IN ('user_profiles', 'departments', 'positions', 'roles')
ORDER BY tablename;

-- Check if demo users were added
SELECT email, display_name, role_id 
FROM user_profiles 
WHERE email IN ('superadmin@arisehrm.test', 'hr.manager@arisehrm.test', 'dept.manager@arisehrm.test')
ORDER BY role_id;
```

### Step 4: Test the Application

1. Restart your development server:

   **For Windows PowerShell users:**
   ```powershell
   # Use the provided PowerShell script (avoids && operator issues)
   .\start-dev.ps1
   
   # Or use semicolon instead of &&:
   cd frontend; npm run dev
   ```
   
   **For Command Prompt users:**
   ```cmd
   # Use the provided batch file:
   start-dev.bat
   ```
   
   **For Git Bash/Bash users:**
   ```bash
   cd frontend && npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Log in with one of the demo accounts:
   - Super Admin: superadmin@arisehrm.test / Test@1234
   - HR Manager: hr.manager@arisehrm.test / Hr@1234
   - Department Head: dept.manager@arisehrm.test / Dept@1234
   - Team Lead: team.lead@arisehrm.test / Lead@1234
   - Employee: employee@arisehrm.test / Emp@1234
   - Contractor: contractor@arisehrm.test / Contract@123
   - Intern: intern@arisehrm.test / Intern@123

## 🎯 Expected Results

After completing these steps, you should see:
- ✅ No more "Row Level Security is blocking database access" messages
- ✅ Live data loading in all sections of the application
- ✅ Ability to create, read, update, and delete records
- ✅ Proper role-based access control
- ✅ No fallback to demo data

## 🔍 Troubleshooting

### If You Still See the Error

1. **Double-check environment variables**
   - Confirm `VITE_DEMO_MODE=false`
   - Confirm `VITE_USE_FALLBACK_DATA=false`
   - Confirm `VITE_ENABLE_RLS_BYPASS=false`

2. **Verify database setup**
   - Check that all SQL scripts ran without errors
   - Confirm RLS policies are applied to all tables
   - Verify demo users were created

3. **Clear browser cache**
   - Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
   - Clear localStorage and sessionStorage
   - Restart the development server

4. **Check Supabase configuration**
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
   - Check Supabase project settings

### Common Issues and Solutions

#### Issue: "policy already exists" error
**Solution**: The updated SQL scripts now include `DROP POLICY IF EXISTS` statements to prevent this error.

#### Issue: "trigger already exists" error
**Solution**: The updated `init-schema.sql` now includes enhanced trigger handling with `DROP TRIGGER IF EXISTS` statements wrapped in a DO block for better compatibility.

#### Issue: "infinite recursion detected in policy" error
**Solution**: This is a known issue with the user_profiles RLS policies. We've fixed this by updating the policies to avoid recursive references. 

To apply the fix:
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/complete-rls-policies.sql`
4. Run the script

Alternatively, refer to [APPLY_RLS_FIXES.md](APPLY_RLS_FIXES.md) for detailed instructions on applying just the recursion fix.

#### Issue: Cannot log in with demo credentials
**Solution**: 
1. Verify the demo users were created by running the verification query
2. Check that the user_profiles table has the correct role_id values
3. Ensure the email and password match the credentials in `.env`

#### Issue: Still seeing fallback data
**Solution**:
1. Confirm `VITE_DEMO_MODE=false` and `VITE_USE_FALLBACK_DATA=false`
2. Restart the development server
3. Clear browser cache and localStorage

#### Issue: PowerShell "&&" operator error
**Solution**: Windows PowerShell uses `;` instead of `&&` as a statement separator. Use one of these alternatives:
```powershell
# Option 1: Use semicolon instead
cd frontend; npm run dev

# Option 2: Use the provided PowerShell script
.\start-dev.ps1

# Option 3: Run commands separately
cd frontend
npm run dev
```

## 📁 Files That Were Modified

To fix this issue, the following files were updated:

1. `frontend/.env` - Environment configuration
2. `database/init-schema.sql` - Database schema with RLS and trigger fixes
3. `database/complete-rls-policies.sql` - RLS policies with conflict prevention and recursion fixes
4. `database/setup-database.sql` - Updated master setup script
5. `README.md` - Updated to reference new setup guide and PowerShell instructions
6. `RUN_DATABASE_SETUP.md` - Updated setup guide
7. `RLS_ERROR_RESOLUTION.md` - This file with latest troubleshooting information
8. `APPLY_RLS_FIXES.md` - New documentation for applying RLS recursion fixes
9. `start-dev.ps1` - PowerShell script to start development server
10. `start-dev.bat` - Batch script to start development server

## 📞 Support

If you continue to experience issues after following these steps:

1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Ensure the database setup completed without errors
4. Contact support with detailed error information

## 🎉 Success!

Once you've completed these steps successfully, your AriseHRM application will be fully functional with:
- Real-time database connectivity
- Proper role-based access control
- No more fallback to demo data
- Smooth authentication flow
- Full CRUD operations on all entities