import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import { LeaveRequestForm } from '../LeaveRequestForm';
import { leaveQueryKeys } from '../types/leave.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock the API call
const mockCreateLeaveRequest = vi.fn().mockResolvedValue({ id: '123' });
vi.mock('@/services/leaveService', () => ({
  createLeaveRequest: (data: any) => mockCreateLeaveRequest(data),
}));

describe('LeaveRequestForm', () => {
  const queryClient = new QueryClient();
  
  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LeaveRequestForm onSuccess={vi.fn()} onCancel={vi.fn()} />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('renders the form with all fields', () => {
    renderComponent();
    
    expect(screen.getByLabelText(/leave type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/leave type is required/i)).toBeInTheDocument();
      expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    renderComponent();
    
    // Fill in the form
    fireEvent.mouseDown(screen.getByLabelText(/leave type/i));
    fireEvent.click(screen.getByText(/annual leave/i));
    
    const startDate = screen.getByLabelText(/start date/i);
    fireEvent.change(startDate, { target: { value: '2025-03-01' } });
    
    const endDate = screen.getByLabelText(/end date/i);
    fireEvent.change(endDate, { target: { value: '2025-03-05' } });
    
    const reason = screen.getByLabelText(/reason/i);
    fireEvent.change(reason, { target: { value: 'Vacation' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify the API was called with correct data
    await waitFor(() => {
      expect(mockCreateLeaveRequest).toHaveBeenCalledWith({
        leaveTypeId: 'annual',
        startDate: '2025-03-01',
        endDate: '2025-03-05',
        reason: 'Vacation',
        emergencyRequest: false,
      });
    });
  });
});
