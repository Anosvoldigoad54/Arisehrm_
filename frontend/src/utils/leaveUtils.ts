import { LeaveRequest, LeaveType } from '../components/leave/types';

/**
 * Calculate the number of business days between two dates
 */
export const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

/**
 * Format a date range for display
 */
export const formatDateRange = (
  startDate: string | Date, 
  endDate: string | Date, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startStr = start.toLocaleDateString(undefined, options);
  
  // If same day, just return one date
  if (start.toDateString() === end.toDateString()) {
    return startStr;
  }
  
  // If same month, format as "Jan 1-15, 2023"
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    const dayOptions = { day: 'numeric' };
    return `${start.toLocaleDateString(undefined, { ...options, day: 'numeric' }).split(' ')[0]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
  }
  
  // If different months but same year, format as "Jan 30 - Feb 2, 2023"
  if (start.getFullYear() === end.getFullYear()) {
    const startMonth = start.toLocaleDateString(undefined, { month: 'short' });
    const endMonth = end.toLocaleDateString(undefined, { month: 'short' });
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  }
  
  // Otherwise, show full dates
  const endStr = end.toLocaleDateString(undefined, options);
  return `${startStr} - ${endStr}`;
};

/**
 * Get the status color for a leave request
 */
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success.main';
    case 'pending':
      return 'warning.main';
    case 'rejected':
      return 'error.main';
    case 'cancelled':
      return 'text.secondary';
    default:
      return 'text.primary';
  }
};

/**
 * Get the status icon for a leave request
 */
export const getStatusIcon = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return '✅';
    case 'pending':
      return '⏳';
    case 'rejected':
      return '❌';
    case 'cancelled':
      return '🚫';
    default:
      return 'ℹ️';
  }
};

/**
 * Filter leave requests by status
 */
export const filterLeaveRequests = (
  requests: LeaveRequest[], 
  filters: { 
    status?: string[];
    leaveTypeId?: string[];
    startDate?: string;
    endDate?: string;
  } = {}
): LeaveRequest[] => {
  return requests.filter(request => {
    // Filter by status
    if (filters.status?.length && !filters.status.includes(request.status)) {
      return false;
    }
    
    // Filter by leave type
    if (filters.leaveTypeId?.length && 
        (!request.leave_type_id || !filters.leaveTypeId.includes(request.leave_type_id))) {
      return false;
    }
    
    // Filter by date range
    if (filters.startDate && new Date(request.end_date) < new Date(filters.startDate)) {
      return false;
    }
    
    if (filters.endDate && new Date(request.start_date) > new Date(filters.endDate)) {
      return false;
    }
    
    return true;
  });
};

/**
 * Sort leave requests by date (newest first)
 */
export const sortLeaveRequests = (
  requests: LeaveRequest[], 
  sortBy: 'start_date' | 'end_date' | 'created_at' = 'start_date',
  order: 'asc' | 'desc' = 'desc'
): LeaveRequest[] => {
  return [...requests].sort((a, b) => {
    const dateA = new Date(a[sortBy] || 0).getTime();
    const dateB = new Date(b[sortBy] || 0).getTime();
    
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Calculate leave statistics
 */
export const calculateLeaveStats = (requests: LeaveRequest[]): {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  byLeaveType: Record<string, number>;
  byMonth: Record<string, number>;
} => {
  const stats = {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    byLeaveType: {} as Record<string, number>,
    byMonth: {} as Record<string, number>,
  };

  requests.forEach(request => {
    stats.total += request.total_days || 0;
    
    if (request.status === 'approved') {
      stats.approved += request.total_days || 0;
    } else if (request.status === 'pending') {
      stats.pending += request.total_days || 0;
    } else if (request.status === 'rejected') {
      stats.rejected += request.total_days || 0;
    }
    
    // Group by leave type
    if (request.leave_type) {
      const typeName = request.leave_type.name;
      stats.byLeaveType[typeName] = (stats.byLeaveType[typeName] || 0) + (request.total_days || 0);
    }
    
    // Group by month
    const monthYear = new Date(request.start_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    stats.byMonth[monthYear] = (stats.byMonth[monthYear] || 0) + (request.total_days || 0);
  });

  return stats;
};

/**
 * Check if a date range has any conflicts with existing leave requests
 */
export const hasLeaveConflict = (
  startDate: string | Date,
  endDate: string | Date,
  existingRequests: LeaveRequest[],
  excludeRequestId?: string
): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return existingRequests.some(request => {
    // Skip the request we're checking against (for updates)
    if (excludeRequestId && request.id === excludeRequestId) {
      return false;
    }
    
    // Skip cancelled/rejected requests
    if (['cancelled', 'rejected'].includes(request.status)) {
      return false;
    }
    
    const requestStart = new Date(request.start_date);
    const requestEnd = new Date(request.end_date);
    
    // Check for overlap
    return (
      (start >= requestStart && start <= requestEnd) ||
      (end >= requestStart && end <= requestEnd) ||
      (start <= requestStart && end >= requestEnd)
    );
  });
};
