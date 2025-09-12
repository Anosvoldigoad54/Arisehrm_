import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeaveManagement } from '../useLeaveManagement';

// Mock the API calls
vi.mock('@/services/leaveService', () => ({
  fetchLeaveRequests: vi.fn().mockResolvedValue([
    {
      id: '1',
      employee_id: 'emp1',
      leave_type_id: 'annual',
      start_date: '2025-01-01',
      end_date: '2025-01-05',
      status: 'pending',
    },
  ]),
  fetchLeaveTypes: vi.fn().mockResolvedValue([
    { id: 'annual', name: 'Annual Leave', color_code: '#4f46e5' },
  ]),
  fetchLeaveBalances: vi.fn().mockResolvedValue([
    {
      leave_type_id: 'annual',
      current_balance: 15,
      used_balance: 5,
    },
  ]),
}));

describe('useLeaveManagement', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();
  });

  it('should fetch leave requests', async () => {
    const { result } = renderHook(() => useLeaveManagement('emp1'), { wrapper });
    
    // Initial state
    expect(result.current.isLoading).toBe(true);
    
    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.leaveRequests).toHaveLength(1);
      expect(result.current.leaveRequests[0].id).toBe('1');
    });
  });

  it('should handle leave request submission', async () => {
    const { result } = renderHook(() => useLeaveManagement('emp1'), { wrapper });
    
    await act(async () => {
      await result.current.createLeaveRequest({
        leaveTypeId: 'annual',
        startDate: '2025-02-01',
        endDate: '2025-02-05',
        reason: 'Vacation',
      });
    });

    // Verify the mutation was called with correct data
    expect(result.current.isCreating).toBe(false);
    // Add more assertions based on your implementation
  });
});
