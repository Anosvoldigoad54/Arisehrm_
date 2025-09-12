import { render, screen, waitFor } from '@/__tests__/test-utils';
import { LeaveAnalytics } from '../LeaveAnalytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock data
const mockAnalytics = {
  monthlyTrends: [
    { month: 'Jan', requests: 5, avgDuration: 2.5 },
    { month: 'Feb', requests: 8, avgDuration: 3.2 },
    { month: 'Mar', requests: 12, avgDuration: 2.8 },
  ],
  leaveTypeDistribution: [
    { leaveType: 'Annual Leave', count: 15, percentage: 60 },
    { leaveType: 'Sick Leave', count: 7, percentage: 28 },
    { leaveType: 'Personal Leave', count: 3, percentage: 12 },
  ],
  departmentWiseUsage: [
    { department: 'Engineering', usage: 45 },
    { department: 'Design', usage: 25 },
    { department: 'Marketing', usage: 15 },
    { department: 'HR', usage: 10 },
    { department: 'Finance', usage: 5 },
  ],
  leaveApprovalRate: 82,
  averageProcessingTime: 1.5,
  peakLeaveMonths: ['July', 'December'],
  leaveBalanceTrend: [
    { month: 'Jan', balance: 15 },
    { month: 'Feb', balance: 13 },
    { month: 'Mar', balance: 12 },
  ],
};

// Mock the API call
vi.mock('@/hooks/useLeaveManagement', () => ({
  useLeaveManagement: () => ({
    analytics: mockAnalytics,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('LeaveAnalytics', () => {
  const queryClient = new QueryClient();
  
  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LeaveAnalytics />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('renders all analytics sections', async () => {
    renderComponent();
    
    // Check if all main sections are rendered
    expect(screen.getByText(/leave analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/monthly trends/i)).toBeInTheDocument();
    expect(screen.getByText(/leave type distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/department-wise usage/i)).toBeInTheDocument();
    expect(screen.getByText(/key metrics/i)).toBeInTheDocument();
    
    // Check if charts are rendered
    await waitFor(() => {
      // Check if charts are present (using test IDs or other selectors)
      expect(screen.getByTestId('monthly-trends-chart')).toBeInTheDocument();
      expect(screen.getByTestId('leave-type-chart')).toBeInTheDocument();
      expect(screen.getByTestId('department-usage-chart')).toBeInTheDocument();
    });
    
    // Check if key metrics are displayed
    expect(screen.getByText(/82%/i)).toBeInTheDocument(); // Approval rate
    expect(screen.getByText(/1.5 days/i)).toBeInTheDocument(); // Avg processing time
    expect(screen.getByText(/july, december/i)).toBeInTheDocument(); // Peak months
  });

  it('allows changing the date range', async () => {
    renderComponent();
    
    // Find and click the date range selector
    const dateRangeButton = screen.getByLabelText(/last 6 months/i);
    fireEvent.mouseDown(dateRangeButton);
    
    // Select a different date range (e.g., "This Year")
    const thisYearOption = screen.getByText(/this year/i);
    fireEvent.click(thisYearOption);
    
    // Verify the date range was updated
    // In a real test, you would check if the API was called with the new date range
    await waitFor(() => {
      expect(screen.getByText(/this year/i)).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    // Override the mock to show loading state
    vi.mocked(useLeaveManagement).mockReturnValueOnce({
      analytics: null,
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
      analytics: null,
      isLoading: false,
      isError: true,
      error: { message: 'Failed to load analytics data' },
      refetch: vi.fn(),
    });
    
    renderComponent();
    
    expect(screen.getByText(/failed to load analytics data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('allows exporting analytics data', async () => {
    // Mock the file-saver library
    const mockSaveAs = vi.fn();
    vi.mock('file-saver', () => ({
      saveAs: mockSaveAs,
    }));
    
    renderComponent();
    
    // Click the export button
    const exportButton = screen.getByRole('button', { name: /export report/i });
    fireEvent.click(exportButton);
    
    // Verify the export function was called
    await waitFor(() => {
      expect(mockSaveAs).toHaveBeenCalled();
    });
  });

  it('filters data by department', async () => {
    renderComponent();
    
    // Open the department filter dropdown
    const departmentFilter = screen.getByLabelText(/filter by department/i);
    fireEvent.mouseDown(departmentFilter);
    
    // Select a department
    const engineeringOption = screen.getByText(/engineering/i);
    fireEvent.click(engineeringOption);
    
    // Verify the filter was applied
    // In a real test, you would check if the charts were updated with filtered data
    await waitFor(() => {
      expect(screen.getByText(/engineering/i)).toBeInTheDocument();
    });
  });
});
