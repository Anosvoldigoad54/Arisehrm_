import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CustomizableDashboard from '../CustomizableDashboard';

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

// Mock chart components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('CustomizableDashboard', () => {
  const mockAuthData = {
    user: { id: '1', email: 'test@example.com' },
    profile: {
      id: '1',
      full_name: 'Test User',
      role: { name: 'employee', level: 1, display_name: 'Employee' },
      department: 'Engineering',
    },
    isAuthenticated: true,
    isLoading: false,
  };

  const mockPermissionsData = {
    hasPermission: vi.fn().mockReturnValue(true),
    hasAnyPermission: vi.fn().mockReturnValue(true),
    hasAllPermissions: vi.fn().mockReturnValue(true),
    getUserRole: vi.fn().mockReturnValue('employee'),
    getUserLevel: vi.fn().mockReturnValue(1),
    getRoleName: vi.fn().mockReturnValue('Employee'),
    isAdmin: vi.fn().mockReturnValue(false),
    isHR: vi.fn().mockReturnValue(false),
    isManager: vi.fn().mockReturnValue(false),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthData);
    mockUsePermissions.mockReturnValue(mockPermissionsData);
  });

  it('renders dashboard with user greeting', () => {
    render(<CustomizableDashboard />);

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays key metrics cards', () => {
    render(<CustomizableDashboard />);

    expect(screen.getByText(/my leave balance/i)).toBeInTheDocument();
    expect(screen.getByText(/attendance rate/i)).toBeInTheDocument();
    expect(screen.getByText(/pending requests/i)).toBeInTheDocument();
    expect(screen.getByText(/upcoming events/i)).toBeInTheDocument();
  });

  it('shows recent activities section', () => {
    render(<CustomizableDashboard />);

    expect(screen.getByText(/recent activities/i)).toBeInTheDocument();
  });

  it('displays attendance chart', () => {
    render(<CustomizableDashboard />);

    expect(screen.getByText(/attendance overview/i)).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('shows customization button', () => {
    render(<CustomizableDashboard />);

    const customizeButton = screen.getByRole('button', { name: /customize/i });
    expect(customizeButton).toBeInTheDocument();
  });

  it('opens customization dialog when customize button is clicked', async () => {
    render(<CustomizableDashboard />);

    const customizeButton = screen.getByRole('button', { name: /customize/i });
    fireEvent.click(customizeButton);

    await waitFor(() => {
      expect(screen.getByText(/dashboard customization/i)).toBeInTheDocument();
    });
  });

  it('displays role-appropriate widgets for managers', () => {
    mockPermissionsData.isManager.mockReturnValue(true);
    mockPermissionsData.getUserRole.mockReturnValue('team_lead');
    
    render(<CustomizableDashboard />);

    expect(screen.getByText(/team overview/i)).toBeInTheDocument();
  });

  it('displays admin widgets for admin users', () => {
    mockPermissionsData.isAdmin.mockReturnValue(true);
    mockPermissionsData.getUserRole.mockReturnValue('admin');
    
    render(<CustomizableDashboard />);

    expect(screen.getByText(/system overview/i)).toBeInTheDocument();
  });

  it('handles loading state gracefully', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthData,
      isLoading: true,
    });

    render(<CustomizableDashboard />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles error state when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthData,
      isAuthenticated: false,
      user: null,
      profile: null,
    });

    render(<CustomizableDashboard />);

    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
  });

  it('displays quick actions section', () => {
    render(<CustomizableDashboard />);

    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request leave/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clock in\/out/i })).toBeInTheDocument();
  });

  it('renders announcements section', () => {
    render(<CustomizableDashboard />);

    expect(screen.getByText(/announcements/i)).toBeInTheDocument();
  });

  it('shows performance metrics for appropriate users', () => {
    mockPermissionsData.hasPermission.mockImplementation((permission) => 
      permission === 'performance.view'
    );

    render(<CustomizableDashboard />);

    expect(screen.getByText(/performance score/i)).toBeInTheDocument();
  });

  it('displays leave balance correctly', async () => {
    render(<CustomizableDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/25 days/i)).toBeInTheDocument();
    });
  });

  it('shows attendance rate with correct formatting', async () => {
    render(<CustomizableDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/94.5%/i)).toBeInTheDocument();
    });
  });
});