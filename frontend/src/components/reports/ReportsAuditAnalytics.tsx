import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, subHours } from 'date-fns';
import { toast } from 'sonner';

import { auditLogger } from '../../services/auditLoggingService';
import {
  AuditEvent,
  AuditCategory,
  AuditAction,
  AuditSeverity,
  AuditStatus,
  AuditQueryFilters,
  AuditStatistics
} from '../../types/audit';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`audit-tabpanel-${index}`}
      aria-labelledby={`audit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = {
  primary: '#1976d2',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  category: {
    AUTHENTICATION: '#ff9800',
    AUTHORIZATION: '#9c27b0',
    USER_MANAGEMENT: '#2196f3',
    EMPLOYEE_MANAGEMENT: '#4caf50',
    ATTENDANCE: '#00bcd4',
    LEAVE_MANAGEMENT: '#ffeb3b',
    PAYROLL: '#f44336',
    PERFORMANCE: '#e91e63',
    TRAINING: '#9e9e9e',
    RECRUITMENT: '#795548',
    DOCUMENTS: '#607d8b',
    REPORTS: '#3f51b5',
    SYSTEM_ADMIN: '#ff5722',
    DATA_ACCESS: '#8bc34a',
    COMPLIANCE: '#ffc107',
    SECURITY: '#ff1744'
  }
};

const SEVERITY_COLORS = {
  LOW: '#4caf50',
  MEDIUM: '#ff9800',
  HIGH: '#f44336',
  CRITICAL: '#d32f2f'
};

const AuditReportsAndAnalytics: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [filters, setFilters] = useState<AuditQueryFilters>({
    timeRange: '24h',
    page: 0,
    limit: 25,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Load audit data with mock data for now
  const loadAuditData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration
      const mockEvents: AuditEvent[] = [
        {
          id: '1',
          eventId: 'evt-001',
          timestamp: new Date(),
          eventDate: new Date().toISOString().split('T')[0],
          eventTime: new Date().toISOString().split('T')[1],
          timezone: 'UTC',
          category: AuditCategory.AUTHENTICATION,
          action: AuditAction.LOGIN,
          severity: AuditSeverity.MEDIUM,
          status: AuditStatus.SUCCESS,
          userId: 'user-1',
          username: 'admin@arisehrm.com',
          userRole: 'admin',
          targetType: 'user_session',
          description: 'User login successful',
          summary: 'Admin user logged in successfully',
          source: 'web',
          component: 'AuthContext',
          network: {
            ipAddress: '192.168.1.100',
            ipAddressType: 'IPv4',
            userAgent: 'Mozilla/5.0...'
          },
          device: {
            userAgent: 'Mozilla/5.0...',
            browser: { name: 'Chrome', version: '91.0' },
            os: { name: 'Windows', version: '10' },
            device: { type: 'desktop' },
            screen: { width: 1920, height: 1080, colorDepth: 24 }
          },
          security: {
            authMethod: 'password',
            mfaUsed: false
          },
          sessionId: 'session-123',
          createdAt: new Date(),
          version: 1
        }
      ];

      const mockStats: AuditStatistics = {
        totalEvents: 1250,
        eventsByCategory: {
          [AuditCategory.AUTHENTICATION]: 320,
          [AuditCategory.USER_MANAGEMENT]: 180,
          [AuditCategory.ATTENDANCE]: 450,
          [AuditCategory.PAYROLL]: 120,
          [AuditCategory.SECURITY]: 25,
          [AuditCategory.AUTHORIZATION]: 0,
          [AuditCategory.EMPLOYEE_MANAGEMENT]: 0,
          [AuditCategory.LEAVE_MANAGEMENT]: 0,
          [AuditCategory.PERFORMANCE]: 0,
          [AuditCategory.TRAINING]: 0,
          [AuditCategory.RECRUITMENT]: 0,
          [AuditCategory.DOCUMENTS]: 0,
          [AuditCategory.REPORTS]: 0,
          [AuditCategory.SYSTEM_ADMIN]: 0,
          [AuditCategory.DATA_ACCESS]: 0,
          [AuditCategory.COMPLIANCE]: 0
        },
        eventsByAction: {},
        eventsBySeverity: {
          [AuditSeverity.LOW]: 800,
          [AuditSeverity.MEDIUM]: 350,
          [AuditSeverity.HIGH]: 85,
          [AuditSeverity.CRITICAL]: 15
        },
        eventsByStatus: {
          [AuditStatus.SUCCESS]: 1150,
          [AuditStatus.FAILURE]: 75,
          [AuditStatus.WARNING]: 20,
          [AuditStatus.PENDING]: 5
        },
        eventsByUser: {},
        eventsByHour: {},
        eventsByDay: {},
        topUsers: [
          { userId: 'user-1', username: 'admin@arisehrm.com', eventCount: 245 },
          { userId: 'user-2', username: 'hr@arisehrm.com', eventCount: 180 },
          { userId: 'user-3', username: 'manager@arisehrm.com', eventCount: 95 }
        ],
        topComponents: [],
        securityEvents: 25,
        failedEvents: 75,
        timeRange: {
          startDate: subDays(new Date(), 1),
          endDate: new Date()
        }
      };

      setAuditEvents(mockEvents);
      setStatistics(mockStats);

    } catch (error) {
      console.error('Failed to load audit data:', error);
      toast.error('Failed to load audit data');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAuditData();
  }, [loadAuditData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleFilterChange = (key: keyof AuditQueryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 0
    }));
  };

  const exportAuditData = async () => {
    try {
      const exportData = {
        events: auditEvents,
        statistics,
        filters,
        exportTime: new Date().toISOString(),
        totalEvents: statistics?.totalEvents || 0
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-report-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Audit report exported successfully');
    } catch (error) {
      toast.error('Failed to export audit report');
    }
  };

  const getSeverityIcon = (severity: AuditSeverity) => {
    switch (severity) {
      case AuditSeverity.LOW:
        return <SuccessIcon sx={{ color: SEVERITY_COLORS.LOW, fontSize: 16 }} />;
      case AuditSeverity.MEDIUM:
        return <WarningIcon sx={{ color: SEVERITY_COLORS.MEDIUM, fontSize: 16 }} />;
      case AuditSeverity.HIGH:
      case AuditSeverity.CRITICAL:
        return <ErrorIcon sx={{ color: SEVERITY_COLORS.HIGH, fontSize: 16 }} />;
      default:
        return <SuccessIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusChip = (status: AuditStatus) => {
    const statusConfig = {
      [AuditStatus.SUCCESS]: { color: 'success' as const, label: 'Success' },
      [AuditStatus.FAILURE]: { color: 'error' as const, label: 'Failure' },
      [AuditStatus.WARNING]: { color: 'warning' as const, label: 'Warning' },
      [AuditStatus.PENDING]: { color: 'info' as const, label: 'Pending' }
    };

    const config = statusConfig[status] || { color: 'default' as const, label: status };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Audit Reports & Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAuditData}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportAuditData}
            disabled={isLoading || auditEvents.length === 0}
          >
            Export
          </Button>
        </Box>
      </Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3
              }}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={filters.timeRange || '24h'}
                  label="Time Range"
                  onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                >
                  <MenuItem value="1h">Last Hour</MenuItem>
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3
              }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.categories?.[0] || ''}
                  label="Category"
                  onChange={(e) => handleFilterChange('categories', e.target.value ? [e.target.value] : undefined)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {Object.values(AuditCategory).map(category => (
                    <MenuItem key={category} value={category}>
                      {category.replace(/_/g, ' ')}
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
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filters.severities?.[0] || ''}
                  label="Severity"
                  onChange={(e) => handleFilterChange('severities', e.target.value ? [e.target.value] : undefined)}
                >
                  <MenuItem value="">All Severities</MenuItem>
                  {Object.values(AuditSeverity).map(severity => (
                    <MenuItem key={severity} value={severity}>
                      {severity}
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
              <TextField
                fullWidth
                size="small"
                label="Search Events"
                value={filters.searchQuery || ''}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                placeholder="Search descriptions..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <EventNoteIcon sx={{ fontSize: 40, color: COLORS.primary, mb: 1 }} />
                <Typography variant="h4" component="div" color="primary" fontWeight="bold">
                  {statistics.totalEvents.toLocaleString()}
                </Typography>
                <Typography color="text.secondary">Total Events</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 40, color: COLORS.error, mb: 1 }} />
                <Typography variant="h4" component="div" color="error" fontWeight="bold">
                  {statistics.securityEvents.toLocaleString()}
                </Typography>
                <Typography color="text.secondary">Security Events</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ErrorIcon sx={{ fontSize: 40, color: COLORS.warning, mb: 1 }} />
                <Typography variant="h4" component="div" color="warning.main" fontWeight="bold">
                  {statistics.failedEvents.toLocaleString()}
                </Typography>
                <Typography color="text.secondary">Failed Events</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <SuccessIcon sx={{ fontSize: 40, color: COLORS.success, mb: 1 }} />
                <Typography variant="h4" component="div" color="success.main" fontWeight="bold">
                  {((statistics.eventsByStatus[AuditStatus.SUCCESS] / statistics.totalEvents) * 100).toFixed(1)}%
                </Typography>
                <Typography color="text.secondary">Success Rate</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="audit tabs">
          <Tab icon={<AssessmentIcon />} label="Analytics" />
          <Tab icon={<EventNoteIcon />} label="Event Log" />
          <Tab icon={<SecurityIcon />} label="Security" />
        </Tabs>
      </Box>
      {/* Analytics Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          {/* Events by Severity */}
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Events by Severity
                </Typography>
                {statistics && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(statistics.eventsBySeverity).map(([severity, count]) => ({
                      severity,
                      count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="severity" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Events by Category */}
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Events by Category
                </Typography>
                {statistics && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(statistics.eventsByCategory)
                          .filter(([, count]) => count > 0)
                          .map(([category, count]) => ({
                            name: category.replace(/_/g, ' '),
                            value: count
                          }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(statistics.eventsByCategory)
                          .filter(([, count]) => count > 0)
                          .map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS.category[entry[0] as keyof typeof COLORS.category] || COLORS.primary} />
                          ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Users */}
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Most Active Users
                </Typography>
                {statistics?.topUsers && (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell align="right">Event Count</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statistics.topUsers.map((user, index) => (
                          <TableRow key={user.userId}>
                            <TableCell>#{index + 1}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" color="primary">
                                {user.eventCount.toLocaleString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      {/* Event Log Tab */}
      <TabPanel value={currentTab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Audit Event Log
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : auditEvents.length === 0 ? (
              <Alert severity="info">No audit events found for the selected criteria.</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditEvents.map((event) => (
                      <TableRow key={event.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={event.category.replace(/_/g, ' ')}
                            sx={{
                              backgroundColor: COLORS.category[event.category] || COLORS.primary,
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>{event.action}</TableCell>
                        <TableCell>{event.username}</TableCell>
                        <TableCell>{getStatusChip(event.status)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getSeverityIcon(event.severity)}
                            {event.severity}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {event.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedEvent(event);
                                setDetailsOpen(true);
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>
      {/* Security Tab */}
      <TabPanel value={currentTab} index={2}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Security Events Monitor
          </Typography>
          This section shows high-priority security events that require attention.
        </Alert>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Security Events
            </Typography>
            <Alert severity="success">
              No critical security events found in the selected time range.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>
      {/* Event Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon />
            Audit Event Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Event ID
                </Typography>
                <Typography variant="body2" fontFamily="monospace" gutterBottom>
                  {selectedEvent.id}
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Timestamp
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {format(new Date(selectedEvent.timestamp), 'PPpp')}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedEvent.description}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  User Agent
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {selectedEvent.device.userAgent}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditReportsAndAnalytics;