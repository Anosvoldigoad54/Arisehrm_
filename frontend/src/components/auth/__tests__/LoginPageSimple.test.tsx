import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginPageSimple from '../LoginPageSimple';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ 
      pathname: '/login',
      state: { from: { pathname: '/dashboard' } }
    }),
  };
});

// Mock AuthContext
const mockSignIn = vi.fn();
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    isLoading: false,
    error: null,
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('LoginPageSimple', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with all required fields', () => {
    render(<LoginPageSimple />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/arise hrm/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<LoginPageSimple />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(<LoginPageSimple />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    mockSignIn.mockResolvedValueOnce({ user: { id: '1' } });

    render(<LoginPageSimple />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('toggles password visibility', () => {
    render(<LoginPageSimple />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('displays demo credentials', () => {
    render(<LoginPageSimple />);

    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@arisehrm.com/i)).toBeInTheDocument();
  });

  it('handles login errors gracefully', async () => {
    const mockError = new Error('Invalid credentials');
    mockSignIn.mockRejectedValueOnce(mockError);

    render(<LoginPageSimple />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during authentication', async () => {
    // Mock loading state
    vi.doMock('../../../contexts/AuthContext', () => ({
      useAuth: () => ({
        signIn: mockSignIn,
        isLoading: true,
        error: null,
      }),
    }));

    // Re-import and render with loading state
    const { default: LoginPageWithLoading } = await import('../LoginPageSimple');
    render(<LoginPageWithLoading />);

    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});