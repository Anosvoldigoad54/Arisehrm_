import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { toast } from 'sonner'
import { format, parseISO, addMonths } from 'date-fns'

interface PerformanceGoal {
  id: string
  employee_id: string
  title: string
  description: string
  category: 'individual' | 'team' | 'company'
  priority: 'low' | 'medium' | 'high'
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  target_date: string
  completion_percentage: number
  created_date: string
  completed_date?: string
  manager_notes?: string
  employee_notes?: string
  employee?: {
    first_name: string
    last_name: string
    department?: { name: string }
  }
}

interface PerformanceReview {
  id: string
  employee_id: string
  reviewer_id: string
  review_period_start: string
  review_period_end: string
  status: 'draft' | 'submitted' | 'completed' | 'approved'
  overall_rating: number
  strengths: string[]
  areas_for_improvement: string[]
  goals_for_next_period: string[]
  manager_comments?: string
  employee_comments?: string
  created_date: string
  submitted_date?: string
  completed_date?: string
  employee?: {
    first_name: string
    last_name: string
    department?: { name: string }
  }
  reviewer?: {
    first_name: string
    last_name: string
  }
}

interface PerformanceMetric {
  id: string
  employee_id: string
  metric_name: string
  metric_value: number
  target_value: number
  unit: string
  period: string
  recorded_date: string
  category: 'productivity' | 'quality' | 'attendance' | 'collaboration' | 'leadership'
}

const GOAL_CATEGORIES = [
  { value: 'individual', label: 'Individual', color: 'primary' },
  { value: 'team', label: 'Team', color: 'secondary' },
  { value: 'company', label: 'Company', color: 'success' }
]

const GOAL_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'default' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' }
]

const METRIC_CATEGORIES = [
  { value: 'productivity', label: 'Productivity' },
  { value: 'quality', label: 'Quality' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'leadership', label: 'Leadership' }
]

