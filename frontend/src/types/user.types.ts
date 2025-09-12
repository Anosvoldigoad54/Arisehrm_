export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  HR_MANAGER = 'hr_manager',
  HR_STAFF = 'hr_staff',
  DEPARTMENT_HEAD = 'department_head',
  TEAM_LEAD = 'team_lead',
  EMPLOYEE = 'employee',
  INTERN = 'intern',
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  position: string;
  avatar?: string;
  isActive: boolean;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
