import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import { LeaveCalendar } from '../LeaveCalendar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock data
const mockTeamLeaves = [
  {
    id: '1',
    title: 'John Doe - Annual Leave',
    start: '2025-03-01T00:00:00',
    end: '2025-03-05T23:59:59',
    status: 'approved',
    employee: {
      id: 'emp1',
      firstName: 'John',
      lastName: 'Doe',
      department: 'Engineering',
      position: 'Senior Developer',
      avatar: '/avatars/john-doe.jpg',
    },
    leaveType: {
      id: 'annual',
      name: 'Annual Leave',
      colorCode: '#4f46e5',
    },
  },
  {
    id: '2',
    title: 'Jane Smith - Sick Leave',
    start: '2025-03-10T00:00:00',
    end: '2025-03-11T23:59:59',
    status: 'pending',
    employee: {
      id: 'emp2',
      firstName: 'Jane',
      lastName: 'Smith',
      department: 'Design',
      position: 'UI/UX Designer',
      avatar: '/avatars/jane-smith.jpg',
    },
    leaveType: {
      id: 'sick',
      name: 'Sick Leave',
      colorCode: '#10b981',
    },
  },
];

// Mock the API call
vi.mock('@/hooks/useLeaveManagement', () => ({
  useLeaveManagement: () => ({
    teamLeaves: mockTeamLeaves,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('LeaveCalendar', () => {
  const queryClient = new QueryClient();
  
  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LeaveCalendar />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    // Mock the current date to March 1, 2025
    vi.useFakeTimers().setSystemTime(new Date('2025-03-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the calendar with team leaves', async () => {
    renderComponent();
    
    // Check if the calendar header is present
    expect(screen.getByText('March 2025')).toBeInTheDocument();
    
    // Check if the calendar navigation buttons are present
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    
    // Check if the calendar view toggle is present
    expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /day/i })).toBeInTheDocument();
    
    // Check if the team leaves are displayed on the calendar
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
    });
  });

  it('allows switching between calendar views', async () => {
    renderComponent();
    
    // Switch to week view
    const weekViewButton = screen.getByRole('button', { name: /week/i });
    fireEvent.click(weekViewButton);
    
    // Check if the view has changed to week view
    expect(screen.getByText('Week')).toBeInTheDocument();
    
    // Switch to day view
    const dayViewButton = screen.getByRole('button', { name: /day/i });
    fireEvent.click(dayViewButton);
    
    // Check if the view has changed to day view
    expect(screen.getByText('Day')).toBeInTheDocument();
    
    // Switch back to month view
    const monthViewButton = screen.getByRole('button', { name: /month/i });
    fireEvent.click(monthViewButton);
    
    // Check if the view has changed back to month view
    expect(screen.getByText('March 2025')).toBeInTheDocument();
  });

  it('shows leave details when an event is clicked', async () => {
    renderComponent();
    
    // Wait for the calendar to load
    await screen.findByText('John Doe');
    
    // Find and click on a leave event
    const leaveEvent = screen.getByText('John Doe').closest('[role="button"]');
    if (leaveEvent) {
      fireEvent.click(leaveEvent);
      
      // Check if the leave details dialog is shown
      await waitFor(() => {
        expect(screen.getByText(/leave details/i)).toBeInTheDocument();
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        expect(screen.getByText(/annual leave/i)).toBeInTheDocument();
        expect(screen.getByText(/march 1, 2025/i)).toBeInTheDocument();
        expect(screen.getByText(/march 5, 2025/i)).toBeInTheDocument();
        expect(screen.getByText(/approved/i)).toBeInTheDocument();
      });
      
      // Close the dialog
      const closeButton = screen.getByLabelText('close');
      fireEvent.click(closeButton);
      
      // Check if the dialog is closed
      await waitFor(() => {
        expect(screen.queryByText(/leave details/i)).not.toBeInTheDocument();
      });
    }
  });

  it('filters leaves by status', async () => {
    renderComponent();
    
    // Wait for the calendar to load
    await screen.findByText('John Doe');
    
    // Open the status filter dropdown
    const statusFilter = screen.getByLabelText(/filter by status/i);
    fireEvent.mouseDown(statusFilter);
    
    // Select 'Approved' filter
    fireEvent.click(screen.getByText(/approved/i));
    
    // Verify only approved leaves are shown
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
    
    // Clear the filter
    const clearFilterButton = screen.getByLabelText(/clear filter/i);
    fireEvent.click(clearFilterButton);
    
    // Verify all leaves are shown again
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    // Override the mock to show loading state
    vi.mocked(useLeaveManagement).mockReturnValueOnce({
      teamLeaves: [],
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
      teamLeaves: [],
      isLoading: false,
      isError: true,
      error: { message: 'Failed to load team leaves' },
      refetch: vi.fn(),
    });
    
    renderComponent();
    
    expect(screen.getByText(/failed to load team leaves/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
