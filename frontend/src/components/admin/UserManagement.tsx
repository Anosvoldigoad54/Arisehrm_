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
  Badge,
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
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useResponsive } from '../../hooks/useResponsive'
import { supabase } from '../../lib/supabase'
import VirtualListSimple from '../common/VirtualListSimple'
import { useTheme } from '@mui/material/styles'

// Types
interface UserAccount {
  id: string
  employee_id: string
  email: string
  first_name: string
  last_name: string
  role: string
  role_display_name: string
  department: string
  position: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  last_login?: string
  created_at: string
  has_password: boolean
  email_verified: boolean
  two_factor_enabled: boolean
  failed_login_attempts: number
  account_locked: boolean
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
}

const USER_ROLES = [
  { id: 1, name: 'super_admin', display_name: 'Super Administrator', level: 100, color: 'error' },
  { id: 2, name: 'admin', display_name: 'Administrator', level: 90, color: 'error' },
  { id: 3, name: 'hr_manager', display_name: 'HR Manager', level: 80, color: 'warning' },
  { id: 4, name: 'manager', display_name: 'Manager', level: 70, color: 'info' },
  { id: 5, name: 'team_lead', display_name: 'Team Lead', level: 60, color: 'primary' },
  { id: 6, name: 'employee', display_name: 'Employee', level: 50, color: 'default' },
]

const USER_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
  { value: 'suspended', label: 'Suspended', color: 'error' },
  { value: 'pending', label: 'Pending', color: 'warning' },
]

