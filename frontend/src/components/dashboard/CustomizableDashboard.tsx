'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import SimplePerformanceMonitor from '../performance/SimplePerformanceMonitor'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Paper,
  useTheme,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton,
  Badge,
  Tooltip,
  useMediaQuery,
  Container,
  AppBar,
  Toolbar,
  Drawer,
  ListItemButton,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  CardActionArea,
  CardActions,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,

} from '@mui/material'
import {
  Dashboard,
  People,
  Schedule,
  Assignment,
  TrendingUp,
  Notifications,
  Settings,
  Add,
  PersonAdd,
  AssignmentTurnedIn,
  AttachMoney,
  BarChart,
  Analytics,
  CheckCircle,
  Warning,
  Error,
  CalendarToday,
  AccessTime,
  Business,
  Group,
  Assessment,
  EventAvailable,
  MonetizationOn,
  Star,
  Refresh,
  FilterList,
  Search,
  MoreVert,
  Edit,
  Visibility,
  Close,
  Save,
  Cancel,
  Timer,
  Work,
  Info,
  Menu,
  School,
  EmojiEvents,
  Timeline,
  LocationOn,
  Email,
  Phone,
  Home,
  Person,
  WorkOutline,
  ExpandMore,
  KeyboardArrowDown,
  KeyboardArrowUp,
  AccountTree,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useResponsive } from '../../hooks/useResponsive'
import DatabaseService from '../../services/databaseService'
import MetricCard from '../common/MetricCard'
import StatusChip from '../common/StatusChip'

// Types
interface DashboardMetrics {
  totalEmployees: number
  activeEmployees: number
  presentToday: number
  lateToday: number
  pendingLeaveRequests: number
  upcomingLeaves: number
  totalDepartments: number
  avgAttendanceRate: number
  employeeTurnoverRate: number
  avgPerformanceRating: number
  newHiresThisMonth: number
  topPerformers: number
  atRisk: number
  lastUpdated: string
  loading: boolean
}

interface ActivityItem {
  id: string
  type: 'attendance' | 'leave_request' | 'performance' | 'training' | 'announcement' | 'birthday' | 'hiring'
  title: string
  description: string
  employee?: {
    id: string
    name: string
    avatar?: string
    department: string
    position: string
  }
  timestamp: string
  status?: 'pending' | 'approved' | 'rejected' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  path?: string
  onClick?: () => void
  badge?: number
  disabled?: boolean
}

