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
  LinearProgress,
  Avatar,
  Stack,
  Paper,
  Alert
} from '@mui/material'
import {
  Add as AddIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  WorkspacePremium as CertificateIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface TrainingCourse {
  id: string
  title: string
  description: string
  category: string
  duration_hours: number
  instructor: string
  max_participants: number
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  created_at: string
  enrollments?: TrainingEnrollment[]
}

interface TrainingEnrollment {
  id: string
  course_id: string
  employee_id: string
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped'
  progress: number
  completion_date?: string
  certificate_issued: boolean
  employee?: {
    id: string
    full_name: string
    email: string
    department: string
  }
}

const TRAINING_CATEGORIES = [
  { value: 'technical', label: 'Technical Skills' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'soft_skills', label: 'Soft Skills' },
  { value: 'safety', label: 'Safety' },
  { value: 'onboarding', label: 'Onboarding' }
]

const TrainingManagement: React.FC = () => {
  const { profile } = useAuth()
  const { isHR, isManager } = usePermissions()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState(0)
  const [openCreateCourse, setOpenCreateCourse] = useState(false)
  const [openEnrollDialog, setOpenEnrollDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null)
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'technical',
    duration_hours: 8,
    instructor: '',
    max_participants: 20,
    start_date: '',
    end_date: ''
  })

  // Fetch training courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['training-courses'],
    queryFn: async () => {
      let query = supabase
        .from('training_courses')
        .select(`
          *,
          enrollments:training_enrollments(
            id,
            employee_id,
            status,
            progress,
            completion_date,
            certificate_issued,
            employee:user_profiles(id, full_name, email, department)
          )
        `)
        .order('created_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      return data as TrainingCourse[]
    }
  })

  // Fetch my training enrollments
  const { data: myTrainings } = useQuery({
    queryKey: ['my-trainings', profile?.employee_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_enrollments')
        .select(`
          *,
          course:training_courses(*)
        `)
        .eq('employee_id', profile?.employee_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!profile?.employee_id
  })

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      const { error } = await supabase
        .from('training_courses')
        .insert({
          ...courseData,
          status: 'draft'
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-courses'] })
      toast.success('Training course created successfully')
      setOpenCreateCourse(false)
      setCourseForm({
        title: '',
        description: '',
        category: 'technical',
        duration_hours: 8,
        instructor: '',
        max_participants: 20,
        start_date: '',
        end_date: ''
      })
    },
    onError: () => {
      toast.error('Failed to create training course')
    }
  })

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('training_enrollments')
        .insert({
          course_id: courseId,
          employee_id: profile?.employee_id,
          status: 'enrolled',
          progress: 0
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-courses'] })
      queryClient.invalidateQueries({ queryKey: ['my-trainings'] })
      toast.success('Successfully enrolled in training')
    },
    onError: () => {
      toast.error('Failed to enroll in training')
    }
  })

  const handleCreateCourse = () => {
    createCourseMutation.mutate(courseForm)
  }

  const handleEnroll = (courseId: string) => {
    enrollMutation.mutate(courseId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'completed': return 'info'
      case 'cancelled': return 'error'
      case 'enrolled': return 'primary'
      case 'in_progress': return 'warning'
      default: return 'default'
    }
  }

  const renderCoursesTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Training Courses</Typography>
        {isHR() && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateCourse(true)}
          >
            Create Course
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {courses?.map((course) => (
          <Grid
            key={course.id}
            size={{
              xs: 12,
              md: 6,
              lg: 4
            }}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>
                  <Chip
                    label={course.status}
                    color={getStatusColor(course.status) as any}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {course.description}
                </Typography>

                <Stack spacing={1} mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SchoolIcon fontSize="small" />
                    <Typography variant="body2">{course.category}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ScheduleIcon fontSize="small" />
                    <Typography variant="body2">{course.duration_hours} hours</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AssignmentIcon fontSize="small" />
                    <Typography variant="body2">
                      {course.enrollments?.length || 0}/{course.max_participants} enrolled
                    </Typography>
                  </Box>
                </Stack>

                <Box display="flex" gap={1} mt={2}>
                  {course.status === 'active' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEnroll(course.id)}
                      disabled={course.enrollments?.some(e => e.employee_id === profile?.employee_id)}
                    >
                      {course.enrollments?.some(e => e.employee_id === profile?.employee_id) 
                        ? 'Enrolled' 
                        : 'Enroll'
                      }
                    </Button>
                  )}
                  {isHR() && (
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )

  const renderMyTrainingsTab = () => (
    <Box>
      <Typography variant="h6" mb={3}>My Training Progress</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Completion Date</TableCell>
              <TableCell>Certificate</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {myTrainings?.map((enrollment: any) => (
              <TableRow key={enrollment.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {enrollment.course.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={enrollment.course.category} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={enrollment.status}
                    color={getStatusColor(enrollment.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress
                      variant="determinate"
                      value={enrollment.progress}
                      sx={{ width: 100 }}
                    />
                    <Typography variant="body2">{enrollment.progress}%</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {enrollment.completion_date 
                    ? new Date(enrollment.completion_date).toLocaleDateString()
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  {enrollment.certificate_issued ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CancelIcon color="disabled" />
                  )}
                </TableCell>
                <TableCell>
                  {enrollment.status === 'enrolled' && (
                    <Button size="small" startIcon={<PlayIcon />}>
                      Start
                    </Button>
                  )}
                  {enrollment.certificate_issued && (
                    <Button size="small" startIcon={<CertificateIcon />}>
                      Download
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  if (coursesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Training Management
      </Typography>
      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="All Courses" />
          <Tab label="My Trainings" />
          {isHR() && <Tab label="Analytics" />}
        </Tabs>

        <CardContent>
          {activeTab === 0 && renderCoursesTab()}
          {activeTab === 1 && renderMyTrainingsTab()}
          {activeTab === 2 && isHR() && (
            <Alert severity="info">Training analytics coming soon...</Alert>
          )}
        </CardContent>
      </Card>
      {/* Create Course Dialog */}
      <Dialog open={openCreateCourse} onClose={() => setOpenCreateCourse(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Training Course</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Course Title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                >
                  {TRAINING_CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                type="number"
                label="Duration (hours)"
                value={courseForm.duration_hours}
                onChange={(e) => setCourseForm({ ...courseForm, duration_hours: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Instructor"
                value={courseForm.instructor}
                onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                type="number"
                label="Max Participants"
                value={courseForm.max_participants}
                onChange={(e) => setCourseForm({ ...courseForm, max_participants: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={courseForm.start_date}
                onChange={(e) => setCourseForm({ ...courseForm, start_date: e.target.value })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={courseForm.end_date}
                onChange={(e) => setCourseForm({ ...courseForm, end_date: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateCourse(false)}>Cancel</Button>
          <Button
            onClick={handleCreateCourse}
            variant="contained"
            disabled={!courseForm.title || !courseForm.instructor}
          >
            Create Course
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TrainingManagement
