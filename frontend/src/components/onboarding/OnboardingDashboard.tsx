'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Paper,
  LinearProgress,
  useTheme,
  alpha,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  Checkbox,
  FormControlLabel,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material'
// Mock Timeline components - replace with @mui/lab imports if available
const Timeline = ({ children, ...props }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }} {...props}>
    {children}
  </Box>
)

const TimelineItem = ({ children, ...props }: any) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minHeight: 70 }} {...props}>
    {children}
  </Box>
)

const TimelineSeparator = ({ children, ...props }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }} {...props}>
    {children}
  </Box>
)

const TimelineConnector = ({ ...props }: any) => (
  <Box 
    sx={{ 
      width: 2, 
      height: 30, 
      bgcolor: 'divider',
      borderRadius: 1
    }} 
    {...props} 
  />
)

const TimelineContent = ({ children, ...props }: any) => (
  <Box sx={{ flex: 1, pt: 0.5 }} {...props}>
    {children}
  </Box>
)

const TimelineDot = ({ children, color = 'primary', ...props }: any) => (
  <Avatar 
    sx={{ 
      width: 32, 
      height: 32, 
      bgcolor: `${color}.main`,
      fontSize: '0.875rem'
    }} 
    {...props}
  >
    {children}
  </Avatar>
)

const TimelineOppositeContent = ({ children, ...props }: any) => (
  <Box sx={{ flex: 0.3, pt: 0.5, pr: 2, textAlign: 'right' }} {...props}>
    {children}
  </Box>
)

