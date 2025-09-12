'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  IconButton,
  Chip,
  Stack,
  Paper,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  styled,
  Tooltip,
} from '@mui/material'
import {
  ExpandMore,
  ExpandLess,
  Person,
  Business,
  Work,
  Email,
  Phone,
  Edit,
  Add,
  Visibility,
  Share,
  Print,
  Download,
  Group,
  AccountTree,
  SupervisorAccount,
  PeopleAlt,
  Close,
  Search,
  FilterList,
} from '@mui/icons-material'

// Types
interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  display_name: string
  email: string
  phone?: string
  profile_photo_url?: string
  position?: {
    title: string
    level: string
  }
  department?: {
    name: string
    code: string
  }
  manager_employee_id?: string
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave'
  direct_reports?: Employee[]
  is_leadership_role?: boolean
}

interface Department {
  id: string
  name: string
  code: string
  manager?: Employee
  employees: Employee[]
  budget?: number
  headcount: number
}

// Styled Components
const OrgCard = styled(Card)(({ theme }) => ({
  minWidth: 280,
  margin: theme.spacing(1),
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: `2px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}))

const ConnectorLine = styled(Box)(({ theme }) => ({
  width: 2,
  backgroundColor: theme.palette.divider,
  margin: '0 auto',
}))

const HorizontalLine = styled(Box)(({ theme }) => ({
  height: 2,
  backgroundColor: theme.palette.divider,
  width: '100%',
}))

export function OrganizationChart() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // State
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [viewMode, setViewMode] = useState<'hierarchy' | 'departments'>('hierarchy')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Load real data
  useEffect(() => {
    loadOrganizationData()
  }, [])

  const loadOrganizationData = async () => {
    try {
      // Import the real data service
      const { default: RealDataService } = await import('../../services/realDataService')

      // Fetch real employee data
      const result = await RealDataService.getEmployeeDirectory({})

      // Convert to organization format and build hierarchy
      const orgEmployees = result.data.map((emp: any) => ({
        id: emp.id,
        employee_id: emp.employee_id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        display_name: `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
        phone: emp.phone,
        profile_photo_url: emp.profile_photo_url || '',
        position: emp.position,
        department: emp.department,
        employment_status: emp.employment_status,
        manager_employee_id: emp.manager_employee_id,
        is_leadership_role: emp.is_leadership_role || false
      }))

      buildHierarchy(orgEmployees)
    } catch (error) {
      // Fallback to demo data
      loadDemoDataFallback()
    }
  }

  const buildHierarchy = (employees: Employee[]) => {
    // Build hierarchy
    const employeeMap = new Map(employees.map(emp => [emp.employee_id, emp]))
    employees.forEach(emp => {
      if (emp.manager_employee_id) {
        const manager = employeeMap.get(emp.manager_employee_id)
        if (manager) {
          if (!manager.direct_reports) manager.direct_reports = []
          manager.direct_reports.push(emp)
        }
      }
    })

    setEmployees(employees)

    // Create departments
    const deptMap = new Map<string, Department>()
    employees.forEach(emp => {
      if (emp.department) {
        const deptKey = emp.department.code
        if (!deptMap.has(deptKey)) {
          deptMap.set(deptKey, {
            id: deptKey,
            name: emp.department.name,
            code: emp.department.code,
            employees: [],
            headcount: 0,
          })
        }
        const dept = deptMap.get(deptKey)!
        dept.employees.push(emp)
        dept.headcount++
      }
    })

    setDepartments(Array.from(deptMap.values()))

    // Build hierarchy tree
    const hierarchy = employees.filter(emp => !emp.manager_employee_id)
    setHierarchy(hierarchy)

    // Auto-expand first level
    const rootEmployee = employees.find(emp => !emp.manager_employee_id)
    if (rootEmployee) {
      setExpandedNodes(new Set([rootEmployee.id]))
    }
  }

  const loadDemoDataFallback = () => {
    // Demo organizational data
    const demoEmployees: Employee[] = [
      {
        id: '1',
        employee_id: 'CEO001',
        first_name: 'John',
        last_name: 'Smith',
        display_name: 'John Smith',
        email: 'john.smith@company.com',
        phone: '+1-555-0101',
        profile_photo_url: '',
        position: { title: 'Chief Executive Officer', level: 'Executive' },
        department: { name: 'Executive', code: 'EXEC' },
        employment_status: 'active',
        is_leadership_role: true,
      },
      {
        id: '2',
        employee_id: 'CTO001',
        first_name: 'Sarah',
        last_name: 'Johnson',
        display_name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        phone: '+1-555-0102',
        profile_photo_url: '',
        position: { title: 'Chief Technology Officer', level: 'Executive' },
        department: { name: 'Engineering', code: 'ENG' },
        manager_employee_id: 'CEO001',
        employment_status: 'active',
        is_leadership_role: true,
      },
      {
        id: '3',
        employee_id: 'CFO001',
        first_name: 'Michael',
        last_name: 'Chen',
        display_name: 'Michael Chen',
        email: 'michael.chen@company.com',
        phone: '+1-555-0103',
        profile_photo_url: '',
        position: { title: 'Chief Financial Officer', level: 'Executive' },
        department: { name: 'Finance', code: 'FIN' },
        manager_employee_id: 'CEO001',
        employment_status: 'active',
        is_leadership_role: true,
      },
      {
        id: '4',
        employee_id: 'ENG001',
        first_name: 'Emily',
        last_name: 'Rodriguez',
        display_name: 'Emily Rodriguez',
        email: 'emily.rodriguez@company.com',
        phone: '+1-555-0104',
        profile_photo_url: '',
        position: { title: 'Senior Software Engineer', level: 'Senior' },
        department: { name: 'Engineering', code: 'ENG' },
        manager_employee_id: 'CTO001',
        employment_status: 'active',
        is_leadership_role: false,
      },
      {
        id: '5',
        employee_id: 'ENG002',
        first_name: 'David',
        last_name: 'Wilson',
        display_name: 'David Wilson',
        email: 'david.wilson@company.com',
        phone: '+1-555-0105',
        profile_photo_url: '',
        position: { title: 'Frontend Developer', level: 'Mid' },
        department: { name: 'Engineering', code: 'ENG' },
        manager_employee_id: 'CTO001',
        employment_status: 'active',
        is_leadership_role: false,
      },
      {
        id: '6',
        employee_id: 'FIN001',
        first_name: 'Lisa',
        last_name: 'Garcia',
        display_name: 'Lisa Garcia',
        email: 'lisa.garcia@company.com',
        phone: '+1-555-0106',
        profile_photo_url: '',
        position: { title: 'Financial Analyst', level: 'Mid' },
        department: { name: 'Finance', code: 'FIN' },
        manager_employee_id: 'CFO001',
        employment_status: 'active',
        is_leadership_role: false,
      },
    ]

    buildHierarchy(demoEmployees)
    setLoading(false)
  }

  // Get root employees (those without managers)
  const rootEmployees = useMemo(() => 
    employees.filter(emp => !emp.manager_employee_id),
    [employees]
  )

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees
    const term = searchTerm.toLowerCase()
    return employees.filter(emp => 
      emp.display_name.toLowerCase().includes(term) ||
      emp.employee_id.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.position?.title.toLowerCase().includes(term) ||
      emp.department?.name.toLowerCase().includes(term)
    )
  }, [employees, searchTerm])

  const toggleNode = (employeeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId)
    } else {
      newExpanded.add(employeeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowEmployeeDialog(true)
  }

  // Employee Card Component
  const EmployeeCard = ({ employee, isRoot = false }: { employee: Employee; isRoot?: boolean }) => (
    <div>
      <OrgCard onClick={() => handleEmployeeClick(employee)}>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={2}>
            {/* Header */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={employee.profile_photo_url}
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: isRoot ? theme.palette.primary.main : theme.palette.secondary.main,
                  color: 'white',
                }}
              >
                {employee.first_name[0]}{employee.last_name[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  {employee.display_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employee.employee_id}
                </Typography>
              </Box>
              {employee.is_leadership_role && (
                <SupervisorAccount color="primary" />
              )}
            </Stack>

            {/* Position & Department */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                {employee.position?.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {employee.department?.name}
              </Typography>
            </Box>

            {/* Contact Info */}
            <Stack spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Email fontSize="small" color="action" />
                <Typography variant="caption" sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {employee.email}
                </Typography>
              </Stack>
              {employee.phone && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="caption">
                    {employee.phone}
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* Status & Reports */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Chip
                label={employee.employment_status}
                size="small"
                color={employee.employment_status === 'active' ? 'success' : 'default'}
                variant="outlined"
              />
              {employee.direct_reports && employee.direct_reports.length > 0 && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Group fontSize="small" color="action" />
                  <Typography variant="caption">
                    {employee.direct_reports.length} reports
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* Expand Button */}
            {employee.direct_reports && employee.direct_reports.length > 0 && (
              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={expandedNodes.has(employee.id) ? <ExpandLess /> : <ExpandMore />}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNode(employee.id)
                }}
                sx={{ borderRadius: 2 }}
              >
                {expandedNodes.has(employee.id) ? 'Collapse' : 'Expand'} Team
              </Button>
            )}
          </Stack>
        </CardContent>
      </OrgCard>
    </div>
  )

  // Recursive component to render the hierarchy
  const HierarchyNode = ({ employee, level = 0 }: { employee: Employee; level?: number }) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <EmployeeCard employee={employee} isRoot={level === 0} />
      </Box>

      {employee.direct_reports && employee.direct_reports.length > 0 && (
        <Collapse in={expandedNodes.has(employee.id)}>
          <Box sx={{ position: 'relative' }}>
            {/* Connector lines */}
            {employee.direct_reports.length > 1 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mb: 2,
                position: 'relative'
              }}>
                <ConnectorLine sx={{ height: 30 }} />
                <HorizontalLine sx={{ 
                  position: 'absolute',
                  top: 15,
                  width: `${(employee.direct_reports.length - 1) * 300}px`,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }} />
              </Box>
            )}

            {/* Direct reports */}
            <Grid container spacing={2} justifyContent="center">
              {employee.direct_reports.map((report, index) => (
                <Grid item key={report.id}>
                  <Box sx={{ position: 'relative' }}>
                    {employee.direct_reports!.length > 1 && (
                      <ConnectorLine sx={{ height: 30, mb: 2 }} />
                    )}
                    <HierarchyNode employee={report} level={level + 1} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>
      )}
    </Box>
  )

  // Department Card Component
  const DepartmentCard = ({ department }: { department: Department }) => (
    <div>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ 
                  backgroundColor: theme.palette.primary.main,
                  width: 56,
                  height: 56
                }}>
                  <Business />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {department.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {department.code} • {department.headcount} employees
                  </Typography>
                </Box>
              </Stack>
              <Chip 
                label={`${department.headcount} people`}
                color="primary"
                variant="outlined"
              />
            </Stack>

            {/* Manager */}
            {department.manager && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Department Manager
                </Typography>
                <EmployeeCard employee={department.manager} />
              </Box>
            )}

            {/* Team Members */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Team Members ({department.employees.length})
              </Typography>
              <Grid container spacing={2}>
                {department.employees
                  .filter(emp => !emp.is_leadership_role)
                  .map(employee => (
                  <Grid item xs={12} sm={6} lg={4} key={employee.id}>
                    <EmployeeCard employee={employee} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </div>
  )

  // Employee Detail Dialog
  const EmployeeDetailDialog = () => (
    <Dialog
      open={showEmployeeDialog}
      onClose={() => setShowEmployeeDialog(false)}
      maxWidth="md"
      fullWidth
    >
      {selectedEmployee && (
        <>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Employee Details</Typography>
              <IconButton onClick={() => setShowEmployeeDialog(false)}>
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Stack alignItems="center" spacing={2}>
                  <Avatar
                    src={selectedEmployee.profile_photo_url}
                    sx={{ width: 120, height: 120 }}
                  >
                    {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                  </Avatar>
                  <Typography variant="h5" textAlign="center">
                    {selectedEmployee.display_name}
                  </Typography>
                  <Chip
                    label={selectedEmployee.employment_status}
                    color={selectedEmployee.employment_status === 'active' ? 'success' : 'default'}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Position Information
                    </Typography>
                    <Typography><strong>Title:</strong> {selectedEmployee.position?.title}</Typography>
                    <Typography><strong>Level:</strong> {selectedEmployee.position?.level}</Typography>
                    <Typography><strong>Department:</strong> {selectedEmployee.department?.name}</Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                    <Typography><strong>Employee ID:</strong> {selectedEmployee.employee_id}</Typography>
                    <Typography><strong>Email:</strong> {selectedEmployee.email}</Typography>
                    {selectedEmployee.phone && (
                      <Typography><strong>Phone:</strong> {selectedEmployee.phone}</Typography>
                    )}
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Reporting Structure
                    </Typography>
                    {selectedEmployee.manager_employee_id && (
                      <Typography>
                        <strong>Reports to:</strong> {
                          employees.find(emp => emp.employee_id === selectedEmployee.manager_employee_id)?.display_name || 'Unknown'
                        }
                      </Typography>
                    )}
                    {selectedEmployee.direct_reports && selectedEmployee.direct_reports.length > 0 && (
                      <Typography>
                        <strong>Direct Reports:</strong> {selectedEmployee.direct_reports.length} employees
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEmployeeDialog(false)}>
              Close
            </Button>
            <Button variant="contained" startIcon={<Edit />}>
              Edit Employee
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }} className="container-fluid px-2 px-md-3 px-lg-4">
      {/* Header */}
      <Stack spacing={3} sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Organization Chart
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visualize your company structure and reporting relationships
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Print />}>
              Print
            </Button>
            <Button variant="outlined" startIcon={<Download />}>
              Export
            </Button>
            <Button variant="contained" startIcon={<Add />}>
              Add Employee
            </Button>
          </Stack>
        </Stack>

        {/* Search and Controls */}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ flex: 1, maxWidth: 400 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>View Mode</InputLabel>
            <Select
              value={viewMode}
              label="View Mode"
              onChange={(e) => setViewMode(e.target.value as any)}
            >
              <MenuItem value="hierarchy">Hierarchy</MenuItem>
              <MenuItem value="departments">By Department</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Content */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6">Loading organization chart...</Typography>
        </Box>
      ) : (
        viewMode === 'hierarchy' ? (
          <Box sx={{ 
            overflowX: 'auto',
            pb: 4,
            minHeight: 600
          }}>
            {rootEmployees.map(employee => (
              <HierarchyNode key={employee.id} employee={employee} />
            ))}
          </Box>
        ) : (
          <Stack spacing={3}>
            {departments.map(department => (
              <DepartmentCard key={department.id} department={department} />
            ))}
          </Stack>
        )
      )}

      {/* Employee Detail Dialog */}
      <EmployeeDetailDialog />
    </Box>
  )
}
