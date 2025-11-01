import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  FormHelperText,
  Switch,
  FormControlLabel,
  Autocomplete,
  Grid,
  Stack,
} from '@mui/material'
import {
  CalendarToday,
  Warning,
  CheckCircle,
  Error,
  Schedule,
  Person,
  Assignment,
  AttachFile,
  Close,
  Add,
  Remove,
  Info,
  Notifications,
  Send,
  Save,
  Preview,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusChip } from '../common/StatusChip'
import { leaveService } from '../../services/leaveService'
import { Tables } from '../../types/database'

interface ConflictInfo {
  type: 'team_understaffed' | 'manager_unavailable' | 'overlapping_request' | 'critical_period'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  affectedEmployees?: any[]
  suggestedAlternatives?: string[]
}

interface LeaveBalance {
  annual: number
  sick: number
  personal: number
  emergency: number
  total: number
}

interface DelegationTask {
  id: string
  title: string
  assignedTo: string
  priority: 'low' | 'medium' | 'high'
  deadline: string
  description: string
}

interface LeaveRequestFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (request: Partial<Tables['leave_requests']['Insert']>) => Promise<void>
  editingRequest?: Tables['leave_requests']['Row'] | null
  employeeId: string
}

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', icon: '🏖️', maxDays: 25 },
  { value: 'sick', label: 'Sick Leave', icon: '🏥', maxDays: 10 },
  { value: 'personal', label: 'Personal Leave', icon: '👤', maxDays: 5 },
  { value: 'emergency', label: 'Emergency Leave', icon: '🚨', maxDays: 3 },
  { value: 'maternity', label: 'Maternity Leave', icon: '👶', maxDays: 120 },
  { value: 'paternity', label: 'Paternity Leave', icon: '👨‍👶', maxDays: 14 },
  { value: 'study', label: 'Study Leave', icon: '📚', maxDays: 15 },
  { value: 'compensatory', label: 'Compensatory Leave', icon: '⚖️', maxDays: 0 },
]

