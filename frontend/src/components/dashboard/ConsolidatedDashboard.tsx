'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Badge,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { log } from '../../services/loggingService'
import { getRoleColor, getDenimGradient, denimColors } from '../../styles/denimTheme'
import RouteErrorBoundary from '../common/RouteErrorBoundary'

interface DashboardStats {
  totalEmployees?: number
  presentToday?: number
  pendingLeaveRequests?: number
  activeProjects?: number
  completedTasks?: number
  pendingTasks?: number
  teamSize?: number
  monthlyAttendance?: number
  leaveBalance?: Array<{
    type: string
    available: number
    total: number
  }>
  recentActivities?: Array<{
    id: string
    type: 'leave' | 'attendance' | 'task' | 'announcement'
    message: string
    timestamp: string
    status?: string
  }>
  upcomingEvents?: Array<{
    id: string
    title: string
    date: string
    type: 'meeting' | 'deadline' | 'holiday'
  }>
  quickStats?: {
    clockedIn: boolean
    todayHours: number
    weekHours: number
    monthHours: number
  }
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactElement
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down'
  }
  loading?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  loading = false
}) => {
  const theme = useTheme()

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box ml={2} flex={1}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
          <Skeleton variant="text" width="80%" height={32} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: theme.palette[color].main,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
          <Box ml={2} flex={1}>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={0.5}>
                {trend.direction === 'up' ? (
                  <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                ) : (
                  <ArrowDownwardIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                )}
                <Typography variant="caption" color="text.secondary">
                  {trend.value}% {trend.label}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        
        <Typography variant="h4" fontWeight="bold" color={`${color}.main`} mb={1}>
          {value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

const ConsolidatedDashboard: React.FC = () => {
  const theme = useTheme()
  const { profile } = useAuth()
  const { isHR, isManager, isAdmin, getRoleName } = usePermissions()
  const [tabValue, setTabValue] = useState(0)

  // Fetch dashboard data based on role
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats', profile?.employee_id, profile?.role],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const employeeId = profile?.employee_id

        if (isHR || isAdmin) {
          // HR/Admin Dashboard Data
          const [employeesResult, attendanceResult, leavesResult, applicationsResult] = await Promise.all([
            supabase.from('user_profiles').select('id').eq('status', 'active'),
            supabase.from('attendance_records').select('id').eq('date', today).eq('status', 'present'),
            supabase.from('leave_requests').select('id').eq('status', 'pending'),
            supabase.from('job_applications').select('id').eq('status', 'applied')
          ])

          return {
            totalEmployees: employeesResult.data?.length || 0,
            presentToday: attendanceResult.data?.length || 0,
            pendingLeaveRequests: leavesResult.data?.length || 0,
            activeProjects: applicationsResult.data?.length || 0,
          }
        } else if (isManager) {
          // Manager Dashboard Data
          const teamMembersResult = await supabase
            .from('user_profiles')
            .select('employee_id')
            .eq('manager_employee_id', employeeId)

          const memberIds = teamMembersResult.data?.map(m => m.employee_id) || []

          if (memberIds.length > 0) {
            const [attendanceResult, leavesResult] = await Promise.all([
              supabase.from('attendance_records')
                .select('id')
                .in('employee_id', memberIds)
                .eq('date', today)
                .eq('status', 'present'),
              supabase.from('leave_requests')
                .select('id')
                .in('employee_id', memberIds)
                .eq('status', 'pending')
            ])

            return {
              teamSize: memberIds.length,
              presentToday: attendanceResult.data?.length || 0,
              pendingLeaveRequests: leavesResult.data?.length || 0,
            }
          }

          return { teamSize: 0, presentToday: 0, pendingLeaveRequests: 0 }
        } else {
          // Employee Dashboard Data
          const [attendanceResult, leaveBalanceResult, goalsResult] = await Promise.all([
            supabase.from('attendance_records')
              .select('*')
              .eq('employee_id', employeeId)
              .eq('date', today)
              .single(),
            supabase.from('leave_balances')
              .select('*')
              .eq('employee_id', employeeId)
              .eq('year', new Date().getFullYear()),
            supabase.from('performance_goals')
              .select('*')
              .eq('employee_id', employeeId)
              .eq('status', 'in_progress')
          ])

          return {
            quickStats: {
              clockedIn: !!attendanceResult.data?.clock_in_time,
              todayHours: attendanceResult.data?.total_hours || 0,
              weekHours: 0, // Calculate week hours
              monthHours: 0, // Calculate month hours
            },
            leaveBalance: leaveBalanceResult.data?.map(lb => ({
              type: lb.leave_type,
              available: lb.available,
              total: lb.total_allocated
            })) || [],
            activeProjects: goalsResult.data?.length || 0,
          }
        }
      } catch (error) {
        log.error('Failed to fetch dashboard stats', error as Error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  })

  // Render different dashboard layouts based on role
  const renderEmployeeDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Today's Status"
          value={stats?.quickStats?.clockedIn ? "Clocked In" : "Not Clocked In"}
          subtitle={stats?.quickStats?.clockedIn ? `${stats.quickStats.todayHours} hours today` : "Start your day"}
          icon={<ScheduleIcon />}
          color={stats?.quickStats?.clockedIn ? 'success' : 'warning'}
          loading={isLoading}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Active Goals"
          value={stats?.activeProjects || 0}
          subtitle="In progress"
          icon={<AssignmentIcon />}
          color="info"
          loading={isLoading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Leave Balance"
          value={stats?.leaveBalance?.[0]?.available || 0}
          subtitle={`of ${stats?.leaveBalance?.[0]?.total || 0} days`}
          icon={<EventIcon />}
          color="secondary"
          loading={isLoading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="This Month"
          value={`${stats?.quickStats?.monthHours || 0}h`}
          subtitle="Hours worked"
          icon={<TrendingUpIcon />}
          color="primary"
          loading={isLoading}
        />
      </Grid>

      {/* Leave Balance Details */}
      {stats?.leaveBalance && stats.leaveBalance.length > 0 && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Balance Overview
              </Typography>
              {stats.leaveBalance.map((balance, index) => (
                <Box key={index} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">{balance.type}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {balance.available}/{balance.total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(balance.available / balance.total) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Quick Actions */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={1}>
              <Button
                startIcon={<ScheduleIcon />}
                variant="outlined"
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                {stats?.quickStats?.clockedIn ? 'Clock Out' : 'Clock In'}
              </Button>
              <Button
                startIcon={<EventIcon />}
                variant="outlined"
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                Request Leave
              </Button>
              <Button
                startIcon={<PersonIcon />}
                variant="outlined"
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                View Profile
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  const renderManagerDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Team Size"
          value={stats?.teamSize || 0}
          subtitle="Direct reports"
          icon={<GroupIcon />}
          color="primary"
          loading={isLoading}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Present Today"
          value={stats?.presentToday || 0}
          subtitle={`of ${stats?.teamSize || 0} members`}
          icon={<CheckCircleIcon />}
          color="success"
          loading={isLoading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Pending Approvals"
          value={stats?.pendingLeaveRequests || 0}
          subtitle="Leave requests"
          icon={<NotificationsIcon />}
          color="warning"
          loading={isLoading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Attendance Rate"
          value={stats?.teamSize && stats?.presentToday 
            ? `${Math.round((stats.presentToday / stats.teamSize) * 100)}%`
            : '0%'
          }
          subtitle="Today"
          icon={<TrendingUpIcon />}
          color="info"
          loading={isLoading}
        />
      </Grid>
    </Grid>
  )

  const renderHRDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          subtitle="Active employees"
          icon={<PeopleIcon />}
          color="primary"
          loading={isLoading}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Present Today"
          value={stats?.presentToday || 0}
          subtitle="Attendance today"
          icon={<CheckCircleIcon />}
          color="success"
          loading={isLoading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Pending Leaves"
          value={stats?.pendingLeaveRequests || 0}
          subtitle="Need approval"
          icon={<NotificationsIcon />}
          color="warning"
          loading={isLoading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="New Applications"
          value={stats?.activeProjects || 0}
          subtitle="To review"
          icon={<BusinessIcon />}
          color="info"
          loading={isLoading}
        />
      </Grid>
    </Grid>
  )

  const renderDashboardContent = () => {
    if (isHR || isAdmin) {
      return renderHRDashboard()
    } else if (isManager) {
      return renderManagerDashboard()
    } else {
      return renderEmployeeDashboard()
    }
  }

  // Loading state
  if (isLoading && !stats) {
    return (
      <Box p={3}>
        <Box display="flex" alignItems="center" mb={3}>
          <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
          <Box>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="text" width={150} height={24} />
          </Box>
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <MetricCard
                title=""
                value=""
                icon={<DashboardIcon />}
                loading={true}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load dashboard data. Please try again.
        </Alert>
      </Box>
    )
  }

  return (
    <RouteErrorBoundary routeName="Dashboard">
      <Box p={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: getRoleColor(profile?.role || ''),
                mr: 2,
                width: 56,
                height: 56
              }}
            >
              <DashboardIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Welcome back, {profile?.first_name}!
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {getRoleName()} Dashboard
              </Typography>
            </Box>
          </Box>
          
          <IconButton onClick={() => refetch()} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Dashboard Content */}
        {renderDashboardContent()}

        {/* Recent Activity Section */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                No recent activity to display
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </RouteErrorBoundary>
  )
}

export default ConsolidatedDashboard