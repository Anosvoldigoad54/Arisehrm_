import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthGuard } from '../AuthGuard';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the AuthContext
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe('AuthGuard', () => {
  const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com' },
      profile: { 
        id: '1', 
        role: { name: 'employee', level: 1, permissions: [] } 
      },
      securityContext: {},
      sessionHealth: { isHealthy: true },
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      profile: null,
      securityContext: {},
      sessionHealth: { isHealthy: false },
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: expect.objectContaining({
          from: expect.any(Object),
          securityReason: 'authentication_required',
        }),
        replace: true,
      });
    });
  });

  it('shows loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      profile: null,
      securityContext: {},
      sessionHealth: { isHealthy: false },
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('blocks access when user lacks required role', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com' },
      profile: { 
        id: '1', 
        role: { name: 'employee', level: 1, permissions: [] } 
      },
      securityContext: {},
      sessionHealth: { isHealthy: true },
    } as any);

    render(
      <AuthGuard requiredRole="admin">
        <div>Admin Content</div>
      </AuthGuard>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('blocks access when user lacks required permissions', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com' },
      profile: { 
        id: '1', 
        role: { name: 'employee', level: 1, permissions: ['read'] } 
      },
      securityContext: {},
      sessionHealth: { isHealthy: true },
    } as any);

    render(
      <AuthGuard requiredPermissions={['admin']}>
        <div>Admin Content</div>
      </AuthGuard>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText(/insufficient permissions/i)).toBeInTheDocument();
  });

  it('allows access when user has required level', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com' },
      profile: { 
        id: '1', 
        role: { name: 'admin', level: 5, permissions: ['admin'] } 
      },
      securityContext: {},
      sessionHealth: { isHealthy: true },
    } as any);

    render(
      <AuthGuard requiredLevel={3}>
        <div>High Level Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('High Level Content')).toBeInTheDocument();
  });

  it('renders fallback component when access is denied', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com' },
      profile: { 
        id: '1', 
        role: { name: 'employee', level: 1, permissions: [] } 
      },
      securityContext: {},
      sessionHealth: { isHealthy: true },
    } as any);

    render(
      <AuthGuard 
        requiredRole="admin" 
        fallback={<div>Custom Fallback</div>}
      >
        <div>Admin Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});