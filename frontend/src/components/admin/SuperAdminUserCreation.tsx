'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  Alert,
  LinearProgress,
  CircularProgress,
  InputAdornment,
  Divider,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Badge,
  Fab,
} from '@mui/material'
import {
  PersonAdd,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Search,
  FilterList,
  Download,
  Upload,
  VpnKey,
  Security,
  Email,
  Phone,
  Business,
  Badge as BadgeIcon,
  Key,
  Lock,
  LockOpen,
  Refresh,
  Save,
  Cancel,
  Close,
  CheckCircle,
  Warning,
  Error,
  Info,
  ContentCopy,
  Send,
  Password,
  AccountCircle,
  AdminPanelSettings,
  SupervisorAccount,
  Work,
  Group,
  ExpandMore,
  GroupAdd,
  PlaylistAddCheck,
  Speed,
  Assessment,
  Code,
  Build,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useResponsive } from '../../hooks/useResponsive'
import { supabase } from '../../lib/supabase'
import VirtualListSimple from '../common/VirtualListSimple'
import { useTheme } from '@mui/material/styles'

// Enhanced Types for Super Admin
interface TestUserTemplate {
  id: string
  name: string
  description: string
  role: string
  department: string
  position: string
  count: number
  emailPattern: string
  passwordPattern?: string
  active: boolean
}

interface UserCreationBatch {
  id: string
  name: string
  users: NewUserData[]
  status: 'draft' | 'processing' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
  success_count: number
  failure_count: number
  errors: string[]
}

interface NewUserData {
  employee_id: string
  email: string
  first_name: string
  last_name: string
  role_id: number
  department_id: string
  position_id: string
  temporary_password?: string
  send_welcome_email: boolean
  require_password_change: boolean
  phone?: string
  hire_date?: string
  salary?: number
  manager_id?: string
}

interface DepartmentData {
  id: string
  name: string
  code: string
  manager_id?: string
}

interface PositionData {
  id: string
  title: string
  department_id: string
  level: string
  min_salary: number
  max_salary: number
}

// Predefined User Role Templates for Testing
const USER_ROLES = [
  { id: 1, name: 'super_admin', display_name: 'Super Administrator', level: 100, color: 'error', icon: 'AdminPanelSettings' },
  { id: 2, name: 'admin', display_name: 'Administrator', level: 90, color: 'error', icon: 'AdminPanelSettings' },
  { id: 3, name: 'hr_manager', display_name: 'HR Manager', level: 80, color: 'warning', icon: 'SupervisorAccount' },
  { id: 4, name: 'manager', display_name: 'Manager', level: 70, color: 'info', icon: 'Work' },
  { id: 5, name: 'team_lead', display_name: 'Team Lead', level: 60, color: 'primary', icon: 'Group' },
  { id: 6, name: 'employee', display_name: 'Employee', level: 50, color: 'default', icon: 'AccountCircle' },
]

const TEST_USER_TEMPLATES: TestUserTemplate[] = [
  {
    id: 'super-admin-template',
    name: 'Super Admin Users',
    description: 'System administrators with full access',
    role: 'super_admin',
    department: 'IT',
    position: 'System Administrator',
    count: 1,
    emailPattern: 'superadmin{n}@arisehrm.com',
    active: true
  },
  {
    id: 'hr-manager-template',
    name: 'HR Manager Users',
    description: 'Human Resource managers for testing HR workflows',
    role: 'hr_manager',
    department: 'Human Resources',
    position: 'HR Manager',
    count: 2,
    emailPattern: 'hrmanager{n}@arisehrm.com',
    active: true
  },
  {
    id: 'department-manager-template',
    name: 'Department Managers',
    description: 'Department managers across different divisions',
    role: 'manager',
    department: 'Multiple',
    position: 'Department Manager',
    count: 5,
    emailPattern: 'manager{n}@arisehrm.com',
    active: true
  },
  {
    id: 'team-lead-template',
    name: 'Team Leaders',
    description: 'Team leaders for testing team management features',
    role: 'team_lead',
    department: 'Multiple',
    position: 'Team Lead',
    count: 8,
    emailPattern: 'teamlead{n}@arisehrm.com',
    active: true
  },
  {
    id: 'employee-template',
    name: 'Regular Employees',
    description: 'Regular employees for comprehensive testing',
    role: 'employee',
    department: 'Multiple',
    position: 'Multiple',
    count: 20,
    emailPattern: 'employee{n}@arisehrm.com',
    active: true
  },
  {
    id: 'test-scenarios-template',
    name: 'Test Scenario Users',
    description: 'Specialized users for specific test scenarios',
    role: 'employee',
    department: 'QA',
    position: 'Test Engineer',
    count: 10,
    emailPattern: 'testuser{n}@arisehrm.com',
    active: false
  }
]

