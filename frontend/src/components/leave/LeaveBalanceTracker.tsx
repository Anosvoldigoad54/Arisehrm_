import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Button,
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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Schedule,
  CalendarToday,
  Warning,
  Info,
  History,
  Refresh,
  Download,
  Visibility,
  Timeline,
  AccountBalance,
  Add,
  Remove,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { StatusChip } from '../common/StatusChip'
import { MetricCard } from '../common/MetricCard'
import { leaveService } from '../../services/leaveService'
import { Tables } from '../../types/supabase'

interface LeaveBalance {
  leaveType: string
  available: number
  used: number
  pending: number
  total: number
  accrualRate: number
  lastAccrual: string
  nextAccrual: string
  projectedEndOfYear: number
  carryOverLimit: number
  expiryDate?: string
}

interface AccrualHistory {
  id: string
  date: string
  type: 'accrual' | 'usage' | 'adjustment' | 'carry_over'
  leaveType: string
  amount: number
  balance: number
  description: string
  source: string
}

interface LeaveProjection {
  month: string
  annual: number
  sick: number
  personal: number
  total: number
}

interface LeaveBalanceTrackerProps {
  employeeId: string
  onRequestLeave?: () => void
}

const leaveTypeColors = {
  annual: '#4f46e5',
  sick: '#ef4444',
  personal: '#06b6d4',
  emergency: '#f59e0b',
  maternity: '#ec4899',
  paternity: '#8b5cf6',
  study: '#10b981',
  compensatory: '#6b7280',
}

const leaveTypeIcons = {
  annual: '🏖️',
  sick: '🏥',
  personal: '👤',
  emergency: '🚨',
  maternity: '👶',
  paternity: '👨‍👶',
  study: '📚',
  compensatory: '⚖️',
}

