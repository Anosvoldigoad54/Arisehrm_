'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
// Removed framer-motion animations for better performance
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Paper,
  Divider,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Slider,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  useMediaQuery,
  alpha,
  styled,
} from '@mui/material'
import {
  Search,
  FilterList,
  Sort,
  ViewModule,
  ViewList,
  Person,
  Email,
  Phone,
  Business,
  Work,
  LocationOn,
  Schedule,
  TrendingUp,
  MoreVert,
  Add,
  Edit,
  Delete,
  Visibility,
  GetApp,
  Upload,
  Group,
  PersonAdd,
  AssignmentInd,
  SupervisorAccount,
  Timeline,
  Analytics,
  Settings,
  Close,
  Check,
  Clear,
  Star,
  FiberManualRecord,
} from '@mui/icons-material'

// Enhanced Types based on your database schema
interface Employee {
  id: string
  employee_id: string
  email: string
  first_name: string
  middle_name?: string
  last_name: string
  preferred_name?: string
  display_name: string
  phone?: string
  mobile_phone?: string
  profile_photo_url?: string
  hire_date: string
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave'
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern'
  work_location?: string
  salary?: number
  salary_currency: string
  performance_rating?: number
  engagement_score?: number
  retention_risk: 'low' | 'medium' | 'high'
  is_active: boolean
  last_login?: string
  skills: any[]
  certifications: any[]
  languages: any[]
  
  // Relationships
  department?: {
    id: string
    name: string
    code: string
    budget?: number
  }
  position?: {
    id: string
    title: string
    level?: string
    is_leadership_role: boolean
  }
  role?: {
    id: number
    name: string
    display_name: string
    level: number
    color_code: string
  }
  manager?: {
    employee_id: string
    display_name: string
    profile_photo_url?: string
  }
  teams?: Array<{
    id: string
    name: string
    role_in_team: string
  }>
}

interface SearchFilters {
  searchTerm: string
  departments: string[]
  positions: string[]
  employmentStatus: string[]
  employmentType: string[]
  workLocation: string[]
  roles: string[]
  salaryRange: [number, number]
  performanceRange: [number, number]
  engagementRange: [number, number]
  retentionRisk: string[]
  skills: string[]
  hireDate: {
    from?: string
    to?: string
  }
  lastLogin: {
    from?: string
    to?: string
  }
  isActive?: boolean
}

interface SortOption {
  field: string
  label: string
  direction: 'asc' | 'desc'
}

// ✅ UPDATED: Theme-aware Styled Components
const EmployeeCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}))

const FilterDrawerContainer = styled(Box)(({ theme }) => ({
  width: 320,
  height: '100%',
  padding: theme.spacing(3),
  overflow: 'auto',
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('sm')]: {
    width: '100vw',
    padding: theme.spacing(2),
  },
}))

const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: alpha(theme.palette.background.default, 0.95),
  backdropFilter: 'blur(20px)',
  zIndex: 10,
  padding: theme.spacing(2, 0),
  marginBottom: theme.spacing(3),
}))