const PerformanceManagement: React.FC = () => {
  const { profile } = useAuth()
  const { canView, canEdit, canManage, isManager, isHR } = usePermissions()
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState(0)
  const [openGoalDialog, setOpenGoalDialog] = useState(false)
  const [openReviewDialog, setOpenReviewDialog] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<PerformanceGoal | null>(null)
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null)
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    category: 'individual',
    priority: 'medium',
    target_date: '',
    employee_id: profile?.employee_id || ''
  })

  // Fetch performance goals
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['performance-goals', profile?.employee_id],
    queryFn: async () => {
      let query = supabase
        .from('performance_goals')
        .select(`
          *,
          employee:user_profiles!performance_goals_employee_id_fkey (
            first_name,
            last_name,
            department:departments (name)
          )
        `)
        .order('created_date', { ascending: false })

      // Apply filters based on permissions
      if (!isHR && !isManager) {
        query = query.eq('employee_id', profile?.employee_id)
      }

      const { data, error } = await query
      if (error) throw error
      return data as PerformanceGoal[]
    },
    enabled: !!profile?.employee_id && canView('performance')
  })

  // Fetch performance reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['performance-reviews', profile?.employee_id],
    queryFn: async () => {
      let query = supabase
        .from('performance_reviews')
        .select(`
          *,
          employee:user_profiles!performance_reviews_employee_id_fkey (
            first_name,
            last_name,
            department:departments (name)
          ),
          reviewer:user_profiles!performance_reviews_reviewer_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_date', { ascending: false })

      // Apply filters based on permissions
      if (!isHR && !isManager) {
        query = query.eq('employee_id', profile?.employee_id)
      }

      const { data, error } = await query
      if (error) throw error
      return data as PerformanceReview[]
    },
    enabled: !!profile?.employee_id && canView('performance')
  })

  // Fetch performance metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['performance-metrics', profile?.employee_id],
    queryFn: async () => {
      let query = supabase
        .from('performance_metrics')
        .select('*')
        .order('recorded_date', { ascending: false })

      if (!isHR && !isManager) {
        query = query.eq('employee_id', profile?.employee_id)
      }

      const { data, error } = await query
      if (error) throw error
      return data as PerformanceMetric[]
    },
    enabled: !!profile?.employee_id && canView('performance')
  })

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const { data, error } = await supabase
        .from('performance_goals')
        .insert({
          ...goalData,
          completion_percentage: 0,
          status: 'not_started',
          created_date: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] })
      setOpenGoalDialog(false)
      resetGoalForm()
      toast.success('Performance goal created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create performance goal')
    }
  })

  // Update goal progress mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, completion_percentage, status, employee_notes }: { 
      id: string, 
      completion_percentage: number, 
      status: string,
      employee_notes?: string 
    }) => {
      const updateData: any = { 
        completion_percentage, 
        status 
      }
      
      if (employee_notes) updateData.employee_notes = employee_notes
      if (completion_percentage === 100) {
        updateData.completed_date = new Date().toISOString()
        updateData.status = 'completed'
      }

      const { data, error } = await supabase
        .from('performance_goals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] })
      toast.success('Goal progress updated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update goal progress')
    }
  })

  const resetGoalForm = () => {
    setGoalFormData({
      title: '',
      description: '',
      category: 'individual',
      priority: 'medium',
      target_date: '',
      employee_id: profile?.employee_id || ''
    })
  }

  const handleCreateGoal = () => {
    if (!goalFormData.title || !goalFormData.description || !goalFormData.target_date) {
      toast.error('Please fill in all required fields')
      return
    }

    createGoalMutation.mutate(goalFormData)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'primary'
      case 'overdue': return 'error'
      case 'cancelled': return 'default'
      default: return 'warning'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'success'
    if (percentage >= 50) return 'primary'
    if (percentage >= 25) return 'warning'
    return 'error'
  }

  if (goalsLoading || reviewsLoading || metricsLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading performance management...</Typography>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Performance Management
        </Typography>
        {canEdit('performance') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenGoalDialog(true)}
          >
            Add Goal
          </Button>
        )}
      </Box>

      {/* Performance Overview Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Goals</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {goals?.filter(g => g.status === 'in_progress').length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Completed</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {goals?.filter(g => g.status === 'completed').length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StarIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Rating</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {reviews?.length ? (reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length).toFixed(1) : '0.0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Reviews</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {reviews?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Goals" />
          <Tab label="Reviews" />
          <Tab label="Metrics" />
        </Tabs>

        <CardContent>
          {/* Goals Tab */}
          {activeTab === 0 && (
            <Box>
              {goals?.map((goal) => (
                <Accordion key={goal.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" width="100%">
                      <Box flexGrow={1}>
                        <Typography variant="h6">{goal.title}</Typography>
                        <Box display="flex" gap={1} mt={1}>
                          <Chip
                            label={GOAL_CATEGORIES.find(c => c.value === goal.category)?.label}
                            color={GOAL_CATEGORIES.find(c => c.value === goal.category)?.color as any}
                            size="small"
                          />
                          <Chip
                            label={GOAL_PRIORITIES.find(p => p.value === goal.priority)?.label}
                            color={GOAL_PRIORITIES.find(p => p.value === goal.priority)?.color as any}
                            size="small"
                          />
                          <Chip
                            label={goal.status.replace('_', ' ').toUpperCase()}
                            color={getStatusColor(goal.status) as any}
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Box textAlign="right" mr={2}>
                        <Typography variant="h6" color={getProgressColor(goal.completion_percentage)}>
                          {goal.completion_percentage}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={goal.completion_percentage}
                          color={getProgressColor(goal.completion_percentage) as any}
                          sx={{ width: 100, mt: 1 }}
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="body2" paragraph>
                          {goal.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Target Date: {format(parseISO(goal.target_date), 'MMM dd, yyyy')}
                        </Typography>
                        {goal.employee_notes && (
                          <Box mt={2}>
                            <Typography variant="subtitle2">Employee Notes:</Typography>
                            <Typography variant="body2">{goal.employee_notes}</Typography>
                          </Box>
                        )}
                        {goal.manager_notes && (
                          <Box mt={2}>
                            <Typography variant="subtitle2">Manager Notes:</Typography>
                            <Typography variant="body2">{goal.manager_notes}</Typography>
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12} md={4}>
                        {canEdit('performance') && goal.employee_id === profile?.employee_id && (
                          <Box>
                            <TextField
                              fullWidth
                              type="number"
                              label="Progress %"
                              value={goal.completion_percentage}
                              onChange={(e) => {
                                const percentage = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                                updateGoalMutation.mutate({
                                  id: goal.id,
                                  completion_percentage: percentage,
                                  status: percentage === 100 ? 'completed' : 'in_progress'
                                })
                              }}
                              inputProps={{ min: 0, max: 100 }}
                              size="small"
                            />
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              
              {!goals?.length && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No performance goals found
                </Typography>
              )}
            </Box>
          )}

          {/* Reviews Tab */}
          {activeTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {(isManager || isHR) && <TableCell>Employee</TableCell>}
                    <TableCell>Review Period</TableCell>
                    <TableCell>Overall Rating</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviews?.map((review) => (
                    <TableRow key={review.id}>
                      {(isManager || isHR) && (
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {review.employee?.first_name} {review.employee?.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {review.employee?.department?.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        {format(parseISO(review.review_period_start), 'MMM yyyy')} - {format(parseISO(review.review_period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Rating value={review.overall_rating} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({review.overall_rating}/5)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={review.status.toUpperCase()}
                          color={review.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{format(parseISO(review.created_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Tooltip title="View Review">
                          <IconButton size="small" onClick={() => setSelectedReview(review)}>
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

          {/* Metrics Tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              {METRIC_CATEGORIES.map((category) => {
                const categoryMetrics = metrics?.filter(m => m.category === category.value) || []
                const avgValue = categoryMetrics.length 
                  ? categoryMetrics.reduce((acc, m) => acc + (m.metric_value / m.target_value * 100), 0) / categoryMetrics.length
                  : 0

                return (
                  <Grid item xs={12} sm={6} md={4} key={category.value}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" mb={2}>{category.label}</Typography>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Typography variant="h4" color="primary">
                            {avgValue.toFixed(0)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, avgValue)}
                          color={avgValue >= 80 ? 'success' : avgValue >= 60 ? 'primary' : 'warning'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {categoryMetrics.length} metrics tracked
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Goal Creation Dialog */}
      <Dialog open={openGoalDialog} onClose={() => setOpenGoalDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Performance Goal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Title"
                value={goalFormData.title}
                onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={goalFormData.description}
                onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={goalFormData.category}
                  onChange={(e) => setGoalFormData({ ...goalFormData, category: e.target.value })}
                  label="Category"
                >
                  {GOAL_CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={goalFormData.priority}
                  onChange={(e) => setGoalFormData({ ...goalFormData, priority: e.target.value })}
                  label="Priority"
                >
                  {GOAL_PRIORITIES.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Target Date"
                value={goalFormData.target_date}
                onChange={(e) => setGoalFormData({ ...goalFormData, target_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGoalDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateGoal}
            disabled={createGoalMutation.isPending}
          >
            Create Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PerformanceManagement