const steps = [
  { label: 'Leave Details', description: 'Basic leave information' },
  { label: 'Conflict Check', description: 'Verify team coverage' },
  { label: 'Work Delegation', description: 'Assign tasks to colleagues' },
  { label: 'Review & Submit', description: 'Final review and submission' },
]

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  open,
  onClose,
  onSubmit,
  editingRequest,
  employeeId,
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([])
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null)
  const [delegationTasks, setDelegationTasks] = useState<DelegationTask[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: null as Date | null,
    end_date: null as Date | null,
    reason: '',
    is_half_day: false,
    emergency_contact: '',
    documents: [] as File[],
    notify_team: true,
    return_date: null as Date | null,
    handover_notes: '',
  })

  useEffect(() => {
    if (open) {
      fetchLeaveBalance()
      fetchTeamMembers()
      if (editingRequest) {
        populateFormData(editingRequest)
      }
    }
  }, [open, editingRequest, employeeId])

  useEffect(() => {
    if (formData.start_date && formData.end_date && formData.leave_type) {
      checkConflicts()
    }
  }, [formData.start_date, formData.end_date, formData.leave_type])

  const fetchLeaveBalance = async () => {
    try {
      const balance = await leaveService.getLeaveBalance(employeeId)
      setLeaveBalance(balance)
    } catch (error) {
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const members = await leaveService.getTeamMembers(employeeId)
      setTeamMembers(members)
    } catch (error) {
    }
  }

  const populateFormData = (request: Tables['leave_requests']['Row']) => {
    setFormData({
      leave_type: request.leave_type,
      start_date: new Date(request.start_date),
      end_date: new Date(request.end_date),
      reason: request.reason || '',
      is_half_day: request.is_half_day || false,
      emergency_contact: request.emergency_contact || '',
      documents: [],
      notify_team: true,
      return_date: request.return_date ? new Date(request.return_date) : null,
      handover_notes: request.handover_notes || '',
    })
  }

  const checkConflicts = async () => {
    if (!formData.start_date || !formData.end_date) return

    setLoading(true)
    try {
      const conflictData = await leaveService.checkLeaveConflicts({
        employeeId,
        startDate: formData.start_date.toISOString(),
        endDate: formData.end_date.toISOString(),
        leaveType: formData.leave_type,
      })
      setConflicts(conflictData)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const calculateLeaveDays = () => {
    if (!formData.start_date || !formData.end_date) return 0
    const diffTime = Math.abs(formData.end_date.getTime() - formData.start_date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return formData.is_half_day ? 0.5 : diffDays
  }

  const getLeaveTypeInfo = () => {
    return leaveTypes.find(type => type.value === formData.leave_type)
  }

  const getAvailableBalance = () => {
    if (!leaveBalance || !formData.leave_type) return 0
    return leaveBalance[formData.leave_type as keyof LeaveBalance] || 0
  }

  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0:
        return formData.leave_type && formData.start_date && formData.end_date && formData.reason
      case 1:
        return conflicts.every(c => c.severity !== 'critical')
      case 2:
        return true // Optional step
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceedToNextStep()) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!formData.start_date || !formData.end_date) return

    setLoading(true)
    try {
      const requestData: Partial<Tables['leave_requests']['Insert']> = {
        employee_id: employeeId,
        leave_type: formData.leave_type,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
        reason: formData.reason,
        is_half_day: formData.is_half_day,
        emergency_contact: formData.emergency_contact,
        return_date: formData.return_date?.toISOString().split('T')[0],
        handover_notes: formData.handover_notes,
        status: 'pending',
        days_requested: calculateLeaveDays(),
      }

      await onSubmit(requestData)
      onClose()
      resetForm()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      leave_type: '',
      start_date: null,
      end_date: null,
      reason: '',
      is_half_day: false,
      emergency_contact: '',
      documents: [],
      notify_team: true,
      return_date: null,
      handover_notes: '',
    })
    setActiveStep(0)
    setConflicts([])
    setDelegationTasks([])
  }

  const addDelegationTask = () => {
    const newTask: DelegationTask = {
      id: Date.now().toString(),
      title: '',
      assignedTo: '',
      priority: 'medium',
      deadline: '',
      description: '',
    }
    setDelegationTasks([...delegationTasks, newTask])
  }

  const updateDelegationTask = (taskId: string, updates: Partial<DelegationTask>) => {
    setDelegationTasks(tasks =>
      tasks.map(task => task.id === taskId ? { ...task, ...updates } : task)
    )
  }

  const removeDelegationTask = (taskId: string) => {
    setDelegationTasks(tasks => tasks.filter(task => task.id !== taskId))
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 2 }}>
            <Grid container spacing={3}>
              {/* Leave Type Selection */}
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={formData.leave_type}
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                    label="Leave Type"
                  >
                    {leaveTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                          {leaveBalance && (
                            <Chip
                              size="small"
                              label={`${leaveBalance[type.value as keyof LeaveBalance] || 0} days left`}
                              color={
                                (leaveBalance[type.value as keyof LeaveBalance] || 0) > 5
                                  ? 'success'
                                  : (leaveBalance[type.value as keyof LeaveBalance] || 0) > 2
                                  ? 'warning'
                                  : 'error'
                              }
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {formData.leave_type && (
                    <FormHelperText>
                      Available balance: {getAvailableBalance()} days
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Date Selection */}
              <Grid size={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => setFormData({ ...formData, start_date: date })}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </Grid>

              <Grid size={6}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) => setFormData({ ...formData, end_date: date })}
                  minDate={formData.start_date}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </Grid>

              {/* Half Day Option */}
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_half_day}
                      onChange={(e) => setFormData({ ...formData, is_half_day: e.target.checked })}
                    />
                  }
                  label="Half Day Leave"
                />
              </Grid>

              {/* Leave Duration Display */}
              {formData.start_date && formData.end_date && (
                <Grid size={12}>
                  <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="h6">
                        Leave Duration: {calculateLeaveDays()} day(s)
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        From {formData.start_date.toLocaleDateString()} to {formData.end_date.toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Reason */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason for Leave"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a detailed reason for your leave request..."
                />
              </Grid>

              {/* Emergency Contact */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Contact number during leave"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Conflict Analysis
            </Typography>
            {loading ? (
              <Box sx={{ my: 3 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Checking for potential conflicts...
                </Typography>
              </Box>
            ) : conflicts.length === 0 ? (
              <Alert severity="success" sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle />
                  <Typography>No conflicts detected. Your leave request looks good!</Typography>
                </Box>
              </Alert>
            ) : (
              <Stack spacing={2} sx={{ my: 2 }}>
                {conflicts.map((conflict, index) => (
                  <Alert
                    key={index}
                    severity={conflict.severity === 'critical' ? 'error' : 'warning'}
                    action={
                      conflict.suggestedAlternatives && (
                        <Tooltip title="View suggestions">
                          <IconButton size="small">
                            <Info />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {conflict.type.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="body2">{conflict.message}</Typography>
                    
                    {conflict.affectedEmployees && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption">Affected team members:</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          {conflict.affectedEmployees.map((emp, idx) => (
                            <Chip key={idx} size="small" label={emp.name} />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Alert>
                ))}
              </Stack>
            )}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Team Coverage Analysis
            </Typography>
            <Card sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      85%
                    </Typography>
                    <Typography variant="caption">Team Coverage</Typography>
                  </Box>
                </Grid>
                <Grid size={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      3
                    </Typography>
                    <Typography variant="caption">Overlapping Leaves</Typography>
                  </Box>
                </Grid>
                <Grid size={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      2
                    </Typography>
                    <Typography variant="caption">Critical Projects</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Work Delegation</Typography>
              <Button
                startIcon={<Add />}
                onClick={addDelegationTask}
                variant="outlined"
                size="small"
              >
                Add Task
              </Button>
            </Box>
            {delegationTasks.length === 0 ? (
              <Alert severity="info">
                No tasks to delegate. You can proceed to the next step or add tasks that need to be handled during your absence.
              </Alert>
            ) : (
              <Stack spacing={2}>
                {delegationTasks.map((task) => (
                  <Card key={task.id} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="subtitle1">Task #{task.id}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => removeDelegationTask(task.id)}
                        color="error"
                      >
                        <Remove />
                      </IconButton>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Task Title"
                          value={task.title}
                          onChange={(e) => updateDelegationTask(task.id, { title: e.target.value })}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <Autocomplete
                          size="small"
                          options={teamMembers}
                          getOptionLabel={(option) => option.full_name}
                          value={teamMembers.find(m => m.id === task.assignedTo) || null}
                          onChange={(_, value) => updateDelegationTask(task.id, { assignedTo: value?.id || '' })}
                          renderInput={(params) => <TextField {...params} label="Assign To" />}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          md: 4
                        }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Priority</InputLabel>
                          <Select
                            value={task.priority}
                            onChange={(e) => updateDelegationTask(task.id, { priority: e.target.value as any })}
                            label="Priority"
                          >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          md: 8
                        }}>
                        <DatePicker
                          label="Deadline"
                          value={task.deadline ? new Date(task.deadline) : null}
                          onChange={(date) => updateDelegationTask(task.id, { deadline: date?.toISOString() || '' })}
                          slotProps={{
                            textField: { fullWidth: true, size: 'small' }
                          }}
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          label="Description"
                          value={task.description}
                          onChange={(e) => updateDelegationTask(task.id, { description: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            )}
            <Divider sx={{ my: 3 }} />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Handover Notes"
              value={formData.handover_notes}
              onChange={(e) => setFormData({ ...formData, handover_notes: e.target.value })}
              placeholder="Additional instructions for your team while you're away..."
            />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Leave Request
            </Typography>
            <Card sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <Typography variant="subtitle2" gutterBottom>Leave Type</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <span>{getLeaveTypeInfo()?.icon}</span>
                    <Typography>{getLeaveTypeInfo()?.label}</Typography>
                  </Box>
                </Grid>
                
                <Grid
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <Typography variant="subtitle2" gutterBottom>Duration</Typography>
                  <Typography sx={{ mb: 2 }}>
                    {calculateLeaveDays()} day(s)
                    {formData.is_half_day && ' (Half Day)'}
                  </Typography>
                </Grid>
                
                <Grid size={12}>
                  <Typography variant="subtitle2" gutterBottom>Dates</Typography>
                  <Typography sx={{ mb: 2 }}>
                    {formData.start_date?.toLocaleDateString()} to {formData.end_date?.toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid size={12}>
                  <Typography variant="subtitle2" gutterBottom>Reason</Typography>
                  <Typography sx={{ mb: 2 }}>{formData.reason}</Typography>
                </Grid>
                
                {formData.emergency_contact && (
                  <Grid size={12}>
                    <Typography variant="subtitle2" gutterBottom>Emergency Contact</Typography>
                    <Typography sx={{ mb: 2 }}>{formData.emergency_contact}</Typography>
                  </Grid>
                )}
                
                {delegationTasks.length > 0 && (
                  <Grid size={12}>
                    <Typography variant="subtitle2" gutterBottom>Delegated Tasks</Typography>
                    <List dense>
                      {delegationTasks.map((task) => (
                        <ListItem key={task.id}>
                          <ListItemText
                            primary={task.title}
                            secondary={`Assigned to: ${teamMembers.find(m => m.id === task.assignedTo)?.full_name || 'Unknown'}`}
                          />
                          <StatusChip status={task.priority} size="sm" />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </Card>
            {conflicts.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Note: This request has potential conflicts</Typography>
                <Typography variant="body2">
                  {conflicts.length} conflict(s) detected. Please ensure proper coverage is arranged.
                </Typography>
              </Alert>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.notify_team}
                  onChange={(e) => setFormData({ ...formData, notify_team: e.target.checked })}
                />
              }
              label="Notify team members about this leave request"
            />
          </Box>
        );

      default:
        return null
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {editingRequest ? 'Edit Leave Request' : 'New Leave Request'}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === 2 ? (
                    <Typography variant="caption">Optional</Typography>
                  ) : null
                }
              >
                <Typography variant="subtitle1">{step.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent(index)}
                </motion.div>
                
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  {index === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading || !canProceedToNextStep()}
                      startIcon={<Send />}
                    >
                      Submit Request
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!canProceedToNextStep()}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
    </Dialog>
  )
}