export default function UserManagement() {
  const { profile } = useAuth()
  const responsive = useResponsive()
  const theme = useTheme()

  // State
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [newUserData, setNewUserData] = useState<NewUserData>({
    employee_id: '',
    email: '',
    first_name: '',
    last_name: '',
    role_id: 6,
    department_id: '',
    position_id: '',
    send_welcome_email: true,
    require_password_change: true
  })
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [activeTab, setActiveTab] = useState(0)

  // Load users
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch from your users table
      // For demo, we'll create sample data
      const demoUsers: UserAccount[] = [
        {
          id: '1',
          employee_id: 'EMP001',
          email: 'admin@arisehrm.com',
          first_name: 'System',
          last_name: 'Administrator',
          role: 'super_admin',
          role_display_name: 'Super Administrator',
          department: 'IT',
          position: 'System Admin',
          status: 'active',
          last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          has_password: true,
          email_verified: true,
          two_factor_enabled: true,
          failed_login_attempts: 0,
          account_locked: false
        },
        {
          id: '2',
          employee_id: 'EMP002',
          email: 'hr@arisehrm.com',
          first_name: 'Sarah',
          last_name: 'Johnson',
          role: 'hr_manager',
          role_display_name: 'HR Manager',
          department: 'Human Resources',
          position: 'HR Manager',
          status: 'active',
          last_login: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          has_password: true,
          email_verified: true,
          two_factor_enabled: false,
          failed_login_attempts: 0,
          account_locked: false
        },
        {
          id: '3',
          employee_id: 'EMP003',
          email: 'mike.chen@arisehrm.com',
          first_name: 'Mike',
          last_name: 'Chen',
          role: 'manager',
          role_display_name: 'Manager',
          department: 'Engineering',
          position: 'Engineering Manager',
          status: 'active',
          last_login: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          has_password: true,
          email_verified: true,
          two_factor_enabled: true,
          failed_login_attempts: 0,
          account_locked: false
        },
        {
          id: '4',
          employee_id: 'EMP004',
          email: 'john.doe@arisehrm.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'employee',
          role_display_name: 'Employee',
          department: 'Sales',
          position: 'Sales Representative',
          status: 'pending',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          has_password: false,
          email_verified: false,
          two_factor_enabled: false,
          failed_login_attempts: 0,
          account_locked: false
        }
      ]

      setUsers(demoUsers)
      toast.success('Users loaded successfully')
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(password)
    setNewUserData(prev => ({ ...prev, temporary_password: password }))
  }

  const generateEmployeeId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const id = `EMP${timestamp}`
    setNewUserData(prev => ({ ...prev, employee_id: id }))
  }

  const handleCreateUser = async () => {
    if (!newUserData.email || !newUserData.first_name || !newUserData.last_name) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      // Generate password if not provided
      if (!newUserData.temporary_password) {
        generatePassword()
      }

      // In a real implementation, this would:
      // 1. Create auth user in Supabase Auth
      // 2. Create user profile record
      // 3. Send welcome email with temporary password
      // 4. Set up required password change

      const newUser: UserAccount = {
        id: Date.now().toString(),
        ...newUserData,
        role: USER_ROLES.find(r => r.id === newUserData.role_id)?.name || 'employee',
        role_display_name: USER_ROLES.find(r => r.id === newUserData.role_id)?.display_name || 'Employee',
        department: 'Unassigned', // Would be fetched from department_id
        position: 'Unassigned', // Would be fetched from position_id
        status: 'pending',
        created_at: new Date().toISOString(),
        has_password: !!newUserData.temporary_password,
        email_verified: false,
        two_factor_enabled: false,
        failed_login_attempts: 0,
        account_locked: false
      }

      setUsers(prev => [...prev, newUser])
      
      toast.success('User account created successfully!', {
        description: newUserData.send_welcome_email ? 'Welcome email sent' : 'Account ready for manual setup'
      })

      // Reset form
      setNewUserData({
        employee_id: '',
        email: '',
        first_name: '',
        last_name: '',
        role_id: 6,
        department_id: '',
        position_id: '',
        send_welcome_email: true,
        require_password_change: true
      })
      setGeneratedPassword('')
      setActiveStep(0)
      setShowCreateDialog(false)

    } catch (error) {
      toast.error('Failed to create user account')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async (user: UserAccount) => {
    setSaving(true)
    try {
      generatePassword()
      
      // In a real implementation, this would:
      // 1. Generate new temporary password
      // 2. Update user in auth system
      // 3. Send password reset email
      // 4. Force password change on next login

      toast.success('Password reset successfully!', {
        description: 'Temporary password generated and email sent'
      })
      
      setSelectedUser(user)
      setShowPasswordDialog(true)
    } catch (error) {
      toast.error('Failed to reset password')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleUserStatus = async (user: UserAccount) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, status: newStatus }
          : u
      ))

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handleUnlockAccount = async (user: UserAccount) => {
    try {
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, account_locked: false, failed_login_attempts: 0 }
          : u
      ))

      toast.success('Account unlocked successfully')
    } catch (error) {
      toast.error('Failed to unlock account')
    }
  }

  // ✅ NEW: Export Users Functionality
  const handleExportUsers = async () => {
    try {
      setSaving(true)
      toast.info('Preparing user export...')

      // Filter users based on current filters
      let exportData = users.filter(user => {
        if (searchTerm && !user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false
        }
        if (statusFilter && user.status !== statusFilter) {
          return false
        }
        if (roleFilter && user.role !== roleFilter) {
          return false
        }
        return true
      })

      // Prepare export fields
      const exportFields = exportData.map(user => ({
        'Employee ID': user.employee_id || 'N/A',
        'First Name': user.first_name,
        'Last Name': user.last_name,
        'Email': user.email,
        'Role': user.role,
        'Department': user.department || 'N/A',
        'Status': user.status,
        'Created Date': new Date(user.created_at).toLocaleDateString(),
        'Last Login': user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
        'Failed Login Attempts': user.failed_login_attempts || 0,
        'Account Locked': user.account_locked ? 'Yes' : 'No'
      }))

      // Create CSV content
      const headers = Object.keys(exportFields[0] || {})
      const csvContent = [
        headers.join(','),
        ...exportFields.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row]
            // Escape commas and quotes
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value
          }).join(',')
        )
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${exportFields.length} users successfully!`)
    } catch (error: any) {
      toast.error('Failed to export users')
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const sendWelcomeEmail = async (user: UserAccount) => {
    try {
      // In a real implementation, this would send a welcome email
      toast.success('Welcome email sent successfully')
    } catch (error) {
      toast.error('Failed to send welcome email')
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || user.status === statusFilter
    const matchesRole = !roleFilter || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return <AdminPanelSettings />
      case 'hr_manager':
        return <SupervisorAccount />
      case 'manager':
        return <Work />
      default:
        return <AccountCircle />
    }
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: responsive.getSpacing(2, 3) }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Create a new user account with login credentials. The system will generate a secure temporary password.
            </Alert>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: responsive.getSpacing(2, 3)
            }}>
              <Box>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={newUserData.employee_id}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, employee_id: e.target.value }))}
                    required
                    size={responsive.getInputSize()}
                  />
                  <Button variant="outlined" onClick={generateEmployeeId}>
                    Generate
                  </Button>
                </Stack>
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  size={responsive.getInputSize()}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="First Name"
                  value={newUserData.first_name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                  size={responsive.getInputSize()}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={newUserData.last_name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                  size={responsive.getInputSize()}
                />
              </Box>
              
              <Box>
                <FormControl fullWidth size={responsive.getInputSize()}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={newUserData.role_id}
                    label="Role"
                    onChange={(e) => setNewUserData(prev => ({ ...prev, role_id: e.target.value as number }))}
                  >
                    {USER_ROLES.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {getRoleIcon(role.name)}
                          <Typography>{role.display_name}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        )
      case 1:
        return (
          <Stack spacing={responsive.getSpacing(2, 3)}>
            <Typography variant="h6">Password & Security</Typography>
            
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">Temporary Password</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={generatePassword}
                      size={responsive.getButtonSize()}
                    >
                      Generate New
                    </Button>
                  </Stack>
                  
                  <TextField
                    fullWidth
                    label="Generated Password"
                    value={generatedPassword}
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Stack direction="row" spacing={1}>
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                          <IconButton onClick={() => copyToClipboard(generatedPassword)}>
                            <ContentCopy />
                          </IconButton>
                        </Stack>
                      )
                    }}
                    size={responsive.getInputSize()}
                  />
                  
                  <Typography variant="caption" color="text.secondary">
                    This temporary password will be sent to the user via email. They will be required to change it on first login.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <FormControlLabel
              control={
                <Switch
                  checked={newUserData.send_welcome_email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, send_welcome_email: e.target.checked }))}
                />
              }
              label="Send welcome email with login instructions"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newUserData.require_password_change}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, require_password_change: e.target.checked }))}
                />
              }
              label="Require password change on first login"
            />
          </Stack>
        )
      default:
        return null
    }
  }

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
            User Management
          </Typography>
          <Typography 
            variant={responsive.getVariant('body2', 'body1')} 
            color="text.secondary"
          >
            Create and manage user accounts, passwords, and access permissions
          </Typography>
        </Box>
        
        <Stack 
          direction={responsive.getFlexDirection('column', 'row')} 
          spacing={responsive.getSpacing(1, 2)}
          sx={{ width: responsive.isMobile ? '100%' : 'auto' }}
        >
          <Button
            variant="outlined"
            startIcon={<Download />}
            size={responsive.getButtonSize()}
            fullWidth={responsive.isMobile}
            onClick={handleExportUsers}
          >
            Export Users
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            size={responsive.getButtonSize()}
            fullWidth={responsive.isMobile}
            onClick={() => setShowCreateDialog(true)}
          >
            Create User
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: responsive.getPadding(2, 3), mb: responsive.getSpacing(2, 3), borderRadius: 3 }}>
        <Stack spacing={responsive.getSpacing(2, 3)}>
          <Stack 
            direction={responsive.getFlexDirection('column', 'row')} 
            spacing={responsive.getSpacing(2, 2)} 
            alignItems={responsive.isMobile ? "stretch" : "center"}
          >
            <TextField
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size={responsive.getInputSize()}
              sx={{ 
                minWidth: responsive.isMobile ? '100%' : 300,
                maxWidth: responsive.isMobile ? '100%' : 400 
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              size={responsive.getButtonSize()}
            >
              Filters
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadUsers}
              size={responsive.getButtonSize()}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: responsive.getSpacing(2, 2),
                  pt: 2
                }}>
                  <Box>
                    <FormControl fullWidth size={responsive.getInputSize()}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        {USER_STATUSES.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl fullWidth size={responsive.getInputSize()}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={roleFilter}
                        label="Role"
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <MenuItem value="">All Roles</MenuItem>
                        {USER_ROLES.map((role) => (
                          <MenuItem key={role.name} value={role.name}>
                            {role.display_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1', md: 'auto' } }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setStatusFilter('')
                        setRoleFilter('')
                        setSearchQuery('')
                      }}
                      size={responsive.getButtonSize()}
                      fullWidth
                    >
                      Clear Filters
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </Paper>

      {/* Users Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      ) : (
        <Box sx={{ height: 500 }}>
          {/* Header Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderBottom: `2px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.grey[50],
              fontWeight: 600
            }}
          >
            <Box sx={{ flex: 2, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                User
              </Typography>
            </Box>
            {!responsive.isMobile && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Role
                </Typography>
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Status
              </Typography>
            </Box>
            {!responsive.isSmallMobile && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Last Login
                </Typography>
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Actions
              </Typography>
            </Box>
          </Box>
          
          <VirtualListSimple
            items={filteredUsers}
            height={450}
            itemHeight={70}
            renderItem={(user) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <Box sx={{ flex: 2, minWidth: 0 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ 
                      bgcolor: USER_ROLES.find(r => r.name === user.role)?.color === 'error' ? 'error.main' : 'primary.main',
                      width: responsive.isSmallMobile ? 32 : 40, 
                      height: responsive.isSmallMobile ? 32 : 40 
                    }}>
                      {getRoleIcon(user.role)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.first_name} {user.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.employee_id} • {user.email}
                      </Typography>
                      {responsive.isMobile && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {user.role_display_name}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>
                {!responsive.isMobile && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Chip
                      label={user.role_display_name}
                      color={USER_ROLES.find(r => r.name === user.role)?.color as any || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack spacing={0.5}>
                    <Chip
                      label={USER_STATUSES.find(s => s.value === user.status)?.label || user.status}
                      color={USER_STATUSES.find(s => s.value === user.status)?.color as any || 'default'}
                      size="small"
                    />
                    {!user.has_password && (
                      <Chip label="No Password" color="warning" size="small" variant="outlined" />
                    )}
                    {user.account_locked && (
                      <Chip label="Locked" color="error" size="small" variant="outlined" />
                    )}
                  </Stack>
                </Box>
                {!responsive.isSmallMobile && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    {!user.has_password && (
                      <Tooltip title="Set Password">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleResetPassword(user)}
                          disabled={saving}
                        >
                          <VpnKey />
                        </IconButton>
                      </Tooltip>
                    )}
                    {user.account_locked && (
                      <Tooltip title="Unlock Account">
                        <IconButton 
                          size="small" 
                          color="warning"
                          onClick={() => handleUnlockAccount(user)}
                        >
                          <LockOpen />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                      <IconButton 
                        size="small" 
                        color={user.status === 'active' ? 'error' : 'success'}
                        onClick={() => handleToggleUserStatus(user)}
                      >
                        {user.status === 'active' ? <Lock /> : <LockOpen />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send Welcome Email">
                      <IconButton 
                        size="small" 
                        onClick={() => sendWelcomeEmail(user)}
                      >
                        <Send />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Box>
            )}
            emptyMessage="No users found"
          />
        </Box>
      )}

      {/* Create User Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth={responsive.getDialogMaxWidth()}
        fullWidth
        fullScreen={responsive.getDialogFullScreen()}
        PaperProps={{
          sx: {
            borderRadius: responsive.getDialogFullScreen() ? 0 : 3,
            minHeight: responsive.getDialogFullScreen() ? '100vh' : 500
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Create New User Account</Typography>
            <IconButton onClick={() => setShowCreateDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>User Information</StepLabel>
            </Step>
            <Step>
              <StepLabel>Password & Security</StepLabel>
            </Step>
          </Stepper>

          {getStepContent(activeStep)}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            {activeStep > 0 && (
              <Button onClick={() => setActiveStep(activeStep - 1)}>
                Back
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Button onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            {activeStep < 1 ? (
              <Button
                variant="contained"
                onClick={() => {
                  if (activeStep === 0) {
                    generatePassword()
                  }
                  setActiveStep(activeStep + 1)
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleCreateUser}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              >
                Create User Account
              </Button>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Password Dialog */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Password Generated</Typography>
            <IconButton onClick={() => setShowPasswordDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            A new temporary password has been generated for {selectedUser?.first_name} {selectedUser?.last_name}.
          </Alert>

          <TextField
            fullWidth
            label="Temporary Password"
            value={generatedPassword}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Stack direction="row" spacing={1}>
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                  <IconButton onClick={() => copyToClipboard(generatedPassword)}>
                    <ContentCopy />
                  </IconButton>
                </Stack>
              )
            }}
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" color="text.secondary">
            Please securely share this password with the user. They will be required to change it on their first login.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Send />}
            onClick={() => {
              sendWelcomeEmail(selectedUser!)
              setShowPasswordDialog(false)
            }}
          >
            Send Welcome Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
