// ========================================
// EMPLOYEE MANAGEMENT INTERFACE
// ========================================
// Comprehensive UI for Admin/HR employee management

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge
} from '@mui/material'
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as SalaryIcon,
  Security as SecurityIcon
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRBAC } from '../../hooks/useRBAC'
import { useAuth } from '../../contexts/AuthContext'
import employeeService, { CreateEmployeeRequest, CreateEmployeeResponse } from '../../services/employeeService'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function EmployeeManagementInterface() {
  const { user, profile } = useAuth()
  const { checkPermission, hasMinimumLevel } = useRBAC()
  const queryClient = useQueryClient()

  // State management
  const [activeTab, setActiveTab] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [bulkCreateDialogOpen, setBulkCreateDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Form state for single employee creation
  const [employeeForm, setEmployeeForm] = useState<CreateEmployeeRequest>({
    email: '',
    first_name: '',
    last_name: '',
    role_name: 'employee',
    department_id: '',
    position_id: '',
    manager_employee_id: '',
    employment_type: 'full_time',
    hire_date: new Date().toISOString().split('T')[0],
    salary: 0,
    phone: '',
    work_location: ''
  })

  // Bulk creation state
  const [bulkEmployees, setBulkEmployees] = useState<CreateEmployeeRequest[]>([])
  const [csvData, setCsvData] = useState('')

  // Permission checks
  const canCreateEmployees = hasMinimumLevel(80) // HR level and above
  const canManageAllEmployees = hasMinimumLevel(90) // Admin level
  const canResetPasswords = hasMinimumLevel(80)
  const canDeactivateEmployees = hasMinimumLevel(80)

  // Data queries
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['available-roles'],
    queryFn: () => employeeService.getAvailableRoles(),
    enabled: canCreateEmployees
  })

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ['available-departments'],
    queryFn: () => employeeService.getAvailableDepartments(),
    enabled: canCreateEmployees
  })

  const { data: positions = [], isLoading: positionsLoading } = useQuery({
    queryKey: ['available-positions'],
    queryFn: () => employeeService.getAvailablePositions(),
    enabled: canCreateEmployees
  })

  const { data: managers = [], isLoading: managersLoading } = useQuery({
    queryKey: ['potential-managers'],
    queryFn: () => employeeService.getPotentialManagers(),
    enabled: canCreateEmployees
  })

  // Mutations
  const createEmployeeMutation = useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeService.createEmployee(data),
    onSuccess: (response) => {
      if (response.success) {
        setCreateDialogOpen(false)
        resetEmployeeForm()
        queryClient.invalidateQueries({ queryKey: ['employees'] })
        toast.success('Employee created successfully!', {
          description: `Employee ID: ${response.employee_id}`
        })
      }
    },
    onError: (error: any) => {
      toast.error('Failed to create employee', {
        description: error.message
      })
    }
  })

  const bulkCreateMutation = useMutation({
    mutationFn: (employees: CreateEmployeeRequest[]) => 
      employeeService.createEmployeesBulk({ employees }),
    onSuccess: (response) => {
      if (response.success) {
        setBulkCreateDialogOpen(false)
        setBulkEmployees([])
        setCsvData('')
        queryClient.invalidateQueries({ queryKey: ['employees'] })
        toast.success(`Bulk creation completed!`, {
          description: `${response.successful} successful, ${response.failed} failed`
        })
      }
    }
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (employeeId: string) => employeeService.resetEmployeePassword(employeeId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Password reset successfully', {
          description: `New password: ${response.temporary_password}`
        })
      }
    }
  })

  const deactivateEmployeeMutation = useMutation({
    mutationFn: ({ employeeId, reason }: { employeeId: string; reason?: string }) => 
      employeeService.deactivateEmployee(employeeId, reason),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['employees'] })
        toast.success('Employee deactivated successfully')
      }
    }
  })

  // Helper functions
  const resetEmployeeForm = () => {
    setEmployeeForm({
      email: '',
      first_name: '',
      last_name: '',
      role_name: 'employee',
      department_id: '',
      position_id: '',
      manager_employee_id: '',
      employment_type: 'full_time',
      hire_date: new Date().toISOString().split('T')[0],
      salary: 0,
      phone: '',
      work_location: ''
    })
  }

  const handleCreateEmployee = () => {
    if (!employeeForm.email || !employeeForm.first_name || !employeeForm.last_name) {
      toast.error('Please fill in required fields')
      return
    }
    createEmployeeMutation.mutate(employeeForm)
  }

  const handleBulkCreate = () => {
    if (bulkEmployees.length === 0) {
      toast.error('No employees to create')
      return
    }
    bulkCreateMutation.mutate(bulkEmployees)
  }

  const parseCsvData = () => {
    try {
      const lines = csvData.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      const employees: CreateEmployeeRequest[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const employee: CreateEmployeeRequest = {
          email: values[headers.indexOf('email')] || '',
          first_name: values[headers.indexOf('first_name')] || '',
          last_name: values[headers.indexOf('last_name')] || '',
          role_name: values[headers.indexOf('role_name')] || 'employee',
          department_id: values[headers.indexOf('department_id')] || '',
          employment_type: (values[headers.indexOf('employment_type')] as any) || 'full_time',
          hire_date: values[headers.indexOf('hire_date')] || new Date().toISOString().split('T')[0],
          salary: parseFloat(values[headers.indexOf('salary')]) || 0,
          phone: values[headers.indexOf('phone')] || '',
          work_location: values[headers.indexOf('work_location')] || ''
        }
        employees.push(employee)
      }

      setBulkEmployees(employees)
      toast.success(`Parsed ${employees.length} employees from CSV`)
    } catch (error) {
      toast.error('Failed to parse CSV data')
    }
  }

  const generateCsvTemplate = () => {
    const headers = [
      'email', 'first_name', 'last_name', 'role_name', 'department_id',
      'employment_type', 'hire_date', 'salary', 'phone', 'work_location'
    ]
    const template = headers.join(',') + '\n' +
      'john.doe@company.com,John,Doe,employee,,full_time,2025-01-15,75000,+1234567890,New York Office'
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Permission check
  if (!canCreateEmployees) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            You don't have permission to manage employees. Contact your administrator.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Employee Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={!canCreateEmployees}
          >
            Add Employee
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setBulkCreateDialogOpen(true)}
            disabled={!canCreateEmployees}
          >
            Bulk Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={generateCsvTemplate}
          >
            CSV Template
          </Button>
        </Box>
      </Box>
      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Active Employees" icon={<PersonIcon />} />
            <Tab label="Recent Actions" icon={<SecurityIcon />} />
            <Tab label="Bulk Operations" icon={<GroupIcon />} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {/* Active Employees List */}
          <Typography variant="h6" gutterBottom>
            Active Employees
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage employee accounts, reset passwords, and update status.
          </Typography>
          {/* Employee table would go here */}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Recent Actions */}
          <Typography variant="h6" gutterBottom>
            Recent Employee Actions
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            View recent employee creation, updates, and security actions.
          </Typography>
          {/* Actions log would go here */}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Bulk Operations */}
          <Typography variant="h6" gutterBottom>
            Bulk Operations
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Perform bulk employee operations like imports, updates, and deactivations.
          </Typography>
          {/* Bulk operations interface would go here */}
        </TabPanel>
      </Card>
      {/* Create Employee Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            Create New Employee
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                required
              />
            </Grid>
            
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Phone"
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
              />
            </Grid>
            
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="First Name *"
                value={employeeForm.first_name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, first_name: e.target.value })}
                required
              />
            </Grid>
            
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Last Name *"
                value={employeeForm.last_name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, last_name: e.target.value })}
                required
              />
            </Grid>

            {/* Role and Organization */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Role & Organization
              </Typography>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth>
                <InputLabel>Role *</InputLabel>
                <Select
                  value={employeeForm.role_name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, role_name: e.target.value })}
                  label="Role *"
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      {role.display_name} (Level {role.level})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={employeeForm.department_id}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, department_id: e.target.value })}
                  label="Department"
                >
                  <MenuItem value="">None</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth>
                <InputLabel>Position</InputLabel>
                <Select
                  value={employeeForm.position_id}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, position_id: e.target.value })}
                  label="Position"
                >
                  <MenuItem value="">None</MenuItem>
                  {positions.map((pos) => (
                    <MenuItem key={pos.id} value={pos.id}>
                      {pos.title} ({pos.level})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Select
                  value={employeeForm.manager_employee_id}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, manager_employee_id: e.target.value })}
                  label="Manager"
                >
                  <MenuItem value="">None</MenuItem>
                  {managers.map((manager) => (
                    <MenuItem key={manager.employee_id} value={manager.employee_id}>
                      {manager.display_name} ({manager.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Employment Details */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Employment Details
              </Typography>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={employeeForm.employment_type}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, employment_type: e.target.value as any })}
                  label="Employment Type"
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="intern">Intern</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                value={employeeForm.hire_date}
                onChange={(e) => setEmployeeForm({ ...employeeForm, hire_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Salary"
                type="number"
                value={employeeForm.salary}
                onChange={(e) => setEmployeeForm({ ...employeeForm, salary: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <SalaryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Work Location"
                value={employeeForm.work_location}
                onChange={(e) => setEmployeeForm({ ...employeeForm, work_location: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateEmployee}
            variant="contained"
            disabled={createEmployeeMutation.isPending}
            startIcon={createEmployeeMutation.isPending ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Create Employee
          </Button>
        </DialogActions>
      </Dialog>
      {/* Bulk Create Dialog */}
      <Dialog
        open={bulkCreateDialogOpen}
        onClose={() => setBulkCreateDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            Bulk Employee Import
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              CSV Data
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              placeholder="Paste CSV data here or upload a file..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button onClick={parseCsvData} variant="outlined">
                Parse CSV
              </Button>
              <Button onClick={generateCsvTemplate} variant="outlined">
                Download Template
              </Button>
            </Box>
            
            {bulkEmployees.length > 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {bulkEmployees.length} employees ready for creation
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkCreate}
            variant="contained"
            disabled={bulkCreateMutation.isPending || bulkEmployees.length === 0}
            startIcon={bulkCreateMutation.isPending ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            Create {bulkEmployees.length} Employees
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
