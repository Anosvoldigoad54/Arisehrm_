# Database Setup Guide for Arise HRM

## Overview
Complete PostgreSQL/Supabase database schema for the Arise HRM system with 70+ tables covering all features.

## Quick Start - Supabase Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. **Login to Supabase**
   - Go to https://supabase.com/dashboard
   - Select your project: `jbsbdjbfvhekkkznujrs`

2. **Run Schema**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy the entire contents of `/app/database/COMPLETE_SCHEMA.sql`
   - Paste into the SQL editor
   - Click "Run" or press `Ctrl+Enter`

3. **Verify Installation**
   ```sql
   -- Check tables created
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   
   -- Check default roles
   SELECT * FROM public.roles ORDER BY level DESC;
   
   -- Check leave types
   SELECT * FROM public.leave_types;
   ```

### Option 2: Using Command Line (psql)

```bash
# If you have psql installed and connection string
psql "postgresql://postgres.[YOUR-PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -f /app/database/COMPLETE_SCHEMA.sql
```

## Database Structure

### Core Modules (19 sections)

1. **ENUM Types** - 15 custom types for status, priority, ratings
2. **Core Users & Auth** - Authentication, roles, profiles, departments
3. **Teams & Organization** - Team management, hierarchies
4. **Attendance Management** - Shifts, schedules, clock-ins, locations
5. **Leave Management** - Leave types, requests, balances, approvals
6. **Payroll & Compensation** - Salary components, payslips, bonuses
7. **Performance Management** - Reviews, goals, feedback, ratings
8. **Recruitment & Hiring** - Job postings, candidates, interviews, offers
9. **Onboarding & Training** - Onboarding processes, training programs
10. **Projects & Tasks** - Project management, time tracking
11. **Benefits & Expenses** - Employee benefits, expense reports
12. **Documents & Compliance** - Document management, policies, audits
13. **Communication** - Announcements, messages, notifications
14. **Reports & Analytics** - Saved reports, exports
15. **Audit & System Logs** - Audit trails, system settings
16. **Performance Indexes** - 30+ indexes for query optimization
17. **Default Data** - Pre-populated reference data
18. **Functions & Triggers** - Auto-update timestamps
19. **Row Level Security** - Basic RLS policies (customize as needed)

### Total Objects Created

- **70+ Tables**
- **15 ENUM Types**
- **30+ Indexes**
- **Default Data**: Roles, Leave Types, Shifts, Salary Components, etc.
- **Triggers**: Auto-update timestamp triggers on all tables
- **Basic RLS Policies**: Security policies for sensitive tables

## Table Categories

### User Management (5 tables)
- `users` - Authentication
- `roles` - User roles and permissions
- `departments` - Organization departments
- `positions` - Job positions
- `user_profiles` - Employee profiles

### Attendance (7 tables)
- `shifts` - Work shifts
- `work_schedules` - Employee schedules
- `clock_locations` - Geofence locations
- `attendance_records` - Daily attendance
- `attendance_corrections` - Correction requests

### Leave (5 tables)
- `leave_types` - Types of leaves
- `employee_leave_balances` - Leave balances per employee
- `leave_requests` - Leave applications
- `leave_approvers` - Multi-level approvals
- `holidays` - Company holidays

### Payroll (8 tables)
- `salary_components` - Earnings/deductions
- `employee_salary_structure` - Individual salary structure
- `payroll_cycles` - Monthly payroll runs
- `payslips` - Employee payslips
- `bonuses` - Performance bonuses

### Performance (5 tables)
- `performance_review_templates` - Review templates
- `performance_reviews` - Employee reviews
- `performance_criteria_scores` - Detailed scores
- `goals` - Employee goals
- `feedback` - Peer feedback

### Recruitment (7 tables)
- `job_postings` - Job openings
- `candidates` - Job applicants
- `interviews` - Interview scheduling
- `interview_feedback` - Interviewer feedback
- `job_offers` - Offer letters

### Training (6 tables)
- `onboarding_templates` - Onboarding checklists
- `onboarding_processes` - Active onboarding
- `onboarding_tasks` - Checklist tasks
- `training_programs` - Training courses
- `training_sessions` - Scheduled sessions
- `training_enrollments` - Participant enrollments

### Projects (5 tables)
- `projects` - Project management
- `project_members` - Team members
- `project_tasks` - Task tracking
- `time_logs` - Time tracking

### Benefits & Expenses (6 tables)
- `benefit_plans` - Benefit programs
- `employee_benefits` - Enrolled benefits
- `expense_categories` - Expense types
- `expense_reports` - Expense submissions
- `expense_items` - Individual expenses

