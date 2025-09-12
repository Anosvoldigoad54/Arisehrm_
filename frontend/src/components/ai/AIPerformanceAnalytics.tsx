import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Rating,
  Tabs,
  Tab
} from '@mui/material'
import {
  SmartToy,
  TrendingUp,
  TrendingDown,
  Assessment,
  Person,
  Star,
  Warning,
  CheckCircle,
  Close,
  Analytics,
  Insights,
  Psychology,
  EmojiEvents,
  Timeline
} from '@mui/icons-material'
import { format, subMonths, differenceInDays } from 'date-fns'

interface PerformanceRecord {
  id: string
  employee_id: string
  employee_name: string
  department: string
  period: string
  overall_score: number
  goals_completed: number
  goals_total: number
  productivity_score: number
  collaboration_score: number
  innovation_score: number
  attendance_score: number
  feedback_score: number
  manager_rating: number
  peer_rating: number
  self_rating: number
}

interface AIInsight {
  id: string
  employee_id: string
  employee_name: string
  type: 'improvement_opportunity' | 'strength_recognition' | 'career_development' | 'risk_alert'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  confidence: number
  recommendations: string[]
  predicted_outcome: string
  timeline: string
}

const AIPerformanceAnalytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Mock performance data
  const performanceData: PerformanceRecord[] = useMemo(() => {
    const employees = [
      { id: '1', name: 'John Doe', department: 'Engineering' },
      { id: '2', name: 'Jane Smith', department: 'Marketing' },
      { id: '3', name: 'Mike Johnson', department: 'Sales' },
      { id: '4', name: 'Sarah Wilson', department: 'HR' },
      { id: '5', name: 'David Brown', department: 'Finance' }
    ]

    return employees.map(emp => ({
      id: emp.id,
      employee_id: emp.id,
      employee_name: emp.name,
      department: emp.department,
      period: format(new Date(), 'yyyy-MM'),
      overall_score: Math.floor(Math.random() * 30) + 70,
      goals_completed: Math.floor(Math.random() * 8) + 2,
      goals_total: 10,
      productivity_score: Math.floor(Math.random() * 25) + 75,
      collaboration_score: Math.floor(Math.random() * 30) + 70,
      innovation_score: Math.floor(Math.random() * 35) + 65,
      attendance_score: Math.floor(Math.random() * 20) + 80,
      feedback_score: Math.floor(Math.random() * 25) + 75,
      manager_rating: Math.floor(Math.random() * 2) + 3.5,
      peer_rating: Math.floor(Math.random() * 2) + 3.5,
      self_rating: Math.floor(Math.random() * 2) + 3.5
    }))
  }, [])

  // AI-generated insights
  const aiInsights: AIInsight[] = useMemo(() => {
    const insights: AIInsight[] = []

    performanceData.forEach(perf => {
      // Identify improvement opportunities
      if (perf.overall_score < 75) {
        insights.push({
          id: `improvement-${perf.employee_id}`,
          employee_id: perf.employee_id,
          employee_name: perf.employee_name,
          type: 'improvement_opportunity',
          priority: perf.overall_score < 65 ? 'high' : 'medium',
          title: 'Performance Improvement Opportunity',
          description: `Overall performance score of ${perf.overall_score}% indicates potential for improvement`,
          confidence: 87,
          recommendations: [
            'Schedule one-on-one coaching sessions',
            'Provide additional training resources',
            'Set clearer performance expectations',
            'Increase feedback frequency'
          ],
          predicted_outcome: '15-20% improvement in performance metrics within 3 months',
          timeline: '3-6 months'
        })
      }

      // Recognize high performers
      if (perf.overall_score > 90) {
        insights.push({
          id: `strength-${perf.employee_id}`,
          employee_id: perf.employee_id,
          employee_name: perf.employee_name,
          type: 'strength_recognition',
          priority: 'medium',
          title: 'High Performer Recognition',
          description: `Exceptional performance with ${perf.overall_score}% overall score`,
          confidence: 95,
          recommendations: [
            'Consider for leadership development program',
            'Assign mentoring responsibilities',
            'Explore promotion opportunities',
            'Increase project ownership'
          ],
          predicted_outcome: 'Enhanced engagement and leadership potential',
          timeline: '1-3 months'
        })
      }

      // Career development opportunities
      if (perf.innovation_score > 85 && perf.collaboration_score > 80) {
        insights.push({
          id: `career-${perf.employee_id}`,
          employee_id: perf.employee_id,
          employee_name: perf.employee_name,
          type: 'career_development',
          priority: 'medium',
          title: 'Career Development Opportunity',
          description: 'Strong innovation and collaboration scores indicate leadership potential',
          confidence: 82,
          recommendations: [
            'Enroll in leadership development program',
            'Assign cross-functional project leadership',
            'Provide advanced skill training',
            'Create succession planning pathway'
          ],
          predicted_outcome: 'Ready for senior role within 12-18 months',
          timeline: '6-12 months'
        })
      }

      // Risk alerts
      if (perf.attendance_score < 80 || perf.collaboration_score < 70) {
        insights.push({
          id: `risk-${perf.employee_id}`,
          employee_id: perf.employee_id,
          employee_name: perf.employee_name,
          type: 'risk_alert',
          priority: 'high',
          title: 'Performance Risk Alert',
          description: 'Declining attendance or collaboration scores may indicate engagement issues',
          confidence: 78,
          recommendations: [
            'Conduct engagement survey',
            'Schedule immediate check-in meeting',
            'Review workload and stress levels',
            'Explore flexible work arrangements'
          ],
          predicted_outcome: 'Risk of turnover if not addressed within 30 days',
          timeline: 'Immediate'
        })
      }
    })

    return insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [performanceData])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success'
    if (score >= 75) return 'info'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, any> = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    }
    return colors[priority] || 'default'
  }

  const getInsightIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      improvement_opportunity: <TrendingUp color="warning" />,
      strength_recognition: <EmojiEvents color="success" />,
      career_development: <Timeline color="info" />,
      risk_alert: <Warning color="error" />
    }
    return icons[type] || <Insights />
  }

  const getInsightTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      improvement_opportunity: 'Improvement Opportunity',
      strength_recognition: 'Strength Recognition',
      career_development: 'Career Development',
      risk_alert: 'Risk Alert'
    }
    return labels[type] || type
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SmartToy color="primary" />
        AI Performance Analytics
        <Chip label="Advanced Insights" color="secondary" size="small" icon={<Psychology />} />
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="success.main">
              {performanceData.filter(p => p.overall_score >= 90).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Performers
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              {aiInsights.filter(i => i.type === 'improvement_opportunity').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Improvement Opportunities
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="error.main">
              {aiInsights.filter(i => i.type === 'risk_alert').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Risk Alerts
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="info.main">
              {Math.round(performanceData.reduce((sum, p) => sum + p.overall_score, 0) / performanceData.length)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Performance
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Performance Overview" />
        <Tab label="AI Insights" />
        <Tab label="Detailed Analytics" />
      </Tabs>

      {/* Performance Overview Tab */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Employee Performance Overview
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Overall Score</TableCell>
                    <TableCell>Goals Progress</TableCell>
                    <TableCell>Productivity</TableCell>
                    <TableCell>Collaboration</TableCell>
                    <TableCell>Innovation</TableCell>
                    <TableCell>Manager Rating</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceData.map((perf) => (
                    <TableRow key={perf.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {perf.employee_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {perf.department}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={perf.overall_score}
                            color={getScoreColor(perf.overall_score) as any}
                            sx={{ width: 80, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {perf.overall_score}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {perf.goals_completed}/{perf.goals_total}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(perf.goals_completed / perf.goals_total) * 100}
                          sx={{ width: 60, height: 4, borderRadius: 2, mt: 0.5 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${perf.productivity_score}%`}
                          color={getScoreColor(perf.productivity_score) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${perf.collaboration_score}%`}
                          color={getScoreColor(perf.collaboration_score) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${perf.innovation_score}%`}
                          color={getScoreColor(perf.innovation_score) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Rating value={perf.manager_rating} readOnly size="small" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View AI Insights">
                          <IconButton size="small">
                            <Analytics />
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
      )}

      {/* AI Insights Tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI-Generated Performance Insights ({aiInsights.length})
            </Typography>
            
            {aiInsights.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  No significant performance insights detected. All employees are performing within expected ranges.
                </Typography>
              </Alert>
            ) : (
              <List>
                {aiInsights.map((insight, index) => (
                  <React.Fragment key={insight.id}>
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
                        {getInsightIcon(insight.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {insight.employee_name}
                            </Typography>
                            <Chip
                              label={getInsightTypeLabel(insight.type)}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={insight.priority.toUpperCase()}
                              color={getPriorityColor(insight.priority)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {insight.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={insight.confidence}
                                sx={{ width: 80, height: 4, borderRadius: 2 }}
                              />
                              <Typography variant="caption">
                                {insight.confidence}% confidence
                              </Typography>
                              <Chip
                                label={insight.timeline}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedInsight(insight)
                          setDialogOpen(true)
                        }}
                      >
                        View Details
                      </Button>
                    </ListItem>
                    {index < aiInsights.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Tab */}
      {tabValue === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info">
            <Typography variant="body2">
              Detailed analytics including trend analysis, predictive modeling, and comparative benchmarks will be available in the full AI analytics suite.
            </Typography>
          </Alert>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Trends & Predictions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Advanced analytics dashboard coming soon with:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><TrendingUp /></ListItemIcon>
                  <ListItemText primary="Performance trend analysis over time" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assessment /></ListItemIcon>
                  <ListItemText primary="Predictive performance modeling" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Analytics /></ListItemIcon>
                  <ListItemText primary="Department and role benchmarking" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Psychology /></ListItemIcon>
                  <ListItemText primary="AI-powered career path recommendations" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Insight Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedInsight && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  AI Insight: {selectedInsight.employee_name}
                </Typography>
                <IconButton onClick={() => setDialogOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Alert severity={getPriorityColor(selectedInsight.priority) as any} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {selectedInsight.title}
                  </Typography>
                  <Typography variant="body2">
                    {selectedInsight.description}
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${selectedInsight.confidence}% Confidence`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={selectedInsight.timeline}
                    variant="outlined"
                  />
                  <Chip
                    label={selectedInsight.priority.toUpperCase()}
                    color={getPriorityColor(selectedInsight.priority)}
                  />
                </Box>

                <Typography variant="h6" gutterBottom>
                  AI Recommendations
                </Typography>
                <List dense>
                  {selectedInsight.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Predicted Outcome
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2">
                    {selectedInsight.predicted_outcome}
                  </Typography>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button variant="outlined" color="primary">
                Create Development Plan
              </Button>
              <Button variant="contained" color="primary">
                Implement Recommendations
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default AIPerformanceAnalytics
