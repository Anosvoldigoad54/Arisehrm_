'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
} from '@mui/material'
import {
  School,
  Assignment,
  EmojiEvents,
  PlayArrow,
  Pause,
  CheckCircle,
  AccessTime,
  Group,
  Person,
  Add,
  Edit,
  Delete,
  Download,
  Upload,
  Share,
  VideoLibrary,
  Article,
  Quiz,
  TrendingUp,
  Star,
  Bookmark,
  BookmarkBorder,
  Notifications,
  Analytics,
  WorkspacePremium as Certificate,
  WorkspacePremium,
  CalendarToday,
  LocationOn,
  ExpandMore,
  Close,
  Description,
  Refresh,
  FilterList,
  Search,
  Sort,
  MoreVert,
  CloudUpload,
  GetApp,
  Visibility,
  ThumbUp,
  Comment,
  Share as ShareIcon,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useResponsive } from '../../hooks/useResponsive'
import { MetricCard } from '../common/MetricCard'
import { StatusChip } from '../common/StatusChip'
import { NumberTicker } from '../common/NumberTicker'

// Types
interface Course {
  id: string
  title: string
  description: string
  instructor: {
    id: string
    name: string
    avatar?: string
    title: string
  }
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in hours
  format: 'online' | 'classroom' | 'hybrid' | 'self_paced'
  status: 'draft' | 'published' | 'archived'
  thumbnail?: string
  tags: string[]
  modules: CourseModule[]
  enrollments: number
  completions: number
  rating: number
  reviews: number
  price?: number
  isFree: boolean
  prerequisites?: string[]
  learningObjectives: string[]
  createdAt: string
  updatedAt: string
  isBookmarked?: boolean
}

interface CourseModule {
  id: string
  title: string
  description: string
  type: 'video' | 'article' | 'quiz' | 'assignment' | 'discussion'
  duration: number // in minutes
  content?: string
  videoUrl?: string
  quizQuestions?: QuizQuestion[]
  isCompleted?: boolean
  order: number
}

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correctAnswer: string | number
  explanation?: string
}

interface Enrollment {
  id: string
  courseId: string
  employeeId: string
  enrolledAt: string
  startedAt?: string
  completedAt?: string
  progress: number
  score?: number
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped'
  lastAccessed?: string
}

interface Certification {
  id: string
  name: string
  description: string
  issuer: string
  badgeImage?: string
  requirements: {
    courses: string[]
    minScore?: number
    expiresAfter?: number // months
  }
  earnedBy: number
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface TrainingStats {
  totalCourses: number
  activeCourses: number
  totalEnrollments: number
  completionRate: number
  averageScore: number
  totalHoursLearned: number
  certificationsEarned: number
  topPerformers: number
}

const TrainingDashboard: React.FC = () => {
  const { profile } = useAuth()
  const theme = useTheme()
  const responsive = useResponsive()
  
  // State
  const [activeTab, setActiveTab] = useState(0)
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [stats, setStats] = useState<TrainingStats>({
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
    averageScore: 0,
    totalHoursLearned: 0,
    certificationsEarned: 0,
    topPerformers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showCourseDialog, setShowCourseDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFiles, setImportFiles] = useState<File[]>([])
  const [importing, setImporting] = useState(false)
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    format: 'all',
    status: 'all',
    search: '',
  })

  // Load real data
  useEffect(() => {
    loadTrainingData()
  }, [])

  const loadTrainingData = async () => {
    try {
      // Import the real data service
      const { default: RealDataService } = await import('../../services/realDataService')

      // Fetch real training data
      const [coursesResult, statsData] = await Promise.all([
        RealDataService.getTrainingCourses({}),
        RealDataService.getTrainingStats()
      ])

      setCourses(coursesResult.data)
      setStats(statsData)

      // For now, use demo data for enrollments and certifications until implemented
      loadDemoDataFallback()
    } catch (error) {
      // Fallback to demo data
      loadDemoDataFallback()
    }
  }

