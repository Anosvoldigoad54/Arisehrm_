import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  PhotoCamera as CameraIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  MyLocation as MyLocationIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { toast } from 'sonner'
import { format, startOfDay, endOfDay, differenceInMinutes } from 'date-fns'

interface AttendanceRecord {
  id: string
  employee_id: string
  date: string
  clock_in_time?: string
  clock_out_time?: string
  clock_in_location?: {
    latitude: number
    longitude: number
    address: string
  }
  clock_out_location?: {
    latitude: number
    longitude: number
    address: string
  }
  clock_in_photo?: string
  clock_out_photo?: string
  status: 'present' | 'absent' | 'late' | 'early_departure'
  total_hours?: number
  break_duration?: number
  overtime_hours?: number
  notes?: string
  is_location_verified: boolean
  location_accuracy?: number
}

interface AllowedLocation {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  is_active: boolean
}

const LocationBasedAttendance: React.FC = () => {
  const { profile } = useAuth()
  const { canView, canEdit } = usePermissions()
  const queryClient = useQueryClient()
  
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isWithinAllowedLocation, setIsWithinAllowedLocation] = useState(false)
  const [nearestLocation, setNearestLocation] = useState<AllowedLocation | null>(null)
  const [photoDialog, setPhotoDialog] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [clockAction, setClockAction] = useState<'in' | 'out' | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position)
          setLocationError(null)
        },
        (error) => {
          setLocationError(error.message)
          toast.error('Unable to get your location. Please enable location services.')
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    } else {
      setLocationError('Geolocation is not supported by this browser')
    }
  }, [])

  // Fetch allowed locations
  const { data: allowedLocations } = useQuery({
    queryKey: ['allowed-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowed_locations')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data as AllowedLocation[]
    }
  })

  // Fetch today's attendance
  const { data: todayAttendance, isLoading } = useQuery({
    queryKey: ['attendance-today', profile?.employee_id],
    queryFn: async () => {
      const today = new Date()
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', profile?.employee_id)
        .eq('date', format(today, 'yyyy-MM-dd'))
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as AttendanceRecord | null
    },
    enabled: !!profile?.employee_id
  })

  // Check if user is within allowed location
  useEffect(() => {
    if (currentLocation && allowedLocations) {
      let withinLocation = false
      let closest: AllowedLocation | null = null
      let minDistance = Infinity

      allowedLocations.forEach(location => {
        const distance = calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          location.latitude,
          location.longitude
        )

        if (distance < minDistance) {
          minDistance = distance
          closest = location
        }

        if (distance <= location.radius) {
          withinLocation = true
        }
      })

      setIsWithinAllowedLocation(withinLocation)
      setNearestLocation(closest)
    }
  }, [currentLocation, allowedLocations])

  // Clock in/out mutation
  const clockMutation = useMutation({
    mutationFn: async ({ action, photo }: { action: 'in' | 'out', photo?: string }) => {
      const now = new Date()
      const today = format(now, 'yyyy-MM-dd')
      const time = now.toISOString()

      const locationData = currentLocation ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: await reverseGeocode(currentLocation.coords.latitude, currentLocation.coords.longitude)
      } : null

      if (action === 'in') {
        // Clock in
        const { data, error } = await supabase
          .from('attendance_records')
          .insert({
            employee_id: profile?.employee_id,
            date: today,
            clock_in_time: time,
            clock_in_location: locationData,
            clock_in_photo: photo,
            status: 'present',
            is_location_verified: isWithinAllowedLocation,
            location_accuracy: currentLocation?.coords.accuracy
          })
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Clock out
        if (!todayAttendance) throw new Error('No clock-in record found for today')

        const clockInTime = new Date(todayAttendance.clock_in_time!)
        const totalMinutes = differenceInMinutes(now, clockInTime)
        const totalHours = totalMinutes / 60

        const { data, error } = await supabase
          .from('attendance_records')
          .update({
            clock_out_time: time,
            clock_out_location: locationData,
            clock_out_photo: photo,
            total_hours: totalHours,
            is_location_verified: isWithinAllowedLocation && todayAttendance.is_location_verified
          })
          .eq('id', todayAttendance.id)
          .select()
          .single()

        if (error) throw error
        return data
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] })
      toast.success(`Successfully clocked ${variables.action}`)
      setPhotoDialog(false)
      setCapturedPhoto(null)
      setClockAction(null)
      stopCamera()
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to clock ${clockAction}`)
    }
  })

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using a simple reverse geocoding approach
      // In production, you might want to use a proper geocoding service
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      toast.error('Unable to access camera')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)
      
      const photoData = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedPhoto(photoData)
    }
  }

  const handleClockAction = (action: 'in' | 'out') => {
    if (!isWithinAllowedLocation) {
      toast.error('You must be within an allowed location to clock in/out')
      return
    }

    setClockAction(action)
    setPhotoDialog(true)
    startCamera()
  }

  const confirmClockAction = () => {
    if (!capturedPhoto) {
      toast.error('Please take a photo to continue')
      return
    }

    clockMutation.mutate({ 
      action: clockAction!, 
      photo: capturedPhoto 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success'
      case 'late': return 'warning'
      case 'early_departure': return 'info'
      default: return 'error'
    }
  }

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading attendance...</Typography>
      </Box>
    )
  }

  const isClockIn = !todayAttendance?.clock_in_time
  const isClockOut = todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Location-Based Attendance
      </Typography>

      <Grid container spacing={3}>
        {/* Current Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Current Status</Typography>
              
              {locationError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">{locationError}</Typography>
                </Alert>
              ) : (
                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <MyLocationIcon color={isWithinAllowedLocation ? 'success' : 'error'} sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {isWithinAllowedLocation ? 'Within allowed location' : 'Outside allowed location'}
                    </Typography>
                  </Box>
                  {nearestLocation && (
                    <Typography variant="caption" color="text.secondary">
                      Nearest: {nearestLocation.name} ({Math.round(calculateDistance(
                        currentLocation?.coords.latitude || 0,
                        currentLocation?.coords.longitude || 0,
                        nearestLocation.latitude,
                        nearestLocation.longitude
                      ))}m away)
                    </Typography>
                  )}
                </Box>
              )}

              {todayAttendance ? (
                <Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Chip
                      label={todayAttendance.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(todayAttendance.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  {todayAttendance.clock_in_time && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <TimeIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        Clocked in: {format(new Date(todayAttendance.clock_in_time), 'HH:mm')}
                      </Typography>
                    </Box>
                  )}
                  
                  {todayAttendance.clock_out_time && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <TimeIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        Clocked out: {format(new Date(todayAttendance.clock_out_time), 'HH:mm')}
                      </Typography>
                    </Box>
                  )}
                  
                  {todayAttendance.total_hours && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        Total hours: {todayAttendance.total_hours.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attendance record for today
                </Typography>
              )}

              <Box mt={3}>
                {isClockIn && (
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={<CheckIcon />}
                    onClick={() => handleClockAction('in')}
                    disabled={!isWithinAllowedLocation || clockMutation.isPending}
                  >
                    Clock In
                  </Button>
                )}
                
                {isClockOut && (
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    startIcon={<CancelIcon />}
                    onClick={() => handleClockAction('out')}
                    disabled={!isWithinAllowedLocation || clockMutation.isPending}
                  >
                    Clock Out
                  </Button>
                )}
                
                {todayAttendance?.clock_out_time && (
                  <Alert severity="info">
                    You have completed your attendance for today
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Allowed Locations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Allowed Locations</Typography>
              
              <List dense>
                {allowedLocations?.map((location) => {
                  const distance = currentLocation ? calculateDistance(
                    currentLocation.coords.latitude,
                    currentLocation.coords.longitude,
                    location.latitude,
                    location.longitude
                  ) : null

                  const isWithinRadius = distance !== null && distance <= location.radius

                  return (
                    <ListItem key={location.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: isWithinRadius ? 'success.main' : 'grey.400' }}>
                          <LocationIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={location.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {location.address}
                            </Typography>
                            {distance !== null && (
                              <Typography variant="caption" color={isWithinRadius ? 'success.main' : 'text.secondary'}>
                                {Math.round(distance)}m away • Radius: {location.radius}m
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  )
                })}
              </List>
              
              {!allowedLocations?.length && (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No allowed locations configured
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Photo Capture Dialog */}
      <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Take Photo for Clock {clockAction === 'in' ? 'In' : 'Out'}
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center">
            {!capturedPhoto ? (
              <Box>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxWidth: 400, borderRadius: 8 }}
                />
                <Box mt={2}>
                  <Button
                    variant="contained"
                    startIcon={<CameraIcon />}
                    onClick={capturePhoto}
                  >
                    Capture Photo
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  style={{ width: '100%', maxWidth: 400, borderRadius: 8 }}
                />
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => setCapturedPhoto(null)}
                    sx={{ mr: 1 }}
                  >
                    Retake
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPhotoDialog(false)
            setCapturedPhoto(null)
            setClockAction(null)
            stopCamera()
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmClockAction}
            disabled={!capturedPhoto || clockMutation.isPending}
          >
            Confirm Clock {clockAction === 'in' ? 'In' : 'Out'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export { LocationBasedAttendance }
export default LocationBasedAttendance
