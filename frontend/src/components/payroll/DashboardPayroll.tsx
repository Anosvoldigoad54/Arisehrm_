'use client'

import React, { useState, useEffect } from 'react'
import * as buttonHandlers from '../../utils/buttonHandlers'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
  LinearProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Badge,
  useTheme,
  alpha
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  People,
  Calculate,
  FileDownload,
  Settings,
  NotificationsActive,
  MonetizationOn,
  AccessTime,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Add,
  MoreVert,
  Visibility,
  Edit,
  Send,
  Schedule
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'

// Custom components
import { NumberTicker } from '../common/NumberTicker'
import VirtualListSimple from '../common/VirtualListSimple'

// Types
interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  basicSalary: number
  allowances: number
  deductions: number
  grossSalary: number
  netSalary: number
  status: 'draft' | 'processed' | 'approved' | 'paid'
  payPeriod: string
  payDate: string
  avatar?: string
}

interface PayrollStats {
  totalPayroll: number
  employeeCount: number
  avgSalary: number
  pendingApprovals: number
  processedPayrolls: number
  totalDeductions: number
  totalAllowances: number
  payrollTrend: number
}

const mockPayrollData: PayrollRecord[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Smith',
    department: 'Engineering',
    basicSalary: 85000,
    allowances: 12000,
    deductions: 8500,
    grossSalary: 97000,
    netSalary: 88500,
    status: 'paid',
    payPeriod: 'January 2025',
    payDate: '2025-01-31'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    department: 'Design',
    basicSalary: 75000,
    allowances: 10000,
    deductions: 7200,
    grossSalary: 85000,
    netSalary: 77800,
    status: 'processed',
    payPeriod: 'January 2025',
    payDate: '2025-01-31'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'Mike Chen',
    department: 'Marketing',
    basicSalary: 68000,
    allowances: 8500,
    deductions: 6100,
    grossSalary: 76500,
    netSalary: 70400,
    status: 'approved',
    payPeriod: 'January 2025',
    payDate: '2025-01-31'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    employeeName: 'Lisa Rodriguez',
    department: 'HR',
    basicSalary: 72000,
    allowances: 9200,
    deductions: 6800,
    grossSalary: 81200,
    netSalary: 74400,
    status: 'draft',
    payPeriod: 'January 2025',
    payDate: '2025-01-31'
  }
]

const mockStats: PayrollStats = {
  totalPayroll: 2456780,
  employeeCount: 247,
  avgSalary: 82450,
  pendingApprovals: 12,
  processedPayrolls: 235,
  totalDeductions: 245680,
  totalAllowances: 346780,
  payrollTrend: 12.5
}