### Documents (5 tables)
- `document_categories` - Document types
- `documents` - Document repository
- `document_access_log` - Access tracking
- `compliance_policies` - Company policies
- `policy_acknowledgments` - Policy sign-offs
- `compliance_audits` - Audit records

### Communication (4 tables)
- `announcements` - Company announcements
- `announcement_reads` - Read receipts
- `messages` - Internal messaging
- `notifications` - System notifications

### System (4 tables)
- `saved_reports` - Custom reports
- `report_exports` - Report history
- `audit_logs` - Activity logs
- `system_settings` - Configuration
- `email_logs` - Email tracking

## Important Configuration Steps

### 1. Row Level Security (RLS)

The schema includes basic RLS policies. You should customize these:

```sql
-- Enable RLS on tables as needed
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY policy_name ON table_name
    FOR SELECT
    USING (your_condition);
```

### 2. Service Role Key for Backend

Your backend needs the **service_role** key (not anon key) to bypass RLS:

1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (secret)
3. Update `/app/backend/.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 3. Initial Admin User

Create your first admin user:

```sql
-- Insert admin user
INSERT INTO public.users (id, email, password_hash, is_active, is_verified)
VALUES (
  gen_random_uuid(),
  'admin@arisehrm.com',
  -- Use bcrypt hash of your password
  '$2a$10$...',
  true,
  true
);

-- Get the user ID
SELECT id FROM public.users WHERE email = 'admin@arisehrm.com';

-- Insert admin profile
INSERT INTO public.user_profiles (
  employee_id,
  auth_user_id,
  email,
  first_name,
  last_name,
  role_id,
  employment_status,
  is_active
) VALUES (
  'EMP-0001',
  'user-id-from-above',
  'admin@arisehrm.com',
  'System',
  'Administrator',
  1, -- super_admin role
  'active',
  true
);
```

### 4. Department Setup

Create your departments:

```sql
INSERT INTO public.departments (name, code, description)
VALUES
('Engineering', 'ENG', 'Engineering and Development'),
('Human Resources', 'HR', 'Human Resources Department'),
('Finance', 'FIN', 'Finance and Accounting'),
('Sales', 'SALES', 'Sales and Business Development'),
('Marketing', 'MKT', 'Marketing and Communications');
```

### 5. Position Setup

Create positions:

```sql
-- Get department IDs
SELECT id, name FROM public.departments;

-- Insert positions
INSERT INTO public.positions (title, code, department_id, level)
VALUES
('Software Engineer', 'SWE', 'eng-dept-id', 2),
('Senior Software Engineer', 'SSE', 'eng-dept-id', 3),
('HR Manager', 'HRM', 'hr-dept-id', 4),
('HR Executive', 'HRE', 'hr-dept-id', 2);
```

## Schema Maintenance

### Backup

```bash
# Backup entire database
pg_dump "connection-string" > backup.sql

# Backup specific tables
pg_dump "connection-string" -t public.users -t public.user_profiles > users_backup.sql
```

### Migrations

For future changes, create migration files:

```sql
-- Migration: Add new column
-- File: migrations/002_add_profile_pic.sql
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## Troubleshooting

### Issue: Permission Denied

**Solution**: Check RLS policies or use service_role key in backend

```sql
-- Temporarily disable RLS for testing
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Issue: Foreign Key Violations

**Solution**: Insert in correct order (parent tables first)
1. roles, departments, positions
2. users
3. user_profiles
4. Everything else

### Issue: Unique Constraint Violations

**Solution**: Check for duplicate codes/emails

```sql
-- Find duplicates
SELECT employee_id, COUNT(*) 
FROM public.user_profiles 
GROUP BY employee_id 
HAVING COUNT(*) > 1;
```

## Performance Tips

1. **Indexes are already created** for common queries
2. **Use pagination** for large datasets:
   ```sql
   SELECT * FROM table_name 
   ORDER BY created_at DESC 
   LIMIT 50 OFFSET 0;
   ```

3. **Use specific columns** instead of SELECT *:
   ```sql
   SELECT id, name, email FROM user_profiles;
   ```

4. **Monitor slow queries** in Supabase Dashboard → Database → Query Performance

## Next Steps

1. ✅ Run the complete schema
2. ✅ Verify all tables created
3. ✅ Create initial admin user
4. ✅ Set up departments and positions
5. ✅ Update backend to use service_role key
6. ✅ Configure RLS policies for your needs
7. ✅ Test basic CRUD operations
8. ✅ Start building features!

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- PostgreSQL docs: https://www.postgresql.org/docs/
- Review `/app/AUDIT_REPORT.md` for architecture details

---

**Schema Version**: 1.0.0  
**Last Updated**: November 2024  
**Compatible With**: PostgreSQL 12+, Supabase