const SAMPLE_DEPARTMENTS = [
  { id: 'dept-001', name: 'Human Resources', code: 'HR' },
  { id: 'dept-002', name: 'Information Technology', code: 'IT' },
  { id: 'dept-003', name: 'Engineering', code: 'ENG' },
  { id: 'dept-004', name: 'Marketing', code: 'MKT' },
  { id: 'dept-005', name: 'Sales', code: 'SALES' },
  { id: 'dept-006', name: 'Finance', code: 'FIN' },
  { id: 'dept-007', name: 'Operations', code: 'OPS' },
  { id: 'dept-008', name: 'Quality Assurance', code: 'QA' },
]

const SAMPLE_POSITIONS = [
  { id: 'pos-001', title: 'System Administrator', department_id: 'dept-002', level: 'senior', min_salary: 80000, max_salary: 120000 },
  { id: 'pos-002', title: 'HR Manager', department_id: 'dept-001', level: 'management', min_salary: 75000, max_salary: 100000 },
  { id: 'pos-003', title: 'Software Engineer', department_id: 'dept-003', level: 'mid', min_salary: 70000, max_salary: 95000 },
  { id: 'pos-004', title: 'Marketing Manager', department_id: 'dept-004', level: 'management', min_salary: 65000, max_salary: 85000 },
  { id: 'pos-005', title: 'Sales Representative', department_id: 'dept-005', level: 'junior', min_salary: 40000, max_salary: 60000 },
  { id: 'pos-006', title: 'Financial Analyst', department_id: 'dept-006', level: 'mid', min_salary: 55000, max_salary: 75000 },
  { id: 'pos-007', title: 'Operations Manager', department_id: 'dept-007', level: 'management', min_salary: 70000, max_salary: 90000 },
  { id: 'pos-008', title: 'QA Engineer', department_id: 'dept-008', level: 'mid', min_salary: 60000, max_salary: 80000 },
  { id: 'pos-009', title: 'Team Lead', department_id: 'dept-003', level: 'senior', min_salary: 85000, max_salary: 110000 },
]

