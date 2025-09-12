'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Paper,
  InputAdornment,
  Tooltip,
  Fab,
  useTheme,
  alpha,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { log } from '../../services/loggingService'
import { getRoleColor, getDenimGradient } from '../../styles/denimTheme'
import RouteErrorBoundary from '../common/RouteErrorBoundary'

interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  position: string
  department: string
  hire_date: string
  status: 'active' | 'inactive' | 'terminated'
  avatar_url?: string
  role: string
  manager_employee_id?: string
  manager_name?: string
  salary?: number
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  skills?: string[]
  location?: string
  work_type: 'full_time' | 'part_time' | 'contract' | 'intern'
}

interface EmployeeFilters {
  search: string
  department: string[]
  status: string[]
  role: string[]
  workType: string[]
}

const initialFilters: EmployeeFilters = {
  search: '',
  department: [],
  status: [],
  role: [],
  workType: []
}

type ViewMode = 'cards' | 'table'

const ConsolidatedEmployeeDirectory: React.FC = () => {
  const theme = useTheme()
  const { profile } = useAuth()
  const { canManageEmployees, canViewAllEmployees } = usePermissions()
  const queryClient = useQueryClient()

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [filters, setFilters] = useState<EmployeeFilters>(initialFilters)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [tabValue, setTabValue] = useState(0)

  // Fetch employees with proper permissions
  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['employees', profile?.employee_id, filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('user_profiles')
          .select(`
            id,
            employee_id,
            first_name,
            last_name,
            email,
            phone_number,
            position,
            department,
            hire_date,
            status,
            avatar_url,
            role,
            manager_employee_id,
            salary,
            emergency_contact,
            skills,
            location,
            work_type,
            manager:user_profiles!manager_employee_id(first_name, last_name)
          `)

        // Apply permission-based filtering
        if (!canViewAllEmployees) {
          // If user can't view all employees, show only their team
          query = query.or(`employee_id.eq.${profile?.employee_id},manager_employee_id.eq.${profile?.employee_id}`)
        }

        // Apply search filter
        if (filters.search) {
          query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_id.ilike.%${filters.search}%`)
        }

        // Apply department filter
        if (filters.department.length > 0) {
          query = query.in('department', filters.department)
        }

        // Apply status filter
        if (filters.status.length > 0) {
          query = query.in('status', filters.status)
        }

        // Apply role filter
        if (filters.role.length > 0) {
          query = query.in('role', filters.role)
        }

        // Apply work type filter
        if (filters.workType.length > 0) {
          query = query.in('work_type', filters.workType)
        }

        const { data, error } = await query.order('first_name')

        if (error) {
          log.error('Failed to fetch employees', error)
          throw error
        }

        // Transform data to include manager name
        const transformedData = data?.map(emp => ({
          ...emp,
          manager_name: emp.manager ? `${emp.manager.first_name} ${emp.manager.last_name}` : undefined
        })) || []

        log.info('Employees fetched successfully', { count: transformedData.length })
        return transformedData as Employee[]
      } catch (error) {
        log.error('Error in employee query', error as Error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['employee-filter-options'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('department, role, work_type')
        .eq('status', 'active')

      const departments = [...new Set(data?.map(d => d.department).filter(Boolean))]
      const roles = [...new Set(data?.map(d => d.role).filter(Boolean))]
      const workTypes = [...new Set(data?.map(d => d.work_type).filter(Boolean))]

      return { departments, roles, workTypes }
    }
  })

  // Filtered and paginated employees
  const filteredEmployees = useMemo(() => {
    let filtered = employees

    // Apply tab filter
    if (tabValue === 1) {
      filtered = filtered.filter(emp => emp.status === 'active')
    } else if (tabValue === 2) {
      filtered = filtered.filter(emp => emp.status === 'inactive')
    }

    return filtered
  }, [employees, tabValue])

  const paginatedEmployees = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredEmployees.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredEmployees, page, rowsPerPage])

  // Event handlers
  const handleFilterChange = useCallback((newFilters: Partial<EmployeeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPage(0) // Reset pagination
  }, [])

  const handleEmployeeSelect = useCallback((employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedEmployees(
      selectedEmployees.length === paginatedEmployees.length 
        ? [] 
        : paginatedEmployees.map(emp => emp.id)
    )
  }, [selectedEmployees, paginatedEmployees])

  const clearFilters = useCallback(() => {
    setFilters(initialFilters)
    setPage(0)
  }, [])

  // Employee card component
  const EmployeeCard: React.FC<{ employee: Employee }> = ({ employee }) => {
    const roleColor = getRoleColor(employee.role)
    
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          }
        }}
        onClick={() => setSelectedEmployee(employee)}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              src={employee.avatar_url}
              sx={{
                width: 56,
                height: 56,
                mr: 2,
                bgcolor: roleColor,
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              {`${employee.first_name[0]}${employee.last_name[0]}`}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" noWrap>
                {employee.first_name} {employee.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {employee.position}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {employee.employee_id}
              </Typography>
            </Box>
            {canManageEmployees && (
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); /* Handle edit */ }}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1}>
            <Box display="flex" alignItems="center">
              <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" noWrap>
                {employee.department}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" noWrap>
                {employee.email}
              </Typography>
            </Box>

            {employee.phone_number && (
              <Box display="flex" alignItems="center">
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" noWrap>
                  {employee.phone_number}
                </Typography>
              </Box>
            )}

            {employee.manager_name && (
              <Box display="flex" alignItems="center">
                <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" noWrap>
                  Reports to: {employee.manager_name}
                </Typography>
              </Box>
            )}
          </Stack>

          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={employee.status}
              size="small"
              color={employee.status === 'active' ? 'success' : employee.status === 'inactive' ? 'warning' : 'error'}
              variant="filled"
            />
            <Chip
              label={employee.role.replace('_', ' ')}
              size="small"
              sx={{ 
                bgcolor: alpha(roleColor, 0.1),
                color: roleColor,
                fontWeight: 500
              }}
            />
            <Chip
              label={employee.work_type.replace('_', ' ')}
              size="small"
              variant="outlined"
            />
          </Box>

          {employee.skills && employee.skills.length > 0 && (
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Skills:
              </Typography>
              <Box display="flex" gap={0.5} flexWrap="wrap">
                {employee.skills.slice(0, 3).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                ))}
                {employee.skills.length > 3 && (
                  <Chip
                    label={`+${employee.skills.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load employees. Please try again.
      </Alert>
    )
  }

  return (
    <RouteErrorBoundary routeName="Employee Directory">
      <Box p={3}>
        {/* Header */}
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Employee Directory
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and view employee information
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            {canManageEmployees && (
              <>
                <Button
                  startIcon={<UploadIcon />}
                  variant="outlined"
                  size="small"
                >
                  Import
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  size="small"
                >
                  Export
                </Button>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setShowAddDialog(true)}
                >
                  Add Employee
                </Button>
              </>
            )}
          </Stack>
        </Box>

        {/* Filters and Search */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Search employees..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 300 }}
              size="small"
            />
            
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "contained" : "outlined"}
              size="small"
            >
              Filters
            </Button>

            <Box display="flex" gap={1}>
              <Tooltip title="Card View">
                <IconButton
                  onClick={() => setViewMode('cards')}
                  color={viewMode === 'cards' ? 'primary' : 'default'}
                  size="small"
                >
                  <ViewModuleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Table View">
                <IconButton
                  onClick={() => setViewMode('table')}
                  color={viewMode === 'table' ? 'primary' : 'default'}
                  size="small"
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Advanced Filters */}
          {showFilters && (
            <Box mt={2} pt={2} borderTop={1} borderColor="divider">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      multiple
                      value={filters.department}
                      onChange={(e) => handleFilterChange({ department: e.target.value as string[] })}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {filterOptions?.departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          <Checkbox checked={filters.department.includes(dept)} />
                          <ListItemText primary={dept} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      multiple
                      value={filters.status}
                      onChange={(e) => handleFilterChange({ status: e.target.value as string[] })}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {['active', 'inactive', 'terminated'].map((status) => (
                        <MenuItem key={status} value={status}>
                          <Checkbox checked={filters.status.includes(status)} />
                          <ListItemText primary={status} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select
                      multiple
                      value={filters.role}
                      onChange={(e) => handleFilterChange({ role: e.target.value as string[] })}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {filterOptions?.roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          <Checkbox checked={filters.role.includes(role)} />
                          <ListItemText primary={role.replace('_', ' ')} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" gap={1}>
                    <Button onClick={clearFilters} variant="outlined" size="small" fullWidth>
                      Clear
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Tabs */}
        <Box mb={3}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label={`All (${employees.length})`} />
            <Tab label={`Active (${employees.filter(e => e.status === 'active').length})`} />
            <Tab label={`Inactive (${employees.filter(e => e.status === 'inactive').length})`} />
          </Tabs>
        </Box>

        {/* Results Summary */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
            {selectedEmployees.length > 0 && ` (${selectedEmployees.length} selected)`}
          </Typography>
        </Box>

        {/* Employee List */}
        {viewMode === 'cards' ? (
          <Grid container spacing={3}>
            {paginatedEmployees.map((employee) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
                <EmployeeCard employee={employee} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < paginatedEmployees.length}
                      checked={paginatedEmployees.length > 0 && selectedEmployees.length === paginatedEmployees.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleEmployeeSelect(employee.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={employee.avatar_url}
                          sx={{ width: 32, height: 32, mr: 2 }}
                        >
                          {`${employee.first_name[0]}${employee.last_name[0]}`}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {employee.first_name} {employee.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.employee_id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.status}
                        size="small"
                        color={employee.status === 'active' ? 'success' : employee.status === 'inactive' ? 'warning' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.role.replace('_', ' ')}
                        size="small"
                        sx={{ 
                          bgcolor: alpha(getRoleColor(employee.role), 0.1),
                          color: getRoleColor(employee.role)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setSelectedEmployee(employee)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <Box mt={3}>
          <TablePagination
            component="div"
            count={filteredEmployees.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Box>

        {/* Employee Detail Dialog */}
        <Dialog
          open={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedEmployee && (
            <>
              <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="between">
                  <Typography variant="h6">
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </Typography>
                  <IconButton onClick={() => setSelectedEmployee(null)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar
                    src={selectedEmployee.avatar_url}
                    sx={{ width: 80, height: 80, mr: 3 }}
                  >
                    {`${selectedEmployee.first_name[0]}${selectedEmployee.last_name[0]}`}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedEmployee.position}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Employee ID: {selectedEmployee.employee_id}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Contact Information</Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedEmployee.email}
                      </Typography>
                      {selectedEmployee.phone_number && (
                        <Typography variant="body2">
                          <strong>Phone:</strong> {selectedEmployee.phone_number}
                        </Typography>
                      )}
                      {selectedEmployee.location && (
                        <Typography variant="body2">
                          <strong>Location:</strong> {selectedEmployee.location}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Employment Details</Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Department:</strong> {selectedEmployee.department}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Role:</strong> {selectedEmployee.role.replace('_', ' ')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Work Type:</strong> {selectedEmployee.work_type.replace('_', ' ')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Hire Date:</strong> {new Date(selectedEmployee.hire_date).toLocaleDateString()}
                      </Typography>
                      {selectedEmployee.manager_name && (
                        <Typography variant="body2">
                          <strong>Manager:</strong> {selectedEmployee.manager_name}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>

                  {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Skills</Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {selectedEmployee.skills.map((skill, index) => (
                          <Chip key={index} label={skill} variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {selectedEmployee.emergency_contact && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Name:</strong> {selectedEmployee.emergency_contact.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong> {selectedEmployee.emergency_contact.phone}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Relationship:</strong> {selectedEmployee.emergency_contact.relationship}
                        </Typography>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedEmployee(null)}>Close</Button>
                {canManageEmployees && (
                  <Button variant="contained" startIcon={<EditIcon />}>
                    Edit Employee
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </RouteErrorBoundary>
  )
}

export default ConsolidatedEmployeeDirectory