import React from 'react'
import { Box, Grid, Card, CardContent, Typography, Avatar, Chip, LinearProgress } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material'

// Dashboard widgets based on role
const EmployeeDashboard: React.FC = () => {
  const { profile } = useAuth()

  const { data: todayAttendance } = useQuery({
    queryKey: ['attendance-today', profile?.employee_id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', profile?.employee_id)
        .eq('date', today)
        .single()
      return data
    }
  })

  const { data: leaveBalance } = useQuery({
    queryKey: ['leave-balance', profile?.employee_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', profile?.employee_id)
        .eq('year', new Date().getFullYear())
      return data
    }
  })

  const { data: goals } = useQuery({
    queryKey: ['my-goals', profile?.employee_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('performance_goals')
        .select('*')
        .eq('employee_id', profile?.employee_id)
        .eq('status', 'in_progress')
      return data
    }
  })

  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <ScheduleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Today's Attendance</Typography>
            </Box>
            {todayAttendance ? (
              <Box>
                <Typography variant="body2">
                  Clock In: {todayAttendance.clock_in_time ? new Date(todayAttendance.clock_in_time).toLocaleTimeString() : 'Not clocked in'}
                </Typography>
                <Typography variant="body2">
                  Clock Out: {todayAttendance.clock_out_time ? new Date(todayAttendance.clock_out_time).toLocaleTimeString() : 'Not clocked out'}
                </Typography>
                <Chip
                  label={todayAttendance.status}
                  color={todayAttendance.status === 'present' ? 'success' : 'warning'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No attendance record for today
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <NotificationsIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">Leave Balance</Typography>
            </Box>
            {leaveBalance?.length ? (
              <Box>
                {leaveBalance.slice(0, 2).map((balance: any) => (
                  <Box key={balance.id} mb={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{balance.leave_type}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {balance.available}/{balance.total_allocated}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(balance.used / balance.total_allocated) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No leave balance data
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <AssignmentIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">Active Goals</Typography>
            </Box>
            {goals?.length ? (
              <Box>
                {goals.slice(0, 3).map((goal: any) => (
                  <Box key={goal.id} mb={2}>
                    <Typography variant="body2" fontWeight="medium">
                      {goal.title}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <LinearProgress
                        variant="determinate"
                        value={goal.completion_percentage}
                        sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">
                        {goal.completion_percentage}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active goals
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

const ManagerDashboard: React.FC = () => {
  const { profile } = useAuth()

  const { data: teamStats } = useQuery({
    queryKey: ['team-stats', profile?.employee_id],
    queryFn: async () => {
      // Get team members
      const { data: teamMembers } = await supabase
        .from('user_profiles')
        .select('employee_id')
        .eq('manager_employee_id', profile?.employee_id)

      if (!teamMembers?.length) return null

      const memberIds = teamMembers.map(m => m.employee_id)
      const today = new Date().toISOString().split('T')[0]

      // Get today's attendance
      const { data: attendance } = await supabase
        .from('attendance_records')
        .select('*')
        .in('employee_id', memberIds)
        .eq('date', today)

      // Get pending leave requests
      const { data: pendingLeaves } = await supabase
        .from('leave_requests')
        .select('*')
        .in('employee_id', memberIds)
        .eq('status', 'pending')

      return {
        totalTeamMembers: memberIds.length,
        presentToday: attendance?.filter(a => a.status === 'present').length || 0,
        pendingLeaveRequests: pendingLeaves?.length || 0
      }
    }
  })

  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          xs: 12,
          md: 4
        }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Team Overview</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {teamStats?.totalTeamMembers || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Team Members
            </Typography>
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
            <Box display="flex" alignItems="center" mb={2}>
              <ScheduleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Present Today</Typography>
            </Box>
            <Typography variant="h4" color="success.main">
              {teamStats?.presentToday || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team members present
            </Typography>
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
            <Box display="flex" alignItems="center" mb={2}>
              <NotificationsIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Pending Approvals</Typography>
            </Box>
            <Typography variant="h4" color="warning.main">
              {teamStats?.pendingLeaveRequests || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Leave requests to review
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

const HRDashboard: React.FC = () => {
  const { data: hrStats } = useQuery({
    queryKey: ['hr-stats'],
    queryFn: async () => {
      // Get total employees
      const { data: employees } = await supabase
        .from('user_profiles')
        .select('employee_id')
        .eq('is_active', true)

      // Get open job postings
      const { data: openJobs } = await supabase
        .from('job_postings')
        .select('id')
        .eq('status', 'active')

      // Get pending applications
      const { data: pendingApplications } = await supabase
        .from('job_applications')
        .select('id')
        .eq('status', 'applied')

      return {
        totalEmployees: employees?.length || 0,
        openPositions: openJobs?.length || 0,
        pendingApplications: pendingApplications?.length || 0
      }
    }
  })

  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          xs: 12,
          md: 4
        }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Employees</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {hrStats?.totalEmployees || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active employees
            </Typography>
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
            <Box display="flex" alignItems="center" mb={2}>
              <AssignmentIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">Open Positions</Typography>
            </Box>
            <Typography variant="h4" color="info.main">
              {hrStats?.openPositions || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active job postings
            </Typography>
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
            <Box display="flex" alignItems="center" mb={2}>
              <NotificationsIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">New Applications</Typography>
            </Box>
            <Typography variant="h4" color="warning.main">
              {hrStats?.pendingApplications || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending review
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

const RoleBasedDashboard: React.FC = () => {
  const { profile } = useAuth()
  const { isHR, isManager, getRoleName } = usePermissions()

  const renderDashboard = () => {
    if (isHR) {
      return <HRDashboard />
    } else if (isManager) {
      return <ManagerDashboard />
    } else {
      return <EmployeeDashboard />
    }
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
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

      {renderDashboard()}
    </Box>
  )
}

export default RoleBasedDashboard
