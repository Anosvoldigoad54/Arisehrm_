import { render, screen, waitFor } from '@/__tests__/test-utils';
import { LeaveBalance } from '../LeaveBalance';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock data
const mockLeaveBalances = [
  {
    id: '1',
    leaveType: {
      id: 'annual',
      name: 'Annual Leave',
      colorCode: '#4f46e5',
      icon: 'beach_access',
    },
    currentBalance: 10,
    usedBalance: 5,
    pendingBalance: 2,
    availableBalance: 3,
  },
  {
    id: '2',
    leaveType: {
      id: 'sick',
      name: 'Sick Leave',
      colorCode: '#10b981',
      icon: 'sick',
    },
    currentBalance: 7,
    usedBalance: 2,
    pendingBalance: 1,
    availableBalance: 4,
  },
];

// Mock the API call
vi.mock('@/hooks/useLeaveManagement', () => ({
  useLeaveManagement: () => ({
    leaveBalances: mockLeaveBalances,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('LeaveBalance', () => {
  const queryClient = new QueryClient();
  
  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LeaveBalance />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('renders leave balance cards', async () => {
    renderComponent();
    
    // Check if the section title is present
    expect(screen.getByText(/my leave balance/i)).toBeInTheDocument();
    
    // Check if all leave balance cards are rendered
    await waitFor(() => {
      // Annual Leave
      expect(screen.getByText(/annual leave/i)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Total
      expect(screen.getByText('5')).toBeInTheDocument(); // Used
      expect(screen.getByText('2')).toBeInTheDocument(); // Pending
      expect(screen.getByText('3')).toBeInTheDocument(); // Available
      
      // Sick Leave
      expect(screen.getByText(/sick leave/i)).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument(); // Total
      expect(screen.getByText('2')).toBeInTheDocument(); // Used
      expect(screen.getByText('1')).toBeInTheDocument(); // Pending
      expect(screen.getByText('4')).toBeInTheDocument(); // Available
    });
  });

  it('shows loading state', () => {
    // Override the mock to show loading state
    vi.mocked(useLeaveManagement).mockReturnValueOnce({
      leaveBalances: [],
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    
    renderComponent();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state with retry option', () => {
    // Override the mock to show error state
    vi.mocked(useLeaveManagement).mockReturnValueOnce({
      leaveBalances: [],
      isLoading: false,
      isError: true,
      error: { message: 'Failed to load leave balances' },
      refetch: vi.fn(),
    });
    
    renderComponent();
    
    expect(screen.getByText(/failed to load leave balances/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('allows requesting new leave from the balance card', async () => {
    const mockOnRequestLeave = vi.fn();
    
    render(
      <QueryClientProvider client={queryClient}>
        <LeaveBalance onRequestLeave={mockOnRequestLeave} />
      </QueryClientProvider>
    );
    
    // Click the request button on the first leave type card
    const requestButtons = screen.getAllByRole('button', { name: /request leave/i });
    fireEvent.click(requestButtons[0]);
    
    // Verify the callback was called with the correct leave type
    expect(mockOnRequestLeave).toHaveBeenCalledWith('annual');
  });
});
