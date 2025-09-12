import RealDataService from '../services/realDataService'
import { toast } from 'sonner'

/**
 * Data Flow Testing Utility
 * Tests all RealDataService methods to ensure proper integration
 */

export interface TestResult {
  service: string
  method: string
  success: boolean
  message: string
  dataCount?: number
  error?: string
}

export interface TestSuite {
  name: string
  results: TestResult[]
  success: boolean
  totalTests: number
  passedTests: number
}

export async function testEmployeeDataFlow(): Promise<TestSuite> {
  const results: TestResult[] = []
  
  // Test Employee Directory
  try {
    const employeeResult = await RealDataService.getEmployeeDirectory({})
    results.push({
      service: 'Employee',
      method: 'getEmployeeDirectory',
      success: true,
      message: 'Employee directory loaded successfully',
      dataCount: employeeResult.data?.length || 0
    })
  } catch (error) {
    results.push({
      service: 'Employee',
      method: 'getEmployeeDirectory',
      success: false,
      message: 'Failed to load employee directory',
      error: error.message
    })
  }

  // Test Employee Stats
  try {
    const statsResult = await RealDataService.getEmployeeStats()
    results.push({
      service: 'Employee',
      method: 'getEmployeeStats',
      success: true,
      message: 'Employee stats loaded successfully',
      dataCount: statsResult.total || 0
    })
  } catch (error) {
    results.push({
      service: 'Employee',
      method: 'getEmployeeStats',
      success: false,
      message: 'Failed to load employee stats',
      error: error.message
    })
  }

  // Test Departments
  try {
    const deptResult = await RealDataService.getDepartments()
    results.push({
      service: 'Employee',
      method: 'getDepartments',
      success: true,
      message: 'Departments loaded successfully',
      dataCount: deptResult.length || 0
    })
  } catch (error) {
    results.push({
      service: 'Employee',
      method: 'getDepartments',
      success: false,
      message: 'Failed to load departments',
      error: error.message
    })
  }

  const passedTests = results.filter(r => r.success).length
  
  return {
    name: 'Employee Data Flow',
    results,
    success: passedTests === results.length,
    totalTests: results.length,
    passedTests
  }
}

export async function testAttendanceDataFlow(): Promise<TestSuite> {
  const results: TestResult[] = []
  
  // Test Attendance Data
  try {
    const attendanceResult = await RealDataService.getAttendanceData()
    results.push({
      service: 'Attendance',
      method: 'getAttendanceData',
      success: true,
      message: 'Attendance data loaded successfully',
      dataCount: attendanceResult.records?.length || 0
    })
  } catch (error) {
    results.push({
      service: 'Attendance',
      method: 'getAttendanceData',
      success: false,
      message: 'Failed to load attendance data',
      error: error.message
    })
  }

  const passedTests = results.filter(r => r.success).length
  
  return {
    name: 'Attendance Data Flow',
    results,
    success: passedTests === results.length,
    totalTests: results.length,
    passedTests
  }
}

export async function testLeaveDataFlow(): Promise<TestSuite> {
  const results: TestResult[] = []
  
  // Test Leave Requests
  try {
    const leaveResult = await RealDataService.getLeaveRequests({})
    results.push({
      service: 'Leave',
      method: 'getLeaveRequests',
      success: true,
      message: 'Leave requests loaded successfully',
      dataCount: leaveResult.requests?.length || 0
    })
  } catch (error) {
    results.push({
      service: 'Leave',
      method: 'getLeaveRequests',
      success: false,
      message: 'Failed to load leave requests',
      error: error.message
    })
  }

  // Test Leave Types
  try {
    const leaveTypesResult = await RealDataService.getLeaveTypes()
    results.push({
      service: 'Leave',
      method: 'getLeaveTypes',
      success: true,
      message: 'Leave types loaded successfully',
      dataCount: leaveTypesResult.length || 0
    })
  } catch (error) {
    results.push({
      service: 'Leave',
      method: 'getLeaveTypes',
      success: false,
      message: 'Failed to load leave types',
      error: error.message
    })
  }

  const passedTests = results.filter(r => r.success).length
  
  return {
    name: 'Leave Data Flow',
    results,
    success: passedTests === results.length,
    totalTests: results.length,
    passedTests
  }
}

export async function testDashboardDataFlow(): Promise<TestSuite> {
  const results: TestResult[] = []
  
  // Test Dashboard Data
  try {
    const dashboardResult = await RealDataService.getDashboardData()
    results.push({
      service: 'Dashboard',
      method: 'getDashboardData',
      success: true,
      message: 'Dashboard data loaded successfully',
      dataCount: dashboardResult.departments?.length || 0
    })
  } catch (error) {
    results.push({
      service: 'Dashboard',
      method: 'getDashboardData',
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message
    })
  }

  const passedTests = results.filter(r => r.success).length
  
  return {
    name: 'Dashboard Data Flow',
    results,
    success: passedTests === results.length,
    totalTests: results.length,
    passedTests
  }
}

export async function testAllDataFlows(): Promise<{
  suites: TestSuite[]
  overallSuccess: boolean
  totalTests: number
  totalPassed: number
}> {
  // In production, use proper logging service instead of console
  // loggingService.logInfo('Starting comprehensive data flow tests')
  
  const suites = await Promise.all([
    testEmployeeDataFlow(),
    testAttendanceDataFlow(),
    testLeaveDataFlow(),
    testDashboardDataFlow()
  ])

  const totalTests = suites.reduce((sum, suite) => sum + suite.totalTests, 0)
  const totalPassed = suites.reduce((sum, suite) => sum + suite.passedTests, 0)
  const overallSuccess = suites.every(suite => suite.success)

  // In production, use proper logging service for test results
  // loggingService.logInfo('Data flow test results', { totalTests, totalPassed, overallSuccess })

  if (overallSuccess) {
    toast.success(`All data flows working! (${totalPassed}/${totalTests} tests passed)`)
  } else {
    toast.warning(`Some data flows need attention (${totalPassed}/${totalTests} tests passed)`)
  }

  return {
    suites,
    overallSuccess,
    totalTests,
    totalPassed
  }
}
