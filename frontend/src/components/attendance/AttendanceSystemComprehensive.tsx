import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Button,
  Stack,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Paper,
  LinearProgress,
  CircularProgress,
  Badge,
  Tooltip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Alert,
  Snackbar,
  useMediaQuery,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Coffee as CoffeeIcon,
  Work as WorkIcon,
  MyLocation as MyLocationIcon,
  GpsFixed as GpsFixedIcon,
  GpsNotFixed as GpsNotFixedIcon,
  SignalWifi4Bar as SignalWifi4BarIcon,
  BatteryFull as BatteryFullIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  VerifiedUser as VerifiedUserIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  GetApp as GetAppIcon,
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material'
// Removed framer-motion for performance optimization
import ImageOptimizedSimple from '../common/ImageOptimizedSimple'
import VirtualListSimple from '../common/VirtualListSimple'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO } from 'date-fns'
// import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet' // Not installed
import { useResponsive } from '../../hooks/useResponsive'

// Mock components - replace with actual implementations
const MetricCard = ({ title, value, change, icon, color, loading }: any) => (
  <Card>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{ color: `${color}.main` }}>{icon}</Box>
        <Box>
          <Typography variant="h6">{value}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          {change && (
            <Typography variant="caption" color={change > 0 ? 'success.main' : 'error.main'}>
              {change > 0 ? '+' : ''}{change}%
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
)

const CountUp = ({ end, decimals = 0, suffix = '' }: { end: number; decimals?: number; suffix?: string }) => (
  <span>{end.toFixed(decimals)}{suffix}</span>
)

const StatusChip = ({ status, size = 'medium' }: { status: string; size?: 'small' | 'medium' }) => {
  const getColor = (status: string) => {
    switch (status) {
      case 'present': return 'success'
      case 'late': return 'warning'
      case 'absent': return 'error'
      case 'half_day': return 'info'
      default: return 'default'
    }
  }
  
  return <Chip label={status} size={size} color={getColor(status) as any} />
}

// Types based on schema
interface AttendanceRecord {
  id: string
  employee_id: string
  user_id?: string
  date: string
  shift_id?: string
  expected_start_time?: string
  expected_end_time?: string
  clock_in_time?: string
  clock_out_time?: string
  actual_start_work_time?: string
  actual_end_work_time?: string
  clock_in_location_id?: string
  clock_out_location_id?: string
  clock_in_latitude?: number
  clock_in_longitude?: number
  clock_out_latitude?: number
  clock_out_longitude?: number
  location_accuracy_meters?: number
  location_verified: boolean
  gps_spoofing_detected: boolean
  clock_in_photo_url?: string
  clock_out_photo_url?: string
  face_recognition_confidence?: number
  face_match_verified: boolean
  photo_quality_score?: number
  total_hours?: number
  regular_hours?: number
  overtime_hours?: number
  break_duration_minutes: number
  productive_hours?: number
  billable_hours?: number
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'holiday'
  is_remote_work: boolean
  is_sick_leave: boolean
  is_authorized_absence: boolean
  is_holiday: boolean
  requires_attention: boolean
  arrival_pattern?: string
  departure_pattern?: string
  break_pattern: any[]
  productivity_score?: number
  engagement_indicators: any
  weather_conditions: any
  traffic_conditions?: string
  public_transport_delays: boolean
  special_circumstances?: string
  device_info: any
  app_version?: string
  network_type?: string
  battery_level?: number
  notes?: string
  employee_notes?: string
  manager_notes?: string
  approved_by_id?: string
  approved_at?: string
  review_required: boolean
  correction_requested: boolean
  anomaly_flags: any[]
  risk_score: number
  confidence_score: number
  attendance_risk_score: number
  pattern_analysis: any
  behavioral_insights: any
  recommendations: any[]
  created_at: string
  updated_at: string
  metadata: any
  employee?: {
    id: string
    employee_id: string
    first_name: string
    last_name: string
    profile_photo_url?: string
    department?: string
    position?: string
  }
}

interface ClockLocation {
  id: string
  name: string
  description?: string
  location_type: string
  address?: string
  latitude: number
  longitude: number
  radius_meters: number
  altitude_meters?: number
  indoor_location_details: any
  allowed_employees: string[]
  allowed_departments: string[]
  allowed_roles: string[]
  restricted_times: any
  wifi_ssids?: string[]
  beacon_ids?: string[]
  qr_code_required: boolean
  photo_required: boolean
  face_recognition_enabled: boolean
  temperature_check_required: boolean
  max_capacity?: number
  current_occupancy: number
  safety_protocols: any[]
  health_check_required: boolean
  covid_protocols: any
  operating_hours: any
  timezone: string
  contact_person?: string
  contact_phone?: string
  emergency_procedures?: string
  average_check_in_time?: number
  check_in_success_rate: number
  location_accuracy_score: number
  is_active: boolean
}

interface AttendancePhoto {
  id: string
  attendance_id: string
  employee_id: string
  photo_url: string
  photo_type: string
  file_size?: number
  mime_type?: string
  resolution?: string
  file_hash?: string
  latitude?: number
  longitude?: number
  location_accuracy?: number
  address?: string
  indoor_location: any
  location_verified: boolean
  device_info: any
  camera_info: any
  capture_method: string
  timestamp_verified: boolean
  face_detection_results: any
  face_recognition_confidence?: number
  face_landmarks: any
  emotion_analysis: any
  objects_detected: any[]
  scene_analysis: any
  text_detection: any[]
  photo_quality_score: number
  authenticity_score: number
  manipulation_detected: boolean
  lighting_conditions?: string
  blur_detected: boolean
  face_clearly_visible: boolean
  contains_sensitive_info: boolean
  privacy_blur_applied: boolean
  gdpr_compliant: boolean
  retention_until?: string
  encrypted: boolean
  processing_status: string
  ai_processing_completed: boolean
  processing_error?: string
  processing_time_ms?: number
  created_at: string
  metadata: any
}

interface AttendanceCorrection {
  id: string
  attendance_id?: string
  employee_id: string
  correction_type: string
  field_name: string
  original_value?: string
  requested_value?: string
  actual_value?: string
  reason: string
  detailed_explanation?: string
  supporting_documents: any[]
  witness_statements: any[]
  status: 'pending' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  escalation_level: number
  requested_by_id?: string
  reviewed_by_id?: string
  approved_by_id?: string
  requested_at: string
  review_deadline?: string
  reviewed_at?: string
  approved_at?: string
  implemented_at?: string
  reviewer_comments?: string
  approver_comments?: string
  rejection_reason?: string
  partial_approval: boolean
  payroll_impact: any
  policy_violation_risk: string
  precedent_analysis: any
  created_at: string
  updated_at: string
  metadata: any
}

// Mock data - in real app this would come from API
const mockAttendanceData: AttendanceRecord[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    date: '2024-01-15',
    clock_in_time: '2024-01-15T09:00:00Z',
    clock_out_time: '2024-01-15T17:30:00Z',
    total_hours: 8.5,
    regular_hours: 8,
    overtime_hours: 0.5,
    break_duration_minutes: 60,
    status: 'present',
    is_remote_work: false,
    location_verified: true,
    gps_spoofing_detected: false,
    face_match_verified: true,
    requires_attention: false,
    productivity_score: 87,
    confidence_score: 95,
    risk_score: 2,
    attendance_risk_score: 1,
    break_pattern: [],
    engagement_indicators: {},
    weather_conditions: {},
    anomaly_flags: [],
    pattern_analysis: {},
    behavioral_insights: {},
    recommendations: [],
    device_info: {},
    metadata: {},
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T17:30:00Z',
    review_required: false,
    correction_requested: false,
    is_sick_leave: false,
    is_authorized_absence: false,
    is_holiday: false,
    public_transport_delays: false,
    employee: {
      id: '1',
      employee_id: 'EMP001',
      first_name: 'John',
      last_name: 'Smith',
      profile_photo_url: '/avatars/john.jpg',
      department: 'Engineering',
      position: 'Senior Developer'
    }
  },
  {
    id: '2',
    employee_id: 'EMP002',
    date: '2024-01-15',
    clock_in_time: '2024-01-15T09:15:00Z',
    clock_out_time: '2024-01-15T17:45:00Z',
    total_hours: 8.5,
    regular_hours: 8,
    overtime_hours: 0.5,
    break_duration_minutes: 45,
    status: 'late',
    is_remote_work: true,
    location_verified: false,
    gps_spoofing_detected: false,
    face_match_verified: true,
    requires_attention: true,
    productivity_score: 92,
    confidence_score: 88,
    risk_score: 3,
    attendance_risk_score: 2,
    break_pattern: [],
    engagement_indicators: {},
    weather_conditions: {},
    anomaly_flags: ['late_arrival'],
    pattern_analysis: {},
    behavioral_insights: {},
    recommendations: [],
    device_info: {},
    metadata: {},
    created_at: '2024-01-15T09:15:00Z',
    updated_at: '2024-01-15T17:45:00Z',
    review_required: true,
    correction_requested: false,
    is_sick_leave: false,
    is_authorized_absence: false,
    is_holiday: false,
    public_transport_delays: true,
    employee: {
      id: '2',
      employee_id: 'EMP002',
      first_name: 'Sarah',
      last_name: 'Connor',
      profile_photo_url: '/avatars/sarah.jpg',
      department: 'Marketing',
      position: 'Marketing Manager'
    }
  }
]