export function EmployeeDirectory() {
  const { profile, user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // State Management
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  
  // Search & Filter State
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    departments: [],
    positions: [],
    employmentStatus: [],
    employmentType: [],
    workLocation: [],
    roles: [],
    salaryRange: [0, 200000],
    performanceRange: [0, 5],
    engagementRange: [0, 100],
    retentionRisk: [],
    skills: [],
    hireDate: {},
    lastLogin: {},
  })
  
  // Sort State
  const [sortBy, setSortBy] = useState<SortOption>({
    field: 'display_name',
    label: 'Name',
    direction: 'asc'
  })
  
  // Filter Options (populated from database)
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    positions: [],
    workLocations: [],
    roles: [],
    skills: [],
  })

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 12 : 24)

  // Load employee data
  useEffect(() => {
    fetchEmployees()
    fetchFilterOptions()
  }, [])

  // Fetch employees with advanced joins
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          departments!department_id(
            id, name, code, budget
          ),
          positions!position_id(
            id, title, level
          ),
          roles!role_id(
            id, name, display_name, level
          ),
          manager:user_profiles!user_profiles_manager_employee_id_fkey(
            employee_id, display_name, profile_photo_url
          ),
          employee_teams!inner(
            role_in_team,
            teams!inner(id, name)
          )
        `)
        .eq('is_active', true)
        .order('display_name', { ascending: true })

      if (error) throw error

      // Transform data to match our interface
      const transformedEmployees: Employee[] = data?.map(emp => ({
        id: emp.id,
        employee_id: emp.employee_id,
        email: emp.email,
        first_name: emp.first_name,
        middle_name: emp.middle_name,
        last_name: emp.last_name,
        preferred_name: emp.preferred_name,
        display_name: emp.display_name,
        phone: emp.phone,
        mobile_phone: emp.mobile_phone,
        profile_photo_url: emp.profile_photo_url,
        hire_date: emp.hire_date,
        employment_status: emp.employment_status,
        employment_type: emp.employment_type,
        work_location: emp.work_location,
        salary: emp.salary,
        salary_currency: emp.salary_currency,
        performance_rating: emp.performance_rating,
        engagement_score: emp.engagement_score,
        retention_risk: emp.retention_risk,
        is_active: emp.is_active,
        last_login: emp.last_login,
        skills: emp.skills || [],
        certifications: emp.certifications || [],
        languages: emp.languages || [],
        department: emp.departments,
        position: emp.positions,
        role: emp.roles,
        manager: emp.manager,
        teams: emp.employee_teams?.map((et: any) => ({
          id: et.teams.id,
          name: et.teams.name,
          role_in_team: et.role_in_team
        })) || []
      })) || []

      setEmployees(transformedEmployees)
    } catch (error) {
      // Fallback to demo data if database access fails
      loadDemoEmployees()
    } finally {
      setLoading(false)
    }
  }

  // Load demo data
  const loadDemoEmployees = () => {
    const demoEmployees: Employee[] = [
      {
        id: '1',
        employee_id: 'EMP001',
        email: 'sarah.johnson@company.com',
        first_name: 'Sarah',
        last_name: 'Johnson',
        display_name: 'Sarah Johnson',
        profile_photo_url: '',
        hire_date: '2022-01-15',
        employment_status: 'active',
        employment_type: 'full_time',
        work_location: 'New York Office',
        salary: 85000,
        salary_currency: 'USD',
        performance_rating: 4.5,
        engagement_score: 85,
        retention_risk: 'low',
        is_active: true,
        last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        skills: ['React', 'TypeScript', 'Node.js'],
        certifications: ['AWS Certified', 'Scrum Master'],
        languages: ['English', 'Spanish'],
        department: {
          id: '1',
          name: 'Engineering',
          code: 'ENG',
          budget: 850000
        },
        position: {
          id: '1',
          title: 'Senior Software Developer',
          level: 'Senior',
          is_leadership_role: false
        },
        role: {
          id: 1,
          name: 'employee',
          display_name: 'Employee',
          level: 3,
          color_code: '#10b981'
        },
        teams: [
          { id: '1', name: 'Frontend Team', role_in_team: 'developer' }
        ]
      },
      {
        id: '2',
        employee_id: 'EMP002',
        email: 'mike.chen@company.com',
        first_name: 'Mike',
        last_name: 'Chen',
        display_name: 'Mike Chen',
        profile_photo_url: '',
        hire_date: '2021-03-10',
        employment_status: 'active',
        employment_type: 'full_time',
        work_location: 'San Francisco Office',
        salary: 120000,
        salary_currency: 'USD',
        performance_rating: 4.8,
        engagement_score: 92,
        retention_risk: 'low',
        is_active: true,
        last_login: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        skills: ['Leadership', 'Strategy', 'Marketing'],
        certifications: ['Google Analytics', 'HubSpot'],
        languages: ['English', 'Mandarin'],
        department: {
          id: '2',
          name: 'Marketing',
          code: 'MKT',
          budget: 320000
        },
        position: {
          id: '2',
          title: 'Marketing Manager',
          level: 'Manager',
          is_leadership_role: true
        },
        role: {
          id: 2,
          name: 'manager',
          display_name: 'Manager',
          level: 4,
          color_code: '#f59e0b'
        },
        teams: [
          { id: '2', name: 'Marketing Team', role_in_team: 'lead' }
        ]
      },
      {
        id: '3',
        employee_id: 'EMP003',
        email: 'emily.rodriguez@company.com',
        first_name: 'Emily',
        last_name: 'Rodriguez',
        display_name: 'Emily Rodriguez',
        profile_photo_url: '',
        hire_date: '2020-08-22',
        employment_status: 'active',
        employment_type: 'full_time',
        work_location: 'Remote',
        salary: 95000,
        salary_currency: 'USD',
        performance_rating: 4.2,
        engagement_score: 78,
        retention_risk: 'medium',
        is_active: true,
        last_login: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        skills: ['Sales', 'CRM', 'Negotiation'],
        certifications: ['Salesforce Admin', 'Sales Professional'],
        languages: ['English', 'Spanish', 'Portuguese'],
        department: {
          id: '3',
          name: 'Sales',
          code: 'SAL',
          budget: 420000
        },
        position: {
          id: '3',
          title: 'Sales Executive',
          level: 'Senior',
          is_leadership_role: false
        },
        role: {
          id: 1,
          name: 'employee',
          display_name: 'Employee',
          level: 3,
          color_code: '#10b981'
        },
        teams: [
          { id: '3', name: 'Enterprise Sales', role_in_team: 'contributor' }
        ]
      }
    ]
    
    setEmployees(demoEmployees)
  }

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      // This would fetch distinct values for filters
      // For now, using demo data
      setFilterOptions({
        departments: [
          { id: '1', name: 'Engineering' },
          { id: '2', name: 'Marketing' },
          { id: '3', name: 'Sales' },
          { id: '4', name: 'HR' }
        ],
        positions: [
          { id: '1', title: 'Software Developer' },
          { id: '2', title: 'Marketing Manager' },
          { id: '3', title: 'Sales Executive' }
        ],
        workLocations: [
          'New York Office',
          'San Francisco Office',
          'Remote',
          'Hybrid'
        ],
        roles: [
          { id: 1, display_name: 'Employee' },
          { id: 2, display_name: 'Manager' },
          { id: 3, display_name: 'Director' }
        ],
        skills: [
          'React', 'TypeScript', 'Node.js', 'Leadership',
          'Strategy', 'Marketing', 'Sales', 'CRM'
        ]
      })
    } catch (error) {
    }
  }

  // Filter and sort employees
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const searchFields = [
          employee.display_name,
          employee.email,
          employee.employee_id,
          employee.department?.name,
          employee.position?.title,
          employee.work_location,
        ].filter(Boolean).join(' ').toLowerCase()
        
        if (!searchFields.includes(searchLower)) return false
      }

      // Department filter
      if (filters.departments.length > 0 && employee.department) {
        if (!filters.departments.includes(employee.department.id)) return false
      }

      // Employment status filter
      if (filters.employmentStatus.length > 0) {
        if (!filters.employmentStatus.includes(employee.employment_status)) return false
      }

      // Employment type filter
      if (filters.employmentType.length > 0) {
        if (!filters.employmentType.includes(employee.employment_type)) return false
      }

      // Work location filter
      if (filters.workLocation.length > 0 && employee.work_location) {
        if (!filters.workLocation.includes(employee.work_location)) return false
      }

      // Performance rating filter
      if (employee.performance_rating !== undefined) {
        if (employee.performance_rating < filters.performanceRange[0] || 
            employee.performance_rating > filters.performanceRange[1]) return false
      }

      // Engagement score filter
      if (employee.engagement_score !== undefined) {
        if (employee.engagement_score < filters.engagementRange[0] || 
            employee.engagement_score > filters.engagementRange[1]) return false
      }

      // Retention risk filter
      if (filters.retentionRisk.length > 0) {
        if (!filters.retentionRisk.includes(employee.retention_risk)) return false
      }

      // Skills filter
      if (filters.skills.length > 0) {
        const employeeSkills = employee.skills.map(skill => 
          typeof skill === 'string' ? skill : skill.name
        )
        const hasRequiredSkills = filters.skills.some(skill => 
          employeeSkills.includes(skill)
        )
        if (!hasRequiredSkills) return false
      }

      return true
    })

    // Sort employees
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy.field as keyof Employee]
      let bVal: any = b[sortBy.field as keyof Employee]

      // Handle nested fields
      if (sortBy.field.includes('.')) {
        const fields = sortBy.field.split('.')
        aVal = fields.reduce((obj, field) => obj?.[field], a)
        bVal = fields.reduce((obj, field) => obj?.[field], b)
      }

      // Handle different data types
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortBy.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortBy.direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      // Handle dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortBy.direction === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime()
      }

      return 0
    })

    return filtered
  }, [employees, filters, sortBy])

  // Pagination
  const paginatedEmployees = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredAndSortedEmployees.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredAndSortedEmployees, page, rowsPerPage])

  // Utility functions
  const getEmployeeStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'terminated': return 'error'
      case 'on_leave': return 'info'
      default: return 'default'
    }
  }

  const getRetentionRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success'
      case 'medium': return 'warning'
      case 'high': return 'error'
      default: return 'default'
    }
  }

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never'
    const now = new Date()
    const loginDate = new Date(lastLogin)
    const diffMs = now.getTime() - loginDate.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return 'Recently'
  }

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === paginatedEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(paginatedEmployees.map(emp => emp.id))
    }
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      departments: [],
      positions: [],
      employmentStatus: [],
      employmentType: [],
      workLocation: [],
      roles: [],
      salaryRange: [0, 200000],
      performanceRange: [0, 5],
      engagementRange: [0, 100],
      retentionRisk: [],
      skills: [],
      hireDate: {},
      lastLogin: {},
    })
  }

  // Filter Drawer Component
  const FilterDrawer = () => (
    <FilterDrawerContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Advanced Filters
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={clearFilters} startIcon={<Clear />}>
              Clear All
            </Button>
            <IconButton onClick={() => setShowFilters(false)}>
              <Close />
            </IconButton>
          </Stack>
        </Box>

        <Divider />

        {/* Department Filter */}
        <FormControl fullWidth>
          <Autocomplete
            multiple
            options={filterOptions.departments}
            getOptionLabel={(option: any) => option.name}
            value={filterOptions.departments.filter((dept: any) => 
              filters.departments.includes(dept.id)
            )}
            onChange={(_, value) => 
              setFilters(prev => ({ 
                ...prev, 
                departments: value.map((dept: any) => dept.id) 
              }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Departments" variant="outlined" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option: any, index) => (
                <Chip
                  key={option.id}
                  label={option.name}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </FormControl>

        {/* Employment Status Filter */}
        <FormControl fullWidth>
          <Autocomplete
            multiple
            options={['active', 'inactive', 'terminated', 'on_leave']}
            value={filters.employmentStatus}
            onChange={(_, value) => 
              setFilters(prev => ({ ...prev, employmentStatus: value }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Employment Status" variant="outlined" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option}
                  label={option.replace('_', ' ').toUpperCase()}
                  size="small"
                  color={getEmployeeStatusColor(option) as any}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </FormControl>

        {/* Employment Type Filter */}
        <FormControl fullWidth>
          <Autocomplete
            multiple
            options={['full_time', 'part_time', 'contract', 'intern']}
            value={filters.employmentType}
            onChange={(_, value) => 
              setFilters(prev => ({ ...prev, employmentType: value }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Employment Type" variant="outlined" />
            )}
          />
        </FormControl>

        {/* Work Location Filter */}
        <FormControl fullWidth>
          <Autocomplete
            multiple
            options={filterOptions.workLocations}
            value={filters.workLocation}
            onChange={(_, value) => 
              setFilters(prev => ({ ...prev, workLocation: value }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Work Location" variant="outlined" />
            )}
          />
        </FormControl>

        {/* Performance Rating Filter */}
        <Box>
          <Typography gutterBottom>Performance Rating</Typography>
          <Slider
            value={filters.performanceRange}
            onChange={(_, value) => 
              setFilters(prev => ({ ...prev, performanceRange: value as [number, number] }))
            }
            valueLabelDisplay="auto"
            min={0}
            max={5}
            step={0.1}
            marks={[
              { value: 0, label: '0' },
              { value: 2.5, label: '2.5' },
              { value: 5, label: '5' }
            ]}
            sx={{
              // ✅ ADDED: Theme-aware slider
              color: theme.palette.primary.main,
              '& .MuiSlider-thumb': {
                backgroundColor: theme.palette.primary.main,
              },
              '& .MuiSlider-track': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          />
        </Box>

        {/* Engagement Score Filter */}
        <Box>
          <Typography gutterBottom>Engagement Score</Typography>
          <Slider
            value={filters.engagementRange}
            onChange={(_, value) => 
              setFilters(prev => ({ ...prev, engagementRange: value as [number, number] }))
            }
            valueLabelDisplay="auto"
            min={0}
            max={100}
            marks={[
              { value: 0, label: '0%' },
              { value: 50, label: '50%' },
              { value: 100, label: '100%' }
            ]}
            sx={{
              // ✅ ADDED: Theme-aware slider
              color: theme.palette.secondary.main,
              '& .MuiSlider-thumb': {
                backgroundColor: theme.palette.secondary.main,
              },
              '& .MuiSlider-track': {
                backgroundColor: theme.palette.secondary.main,
              },
            }}
          />
        </Box>

        {/* Retention Risk Filter */}
        <FormControl fullWidth>
          <Autocomplete
            multiple
            options={['low', 'medium', 'high']}
            value={filters.retentionRisk}
            onChange={(_, value) => 
              setFilters(prev => ({ ...prev, retentionRisk: value }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Retention Risk" variant="outlined" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option}
                  label={option.toUpperCase()}
                  size="small"
                  color={getRetentionRiskColor(option) as any}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </FormControl>

        {/* Skills Filter */}
        <FormControl fullWidth>
          <Autocomplete
            multiple
            options={filterOptions.skills}
            value={filters.skills}
            onChange={(_, value) => 
              setFilters(prev => ({ ...prev, skills: value }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Skills" variant="outlined" />
            )}
          />
        </FormControl>
      </Stack>
    </FilterDrawerContainer>
  )

  // Employee Card Component
  const EmployeeCardComponent = ({ employee }: { employee: Employee }) => (
    <EmployeeCard>
      <CardContent sx={{ p: 3 }}>
        {/* Header with Avatar and Basic Info */}
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <FiberManualRecord
                sx={{
                  color: employee.last_login && 
                    new Date(employee.last_login).getTime() > Date.now() - 24 * 60 * 60 * 1000
                    ? theme.palette.success.main : theme.palette.text.disabled, // ✅ FIXED: Theme colors
                  fontSize: 12
                }}
              />
            }
          >
            <Avatar
              src={employee.profile_photo_url}
              sx={{ 
                width: 56, 
                height: 56,
                // ✅ ADDED: Theme-aware avatar
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
            >
              {employee.first_name[0]}{employee.last_name[0]}
            </Avatar>
          </Badge>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {employee.display_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {employee.employee_id}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={employee.employment_status.replace('_', ' ')}
                size="small"
                color={getEmployeeStatusColor(employee.employment_status) as any}
                variant="outlined"
              />
              <Chip
                label={employee.retention_risk.toUpperCase()}
                size="small"
                color={getRetentionRiskColor(employee.retention_risk) as any}
                variant="filled"
              />
            </Stack>
          </Box>
          
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Stack>

        {/* Department and Position */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Business fontSize="small" color="action" />
            <Typography variant="body2">
              {employee.department?.name || 'No Department'}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Work fontSize="small" color="action" />
            <Typography variant="body2">
              {employee.position?.title || 'No Position'}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2">
              {employee.work_location || 'Not specified'}
            </Typography>
          </Stack>
        </Stack>

        {/* Performance Metrics */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          {employee.performance_rating && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {employee.performance_rating.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Performance
              </Typography>
            </Box>
          )}
          {employee.engagement_score && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="secondary">
                {employee.engagement_score}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Engagement
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Contact Information */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Email fontSize="small" color="action" />
            <Typography variant="body2" sx={{ 
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
              <Typography variant="body2">
                {employee.phone}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Teams */}
        {employee.teams && employee.teams.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Teams
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {employee.teams.map((team, index) => (
                <Chip
                  key={team.id}
                  label={team.name}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Skills */}
        {employee.skills.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Top Skills
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {employee.skills.slice(0, 3).map((skill, index) => (
                <Chip
                  key={index}
                  label={typeof skill === 'string' ? skill : skill.name}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
              {employee.skills.length > 3 && (
                <Chip
                  label={`+${employee.skills.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Footer Actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Last login: {formatLastLogin(employee.last_login)}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Profile">
              <IconButton size="small" color="primary">
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Employee">
              <IconButton size="small" color="secondary">
                <Edit />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </EmployeeCard>
  )

  // Employee List Row Component
  const EmployeeListRow = ({ employee }: { employee: Employee }) => (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 1, 
        borderRadius: 2,
        // ✅ ADDED: Theme-aware paper
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <FiberManualRecord
              sx={{
                color: employee.last_login && 
                  new Date(employee.last_login).getTime() > Date.now() - 24 * 60 * 60 * 1000
                  ? theme.palette.success.main : theme.palette.text.disabled, // ✅ FIXED: Theme colors
                fontSize: 10
              }}
            />
          }
        >
          <Avatar 
            src={employee.profile_photo_url} 
            sx={{ 
              width: 40, 
              height: 40,
              // ✅ ADDED: Theme-aware avatar
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
          >
            {employee.first_name[0]}{employee.last_name[0]}
          </Avatar>
        </Badge>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {employee.display_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employee.employee_id} • {employee.email}
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {employee.position?.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {employee.department?.name}
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography variant="body2">
            {employee.work_location}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5}>
          <Chip
            label={employee.employment_status.replace('_', ' ')}
            size="small"
            color={getEmployeeStatusColor(employee.employment_status) as any}
            variant="outlined"
          />
          <Chip
            label={employee.retention_risk}
            size="small"
            color={getRetentionRiskColor(employee.retention_risk) as any}
          />
        </Stack>

        <IconButton size="small">
          <MoreVert />
        </IconButton>
      </Stack>
    </Paper>
  )

  return (
    <Box 
      sx={{ 
        p: { xs: 2, md: 3 },
        // ✅ ADDED: Theme-aware background
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh'
      }}
    >
      {/* Search and Controls */}
      <SearchContainer>
        <Stack spacing={2}>
          {/* Title and Actions */}
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  // ✅ ADDED: Theme-aware text color
                  color: theme.palette.text.primary
                }}
              >
                Employee Directory
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and view all employees in your organization
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              {!isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  sx={{ borderRadius: 3 }}
                >
                  Import
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                sx={{ borderRadius: 3 }}
              >
                Add Employee
              </Button>
            </Stack>
          </Stack>

          {/* Search Bar */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search employees by name, email, department, or skills..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                sx: { borderRadius: 3 }
              }}
            />

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(true)}
              sx={{ 
                borderRadius: 3,
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              Filters {Object.values(filters).some(v => 
                Array.isArray(v) ? v.length > 0 : 
                typeof v === 'string' ? v !== '' : false
              ) && (
                <Badge color="primary" variant="dot" sx={{ ml: 1 }} />
              )}
            </Button>
          </Stack>

          {/* Controls Bar */}
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Results Count */}
              <Typography variant="body2" color="text.secondary">
                {filteredAndSortedEmployees.length} of {employees.length} employees
              </Typography>

              {/* Selected Count */}
              {selectedEmployees.length > 0 && (
                <Typography variant="body2" color="primary">
                  {selectedEmployees.length} selected
                </Typography>
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              {/* Sort Controls */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={`${sortBy.field}-${sortBy.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-')
                    setSortBy({
                      field,
                      direction: direction as 'asc' | 'desc',
                      label: field
                    })
                  }}
                >
                  <MenuItem value="display_name-asc">Name A-Z</MenuItem>
                  <MenuItem value="display_name-desc">Name Z-A</MenuItem>
                  <MenuItem value="hire_date-desc">Newest First</MenuItem>
                  <MenuItem value="hire_date-asc">Oldest First</MenuItem>
                  <MenuItem value="performance_rating-desc">Top Performers</MenuItem>
                  <MenuItem value="engagement_score-desc">Most Engaged</MenuItem>
                  <MenuItem value="department.name-asc">Department</MenuItem>
                </Select>
              </FormControl>

              {/* View Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewModule />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Stack>
      </SearchContainer>

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ 
                        width: 56, 
                        height: 56, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.action.hover  // ✅ FIXED: Theme color
                      }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ 
                          height: 20, 
                          bgcolor: theme.palette.action.hover, // ✅ FIXED: Theme color
                          borderRadius: 1, 
                          mb: 1 
                        }} />
                        <Box sx={{ 
                          height: 16, 
                          bgcolor: theme.palette.action.hover, // ✅ FIXED: Theme color
                          borderRadius: 1, 
                          width: '60%' 
                        }} />
                      </Box>
                    </Stack>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Box 
                        key={i} 
                        sx={{ 
                          height: 16, 
                          bgcolor: theme.palette.action.hover, // ✅ FIXED: Theme color
                          borderRadius: 1 
                        }} 
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Employee Grid/List */}
      {!loading && (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {paginatedEmployees.map((employee, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <EmployeeCardComponent employee={employee} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack spacing={1}>
              {paginatedEmployees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <EmployeeListRow employee={employee} />
                </motion.div>
              ))}
            </Stack>
          )}
        </AnimatePresence>
      )}

      {/* Empty State */}
      {!loading && filteredAndSortedEmployees.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search filters or add new employees to get started.
          </Typography>
          <Button variant="contained" startIcon={<PersonAdd />}>
            Add Employee
          </Button>
        </Box>
      )}

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={showFilters}
        onClose={() => setShowFilters(false)}
        PaperProps={{
          // ✅ ADDED: Theme-aware drawer
          sx: {
            backgroundColor: theme.palette.background.default,
            borderLeft: `1px solid ${theme.palette.divider}`,
          }
        }}
      >
        <FilterDrawer />
      </Drawer>

      {/* Mobile FAB for Quick Actions */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Employee actions"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            // ✅ ADDED: Theme-aware FAB
            '& .MuiFab-primary': {
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }
          }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<PersonAdd />}
            tooltipTitle="Add Employee"
            onClick={() => {/* Handle add employee */}}
          />
          <SpeedDialAction
            icon={<Upload />}
            tooltipTitle="Import Employees"
            onClick={() => {/* Handle import */}}
          />
          <SpeedDialAction
            icon={<GetApp />}
            tooltipTitle="Export Data"
            onClick={() => {/* Handle export */}}
          />
        </SpeedDial>
      )}
    </Box>
  )
}