export default function SuperAdminUserCreation() {
  const { profile } = useAuth()
  const responsive = useResponsive()
  const theme = useTheme()

  // State Management
  const [activeTab, setActiveTab] = useState(0)
  const [templates, setTemplates] = useState<TestUserTemplate[]>(TEST_USER_TEMPLATES)
  const [batches, setBatches] = useState<UserCreationBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  
  // Dialog States
  const [showBulkCreateDialog, setShowBulkCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showBatchDetailsDialog, setShowBatchDetailsDialog] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<UserCreationBatch | null>(null)

  // Form States
  const [newTemplate, setNewTemplate] = useState<Partial<TestUserTemplate>>({
    name: '',
    description: '',
    role: 'employee',
    department: '',
    position: '',
    count: 1,
    emailPattern: 'user{n}@arisehrm.com',
    active: true
  })

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBatches: 0,
    successRate: 0,
    lastCreated: null as string | null
  })

  // Password Generation Utility
  const generateSecurePassword = (length: number = 12): string => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Employee ID Generation
  const generateEmployeeId = (role: string, sequence: number): string => {
    const rolePrefix = {
      'super_admin': 'SA',
      'admin': 'AD', 
      'hr_manager': 'HR',
      'manager': 'MG',
      'team_lead': 'TL',
      'employee': 'EMP'
    }[role] || 'EMP'
    
    const timestamp = Date.now().toString().slice(-4)
    return `${rolePrefix}${timestamp}${sequence.toString().padStart(3, '0')}`
  }

  // Generate Sample First/Last Names
  const generateNames = (index: number) => {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Ashley', 'William', 'Jessica', 
                       'James', 'Amanda', 'Christopher', 'Melissa', 'Matthew', 'Stephanie', 'Joshua', 'Nicole', 'Daniel', 'Elizabeth']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
    
    return {
      first_name: firstNames[index % firstNames.length],
      last_name: lastNames[Math.floor(index / firstNames.length) % lastNames.length]
    }
  }

  // Template to User Data Conversion
  const templateToUserData = (template: TestUserTemplate): NewUserData[] => {
    const users: NewUserData[] = []
    const roleData = USER_ROLES.find(r => r.name === template.role)
    const departmentData = SAMPLE_DEPARTMENTS.find(d => d.name === template.department || template.department === 'Multiple')
    const positionData = SAMPLE_POSITIONS.find(p => p.title === template.position || template.position === 'Multiple')

    for (let i = 1; i <= template.count; i++) {
      const names = generateNames(i - 1)
      const email = template.emailPattern.replace('{n}', i.toString())
      const password = generateSecurePassword()
      
      // For multiple departments/positions, rotate through available options
      const dept = template.department === 'Multiple' 
        ? SAMPLE_DEPARTMENTS[i % SAMPLE_DEPARTMENTS.length] 
        : departmentData || SAMPLE_DEPARTMENTS[0]
        
      const pos = template.position === 'Multiple'
        ? SAMPLE_POSITIONS[i % SAMPLE_POSITIONS.length]
        : positionData || SAMPLE_POSITIONS[0]

      users.push({
        employee_id: generateEmployeeId(template.role, i),
        email,
        first_name: names.first_name,
        last_name: names.last_name,
        role_id: roleData?.id || 6,
        department_id: dept.id,
        position_id: pos.id,
        temporary_password: password,
        send_welcome_email: true,
        require_password_change: true,
        phone: `+1-555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        hire_date: new Date().toISOString().split('T')[0],
        salary: pos.min_salary + Math.floor(Math.random() * (pos.max_salary - pos.min_salary)),
      })
    }

    return users
  }

  // Bulk User Creation Function
  const handleBulkCreateUsers = async () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select at least one template')
      return
    }

    setSaving(true)
    const batchId = `batch-${Date.now()}`
    const batchName = `Bulk Creation - ${new Date().toLocaleString()}`

    try {
      // Prepare all users from selected templates
      const allUsers: NewUserData[] = []
      
      selectedTemplates.forEach(templateId => {
        const template = templates.find(t => t.id === templateId)
        if (template) {
          const templateUsers = templateToUserData(template)
          allUsers.push(...templateUsers)
        }
      })

      // Create batch record
      const newBatch: UserCreationBatch = {
        id: batchId,
        name: batchName,
        users: allUsers,
        status: 'processing',
        created_at: new Date().toISOString(),
        success_count: 0,
        failure_count: 0,
        errors: []
      }

      setBatches(prev => [...prev, newBatch])
      toast.info(`Creating batch with ${allUsers.length} users...`)

      // Simulate batch processing (in real implementation, this would be async)
      let successCount = 0
      let failureCount = 0
      const errors: string[] = []

      for (const user of allUsers) {
        try {
          // In real implementation, this would create actual users in Supabase Auth and user_profiles table
          // For demo, we simulate success/failure
          if (Math.random() > 0.05) { // 95% success rate simulation
            successCount++
            
            // Simulate API calls
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Here you would:
            // 1. Create auth user: const { data, error } = await supabase.auth.signUp({ email: user.email, password: user.temporary_password })
            // 2. Create user profile: await supabase.from('user_profiles').insert({ employee_id: user.employee_id, ... })
            // 3. Send welcome email if requested
            
          } else {
            failureCount++
            errors.push(`Failed to create user: ${user.email}`)
          }
        } catch (error) {
          failureCount++
          errors.push(`Error creating ${user.email}: ${error.message}`)
        }
      }

      // Update batch status
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { 
              ...batch, 
              status: 'completed',
              completed_at: new Date().toISOString(),
              success_count: successCount,
              failure_count: failureCount,
              errors
            }
          : batch
      ))

      // Update statistics
      setStats(prev => ({
        totalUsers: prev.totalUsers + successCount,
        totalBatches: prev.totalBatches + 1,
        successRate: Math.round(((prev.totalUsers * prev.successRate / 100) + successCount) / (prev.totalUsers + allUsers.length) * 100),
        lastCreated: new Date().toISOString()
      }))

      toast.success(`Batch completed! ${successCount} users created successfully`, {
        description: failureCount > 0 ? `${failureCount} users failed to create` : 'All users created successfully'
      })

      setSelectedTemplates([])
      setShowBulkCreateDialog(false)

    } catch (error) {
      toast.error('Failed to create user batch')
      
      // Update batch status to failed
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'failed', errors: [error.message] }
          : batch
      ))
    } finally {
      setSaving(false)
    }
  }

  // Export User Credentials
  const exportUserCredentials = (batch: UserCreationBatch) => {
    const csvData = batch.users.map(user => ({
      'Employee ID': user.employee_id,
      'Name': `${user.first_name} ${user.last_name}`,
      'Email': user.email,
      'Temporary Password': user.temporary_password,
      'Role': USER_ROLES.find(r => r.id === user.role_id)?.display_name,
      'Department': SAMPLE_DEPARTMENTS.find(d => d.id === user.department_id)?.name,
      'Position': SAMPLE_POSITIONS.find(p => p.id === user.position_id)?.title,
      'Phone': user.phone,
      'Salary': user.salary,
      'Hire Date': user.hire_date,
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `user_credentials_${batch.id}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('User credentials exported successfully')
  }

  // Quick Setup for Common Scenarios
  const handleQuickSetup = async (scenario: 'minimal' | 'standard' | 'comprehensive') => {
    const scenarioTemplates = {
      minimal: ['super-admin-template', 'hr-manager-template'],
      standard: ['super-admin-template', 'hr-manager-template', 'department-manager-template', 'employee-template'],
      comprehensive: templates.filter(t => t.active).map(t => t.id)
    }

    setSelectedTemplates(scenarioTemplates[scenario])
    setShowBulkCreateDialog(true)
  }

  // Add Custom Template
  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.description) {
      toast.error('Please fill in template name and description')
      return
    }

    const template: TestUserTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      role: newTemplate.role || 'employee',
      department: newTemplate.department || 'Multiple',
      position: newTemplate.position || 'Multiple',
      count: newTemplate.count || 1,
      emailPattern: newTemplate.emailPattern || 'user{n}@arisehrm.com',
      active: newTemplate.active !== false
    }

    setTemplates(prev => [...prev, template])
    
    // Reset form
    setNewTemplate({
      name: '',
      description: '',
      role: 'employee',
      department: '',
      position: '',
      count: 1,
      emailPattern: 'user{n}@arisehrm.com',
      active: true
    })
    
    setShowTemplateDialog(false)
    toast.success('Template added successfully')
  }

  // Get Role Icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return <AdminPanelSettings />
      case 'hr_manager':
        return <SupervisorAccount />
      case 'manager':
        return <Work />
      case 'team_lead':
        return <Group />
      default:
        return <AccountCircle />
    }
  }

  // Calculate total users for selected templates
  const totalSelectedUsers = templates
    .filter(t => selectedTemplates.includes(t.id))
    .reduce((sum, template) => sum + template.count, 0)

  return (
    <Box sx={{ p: responsive.getPadding(2, 3) }}>
      {/* Header */}
      <Stack 
        direction={responsive.getFlexDirection('column', 'row')} 
        justifyContent="space-between" 
        alignItems={responsive.isMobile ? "stretch" : "center"} 
        spacing={responsive.getSpacing(2, 0)}
        sx={{ mb: responsive.getSpacing(2, 3) }}
      >
        <Box>
          <Typography 
            variant={responsive.getVariant('h5', 'h4')} 
            sx={{ fontWeight: 700, mb: 1 }}
          >
            🚀 Super Admin User Creation
          </Typography>
          <Typography 
            variant={responsive.getVariant('body2', 'body1')} 
            color="text.secondary"
          >
            Rapidly create test users and manage bulk user operations for development and testing
          </Typography>
        </Box>
        
        <Badge badgeContent={stats.totalUsers} color="primary">
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setShowBulkCreateDialog(true)}
            sx={{ 
              minWidth: responsive.isMobile ? '100%' : 'auto',
              height: responsive.isMobile ? 48 : 56 
            }}
          >
            <GroupAdd sx={{ mr: 1 }} />
            Create Users
          </Fab>
        </Badge>
      </Stack>
      {/* Quick Setup Cards */}
      <Grid container spacing={responsive.getSpacing(2, 3)} sx={{ mb: responsive.getSpacing(3, 4) }}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}>
          <Card 
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8]
              }
            }}
            onClick={() => handleQuickSetup('minimal')}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Speed sx={{ fontSize: 48, color: 'success.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Minimal Setup
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  1 Super Admin + 2 HR Managers
                  <br />
                  Perfect for basic testing
                </Typography>
                <Chip label="3 Users" color="success" size="small" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}>
          <Card 
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8]
              }
            }}
            onClick={() => handleQuickSetup('standard')}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Assessment sx={{ fontSize: 48, color: 'info.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Standard Setup
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete hierarchy with employees
                  <br />
                  Good for workflow testing
                </Typography>
                <Chip label="28 Users" color="info" size="small" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}>
          <Card 
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8]
              }
            }}
            onClick={() => handleQuickSetup('comprehensive')}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Build sx={{ fontSize: 48, color: 'warning.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Comprehensive Setup
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All templates including test scenarios
                  <br />
                  Complete testing environment
                </Typography>
                <Chip label="46 Users" color="warning" size="small" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Statistics Cards */}
      <Grid container spacing={responsive.getSpacing(2, 3)} sx={{ mb: responsive.getSpacing(3, 4) }}>
        <Grid
          size={{
            xs: 6,
            sm: 3
          }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: responsive.getSpacing(2, 3) }}>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users Created
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 6,
            sm: 3
          }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: responsive.getSpacing(2, 3) }}>
              <Typography variant="h4" color="secondary" fontWeight={700}>
                {stats.totalBatches}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Batches
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 6,
            sm: 3
          }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: responsive.getSpacing(2, 3) }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {stats.successRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 6,
            sm: 3
          }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: responsive.getSpacing(2, 3) }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Created
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.lastCreated ? new Date(stats.lastCreated).toLocaleString() : 'Never'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Main Content Tabs */}
      <Card>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={responsive.isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
        >
          <Tab label="User Templates" />
          <Tab label="Creation Batches" />
          <Tab label="Bulk Operations" />
        </Tabs>

        <CardContent>
          {/* User Templates Tab */}
          {activeTab === 0 && (
            <Box>
              <Stack direction="row" justifyContent="between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">Available User Templates</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<PlaylistAddCheck />}
                    onClick={() => setSelectedTemplates(templates.filter(t => t.active).map(t => t.id))}
                    size={responsive.getButtonSize()}
                  >
                    Select All Active
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => setShowTemplateDialog(true)}
                    size={responsive.getButtonSize()}
                  >
                    Add Template
                  </Button>
                </Stack>
              </Stack>

              <Grid container spacing={responsive.getSpacing(2, 3)}>
                {templates.map((template) => (
                  <Grid
                    key={template.id}
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 4
                    }}>
                    <Card 
                      variant={selectedTemplates.includes(template.id) ? "elevation" : "outlined"}
                      sx={{ 
                        height: '100%',
                        border: selectedTemplates.includes(template.id) ? `2px solid ${theme.palette.primary.main}` : undefined,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        setSelectedTemplates(prev => 
                          prev.includes(template.id) 
                            ? prev.filter(id => id !== template.id)
                            : [...prev, template.id]
                        )
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ 
                              bgcolor: USER_ROLES.find(r => r.name === template.role)?.color === 'error' ? 'error.main' : 'primary.main',
                            }}>
                              {getRoleIcon(template.role)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {template.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {template.description}
                              </Typography>
                            </Box>
                            <Switch
                              checked={selectedTemplates.includes(template.id)}
                              size="small"
                            />
                          </Stack>

                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip 
                              label={USER_ROLES.find(r => r.name === template.role)?.display_name} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`${template.count} users`} 
                              size="small" 
                              color="secondary" 
                              variant="outlined" 
                            />
                          </Stack>

                          <Typography variant="body2" color="text.secondary">
                            <strong>Department:</strong> {template.department}
                            <br />
                            <strong>Position:</strong> {template.position}
                            <br />
                            <strong>Email Pattern:</strong> {template.emailPattern}
                          </Typography>

                          {!template.active && (
                            <Chip label="Inactive" size="small" color="default" variant="outlined" />
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {selectedTemplates.length > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.primary.main + '0a', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">
                      <strong>{selectedTemplates.length}</strong> templates selected • 
                      <strong> {totalSelectedUsers}</strong> users to create
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<GroupAdd />}
                      onClick={() => setShowBulkCreateDialog(true)}
                      size={responsive.getButtonSize()}
                    >
                      Create Selected Users
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>
          )}

          {/* Creation Batches Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                User Creation History
              </Typography>

              {batches.length === 0 ? (
                <Alert severity="info">
                  No user creation batches yet. Create your first batch using the templates tab.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {batches.map((batch) => (
                    <Card key={batch.id} variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {batch.name}
                              </Typography>
                              <Chip 
                                label={batch.status} 
                                color={
                                  batch.status === 'completed' ? 'success' : 
                                  batch.status === 'failed' ? 'error' :
                                  batch.status === 'processing' ? 'warning' : 'default'
                                }
                                size="small"
                              />
                              {batch.status === 'processing' && <CircularProgress size={16} />}
                            </Stack>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Created: {new Date(batch.created_at).toLocaleString()}
                              {batch.completed_at && ` • Completed: ${new Date(batch.completed_at).toLocaleString()}`}
                            </Typography>

                            <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                              <Typography variant="body2">
                                <strong>Total:</strong> {batch.users.length} users
                              </Typography>
                              <Typography variant="body2" color="success.main">
                                <strong>Success:</strong> {batch.success_count}
                              </Typography>
                              {batch.failure_count > 0 && (
                                <Typography variant="body2" color="error.main">
                                  <strong>Failed:</strong> {batch.failure_count}
                                </Typography>
                              )}
                            </Stack>
                          </Box>

                          <Stack spacing={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSelectedBatch(batch)
                                setShowBatchDetailsDialog(true)
                              }}
                            >
                              View Details
                            </Button>
                            {batch.status === 'completed' && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Download />}
                                onClick={() => exportUserCredentials(batch)}
                              >
                                Export Credentials
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {/* Bulk Operations Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Bulk Operations & Utilities
              </Typography>

              <Grid container spacing={responsive.getSpacing(2, 3)}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4
                  }}>
                  <Card>
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Code sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Typography variant="h6">Generate Test Data</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Create comprehensive test datasets for development
                        </Typography>
                        <Button variant="contained" fullWidth>
                          Generate Data
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4
                  }}>
                  <Card>
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Delete sx={{ fontSize: 48, color: 'error.main' }} />
                        <Typography variant="h6">Cleanup Test Users</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Remove all test users and reset environment
                        </Typography>
                        <Button variant="outlined" color="error" fullWidth>
                          Cleanup Users
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4
                  }}>
                  <Card>
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Upload sx={{ fontSize: 48, color: 'info.main' }} />
                        <Typography variant="h6">Import Users CSV</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Bulk import users from CSV file
                        </Typography>
                        <Button variant="outlined" color="info" fullWidth>
                          Import CSV
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      {/* Bulk Create Dialog */}
      <Dialog
        open={showBulkCreateDialog}
        onClose={() => setShowBulkCreateDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={responsive.getDialogFullScreen()}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Create User Batch</Typography>
            <IconButton onClick={() => setShowBulkCreateDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            You're about to create <strong>{totalSelectedUsers} users</strong> from <strong>{selectedTemplates.length} templates</strong>.
            This action will generate secure passwords and optionally send welcome emails.
          </Alert>

          <Typography variant="h6" gutterBottom>
            Selected Templates:
          </Typography>

          <Stack spacing={2}>
            {selectedTemplates.map(templateId => {
              const template = templates.find(t => t.id === templateId)
              if (!template) return null

              return (
                <Card key={templateId} variant="outlined">
                  <CardContent sx={{ py: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: USER_ROLES.find(r => r.name === template.role)?.color === 'error' ? 'error.main' : 'primary.main',
                        width: 32,
                        height: 32
                      }}>
                        {getRoleIcon(template.role)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.count} {USER_ROLES.find(r => r.name === template.role)?.display_name} users
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${template.count} users`} 
                        size="small" 
                        color="primary" 
                      />
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>

          <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.warning.main + '0a', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> This will create real user accounts in your system. 
              Make sure you're running this in a development or testing environment.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowBulkCreateDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkCreateUsers}
            disabled={saving || selectedTemplates.length === 0}
            startIcon={saving ? <CircularProgress size={20} /> : <GroupAdd />}
          >
            {saving ? 'Creating Users...' : `Create ${totalSelectedUsers} Users`}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add Template Dialog */}
      <Dialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add Custom Template</Typography>
            <IconButton onClick={() => setShowTemplateDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Template Name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={2}
              required
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newTemplate.role}
                  label="Role"
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, role: e.target.value }))}
                >
                  {USER_ROLES.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getRoleIcon(role.name)}
                        <Typography>{role.display_name}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="User Count"
                type="number"
                value={newTemplate.count}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                inputProps={{ min: 1, max: 100 }}
              />
            </Box>

            <TextField
              fullWidth
              label="Email Pattern"
              value={newTemplate.emailPattern}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, emailPattern: e.target.value }))}
              helperText="Use {n} as placeholder for user number (e.g., user{n}@example.com)"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Department"
                value={newTemplate.department}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, department: e.target.value }))}
                helperText="Use 'Multiple' for varied departments"
              />

              <TextField
                fullWidth
                label="Position"
                value={newTemplate.position}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, position: e.target.value }))}
                helperText="Use 'Multiple' for varied positions"
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={newTemplate.active !== false}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, active: e.target.checked }))}
                />
              }
              label="Active Template"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowTemplateDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTemplate}
            startIcon={<Save />}
          >
            Add Template
          </Button>
        </DialogActions>
      </Dialog>
      {/* Batch Details Dialog */}
      <Dialog
        open={showBatchDetailsDialog}
        onClose={() => setShowBatchDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={responsive.getDialogFullScreen()}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Batch Details: {selectedBatch?.name}
            </Typography>
            <IconButton onClick={() => setShowBatchDetailsDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {selectedBatch && (
            <Stack spacing={3}>
              {/* Batch Summary */}
              <Alert 
                severity={
                  selectedBatch.status === 'completed' ? 'success' : 
                  selectedBatch.status === 'failed' ? 'error' : 'info'
                }
              >
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedBatch.status} | 
                  <strong> Total Users:</strong> {selectedBatch.users.length} | 
                  <strong> Success:</strong> {selectedBatch.success_count} | 
                  <strong> Failed:</strong> {selectedBatch.failure_count}
                </Typography>
              </Alert>

              {/* Error Messages */}
              {selectedBatch.errors.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography color="error">
                      Errors ({selectedBatch.errors.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      {selectedBatch.errors.map((error, index) => (
                        <Typography key={index} variant="body2" color="error">
                          {error}
                        </Typography>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Users Table */}
              <Typography variant="h6">Created Users</Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBatch.users.slice(0, 50).map((user) => ( // Limit to 50 for performance
                      (<TableRow key={user.employee_id}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {user.employee_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={USER_ROLES.find(r => r.id === user.role_id)?.display_name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {SAMPLE_DEPARTMENTS.find(d => d.id === user.department_id)?.name}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label="Created" 
                            size="small" 
                            color="success" 
                          />
                        </TableCell>
                      </TableRow>)
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {selectedBatch.users.length > 50 && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Showing first 50 users of {selectedBatch.users.length} total
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowBatchDetailsDialog(false)}>
            Close
          </Button>
          {selectedBatch?.status === 'completed' && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => exportUserCredentials(selectedBatch)}
            >
              Export User Credentials
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
