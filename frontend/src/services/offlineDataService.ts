/**
 * Offline Data Service
 * Provides realistic demo data when network is unavailable
 */

export class OfflineDataService {
  
  static getDashboardMetrics() {
    return {
      totalEmployees: 12,
      activeEmployees: 11,
      presentToday: 8,
      lateToday: 2,
      onLeaveToday: 1,
      pendingLeaveRequests: 3,
      totalDepartments: 4,
      avgAttendanceRate: 85.7,
      lastUpdated: new Date().toISOString()
    }
  }
  
  static getEmployeeStats() {
    return {
      totalEmployees: 12,
      activeEmployees: 11,
      presentToday: 8,
      lateToday: 2,
      onLeaveToday: 1,
      totalDepartments: 4,
      avgAttendanceRate: 85.7,
      lastUpdated: new Date().toISOString()
    }
  }
  
  static getEmployeeDirectory() {
    return {
      data: [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@company.com',
          department: 'Engineering',
          position: 'Senior Developer',
          employment_status: 'active',
          profile_photo_url: null
        },
        {
          employee_id: 'EMP002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@company.com',
          department: 'HR',
          position: 'HR Manager',
          employment_status: 'active',
          profile_photo_url: null
        },
        {
          employee_id: 'EMP003',
          first_name: 'Mike',
          last_name: 'Johnson',
          email: 'mike.johnson@company.com',
          department: 'Sales',
          position: 'Sales Representative',
          employment_status: 'active',
          profile_photo_url: null
        }
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 3,
        hasMore: false
      }
    }
  }
  
  static getDepartments() {
    return [
      {
        id: 'dept-1',
        name: 'Engineering',
        code: 'ENG',
        description: 'Software development team',
        is_active: true,
        employee_count: 6
      },
      {
        id: 'dept-2',
        name: 'Human Resources',
        code: 'HR',
        description: 'People operations',
        is_active: true,
        employee_count: 2
      },
      {
        id: 'dept-3',
        name: 'Sales',
        code: 'SALES',
        description: 'Revenue generation',
        is_active: true,
        employee_count: 3
      },
      {
        id: 'dept-4',
        name: 'Marketing',
        code: 'MKT',
        description: 'Brand and promotion',
        is_active: true,
        employee_count: 1
      }
    ]
  }
  
  static getAttendanceData() {
    const today = new Date().toISOString().split('T')[0]
    return [
      {
        id: 'att-1',
        employee_id: 'EMP001',
        date: today,
        status: 'present',
        clock_in: '09:00:00',
        clock_out: null
      },
      {
        id: 'att-2',
        employee_id: 'EMP002',
        date: today,
        status: 'present',
        clock_in: '08:45:00',
        clock_out: null
      },
      {
        id: 'att-3',
        employee_id: 'EMP003',
        date: today,
        status: 'late',
        clock_in: '09:30:00',
        clock_out: null
      }
    ]
  }
  
  static getLeaveRequests() {
    return [
      {
        id: 'leave-1',
        employee_id: 'EMP001',
        start_date: '2024-02-15',
        end_date: '2024-02-16',
        days_requested: 2,
        reason: 'Personal time off',
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: 'leave-2',
        employee_id: 'EMP002',
        start_date: '2024-02-20',
        end_date: '2024-02-22',
        days_requested: 3,
        reason: 'Family vacation',
        status: 'approved',
        created_at: new Date().toISOString()
      }
    ]
  }
  
  static getDashboardData() {
    return {
      employees: this.getEmployeeStats(),
      departments: this.getDepartments(),
      attendance: this.getAttendanceData(),
      leaveRequests: this.getLeaveRequests()
    }
  }
}

export default OfflineDataService
