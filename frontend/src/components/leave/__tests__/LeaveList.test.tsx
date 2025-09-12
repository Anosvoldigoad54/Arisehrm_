import { render, screen, waitFor } from '@/__tests__/test-utils';
import { LeaveList } from '../LeaveList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock data
const mockLeaveRequests = [
  {
    id: '1',
    requestNumber: 'LR-2025-001',
    employee: {
      firstName: 'John',
      lastName: 'Doe',
      department: 'Engineering',
    },
    leaveType: {
      name: 'Annual Leave',
      colorCode: '#4f46e5',
    },
    startDate: '2025-03-01',
    endDate: '2025-03-05',
    status: 'pending',
    reason: 'Vacation',
    createdAt: '2025-02-20T10:00:00Z',
  },
];

// Mock the API call
vi.mock('@/hooks/useLeaveManagement', () => ({
  useLeaveManagement: () => ({
    leaveRequests: mockLeaveRequests,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('LeaveList', () => {
  const queryClient = new QueryClient();
  
  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LeaveList />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('renders the leave requests table', async () => {
    renderComponent();
    
    // Check if the table headers are present
    expect(screen.getByText(/request number/i)).toBeInTheDocument();
    expect(screen.getByText(/employee/i)).toBeInTheDocument();
    expect(screen.getByText(/leave type/i)).toBeInTheDocument();
    expect(screen.getByText(/dates/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
    expect(screen.getByText(/actions/i)).toBeInTheDocument();
    
    // Check if the mock data is displayed
    await waitFor(() => {
      expect(screen.getByText('LR-2025-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
      expect(screen.getByText('Mar 1 - 5, 2025')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    // Override the mock to show loading state
    vi.mocked(useLeaveManagement).mockReturnValueOnce({
      leaveRequests: [],
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    
    renderComponent();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state', () => {
    // Override the mock to show error state
    vi.mocked(useLeaveManagement).mockReturnValueOnce({
      leaveRequests: [],
      isLoading: false,
      isError: true,
      error: { message: 'Failed to load leave requests' },
      refetch: vi.fn(),
    });
    
    renderComponent();
    
    expect(screen.getByText(/failed to load leave requests/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('allows filtering leave requests', async () => {
    renderComponent();
    
    // Open the status filter dropdown
    fireEvent.mouseDown(screen.getByLabelText(/filter by status/i));
    
    // Select 'Approved' filter
    fireEvent.click(screen.getByText(/approved/i));
    
    // Verify the filter was applied (you would need to mock the filter function)
    // This is a simplified example - in a real test, you would check if the
    // filter function was called with the correct parameters
    await waitFor(() => {
      expect(screen.getByText(/no leave requests found/i)).toBeInTheDocument();
    });
  });
});
