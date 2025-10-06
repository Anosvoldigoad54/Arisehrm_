'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,

} from '@mui/material'
import {
  Analytics as AnalyticsIcon,
  TrendingUp,
  TrendingDown,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  Download,
  Share,
  FilterList,
  DateRange,
  People,
  Business,
  AttachMoney,
  Schedule,
  Star,
  Warning,
  CheckCircle,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  Print,
  Close,
  Visibility,
} from '@mui/icons-material'
import { useResponsive } from '../../hooks/useResponsive'
import * as buttonHandlers from '../../utils/buttonHandlers'
import VirtualListSimple from '../common/VirtualListSimple'

interface MetricCard {
  id: string
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  color: string
  description?: string
}

interface ChartData {
  name: string
  value: number
  color?: string
}

interface ReportFilter {
  dateRange: {
    start: string
    end: string
  }
  departments: string[]
  metrics: string[]
  reportType: string
}

export function Analytics() {
  const theme = useTheme()
  const responsive = useResponsive()
  const [activeTab, setActiveTab] = useState(0)
  const [viewPeriod, setViewPeriod] = useState('month')
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [selectedMetrics, setSelectedMetrics] = useState(['all'])
  const [loading, setLoading] = useState(false)

  const metricCards: MetricCard[] = [
    {
      id: 'total-employees',
      title: 'Total Employees',
      value: 324,
      change: 5.2,
      changeType: 'increase',
      icon: <People />,
      color: theme.palette.primary.main,
      description: 'Active employees in organization'
    },
    {
      id: 'retention-rate',
      title: 'Retention Rate',
      value: '94.8%',
      change: 2.1,
      changeType: 'increase',
      icon: <TrendingUp />,
      color: theme.palette.success.main,
      description: 'Employee retention over 12 months'
    },
    {
      id: 'avg-tenure',
      title: 'Average Tenure',
      value: '3.2 years',
      change: -0.3,
      changeType: 'decrease',
      icon: <Schedule />,
      color: theme.palette.info.main,
      description: 'Average employee tenure'
    },
    {
      id: 'satisfaction',
      title: 'Satisfaction Score',
      value: '4.6/5',
      change: 0.4,
      changeType: 'increase',
      icon: <Star />,
      color: theme.palette.warning.main,
      description: 'Employee satisfaction rating'
    },
    {
      id: 'absenteeism',
      title: 'Absenteeism Rate',
      value: '2.1%',
      change: -0.8,
      changeType: 'decrease',
      icon: <Warning />,
      color: theme.palette.error.main,
      description: 'Monthly absenteeism rate'
    },
    {
      id: 'productivity',
      title: 'Productivity Index',
      value: '87%',
      change: 3.2,
      changeType: 'increase',
      icon: <Assessment />,
      color: theme.palette.secondary.main,
      description: 'Overall productivity score'
    }
  ]

  const departmentData: ChartData[] = [
    { name: 'Engineering', value: 45, color: '#3b82f6' },
    { name: 'Sales', value: 28, color: '#10b981' },
    { name: 'Marketing', value: 18, color: '#f59e0b' },
    { name: 'HR', value: 12, color: '#ef4444' },
    { name: 'Finance', value: 15, color: '#8b5cf6' },
    { name: 'Operations', value: 22, color: '#06b6d4' },
  ]

  const performanceData: ChartData[] = [
    { name: 'Exceeds Expectations', value: 25, color: '#10b981' },
    { name: 'Meets Expectations', value: 60, color: '#3b82f6' },
    { name: 'Below Expectations', value: 12, color: '#f59e0b' },
    { name: 'Needs Improvement', value: 3, color: '#ef4444' },
  ]

  const trendData = [
    { month: 'Jan', employees: 285, retention: 92.1, satisfaction: 4.2 },
    { month: 'Feb', employees: 292, retention: 93.5, satisfaction: 4.3 },
    { month: 'Mar', employees: 301, retention: 94.2, satisfaction: 4.4 },
    { month: 'Apr', employees: 308, retention: 94.8, satisfaction: 4.5 },
    { month: 'May', employees: 315, retention: 95.1, satisfaction: 4.6 },
    { month: 'Jun', employees: 324, retention: 94.8, satisfaction: 4.6 },
  ]

  const MetricCardComponent = ({ metric }: { metric: MetricCard }) => (
    <Box>
      <Card sx={{ height: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: `${metric.color}15`,
                  color: metric.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {metric.icon}
              </Box>
              <Chip
                label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                size="small"
                color={metric.changeType === 'increase' ? 'success' : metric.changeType === 'decrease' ? 'error' : 'default'}
                icon={metric.changeType === 'increase' ? <ArrowUpward /> : metric.changeType === 'decrease' ? <ArrowDownward /> : undefined}
              />
            </Stack>
            
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {metric.value}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {metric.title}
              </Typography>
              {metric.description && (
                <Typography variant="body2" color="text.secondary">
                  {metric.description}
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )

  const DepartmentChart = () => (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: responsive.getPadding(2, 3) }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: responsive.getSpacing(2, 3) }}>
          <Typography variant={responsive.getVariant('subtitle1', 'h6')}>Employees by Department</Typography>
          <IconButton size={responsive.isMobile ? "small" : "medium"}>
            <PieChart />
          </IconButton>
        </Stack>
        
        <Stack spacing={2}>
          {departmentData.map((dept) => (
            <Box key={dept.name}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2">{dept.name}</Typography>
                <Typography variant="body2" fontWeight={600}>{dept.value}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={dept.value}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: dept.color,
                    borderRadius: 4,
                  }
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )

  const PerformanceChart = () => (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: responsive.getPadding(2, 3) }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: responsive.getSpacing(2, 3) }}>
          <Typography variant={responsive.getVariant('subtitle1', 'h6')}>Performance Distribution</Typography>
          <IconButton size={responsive.isMobile ? "small" : "medium"}>
            <BarChart />
          </IconButton>
        </Stack>
        
        <Stack spacing={2}>
          {performanceData.map((perf) => (
            <Box key={perf.name}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2">{perf.name}</Typography>
                <Typography variant="body2" fontWeight={600}>{perf.value}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={perf.value}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: perf.color,
                    borderRadius: 4,
                  }
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )

  const TrendChart = () => (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: responsive.getPadding(2, 3) }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: responsive.getSpacing(2, 3) }}>
          <Typography variant={responsive.getVariant('subtitle1', 'h6')}>6-Month Trends</Typography>
          <IconButton size={responsive.isMobile ? "small" : "medium"}>
            <Timeline />
          </IconButton>
        </Stack>
        
        <Box sx={{ height: 300 }}>
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
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Month
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Employees
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Retention
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Satisfaction
              </Typography>
            </Box>
          </Box>
          
          <VirtualListSimple
            items={trendData}
            height={300}
            itemHeight={50}
            renderItem={(row) => (
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
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {row.month}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
                  <Typography variant="body2">
                    {row.employees}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
                  <Typography variant="body2">
                    {row.retention}%
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
                  <Typography variant="body2">
                    {row.satisfaction}/5
                  </Typography>
                </Box>
              </Box>
            )}
            emptyMessage="No trend data available"
          />
        </Box>
      </CardContent>
    </Card>
  )

  const QuickInsights = () => {
    const insights = [
      {
        title: 'High Performer Alert',
        description: '15 employees achieved exceptional ratings this quarter',
        type: 'success',
        icon: <CheckCircle />,
        action: 'View Details'
      },
      {
        title: 'Retention Risk',
        description: '8 employees showing signs of disengagement',
        type: 'warning',
        icon: <Warning />,
        action: 'Take Action'
      },
      {
        title: 'Training Opportunity',
        description: 'Skills gap identified in Engineering team',
        type: 'info',
        icon: <TrendingUp />,
        action: 'View Report'
      }
    ]

    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Insights
          </Typography>
          
          <Stack spacing={2}>
            {insights.map((insight, index) => (
              <Box key={index}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        color: insight.type === 'success' ? theme.palette.success.main :
                               insight.type === 'warning' ? theme.palette.warning.main :
                               theme.palette.info.main
                      }}
                    >
                      {insight.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined">
                      {insight.action}
                    </Button>
                  </Stack>
                </Paper>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ p: responsive.getPadding(2, 3) }} className="container-fluid px-2 px-md-3 px-lg-4">
      <Stack spacing={responsive.getSpacing(2, 3)} sx={{ mb: responsive.getSpacing(3, 4) }}>
        <Stack
          direction={responsive.getFlexDirection('column', 'row')}
          justifyContent="space-between"
          alignItems={responsive.isMobile ? "stretch" : "center"}
          spacing={responsive.getSpacing(2, 0)}
        >
          <Box>
            <Typography
              variant={responsive.getVariant('h5', 'h4')}
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Analytics Dashboard
            </Typography>
            <Typography
              variant={responsive.getVariant('body2', 'body1')}
              color="text.secondary"
            >
              Comprehensive insights into your organization's performance
            </Typography>
          </Box>

          <Stack
            direction={responsive.getFlexDirection('column', 'row')}
            spacing={responsive.getSpacing(1, 1)}
            sx={{ width: responsive.isMobile ? '100%' : 'auto' }}
          >
            <ToggleButtonGroup
              value={viewPeriod}
              exclusive
              onChange={(_, value) => value && setViewPeriod(value)}
              size={responsive.getButtonSize()}
              orientation={responsive.isMobile ? "vertical" : "horizontal"}
              sx={{ width: responsive.isMobile ? '100%' : 'auto' }}
            >
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
              <ToggleButton value="quarter">Quarter</ToggleButton>
              <ToggleButton value="year">Year</ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilterDialog(true)}
              size={responsive.getButtonSize()}
              fullWidth={responsive.isMobile}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={buttonHandlers.handleRefresh}
              size={responsive.getButtonSize()}
              fullWidth={responsive.isMobile}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Box sx={{ mb: responsive.getSpacing(3, 4) }}>
        <Typography
          variant={responsive.getVariant('subtitle1', 'h6')}
          sx={{ mb: responsive.getSpacing(2, 3), fontWeight: 600 }}
        >
          Key Metrics
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              xl: 'repeat(6, 1fr)'
            },
            gap: responsive.getSpacing(1.5, 2.5, 4)
          }}
        >
          {metricCards.map((metric) => (
            <Box key={metric.id}>
              <MetricCardComponent metric={metric} />
            </Box>
          ))}
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        variant={responsive.isMobile ? "scrollable" : "standard"}
        scrollButtons={responsive.isMobile ? "auto" : false}
        allowScrollButtonsMobile={responsive.isMobile}
        sx={{
          mb: responsive.getSpacing(2, 3),
          '& .MuiTab-root': {
            minWidth: responsive.isMobile ? 100 : 120,
            fontSize: responsive.isMobile ? '0.875rem' : '1rem'
          }
        }}
      >
        <Tab label="Overview" />
        <Tab label="Performance" />
        <Tab label="Reports" />
        <Tab label="Insights" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  lg: 'repeat(2, 1fr)'
                },
                gap: responsive.getSpacing(2, 3, 4)
              }}
            >
              <Box>
                <DepartmentChart />
              </Box>
              <Box>
                <PerformanceChart />
              </Box>
              <Box sx={{ gridColumn: { xs: '1', lg: '1 / -1' } }}>
                <TrendChart />
              </Box>
            </Box>
        </Box>
      )}
      
      {activeTab === 1 && (
        <Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  xl: '2fr 1fr'
                },
                gap: responsive.getSpacing(2, 3, 4)
              }}
            >
              <Box>
                <PerformanceChart />
              </Box>
              <Box>
                <QuickInsights />
              </Box>
            </Box>
        </Box>
      )}
      
      {activeTab === 2 && (
        <Box>
          {/* Reports content uses VirtualListSimple above */}
        </Box>
      )}
      
      {activeTab === 3 && (
        <Box>
          <QuickInsights />
        </Box>
      )}
    </Box>
  )
}

export default Analytics




