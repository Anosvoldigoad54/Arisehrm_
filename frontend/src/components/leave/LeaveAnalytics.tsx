import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Analytics,
  Psychology,
  CalendarToday,
  Group,
  Warning,
  Lightbulb,
  Download,
  Refresh,
  Visibility,
  Schedule,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  Insights,
  FilterList,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  Legend,
  ComposedChart,
} from 'recharts'
import { motion } from 'framer-motion'
import { MetricCard } from '../common/MetricCard'
import { StatusChip } from '../common/StatusChip'
import { leaveService } from '../../services/leaveService'

interface LeavePattern {
  pattern: string
  frequency: number
  employees: string[]
  trend: 'increasing' | 'decreasing' | 'stable'
  recommendation: string
  risk: 'low' | 'medium' | 'high'
}

interface LeavePrediction {
  month: string
  predictedRequests: number
  confidence: number
  factors: string[]
  recommendations: string[]
}

interface SeasonalTrend {
  month: string
  historical: number
  predicted: number
  variance: number
}

interface EmployeeRisk {
  id: string
  name: string
  department: string
  riskScore: number
  factors: string[]
  prediction: string
  lastLeave: string
  avatar?: string
}

interface LeaveAnalyticsProps {
  employeeId: string
  userRole: 'employee' | 'manager' | 'hr' | 'admin'
  departmentId?: string
}

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export const LeaveAnalytics: React.FC<LeaveAnalyticsProps> = ({
  employeeId,
  userRole,
  departmentId,
}) => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [timeRange, setTimeRange] = useState('12m')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  
  // Analytics data
  const [patterns, setPatterns] = useState<LeavePattern[]>([])
  const [predictions, setPredictions] = useState<LeavePrediction[]>([])
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrend[]>([])
  const [employeeRisks, setEmployeeRisks] = useState<EmployeeRisk[]>([])
  const [utilizationData, setUtilizationData] = useState<any[]>([])
  const [leaveDistribution, setLeaveDistribution] = useState<any[]>([])
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<LeavePattern | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [employeeId, userRole, timeRange, selectedDepartment])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // This would be replaced with real API calls
      await generateMockAnalyticsData()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const generateMockAnalyticsData = async () => {
    // Mock patterns
    setPatterns([
      {
        pattern: 'Summer Vacation Clustering',
        frequency: 85,
        employees: ['John Doe', 'Jane Smith', 'Bob Johnson'],
        trend: 'increasing',
        recommendation: 'Implement staggered vacation schedule for summer months',
        risk: 'high',
      },
      {
        pattern: 'Friday Sick Leaves',
        frequency: 32,
        employees: ['Alice Brown', 'Charlie Davis'],
        trend: 'stable',
        recommendation: 'Monitor for potential abuse patterns',
        risk: 'medium',
      },
      {
        pattern: 'End-of-Quarter Leaves',
        frequency: 28,
        employees: ['Eve Wilson', 'Frank Miller'],
        trend: 'decreasing',
        recommendation: 'Good trend, continue current policies',
        risk: 'low',
      },
    ])

    // Mock predictions
    setPredictions([
      {
        month: 'Dec 2024',
        predictedRequests: 45,
        confidence: 89,
        factors: ['Holiday season', 'Year-end closures', 'Remaining PTO'],
        recommendations: ['Plan skeleton crew', 'Approve early requests', 'Cross-train staff'],
      },
      {
        month: 'Jan 2025',
        predictedRequests: 22,
        confidence: 76,
        factors: ['Post-holiday recovery', 'Budget planning period'],
        recommendations: ['Normal staffing', 'Focus on Q1 goals'],
      },
    ])

    // Mock seasonal trends
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    setSeasonalTrends(months.map((month, index) => ({
      month,
      historical: Math.floor(Math.random() * 40) + 20,
      predicted: Math.floor(Math.random() * 45) + 18,
      variance: Math.floor(Math.random() * 10) - 5,
    })))

    // Mock employee risks
    setEmployeeRisks([
      {
        id: '1',
        name: 'John Doe',
        department: 'Engineering',
        riskScore: 85,
        factors: ['High stress project', 'Overdue vacation', 'Team lead role'],
        prediction: 'Likely to take extended leave in next 3 months',
        lastLeave: '2024-08-15',
        avatar: undefined,
      },
      {
        id: '2',
        name: 'Jane Smith',
        department: 'Sales',
        riskScore: 72,
        factors: ['Upcoming maternity', 'Q4 targets met'],
        prediction: 'Expected maternity leave starting February',
        lastLeave: '2024-06-20',
        avatar: undefined,
      },
    ])

    // Mock utilization data
    setUtilizationData(months.map((month, index) => ({
      month,
      teamSize: 20,
      avgLeave: Math.floor(Math.random() * 5) + 2,
      utilization: Math.floor(Math.random() * 20) + 75,
      efficiency: Math.floor(Math.random() * 15) + 80,
    })))

    // Mock leave distribution
    setLeaveDistribution([
      { type: 'Annual', value: 45, color: '#4f46e5' },
      { type: 'Sick', value: 25, color: '#ef4444' },
      { type: 'Personal', value: 15, color: '#06b6d4' },
      { type: 'Emergency', value: 10, color: '#f59e0b' },
      { type: 'Other', value: 5, color: '#8b5cf6' },
    ])
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp color="error" />
      case 'decreasing': return <TrendingDown color="success" />
      case 'stable': return <Timeline color="info" />
      default: return <Timeline />
    }
  }

  const TabPanel = ({ children, value, index }: { children: React.ReactNode, value: number, index: number }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )

  const renderPatternsTab = () => (
    <Grid container spacing={3}>
      {/* Pattern Cards */}
      <Grid size={12}>
        <Grid container spacing={2}>
          {patterns.map((pattern, index) => (
            <Grid
              key={index}
              size={{
                xs: 12,
                md: 4
              }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                  }}
                  onClick={() => {
                    setSelectedPattern(pattern)
                    setDetailsDialogOpen(true)
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {pattern.pattern}
                      </Typography>
                      {getTrendIcon(pattern.trend)}
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {pattern.frequency}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Occurrence Rate
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={`${pattern.employees.length} employees`}
                        variant="outlined"
                      />
                      <StatusChip status={pattern.risk} size="sm" />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {pattern.recommendation}
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={pattern.frequency}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: pattern.risk === 'high' ? 'error.main' : 
                                          pattern.risk === 'medium' ? 'warning.main' : 'success.main',
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Pattern Analysis Chart */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Leave Pattern Trends Over Time
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seasonalTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="historical" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    name="Historical"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  const renderPredictionsTab = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid
        size={{
          xs: 12,
          md: 3
        }}>
        <MetricCard
          title="Prediction Accuracy"
          value="89%"
          trend={{ value: 5, isPositive: true }}
          icon={<Psychology />}
          color="primary"
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 3
        }}>
        <MetricCard
          title="Next Month Requests"
          value="22"
          trend={{ value: 12, isPositive: false }}
          icon={<Schedule />}
          color="warning"
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 3
        }}>
        <MetricCard
          title="Peak Period"
          value="December"
          icon={<CalendarToday />}
          color="info"
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 3
        }}>
        <MetricCard
          title="Risk Score"
          value="7.2/10"
          trend={{ value: 8, isPositive: false }}
          icon={<Warning />}
          color="error"
        />
      </Grid>

      {/* Prediction Cards */}
      <Grid size={12}>
        <Grid container spacing={2}>
          {predictions.map((prediction, index) => (
            <Grid
              key={index}
              size={{
                xs: 12,
                md: 6
              }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{prediction.month}</Typography>
                    <Chip
                      size="small"
                      label={`${prediction.confidence}% confidence`}
                      color={prediction.confidence > 80 ? 'success' : 'warning'}
                    />
                  </Box>

                  <Typography variant="h3" color="primary.main" fontWeight="bold" gutterBottom>
                    {prediction.predictedRequests}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Predicted Leave Requests
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>Key Factors:</Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {prediction.factors.map((factor, idx) => (
                      <Chip key={idx} size="small" label={factor} variant="outlined" />
                    ))}
                  </Stack>

                  <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                  <List dense>
                    {prediction.recommendations.map((rec, idx) => (
                      <ListItem key={idx} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Lightbulb fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Seasonal Forecast Chart */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              12-Month Leave Forecast
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={seasonalTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="historical"
                    fill="#4f46e5"
                    fillOpacity={0.3}
                    stroke="#4f46e5"
                    name="Historical Range"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    name="AI Prediction"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  const renderRiskAnalysisTab = () => (
    <Grid container spacing={3}>
      {/* High-Risk Employees */}
      <Grid
        size={{
          xs: 12,
          lg: 8
        }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Employee Risk Assessment
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Prediction</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeeRisks.map((employee) => (
                    <TableRow key={employee.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={employee.avatar}>
                            {employee.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{employee.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Last leave: {employee.lastLeave}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" color={
                            employee.riskScore > 80 ? 'error.main' :
                            employee.riskScore > 60 ? 'warning.main' : 'success.main'
                          }>
                            {employee.riskScore}
                          </Typography>
                          <Typography variant="caption">/100</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {employee.prediction}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Leave Distribution */}
      <Grid
        size={{
          xs: 12,
          lg: 4
        }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Leave Type Distribution
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={leaveDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ type, value }) => `${type}: ${value}%`}
                  >
                    {leaveDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Team Utilization Trends */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Team Utilization vs Leave Patterns
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="avgLeave"
                    fill="#ef4444"
                    name="Avg Employees on Leave"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="utilization"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Team Utilization %"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    name="Efficiency %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  const renderInsightsTab = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            AI-Powered Insights
          </Typography>
          <Typography variant="body2">
            These insights are generated using machine learning algorithms that analyze historical leave patterns, 
            team dynamics, and seasonal trends to provide actionable recommendations.
          </Typography>
        </Alert>
      </Grid>

      {/* Key Insights */}
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Psychology color="primary" />
              <Typography variant="h6">Behavioral Insights</Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Friday Sick Leave Pattern"
                  secondary="32% increase in sick leaves on Fridays. Consider wellness programs."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Group color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Team Collaboration Effect"
                  secondary="Teams with better collaboration show 25% more predictable leave patterns."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Schedule color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Optimal Leave Timing"
                  secondary="Employees taking leaves in Q2 show higher productivity upon return."
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Recommendations */}
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Lightbulb color="warning" />
              <Typography variant="h6">Smart Recommendations</Typography>
            </Box>
            
            <Stack spacing={2}>
              <Alert severity="warning">
                <Typography variant="subtitle2">High Risk Alert</Typography>
                <Typography variant="body2">
                  Engineering team showing signs of burnout. Consider mandatory wellness breaks.
                </Typography>
              </Alert>
              
              <Alert severity="info">
                <Typography variant="subtitle2">Optimization Opportunity</Typography>
                <Typography variant="body2">
                  Implement staggered vacation schedules for July-August to maintain 85% coverage.
                </Typography>
              </Alert>
              
              <Alert severity="success">
                <Typography variant="subtitle2">Positive Trend</Typography>
                <Typography variant="body2">
                  Sales team leave patterns align well with business cycles. Continue current policies.
                </Typography>
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Predictive Models Performance */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Predictive Model Performance
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid
                size={{
                  xs: 12,
                  md: 3
                }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">94%</Typography>
                  <Typography variant="caption">Pattern Recognition</Typography>
                </Paper>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 3
                }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">89%</Typography>
                  <Typography variant="caption">Prediction Accuracy</Typography>
                </Paper>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 3
                }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">76%</Typography>
                  <Typography variant="caption">Risk Assessment</Typography>
                </Paper>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 3
                }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">91%</Typography>
                  <Typography variant="caption">Trend Analysis</Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  return (
    <Box className="container-fluid px-2 px-md-3 px-lg-4">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Leave Analytics & Intelligence
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="3m">3 Months</MenuItem>
              <MenuItem value="6m">6 Months</MenuItem>
              <MenuItem value="12m">12 Months</MenuItem>
              <MenuItem value="24m">24 Months</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<Refresh />}
            onClick={fetchAnalyticsData}
            disabled={loading}
            variant="outlined"
          >
            Refresh
          </Button>
          <Button
            startIcon={<Download />}
            variant="contained"
          >
            Export Report
          </Button>
        </Box>
      </Box>
      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Patterns" icon={<Analytics />} />
        <Tab label="Predictions" icon={<Psychology />} />
        <Tab label="Risk Analysis" icon={<Warning />} />
        <Tab label="AI Insights" icon={<Insights />} />
      </Tabs>
      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {renderPatternsTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderPredictionsTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderRiskAnalysisTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        {renderInsightsTab()}
      </TabPanel>
      {/* Pattern Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Pattern Analysis: {selectedPattern?.pattern}
        </DialogTitle>
        <DialogContent dividers>
          {selectedPattern && (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Pattern Details
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedPattern.recommendation}
                </Typography>
              </Grid>
              
              <Grid size={6}>
                <Typography variant="subtitle2">Frequency</Typography>
                <Typography variant="h4" color="primary.main">
                  {selectedPattern.frequency}%
                </Typography>
              </Grid>
              
              <Grid size={6}>
                <Typography variant="subtitle2">Risk Level</Typography>
                <StatusChip status={selectedPattern.risk} />
              </Grid>
              
              <Grid size={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Affected Employees
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectedPattern.employees.map((employee, index) => (
                    <Chip key={index} label={employee} size="small" />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button variant="contained">Generate Action Plan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