// Animated Metric Card Component (ReactBits inspired)
const AnimatedMetricCard = ({ 
  title, 
  value, 
  trend, 
  icon, 
  color = 'primary',
  prefix = '',
  suffix = ''
}: {
  title: string
  value: number
  trend?: number
  icon: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'error'
  prefix?: string
  suffix?: string
}) => {
  const theme = useTheme()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette[color].main} 0%, ${alpha(theme.palette[color].main, 0.7)} 100%)`
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Box 
              sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                backgroundColor: alpha(theme.palette[color].main, 0.1),
                color: theme.palette[color].main
              }}
            >
              {icon}
            </Box>
            {trend !== undefined && (
              <Chip
                icon={trend >= 0 ? <TrendingUp /> : <TrendingDown />}
                label={`${trend >= 0 ? '+' : ''}${trend}%`}
                size="small"
                color={trend >= 0 ? 'success' : 'error'}
                variant="outlined"
              />
            )}
          </Stack>
          
          <Typography variant="h4" fontWeight="bold" color={`${color}.main`} mb={1}>
            {isVisible && (
              <NumberTicker 
                value={value} 
                formatValue={(val) => `${prefix}${val.toLocaleString()}${suffix}`}
              />
            )}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Animated Status Badge Component
const AnimatedStatusBadge = ({ status }: { status: PayrollRecord['status'] }) => {
  const getStatusConfig = (status: PayrollRecord['status']) => {
    switch (status) {
      case 'paid':
        return { color: 'success' as const, icon: <CheckCircle />, label: 'Paid' }
      case 'approved':
        return { color: 'info' as const, icon: <CheckCircle />, label: 'Approved' }
      case 'processed':
        return { color: 'warning' as const, icon: <Schedule />, label: 'Processed' }
      case 'draft':
        return { color: 'default' as const, icon: <Edit />, label: 'Draft' }
      default:
        return { color: 'default' as const, icon: <ErrorIcon />, label: 'Unknown' }
    }
  }

  const config = getStatusConfig(status)

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 'medium' }}
      />
    </motion.div>
  )
}

// Main Payroll Dashboard Component
export function PayrollDashboard() {
  const { profile } = useAuth()
  const permissions = usePermissions()
  const theme = useTheme()
  
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>(mockPayrollData)
  const [stats, setStats] = useState<PayrollStats>(mockStats)
  const [selectedPeriod, setSelectedPeriod] = useState('January 2025')
  const [processDialogOpen, setProcessDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const canProcessPayroll = permissions.hasPermission('payroll.process')
  const canApprovePayroll = permissions.hasPermission('payroll.approve')
  const canViewAllPayroll = permissions.hasPermission('payroll.view_all')

  const handleProcessPayroll = async () => {
    setLoading(true)
    buttonHandlers.handleProcessPayroll()
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setProcessDialogOpen(false)
  }

  const handleExportReports = () => {
    // Generate and download payroll reports
    const exportData = payrollData.map(record => ({
      'Employee ID': record.employeeId,
      'Employee Name': record.employeeName,
      'Department': record.department,
      'Gross Pay': record.grossPay,
      'Deductions': record.deductions,
      'Net Pay': record.netPay,
      'Status': record.status,
      'Pay Date': record.payDate,
    }))

    // Create CSV content
    const headers = Object.keys(exportData[0] || {})
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value
        }).join(',')
      )
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `payroll_report_${selectedPeriod.replace(' ', '_')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Box sx={{ p: 3, background: theme.palette.background.default, minHeight: '100vh' }} className="container-fluid px-2 px-md-3 px-lg-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              💰 Payroll Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage employee compensation and payroll processing
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportReports}
            >
              Export Reports
            </Button>
            
            {canProcessPayroll && (
              <Button
                variant="contained"
                startIcon={<Calculate />}
                onClick={() => setProcessDialogOpen(true)}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  }
                }}
              >
                Process Payroll
              </Button>
            )}
          </Stack>
        </Stack>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedMetricCard
            title="Total Payroll"
            value={stats.totalPayroll}
            trend={stats.payrollTrend}
            icon={<MonetizationOn />}
            color="primary"
            prefix="$"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedMetricCard
            title="Active Employees"
            value={stats.employeeCount}
            icon={<People />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedMetricCard
            title="Average Salary"
            value={stats.avgSalary}
            trend={8.2}
            icon={<TrendingUp />}
            color="warning"
            prefix="$"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedMetricCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<NotificationsActive />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              ⚡ Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Receipt />}
                  sx={{ p: 2, justifyContent: 'flex-start' }}
                >
                  Generate Payslips
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AccountBalance />}
                  sx={{ p: 2, justifyContent: 'flex-start' }}
                >
                  Bank Integration
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Calculate />}
                  sx={{ p: 2, justifyContent: 'flex-start' }}
                >
                  Tax Calculations
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Settings />}
                  sx={{ p: 2, justifyContent: 'flex-start' }}
                >
                  Payroll Settings
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payroll Records Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                📋 Payroll Records - {selectedPeriod}
              </Typography>
              
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Pay Period</InputLabel>
                <Select
                  value={selectedPeriod}
                  label="Pay Period"
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <MenuItem value="January 2025">January 2025</MenuItem>
                  <MenuItem value="December 2024">December 2024</MenuItem>
                  <MenuItem value="November 2024">November 2024</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Box sx={{ height: 500 }}>
              {/* Header Row */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderBottom: `2px solid ${theme.palette.divider}`,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  fontWeight: 600
                }}
              >
                <Box sx={{ flex: 2, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Employee
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Department
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Basic Salary
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Gross Salary
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Net Salary
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Status
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Actions
                  </Typography>
                </Box>
              </Box>
              
              <VirtualListSimple
                items={payrollData}
                height={450}
                itemHeight={80}
                renderItem={(record, index) => (
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
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          src={record.avatar}
                          sx={{ 
                            width: 40, 
                            height: 40,
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                          }}
                        >
                          {record.employeeName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {record.employeeName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.employeeId}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Chip label={record.department} size="small" variant="outlined" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        ${record.basicSalary.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        ${record.grossSalary.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" color="primary.main">
                        ${record.netSalary.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <AnimatedStatusBadge status={record.status} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send Payslip">
                          <IconButton size="small">
                            <Send />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                )}
                emptyMessage="No payroll records found"
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Process Payroll Dialog */}
      <Dialog 
        open={processDialogOpen} 
        onClose={() => setProcessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Calculate color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Process Payroll - {selectedPeriod}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={2}>
            <Alert severity="info" icon={<AccessTime />}>
              Processing payroll will calculate salaries, deductions, and generate payslips for all active employees.
            </Alert>
            
            <TextField
              label="Processing Notes"
              multiline
              rows={3}
              fullWidth
              placeholder="Enter any special notes for this payroll cycle..."
            />
            
            {loading && (
              <Box>
                <Typography variant="body2" mb={1}>Processing payroll...</Typography>
                <LinearProgress />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleProcessPayroll}
            disabled={loading}
            startIcon={<Calculate />}
          >
            {loading ? 'Processing...' : 'Process Payroll'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
        }}
        onClick={() => setProcessDialogOpen(true)}
      >
        <Add />
      </Fab>
    </Box>
  )
}

export default PayrollDashboard
