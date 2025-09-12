import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tooltip,
  Stack,
  Divider,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  Fab,
  Snackbar,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Rating,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  SmartToy as AIIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Analytics as AnalyticsIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AttachMoney as SalaryIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { usePermissions } from '../../hooks/usePermissions'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import AIResumeAnalyzer from '../ai/AIResumeAnalyzer'

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern'
  salary_min?: number
  salary_max?: number
  description: string
  requirements: string[]
  benefits: string[]
  status: 'draft' | 'active' | 'closed' | 'on_hold'
  posted_date: string
  closing_date?: string
  created_by: string
  applications_count?: number
}

interface JobApplication {
  id: string
  job_posting_id: string
  candidate_name: string
  candidate_email: string
  candidate_phone?: string
  resume_url?: string
  cover_letter?: string
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
  applied_date: string
  notes?: string
  interview_date?: string
  job_posting?: JobPosting
}

interface OnboardingTask {
  id: string
  employee_id: string
  task_name: string
  description: string
  category: 'documentation' | 'training' | 'equipment' | 'access' | 'orientation'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  assigned_to?: string
  due_date: string
  completed_date?: string
  priority: 'low' | 'medium' | 'high'
}

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' }
]

const APPLICATION_STATUSES = [
  { value: 'applied', label: 'Applied', color: 'info' },
  { value: 'screening', label: 'Screening', color: 'warning' },
  { value: 'interview', label: 'Interview', color: 'primary' },
  { value: 'offer', label: 'Offer', color: 'success' },
  { value: 'hired', label: 'Hired', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' }
]

const ONBOARDING_STEPS = [
  'Documentation Collection',
  'System Access Setup',
  'Equipment Assignment',
  'Orientation & Training',
  'Department Introduction',
  'First Week Check-in'
]

// JSON Configuration for Hiring Management
const HIRING_CONFIG = {
  jobPosting: {
    fields: [
      { key: 'title', label: 'Job Title', type: 'text', required: true, validation: { minLength: 3 } },
      { key: 'department', label: 'Department', type: 'select', required: true, options: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'] },
      { key: 'location', label: 'Location', type: 'text', required: true },
      { key: 'employment_type', label: 'Employment Type', type: 'select', required: true, options: EMPLOYMENT_TYPES },
      { key: 'salary_min', label: 'Minimum Salary', type: 'number', required: false },
      { key: 'salary_max', label: 'Maximum Salary', type: 'number', required: false },
      { key: 'description', label: 'Job Description', type: 'textarea', required: true, validation: { minLength: 50 } },
      { key: 'requirements', label: 'Requirements', type: 'textarea', required: true },
      { key: 'benefits', label: 'Benefits', type: 'textarea', required: false }
    ],
    statuses: [
      { value: 'draft', label: 'Draft', color: 'default' },
      { value: 'active', label: 'Active', color: 'success' },
      { value: 'on_hold', label: 'On Hold', color: 'warning' },
      { value: 'closed', label: 'Closed', color: 'error' }
    ]
  },
  application: {
    fields: [
      { key: 'candidate_name', label: 'Full Name', type: 'text', required: true },
      { key: 'candidate_email', label: 'Email', type: 'email', required: true },
      { key: 'candidate_phone', label: 'Phone', type: 'tel', required: false },
      { key: 'resume_url', label: 'Resume URL', type: 'url', required: false },
      { key: 'cover_letter', label: 'Cover Letter', type: 'textarea', required: false },
      { key: 'experience_years', label: 'Years of Experience', type: 'number', required: false },
      { key: 'current_salary', label: 'Current Salary', type: 'number', required: false },
      { key: 'expected_salary', label: 'Expected Salary', type: 'number', required: false }
    ],
    statuses: APPLICATION_STATUSES
  },
  filters: {
    jobPosting: [
      { key: 'status', label: 'Status', type: 'select', options: ['all', 'draft', 'active', 'on_hold', 'closed'] },
      { key: 'department', label: 'Department', type: 'select', options: ['all', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'] },
      { key: 'employment_type', label: 'Type', type: 'select', options: ['all', ...EMPLOYMENT_TYPES.map(t => t.value)] }
    ],
    application: [
      { key: 'status', label: 'Status', type: 'select', options: ['all', ...APPLICATION_STATUSES.map(s => s.value)] },
      { key: 'job_posting', label: 'Job Position', type: 'select', options: [] }, // Will be populated dynamically
      { key: 'date_range', label: 'Applied Date', type: 'daterange' }
    ]
  }
}

const HiringManagement: React.FC = () => {
  const theme = useTheme()
  const { profile } = useAuth()
  const { canView, canEdit, canDelete } = usePermissions()
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [openJobDialog, setOpenJobDialog] = useState(false)
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null)
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'applications'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false)
  const [candidateDialog, setCandidateDialog] = useState<{ open: boolean; candidate: JobApplication | null }>({ open: false, candidate: null })
  const [aiAnalysisDialog, setAiAnalysisDialog] = useState<{ open: boolean; candidate: JobApplication | null }>({ open: false, candidate: null })
  const [jobForm, setJobForm] = useState({
    id: '',
    title: '',
    department: '',
    location: '',
    employment_type: 'full_time' as const,
    description: '',
    requirements: '',
    benefits: '',
    salary_min: '',
    salary_max: '',
    status: 'draft' as const
  })
  
  const [applicationForm, setApplicationForm] = useState({
    id: '',
    job_posting_id: '',
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    resume_url: '',
    cover_letter: '',
    experience_years: '',
    current_salary: '',
    expected_salary: '',
    status: 'applied' as const,
    notes: '',
    rating: 0
  })

  // Fetch job postings
  const { data: jobPostings, isLoading: jobsLoading } = useQuery({
    queryKey: ['job-postings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          *,
          applications:job_applications(count)
        `)
        .order('posted_date', { ascending: false })

      if (error) throw error
      return data.map(job => ({
        ...job,
        applications_count: job.applications?.[0]?.count || 0
      })) as JobPosting[]
    },
    enabled: canView('employees')
  })

  // Fetch job applications
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['job-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_posting:job_postings (
            title,
            department,
            location
          )
        `)
        .order('applied_date', { ascending: false })

      if (error) throw error
      return data as JobApplication[]
    },
    enabled: canView('employees')
  })

  // Fetch onboarding tasks
  const { data: onboardingTasks, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboarding-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .select(`
          *,
          employee:user_profiles!onboarding_tasks_employee_id_fkey (
            first_name,
            last_name,
            department:departments (name)
          ),
          assigned_user:user_profiles!onboarding_tasks_assigned_to_fkey (
            first_name,
            last_name
          )
        `)
        .order('due_date', { ascending: true })

      if (error) throw error
      return data as OnboardingTask[]
    },
    enabled: canView('employees')
  })

  // Job posting mutations
  const createJobMutation = useMutation({
    mutationFn: async (jobData: typeof jobForm) => {
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          title: jobData.title,
          department: jobData.department,
          location: jobData.location,
          employment_type: jobData.employment_type,
          description: jobData.description,
          requirements: jobData.requirements.split('\n').filter((r: string) => r.trim()),
          benefits: jobData.benefits.split('\n').filter((b: string) => b.trim()),
          salary_min: jobData.salary_min ? parseFloat(jobData.salary_min) : null,
          salary_max: jobData.salary_max ? parseFloat(jobData.salary_max) : null,
          status: jobData.status,
          posted_date: new Date().toISOString(),
          created_by: profile?.employee_id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] })
      setOpenJobDialog(false)
      resetJobForm()
      toast.success('Job posting created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create job posting')
    }
  })

  const updateJobMutation = useMutation({
    mutationFn: async (jobData: typeof jobForm) => {
      const { data, error } = await supabase
        .from('job_postings')
        .update({
          title: jobData.title,
          department: jobData.department,
          location: jobData.location,
          employment_type: jobData.employment_type,
          description: jobData.description,
          requirements: jobData.requirements.split('\n').filter((r: string) => r.trim()),
          benefits: jobData.benefits.split('\n').filter((b: string) => b.trim()),
          salary_min: jobData.salary_min ? parseFloat(jobData.salary_min) : null,
          salary_max: jobData.salary_max ? parseFloat(jobData.salary_max) : null,
          status: jobData.status
        })
        .eq('id', jobData.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] })
      setOpenJobDialog(false)
      setEditingJob(null)
      resetJobForm()
      toast.success('Job posting updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update job posting')
    }
  })

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] })
      toast.success('Job posting deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete job posting')
    }
  })

  // Application mutations
  const createApplicationMutation = useMutation({
    mutationFn: async (appData: typeof applicationForm) => {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_posting_id: appData.job_posting_id,
          candidate_name: appData.candidate_name,
          candidate_email: appData.candidate_email,
          candidate_phone: appData.candidate_phone || null,
          resume_url: appData.resume_url || null,
          cover_letter: appData.cover_letter || null,
          status: appData.status,
          applied_date: new Date().toISOString(),
          notes: appData.notes || null
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
      setOpenApplicationDialog(false)
      resetApplicationForm()
      toast.success('Application created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create application')
    }
  })

  const updateApplicationMutation = useMutation({
    mutationFn: async (appData: typeof applicationForm) => {
      const updateData: any = {
        candidate_name: appData.candidate_name,
        candidate_email: appData.candidate_email,
        candidate_phone: appData.candidate_phone || null,
        resume_url: appData.resume_url || null,
        cover_letter: appData.cover_letter || null,
        status: appData.status,
        notes: appData.notes || null
      }

      const { data, error } = await supabase
        .from('job_applications')
        .update(updateData)
        .eq('id', appData.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
      setOpenApplicationDialog(false)
      setEditingApplication(null)
      resetApplicationForm()
      toast.success('Application updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update application')
    }
  })

  const deleteApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
      toast.success('Application deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete application')
    }
  })

  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string, status: string, notes?: string }) => {
      const updateData: { status: string; notes?: string } = { status }
      if (notes) updateData.notes = notes

      const { data, error } = await supabase
        .from('job_applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
      toast.success('Application status updated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update application')
    }
  })

  // Helper functions
  const resetJobForm = () => {
    setJobForm({
      id: '',
      title: '',
      department: '',
      location: '',
      employment_type: 'full_time',
      description: '',
      requirements: '',
      benefits: '',
      salary_min: '',
      salary_max: '',
      status: 'draft'
    })
  }

  const resetApplicationForm = () => {
    setApplicationForm({
      id: '',
      job_posting_id: '',
      candidate_name: '',
      candidate_email: '',
      candidate_phone: '',
      resume_url: '',
      cover_letter: '',
      experience_years: '',
      current_salary: '',
      expected_salary: '',
      status: 'applied',
      notes: '',
      rating: 0
    })
  }

  const handleCreateJob = () => {
    if (!jobForm.title || !jobForm.department || !jobForm.description) {
      toast.error('Please fill in all required fields')
      return
    }
    createJobMutation.mutate(jobForm)
  }

  const handleUpdateJob = () => {
    if (!jobForm.title || !jobForm.department || !jobForm.description) {
      toast.error('Please fill in all required fields')
      return
    }
    updateJobMutation.mutate(jobForm)
  }

  const handleEditJob = (job: JobPosting) => {
    setJobForm({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      employment_type: job.employment_type,
      description: job.description,
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements,
      benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits || '',
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      status: job.status
    })
    setEditingJob(job)
    setOpenJobDialog(true)
  }

  const handleCreateApplication = () => {
    if (!applicationForm.candidate_name || !applicationForm.candidate_email || !applicationForm.job_posting_id) {
      toast.error('Please fill in all required fields')
      return
    }
    createApplicationMutation.mutate(applicationForm)
  }

  const handleUpdateApplication = () => {
    if (!applicationForm.candidate_name || !applicationForm.candidate_email) {
      toast.error('Please fill in all required fields')
      return
    }
    updateApplicationMutation.mutate(applicationForm)
  }

  const handleEditApplication = (application: JobApplication) => {
    setApplicationForm({
      id: application.id,
      job_posting_id: application.job_posting_id,
      candidate_name: application.candidate_name,
      candidate_email: application.candidate_email,
      candidate_phone: application.candidate_phone || '',
      resume_url: application.resume_url || '',
      cover_letter: application.cover_letter || '',
      experience_years: '',
      current_salary: '',
      expected_salary: '',
      status: application.status,
      notes: application.notes || '',
      rating: 0
    })
    setEditingApplication(application)
    setOpenApplicationDialog(true)
  }

  // Get status colors
  const getJobStatusColor = (status: string) => {
    const statusConfig = HIRING_CONFIG.jobPosting.statuses.find(s => s.value === status)
    return statusConfig?.color || 'default'
  }

  const getStatusColor = (status: string) => {
    const statusConfig = APPLICATION_STATUSES.find(s => s.value === status)
    switch (status) {
      case 'applied': return 'info'
      case 'screening': return 'warning'
      case 'interview': return 'primary'
      case 'offer': return 'success'
      case 'hired': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  // Filter jobs and applications based on search and filters
  const filteredJobs = useMemo(() => {
    if (!jobPostings) return []
    
    return jobPostings.filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || job.status === filterStatus
      const matchesDepartment = filterDepartment === 'all' || job.department === filterDepartment
      
      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [jobPostings, searchTerm, filterStatus, filterDepartment])

  const filteredApplications = useMemo(() => {
    if (!applications) return []
    
    return applications.filter(app => {
      const matchesSearch = !searchTerm || 
        app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job_posting?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
  }, [applications, searchTerm])

  if (!canView('employees')) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="warning">
          You don't have permission to view hiring management.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Hiring Management
        </Typography>
        <Box display="flex" gap={2}>
          {canEdit('employees') && (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetJobForm()
                  setEditingJob(null)
                  setOpenJobDialog(true)
                }}
              >
                Create Job Posting
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetApplicationForm()
                  setEditingApplication(null)
                  setOpenApplicationDialog(true)
                }}
              >
                Add Application
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            startIcon={<AIIcon />}
            onClick={() => setShowAIAnalyzer(true)}
          >
            AI Resume Analyzer
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              size="small"
              placeholder="Search jobs or candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                {HIRING_CONFIG.jobPosting.statuses.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                {HIRING_CONFIG.filters.jobPosting.find(f => f.key === 'department')?.options
                  .filter(opt => opt !== 'all')
                  .map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label={`Job Postings (${filteredJobs?.length || 0})`} />
            <Tab label={`Applications (${filteredApplications?.length || 0})`} />
            <Tab label="Onboarding" />
          </Tabs>

          {/* Job Postings Tab */}
          {tabValue === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Applications</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Posted Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredJobs?.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {job.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={EMPLOYMENT_TYPES.find(t => t.value === job.employment_type)?.label}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.applications_count || 0}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.status.replace('_', ' ').toUpperCase()}
                          color={getJobStatusColor(job.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{format(parseISO(job.posted_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => setSelectedJob(job)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {canEdit('employees') && (
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditJob(job)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canDelete('employees') && (
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this job posting?')) {
                                    deleteJobMutation.mutate(job.id)
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Applications Tab */}
          {tabValue === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Candidate</TableCell>
                    <TableCell>Job Position</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Applied Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications?.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {application.candidate_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {application.candidate_email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{application.job_posting?.title}</TableCell>
                      <TableCell>{application.job_posting?.department}</TableCell>
                      <TableCell>{format(parseISO(application.applied_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Chip
                          label={APPLICATION_STATUSES.find(s => s.value === application.status)?.label}
                          color={getStatusColor(application.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Application">
                            <IconButton size="small" onClick={() => setSelectedApplication(application)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {canEdit('employees') && (
                            <>
                              <Tooltip title="Edit Application">
                                <IconButton size="small" onClick={() => handleEditApplication(application)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Schedule Interview">
                                <IconButton size="small" color="primary">
                                  <ScheduleIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => updateApplicationStatusMutation.mutate({
                                    id: application.id,
                                    status: 'offer'
                                  })}
                                >
                                  <CheckIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => updateApplicationStatusMutation.mutate({
                                    id: application.id,
                                    status: 'rejected'
                                  })}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {canDelete('employees') && (
                            <Tooltip title="Delete Application">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this application?')) {
                                    deleteApplicationMutation.mutate(application.id)
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Onboarding Tab */}
          {tabValue === 2 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                <Typography variant="h6" mb={2}>Onboarding Progress</Typography>
                <Stepper orientation="vertical">
                  {ONBOARDING_STEPS.map((step, index) => (
                    <Step key={step} active={index <= 2}>
                      <StepLabel>{step}</StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          Complete {step.toLowerCase()} for new hires
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Box>
              
              <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" mb={2}>Recent Hires</Typography>
                    <Typography variant="body2" color="text.secondary">
                      No recent hires to onboard
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Job Posting Dialog */}
      <Dialog
        open={openJobDialog}
        onClose={() => {
          setOpenJobDialog(false)
          setEditingJob(null)
          resetJobForm()
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingJob ? 'Edit Job Posting' : 'Create Job Posting'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: '200px' }}
                label="Job Title"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
              <FormControl sx={{ flex: 1, minWidth: '200px' }} required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={jobForm.department}
                  onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                  label="Department"
                >
                  {HIRING_CONFIG.jobPosting.fields.find(f => f.key === 'department')?.options?.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: '200px' }}
                label="Location"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                required
              />
              <FormControl sx={{ flex: 1, minWidth: '200px' }} required>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={jobForm.employment_type}
                  onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value as any })}
                  label="Employment Type"
                >
                  {EMPLOYMENT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: '200px' }}
                type="number"
                label="Minimum Salary"
                value={jobForm.salary_min}
                onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })}
              />
              <TextField
                sx={{ flex: 1, minWidth: '200px' }}
                type="number"
                label="Maximum Salary"
                value={jobForm.salary_max}
                onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })}
              />
            </Box>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={jobForm.status}
                onChange={(e) => setJobForm({ ...jobForm, status: e.target.value as any })}
                label="Status"
              >
                {HIRING_CONFIG.jobPosting.statuses.map(status => (
                  <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Job Description"
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Requirements (one per line)"
              value={jobForm.requirements}
              onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
              placeholder="Bachelor's degree in relevant field\n3+ years experience\nProficiency in relevant technologies"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Benefits (one per line)"
              value={jobForm.benefits}
              onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
              placeholder="Health insurance\nRetirement plan\nFlexible working hours"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenJobDialog(false)
            setEditingJob(null)
            resetJobForm()
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={editingJob ? handleUpdateJob : handleCreateJob}
            disabled={createJobMutation.isPending || updateJobMutation.isPending}
          >
            {editingJob ? 'Update Job Posting' : 'Create Job Posting'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Application Dialog */}
      <Dialog
        open={openApplicationDialog}
        onClose={() => {
          setOpenApplicationDialog(false)
          setEditingApplication(null)
          resetApplicationForm()
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingApplication ? 'Edit Application' : 'Add Application'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: '200px' }}
                label="Candidate Name"
                value={applicationForm.candidate_name}
                onChange={(e) => setApplicationForm({ ...applicationForm, candidate_name: e.target.value })}
                required
              />
              <TextField
                sx={{ flex: 1, minWidth: '200px' }}
                type="email"
                label="Email"
                value={applicationForm.candidate_email}
                onChange={(e) => setApplicationForm({ ...applicationForm, candidate_email: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: '200px' }}
                type="tel"
                label="Phone"
                value={applicationForm.candidate_phone}
                onChange={(e) => setApplicationForm({ ...applicationForm, candidate_phone: e.target.value })}
              />
              <FormControl sx={{ flex: 1, minWidth: '200px' }} required>
                <InputLabel>Job Position</InputLabel>
                <Select
                  value={applicationForm.job_posting_id}
                  onChange={(e) => setApplicationForm({ ...applicationForm, job_posting_id: e.target.value })}
                  label="Job Position"
                >
                  {jobPostings?.map(job => (
                    <MenuItem key={job.id} value={job.id}>
                      {job.title} - {job.department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: '200px' }}
                type="url"
                label="Resume URL"
                value={applicationForm.resume_url}
                onChange={(e) => setApplicationForm({ ...applicationForm, resume_url: e.target.value })}
              />
              <FormControl sx={{ flex: 1, minWidth: '200px' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={applicationForm.status}
                  onChange={(e) => setApplicationForm({ ...applicationForm, status: e.target.value as any })}
                  label="Status"
                >
                  {APPLICATION_STATUSES.map(status => (
                    <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Cover Letter"
              value={applicationForm.cover_letter}
              onChange={(e) => setApplicationForm({ ...applicationForm, cover_letter: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={applicationForm.notes}
              onChange={(e) => setApplicationForm({ ...applicationForm, notes: e.target.value })}
              placeholder="Interview feedback, additional comments..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenApplicationDialog(false)
            setEditingApplication(null)
            resetApplicationForm()
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={editingApplication ? handleUpdateApplication : handleCreateApplication}
            disabled={createApplicationMutation.isPending || updateApplicationMutation.isPending}
          >
            {editingApplication ? 'Update Application' : 'Add Application'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Resume Analyzer */}
      {showAIAnalyzer && (
        <AIResumeAnalyzer
          open={showAIAnalyzer}
          onClose={() => setShowAIAnalyzer(false)}
        />
      )}

      {/* Job Details Dialog */}
      <Dialog
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="between" alignItems="center">
            <Typography variant="h6">{selectedJob?.title}</Typography>
            <IconButton onClick={() => setSelectedJob(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip icon={<BusinessIcon />} label={selectedJob.department} />
                <Chip icon={<LocationIcon />} label={selectedJob.location} />
                <Chip 
                  icon={<WorkIcon />} 
                  label={EMPLOYMENT_TYPES.find(t => t.value === selectedJob.employment_type)?.label}
                />
                <Chip 
                  label={selectedJob.status.replace('_', ' ').toUpperCase()}
                  color={getJobStatusColor(selectedJob.status) as any}
                />
              </Box>
              
              {(selectedJob.salary_min || selectedJob.salary_max) && (
                <Box display="flex" alignItems="center" gap={1}>
                  <SalaryIcon color="action" />
                  <Typography>
                    {selectedJob.salary_min && selectedJob.salary_max
                      ? `$${selectedJob.salary_min.toLocaleString()} - $${selectedJob.salary_max.toLocaleString()}`
                      : selectedJob.salary_min
                      ? `From $${selectedJob.salary_min.toLocaleString()}`
                      : `Up to $${selectedJob.salary_max?.toLocaleString()}`
                    }
                  </Typography>
                </Box>
              )}
              
              <Box>
                <Typography variant="h6" gutterBottom>Description</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedJob.description}
                </Typography>
              </Box>
              
              {selectedJob.requirements && (
                <Box>
                  <Typography variant="h6" gutterBottom>Requirements</Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {(Array.isArray(selectedJob.requirements) 
                      ? selectedJob.requirements 
                      : selectedJob.requirements.split('\n')
                    ).map((req, index) => (
                      <Typography key={index} component="li" variant="body2">
                        {req}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
              
              {selectedJob.benefits && (
                <Box>
                  <Typography variant="h6" gutterBottom>Benefits</Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {(Array.isArray(selectedJob.benefits) 
                      ? selectedJob.benefits 
                      : selectedJob.benefits.split('\n')
                    ).map((benefit, index) => (
                      <Typography key={index} component="li" variant="body2">
                        {benefit}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Posted on {format(parseISO(selectedJob.posted_date), 'MMMM dd, yyyy')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Details Dialog */}
      <Dialog
        open={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="between" alignItems="center">
            <Typography variant="h6">Application Details</Typography>
            <IconButton onClick={() => setSelectedApplication(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedApplication.candidate_name}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {selectedApplication.candidate_email}
                    </Typography>
                  </Box>
                  {selectedApplication.candidate_phone && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {selectedApplication.candidate_phone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip 
                  icon={<WorkIcon />} 
                  label={selectedApplication.job_posting?.title}
                />
                <Chip 
                  icon={<BusinessIcon />} 
                  label={selectedApplication.job_posting?.department}
                />
                <Chip 
                  label={APPLICATION_STATUSES.find(s => s.value === selectedApplication.status)?.label}
                  color={getStatusColor(selectedApplication.status) as any}
                />
              </Box>
              
              {selectedApplication.resume_url && (
                <Box>
                  <Typography variant="h6" gutterBottom>Resume</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    href={selectedApplication.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Resume
                  </Button>
                </Box>
              )}
              
              {selectedApplication.cover_letter && (
                <Box>
                  <Typography variant="h6" gutterBottom>Cover Letter</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedApplication.cover_letter}
                  </Typography>
                </Box>
              )}
              
              {selectedApplication.notes && (
                <Box>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedApplication.notes}
                  </Typography>
                </Box>
              )}
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Applied on {format(parseISO(selectedApplication.applied_date), 'MMMM dd, yyyy')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default HiringManagement