const mockLocationData: ClockLocation[] = [
  {
    id: '1',
    name: 'Main Office',
    description: 'Primary office location',
    location_type: 'office',
    address: '123 Business Ave, New York, NY 10001',
    latitude: 40.7128,
    longitude: -74.0060,
    radius_meters: 50,
    indoor_location_details: {},
    allowed_employees: [],
    allowed_departments: [],
    allowed_roles: [],
    restricted_times: {},
    qr_code_required: false,
    photo_required: true,
    face_recognition_enabled: true,
    temperature_check_required: false,
    current_occupancy: 45,
    safety_protocols: [],
    health_check_required: false,
    covid_protocols: {},
    operating_hours: { start: '08:00', end: '18:00' },
    timezone: 'America/New_York',
    check_in_success_rate: 98.5,
    location_accuracy_score: 95.2,
    is_active: true
  }
]

interface ComprehensiveAttendanceSystemProps {
  className?: string
}

const ComprehensiveAttendanceSystem: React.FC<ComprehensiveAttendanceSystemProps> = ({ className }) => {
  const theme = useTheme()
  const { isMobile, isTablet } = useResponsive()
  
  // State management
  const [selectedTab, setSelectedTab] = useState(0)
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(mockAttendanceData)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map' | 'timeline'>('list')
  const [filterAnomalies, setFilterAnomalies] = useState(false)
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Geolocation hook
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position)
          setLocationError('')
        },
        (error) => {
          setLocationError(error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    }
  }, [])

  // Calculate metrics
  const metrics = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayRecords = attendanceData.filter(record => 
      record.date === today
    )

    const totalPresent = todayRecords.filter(r => r.status === 'present' || r.status === 'late').length
    const totalLate = todayRecords.filter(r => r.status === 'late').length
    const totalAbsent = todayRecords.filter(r => r.status === 'absent').length
    const totalRemote = todayRecords.filter(r => r.is_remote_work).length
    const averageHours = todayRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0) / todayRecords.length || 0
    const anomaliesCount = todayRecords.filter(r => r.anomaly_flags.length > 0).length
    const requiresAttention = todayRecords.filter(r => r.requires_attention).length

    return {
      totalPresent,
      totalLate,
      totalAbsent,
      totalRemote,
      averageHours,
      anomaliesCount,
      requiresAttention,
      attendanceRate: todayRecords.length > 0 ? (totalPresent / todayRecords.length) * 100 : 0
    }
  }, [attendanceData])

  // Chart data
  const chartData = useMemo(() => {
    const weekStart = startOfWeek(selectedDate)
    const weekEnd = endOfWeek(selectedDate)
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayRecords = attendanceData.filter(r => r.date === dayStr)
      
      return {
        date: format(day, 'MMM dd'),
        present: dayRecords.filter(r => r.status === 'present').length,
        late: dayRecords.filter(r => r.status === 'late').length,
        absent: dayRecords.filter(r => r.status === 'absent').length,
        remote: dayRecords.filter(r => r.is_remote_work).length,
        averageHours: dayRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0) / dayRecords.length || 0
      }
    })
  }, [attendanceData, selectedDate])

  // Event handlers
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }, [])

  const handleRecordClick = useCallback((record: AttendanceRecord) => {
    setSelectedRecord(record)
  }, [])

  const handleClockIn = useCallback(async () => {
    setIsClockingIn(true)
    
    try {
      // Start camera for photo capture
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      })
      setCameraStream(stream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      setIsClockingIn(false)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const photoData = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedPhoto(photoData)
        
        // Stop camera stream
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop())
          setCameraStream(null)
        }
        
        setIsClockingIn(false)
      }
    }
  }, [cameraStream])

  const submitAttendance = useCallback(async () => {
    if (!currentLocation || !capturedPhoto) return

    const newRecord: Partial<AttendanceRecord> = {
      employee_id: 'current-user',
      date: format(new Date(), 'yyyy-MM-dd'),
      clock_in_time: new Date().toISOString(),
      clock_in_latitude: currentLocation.coords.latitude,
      clock_in_longitude: currentLocation.coords.longitude,
      location_accuracy_meters: currentLocation.coords.accuracy,
      clock_in_photo_url: capturedPhoto,
      status: 'present',
      is_remote_work: false,
      location_verified: true,
      gps_spoofing_detected: false,
      face_match_verified: true,
      requires_attention: false,
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // In real app, this would be an API call
    setCapturedPhoto('')
  }, [currentLocation, capturedPhoto])

  return (
    <div className={className}>
      <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography 
              variant="h4" 
              fontWeight={700} 
              sx={{ 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Attendance System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Advanced attendance tracking with AI-powered insights
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<GetAppIcon />}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AccessTimeIcon />}
              onClick={handleClockIn}
              disabled={isClockingIn}
            >
              {isClockingIn ? 'Processing...' : 'Clock In/Out'}
            </Button>
          </Stack>
        </Stack>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Present Today"
              value={<CountUp end={metrics.totalPresent} />}
              change={5.2}
              icon={<CheckCircleIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Late Arrivals"
              value={<CountUp end={metrics.totalLate} />}
              change={-12.3}
              icon={<WarningIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Remote Workers"
              value={<CountUp end={metrics.totalRemote} />}
              change={8.7}
              icon={<WorkIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Avg Hours"
              value={<CountUp end={metrics.averageHours} decimals={1} suffix="h" />}
              change={2.1}
              icon={<AccessTimeIcon />}
              color="primary"
            />
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons="auto"
            >
              <Tab 
                label="Live Tracking" 
                icon={<AccessTimeIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Records" 
                icon={<HistoryIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Analytics" 
                icon={<AnalyticsIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Locations" 
                icon={<LocationOnIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Corrections" 
                icon={<EditIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3 }}>
              {selectedTab === 0 && (
                <Box
                >
                  {/* Live Tracking Content */}
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Real-time Attendance Status
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {attendanceData.map((record) => (
                      <Grid item xs={12} sm={6} md={4} key={record.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.shadows[4],
                            }
                          }}
                          onClick={() => handleRecordClick(record)}
                        >
                          <CardContent>
                            <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                  src={record.employee?.profile_photo_url}
                                  sx={{ bgcolor: theme.palette.primary.main }}
                                >
                                  {record.employee?.first_name?.[0]}{record.employee?.last_name?.[0]}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {record.employee?.first_name} {record.employee?.last_name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {record.employee?.position}
                                  </Typography>
                                </Box>
                                <StatusChip status={record.status} size="small" />
                              </Stack>

                              <Divider />

                              <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <AccessTimeIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {record.clock_in_time ? 
                                      `In: ${format(parseISO(record.clock_in_time), 'HH:mm')}` : 
                                      'Not clocked in'
                                    }
                                  </Typography>
                                </Stack>
                                
                                {record.clock_out_time && (
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <LogoutIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                      Out: {format(parseISO(record.clock_out_time), 'HH:mm')}
                                    </Typography>
                                  </Stack>
                                )}

                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <LocationOnIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {record.is_remote_work ? 'Remote' : 'Office'}
                                  </Typography>
                                  {record.location_verified && (
                                    <VerifiedUserIcon fontSize="small" color="success" />
                                  )}
                                </Stack>

                                {record.total_hours && (
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <WorkIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                      {record.total_hours.toFixed(1)} hours
                                    </Typography>
                                  </Stack>
                                )}
                              </Stack>

                              {record.requires_attention && (
                                <Alert severity="warning">
                                  Requires manager attention
                                </Alert>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {selectedTab === 1 && (
                <Box
                >
                  {/* Records Content */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6">
                      Attendance Records
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        size="small"
                        placeholder="Search..."
                        InputProps={{
                          startAdornment: <SearchIcon />
                        }}
                      />
                      <IconButton>
                        <FilterListIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <VirtualListSimple
                    items={attendanceData}
                    height={400}
                    itemHeight={80}
                    renderItem={(record, index) => (
                      <ListItem
                        key={record.id}
                        divider={index < attendanceData.length - 1}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              record.anomaly_flags.length > 0 ? (
                                <WarningIcon 
                                  sx={{ 
                                    width: 16, 
                                    height: 16, 
                                    color: 'warning.main' 
                                  }} 
                                />
                              ) : record.location_verified ? (
                                <VerifiedUserIcon 
                                  sx={{ 
                                    width: 16, 
                                    height: 16, 
                                    color: 'success.main' 
                                  }} 
                                />
                              ) : null
                            }
                          >
                            <Avatar
                              src={record.employee?.profile_photo_url}
                              sx={{ bgcolor: theme.palette.primary.main }}
                            >
                              {record.employee?.first_name?.[0]}{record.employee?.last_name?.[0]}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {record.employee?.first_name} {record.employee?.last_name}
                              </Typography>
                              <StatusChip status={record.status} size="small" />
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {record.employee?.department} • {record.employee?.position}
                              </Typography>
                              <Stack direction="row" spacing={2}>
                                <Typography variant="caption">
                                  In: {record.clock_in_time ? 
                                    format(parseISO(record.clock_in_time), 'HH:mm') : 
                                    'N/A'
                                  }
                                </Typography>
                                <Typography variant="caption">
                                  Out: {record.clock_out_time ? 
                                    format(parseISO(record.clock_out_time), 'HH:mm') : 
                                    'N/A'
                                  }
                                </Typography>
                                <Typography variant="caption">
                                  Hours: {record.total_hours?.toFixed(1) || '0'}
                                </Typography>
                              </Stack>
                            </Stack>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRecordClick(record)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )}
                    emptyMessage="No attendance records found"
                  />
                </Box>
              )}

              {selectedTab === 2 && (
                <Box
                >
                  {/* Analytics Content */}
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Attendance Analytics
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Weekly Attendance Trends
                          </Typography>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="lateGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="present"
                                stroke={theme.palette.success.main}
                                fillOpacity={1}
                                fill="url(#presentGradient)"
                                name="Present"
                              />
                              <Area
                                type="monotone"
                                dataKey="late"
                                stroke={theme.palette.warning.main}
                                fillOpacity={1}
                                fill="url(#lateGradient)"
                                name="Late"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                      <Stack spacing={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Attendance Rate
                            </Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                              <CircularProgress
                                variant="determinate"
                                value={metrics.attendanceRate}
                                size={120}
                                thickness={4}
                                sx={{
                                  color: theme.palette.success.main,
                                }}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography
                                  variant="h5"
                                  component="div"
                                  color="text.secondary"
                                  fontWeight={600}
                                >
                                  {metrics.attendanceRate.toFixed(1)}%
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Quick Stats
                            </Typography>
                            <Stack spacing={2}>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">Anomalies</Typography>
                                <Chip 
                                  label={metrics.anomaliesCount} 
                                  size="small" 
                                  color={metrics.anomaliesCount > 0 ? 'warning' : 'success'}
                                />
                              </Stack>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">Needs Attention</Typography>
                                <Chip 
                                  label={metrics.requiresAttention} 
                                  size="small" 
                                  color={metrics.requiresAttention > 0 ? 'error' : 'success'}
                                />
                              </Stack>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">Remote Workers</Typography>
                                <Chip 
                                  label={metrics.totalRemote} 
                                  size="small" 
                                  color="info"
                                />
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {selectedTab === 3 && (
                <Box
                >
                  {/* Locations Content */}
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Clock Locations
                  </Typography>

                  <Grid container spacing={3}>
                    {mockLocationData.map((location) => (
                      <Grid item xs={12} md={6} key={location.id}>
                        <Card>
                          <CardContent>
                            <Stack spacing={2}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                  <Typography variant="h6" fontWeight={600}>
                                    {location.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {location.description}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={location.is_active ? 'Active' : 'Inactive'} 
                                  size="small" 
                                  color={location.is_active ? 'success' : 'default'}
                                />
                              </Stack>

                              <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <LocationOnIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {location.address}
                                  </Typography>
                                </Stack>
                                
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <BusinessIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    Capacity: {location.current_occupancy}/{location.max_capacity || 'Unlimited'}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <CheckCircleIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    Success Rate: {location.check_in_success_rate}%
                                  </Typography>
                                </Stack>
                              </Stack>

                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {location.photo_required && (
                                  <Chip 
                                    icon={<PhotoCameraIcon />} 
                                    label="Photo Required" 
                                    size="small" 
                                    variant="outlined"
                                  />
                                )}
                                {location.face_recognition_enabled && (
                                  <Chip 
                                    icon={<VerifiedUserIcon />} 
                                    label="Face Recognition" 
                                    size="small" 
                                    variant="outlined"
                                  />
                                )}
                                {location.qr_code_required && (
                                  <Chip 
                                    label="QR Code" 
                                    size="small" 
                                    variant="outlined"
                                  />
                                )}
                              </Stack>

                              <LinearProgress
                                variant="determinate"
                                value={(location.current_occupancy / (location.max_capacity || 100)) * 100}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {selectedTab === 4 && (
                <Box
                >
                  {/* Corrections Content */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6">
                      Attendance Corrections
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setShowCorrectionDialog(true)}
                    >
                      Request Correction
                    </Button>
                  </Stack>

                  <Alert severity="info" sx={{ mb: 3 }}>
                    Attendance corrections are reviewed by managers and HR. Please provide detailed justification.
                  </Alert>

                  {/* Placeholder for corrections list */}
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                      <EditIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No corrections requested
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        All attendance records are accurate
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
          </CardContent>
        </Card>

        {/* Clock In/Out Dialog */}
        <Dialog
          open={isClockingIn}
          onClose={() => setIsClockingIn(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            Clock In/Out
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Location Status */}
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <LocationOnIcon color={currentLocation ? 'success' : 'error'} />
                    <Box>
                      <Typography variant="subtitle1">
                        Location Status
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentLocation ? 
                          `Accuracy: ${currentLocation.coords.accuracy.toFixed(0)}m` : 
                          locationError || 'Getting location...'
                        }
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Camera Preview */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Photo Verification
                  </Typography>
                  
                  {cameraStream ? (
                    <Box sx={{ position: 'relative' }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: 8
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={capturePhoto}
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        Capture Photo
                      </Button>
                    </Box>
                  ) : capturedPhoto ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <ImageOptimizedSimple
                        src={capturedPhoto}
                        alt="Captured"
                        width="100%"
                        height="auto"
                        priority={true}
                        style={{
                          maxWidth: '100%',
                          borderRadius: 8
                        }}
                      />
                      <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        Photo captured successfully
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Camera will start when you begin clock in process
                      </Typography>
                    </Box>
                  )}
                  
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                  />
                </CardContent>
              </Card>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsClockingIn(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={submitAttendance}
              disabled={!currentLocation || !capturedPhoto}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Attendance Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<AccessTimeIcon />}
            tooltipTitle="Clock In/Out"
            onClick={handleClockIn}
          />
          <SpeedDialAction
            icon={<EditIcon />}
            tooltipTitle="Request Correction"
            onClick={() => setShowCorrectionDialog(true)}
          />
          <SpeedDialAction
            icon={<AnalyticsIcon />}
            tooltipTitle="View Analytics"
            onClick={() => setSelectedTab(2)}
          />
        </SpeedDial>
      )}
    </Box>
  </div>
  )
}

export { ComprehensiveAttendanceSystem }
export default ComprehensiveAttendanceSystem
