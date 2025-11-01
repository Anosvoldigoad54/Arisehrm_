'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  CircularProgress,
  Stack,
  Pagination,
  TableSortLabel,
  InputAdornment,
  Fab,
  Menu,
  Alert,
  AlertTitle,
  Skeleton,
  Switch,
  FormControlLabel,
  Divider,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Clear as ClearIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Close as CloseIcon,
  Message as MessageIcon,
  Print as PrintIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import DatabaseService from '@/services/databaseService';
import { Database } from '@/types/database';
import { useResponsive } from '@/hooks/useResponsive';
import EmployeeProfile from './EmployeeProfile';
import { useAuth } from '@/contexts/AuthContext';

// Types based on actual database schema
type DatabaseEmployee = Database['public']['Tables']['user_profiles']['Row'];
type CreateEmployeeData = Database['public']['Tables']['user_profiles']['Insert'];
type UpdateEmployeeData = Database['public']['Tables']['user_profiles']['Update'];

export interface Employee {
  id?: string;
  auth_user_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_photo_url?: string;
  department_id?: string;
  position_id?: string;
  role_id?: number;
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  hire_date: string;
  date_of_birth?: string;
  address_line1?: string;
  salary?: number;
  skills?: string[];
  certifications?: string[];
  emergency_contacts?: any[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Position {
  id: string;
  title: string;
  department_id: string;
}

// Constants
const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
];

const EMPLOYMENT_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
  { value: 'on_leave', label: 'On Leave', color: 'warning' },
  { value: 'terminated', label: 'Terminated', color: 'error' },
];

const ITEMS_PER_PAGE = 25;