import {
  PersonAdd,
  Assignment,
  CheckCircle,
  Schedule,
  Group,
  Business,
  School,
  Security,
  Computer,
  Badge as BadgeIcon,
  Key,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Notifications,
  Settings,
  Edit,
  Delete,
  Visibility,
  Add,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Download,
  Upload,
  Share,
  MoreVert,
  Close,
  Warning,
  Info,
  Error,
  AccessTime,
  TrendingUp,
  Timeline as TimelineIcon,
  TaskAlt,
  AdminPanelSettings,
  Work,
  Home,
  DirectionsCar,
  CreditCard,
  HealthAndSafety,
  MenuBook,
  Gavel,
  HelpOutline,
  Launch,
  Done,
  DoneAll,
  Cancel,
  ExpandMore,
  PersonOff,
  ExitToApp,
  FolderOpen,
  DocumentScanner,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { MetricCard } from '../common/MetricCard'
import { StatusChip } from '../common/StatusChip'
import { NumberTicker } from '../common/NumberTicker'

// Types
interface OnboardingProcess {
  id: string
  employeeId: string
  employee: {
    id: string
    name: string
    email: string
    avatar?: string
    position: string
    department: string
    manager: string
    startDate: string
    employeeType: 'full_time' | 'part_time' | 'contractor' | 'intern'
  }
  type: 'onboarding' | 'offboarding'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  progress: number
  startedAt: string
  completedAt?: string
  dueDate: string
  assignedTo: {
    id: string
    name: string
    role: string
  }
  template: string
  tasks: OnboardingTask[]
  documents: ProcessDocument[]
  notes: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface OnboardingTask {
  id: string
  title: string
  description: string
  category: 'documentation' | 'it_setup' | 'training' | 'orientation' | 'compliance' | 'benefits' | 'workspace'
  assignedTo: {
    id: string
    name: string
    department: string
  }
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string
  completedAt?: string
  estimatedTime: number // in hours
  actualTime?: number
  dependencies: string[]
  instructions?: string
  resources?: TaskResource[]
  checklist?: ChecklistItem[]
  comments: TaskComment[]
}

interface TaskResource {
  id: string
  title: string
  type: 'document' | 'link' | 'video' | 'form'
  url: string
  description?: string
}

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  required: boolean
}

interface TaskComment {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  content: string
  createdAt: string
}

interface ProcessDocument {
  id: string
  title: string
  type: 'contract' | 'handbook' | 'policy' | 'form' | 'id_document' | 'certificate'
  status: 'pending' | 'uploaded' | 'reviewed' | 'approved' | 'rejected'
  uploadedAt?: string
  reviewedBy?: {
    id: string
    name: string
    reviewedAt: string
  }
  required: boolean
  url?: string
}

interface OnboardingTemplate {
  id: string
  name: string
  description: string
  type: 'onboarding' | 'offboarding'
  department?: string
  position?: string
  employeeType?: string
  duration: number // in days
  tasks: Omit<OnboardingTask, 'id' | 'assignedTo' | 'status' | 'completedAt' | 'actualTime' | 'comments'>[]
  isDefault: boolean
  createdBy: string
  createdAt: string
}

interface OnboardingStats {
  totalProcesses: number
  activeProcesses: number
  completedThisMonth: number
  averageCompletionTime: number
  onTimeCompletionRate: number
  pendingTasks: number
  overdueProcesses: number
  templateUsage: Record<string, number>
}

const OnboardingDashboard: React.FC = () => {
  const { profile } = useAuth()
  const theme = useTheme()

  // State
  const [activeTab, setActiveTab] = useState(0)
  const [processes, setProcesses] = useState<OnboardingProcess[]>([])
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([])
  const [selectedProcess, setSelectedProcess] = useState<OnboardingProcess | null>(null)
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false)
  const [onboardingForm, setOnboardingForm] = useState({
    employeeName: '',
    department: '',
    position: '',
    startDate: '',
    onboardingType: 'new_hire'
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OnboardingStats>({
    totalProcesses: 0,
    activeProcesses: 0,
    completedThisMonth: 0,
    averageCompletionTime: 0,
    onTimeCompletionRate: 0,
    pendingTasks: 0,
    overdueProcesses: 0,
    templateUsage: {},
  })
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    department: 'all',
    assignee: 'all',
    search: '',
  })

  // Load real data
  useEffect(() => {
    loadOnboardingData()
  }, [])

  const loadOnboardingData = async () => {
    try {
      // Import the real data service
      const { default: RealDataService } = await import('../../services/realDataService')

      // Fetch real onboarding data
      const [processesResult, statsData] = await Promise.all([
        RealDataService.getOnboardingProcesses({}),
        RealDataService.getOnboardingStats()
      ])

      setProcesses(processesResult.data)
      setStats(statsData)

      // For now, use demo data for templates until implemented
      loadDemoDataFallback()
    } catch (error) {
      // Fallback to demo data
      loadDemoDataFallback()
    }
  }

  const loadDemoDataFallback = () => {
    const demoProcesses: OnboardingProcess[] = [
      {
        id: 'proc1',
        employeeId: 'emp1',
        employee: {
          id: 'emp1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          avatar: '',
          position: 'Senior Software Engineer',
          department: 'Engineering',
          manager: 'Alex Thompson',
          startDate: '2024-02-01',
          employeeType: 'full_time'
        },
        type: 'onboarding',
        status: 'in_progress',
        progress: 65,
        startedAt: '2024-01-15T00:00:00Z',
        dueDate: '2024-02-15T00:00:00Z',
        assignedTo: {
          id: 'hr1',
          name: 'Maria Garcia',
          role: 'HR Specialist'
        },
        template: 'Engineering Onboarding',
        tasks: [
          {
            id: 'task1',
            title: 'Complete I-9 Form',
            description: 'Employee must complete and submit I-9 employment eligibility verification form',
            category: 'documentation',
            assignedTo: {
              id: 'hr1',
              name: 'Maria Garcia',
              department: 'HR'
            },
            status: 'completed',
            priority: 'high',
            dueDate: '2024-01-20T00:00:00Z',
            completedAt: '2024-01-18T10:30:00Z',
            estimatedTime: 1,
            actualTime: 0.5,
            dependencies: [],
            instructions: 'Provide clear instructions on completing the I-9 form and required documentation',
            resources: [
              {
                id: 'res1',
                title: 'I-9 Form Template',
                type: 'document',
                url: '/forms/i9-form.pdf',
                description: 'Official I-9 employment eligibility verification form'
              }
            ],
            checklist: [
              { id: 'check1', title: 'Form completed accurately', completed: true, required: true },
              { id: 'check2', title: 'Supporting documents provided', completed: true, required: true },
              { id: 'check3', title: 'HR verification completed', completed: true, required: true }
            ],
            comments: []
          },
          {
            id: 'task2',
            title: 'IT Equipment Setup',
            description: 'Provision laptop, phone, and necessary software access',
            category: 'it_setup',
            assignedTo: {
              id: 'it1',
              name: 'David Park',
              department: 'IT'
            },
            status: 'in_progress',
            priority: 'high',
            dueDate: '2024-01-25T00:00:00Z',
            estimatedTime: 4,
            dependencies: ['task1'],
            instructions: 'Setup standard engineering workstation with development tools',
            resources: [
              {
                id: 'res2',
                title: 'IT Setup Checklist',
                type: 'document',
                url: '/checklists/it-setup.pdf'
              }
            ],
            checklist: [
              { id: 'check4', title: 'Laptop configured', completed: true, required: true },
              { id: 'check5', title: 'Software installed', completed: false, required: true },
              { id: 'check6', title: 'Access permissions granted', completed: false, required: true }
            ],
            comments: [
              {
                id: 'comment1',
                author: { id: 'it1', name: 'David Park' },
                content: 'Laptop has been configured and delivered. Working on software installation.',
                createdAt: '2024-01-20T14:30:00Z'
              }
            ]
          },
          {
            id: 'task3',
            title: 'Engineering Orientation',
            description: 'Introduction to engineering team, processes, and tools',
            category: 'orientation',
            assignedTo: {
              id: 'mgr1',
              name: 'Alex Thompson',
              department: 'Engineering'
            },
            status: 'pending',
            priority: 'medium',
            dueDate: '2024-02-01T00:00:00Z',
            estimatedTime: 6,
            dependencies: ['task2'],
            instructions: 'Comprehensive introduction to engineering practices and team structure',
            resources: [
              {
                id: 'res3',
                title: 'Engineering Handbook',
                type: 'document',
                url: '/handbooks/engineering.pdf'
              },
              {
                id: 'res4',
                title: 'Team Introduction Video',
                type: 'video',
                url: '/videos/team-intro.mp4'
              }
            ],
            checklist: [
              { id: 'check7', title: 'Meet team members', completed: false, required: true },
              { id: 'check8', title: 'Review development processes', completed: false, required: true },
              { id: 'check9', title: 'Setup development environment', completed: false, required: true }
            ],
            comments: []
          }
        ],
        documents: [
          {
            id: 'doc1',
            title: 'Employment Contract',
            type: 'contract',
            status: 'approved',
            uploadedAt: '2024-01-16T00:00:00Z',
            reviewedBy: {
              id: 'hr1',
              name: 'Maria Garcia',
              reviewedAt: '2024-01-17T00:00:00Z'
            },
            required: true,
            url: '/documents/contract-sarah-johnson.pdf'
          },
          {
            id: 'doc2',
            title: 'Employee Handbook Acknowledgment',
            type: 'form',
            status: 'pending',
            required: true
          }
        ],
        notes: [
          'Employee has prior experience with React and TypeScript',
          'Requested flexible work schedule - approved by manager'
        ],
        priority: 'high'
      },
      {
        id: 'proc2',
        employeeId: 'emp2',
        employee: {
          id: 'emp2',
          name: 'Mike Chen',
          email: 'mike.chen@company.com',
          position: 'Marketing Manager',
          department: 'Marketing',
          manager: 'Lisa Wong',
          startDate: '2024-01-15',
          employeeType: 'full_time'
        },
        type: 'offboarding',
        status: 'in_progress',
        progress: 40,
        startedAt: '2024-01-10T00:00:00Z',
        dueDate: '2024-01-30T00:00:00Z',
        assignedTo: {
          id: 'hr2',
          name: 'Jennifer Lee',
          role: 'HR Manager'
        },
        template: 'Standard Offboarding',
        tasks: [
          {
            id: 'task4',
            title: 'Knowledge Transfer Session',
            description: 'Transfer ongoing projects and responsibilities',
            category: 'documentation',
            assignedTo: {
              id: 'mgr2',
              name: 'Lisa Wong',
              department: 'Marketing'
            },
            status: 'completed',
            priority: 'high',
            dueDate: '2024-01-15T00:00:00Z',
            completedAt: '2024-01-14T16:00:00Z',
            estimatedTime: 8,
            actualTime: 6,
            dependencies: [],
            comments: []
          },
          {
            id: 'task5',
            title: 'Return Company Equipment',
            description: 'Collect laptop, phone, badge, and other company property',
            category: 'it_setup',
            assignedTo: {
              id: 'it2',
              name: 'Security Team',
              department: 'IT'
            },
            status: 'in_progress',
            priority: 'medium',
            dueDate: '2024-01-25T00:00:00Z',
            estimatedTime: 2,
            dependencies: [],
            comments: []
          }
        ],
        documents: [
          {
            id: 'doc3',
            title: 'Exit Interview Form',
            type: 'form',
            status: 'pending',
            required: true
          }
        ],
        notes: [
          'Resignation effective January 30, 2024',
          'Accepted position at competitor - ensure NDA compliance'
        ],
        priority: 'medium'
      }
    ]

    const demoTemplates: OnboardingTemplate[] = [
      {
        id: 'template1',
        name: 'Engineering Onboarding',
        description: 'Comprehensive onboarding process for engineering roles',
        type: 'onboarding',
        department: 'Engineering',
        duration: 30,
        tasks: [],
        isDefault: true,
        createdBy: 'hr1',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'template2',
        name: 'Standard Offboarding',
        description: 'Standard offboarding process for all employees',
        type: 'offboarding',
        duration: 14,
        tasks: [],
        isDefault: true,
        createdBy: 'hr1',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]

    const demoStats: OnboardingStats = {
      totalProcesses: demoProcesses.length,
      activeProcesses: demoProcesses.filter(p => p.status === 'in_progress').length,
      completedThisMonth: 5,
      averageCompletionTime: 18.5,
      onTimeCompletionRate: 85.7,
      pendingTasks: demoProcesses.reduce((sum, p) => sum + (p.tasks?.filter(t => t.status === 'pending').length || 0), 0),
      overdueProcesses: 1,
      templateUsage: {
        'Engineering Onboarding': 12,
        'Marketing Onboarding': 8,
        'Standard Offboarding': 6
      }
    }

    // Only set demo data for items not handled above
    setTemplates(demoTemplates)
    if (!stats) {
      setStats(demoStats)
    }
    setLoading(false)
  }

  // Filter processes
  const filteredProcesses = useMemo(() => {
    return processes.filter(process => {
      if (filters.status !== 'all' && process.status !== filters.status) return false
      if (filters.type !== 'all' && process.type !== filters.type) return false
      if (filters.department !== 'all' && process.employee.department !== filters.department) return false
      if (filters.search && !process.employee.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !process.employee.email.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [processes, filters])

  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'documentation': return <Assignment />
      case 'it_setup': return <Computer />
      case 'training': return <School />
      case 'orientation': return <Group />
      case 'compliance': return <Gavel />
      case 'benefits': return <HealthAndSafety />
      case 'workspace': return <Business />
      default: return <TaskAlt />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'primary'
      case 'pending': return 'warning'
      case 'blocked': return 'error'
      case 'cancelled': return 'default'
      default: return 'default'
    }
  }

  const ProcessCard: React.FC<{ process: OnboardingProcess }> = ({ process }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
        }}
        onClick={() => {
          setSelectedProcess(process)
          setShowProcessDialog(true)
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Header */}
            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <Avatar
                src={process.employee.avatar}
                sx={{ width: 48, height: 48 }}
              >
                {process.employee.name[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {process.employee.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {process.employee.position} • {process.employee.department}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <StatusChip status={process.status as any} size="sm" />
                  <Chip
                    label={process.type}
                    size="small"
                    color={process.type === 'onboarding' ? 'success' : 'warning'}
                    variant="outlined"
                  />
                  {process.priority === 'high' && (
                    <Chip label="High Priority" size="small" color="error" />
                  )}
                </Stack>
              </Box>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Stack>

            {/* Progress */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {process.progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={process.progress}
                sx={{ height: 8, borderRadius: 4 }}
                color={process.progress === 100 ? 'success' : 'primary'}
              />
            </Box>

            {/* Tasks summary */}
            <Stack direction="row" spacing={2}>
              <Stack alignItems="center">
                <Typography variant="h6" color="primary.main">
                  {process.tasks?.filter(t => t.status === 'completed').length || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
              </Stack>
              <Stack alignItems="center">
                <Typography variant="h6" color="warning.main">
                  {process.tasks?.filter(t => t.status === 'in_progress').length || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  In Progress
                </Typography>
              </Stack>
              <Stack alignItems="center">
                <Typography variant="h6" color="text.secondary">
                  {process.tasks?.filter(t => t.status === 'pending').length || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending
                </Typography>
              </Stack>
            </Stack>

            {/* Timeline */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  {process.type === 'onboarding' ? 'Start Date' : 'Last Day'}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Date(process.employee.startDate).toLocaleDateString()}
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Date(process.dueDate).toLocaleDateString()}
                </Typography>
              </Stack>
            </Stack>

            {/* Assigned to */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <AdminPanelSettings fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Assigned to: {process.assignedTo.name}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  )

  const TaskTimeline: React.FC<{ tasks: OnboardingTask[] }> = ({ tasks }) => (
    <Timeline>
      {tasks.map((task, index) => (
        <TimelineItem key={task.id}>
          <TimelineOppositeContent sx={{ m: 'auto 0' }} align="right" variant="body2" color="text.secondary">
            {new Date(task.dueDate).toLocaleDateString()}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot color={getStatusColor(task.status) as any}>
              {getTaskIcon(task.category)}
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {task.description}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <StatusChip status={task.status as any} size="xs" />
              <Chip
                label={task.assignedTo.name}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.675rem' }}
              />
            </Stack>
            {task.checklist && (
              <Box sx={{ mt: 1 }}>
                {task.checklist.map((item) => (
                  <FormControlLabel
                    key={item.id}
                    control={<Checkbox checked={item.completed} size="small" />}
                    label={<Typography variant="caption">{item.title}</Typography>}
                    sx={{ display: 'block', ml: 0 }}
                  />
                ))}
              </Box>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )

  return (
    <Box sx={{ p: 3 }} className="container-fluid px-2 px-md-3 px-lg-4">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Onboarding & Offboarding
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Streamline employee transitions with structured workflows
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Settings />}>
            Templates
          </Button>
          <Button variant="contained" startIcon={<PersonAdd />}>
            New Process
          </Button>
        </Stack>
      </Stack>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <MetricCard
            title="Active Processes"
            value={<NumberTicker value={stats.activeProcesses} />}
            icon={<PersonAdd />}
            color="primary"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <MetricCard
            title="Completion Rate"
            value={<NumberTicker value={stats.onTimeCompletionRate} formatValue={(v) => `${v.toFixed(1)}%`} />}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <MetricCard
            title="Avg Time (Days)"
            value={<NumberTicker value={stats.averageCompletionTime} formatValue={(v) => v.toFixed(1)} />}
            icon={<AccessTime />}
            color="info"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <MetricCard
            title="Pending Tasks"
            value={<NumberTicker value={stats.pendingTasks} />}
            icon={<Assignment />}
            color="warning"
          />
        </Grid>
      </Grid>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="All Processes" />
        <Tab label="Onboarding" />
        <Tab label="Offboarding" />
        <Tab label="Templates" />
        <Tab label="Analytics" />
      </Tabs>
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <TextField
              fullWidth
              placeholder="Search employees..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              size="small"
            />
          </Grid>
          <Grid
            size={{
              xs: 6,
              md: 2
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 6,
              md: 2
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="onboarding">Onboarding</MenuItem>
                <MenuItem value="offboarding">Offboarding</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 6,
              md: 2
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 6,
              md: 3
            }}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Refresh />} size="small">
                Refresh
              </Button>
              <Button variant="outlined" startIcon={<Download />} size="small">
                Export
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      {/* Process Cards */}
      <Grid container spacing={3}>
        {filteredProcesses.map((process) => (
          <Grid
            key={process.id}
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <ProcessCard process={process} />
          </Grid>
        ))}
      </Grid>
      {/* Process Detail Dialog */}
      <Dialog
        open={showProcessDialog}
        onClose={() => setShowProcessDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedProcess && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar src={selectedProcess.employee.avatar} sx={{ width: 40, height: 40 }}>
                    {selectedProcess.employee.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedProcess.employee.name} - {selectedProcess.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedProcess.employee.position} • {selectedProcess.employee.department}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setShowProcessDialog(false)}>
                  <Close />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    xs: 12,
                    md: 4
                  }}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Process Overview
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={selectedProcess.progress}
                          sx={{ height: 8, borderRadius: 4, mt: 1 }}
                        />
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {selectedProcess.progress}% Complete
                        </Typography>
                      </Box>
                      <Divider />
                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>
                        <StatusChip status={selectedProcess.status as any} />
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          Assigned To
                        </Typography>
                        <Typography variant="body2">
                          {selectedProcess.assignedTo.name}
                        </Typography>
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          Due Date
                        </Typography>
                        <Typography variant="body2">
                          {new Date(selectedProcess.dueDate).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    md: 8
                  }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Task Timeline
                  </Typography>
                  <TaskTimeline tasks={selectedProcess.tasks} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowProcessDialog(false)}>
                Close
              </Button>
              <Button variant="outlined" startIcon={<Edit />}>
                Edit Process
              </Button>
              <Button variant="contained" startIcon={<PlayArrow />}>
                Resume
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Onboarding Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<PersonAdd />}
          tooltipTitle="New Onboarding"
          onClick={() => {
            setShowOnboardingDialog(true)
            setOnboardingForm({
              employeeName: '',
              department: '',
              position: '',
              startDate: '',
              onboardingType: 'new_hire'
            })
          }}
        />
        <SpeedDialAction
          icon={<PersonOff />}
          tooltipTitle="New Offboarding"
          onClick={() => {
            setShowOnboardingDialog(true)
            setOnboardingForm({
              employeeName: '',
              department: '',
              position: '',
              startDate: '',
              onboardingType: 'offboarding'
            })
          }}
        />
        <SpeedDialAction
          icon={<Settings />}
          tooltipTitle="Manage Templates"
          onClick={() => {
            toast.info('Template management coming soon!', {
              description: 'This feature will allow you to customize onboarding workflows'
            })
          }}
        />
      </SpeedDial>
    </Box>
  );
}

export default OnboardingDashboard
