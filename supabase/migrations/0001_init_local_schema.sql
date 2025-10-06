-- Initial local schema for Arise HRM (minimal columns used by the app)
-- Safe to run on a fresh local Supabase instance

-- Extensions
create extension if not exists pgcrypto;

-- AUTH --------------------------------------------------------
create table if not exists auth_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Core reference tables
create table if not exists departments (
  id bigserial primary key,
  name text not null unique,
  code text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists roles (
  id bigserial primary key,
  name text not null unique,
  display_name text,
  level integer default 10,
  permissions jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists positions (
  id bigserial primary key,
  title text not null,
  code text,
  level text,
  department_id bigint references departments(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists teams (
  id bigserial primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- Users and profiles
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth_users(id) on delete set null,
  employee_id text unique,
  email text unique,
  first_name text,
  last_name text,
  display_name text,
  phone text,
  address text,
  emergency_contact text,
  employment_type text,
  hire_date date,
  salary numeric(12,2),
  status text default 'active',
  is_active boolean default true,
  department_id bigint references departments(id) on delete set null,
  position_id bigint references positions(id) on delete set null,
  role_id bigint references roles(id) on delete set null,
  manager_employee_id text,
  team_id bigint references teams(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_user_profiles_email on user_profiles(email);
create index if not exists idx_user_profiles_employee_id on user_profiles(employee_id);

create table if not exists user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  token text,
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table if not exists failed_login_attempts (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete set null,
  attempted_at timestamptz default now(),
  reason text
);

create table if not exists temporary_passwords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  token text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists user_preferences (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade,
  key text not null,
  value jsonb default 'null'::jsonb,
  created_at timestamptz default now(),
  unique(user_id, key)
);

create table if not exists user_themes (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade,
  theme text default 'light',
  created_at timestamptz default now()
);

-- Attendance
create table if not exists attendance_records (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade,
  employee_id text,
  date date not null,
  status text default 'present',
  clock_in timestamptz,
  clock_out timestamptz,
  break_start timestamptz,
  break_end timestamptz,
  total_hours numeric(8,2),
  overtime_hours numeric(8,2),
  is_approved boolean default false,
  approved_by uuid references user_profiles(id) on delete set null,
  approved_at timestamptz,
  notes text,
  location_in text,
  location_out text,
  ip_address_in text,
  ip_address_out text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, date)
);
create index if not exists idx_attendance_user_date on attendance_records(user_id, date);

-- Leave management
create table if not exists leave_types (
  id bigserial primary key,
  name text not null unique,
  code text,
  description text,
  max_days_per_year integer default 0,
  is_paid boolean default true,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists leave_balances (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade,
  leave_type_id bigint references leave_types(id) on delete cascade,
  year integer default extract(year from now()),
  total_allocated numeric(8,2) default 0,
  used_days numeric(8,2) default 0,
  pending_days numeric(8,2) default 0,
  remaining_days numeric(8,2) default 0,
  carried_forward numeric(8,2) default 0,
  updated_at timestamptz default now(),
  unique(user_id, leave_type_id, year)
);

create table if not exists leave_requests (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade,
  employee_id text,
  leave_type_id bigint references leave_types(id) on delete set null,
  start_date date not null,
  end_date date not null,
  days_requested numeric(8,2),
  status text default 'pending',
  reason text,
  is_half_day boolean default false,
  half_day_period text,
  approved_by uuid references user_profiles(id) on delete set null,
  approved_at timestamptz,
  reviewed_by uuid references user_profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_leave_requests_user on leave_requests(user_id);

-- Payroll
create table if not exists salary_structures (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade,
  base_salary numeric(12,2) default 0,
  allowances numeric(12,2) default 0,
  deductions numeric(12,2) default 0,
  effective_from date default current_date,
  created_at timestamptz default now()
);

create table if not exists payroll_records (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_pay numeric(12,2) default 0,
  net_pay numeric(12,2) default 0,
  status text default 'generated',
  created_at timestamptz default now()
);
create index if not exists idx_payroll_user_period on payroll_records(user_id, period_start, period_end);

-- Documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  path text,
  owner_id uuid references user_profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists document_acknowledgments (
  id bigserial primary key,
  document_id uuid references documents(id) on delete cascade,
  user_id uuid references user_profiles(id) on delete cascade,
  acknowledged_at timestamptz default now(),
  unique(document_id, user_id)
);

create table if not exists document_access_logs (
  id bigserial primary key,
  document_id uuid references documents(id) on delete cascade,
  user_id uuid references user_profiles(id) on delete set null,
  action text,
  created_at timestamptz default now()
);

-- Training
create table if not exists training_programs (
  id bigserial primary key,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists training_sessions (
  id bigserial primary key,
  program_id bigint references training_programs(id) on delete cascade,
  scheduled_at timestamptz,
  duration_minutes integer,
  created_at timestamptz default now()
);

create table if not exists training_enrollments (
  id bigserial primary key,
  session_id bigint references training_sessions(id) on delete cascade,
  user_id uuid references user_profiles(id) on delete cascade,
  status text default 'enrolled',
  created_at timestamptz default now(),
  unique(session_id, user_id)
);

-- Performance
create table if not exists goals (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade,
  title text not null,
  description text,
  status text default 'open',
  due_date date,
  created_at timestamptz default now()
);

create table if not exists performance_reviews (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade,
  period text,
  score numeric(4,2),
  comments text,
  created_at timestamptz default now()
);

-- Notifications & auditing
create table if not exists notifications (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade,
  recipient_id uuid references user_profiles(id) on delete cascade,
  message text not null,
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete set null,
  action text not null,
  resource_type text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Idempotent alignment for existing tables (safe ALTERs)
alter table if exists user_profiles add column if not exists auth_user_id uuid references auth_users(id) on delete set null;
alter table if exists user_profiles add column if not exists employee_id text;
alter table if exists user_profiles add column if not exists first_name text;
alter table if exists user_profiles add column if not exists last_name text;
alter table if exists user_profiles add column if not exists display_name text;
alter table if exists user_profiles add column if not exists phone text;
alter table if exists user_profiles add column if not exists address text;
alter table if exists user_profiles add column if not exists emergency_contact text;
alter table if exists user_profiles add column if not exists employment_type text;
alter table if exists user_profiles add column if not exists hire_date date;
alter table if exists user_profiles add column if not exists salary numeric(12,2);
alter table if exists user_profiles add column if not exists status text default 'active';
alter table if exists user_profiles add column if not exists is_active boolean default true;
alter table if exists user_profiles add column if not exists manager_employee_id text;
alter table if exists user_profiles add column if not exists updated_at timestamptz default now();

alter table if exists departments add column if not exists code text;
alter table if exists departments add column if not exists is_active boolean default true;

alter table if exists positions add column if not exists title text;
alter table if exists positions add column if not exists code text;
alter table if exists positions add column if not exists level text;
alter table if exists positions add column if not exists is_active boolean default true;

alter table if exists roles add column if not exists display_name text;
alter table if exists roles add column if not exists level integer;

alter table if exists attendance_records add column if not exists employee_id text;
alter table if exists attendance_records add column if not exists clock_in timestamptz;
alter table if exists attendance_records add column if not exists clock_out timestamptz;
alter table if exists attendance_records add column if not exists break_start timestamptz;
alter table if exists attendance_records add column if not exists break_end timestamptz;
alter table if exists attendance_records add column if not exists total_hours numeric(8,2);
alter table if exists attendance_records add column if not exists overtime_hours numeric(8,2);
alter table if exists attendance_records add column if not exists is_approved boolean default false;
alter table if exists attendance_records add column if not exists approved_by uuid references user_profiles(id) on delete set null;
alter table if exists attendance_records add column if not exists approved_at timestamptz;
alter table if exists attendance_records add column if not exists notes text;
alter table if exists attendance_records add column if not exists location_in text;
alter table if exists attendance_records add column if not exists location_out text;
alter table if exists attendance_records add column if not exists ip_address_in text;
alter table if exists attendance_records add column if not exists ip_address_out text;
alter table if exists attendance_records add column if not exists updated_at timestamptz default now();

alter table if exists leave_types add column if not exists code text;
alter table if exists leave_types add column if not exists max_days_per_year integer;
alter table if exists leave_types add column if not exists is_paid boolean default true;
alter table if exists leave_types add column if not exists is_active boolean default true;

alter table if exists leave_balances add column if not exists year integer;
alter table if exists leave_balances add column if not exists total_allocated numeric(8,2);
alter table if exists leave_balances add column if not exists used_days numeric(8,2);
alter table if exists leave_balances add column if not exists pending_days numeric(8,2);
alter table if exists leave_balances add column if not exists remaining_days numeric(8,2);
alter table if exists leave_balances add column if not exists carried_forward numeric(8,2);

alter table if exists leave_requests add column if not exists employee_id text;
alter table if exists leave_requests add column if not exists days_requested numeric(8,2);
alter table if exists leave_requests add column if not exists is_half_day boolean default false;
alter table if exists leave_requests add column if not exists half_day_period text;
alter table if exists leave_requests add column if not exists approved_at timestamptz;
alter table if exists leave_requests add column if not exists reviewed_by uuid references user_profiles(id) on delete set null;
alter table if exists leave_requests add column if not exists reviewed_at timestamptz;
alter table if exists leave_requests add column if not exists rejection_reason text;
alter table if exists leave_requests add column if not exists updated_at timestamptz default now();


-- Basic seed data (optional but helpful)
insert into departments (name)
  values ('Engineering') on conflict (name) do nothing;
insert into roles (name, permissions)
  values ('admin', '{"all": true}'::jsonb) on conflict (name) do nothing;


