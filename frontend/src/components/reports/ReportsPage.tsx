import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DatePicker,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  LinearProgress,
  Avatar,
  Divider
} from '@mui/material'
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  People,
  Schedule,
  Assignment,
  BarChart,
  PieChart,
  Download,
  Print,
  Share,
  FilterList,
  DateRange,
  Business,
  Assessment,
  Timeline,
  Insights,
  MoreVert
} from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { toast } from 'sonner'

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
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

interface ReportData {
  id: string
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

interface EmployeeData {
  id: string
  name: string
  department: string
  attendanceRate: number
  performanceScore: number
  status: 'active' | 'inactive' | 'on_leave'
}

export default function ReportsPage() {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [dateRange, setDateRange] = useState({
    start: dayjs().subtract(30, 'day'),
    end: dayjs()
  })
  const [department, setDepartment] = useState('all')
  const [reportType, setReportType] = useState('summary')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)

  // Sample data
  const [summaryData, setSummaryData] = useState<ReportData[]>([
    { id: '1', name: 'Total Employees', value: 247, change: 5.2, trend: 'up' },
    { id: '2', name: 'Active Today', value: 198, change: -2.1, trend: 'down' },
    { id: '3', name: 'Attendance Rate', value: 94.5, change: 1.8, trend: 'up' },
    { id: '4', name: 'Performance Score', value: 87.3, change: 3.2, trend: 'up' }
  ])

  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([
    { id: '1', name: 'John Smith', department: 'Engineering', attendanceRate: 96.5, performanceScore: 92, status: 'active' },
    { id: '2', name: 'Sarah Johnson', department: 'Marketing', attendanceRate: 88.2, performanceScore: 85, status: 'active' },
    { id: '3', name: 'Mike Wilson', department: 'Sales', attendanceRate: 92.1, performanceScore: 89, status: 'on_leave' },
    { id: '4', name: 'Emily Davis', department: 'HR', attendanceRate: 98.7, performanceScore: 94, status: 'active' },
    { id: '5', name: 'David Brown', department: 'Engineering', attendanceRate: 85.3, performanceScore: 78, status: 'active' }
  ])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    setLoading(true)
    setTimeout(() => {
      toast.success(`Report exported as ${format.toUpperCase()}`)
      setLoading(false)
    }, 1500)
    setAnchorEl(null)
  }

  const handlePrint = () => {
    window.print()
    setAnchorEl(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'error'
      case 'on_leave': return 'warning'
      default: return 'default'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />
      case 'down': return <TrendingDown color="error" />
      default: return <TrendingUp color="disabled" />
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Reports & Analytics
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Comprehensive insights into your workforce data
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                Export
              </Button>
              <Button variant="contained" startIcon={<Analytics />}>
                Generate Report
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                <MenuItem value="engineering">Engineering</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
              >
                <MenuItem value="summary">Summary</MenuItem>
                <MenuItem value="detailed">Detailed</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
                <MenuItem value="attendance">Attendance</MenuItem>
              </Select>
            </FormControl>
            <MUIDatePicker
              label="Start Date"
              value={dateRange.start}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, start: newValue || dayjs() }))}
              slotProps={{ textField: { size: 'small' } }}
            />
            <MUIDatePicker
              label="End Date"
              value={dateRange.end}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, end: newValue || dayjs() }))}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Stack>
        </Paper>

        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          >
            <Tab icon={<Assessment />} label="Overview" />
            <Tab icon={<People />} label="Employee Reports" />
            <Tab icon={<Schedule />} label="Attendance" />
            <Tab icon={<BarChart />} label="Performance" />
            <Tab icon={<Business />} label="Department Analysis" />
            <Tab icon={<Timeline />} label="Trends" />
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {summaryData.map((item) => (
                <Grid
                  key={item.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3
                  }}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {typeof item.value === 'number' && item.name.includes('Rate') 
                              ? `${item.value}%` 
                              : item.value.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.name}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                            {getTrendIcon(item.trend)}
                            <Typography 
                              variant="body2" 
                              color={item.trend === 'up' ? 'success.main' : 'error.main'}
                            >
                              {item.change > 0 ? '+' : ''}{item.change}%
                            </Typography>
                          </Stack>
                        </Box>
                        <IconButton size="small">
                          <Insights />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid
                size={{
                  xs: 12,
                  md: 8
                }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Attendance Trends
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">
                        Chart visualization would be rendered here
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Department Distribution
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">
                        Pie chart would be rendered here
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Employee Reports Tab */}
          <TabPanel value={activeTab} index={1}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Employee Performance Report
                  </Typography>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <MoreVert />
                  </IconButton>
                </Stack>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell align="center">Attendance Rate</TableCell>
                        <TableCell align="center">Performance Score</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employeeData.map((employee) => (
                        <TableRow key={employee.id} hover>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {employee.name}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell align="center">
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {employee.attendanceRate}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={employee.attendanceRate}
                                sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={500}>
                              {employee.performanceScore}/100
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={employee.status.replace('_', ' ')}
                              color={getStatusColor(employee.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Other tabs with placeholder content */}
          <TabPanel value={activeTab} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attendance Analytics
                </Typography>
                <Typography color="text.secondary">
                  Detailed attendance reports and analytics would be displayed here.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Analytics
                </Typography>
                <Typography color="text.secondary">
                  Performance metrics and analysis would be displayed here.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Analysis
                </Typography>
                <Typography color="text.secondary">
                  Department-wise analytics and comparisons would be displayed here.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trend Analysis
                </Typography>
                <Typography color="text.secondary">
                  Historical trends and predictive analytics would be displayed here.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
        </Paper>

        {/* Export Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => handleExport('pdf')}>
            <ListItemIcon><Download /></ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('excel')}>
            <ListItemIcon><Download /></ListItemIcon>
            <ListItemText>Export as Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('csv')}>
            <ListItemIcon><Download /></ListItemIcon>
            <ListItemText>Export as CSV</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handlePrint}>
            <ListItemIcon><Print /></ListItemIcon>
            <ListItemText>Print Report</ListItemText>
          </MenuItem>
        </Menu>

        {loading && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
            <LinearProgress />
          </Box>
        )}
      </Container>
    </LocalizationProvider>
  );
}
