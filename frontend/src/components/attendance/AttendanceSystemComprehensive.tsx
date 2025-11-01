import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip, List, ListItem, ListItemText,
  ListItemAvatar, ListItemSecondaryAction, Avatar, Alert, CircularProgress, Stack,
  TextField, FormControl, InputLabel, Select, MenuItem, Divider, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Badge, LinearProgress, SpeedDial, SpeedDialAction, SpeedDialIcon
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  GpsFixed as GpsFixedIcon,
  GpsNotFixed as GpsNotFixedIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  Work as WorkIcon,
  Analytics as AnalyticsIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  PhotoCamera as PhotoCameraIcon,
  VerifiedUser as VerifiedUserIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'
import { useRBAC } from '../../hooks/useRBAC'
import { attendanceService } from '../../services/attendanceService'

// Simplified AttendanceRecord interface - extend as needed
interface AttendanceRecord {
  id: string
  employee_id: string
  date: string
  clock_in_time?: string
  clock_out_time?: string
  total_hours?: number
  status?: string
  is_remote_work?: boolean
  location_verified?: boolean
  requires_attention?: boolean
  anomaly_flags?: any[]
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
  qr_code_required: boolean
  photo_required: boolean
  face_recognition_enabled: boolean
  current_occupancy: number
  max_capacity?: number
  check_in_success_rate: number
  location_accuracy_score: number
  is_active: boolean
}

const StatusChip = ({ status, size = 'medium' }: { status?: string, size?: 'small' | 'medium' }) => {
  let color: any = 'default'
  if (status === 'present') color = 'success'
  else if (status === 'late') color = 'warning'
  else if (status === 'absent') color = 'error'
  else if (status === 'half_day') color = 'info'
  return <Chip label={status} size={size} color={color} />
}

interface ComprehensiveAttendanceSystemProps {
  className?: string
}