  const loadDemoDataFallback = () => {
    // Demo courses data
    const demoCourses: Course[] = [
      {
        id: '1',
        title: 'Advanced React Development',
        description: 'Master advanced React patterns, hooks, and performance optimization techniques',
        instructor: {
          id: 'inst1',
          name: 'Sarah Johnson',
          avatar: '',
          title: 'Senior Frontend Developer'
        },
        category: 'Engineering',
        level: 'advanced',
        duration: 12,
        format: 'online',
        status: 'published',
        tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
        modules: [
          {
            id: 'm1',
            title: 'React Hooks Deep Dive',
            description: 'Understanding useState, useEffect, and custom hooks',
            type: 'video',
            duration: 90,
            order: 1,
            isCompleted: true
          },
          {
            id: 'm2',
            title: 'Performance Optimization',
            description: 'Memoization, code splitting, and bundle optimization',
            type: 'video',
            duration: 75,
            order: 2,
            isCompleted: false
          },
          {
            id: 'm3',
            title: 'Quiz: React Fundamentals',
            description: 'Test your knowledge of React concepts',
            type: 'quiz',
            duration: 30,
            order: 3,
            isCompleted: false
          }
        ],
        enrollments: 156,
        completions: 89,
        rating: 4.8,
        reviews: 67,
        isFree: false,
        price: 299,
        prerequisites: ['Basic React knowledge', 'JavaScript ES6+'],
        learningObjectives: [
          'Master advanced React hooks',
          'Optimize React application performance',
          'Implement complex state management patterns'
        ],
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
        isBookmarked: true
      },
      {
        id: '2',
        title: 'Leadership and Team Management',
        description: 'Develop essential leadership skills for managing high-performing teams',
        instructor: {
          id: 'inst2',
          name: 'Michael Chen',
          avatar: '',
          title: 'VP of Engineering'
        },
        category: 'Leadership',
        level: 'intermediate',
        duration: 8,
        format: 'hybrid',
        status: 'published',
        tags: ['Leadership', 'Management', 'Team Building', 'Communication'],
        modules: [
          {
            id: 'm4',
            title: 'Foundations of Leadership',
            description: 'Core principles and leadership styles',
            type: 'video',
            duration: 60,
            order: 1
          },
          {
            id: 'm5',
            title: 'Effective Communication',
            description: 'Communication strategies for leaders',
            type: 'article',
            duration: 45,
            order: 2
          }
        ],
        enrollments: 234,
        completions: 178,
        rating: 4.6,
        reviews: 92,
        isFree: true,
        prerequisites: ['2+ years experience', 'Team lead role'],
        learningObjectives: [
          'Understand different leadership styles',
          'Develop effective communication skills',
          'Learn team motivation techniques'
        ],
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-18T00:00:00Z',
        isBookmarked: false
      },
      {
        id: '3',
        title: 'Data Analytics with Python',
        description: 'Learn data analysis, visualization, and machine learning with Python',
        instructor: {
          id: 'inst3',
          name: 'Dr. Emily Rodriguez',
          avatar: '',
          title: 'Data Science Lead'
        },
        category: 'Data Science',
        level: 'beginner',
        duration: 16,
        format: 'self_paced',
        status: 'published',
        tags: ['Python', 'Data Science', 'Analytics', 'Machine Learning'],
        modules: [
          {
            id: 'm6',
            title: 'Python Basics for Data Science',
            description: 'Essential Python programming concepts',
            type: 'video',
            duration: 120,
            order: 1
          }
        ],
        enrollments: 189,
        completions: 145,
        rating: 4.7,
        reviews: 78,
        isFree: false,
        price: 199,
        prerequisites: ['Basic programming knowledge'],
        learningObjectives: [
          'Master Python for data analysis',
          'Create compelling data visualizations',
          'Build basic machine learning models'
        ],
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-22T00:00:00Z',
        isBookmarked: true
      }
    ]

    const demoEnrollments: Enrollment[] = [
      {
        id: 'e1',
        courseId: '1',
        employeeId: 'emp1',
        enrolledAt: '2024-01-15T00:00:00Z',
        startedAt: '2024-01-16T00:00:00Z',
        progress: 65,
        status: 'in_progress',
        lastAccessed: '2024-01-20T10:30:00Z'
      },
      {
        id: 'e2',
        courseId: '2',
        employeeId: 'emp1',
        enrolledAt: '2024-01-10T00:00:00Z',
        startedAt: '2024-01-12T00:00:00Z',
        completedAt: '2024-01-18T00:00:00Z',
        progress: 100,
        score: 92,
        status: 'completed',
        lastAccessed: '2024-01-18T00:00:00Z'
      }
    ]

    const demoCertifications: Certification[] = [
      {
        id: 'cert1',
        name: 'React Expert',
        description: 'Advanced certification in React development',
        issuer: 'Arise Academy',
        requirements: {
          courses: ['1'],
          minScore: 85
        },
        earnedBy: 23,
        level: 'gold'
      },
      {
        id: 'cert2',
        name: 'Leadership Excellence',
        description: 'Recognition for outstanding leadership skills',
        issuer: 'Arise Academy',
        requirements: {
          courses: ['2'],
          minScore: 80
        },
        earnedBy: 45,
        level: 'silver'
      }
    ]

    const demoStats: TrainingStats = {
      totalCourses: demoCourses.length,
      activeCourses: demoCourses.filter(c => c.status === 'published').length,
      totalEnrollments: 579,
      completionRate: 76.2,
      averageScore: 87.3,
      totalHoursLearned: 1234,
      certificationsEarned: 68,
      topPerformers: 15
    }

    // Only set enrollments and certifications for fallback (courses and stats are handled above)
    setEnrollments(demoEnrollments)
    setCertifications(demoCertifications)
    if (!stats) {
      setStats(demoStats)
    }
    setLoading(false)
  }

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (filters.category !== 'all' && course.category !== filters.category) return false
      if (filters.level !== 'all' && course.level !== filters.level) return false
      if (filters.format !== 'all' && course.format !== filters.format) return false
      if (filters.status !== 'all' && course.status !== filters.status) return false
      if (filters.search && !course.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !course.description.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [courses, filters])

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setShowCourseDialog(true)
  }

  const handleEnrollCourse = (courseId: string) => {
    // Implement enrollment logic
  }

  const handleBookmarkToggle = (courseId: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, isBookmarked: !course.isBookmarked }
        : course
    ))
  }

  const handleImportContent = () => {
    setShowImportDialog(true)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setImportFiles(files)
  }

  const handleImportSubmit = async () => {
    if (importFiles.length === 0) {
      return
    }
    
    setImporting(true)
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would process the files here
      
      // Close dialog and reset state
      setShowImportDialog(false)
      setImportFiles([])
      
      // Show success message or update UI
      alert(`Successfully imported ${importFiles.length} content files!`)
      
    } catch (error) {
      alert('Import failed. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
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
        onClick={() => handleCourseClick(course)}
      >
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              height: 160,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <VideoLibrary sx={{ fontSize: 48, color: theme.palette.primary.main }} />
            <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleBookmarkToggle(course.id)
                }}
                sx={{ 
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  '&:hover': { backgroundColor: theme.palette.background.paper }
                }}
              >
                {course.isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ p: responsive.getPadding(2, 3) }}>
          <Stack spacing={responsive.getSpacing(1.5, 2)}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                <Typography
                  variant={responsive.getVariant('subtitle1', 'h6')}
                  sx={{ fontWeight: 600, lineHeight: 1.3, flex: 1, mr: 1 }}
                >
                  {course.title}
                </Typography>
                <Chip
                  label={course.level}
                  size={responsive.isMobile ? "small" : "medium"}
                  color={course.level === 'beginner' ? 'success' :
                         course.level === 'intermediate' ? 'warning' : 'error'}
                  variant="outlined"
                />
              </Stack>
              <Typography
                variant={responsive.getVariant('caption', 'body2')}
                color="text.secondary"
                sx={{ mb: responsive.getSpacing(1, 2) }}
              >
                {course.description}
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={responsive.getSpacing(1, 2)}>
              <Avatar
                src={course.instructor.avatar}
                sx={{
                  width: responsive.isMobile ? 28 : 32,
                  height: responsive.isMobile ? 28 : 32
                }}
              >
                {course.instructor.name[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant={responsive.getVariant('caption', 'body2')}
                  sx={{ fontWeight: 500 }}
                >
                  {course.instructor.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: responsive.isMobile ? '0.625rem' : '0.75rem' }}
                >
                  {course.instructor.title}
                </Typography>
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Star sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                  <Typography variant="caption">
                    {course.rating} ({course.reviews})
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="caption">
                    {course.duration}h
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Group sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="caption">
                    {course.enrollments}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                {course.tags.slice(0, 3).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.625rem', height: 20 }}
                  />
                ))}
                {course.tags.length > 3 && (
                  <Chip
                    label={`+${course.tags.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.625rem', height: 20 }}
                  />
                )}
              </Stack>
            </Box>

            <Stack
              direction={responsive.getFlexDirection('column', 'row')}
              justifyContent="space-between"
              alignItems={responsive.isMobile ? "stretch" : "center"}
              spacing={responsive.getSpacing(1, 0)}
            >
              <Typography
                variant={responsive.getVariant('subtitle1', 'h6')}
                color="primary.main"
                sx={{ fontWeight: 600 }}
              >
                {course.isFree ? 'Free' : `$${course.price}`}
              </Typography>
              <Button
                variant="contained"
                size={responsive.getButtonSize()}
                onClick={(e) => {
                  e.stopPropagation()
                  handleEnrollCourse(course.id)
                }}
                sx={{ borderRadius: 2 }}
                fullWidth={responsive.isMobile}
              >
                Enroll
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  )

  const MyLearningCard: React.FC<{ enrollment: Enrollment }> = ({ enrollment }) => {
    const course = courses.find(c => c.id === enrollment.courseId)
    if (!course) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card sx={{ borderRadius: 3, mb: responsive.getSpacing(2, 2) }}>
          <CardContent sx={{ p: responsive.getPadding(2, 3) }}>
            <Stack spacing={responsive.getSpacing(1.5, 2)}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant={responsive.getVariant('subtitle1', 'h6')}
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {course.title}
                  </Typography>
                  <StatusChip status={enrollment.status as any} size="sm" />
                </Box>
                <IconButton
                  size={responsive.isMobile ? "small" : "medium"}
                  onClick={() => handleCourseClick(course)}
                >
                  <MoreVert />
                </IconButton>
              </Stack>

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {enrollment.progress}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={enrollment.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                  color={enrollment.progress === 100 ? 'success' : 'primary'}
                />
              </Box>

              {enrollment.score && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EmojiEvents color="warning" />
                  <Typography variant="body2">
                    Score: {enrollment.score}%
                  </Typography>
                </Stack>
              )}

              <Stack
                direction={responsive.getFlexDirection('column', 'row')}
                spacing={responsive.getSpacing(1, 1)}
              >
                <Button
                  variant={enrollment.status === 'completed' ? 'outlined' : 'contained'}
                  size={responsive.getButtonSize()}
                  startIcon={enrollment.status === 'completed' ? <CheckCircle /> : <PlayArrow />}
                  sx={{ borderRadius: 2 }}
                  fullWidth={responsive.isMobile}
                >
                  {enrollment.status === 'completed' ? 'Review' : 'Continue'}
                </Button>
                <Button
                  variant="outlined"
                  size={responsive.getButtonSize()}
                  startIcon={<Download />}
                  sx={{ borderRadius: 2 }}
                  fullWidth={responsive.isMobile}
                >
                  Resources
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const CertificationCard: React.FC<{ certification: Certification }> = ({ certification }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ borderRadius: 3, height: '100%' }}>
        <CardContent sx={{ p: responsive.getPadding(2, 3), textAlign: 'center' }}>
          <Stack spacing={responsive.getSpacing(1.5, 2)} alignItems="center">
            <WorkspacePremium
              sx={{
                fontSize: responsive.isMobile ? 40 : 48,
                color: certification.level === 'gold' ? '#FFD700' :
                       certification.level === 'silver' ? '#C0C0C0' :
                       certification.level === 'bronze' ? '#CD7F32' : '#E5E4E2'
              }}
            />
            <Box>
              <Typography
                variant={responsive.getVariant('subtitle1', 'h6')}
                sx={{ fontWeight: 600, mb: 1 }}
              >
                {certification.name}
              </Typography>
              <Typography
                variant={responsive.getVariant('caption', 'body2')}
                color="text.secondary"
                sx={{ mb: responsive.getSpacing(1, 2) }}
              >
                {certification.description}
              </Typography>
            </Box>
            <Chip
              label={`${certification.earnedBy} earned`}
              size={responsive.isMobile ? "small" : "medium"}
              color="primary"
              variant="outlined"
            />
            <Button
              variant="outlined"
              size={responsive.getButtonSize()}
              sx={{ borderRadius: 2 }}
              fullWidth={responsive.isMobile}
            >
              View Requirements
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <Box sx={{ p: responsive.getPadding(2, 3) }} className="container-fluid px-2 px-md-3 px-lg-4">
      {/* Header */}
      <Stack
        direction={responsive.getFlexDirection('column', 'row')}
        justifyContent="space-between"
        alignItems={responsive.isMobile ? "stretch" : "center"}
        spacing={responsive.getSpacing(2, 0)}
        sx={{ mb: responsive.getSpacing(2, 3) }}
      >
        <Box>
          <Typography
            variant={responsive.getVariant('h5', 'h4')}
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Training & Learning
          </Typography>
          <Typography
            variant={responsive.getVariant('body2', 'body1')}
            color="text.secondary"
          >
            Enhance skills and advance careers through comprehensive learning programs
          </Typography>
        </Box>
        <Stack
          direction={responsive.getFlexDirection('column', 'row')}
          spacing={responsive.getSpacing(1, 2)}
          sx={{ width: responsive.isMobile ? '100%' : 'auto' }}
        >
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            size={responsive.getButtonSize()}
            fullWidth={responsive.isMobile}
          >
            Analytics
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            size={responsive.getButtonSize()}
            fullWidth={responsive.isMobile}
          >
            Create Course
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={responsive.getSpacing(2, 3, 4)} sx={{ mb: responsive.getSpacing(3, 4) }}>
        <Grid item {...responsive.getGridColumns(12, 6, 3)}>
          <MetricCard
            title="Total Courses"
            value={<NumberTicker value={stats.totalCourses} />}
            icon={<School />}
            color="primary"
          />
        </Grid>
        <Grid item {...responsive.getGridColumns(12, 6, 3)}>
          <MetricCard
            title="Completion Rate"
            value={<NumberTicker value={stats.completionRate} formatValue={(v) => `${v.toFixed(1)}%`} />}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item {...responsive.getGridColumns(12, 6, 3)}>
          <MetricCard
            title="Hours Learned"
            value={<NumberTicker value={stats.totalHoursLearned} />}
            icon={<AccessTime />}
            color="info"
          />
        </Grid>
        <Grid item {...responsive.getGridColumns(12, 6, 3)}>
          <MetricCard
            title="Certifications"
            value={<NumberTicker value={stats.certificationsEarned} />}
            icon={<EmojiEvents />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant={responsive.isMobile ? "scrollable" : "standard"}
        scrollButtons={responsive.isMobile ? "auto" : false}
        allowScrollButtonsMobile={responsive.isMobile}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: responsive.getSpacing(2, 3),
          '& .MuiTab-root': {
            minWidth: responsive.isMobile ? 120 : 160,
            fontSize: responsive.isMobile ? '0.875rem' : '1rem'
          }
        }}
      >
        <Tab label="Course Catalog" />
        <Tab label="My Learning" />
        <Tab label="Certifications" />
        <Tab label="Analytics" />
      </Tabs>

      {/* Course Catalog Tab */}
      {activeTab === 0 && (
        <Box>
          {/* Filters */}
          <Paper sx={{ p: responsive.getPadding(2, 3), mb: responsive.getSpacing(2, 3), borderRadius: 3 }}>
            <Grid container spacing={responsive.getSpacing(2, 2)} alignItems="center">
              <Grid item {...responsive.getGridColumns(12, 12, 3)}>
                <TextField
                  fullWidth
                  placeholder="Search courses..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  size={responsive.getInputSize()}
                />
              </Grid>
              <Grid item {...responsive.getGridColumns(12, 6, 2)}>
                <FormControl fullWidth size={responsive.getInputSize()}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    label="Category"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="Engineering">Engineering</MenuItem>
                    <MenuItem value="Leadership">Leadership</MenuItem>
                    <MenuItem value="Data Science">Data Science</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item {...responsive.getGridColumns(12, 6, 2)}>
                <FormControl fullWidth size={responsive.getInputSize()}>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={filters.level}
                    onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                    label="Level"
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item {...responsive.getGridColumns(12, 6, 2)}>
                <FormControl fullWidth size={responsive.getInputSize()}>
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={filters.format}
                    onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value }))}
                    label="Format"
                  >
                    <MenuItem value="all">All Formats</MenuItem>
                    <MenuItem value="online">Online</MenuItem>
                    <MenuItem value="classroom">Classroom</MenuItem>
                    <MenuItem value="hybrid">Hybrid</MenuItem>
                    <MenuItem value="self_paced">Self-Paced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item {...responsive.getGridColumns(12, 6, 3)}>
                <Stack
                  direction={responsive.getFlexDirection('column', 'row')}
                  spacing={responsive.getSpacing(1, 1)}
                >
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    size={responsive.getButtonSize()}
                    fullWidth={responsive.isMobile}
                  >
                    More Filters
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Sort />}
                    size={responsive.getButtonSize()}
                    fullWidth={responsive.isMobile}
                  >
                    Sort
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Course Grid */}
          <Grid container spacing={responsive.getSpacing(2, 3, 4)}>
            {filteredCourses.map((course) => (
              <Grid item {...responsive.getGridColumns(12, 6, 4)} key={course.id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* My Learning Tab */}
      {activeTab === 1 && (
        <Box>
          <Grid container spacing={responsive.getSpacing(2, 3, 4)}>
            <Grid item {...responsive.getGridColumns(12, 12, 8)}>
              <Typography variant={responsive.getVariant('subtitle1', 'h6')} sx={{ mb: responsive.getSpacing(2, 2) }}>
                Current Enrollments
              </Typography>
              {enrollments.map((enrollment) => (
                <MyLearningCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </Grid>
            <Grid item {...responsive.getGridColumns(12, 12, 4)}>
              <Paper sx={{ p: responsive.getPadding(2, 3), borderRadius: 3 }}>
                <Typography variant={responsive.getVariant('subtitle1', 'h6')} sx={{ mb: responsive.getSpacing(2, 2) }}>
                  Learning Progress
                </Typography>
                <Stack spacing={responsive.getSpacing(2, 2)}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Hours This Month
                    </Typography>
                    <Typography variant={responsive.getVariant('h5', 'h4')} color="primary.main">
                      24.5
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Courses Completed
                    </Typography>
                    <Typography variant={responsive.getVariant('h5', 'h4')} color="success.main">
                      3
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Score
                    </Typography>
                    <Typography variant={responsive.getVariant('h5', 'h4')} color="warning.main">
                      92%
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Certifications Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant={responsive.getVariant('subtitle1', 'h6')} sx={{ mb: responsive.getSpacing(2, 3) }}>
            Available Certifications
          </Typography>
          <Grid container spacing={responsive.getSpacing(2, 3, 4)}>
            {certifications.map((certification) => (
              <Grid item {...responsive.getGridColumns(12, 6, 4)} key={certification.id}>
                <CertificationCard certification={certification} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Analytics Tab */}
      {activeTab === 3 && (
        <Box>
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            <Typography variant="body2">
              Advanced analytics and reporting features coming soon!
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Course Detail Dialog */}
      <Dialog
        open={showCourseDialog}
        onClose={() => setShowCourseDialog(false)}
        maxWidth={responsive.getDialogMaxWidth()}
        fullWidth
        fullScreen={responsive.isMobile}
        PaperProps={{ sx: { borderRadius: responsive.isMobile ? 0 : 3 } }}
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                  {selectedCourse.title}
                </Typography>
                <IconButton onClick={() => setShowCourseDialog(false)}>
                  <Close />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Typography variant="body1">
                  {selectedCourse.description}
                </Typography>
                
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Course Modules
                  </Typography>
                  {selectedCourse.modules.map((module, index) => (
                    <Accordion key={module.id}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                          <Typography sx={{ flex: 1 }}>
                            {module.title}
                          </Typography>
                          <Chip
                            label={`${module.duration}min`}
                            size="small"
                            variant="outlined"
                          />
                          {module.isCompleted && <CheckCircle color="success" />}
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          {module.description}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowCourseDialog(false)}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => handleEnrollCourse(selectedCourse.id)}
              >
                Enroll Now
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Training Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="Create Course"
          onClick={() => setShowCreateDialog(true)}
        />
        <SpeedDialAction
          icon={<Upload />}
          tooltipTitle="Import Content"
          onClick={handleImportContent}
        />
        <SpeedDialAction
          icon={<Analytics />}
          tooltipTitle="View Analytics"
          onClick={() => setActiveTab(3)}
        />
      </SpeedDial>

      {/* Import Content Dialog */}
      <Dialog
        open={showImportDialog}
        onClose={() => !importing && setShowImportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Training Content</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="info">
              Upload training materials, presentations, videos, or course content files.
              Supported formats: PDF, PPTX, DOCX, MP4, MOV, ZIP
            </Alert>
            
            <Box>
              <input
                accept=".pdf,.pptx,.docx,.mp4,.mov,.zip,.ppt,.doc"
                style={{ display: 'none' }}
                id="content-upload"
                multiple
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="content-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Select Files to Upload
                </Button>
              </label>
            </Box>

            {importFiles.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files ({importFiles.length}):
                </Typography>
                <List dense>
                  {importFiles.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>
                          <Description />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            setImportFiles(files => files.filter((_, i) => i !== index))
                          }}
                        >
                          <Close />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {importing && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Processing files...
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowImportDialog(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleImportSubmit}
            disabled={importFiles.length === 0 || importing}
            startIcon={importing ? <CircularProgress size={16} /> : <Upload />}
          >
            {importing ? 'Importing...' : 'Import Content'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TrainingDashboard
