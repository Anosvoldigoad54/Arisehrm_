import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Paper,
  Grid
} from '@mui/material'
import {
  SmartToy,
  Lightbulb,
  TrendingUp,
  Schedule,
  Person,
  Warning,
  CheckCircle,
  Close,
  CalendarToday,
  Analytics,
  Insights
} from '@mui/icons-material'
import { format, addDays, subDays, differenceInDays } from 'date-fns'

interface LeaveRecord {
  id: string
  employee_id: string
  employee_name: string
  leave_type: 'vacation' | 'sick' | 'personal' | 'emergency'
  start_date: string
  end_date: string
  days_taken: number
  status: 'approved' | 'pending' | 'rejected'
  department: string
}

interface LeaveRecommendation {
  id: string
  employee_id: string
  employee_name: string
  type: 'optimal_timing' | 'burnout_prevention' | 'team_coordination' | 'balance_improvement'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  recommended_dates: string[]
  confidence: number
  reasoning: string[]
  potential_impact: string
  action_required: boolean
}

const AILeaveRecommendations: React.FC = () => {
  const [selectedRecommendation, setSelectedRecommendation] = useState<LeaveRecommendation | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Mock leave data
  const leaveData: LeaveRecord[] = useMemo(() => {
    const employees = [
      { id: '1', name: 'John Doe', department: 'Engineering' },
      { id: '2', name: 'Jane Smith', department: 'Marketing' },
      { id: '3', name: 'Mike Johnson', department: 'Sales' },
      { id: '4', name: 'Sarah Wilson', department: 'HR' },
      { id: '5', name: 'David Brown', department: 'Finance' }
    ]

    const leaves: LeaveRecord[] = []
    employees.forEach(emp => {
      // Generate historical leave data
      for (let i = 0; i < 5; i++) {
        const startDate = subDays(new Date(), Math.random() * 365)
        const duration = Math.floor(Math.random() * 10) + 1
        leaves.push({
          id: `${emp.id}-${i}`,
          employee_id: emp.id,
          employee_name: emp.name,
          leave_type: ['vacation', 'sick', 'personal', 'emergency'][Math.floor(Math.random() * 4)] as any,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(addDays(startDate, duration), 'yyyy-MM-dd'),
          days_taken: duration,
          status: 'approved',
          department: emp.department
        })
      }
    })
    return leaves
  }, [])

  // AI-powered leave recommendations
  const recommendations: LeaveRecommendation[] = useMemo(() => {
    const recs: LeaveRecommendation[] = []
    
    // Analyze patterns for each employee
    const employeeLeaveData = leaveData.reduce((acc, leave) => {
      if (!acc[leave.employee_id]) {
        acc[leave.employee_id] = []
      }
      acc[leave.employee_id].push(leave)
      return acc
    }, {} as Record<string, LeaveRecord[]>)

    Object.entries(employeeLeaveData).forEach(([employeeId, leaves]) => {
      const employee = leaves[0]
      const totalDaysTaken = leaves.reduce((sum, leave) => sum + leave.days_taken, 0)
      const avgLeaveLength = totalDaysTaken / leaves.length
      
      // Burnout prevention recommendation
      const lastLeave = leaves.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0]
      const daysSinceLastLeave = differenceInDays(new Date(), new Date(lastLeave.end_date))
      
      if (daysSinceLastLeave > 90) {
        recs.push({
          id: `burnout-${employeeId}`,
          employee_id: employeeId,
          employee_name: employee.employee_name,
          type: 'burnout_prevention',
          priority: daysSinceLastLeave > 180 ? 'high' : 'medium',
          title: 'Burnout Prevention Leave',
          description: `Employee hasn't taken leave in ${daysSinceLastLeave} days. Recommend scheduling time off.`,
          recommended_dates: [
            format(addDays(new Date(), 14), 'yyyy-MM-dd'),
            format(addDays(new Date(), 21), 'yyyy-MM-dd')
          ],
          confidence: 85,
          reasoning: [
            `${daysSinceLastLeave} days since last leave`,
            'Extended work periods can lead to decreased productivity',
            'Proactive leave scheduling improves employee wellbeing'
          ],
          potential_impact: 'Improved productivity and employee satisfaction',
          action_required: daysSinceLastLeave > 180
        })
      }

      // Optimal timing recommendation
      if (avgLeaveLength < 3) {
        recs.push({
          id: `timing-${employeeId}`,
          employee_id: employeeId,
          employee_name: employee.employee_name,
          type: 'optimal_timing',
          priority: 'medium',
          title: 'Optimal Leave Duration',
          description: `Employee typically takes short leaves (${avgLeaveLength.toFixed(1)} days avg). Longer breaks may be more beneficial.`,
          recommended_dates: [
            format(addDays(new Date(), 30), 'yyyy-MM-dd'),
            format(addDays(new Date(), 60), 'yyyy-MM-dd')
          ],
          confidence: 72,
          reasoning: [
            'Short leave periods may not provide adequate rest',
            'Longer breaks (5-7 days) show better recovery rates',
            'Current average leave length is below optimal'
          ],
          potential_impact: 'Better rest and recovery, improved long-term performance',
          action_required: false
        })
      }

      // Team coordination recommendation
      const departmentLeaves = leaveData.filter(l => l.department === employee.department)
      const upcomingLeaves = departmentLeaves.filter(l => 
        new Date(l.start_date) > new Date() && 
        differenceInDays(new Date(l.start_date), new Date()) < 60
      )

      if (upcomingLeaves.length > 2) {
        recs.push({
          id: `coordination-${employeeId}`,
          employee_id: employeeId,
          employee_name: employee.employee_name,
          type: 'team_coordination',
          priority: 'high',
          title: 'Team Leave Coordination',
          description: `Multiple team members have upcoming leaves. Coordinate timing to maintain coverage.`,
          recommended_dates: [
            format(addDays(new Date(), 90), 'yyyy-MM-dd'),
            format(addDays(new Date(), 120), 'yyyy-MM-dd')
          ],
          confidence: 90,
          reasoning: [
            `${upcomingLeaves.length} team members have upcoming leaves`,
            'Staggered leave scheduling maintains team productivity',
            'Avoid operational disruptions'
          ],
          potential_impact: 'Maintained team productivity and service continuity',
          action_required: true
        })
      }
    })

    return recs.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [leaveData])

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, any> = {
      urgent: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    }
    return colors[priority] || 'default'
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      optimal_timing: <Schedule color="primary" />,
      burnout_prevention: <Warning color="warning" />,
      team_coordination: <Analytics color="info" />,
      balance_improvement: <TrendingUp color="success" />
    }
    return icons[type] || <Lightbulb />
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      optimal_timing: 'Optimal Timing',
      burnout_prevention: 'Burnout Prevention',
      team_coordination: 'Team Coordination',
      balance_improvement: 'Work-Life Balance'
    }
    return labels[type] || type
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SmartToy color="primary" />
        Smart Leave Recommendations
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="error">
              {recommendations.filter(r => r.priority === 'urgent' || r.priority === 'high').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Priority Actions
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              {recommendations.filter(r => r.type === 'burnout_prevention').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Burnout Risks
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="info.main">
              {recommendations.filter(r => r.type === 'team_coordination').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team Coordination
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="success.main">
              {Math.round((1 - recommendations.filter(r => r.action_required).length / recommendations.length) * 100) || 100}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Leave Health Score
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Recommendations List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI-Generated Recommendations ({recommendations.length})
          </Typography>
          
          {recommendations.length === 0 ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                All employees have optimal leave patterns. No immediate recommendations needed.
              </Typography>
            </Alert>
          ) : (
            <List>
              {recommendations.map((rec, index) => (
                <React.Fragment key={rec.id}>
                  <ListItem
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      {getTypeIcon(rec.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {rec.employee_name}
                          </Typography>
                          <Chip
                            label={getTypeLabel(rec.type)}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={rec.priority.toUpperCase()}
                            color={getPriorityColor(rec.priority)}
                            size="small"
                          />
                          {rec.action_required && (
                            <Chip
                              label="ACTION REQUIRED"
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {rec.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={rec.confidence}
                              sx={{ width: 80, height: 4, borderRadius: 2 }}
                            />
                            <Typography variant="caption">
                              {rec.confidence}% confidence
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedRecommendation(rec)
                        setDialogOpen(true)
                      }}
                    >
                      View Details
                    </Button>
                  </ListItem>
                  {index < recommendations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Recommendation Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRecommendation && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Leave Recommendation: {selectedRecommendation.employee_name}
                </Typography>
                <IconButton onClick={() => setDialogOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Alert 
                  severity={getPriorityColor(selectedRecommendation.priority) as any} 
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {selectedRecommendation.title}
                  </Typography>
                  <Typography variant="body2">
                    {selectedRecommendation.description}
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${selectedRecommendation.confidence}% Confidence`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={getTypeLabel(selectedRecommendation.type)}
                    variant="outlined"
                  />
                  <Chip
                    label={selectedRecommendation.priority.toUpperCase()}
                    color={getPriorityColor(selectedRecommendation.priority)}
                  />
                </Box>

                <Typography variant="h6" gutterBottom>
                  Recommended Dates
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  {selectedRecommendation.recommended_dates.map((date, index) => (
                    <Chip
                      key={index}
                      icon={<CalendarToday />}
                      label={format(new Date(date), 'MMM dd, yyyy')}
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>
                  AI Reasoning
                </Typography>
                <List dense>
                  {selectedRecommendation.reasoning.map((reason, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={reason} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Potential Impact
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2">
                    {selectedRecommendation.potential_impact}
                  </Typography>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button variant="outlined" color="primary">
                Schedule Leave
              </Button>
              <Button variant="contained" color="primary">
                Create Action Plan
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default AILeaveRecommendations