const EmployeeDirectory: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const responsive = useResponsive();
  const { profile: currentUser } = useAuth();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<string>('last_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Refs for performance optimization
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Debounced search to avoid too many API calls
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setPage(1); // Reset to first page when searching
    }, 500),
    []
  );

  // Update debounced search when search term changes
  useEffect(() => {
    debouncedSetSearch(searchTerm);
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [searchTerm, debouncedSetSearch]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, departmentFilter, typeFilter]);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DatabaseEmployee | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateEmployeeData>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
    position_id: '',
    employment_type: 'full_time',
    employment_status: 'active',
    hire_date: new Date().toISOString().split('T')[0],
    is_active: true,
  });

  // Speed dial state
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Fetch employees with proper error handling and pagination
  const {
    data: employeeData,
    isLoading: loadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useQuery({
    queryKey: ['employees', { searchTerm: debouncedSearchTerm, statusFilter, departmentFilter, typeFilter, sortBy, sortOrder, page }],
    queryFn: async () => {
      try {
        
        const filters: any = {
          isActive: true,
          limit: ITEMS_PER_PAGE,
          offset: (page - 1) * ITEMS_PER_PAGE,
          sortBy: sortBy,
          sortOrder: sortOrder,
        };

        if (debouncedSearchTerm.trim()) {
          filters.search = debouncedSearchTerm.trim();
        }

        if (statusFilter) {
          filters.employmentStatus = [statusFilter];
        }

        if (departmentFilter) {
          filters.departmentId = departmentFilter;
        }

        if (typeFilter) {
          filters.employmentType = typeFilter;
        }

        const data = await DatabaseService.getUserProfiles(filters);
        
        // Return both data and total count for pagination
        return {
          employees: (data as DatabaseEmployee[]) || [],
          totalCount: data?.length || 0, // This would ideally come from a separate count query
          hasMore: (data?.length || 0) === ITEMS_PER_PAGE, // Simple check if there might be more
        };
      } catch (error) {
        // Return empty result instead of throwing to prevent UI crashes
        toast.error('Failed to load employees. Please try again.');
        return {
          employees: [],
          totalCount: 0,
          hasMore: false,
        };
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
    keepPreviousData: true, // Keep previous data while loading new page
  });

  const employees = employeeData?.employees || [];
  const totalCount = employeeData?.totalCount || 0;
  const hasMore = employeeData?.hasMore || false;

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const data = await DatabaseService.getDepartments();
        return (data as Department[]) || [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 300000, // 5 minutes
  });

  // Fetch positions
  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      try {
        const data = await DatabaseService.getPositions();
        return (data as Position[]) || [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 300000, // 5 minutes
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: CreateEmployeeData) => {
      
      // Generate a unique employee ID if not provided
      if (!employeeData.employee_id) {
        employeeData.employee_id = `EMP${Date.now()}`;
      }

      // Generate auth_user_id if not provided
      if (!employeeData.auth_user_id) {
        employeeData.auth_user_id = crypto.randomUUID();
      }

      const result = await DatabaseService.createUserProfile(employeeData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created successfully!');
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to create employee. Please try again.');
    },
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: { employeeId: string; updates: UpdateEmployeeData }) => {
      const result = await DatabaseService.updateUserProfile(data.employeeId, data.updates);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated successfully!');
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to update employee. Please try again.');
    },
  });

  // Delete employee mutation (soft delete)
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const result = await DatabaseService.updateUserProfile(employeeId, {
        is_active: false,
        employment_status: 'terminated',
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee removed successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error: any) => {
      toast.error('Failed to remove employee. Please try again.');
    },
  });

  // Event handlers
  const resetForm = useCallback(() => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department_id: '',
      position_id: '',
      employment_type: 'full_time',
      employment_status: 'active',
      hire_date: new Date().toISOString().split('T')[0],
      is_active: true,
    });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAddEmployee = useCallback(() => {
    resetForm();
    setIsAddDialogOpen(true);
  }, [resetForm]);

  const handleEditEmployee = useCallback((employee: DatabaseEmployee) => {
    setSelectedEmployee(employee);
    setFormData({
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      department_id: employee.department_id || '',
      position_id: employee.position_id || '',
      employment_type: employee.employment_type || 'full_time',
      employment_status: employee.employment_status || 'active',
      hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
      is_active: employee.is_active ?? true,
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleViewEmployee = useCallback((employee: DatabaseEmployee) => {
    setSelectedEmployee(employee);
    setIsProfileDialogOpen(true);
  }, []);

  const handleDeleteEmployee = useCallback((employee: DatabaseEmployee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleSubmitCreate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    createEmployeeMutation.mutate(formData as CreateEmployeeData);
  }, [formData, createEmployeeMutation]);

  const handleSubmitEdit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee || !formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateEmployeeMutation.mutate({
      employeeId: selectedEmployee.employee_id,
      updates: formData as UpdateEmployeeData,
    });
  }, [formData, selectedEmployee, updateEmployeeMutation]);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedEmployee) return;
    deleteEmployeeMutation.mutate(selectedEmployee.employee_id);
  }, [selectedEmployee, deleteEmployeeMutation]);

  const handleExport = useCallback(() => {
    try {
      const headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Position', 'Status', 'Type', 'Hire Date'];
      const csvContent = [
        headers.join(','),
        ...employees.map(emp => [
          emp.employee_id,
          emp.first_name,
          emp.last_name,
          emp.email,
          emp.phone || '',
          emp.department_id || '',
          emp.position_id || '',
          emp.employment_status,
          emp.employment_type,
          emp.hire_date || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Employee data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  }, [employees]);

  const handleRefresh = useCallback(() => {
    refetchEmployees();
    toast.info('Refreshing employee data...');
  }, [refetchEmployees]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('');
    setDepartmentFilter('');
    setTypeFilter('');
    setPage(1);
  }, []);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = !searchTerm || 
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || employee.employment_status === statusFilter;
      const matchesDepartment = !departmentFilter || employee.department_id === departmentFilter;
      const matchesType = !typeFilter || employee.employment_type === typeFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesType;
    });
  }, [employees, searchTerm, statusFilter, departmentFilter, typeFilter]);

  // Get department and position names
  const getDepartmentName = useCallback((departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || 'No Department';
  }, [departments]);

  const getPositionTitle = useCallback((positionId: string) => {
    return positions.find(p => p.id === positionId)?.title || 'No Position';
  }, [positions]);

  // Speed dial actions
  const speedDialActions = [
    { icon: <AddIcon />, name: 'Add Employee', onClick: handleAddEmployee },
    { icon: <DownloadIcon />, name: 'Export Data', onClick: handleExport },
    { icon: <RefreshIcon />, name: 'Refresh', onClick: handleRefresh },
  ];

  // Loading state
  if (loadingEmployees) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={400} />
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Error state
  if (employeesError && employees.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Employees</AlertTitle>
          Failed to load employee data. Please check your connection and try again.
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleRefresh} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: responsive.getPadding(2, 3) }}>
      {/* Header */}
      <Stack 
        direction={responsive.getFlexDirection('column', 'row')} 
        justifyContent="space-between" 
        alignItems={responsive.isMobile ? "stretch" : "center"} 
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant={responsive.getVariant('h5', 'h4')} sx={{ fontWeight: 700, mb: 1 }}>
            Employee Directory
          </Typography>
          <Typography variant={responsive.getVariant('body2', 'body1')} color="text.secondary">
            Manage and view employee profiles ({filteredEmployees.length} employees)
          </Typography>
        </Box>

        <Stack direction={responsive.getFlexDirection('column', 'row')} spacing={1}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            size={responsive.getButtonSize()}
            onClick={() => toast.info('Import feature coming soon!')}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size={responsive.getButtonSize()}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size={responsive.getButtonSize()}
            onClick={handleAddEmployee}
          >
            Add Employee
          </Button>
        </Stack>
      </Stack>
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Stack direction={responsive.getFlexDirection('column', 'row')} spacing={2} alignItems="center">
            <TextField
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size={responsive.getInputSize()}
              sx={{ minWidth: 300, maxWidth: responsive.isMobile ? '100%' : 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size={responsive.getButtonSize()}
              >
                Filters
              </Button>
              <IconButton onClick={handleRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Stack>
          </Stack>

          {showFilters && (
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <FormControl fullWidth size={responsive.getInputSize()}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {EMPLOYMENT_STATUSES.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <FormControl fullWidth size={responsive.getInputSize()}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Department"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <FormControl fullWidth size={responsive.getInputSize()}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {EMPLOYMENT_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    fullWidth
                    size={responsive.getButtonSize()}
                  >
                    Clear All
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          )}
        </Stack>
      </Paper>
      {/* Employee Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              {!responsive.isMobile && <TableCell>Department</TableCell>}
              {!responsive.isSmallMobile && <TableCell>Position</TableCell>}
              <TableCell>Status</TableCell>
              {!responsive.isMobile && <TableCell>Type</TableCell>}
              {!responsive.isSmallMobile && <TableCell>Hire Date</TableCell>}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.employee_id} hover sx={{ cursor: 'pointer' }} onClick={() => handleViewEmployee(employee)}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar 
                      src={employee.profile_photo_url} 
                      sx={{ width: responsive.isSmallMobile ? 32 : 40, height: responsive.isSmallMobile ? 32 : 40 }}
                    >
                      {employee.first_name?.[0]}{employee.last_name?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {employee.first_name} {employee.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {employee.employee_id}
                      </Typography>
                      {responsive.isMobile && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {getDepartmentName(employee.department_id || '')}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </TableCell>
                {!responsive.isMobile && (
                  <TableCell>{getDepartmentName(employee.department_id || '')}</TableCell>
                )}
                {!responsive.isSmallMobile && (
                  <TableCell>{getPositionTitle(employee.position_id || '')}</TableCell>
                )}
                <TableCell>
                  <Chip
                    label={EMPLOYMENT_STATUSES.find(s => s.value === employee.employment_status)?.label || employee.employment_status}
                    color={EMPLOYMENT_STATUSES.find(s => s.value === employee.employment_status)?.color as any || 'default'}
                    size="small"
                  />
                </TableCell>
                {!responsive.isMobile && (
                  <TableCell>
                    <Chip
                      label={EMPLOYMENT_TYPES.find(t => t.value === employee.employment_type)?.label || employee.employment_type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                )}
                {!responsive.isSmallMobile && (
                  <TableCell>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}</TableCell>
                )}
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title="View Profile">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewEmployee(employee);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Employee">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEmployee(employee);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Employee">
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEmployee(employee);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, mb: 2 }}>
        <Stack direction={responsive.getFlexDirection('column', 'row')} spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Showing {employees.length} employee{employees.length !== 1 ? 's' : ''} {hasMore ? '(more available)' : ''}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              disabled={page === 1 || loadingEmployees}
              onClick={() => {
                if (page > 1) {
                  setPage(page - 1);
                }
              }}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ px: 2, py: 1 }}>
              Page {page}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              disabled={!hasMore || loadingEmployees}
              onClick={() => {
                if (hasMore) {
                  setPage(page + 1);
                }
              }}
            >
              Next
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {ITEMS_PER_PAGE} per page
          </Typography>
        </Stack>
      </Box>
      {/* Add Employee Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={responsive.isMobile}
      >
        <form onSubmit={handleSubmitCreate}>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Add New Employee</Typography>
              <IconButton onClick={() => setIsAddDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
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
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
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
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  name="employee_id"
                  value={formData.employee_id || ''}
                  onChange={handleInputChange}
                  placeholder="Auto-generated if empty"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department_id"
                    value={formData.department_id || ''}
                    label="Department"
                    onChange={(e) => handleSelectChange('department_id', e.target.value)}
                  >
                    <MenuItem value="">Select Department</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
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
                    name="position_id"
                    value={formData.position_id || ''}
                    label="Position"
                    onChange={(e) => handleSelectChange('position_id', e.target.value)}
                  >
                    <MenuItem value="">Select Position</MenuItem>
                    {positions.map(pos => (
                      <MenuItem key={pos.id} value={pos.id}>{pos.title}</MenuItem>
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
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    name="employment_type"
                    value={formData.employment_type || 'full_time'}
                    label="Employment Type"
                    onChange={(e) => handleSelectChange('employment_type', e.target.value)}
                  >
                    {EMPLOYMENT_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
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
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="employment_status"
                    value={formData.employment_status || 'active'}
                    label="Status"
                    onChange={(e) => handleSelectChange('employment_status', e.target.value)}
                  >
                    {EMPLOYMENT_STATUSES.map(status => (
                      <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                    ))}
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
                  name="hire_date"
                  type="date"
                  value={formData.hire_date || ''}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={createEmployeeMutation.isPending}
              startIcon={createEmployeeMutation.isPending ? <CircularProgress size={16} /> : <AddIcon />}
            >
              {createEmployeeMutation.isPending ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Edit Employee Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={responsive.isMobile}
      >
        <form onSubmit={handleSubmitEdit}>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Edit Employee</Typography>
              <IconButton onClick={() => setIsEditDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
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
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
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
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  name="employee_id"
                  value={selectedEmployee?.employee_id || ''}
                  disabled
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department_id"
                    value={formData.department_id || ''}
                    label="Department"
                    onChange={(e) => handleSelectChange('department_id', e.target.value)}
                  >
                    <MenuItem value="">Select Department</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
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
                    name="position_id"
                    value={formData.position_id || ''}
                    label="Position"
                    onChange={(e) => handleSelectChange('position_id', e.target.value)}
                  >
                    <MenuItem value="">Select Position</MenuItem>
                    {positions.map(pos => (
                      <MenuItem key={pos.id} value={pos.id}>{pos.title}</MenuItem>
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
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    name="employment_type"
                    value={formData.employment_type || 'full_time'}
                    label="Employment Type"
                    onChange={(e) => handleSelectChange('employment_type', e.target.value)}
                  >
                    {EMPLOYMENT_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
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
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="employment_status"
                    value={formData.employment_status || 'active'}
                    label="Status"
                    onChange={(e) => handleSelectChange('employment_status', e.target.value)}
                  >
                    {EMPLOYMENT_STATUSES.map(status => (
                      <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                    ))}
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
                  name="hire_date"
                  type="date"
                  value={formData.hire_date || ''}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={updateEmployeeMutation.isPending}
              startIcon={updateEmployeeMutation.isPending ? <CircularProgress size={16} /> : <EditIcon />}
            >
              {updateEmployeeMutation.isPending ? 'Updating...' : 'Update Employee'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{selectedEmployee?.first_name} {selectedEmployee?.last_name}</strong> from the system? 
            This will deactivate their account and change their status to terminated.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            disabled={deleteEmployeeMutation.isPending}
            startIcon={deleteEmployeeMutation.isPending ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteEmployeeMutation.isPending ? 'Removing...' : 'Remove Employee'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Employee Profile Dialog */}
      {selectedEmployee && (
        <EmployeeProfile
          employee={selectedEmployee}
          open={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
          onEdit={handleEditEmployee}
        />
      )}
      {/* Speed Dial for Mobile */}
      {responsive.isMobile && (
        <SpeedDial
          ariaLabel="Employee actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          open={speedDialOpen}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.onClick();
                setSpeedDialOpen(false);
              }}
            />
          ))}
        </SpeedDial>
      )}
    </Box>
  );
};

export default EmployeeDirectory;
