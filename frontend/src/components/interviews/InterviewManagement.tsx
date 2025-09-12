import React, { useState } from 'react'
import Grid from '@mui/material/Grid'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  LinearProgress,
  Rating
} from '@mui/material'
import {
  Add as AddIcon,
  ViewList as ViewIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  VideoCall as VideoCallIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

interface Interview {
  id: string
  job_application_id: string
  interviewer_id: string
  interview_type: 'phone' | 'video' | 'in_person' | 'technical' | 'behavioral'
  scheduled_date: string
  duration_minutes: number
  location?: string
  meeting_link?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  rating?: number
  feedback?: string
  job_application?: {
    candidate_name: string
    candidate_email: string
    job_posting?: { title: string; department: string }
  }
}

const INTERVIEW_TYPES = [
  { value: 'phone', label: 'Phone' },
  { value: 'video', label: 'Video' },
  { value: 'in_person', label: 'In Person' },
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' }
]

const InterviewManagement: React.FC = () => {
  const { profile } = useAuth()
  const { isHR } = usePermissions()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState(0)
  const [openSchedule, setOpenSchedule] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [scheduleForm, setScheduleForm] = useState({
    job_application_id: '',
    interview_type: 'video',
    date: '',
    time: '',
    duration_minutes: 60,
    location: '',
    meeting_link: ''
  })
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, feedback: '' })

  // Interviews
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['interviews', profile?.employee_id],
    queryFn: async () => {
      let q = supabase
        .from('interviews')
        .select(`*, job_application:job_applications( candidate_name, candidate_email, job_posting:job_postings(title,department) )`)
        .order('scheduled_date', { ascending: true })

      // Non-HR users only see interviews they conduct
      if (!isHR()) q = q.eq('interviewer_id', profile?.employee_id)

      const { data, error } = await q
      if (error) throw error
      return data as Interview[]
    },
    enabled: !!profile?.employee_id
  })

  // Candidates (applications in screening/interview)
  const { data: candidates } = useQuery({
    queryKey: ['interview-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select('id, candidate_name, candidate_email, job_posting:job_postings(title)')
        .in('status', ['screening', 'interview'])
        .order('applied_date', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: isHR()
  })

  // Schedule interview
  const scheduleMutation = useMutation({
    mutationFn: async () => {
      const scheduled = new Date(`${scheduleForm.date}T${scheduleForm.time}`)
      const { error } = await supabase.from('interviews').insert({
        job_application_id: scheduleForm.job_application_id,
        interviewer_id: profile?.employee_id,
        interview_type: scheduleForm.interview_type as Interview['interview_type'],
        scheduled_date: scheduled.toISOString(),
        duration_minutes: scheduleForm.duration_minutes,
        location: scheduleForm.location || null,
        meeting_link: scheduleForm.meeting_link || null,
        status: 'scheduled'
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Interview scheduled')
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      setOpenSchedule(false)
      setScheduleForm({ job_application_id: '', interview_type: 'video', date: '', time: '', duration_minutes: 60, location: '', meeting_link: '' })
    },
    onError: (e: any) => toast.error(e.message || 'Failed to schedule interview')
  })

  // Complete interview
  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedInterview) return
      const { error } = await supabase
        .from('interviews')
        .update({ status: 'completed', rating: feedbackForm.rating, feedback: feedbackForm.feedback })
        .eq('id', selectedInterview.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Interview completed')
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      setOpenComplete(false)
      setSelectedInterview(null)
      setFeedbackForm({ rating: 0, feedback: '' })
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update interview')
  })

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading interviews…</Typography>
      </Box>
    )
  }

  const upcoming = (interviews || []).filter(i => i.status === 'scheduled' && new Date(i.scheduled_date) >= new Date())
  const all = interviews || []

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Interview Management</Typography>
        {isHR() && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenSchedule(true)}>
            Schedule Interview
          </Button>
        )}
      </Box>

      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label={`Upcoming (${upcoming.length})`} />
          <Tab label={`All (${all.length})`} />
        </Tabs>
        <CardContent>
          {activeTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Candidate</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Scheduled</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcoming.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{i.job_application?.candidate_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{i.job_application?.candidate_email}</Typography>
                      </TableCell>
                      <TableCell>{i.job_application?.job_posting?.title}</TableCell>
                      <TableCell>{INTERVIEW_TYPES.find(t => t.value === i.interview_type)?.label}</TableCell>
                      <TableCell>{format(parseISO(i.scheduled_date), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>{i.duration_minutes} min</TableCell>
                      <TableCell>
                        <Chip size="small" label={i.status.toUpperCase()} color={i.status === 'scheduled' ? 'primary' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Complete">
                          <IconButton size="small" color="success" onClick={() => { setSelectedInterview(i); setOpenComplete(true) }}>
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        {i.meeting_link && (
                          <Tooltip title="Join Call">
                            <IconButton size="small" color="primary" onClick={() => window.open(i.meeting_link!, '_blank')}>
                              <VideoCallIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Cancel">
                          <IconButton size="small" color="error" onClick={async () => {
                            const { error } = await supabase.from('interviews').update({ status: 'cancelled' }).eq('id', i.id)
                            if (error) return toast.error('Failed to cancel')
                            toast.success('Interview cancelled')
                            queryClient.invalidateQueries({ queryKey: ['interviews'] })
                          }}>
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Candidate</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {all.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>{i.job_application?.candidate_name}</TableCell>
                      <TableCell>{i.job_application?.job_posting?.title}</TableCell>
                      <TableCell>{INTERVIEW_TYPES.find(t => t.value === i.interview_type)?.label}</TableCell>
                      <TableCell>{format(parseISO(i.scheduled_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Chip size="small" label={i.status.toUpperCase()} color={i.status === 'completed' ? 'success' : i.status === 'cancelled' ? 'error' : 'warning'} />
                      </TableCell>
                      <TableCell>
                        {i.rating ? <Rating readOnly size="small" value={i.rating} /> : <Typography variant="caption" color="text.secondary">—</Typography>}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton size="small"><ViewIcon /></IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small"><EditIcon /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={openSchedule} onClose={() => setOpenSchedule(false)} maxWidth="md" fullWidth>
        <DialogTitle>Schedule Interview</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Candidate</InputLabel>
                <Select
                  value={scheduleForm.job_application_id}
                  label="Candidate"
                  onChange={(e) => setScheduleForm({ ...scheduleForm, job_application_id: e.target.value })}
                >
                  {candidates?.map((c: any) => (
                    <MenuItem key={c.id} value={c.id}>{c.candidate_name} • {c.job_posting?.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={scheduleForm.interview_type}
                  label="Type"
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interview_type: e.target.value })}
                >
                  {INTERVIEW_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="time" label="Time" InputLabelProps={{ shrink: true }} value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Duration (min)" value={scheduleForm.duration_minutes} onChange={e => setScheduleForm({ ...scheduleForm, duration_minutes: parseInt(e.target.value) || 60 })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Location" value={scheduleForm.location} onChange={e => setScheduleForm({ ...scheduleForm, location: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Meeting Link" value={scheduleForm.meeting_link} onChange={e => setScheduleForm({ ...scheduleForm, meeting_link: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSchedule(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            if (!scheduleForm.job_application_id || !scheduleForm.date || !scheduleForm.time) return toast.error('Please fill all required fields')
            scheduleMutation.mutate()
          }} disabled={scheduleMutation.isPending}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={openComplete} onClose={() => setOpenComplete(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Interview</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>{selectedInterview?.job_application?.candidate_name}</Typography>
            <Rating sx={{ mb: 2 }} value={feedbackForm.rating} onChange={(_, v) => setFeedbackForm({ ...feedbackForm, rating: v || 0 })} />
            <TextField fullWidth multiline rows={4} label="Feedback" value={feedbackForm.feedback} onChange={e => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenComplete(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending || feedbackForm.rating === 0}>
            Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default InterviewManagement
