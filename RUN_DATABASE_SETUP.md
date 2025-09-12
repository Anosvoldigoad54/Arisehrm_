# ▶️ How to Run Database Setup for AriseHRM

This document provides instructions for setting up the AriseHRM database with Supabase.

## 📋 Prerequisites

1. A Supabase account ([Sign up](https://supabase.com/))
2. A new Supabase project created
3. Your project's URL and anon key (found in Project Settings > API)

## 🚀 Setup Instructions

### Step 1: Update Environment Variables

Before running any database scripts, ensure your `frontend/.env` file is correctly configured:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Mode Settings (IMPORTANT: These must be set to false for live data)
VITE_DEMO_MODE=false
VITE_USE_FALLBACK_DATA=false
VITE_ENABLE_RLS_BYPASS=false
```

### Step 2: Run Database Setup Scripts

Due to limitations in the Supabase SQL Editor, you need to run each script separately:

#### Script 1: Initialize Database Schema
1. In the Supabase SQL Editor, open a new query
2. Copy and paste the contents of `database/init-schema.sql`
3. Run the script

#### Script 2: Apply Complete RLS Policies
1. In the Supabase SQL Editor, create a new query
2. Copy and paste the contents of `database/complete-rls-policies.sql`
3. Run the script

#### Script 3: Add Demo Users (Optional)
1. In the Supabase SQL Editor, create a new query
2. Copy and paste the contents of `database/add-demo-users.sql`
3. Run the script

### Step 3: Apply RLS Recursion Fix (IMPORTANT)

If you encounter the "infinite recursion detected in policy for relation 'user_profiles'" error, you must apply the RLS fix:

1. In the Supabase SQL Editor, create a new query
2. Copy and paste the contents of `scripts/apply-rls-fix.sql`
3. Run the script

Alternatively, refer to [FINAL_RLS_FIX_INSTRUCTIONS.md](FINAL_RLS_FIX_INSTRUCTIONS.md) for detailed instructions.

### Step 4: Verify Setup

Run the verification script to confirm everything is working:

**PowerShell (Windows):**
```powershell
cd scripts
npx tsx verify-setup.ts
```

**Command Prompt (Windows):**
```cmd
cd scripts
npx tsx verify-setup.ts
```

**Git Bash/Bash (Mac/Linux):**
```bash
cd scripts && npx tsx verify-setup.ts
```

### Step 5: Start the Development Server

Use the appropriate command for your shell:

**PowerShell (Windows):**
```powershell
# Option 1: Use the provided PowerShell script
.\start-dev.ps1

# Option 2: Use semicolon separator
cd frontend; npm run dev
```

**Command Prompt (Windows):**
```cmd
# Use the provided batch file
start-dev.bat
```

**Git Bash/Bash (Mac/Linux):**
```bash
cd frontend && npm run dev
```

## ✅ Expected Results

After completing these steps, you should see:
- ✅ Database tables created successfully
- ✅ RLS policies applied to all tables
- ✅ Demo users created (if you ran add-demo-users.sql)
- ✅ Verification script runs without errors
- ✅ Development server starts successfully

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Issue: "type already exists" errors
**Solution**: The updated `init-schema.sql` now includes conditional type creation to prevent this error.

#### Issue: "policy already exists" errors
**Solution**: The updated SQL scripts now include `DROP POLICY IF EXISTS` statements to prevent this error.

#### Issue: "trigger already exists" errors
**Solution**: The updated `init-schema.sql` now includes enhanced trigger handling with `DROP TRIGGER IF EXISTS` statements.

#### Issue: "infinite recursion detected in policy" errors
**Solution**: Apply the RLS recursion fix as described in Step 3 above.

#### Issue: PowerShell "&&" operator error
**Solution**: Use `;` instead of `&&` in PowerShell, or use the provided scripts:
- `start-dev.ps1` for PowerShell
- `start-dev.bat` for Command Prompt

### Verification Queries

If you want to manually verify your setup, run these queries in the Supabase SQL Editor:

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

-- Check if demo users were added (if you ran add-demo-users.sql)
SELECT email, display_name, role_id 
FROM user_profiles 
WHERE email IN ('superadmin@arisehrm.test', 'hr.manager@arisehrm.test', 'dept.manager@arisehrm.test')
ORDER BY role_id;
```

## 📁 Files Reference

- `database/init-schema.sql` - Creates database tables and initial data
- `database/complete-rls-policies.sql` - Applies RLS policies to all tables
- `database/add-demo-users.sql` - Creates demo user accounts
- `scripts/verify-setup.ts` - Verifies the setup is correct
- `scripts/apply-rls-fix.sql` - Fixes RLS recursion issues
- `start-dev.ps1` - PowerShell script to start development server
- `start-dev.bat` - Batch script to start development server
- `FINAL_RLS_FIX_INSTRUCTIONS.md` - Complete fix instructions
- `RLS_ERROR_RESOLUTION.md` - Troubleshooting guide

## 📞 Support

If you continue to experience issues:

1. Check that all environment variables are set correctly
2. Ensure all SQL scripts ran without errors
3. Verify that RLS policies are applied to all tables
4. Confirm demo users were created (if needed)
5. Refer to the troubleshooting documentation

## 🎉 Success!

Once you've completed these steps successfully, your AriseHRM database will be fully configured with:
- All required tables created
- Proper RLS policies applied
- Demo users available (if added)
- Real-time database connectivity
- No more fallback to demo data