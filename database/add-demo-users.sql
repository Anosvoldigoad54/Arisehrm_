-- ========================================
-- ARISE HRM - DEMO USERS INSERTION SCRIPT
-- ========================================
-- This script adds the specific demo users mentioned in the requirements
-- These users will work with both demo mode and Supabase authentication

-- First, let's make sure we have the required departments
INSERT INTO departments (id, name, code, created_at, updated_at) VALUES
('d001-0000-0000-0000-000000000001', 'Human Resources', 'HR', NOW(), NOW()),
('d002-0000-0000-0000-000000000001', 'Information Technology', 'IT', NOW(), NOW()),
('d003-0000-0000-0000-000000000001', 'External Contractors', 'EXT', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Make sure we have the required positions
INSERT INTO positions (id, title, code, level, created_at, updated_at) VALUES
('p001-0000-0000-0000-000000000001', 'System Administrator', 'SA', 'Executive', NOW(), NOW()),
('p002-0000-0000-0000-000000000001', 'HR Manager', 'HRM', 'Manager', NOW(), NOW()),
('p003-0000-0000-0000-000000000001', 'Department Head', 'DH', 'Manager', NOW(), NOW()),
('p004-0000-0000-0000-000000000001', 'Team Lead', 'TL', 'Lead', NOW(), NOW()),
('p005-0000-0000-0000-000000000001', 'Software Engineer', 'SE', 'Mid', NOW(), NOW()),
('p006-0000-0000-0000-000000000001', 'Contractor', 'CTR', 'Mid', NOW(), NOW()),
('p007-0000-0000-0000-000000000001', 'Intern', 'INT', 'Junior', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Insert the specific demo users into user_profiles table
-- Note: In a real implementation with Supabase Auth, these would be created via the auth system
-- But for demo purposes, we can insert them directly

-- Super Admin
INSERT INTO user_profiles (
    id, 
    employee_id, 
    email, 
    first_name, 
    last_name, 
    display_name, 
    role_id, 
    department_id, 
    position_id, 
    employment_status, 
    employment_type, 
    hire_date, 
    salary, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'u001-0000-0000-0000-000000000001',
    'test-superadmin-1',
    'superadmin@arisehrm.test',
    'Super',
    'Admin',
    'Super Admin',
    1, -- super_admin role
    'd001-0000-0000-0000-000000000001', -- HR department
    'p001-0000-0000-0000-000000000001', -- System Administrator position
    'active',
    'full_time',
    '2024-01-01',
    120000.00,
    true,
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    role_id = EXCLUDED.role_id,
    department_id = EXCLUDED.department_id,
    position_id = EXCLUDED.position_id,
    employment_status = EXCLUDED.employment_status,
    employment_type = EXCLUDED.employment_type,
    hire_date = EXCLUDED.hire_date,
    salary = EXCLUDED.salary,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- HR Manager
INSERT INTO user_profiles (
    id, 
    employee_id, 
    email, 
    first_name, 
    last_name, 
    display_name, 
    role_id, 
    department_id, 
    position_id, 
    employment_status, 
    employment_type, 
    hire_date, 
    salary, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'u002-0000-0000-0000-000000000001',
    'test-hrmanager-1',
    'hr.manager@arisehrm.test',
    'HR',
    'Manager',
    'HR Manager',
    2, -- hr_manager role
    'd001-0000-0000-0000-000000000001', -- HR department
    'p002-0000-0000-0000-000000000001', -- HR Manager position
    'active',
    'full_time',
    '2024-01-01',
    95000.00,
    true,
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    role_id = EXCLUDED.role_id,
    department_id = EXCLUDED.department_id,
    position_id = EXCLUDED.position_id,
    employment_status = EXCLUDED.employment_status,
    employment_type = EXCLUDED.employment_type,
    hire_date = EXCLUDED.hire_date,
    salary = EXCLUDED.salary,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Department Head
INSERT INTO user_profiles (
    id, 
    employee_id, 
    email, 
    first_name, 
    last_name, 
    display_name, 
    role_id, 
    department_id, 
    position_id, 
    employment_status, 
    employment_type, 
    hire_date, 
    salary, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'u003-0000-0000-0000-000000000001',
    'test-deptmanager-1',
    'dept.manager@arisehrm.test',
    'Department',
    'Head',
    'Department Head',
    3, -- department_manager role
    'd002-0000-0000-0000-000000000001', -- IT department
    'p003-0000-0000-0000-000000000001', -- Department Head position
    'active',
    'full_time',
    '2024-01-01',
    85000.00,
    true,
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    role_id = EXCLUDED.role_id,
    department_id = EXCLUDED.department_id,
    position_id = EXCLUDED.position_id,
    employment_status = EXCLUDED.employment_status,
    employment_type = EXCLUDED.employment_type,
    hire_date = EXCLUDED.hire_date,
    salary = EXCLUDED.salary,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Team Lead
INSERT INTO user_profiles (
    id, 
    employee_id, 
    email, 
    first_name, 
    last_name, 
    display_name, 
    role_id, 
    department_id, 
    position_id, 
    employment_status, 
    employment_type, 
    hire_date, 
    salary, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'u004-0000-0000-0000-000000000001',
    'test-teamlead-1',
    'team.lead@arisehrm.test',
    'Team',
    'Lead',
    'Team Lead',
    4, -- team_lead role
    'd002-0000-0000-0000-000000000001', -- IT department
    'p004-0000-0000-0000-000000000001', -- Team Lead position
    'active',
    'full_time',
    '2024-01-01',
    75000.00,
    true,
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    role_id = EXCLUDED.role_id,
    department_id = EXCLUDED.department_id,
    position_id = EXCLUDED.position_id,
    employment_status = EXCLUDED.employment_status,
    employment_type = EXCLUDED.employment_type,
    hire_date = EXCLUDED.hire_date,
    salary = EXCLUDED.salary,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Employee
INSERT INTO user_profiles (
    id, 
    employee_id, 
    email, 
    first_name, 
    last_name, 
    display_name, 
    role_id, 
    department_id, 
    position_id, 
    employment_status, 
    employment_type, 
    hire_date, 
    salary, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'u005-0000-0000-0000-000000000001',
    'test-employee-1',
    'employee@arisehrm.test',
    'Employee',
    'Test',
    'Employee Test',
    5, -- employee role
    'd002-0000-0000-0000-000000000001', -- IT department
    'p005-0000-0000-0000-000000000001', -- Software Engineer position
    'active',
    'full_time',
    '2024-01-01',
    65000.00,
    true,
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    role_id = EXCLUDED.role_id,
    department_id = EXCLUDED.department_id,
    position_id = EXCLUDED.position_id,
    employment_status = EXCLUDED.employment_status,
    employment_type = EXCLUDED.employment_type,
    hire_date = EXCLUDED.hire_date,
    salary = EXCLUDED.salary,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Contractor
INSERT INTO user_profiles (
    id, 
    employee_id, 
    email, 
    first_name, 
    last_name, 
    display_name, 
    role_id, 
    department_id, 
    position_id, 
    employment_status, 
    employment_type, 
    hire_date, 
    salary, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'u006-0000-0000-0000-000000000001',
    'test-contractor-1',
    'contractor@arisehrm.test',
    'Contractor',
    'Test',
    'Contractor Test',
    6, -- contractor role (custom role)
    'd003-0000-0000-0000-000000000001', -- External Contractors department
    'p006-0000-0000-0000-000000000001', -- Contractor position
    'active',
    'contract',
    '2024-01-01',
    50000.00,
    true,
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    role_id = EXCLUDED.role_id,
    department_id = EXCLUDED.department_id,
    position_id = EXCLUDED.position_id,
    employment_status = EXCLUDED.employment_status,
    employment_type = EXCLUDED.employment_type,
    hire_date = EXCLUDED.hire_date,
    salary = EXCLUDED.salary,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Intern
INSERT INTO user_profiles (
    id, 
    employee_id, 
    email, 
    first_name, 
    last_name, 
    display_name, 
    role_id, 
    department_id, 
    position_id, 
    employment_status, 
    employment_type, 
    hire_date, 
    salary, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'u007-0000-0000-0000-000000000001',
    'test-intern-1',
    'intern@arisehrm.test',
    'Intern',
    'Test',
    'Intern Test',
    7, -- intern role (custom role)
    'd002-0000-0000-0000-000000000001', -- IT department
    'p007-0000-0000-0000-000000000001', -- Intern position
    'active',
    'intern',
    '2024-01-01',
    25000.00,
    true,
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    role_id = EXCLUDED.role_id,
    department_id = EXCLUDED.department_id,
    position_id = EXCLUDED.position_id,
    employment_status = EXCLUDED.employment_status,
    employment_type = EXCLUDED.employment_type,
    hire_date = EXCLUDED.hire_date,
    salary = EXCLUDED.salary,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Create a script to add these users to Supabase Auth (if needed)
-- This would typically be run separately using the create-super-admin-users.ts script
-- But for reference, here are the credentials that should work with demo mode:

/*
DEMO USER CREDENTIALS (These work with demo mode without database setup):
================================================
Role: Super Admin
Email: superadmin@arisehrm.test
Password: Test@1234
User ID: test-superadmin-1

Role: HR Manager
Email: hr.manager@arisehrm.test
Password: Hr@1234
User ID: test-hrmanager-1

Role: Department Head
Email: dept.manager@arisehrm.test
Password: Dept@1234
User ID: test-deptmanager-1

Role: Team Lead
Email: team.lead@arisehrm.test
Password: Lead@1234
User ID: test-teamlead-1

Role: Employee
Email: employee@arisehrm.test
Password: Emp@1234
User ID: test-employee-1

Role: Contractor
Email: contractor@arisehrm.test
Password: Contract@123
User ID: test-contractor-1

Role: Intern
Email: intern@arisehrm.test
Password: Intern@123
User ID: test-intern-1
*/

COMMIT;