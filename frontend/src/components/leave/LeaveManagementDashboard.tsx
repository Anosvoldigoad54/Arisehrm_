import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  LinearProgress,
  Divider,
  Stack,
  Paper,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Collapse,
} from '@mui/material'
import {
  Add,
  FilterList,
  MoreVert,
  CheckCircle,
  Cancel,
  Schedule,
  CalendarToday,
  TrendingUp,
  Warning,
  Group,
  Assignment,
  Notifications,
  Download,
  Refresh,
  ExpandMore,
  ExpandLess,
  Edit,
  Delete,
  Visibility,
  History,
  Send,
  Comment,
  Approve,
  Reject,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { motion, AnimatePresence } from 'framer-motion'
import StatusChip from '../common/StatusChip'
import MetricCard from '../common/MetricCard'
import { LeaveRequestForm } from './LeaveRequestForm'
import { leaveService } from '../../lib/supabaseHelpers'
import { Tables } from '../../types/supabase'

interface LeaveStats {
  totalRequests: number
  pendingApprovals: number
  approvedRequests: number
  rejectedRequests: number
  teamUtilization: number
  averageLeaveLength: number
  upcomingLeaves: number
  criticalCoverage: number
}

interface ApprovalAction {
  type: 'approve' | 'reject' | 'request_info'
  requestId: string
  comments: string
  conditions?: string[]
}

const mockLeaveStats: LeaveStats = {
  totalRequests: 0,
  pendingApprovals: 0,
  approvedRequests: 0,
  rejectedRequests: 0,
  teamUtilization: 0,
  averageLeaveLength: 0,
  upcomingLeaves: 0,
  criticalCoverage: 0
}

interface LeaveManagementDashboardProps {
  employeeId: string
  userRole: 'employee' | 'manager' | 'hr' | 'admin'
}

export const LeaveManagementDashboard: React.FC<LeaveManagementDashboardProps> = ({
  employeeId,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState<Tables['leave_requests']['Row'][]>([])
  const [filteredRequests, setFilteredRequests] = useState<Tables['leave_requests']['Row'][]>([])
  const [leaveStats, setLeaveStats] = useState<LeaveStats | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<Tables['leave_requests']['Row'] | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<ApprovalAction>({
    type: 'approve',
    requestId: '',
    comments: '',
  })
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    leaveType: 'all',
    dateRange: { start: null as Date | null, end: null as Date | null },
    employee: 'all',
  })

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    fetchData()
  }, [employeeId, userRole])

  useEffect(() => {
    applyFilters()
  }, [leaveRequests, filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Execute the Supabase queries properly
      const [requestsQuery, statsResponse] = await Promise.all([
        leaveService.getLeaveRequests({ employeeId, userRole }),
        leaveService.getLeaveStats({ employeeId, userRole }),
      ])

      // Handle requests response - need to execute the query if it's a query object
      let requests = []
      if (requestsQuery && typeof requestsQuery.then === 'function') {
        // It's a promise/query object, execute it
        const { data, error } = await requestsQuery
        if (error) {
        } else {
          requests = data || []
        }
      } else if (requestsQuery?.data) {
        // It's already a response object
        requests = requestsQuery.data
      } else if (Array.isArray(requestsQuery)) {
        // It's directly an array
        requests = requestsQuery
      }

      setLeaveRequests(Array.isArray(requests) ? requests : [])

      // Handle stats response - this should return data directly
      const stats = statsResponse || mockLeaveStats
      setLeaveStats(stats)
    } catch (error) {
      // Set safe defaults on error
      setLeaveRequests([])
      setLeaveStats(mockLeaveStats)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    const safeLeaveRequests = Array.isArray(leaveRequests) ? leaveRequests : []
    let filtered = [...safeLeaveRequests]

    if (filters.status !== 'all') {
      filtered = filtered.filter(req => req.status === filters.status)
    }

    if (filters.leaveType !== 'all') {
      filtered = filtered.filter(req => req.leave_type === filters.leaveType)
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(req => {
        const startDate = new Date(req.start_date)
        return startDate >= filters.dateRange.start! && startDate <= filters.dateRange.end!
      })
    }

    if (filters.employee !== 'all' && userRole !== 'employee') {
      filtered = filtered.filter(req => req.employee_id === filters.employee)
    }

    setFilteredRequests(filtered)
  }

  const handleApprovalAction = async (action: ApprovalAction) => {
    try {
      await leaveService.processLeaveApproval(action)
      setApprovalDialogOpen(false)
      setApprovalAction({ type: 'approve', requestId: '', comments: '' })
      fetchData() // Refresh data
    } catch (error) {
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'pending': return 'warning'
      case 'cancelled': return 'default'
      default: return 'default'
    }
  }

  const getLeaveTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      annual: '🏖️',
      sick: '🏥',
      personal: '👤',
      emergency: '🚨',
      maternity: '👶',
      paternity: '👨‍👶',
      study: '📚',
      compensatory: '⚖️',
    }
    return icons[type] || '📅'
  }

  const canApproveReject = () => {
    return userRole === 'manager' || userRole === 'hr' || userRole === 'admin'
  }

  const TabPanel = ({ children, value, index }: { children: React.ReactNode, value: number, index: number }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Metrics Cards */}
      <Grid item xs={12} md={3}>
        <MetricCard
          title="Total Requests"
          value={leaveStats?.totalRequests || 0}
          trend={{ value: 12, isPositive: true }}
          icon={<Assignment />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <MetricCard
          title="Pending Approvals"
          value={leaveStats?.pendingApprovals || 0}
          trend={{ value: 5, isPositive: false }}
          icon={<Schedule />}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <MetricCard
          title="Team Utilization"
          value={`${leaveStats?.teamUtilization || 0}%`}
          trend={{ value: 8, isPositive: true }}
          icon={<Group />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <MetricCard
          title="Avg Leave Days"
          value={leaveStats?.averageLeaveLength || 0}
          trend={{ value: 2, isPositive: false }}
          icon={<TrendingUp />}
          color="info"
        />
      </Grid>

      {/* Recent Requests */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Requests</Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchData}
                disabled={loading}
                size="small"
              >
                Refresh
              </Button>
            </Box>
            
            <List>
              {filteredRequests.slice(0, 5).map((request) => (
                <ListItem key={request.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getLeaveTypeIcon(request.leave_type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)} Leave
                        </Typography>
                        <StatusChip status={request.status} size="sm" />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.days_requested} day(s) • {request.reason?.substring(0, 50)}...
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => setSelectedRequest(request)}
                      size="small"
                    >
                      <Visibility />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Upcoming Leaves */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upcoming Leaves
            </Typography>
            
            <Stack spacing={2}>
              {(() => {
                const upcomingLeaves = (Array.isArray(leaveRequests) ? leaveRequests : [])
                  .filter(req => req.status === 'approved' && new Date(req.start_date) > new Date())
                  .slice(0, 4)

                if (upcomingLeaves.length === 0) {
                  return (
                    <Paper sx={{ p: 3, bgcolor: 'background.default', textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No upcoming approved leaves
                      </Typography>
                    </Paper>
                  )
                }

                return upcomingLeaves.map((request) => (
                  <Paper key={request.id} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2">
                          {getLeaveTypeIcon(request.leave_type || '')} {request.leave_type || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(request.start_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={`${request.days_requested} days`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Paper>
                ))
              })()}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  const renderRequestsTab = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={filters.leaveType}
                  onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
                  label="Leave Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="annual">Annual</MenuItem>
                  <MenuItem value="sick">Sick</MenuItem>
                  <MenuItem value="personal">Personal</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="From Date"
                value={filters.dateRange.start}
                onChange={(date) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: date } })}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="To Date"
                value={filters.dateRange.end}
                onChange={(date) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: date } })}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilters({
                  status: 'all',
                  leaveType: 'all',
                  dateRange: { start: null, end: null },
                  employee: 'all',
                })}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {request.employee?.first_name?.[0] || 'E'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {request.employee?.first_name} {request.employee?.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {request.employee?.department}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{getLeaveTypeIcon(request.leave_type)}</span>
                          <Typography variant="body2">
                            {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(request.start_date).toLocaleDateString()} -
                        </Typography>
                        <Typography variant="body2">
                          {new Date(request.end_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${request.days_requested} day${request.days_requested > 1 ? 's' : ''}`}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={request.status} size="sm" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {canApproveReject() && request.status === 'pending' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    setApprovalAction({
                                      type: 'approve',
                                      requestId: request.id,
                                      comments: '',
                                    })
                                    setApprovalDialogOpen(true)
                                  }}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setApprovalAction({
                                      type: 'reject',
                                      requestId: request.id,
                                      comments: '',
                                    })
                                    setApprovalDialogOpen(true)
                                  }}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredRequests.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
          />
        </CardContent>
      </Card>
    </Box>
  )

  const renderAnalyticsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info">
          Advanced analytics and reporting features coming soon!
        </Alert>
      </Grid>
    </Grid>
  )

  return (
    <Box sx={{ p: 3 }} className="container-fluid px-2 px-md-3 px-lg-4">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Leave Management
        </Typography>
        {(userRole === 'employee' || userRole === 'manager') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowRequestForm(true)}
            size="large"
          >
            Request Leave
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Overview" />
        <Tab 
          label={
            <Badge badgeContent={leaveStats?.pendingApprovals || 0} color="warning">
              Requests
            </Badge>
          }
        />
        <Tab label="Analytics" />
      </Tabs>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {renderOverviewTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderRequestsTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderAnalyticsTab()}
      </TabPanel>

      {/* Leave Request Form */}
      <LeaveRequestForm
        open={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSubmit={async (request) => {
          await leaveService.createLeaveRequest(request)
          fetchData()
        }}
        employeeId={employeeId}
      />

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalAction.type === 'approve' ? 'Approve' : 'Reject'} Leave Request
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments"
            value={approvalAction.comments}
            onChange={(e) => setApprovalAction({ ...approvalAction, comments: e.target.value })}
            placeholder="Add your comments for this decision..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={approvalAction.type === 'approve' ? 'success' : 'error'}
            onClick={() => handleApprovalAction(approvalAction)}
          >
            {approvalAction.type === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {loading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  )
}