export const LeaveBalanceTracker: React.FC<LeaveBalanceTrackerProps> = ({
  employeeId,
  onRequestLeave,
}) => {
  const [loading, setLoading] = useState(false)
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [accrualHistory, setAccrualHistory] = useState<AccrualHistory[]>([])
  const [projections, setProjections] = useState<LeaveProjection[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [activeTab, setActiveTab] = useState(0)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null)

  useEffect(() => {
    fetchBalanceData()
  }, [employeeId, selectedYear])

  const fetchBalanceData = async () => {
    setLoading(true)
    try {
      const [balanceData, historyData, projectionData] = await Promise.all([
        leaveService.getLeaveBalances(employeeId, selectedYear),
        leaveService.getAccrualHistory(employeeId, selectedYear),
        leaveService.getLeaveProjections(employeeId, selectedYear),
      ])
      
      setBalances(balanceData)
      setAccrualHistory(historyData)
      setProjections(projectionData)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercentage = (balance: LeaveBalance) => {
    return balance.total > 0 ? (balance.used / balance.total) * 100 : 0
  }

  const getBalanceStatus = (balance: LeaveBalance) => {
    const usagePercentage = getUsagePercentage(balance)
    if (usagePercentage >= 90) return 'critical'
    if (usagePercentage >= 70) return 'warning'
    return 'healthy'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'error'
      case 'warning': return 'warning'
      case 'healthy': return 'success'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateNextAccrual = (balance: LeaveBalance) => {
    const nextAccrualDate = new Date(balance.nextAccrual)
    const today = new Date()
    const diffTime = nextAccrualDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const renderBalanceCards = () => (
    <Grid container spacing={3}>
      {balances.map((balance, index) => (
        <Grid
          key={balance.leaveType}
          size={{
            xs: 12,
            md: 6,
            lg: 4
          }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              sx={{
                position: 'relative',
                overflow: 'visible',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
              onClick={() => {
                setSelectedBalance(balance)
                setDetailsDialogOpen(true)
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h4">
                      {leaveTypeIcons[balance.leaveType as keyof typeof leaveTypeIcons]}
                    </Typography>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {balance.leaveType.charAt(0).toUpperCase() + balance.leaveType.slice(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {balance.available} / {balance.total} days
                      </Typography>
                    </Box>
                  </Box>
                  <StatusChip 
                    status={getBalanceStatus(balance)} 
                    size="sm"
                  />
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Usage</Typography>
                    <Typography variant="body2">
                      {getUsagePercentage(balance).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getUsagePercentage(balance)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: leaveTypeColors[balance.leaveType as keyof typeof leaveTypeColors],
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                {/* Balance Details */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="success.main" fontWeight="bold">
                        {balance.available}
                      </Typography>
                      <Typography variant="caption">Available</Typography>
                    </Box>
                  </Grid>
                  <Grid size={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="error.main" fontWeight="bold">
                        {balance.used}
                      </Typography>
                      <Typography variant="caption">Used</Typography>
                    </Box>
                  </Grid>
                  <Grid size={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="warning.main" fontWeight="bold">
                        {balance.pending}
                      </Typography>
                      <Typography variant="caption">Pending</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Next Accrual */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule fontSize="small" />
                    <Typography variant="caption">Next Accrual</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight="bold">
                    {calculateNextAccrual(balance)} days
                  </Typography>
                </Box>

                {/* Projected End of Year */}
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Projected EOY: {balance.projectedEndOfYear} days
                  </Typography>
                  {balance.expiryDate && (
                    <Chip
                      size="small"
                      label={`Expires ${formatDate(balance.expiryDate)}`}
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  )

  const renderProjectionsChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Leave Balance Projections
        </Typography>
        <Box sx={{ height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Line type="monotone" dataKey="annual" stroke="#4f46e5" strokeWidth={2} name="Annual" />
              <Line type="monotone" dataKey="sick" stroke="#ef4444" strokeWidth={2} name="Sick" />
              <Line type="monotone" dataKey="personal" stroke="#06b6d4" strokeWidth={2} name="Personal" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )

  const renderAccrualHistory = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Accrual History</Typography>
          <Button
            startIcon={<Download />}
            variant="outlined"
            size="small"
          >
            Export
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accrualHistory.slice(0, 10).map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={record.type.replace('_', ' ')}
                      color={
                        record.type === 'accrual' ? 'success' :
                        record.type === 'usage' ? 'error' : 'default'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {leaveTypeIcons[record.leaveType as keyof typeof leaveTypeIcons]}
                      {record.leaveType}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      color={record.amount > 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {record.amount > 0 ? '+' : ''}{record.amount}
                    </Typography>
                  </TableCell>
                  <TableCell>{record.balance}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {record.description}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const renderBalanceDetails = () => {
    if (!selectedBalance) return null

    return (
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4">
              {leaveTypeIcons[selectedBalance.leaveType as keyof typeof leaveTypeIcons]}
            </Typography>
            <Box>
              <Typography variant="h6">
                {selectedBalance.leaveType.charAt(0).toUpperCase() + selectedBalance.leaveType.slice(1)} Leave Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Balance as of {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Balance Summary */}
            <Grid size={12}>
              <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid size={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold">
                          {selectedBalance.total}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Total Allocated
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold">
                          {selectedBalance.available}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Available
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold">
                          {selectedBalance.used}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Used
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold">
                          {selectedBalance.pending}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Pending
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Accrual Information */}
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Accrual Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp />
                      </ListItemIcon>
                      <ListItemText
                        primary="Accrual Rate"
                        secondary={`${selectedBalance.accrualRate} days/month`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule />
                      </ListItemIcon>
                      <ListItemText
                        primary="Last Accrual"
                        secondary={formatDate(selectedBalance.lastAccrual)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary="Next Accrual"
                        secondary={`${formatDate(selectedBalance.nextAccrual)} (${calculateNextAccrual(selectedBalance)} days)`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Policies & Limits */}
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Policies & Limits
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AccountBalance />
                      </ListItemIcon>
                      <ListItemText
                        primary="Carry Over Limit"
                        secondary={`${selectedBalance.carryOverLimit} days`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Timeline />
                      </ListItemIcon>
                      <ListItemText
                        primary="Projected EOY Balance"
                        secondary={`${selectedBalance.projectedEndOfYear} days`}
                      />
                    </ListItem>
                    {selectedBalance.expiryDate && (
                      <ListItem>
                        <ListItemIcon>
                          <Warning />
                        </ListItemIcon>
                        <ListItemText
                          primary="Expiry Date"
                          secondary={formatDate(selectedBalance.expiryDate)}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Usage Recommendations */}
            <Grid size={12}>
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  Usage Recommendations
                </Typography>
                <Typography variant="body2">
                  {selectedBalance.available > 10 
                    ? `You have ${selectedBalance.available} days available. Consider planning your vacation time to maintain work-life balance.`
                    : selectedBalance.available > 5
                    ? `You have ${selectedBalance.available} days remaining. Plan your leave requests carefully for the rest of the year.`
                    : `Low balance alert: Only ${selectedBalance.available} days left. Consider how you want to use your remaining leave.`
                  }
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
          {onRequestLeave && (
            <Button
              variant="contained"
              onClick={() => {
                setDetailsDialogOpen(false)
                onRequestLeave()
              }}
            >
              Request Leave
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  const TabPanel = ({ children, value, index }: { children: React.ReactNode, value: number, index: number }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )

  return (
    <Box className="container-fluid px-2 px-md-3 px-lg-4">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Leave Balance Tracker
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value as number)}
              label="Year"
            >
              {[2023, 2024, 2025].map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            startIcon={<Refresh />}
            onClick={fetchBalanceData}
            disabled={loading}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Current Balances" />
        <Tab label="Projections" />
        <Tab label="History" />
      </Tabs>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {renderBalanceCards()}
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        {renderProjectionsChart()}
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        {renderAccrualHistory()}
      </TabPanel>

      {/* Balance Details Dialog */}
      {renderBalanceDetails()}
    </Box>
  )
}
