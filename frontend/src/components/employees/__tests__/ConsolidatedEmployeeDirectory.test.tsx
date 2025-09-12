import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ConsolidatedEmployeeDirectory } from '../ConsolidatedEmployeeDirectory';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

// Mock usePermissions hook
const mockUsePermissions = vi.fn();
vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: mockUsePermissions,
}));

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({
    data: mockEmployeeData,
    error: null,
  }),
};

vi.mock('../../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock employee data
const mockEmployeeData = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1-555-0101',
    position: 'Software Engineer',
    department: 'Engineering',
    status: 'active',
    hire_date: '2023-01-15',
    manager_id: 'mgr1',
    employee_id: 'EMP001',
    profile_picture: null,
    role: { name: 'employee', level: 1 },
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '+1-555-0102',
    position: 'Senior Engineer',
    department: 'Engineering',
    status: 'active',
    hire_date: '2022-06-01',
    manager_id: 'mgr1',
    employee_id: 'EMP002',
    profile_picture: null,
    role: { name: 'senior_employee', level: 2 },
  },
  {
    id: '3',
    full_name: 'Bob Wilson',
    email: 'bob.wilson@company.com',
    phone: '+1-555-0103',
    position: 'HR Manager',
    department: 'Human Resources',
    status: 'active',
    hire_date: '2021-03-10',
    manager_id: null,
    employee_id: 'EMP003',
    profile_picture: null,
    role: { name: 'hr_manager', level: 4 },
  },
];

describe('ConsolidatedEmployeeDirectory', () => {
  const mockAuthData = {
    user: { id: '1', email: 'test@example.com' },
    profile: {
      id: '1',
      role: { name: 'hr_manager', level: 4 },
    },
    isAuthenticated: true,
  };

  const mockPermissionsData = {
    hasPermission: vi.fn().mockReturnValue(true),
    canAccess: vi.fn().mockReturnValue(true),
    isAdmin: vi.fn().mockReturnValue(false),
    isHR: vi.fn().mockReturnValue(true),
    isManager: vi.fn().mockReturnValue(true),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthData);
    mockUsePermissions.mockReturnValue(mockPermissionsData);
    
    // Reset mock implementations
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.or.mockReturnThis();
    mockSupabase.order.mockResolvedValue({
      data: mockEmployeeData,
      error: null,
    });
  });

  it('renders employee directory with search and filters', async () => {
    render(<ConsolidatedEmployeeDirectory />);

    expect(screen.getByText(/employee directory/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search employees/i)).toBeInTheDocument();
    expect(screen.getByText(/department/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
  });

  it('displays employee list after loading', async () => {
    render(<ConsolidatedEmployeeDirectory />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });
  });

  it('filters employees by search term', async () => {
    render(<ConsolidatedEmployeeDirectory />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search employees/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('filters employees by department', async () => {
    render(<ConsolidatedEmployeeDirectory />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const departmentFilter = screen.getByRole('combobox', { name: /department/i });
    fireEvent.mouseDown(departmentFilter);
    
    const engineeringOption = screen.getByText('Engineering');
    fireEvent.click(engineeringOption);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });
  });

  it('switches between grid and list view', async () => {
    render(<ConsolidatedEmployeeDirectory />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const listViewButton = screen.getByRole('button', { name: /list view/i });
    fireEvent.click(listViewButton);

    // Check if list view is active (specific styling or layout changes)
    expect(screen.getByRole('button', { name: /list view/i })).toHaveClass('active');
  });

  it('opens employee details when clicking on employee card', async () => {
    render(<ConsolidatedEmployeeDirectory />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const employeeCard = screen.getByText('John Doe').closest('[role="button"]');
    if (employeeCard) {
      fireEvent.click(employeeCard);
    }

    await waitFor(() => {
      expect(screen.getByText(/employee details/i)).toBeInTheDocument();
    });
  });

  it('displays add employee button for authorized users', () => {
    render(<ConsolidatedEmployeeDirectory />);

    expect(screen.getByRole('button', { name: /add employee/i })).toBeInTheDocument();
  });

  it('hides add employee button for unauthorized users', () => {
    mockPermissionsData.hasPermission.mockReturnValue(false);
    
    render(<ConsolidatedEmployeeDirectory />);

    expect(screen.queryByRole('button', { name: /add employee/i })).not.toBeInTheDocument();
  });

  it('displays employee statistics', async () => {
    render(<ConsolidatedEmployeeDirectory />);

    await waitFor(() => {
      expect(screen.getByText(/total employees/i)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('handles empty employee list', async () => {
    mockSupabase.order.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    render(<ConsolidatedEmployeeDirectory />);

    await waitFor(() => {
      expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockSupabase.order.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    });

    render(<ConsolidatedEmployeeDirectory />);

    await waitFor(() => {
      expect(screen.getByText(/error loading employees/i)).toBeInTheDocument();
    });
  });

  it('exports employee data when export button is clicked', async () => {
    const mockDownload = vi.fn();
    Object.defineProperty(document, 'createElement', {
      writable: true,
      value: vi.fn(() => ({
        click: mockDownload,
        setAttribute: vi.fn(),
        style: {},
      })),
    });

    render(<ConsolidatedEmployeeDirectory />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    expect(mockDownload).toHaveBeenCalled();
  });

  it('displays employee roles correctly', async () => {
    render(<ConsolidatedEmployeeDirectory />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
      expect(screen.getByText('HR Manager')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<ConsolidatedEmployeeDirectory />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});