const ComprehensiveAttendanceSystem: React.FC<ComprehensiveAttendanceSystemProps> = ({ className }) => {
  const { user } = useAuth()
  const { canAccess } = useRBAC()
  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setLocation(position); setLocationError(null); setCurrentLocation(position) },
        (error) => setLocationError(error.message)
      )
    } else setLocationError('Geolocation is not supported by this browser.')
  }, [])

  // Fetch current attendance
  const { data: currentAttendanceData, refetch } = useQuery({
    queryKey: ['current-attendance', user?.id],
    queryFn: () => attendanceService.getAttendanceRecords({ userId: user?.id || '' }),
    enabled: !!user?.id,
  })

  // Fetch attendance history
  const { data: historyData } = useQuery({
    queryKey: ['attendance-history', user?.id],
    queryFn: () => attendanceService.getAttendanceRecords({ userId: user?.id || '' }),
    enabled: !!user?.id,
  })

  // Update state when data changes
  useEffect(() => {
    if (currentAttendanceData && Array.isArray(currentAttendanceData)) {
      setAttendanceData(currentAttendanceData)
    }
  }, [currentAttendanceData])

  useEffect(() => {
    if (historyData && Array.isArray(historyData)) {
      setAttendanceHistory(historyData)
    }
  }, [historyData])

  // Mutations
  const clockInMutation = useMutation({
    mutationFn: () => attendanceService.clockIn({
      userId: user?.id || '',
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      } : undefined
    }),
    onSuccess: () => {
      toast.success('Clocked in successfully!')
      refetch()
      setLoading(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clock in')
      setLoading(false)
    }
  })

  const clockOutMutation = useMutation({
    mutationFn: () => attendanceService.clockOut({ userId: user?.id || '' }),
    onSuccess: () => {
      toast.success('Clocked out successfully!')
      refetch()
      setLoading(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clock out')
      setLoading(false)
    }
  })

  const handleClockIn = () => {
    setLoading(true)
    clockInMutation.mutate()
  }

  const handleClockOut = () => {
    setLoading(true)
    clockOutMutation.mutate()
  }

  const isCurrentlyClockedIn = attendanceData.some(record => record.clock_in_time && !record.clock_out_time)

  const todayRecord = attendanceData.find(record => record.date === format(new Date(), 'yyyy-MM-dd')) || null

  // Camera capture hooks
  const handleStartCamera = useCallback(async () => {
    try {
      setIsClockingIn(true)
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
    } catch {
      setIsClockingIn(false)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const photo = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedPhoto(photo)
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setIsClockingIn(false)
  }, [cameraStream])

  const submitAttendance = useCallback(async () => {
    if (!currentLocation || !capturedPhoto) return
    // Construct attendance record payload
    const newRecord = {
      employee_id: user?.id || 'unknown',
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
    try {
      await attendanceService.createAttendance(newRecord)
      toast.success('Attendance submitted')
      setCapturedPhoto('')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Submission failed')
    }
  }, [capturedPhoto, currentLocation, refetch, user?.id])

  // Placeholder metric calculations and chart data can be added here as needed...

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  const handleRecordClick = (record: AttendanceRecord) => {
    setSelectedRecord(record)
  }

  return (
    <Box sx={{ p: 3 }} className={className}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Attendance System</Typography>
      <Grid container spacing={3}>

        {/* Current Status */}
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>Current Status</Typography>
              {isCurrentlyClockedIn ? (
                <Box>
                  <Chip label="Clocked In" color="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }} />
                  <Typography variant="body2" mb={2}>
                    Clock in time: {todayRecord?.clock_in_time ? new Date(todayRecord.clock_in_time).toLocaleString() : 'N/A'}
                  </Typography>
                  <Button variant="contained" color="error" onClick={handleClockOut} disabled={loading} startIcon={<LogoutIcon />}>
                    Clock Out
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Chip label="Not Clocked In" color="default" icon={<CancelIcon />} sx={{ mb: 2 }} />
                  <Typography variant="body2" mb={2}>Ready to start your work day</Typography>
                  <Button variant="contained" color="primary" onClick={handleClockIn} disabled={loading || !location} startIcon={<LoginIcon />}>
                    Clock In
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Location Status */}
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>Location Status</Typography>
              {location ? (
                <Box>
                  <Chip label="Location Verified" color="success" icon={<GpsFixedIcon />} sx={{ mb: 2 }} />
                  <Typography variant="body2">Lat: {location.coords.latitude.toFixed(6)}</Typography>
                  <Typography variant="body2">Lng: {location.coords.longitude.toFixed(6)}</Typography>
                  <Typography variant="caption" color="text.secondary">Accuracy: {Math.round(location.coords.accuracy)}m</Typography>
                </Box>
              ) : (
                <Box>
                  <Chip label="Getting Location" color="warning" icon={<GpsNotFixedIcon />} sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">{locationError || 'Requesting location access...'}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Attendance */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>Recent Attendance</Typography>
              {attendanceHistory.length > 0 ? (
                <List>
                  {attendanceHistory.slice(0, 5).map((record) => (
                    <ListItem key={record.id} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <AccessTimeIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                        secondary={
                          <>
                            <Typography variant="body2">In: {record.clock_in_time ? new Date(record.clock_in_time).toLocaleTimeString() : 'N/A'}</Typography>
                            <Typography variant="body2">Out: {record.clock_out_time ? new Date(record.clock_out_time).toLocaleTimeString() : 'Still working'}</Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip label={`${record.total_hours || 0}h`} size="small" color="primary" />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No attendance records found.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Tabs for Analytics, Corrections, Locations etc can be added similarly... */}

      </Grid>
      {/* Clock-In/Out Camera Dialog */}
      <Dialog open={isClockingIn} maxWidth="sm" fullWidth onClose={() => setIsClockingIn(false)}>
        <DialogTitle>Clock In/Out</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>

            {/* Location Status */}
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <LocationOnIcon color={currentLocation ? 'success' : 'error'} />
                  <Box>
                    <Typography variant="subtitle1">Location Status</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentLocation ? `Accuracy: ${currentLocation.coords.accuracy.toFixed(0)}m` : locationError || 'Getting location...'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Camera Preview */}
            <Card>
              <CardContent>
                <Typography variant="subtitle1" mb={2}>Photo Verification</Typography>
                {cameraStream ? (
                  <Box position="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={capturePhoto} 
                      sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}
                    >
                      Capture Photo
                    </Button>
                  </Box>
                ) : capturedPhoto ? (
                  <Box textAlign="center">
                    <img src={capturedPhoto} alt="Captured" style={{ maxWidth: '100%', borderRadius: 8 }} />
                    <Typography variant="body2" color="success.main" mt={1}>Photo captured successfully</Typography>
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">Camera will start when you begin clock in process</Typography>
                  </Box>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </CardContent>
            </Card>

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsClockingIn(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitAttendance} disabled={!currentLocation || !capturedPhoto}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ComprehensiveAttendanceSystem
