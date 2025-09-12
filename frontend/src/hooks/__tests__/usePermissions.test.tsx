import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { usePermissions } from '../usePermissions';
import { useAuth } from '../../contexts/AuthContext';

// Mock the AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('usePermissions', () => {
  const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default permissions when no user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      profile: null,
      user: null,
    } as any);

    const { result } = renderHook(() => usePermissions());

    expect(result.current.roles).toEqual([]);
    expect(result.current.permissions).toEqual([]);
    expect(result.current.hasPermission('any_permission')).toBe(false);
    expect(result.current.hasAnyPermission(['perm1', 'perm2'])).toBe(false);
    expect(result.current.hasAllPermissions(['perm1', 'perm2'])).toBe(false);
  });

  it('returns user permissions when user is authenticated', () => {
    const mockRole = {
      name: 'hr_manager',
      level: 4,
      permissions: ['employees.read', 'employees.write', 'leaves.approve'],
      display_name: 'HR Manager'
    };

    mockUseAuth.mockReturnValue({
      profile: { role: mockRole },
      user: { id: '1' },
    } as any);

    const { result } = renderHook(() => usePermissions());

    expect(result.current.getUserRole()).toBe('hr_manager');
    expect(result.current.getUserLevel()).toBe(4);
    expect(result.current.getRoleName()).toBe('HR Manager');
    expect(result.current.isHR()).toBe(true);
    expect(result.current.isManager()).toBe(true);
  });

  it('correctly checks individual permissions', () => {
    const mockRole = {
      name: 'employee',
      level: 1,
      permissions: ['employees.read', 'leaves.create'],
    };

    mockUseAuth.mockReturnValue({
      profile: { role: mockRole },
      user: { id: '1' },
    } as any);

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('employees.read')).toBe(true);
    expect(result.current.hasPermission('employees.write')).toBe(false);
    expect(result.current.hasPermission('leaves.create')).toBe(true);
  });

  it('correctly checks any permissions', () => {
    const mockRole = {
      name: 'employee',
      level: 1,
      permissions: ['employees.read', 'leaves.create'],
    };

    mockUseAuth.mockReturnValue({
      profile: { role: mockRole },
      user: { id: '1' },
    } as any);

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasAnyPermission(['employees.read', 'employees.write'])).toBe(true);
    expect(result.current.hasAnyPermission(['employees.write', 'employees.delete'])).toBe(false);
  });

  it('correctly checks all permissions', () => {
    const mockRole = {
      name: 'admin',
      level: 5,
      permissions: ['employees.read', 'employees.write', 'employees.delete', 'system.admin'],
    };

    mockUseAuth.mockReturnValue({
      profile: { role: mockRole },
      user: { id: '1' },
    } as any);

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasAllPermissions(['employees.read', 'employees.write'])).toBe(true);
    expect(result.current.hasAllPermissions(['employees.read', 'payroll.process'])).toBe(false);
  });

  it('correctly identifies admin users', () => {
    const mockAdminRole = {
      name: 'super_admin',
      level: 6,
      permissions: ['system.admin', '*'],
    };

    mockUseAuth.mockReturnValue({
      profile: { role: mockAdminRole },
      user: { id: '1' },
    } as any);

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isManager()).toBe(true);
    expect(result.current.isHR()).toBe(false); // super_admin != hr_manager
  });

  it('correctly identifies HR users', () => {
    const mockHRRole = {
      name: 'hr_manager',
      level: 4,
      permissions: ['employees.read', 'employees.write', 'leaves.approve'],
    };

    mockUseAuth.mockReturnValue({
      profile: { role: mockHRRole },
      user: { id: '1' },
    } as any);

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isHR()).toBe(true);
    expect(result.current.isManager()).toBe(true);
    expect(result.current.isAdmin()).toBe(false);
  });

  it('correctly identifies manager users', () => {
    const mockManagerRole = {
      name: 'department_manager',
      level: 3,
      permissions: ['employees.read', 'leaves.approve'],
    };

    mockUseAuth.mockReturnValue({
      profile: { role: mockManagerRole },
      user: { id: '1' },
    } as any);

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isManager()).toBe(true);
    expect(result.current.isHR()).toBe(false);
    expect(result.current.isAdmin()).toBe(false);
  });

  it('handles role without display_name correctly', () => {
    const mockRole = {
      name: 'team_lead',
      level: 2,
      permissions: ['employees.read'],
    };

    mockUseAuth.mockReturnValue({
      profile: { role: mockRole },
      user: { id: '1' },
    } as any);

    const { result } = renderHook(() => usePermissions());

    expect(result.current.getRoleName()).toBe('Team Lead');
  });

  it('returns guest role when no profile exists', () => {
    mockUseAuth.mockReturnValue({
      profile: null,
      user: { id: '1' },
    } as any);

    const { result } = renderHook(() => usePermissions());

    expect(result.current.getUserRole()).toBe('guest');
    expect(result.current.getUserLevel()).toBe(0);
    expect(result.current.getRoleName()).toBe('Guest');
  });
});