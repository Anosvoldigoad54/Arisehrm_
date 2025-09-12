import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { 
  LeaveRequest, 
  LeaveType, 
  EmployeeLeaveBalance, 
  LeaveStats, 
  LeaveAnalyticsData,
  LeaveRequestFilters,
  PaginatedResponse,
  PaginationParams,
  leaveQueryKeys
} from '../components/leave/types';
import { 
  mockLeaveRequests, 
  mockLeaveTypes, 
  mockLeaveBalances 
} from '../mocks/leave';

export const useLeaveRequests = (
  filters: LeaveRequestFilters = {},
  pagination: PaginationParams = { page: 1, page_size: 10 },
  options?: Omit<UseQueryOptions<PaginatedResponse<LeaveRequest>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: leaveQueryKeys.list({ ...filters, ...pagination }),
    queryFn: () => {
      // Apply filters
      let filteredData = [...mockLeaveRequests];
      
      if (filters.status?.length) {
        filteredData = filteredData.filter(request => 
          request.status && filters.status?.includes(request.status)
        );
      }
      
      if (filters.leave_type_id?.length) {
        filteredData = filteredData.filter(request => 
          request.leave_type_id && filters.leave_type_id?.includes(request.leave_type_id)
        );
      }
      
      if (filters.start_date) {
        filteredData = filteredData.filter(request => 
          request.start_date >= filters.start_date!
        );
      }
      
      if (filters.end_date) {
        filteredData = filteredData.filter(request => 
          request.end_date <= filters.end_date!
        );
      }
      
      if (filters.employee_id) {
        filteredData = filteredData.filter(request => 
          request.employee_id === filters.employee_id
        );
      }

      // Apply sorting
      if (pagination.sort_by) {
        const [sortField, sortOrder] = pagination.sort_by.split(':');
        filteredData.sort((a: any, b: any) => {
          if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
          if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      } else {
        filteredData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      // Apply pagination
      const from = (pagination.page - 1) * pagination.page_size;
      const to = from + pagination.page_size;
      const paginatedData = filteredData.slice(from, to);
      const total = filteredData.length;

      return {
        items: paginatedData,
        total,
        page: pagination.page,
        page_size: pagination.page_size,
        total_pages: Math.ceil(total / pagination.page_size)
      };
    },
    ...options
  });
};

export const useLeaveTypes = (options?: Omit<UseQueryOptions<LeaveType[]>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['leaveTypes'],
    queryFn: () => {
      // Return mock data for leave types
      return [...mockLeaveTypes];
    },
    ...options
  });
};

export const useLeaveBalances = (employeeId: string) => {
  return useQuery({
    queryKey: leaveQueryKeys.balances(employeeId),
    queryFn: () => {
      // Filter mock data by employee ID
      return mockLeaveBalances.filter(balance => balance.employee_id === employeeId);
    }
  });
};

export const useLeaveStats = (employeeId: string) => {
  return useQuery<LeaveStats>({
    queryKey: ['leaveStats', employeeId],
    queryFn: () => {
      // Calculate stats from mock data
      const employeeBalances = mockLeaveBalances.filter(b => b.employee_id === employeeId);
      const employeeRequests = mockLeaveRequests.filter(r => r.employee_id === employeeId);
      
      const totalApproved = employeeRequests
        .filter(r => r.status === 'approved')
        .reduce((sum, req) => sum + (req.total_days || 0), 0);
      
      const pendingRequests = employeeRequests.filter(r => r.status === 'pending').length;
      const upcomingTimeOff = employeeRequests
        .filter(r => r.status === 'approved' && new Date(r.start_date) > new Date())
        .length;
      
      return {
        total_leave_balance: employeeBalances.reduce((sum, b) => sum + (b.available_balance || 0), 0),
        total_approved_leave: totalApproved,
        pending_requests: pendingRequests,
        upcoming_time_off: upcomingTimeOff,
        leave_utilization_percentage: 0, // Would need more data to calculate accurately
        leave_by_type: employeeBalances.map(b => ({
          leave_type_id: b.leave_type_id,
          leave_type_name: b.leave_type?.name || 'Unknown',
          balance: b.available_balance || 0,
          used: b.used_balance || 0
        }))
      };
    }
  });
};

export const useLeaveAnalytics = (params: any) => {
  return useQuery<LeaveAnalyticsData[]>({
    queryKey: ['leaveAnalytics', params],
    queryFn: () => {
      // Simple mock analytics - in a real app, this would be more sophisticated
      const leaveTypes = mockLeaveTypes.map(lt => ({
        leave_type_id: lt.id,
        leave_type_name: lt.name,
        total_requests: mockLeaveRequests.filter(lr => lr.leave_type_id === lt.id).length,
        approved_requests: mockLeaveRequests.filter(lr => lr.leave_type_id === lt.id && lr.status === 'approved').length,
        rejected_requests: mockLeaveRequests.filter(lr => lr.leave_type_id === lt.id && lr.status === 'rejected').length,
        pending_requests: mockLeaveRequests.filter(lr => lr.leave_type_id === lt.id && lr.status === 'pending').length,
        average_duration: 0, // Would need more data to calculate
        peak_months: ['June', 'July', 'December'] // Mock data
      }));
      
      return leaveTypes as unknown as LeaveAnalyticsData[];
    }
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<LeaveRequest>) => {
      // In a real app, this would be an API call
      return new Promise<LeaveRequest>((resolve) => {
        // Simulate API delay
        setTimeout(() => {
          const newRequest: LeaveRequest = {
            ...data,
            id: `temp-${Date.now()}`,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            submitted_at: new Date().toISOString(),
            // Add other required fields with defaults
          } as LeaveRequest;
          
          // In a real app, we would update the mock data here
          // For now, we'll just return the new request and let React Query handle the cache
          resolve(newRequest);
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave_requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
    }
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeaveRequest> & { id: string }) => {
      // In a real app, this would be an API call
      return new Promise<LeaveRequest>((resolve) => {
        // Simulate API delay
        setTimeout(() => {
          const updatedRequest = {
            ...updates,
            id,
            updated_at: new Date().toISOString()
          } as LeaveRequest;
          
          // In a real app, we would update the mock data here
          // For now, we'll just return the updated request and let React Query handle the cache
          resolve(updatedRequest);
        }, 500);
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leave_requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      if (data.employee_id) {
        queryClient.invalidateQueries({ queryKey: ['leaveStats', data.employee_id] });
      }
    }
  });
};

export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // In a real app, this would be an API call
      return new Promise<string>((resolve) => {
        // Simulate API delay
        setTimeout(() => {
          resolve(id);
        }, 500);
      });
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['leave_requests'] });
      queryClient.removeQueries({ queryKey: ['leave_requests', id] });
    }
  });
};