const CustomizableDashboard: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { isMobile, isTablet } = useResponsive()
  
  // Responsive breakpoints
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // State
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    pendingLeaveRequests: 0,
    upcomingLeaves: 0,
    totalDepartments: 0,
    avgAttendanceRate: 0,
    employeeTurnoverRate: 0,
    avgPerformanceRating: 0,
    newHiresThisMonth: 0,
    topPerformers: 0,
    atRisk: 0,
    lastUpdated: '',
    loading: true
  })
  
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'mobile'>(
    isMobile ? 'mobile' : 'overview'
  )
  
  // Mobile navigation state
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [bottomNavValue, setBottomNavValue] = useState(0)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  
  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'add-employee',
      label: 'Add Employee',
      icon: <PersonAdd />,
      color: 'primary',
      path: '/hr/employee-management',
      badge: 0
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <Schedule />,
      color: 'success',
      path: '/attendance',
      badge: 0
    },
    {
      id: 'leave-requests',
      label: 'Leave Requests',
      icon: <Assignment />,
      color: 'warning',
      path: '/leave/dashboard',
      badge: metrics.pendingLeaveRequests
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <Assessment />,
      color: 'info',
      path: '/hr/performance',
      badge: 0
    },
    {
      id: 'training',
      label: 'Training',
      icon: <School />,
      color: 'secondary',
      path: '/hr/training',
      badge: 0
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: <AttachMoney />,
      color: 'success',
      path: '/payroll',
      badge: 0
    }
  ]

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setMetrics(prev => ({ ...prev, loading: true }))
      
      const data = await DatabaseService.getDashboardMetrics()
      
      if (data) {
        setMetrics({
          totalEmployees: data.totalEmployees || 0,
          activeEmployees: data.activeEmployees || 0,
          presentToday: data.presentToday || 0,
          lateToday: data.lateToday || 0,
          pendingLeaveRequests: data.pendingLeaveRequests || 0,
          upcomingLeaves: data.upcomingLeaves || 0,
          totalDepartments: data.totalDepartments || 0,
          avgAttendanceRate: data.avgAttendanceRate || 0,
          employeeTurnoverRate: data.employeeTurnoverRate || 0,
          avgPerformanceRating: data.avgPerformanceRating || 0,
          newHiresThisMonth: data.newHiresThisMonth || 0,
          topPerformers: data.topPerformers || 0,
          atRisk: data.atRisk || 0,
          lastUpdated: new Date().toISOString(),
          loading: false
        })
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
      setMetrics(prev => ({ ...prev, loading: false }))
    }
  }

  // Load demo data for development
  const loadDemoData = () => {
    setMetrics({
      totalEmployees: 1247,
      activeEmployees: 1180,
      presentToday: 1156,
      lateToday: 24,
      pendingLeaveRequests: 23,
      upcomingLeaves: 45,
      totalDepartments: 12,
      avgAttendanceRate: 94.6,
      employeeTurnoverRate: 2.1,
      avgPerformanceRating: 4.2,
      newHiresThisMonth: 18,
      topPerformers: 156,
      atRisk: 8,
      lastUpdated: new Date().toISOString(),
      loading: false
    })
  }

  // Load recent activities
  const loadRecentActivities = () => {
    setActivitiesLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const activities: ActivityItem[] = [
        {
          id: '1',
          type: 'attendance',
          title: 'Late Arrival',
          description: 'John Doe arrived 15 minutes late',
          employee: {
            id: 'emp1',
            name: 'John Doe',
            department: 'Engineering',
            position: 'Senior Developer'
          },
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '2',
          type: 'leave_request',
          title: 'Vacation Request',
          description: 'Sarah Wilson requested 5 days off',
          employee: {
            id: 'emp2',
            name: 'Sarah Wilson',
            department: 'Marketing',
            position: 'Marketing Manager'
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'high'
        },
        {
          id: '3',
          type: 'performance',
          title: 'Performance Review Due',
          description: 'Quarterly review for Engineering team',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'urgent'
        },
        {
          id: '4',
          type: 'training',
          title: 'Training Completed',
          description: 'Mike Chen completed cybersecurity training',
          employee: {
            id: 'emp3',
            name: 'Mike Chen',
            department: 'IT',
            position: 'System Administrator'
          },
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '5',
          type: 'hiring',
          title: 'New Hire Onboarded',
          description: 'Welcome to the team, Lisa Park!',
          employee: {
            id: 'emp4',
            name: 'Lisa Park',
            department: 'Sales',
            position: 'Sales Representative'
          },
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ]
      
      setRecentActivities(activities)
      setActivitiesLoading(false)
    }, 1000)
  }

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
    loadRecentActivities()
  }, [])

  // Handle refresh
  const handleRefresh = async () => {
    toast.info('Refreshing dashboard...')
    await loadDashboardData()
    loadRecentActivities()
    toast.success('Dashboard refreshed!')
  }

  // Handle quick action
  const handleQuickAction = (action: QuickAction) => {
    if (action.path) {
      navigate(action.path)
    } else if (action.onClick) {
      action.onClick()
    }
  }

  // Handle activity click
  const handleActivityClick = (activity: ActivityItem) => {
    // Navigate to appropriate page based on activity type
  }

  // Handle leave approval
  const handleApproveLeave = (activityId: string) => {
    setRecentActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: 'approved' as const }
          : activity
      )
    )
    toast.success('Leave request approved!')
  }

  // Handle leave rejection
  const handleRejectLeave = (activityId: string) => {
    setRecentActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: 'rejected' as const }
          : activity
      )
    )
    toast.error('Leave request rejected!')
  }

  // Get activity icon
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'attendance':
        return <Schedule />
      case 'leave_request':
        return <Assignment />
      case 'performance':
        return <Assessment />
      case 'training':
        return <School />
      case 'announcement':
        return <Notifications />
      case 'birthday':
        return <Star />
      case 'hiring':
        return <PersonAdd />
      default:
        return <Info />
    }
  }

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'error'
      case 'completed':
        return 'success'
      default:
        return 'default'
    }
  }

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Get time of day greeting
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Mobile navigation drawer
  const MobileNavigationDrawer = () => (
    <SwipeableDrawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      onOpen={() => setMobileDrawerOpen(true)}
      PaperProps={{
        sx: {
          width: 280,
          background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            Menu
          </Typography>
          <IconButton color="inherit" onClick={() => setMobileDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Stack>
        
        <List>
          {quickActions.map((action) => (
            <ListItem key={action.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  handleQuickAction(action)
                  setMobileDrawerOpen(false)
                }}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1)
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {action.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={action.label}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                {action.badge && action.badge > 0 && (
                  <Badge badgeContent={action.badge} color="error" />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  )

  // Mobile bottom navigation
  const MobileBottomNavigation = () => (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: theme.zIndex.appBar,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={bottomNavValue}
        onChange={(event, newValue) => setBottomNavValue(newValue)}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 12px 8px',
            '&.Mui-selected': {
              color: theme.palette.primary.main
            }
          }
        }}
      >
        <BottomNavigationAction 
          label="Dashboard" 
          icon={<Dashboard />} 
          onClick={() => setSelectedView('overview')}
        />
        <BottomNavigationAction 
          label="Employees" 
          icon={<People />} 
          onClick={() => navigate('/hr/employees')}
        />
        <BottomNavigationAction 
          label="Attendance" 
          icon={<Schedule />} 
          onClick={() => navigate('/attendance')}
        />
        <BottomNavigationAction 
          label="More" 
          icon={<MoreVert />} 
          onClick={() => setMobileDrawerOpen(true)}
        />
      </BottomNavigation>
    </Paper>
  )

  // Mobile app bar
  const MobileAppBar = () => (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderRadius: { xs: 0, sm: '0 0 20px 20px' }
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="white">
            {getTimeOfDayGreeting()}, {profile?.first_name || 'User'}! 👋
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.8)">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <IconButton 
            color="inherit" 
            onClick={handleRefresh}
            sx={{ 
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.2) }
            }}
          >
            <Refresh />
          </IconButton>
          <IconButton 
            color="inherit" 
            onClick={() => setMobileDrawerOpen(true)}
            sx={{ 
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.2) }
            }}
          >
            <Menu />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  )

  // Desktop header
  const DesktopHeader = () => (
    <div>
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            {getTimeOfDayGreeting()}, {profile?.first_name || 'Admin'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your team today
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ borderRadius: 2, px: 3, py: 1.5 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PersonAdd />}
            onClick={() => navigate('/hr/employee-management')}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              py: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            }}
          >
            Add Employee
          </Button>
        </Stack>
      </Stack>
    </div>
  )

  // Quick actions grid
  const QuickActionsGrid = () => (
    <div>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Quick Actions
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          gap: { xs: 1, sm: 2, md: 3 }
        }}>
          {quickActions.map((action, index) => (
            <Box key={action.id}>
              <div style={{ height: '100%' }}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: `linear-gradient(135deg, ${theme.palette[action.color].main}15 0%, ${theme.palette[action.color].main}05 100%)`,
                    border: `1px solid ${alpha(theme.palette[action.color].main, 0.1)}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette[action.color].main, 0.25)}`,
                      borderColor: alpha(theme.palette[action.color].main, 0.4)
                    }
                  }}
                  onClick={() => handleQuickAction(action)}
                >
                  <CardContent sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Box
                      sx={{
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette[action.color].main} 0%, ${theme.palette[action.color].dark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mb: 2,
                        boxShadow: `0 4px 16px ${alpha(theme.palette[action.color].main, 0.4)}`
                      }}
                    >
                      {action.icon}
                    </Box>
                    
                    <Typography 
                      variant={isMobile ? "body2" : "body1"} 
                      fontWeight={600}
                      sx={{ mb: 1 }}
                    >
                      {action.label}
                    </Typography>
                    
                    {action.badge > 0 && (
                      <Badge 
                        badgeContent={action.badge} 
                        color="error"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  )

  // Metrics grid
  const MetricsGrid = () => (
    <div>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: { xs: 2, sm: 3 },
        mb: 4
      }}>
        <Box>
          <MetricCard
            title="Total Employees"
            value={metrics.totalEmployees}
            icon={<People />}
            color="primary"
            loading={metrics.loading}
            subtitle={`${metrics.activeEmployees} active`}
            trend="vs last month"
            change={8.2}
          />
        </Box>
        <Box>
          <MetricCard
            title="Present Today"
            value={metrics.presentToday}
            icon={<CheckCircle />}
            color="success"
            loading={metrics.loading}
            subtitle={`${metrics.avgAttendanceRate}% attendance`}
            trend="attendance rate"
            change={2.1}
          />
        </Box>
        <Box>
          <MetricCard
            title="Pending Leaves"
            value={metrics.pendingLeaveRequests}
            icon={<Schedule />}
            color="warning"
            loading={metrics.loading}
            subtitle="5 urgent approvals"
            trend="vs last week"
            change={-15.3}
          />
        </Box>
        <Box>
          <MetricCard
            title="Performance"
            value={metrics.avgPerformanceRating}
            icon={<Star />}
            color="info"
            loading={metrics.loading}
            subtitle={`${metrics.topPerformers} top performers`}
            trend="avg rating"
            change={5.2}
          />
        </Box>
      </Box>
    </div>
  )

  // Recent activities
  const RecentActivities = () => (
    <div>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            justifyContent="space-between" 
            sx={{ mb: { xs: 2, sm: 3 } }}
          >
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              fontWeight={600}
            >
              Recent Activities
            </Typography>
            <Button 
              size={isMobile ? "small" : "medium"} 
              variant="outlined"
              onClick={() => navigate('/analytics')}
              sx={{ 
                minWidth: { xs: 'auto', sm: '100px' },
                px: { xs: 1, sm: 2 }
              }}
            >
              View All
            </Button>
          </Stack>
          
          {activitiesLoading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={16} />
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Stack spacing={isMobile ? 1.5 : 2}>
              {recentActivities.slice(0, isMobile ? 3 : 5).map((activity, index) => (
                <div key={activity.id}>
                  <Card
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.1),
                        transform: 'translateX(4px)',
                        borderColor: alpha(theme.palette.primary.main, 0.3)
                      }
                    }}
                    onClick={() => handleActivityClick(activity)}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: { xs: 28, sm: 36 },
                          height: { xs: 28, sm: 36 },
                          bgcolor: `${getStatusColor(activity.status)}.main`
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Avatar>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant={isMobile ? "body2" : "body1"} 
                          fontWeight={500}
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {activity.title}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {activity.description}
                        </Typography>
                        {activity.employee && (
                          <Typography 
                            variant="caption" 
                            color="primary"
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          >
                            {activity.employee.name} • {activity.employee.department}
                          </Typography>
                        )}
                      </Box>
                      
                      <Stack alignItems="flex-end" spacing={1}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            flexShrink: 0
                          }}
                        >
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                        
                        {activity.status && (
                          <StatusChip 
                            status={activity.status} 
                            size={isMobile ? "small" : "medium"}
                          />
                        )}
                        
                        {activity.type === 'leave_request' && activity.status === 'pending' && (
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApproveLeave(activity.id)
                              }}
                              sx={{ 
                                width: 24, 
                                height: 24,
                                backgroundColor: alpha(theme.palette.success.main, 0.1)
                              }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRejectLeave(activity.id)
                              }}
                              sx={{ 
                                width: 24, 
                                height: 24,
                                backgroundColor: alpha(theme.palette.error.main, 0.1)
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                </div>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Main dashboard content
  const DashboardContent = () => (
    <Container maxWidth="xl" sx={{ pb: isMobile ? 8 : 4 }}>
      {/* Header */}
      {isMobile ? <MobileAppBar /> : <DesktopHeader />}
      
      {/* Quick Actions */}
      <QuickActionsGrid />
      
      {/* Metrics */}
      <MetricsGrid />
      
      {/* Performance Dashboard Section */}
      <div>
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Card 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                fontWeight={600} 
                sx={{ 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: theme.palette.primary.main
                }}
              >
                <Analytics fontSize="small" />
                System Performance Monitor
              </Typography>
                              <Box sx={{ height: 'auto' }}>
                  <SimplePerformanceMonitor />
                </Box>
            </CardContent>
          </Card>
        </Box>
      </div>
      
      {/* Charts and Activities */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: { xs: 2, sm: 3 }
      }}>
        <Box>
          <Stack spacing={{ xs: 2, sm: 3 }}>
            {/* Charts would go here */}
            <Card sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Attendance Trends
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  Chart component would be rendered here
                </Typography>
              </Box>
            </Card>
          </Stack>
        </Box>
        
        <Box>
          <RecentActivities />
        </Box>
      </Box>
    </Container>
  )

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
    }}>
      {/* Main Dashboard */}
      <DashboardContent />
      
      {/* Mobile Navigation */}
      {isMobile && (
        <>
          <MobileNavigationDrawer />
          <MobileBottomNavigation />
          
          {/* Floating Action Button */}
          <Fab
            color="primary"
            aria-label="Quick Actions"
            onClick={() => setMobileDrawerOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 24,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.6)}`
              }
            }}
          >
            <Add />
          </Fab>
        </>
      )}
    </Box>
  )
}

export default CustomizableDashboard
