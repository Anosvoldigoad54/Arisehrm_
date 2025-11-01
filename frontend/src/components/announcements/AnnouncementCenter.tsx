import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  IconButton,
  Badge,
  Paper
} from '@mui/material'
import {
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Campaign as CampaignIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'general' | 'urgent' | 'policy' | 'event' | 'system'
  target_audience: 'all' | 'department' | 'role' | 'custom'
  target_groups?: string[]
  requires_acknowledgment: boolean
  scheduled_date?: string
  expiry_date?: string
  status: 'draft' | 'published' | 'expired'
  created_by: string
  created_at: string
  author?: {
    full_name: string
    role: string
  }
  acknowledgments?: AnnouncementAck[]
}

interface AnnouncementAck {
  id: string
  announcement_id: string
  employee_id: string
  acknowledged_at: string
  employee?: {
    full_name: string
    department: string
  }
}

const ANNOUNCEMENT_TYPES = [
  { value: 'general', label: 'General', color: 'primary' },
  { value: 'urgent', label: 'Urgent', color: 'error' },
  { value: 'policy', label: 'Policy', color: 'warning' },
  { value: 'event', label: 'Event', color: 'success' },
  { value: 'system', label: 'System', color: 'info' }
]

const AnnouncementCenter: React.FC = () => {
  const { profile } = useAuth()
  const { isHR, isManager } = usePermissions()
  const queryClient = useQueryClient()

  const [openCreate, setOpenCreate] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'general',
    target_audience: 'all',
    target_groups: [] as string[],
    requires_acknowledgment: false,
    scheduled_date: '',
    expiry_date: ''
  })

  // Fetch announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      let query = supabase
        .from('announcements')
        .select(`
          *,
          author:user_profiles!announcements_created_by_fkey(full_name, role),
          acknowledgments:announcement_acknowledgments(
            id,
            employee_id,
            acknowledged_at,
            employee:user_profiles(full_name, department)
          )
        `)
        .order('created_at', { ascending: false })

      // Non-HR users see only published announcements
      if (!isHR()) {
        query = query.eq('status', 'published')
      }

      const { data, error } = await query
      if (error) throw error
      return data as Announcement[]
    }
  })

  // Fetch my unacknowledged announcements
  const { data: unacknowledged } = useQuery({
    queryKey: ['unacknowledged-announcements', profile?.employee_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          type,
          created_at,
          acknowledgments:announcement_acknowledgments!left(employee_id)
        `)
        .eq('status', 'published')
        .eq('requires_acknowledgment', true)
        .is('acknowledgments.employee_id', null)

      if (error) throw error
      return data
    },
    enabled: !!profile?.employee_id
  })

  // Create announcement mutation
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('announcements')
        .insert({
          ...data,
          created_by: profile?.employee_id,
          status: 'draft'
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement created successfully')
      setOpenCreate(false)
      resetForm()
    },
    onError: () => {
      toast.error('Failed to create announcement')
    }
  })

  // Acknowledge announcement mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const { error } = await supabase
        .from('announcement_acknowledgments')
        .insert({
          announcement_id: announcementId,
          employee_id: profile?.employee_id
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['unacknowledged-announcements'] })
      toast.success('Announcement acknowledged')
    },
    onError: () => {
      toast.error('Failed to acknowledge announcement')
    }
  })

  // Publish announcement mutation
  const publishMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const { error } = await supabase
        .from('announcements')
        .update({ status: 'published' })
        .eq('id', announcementId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement published')
    },
    onError: () => {
      toast.error('Failed to publish announcement')
    }
  })

  const resetForm = () => {
    setAnnouncementForm({
      title: '',
      content: '',
      type: 'general',
      target_audience: 'all',
      target_groups: [],
      requires_acknowledgment: false,
      scheduled_date: '',
      expiry_date: ''
    })
  }

  const handleCreateAnnouncement = () => {
    createAnnouncementMutation.mutate(announcementForm)
  }

  const handleAcknowledge = (announcementId: string) => {
    acknowledgeMutation.mutate(announcementId)
  }

  const handlePublish = (announcementId: string) => {
    publishMutation.mutate(announcementId)
  }

  const getTypeColor = (type: string) => {
    const typeConfig = ANNOUNCEMENT_TYPES.find(t => t.value === type)
    return typeConfig?.color || 'default'
  }

  const isAcknowledged = (announcement: Announcement) => {
    return announcement.acknowledgments?.some(ack => ack.employee_id === profile?.employee_id)
  }

  const getAcknowledgmentStats = (announcement: Announcement) => {
    const total = announcement.acknowledgments?.length || 0
    // In real implementation, you'd calculate total eligible employees
    const eligible = 100 // Placeholder
    return { acknowledged: total, total: eligible }
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Announcement Center
          </Typography>
          {unacknowledged && unacknowledged.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              You have {unacknowledged.length} unacknowledged announcements
            </Alert>
          )}
        </Box>
        {(isHR() || isManager()) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Create Announcement
          </Button>
        )}
      </Box>
      <Grid container spacing={3}>
        {announcements?.map((announcement) => (
          <Grid key={announcement.id} size={12}>
            <Card 
              sx={{ 
                border: announcement.type === 'urgent' ? '2px solid #f44336' : 'none',
                backgroundColor: announcement.type === 'urgent' ? 'rgba(244, 67, 54, 0.05)' : 'inherit'
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {announcement.title}
                      </Typography>
                      <Chip
                        label={announcement.type}
                        color={getTypeColor(announcement.type) as any}
                        size="small"
                      />
                      <Chip
                        label={announcement.status}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        By {announcement.author?.full_name} • {new Date(announcement.created_at).toLocaleDateString()}
                      </Typography>
                      {announcement.requires_acknowledgment && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Acknowledgment Required"
                          size="small"
                          color="warning"
                        />
                      )}
                    </Box>

                    <Typography variant="body1" mb={2}>
                      {announcement.content}
                    </Typography>

                    {announcement.requires_acknowledgment && (
                      <Box display="flex" alignItems="center" gap={2}>
                        {isAcknowledged(announcement) ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Acknowledged"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleAcknowledge(announcement.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        
                        {isHR() && (
                          <Typography variant="body2" color="text.secondary">
                            {getAcknowledgmentStats(announcement).acknowledged} / {getAcknowledgmentStats(announcement).total} acknowledged
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  <Box display="flex" gap={1}>
                    {isHR() && announcement.status === 'draft' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={() => handlePublish(announcement.id)}
                      >
                        Publish
                      </Button>
                    )}
                    {isHR() && (
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Create Announcement Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content"
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={announcementForm.type}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                >
                  {ANNOUNCEMENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
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
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={announcementForm.target_audience}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, target_audience: e.target.value })}
                >
                  <MenuItem value="all">All Employees</MenuItem>
                  <MenuItem value="department">Department</MenuItem>
                  <MenuItem value="role">Role</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={announcementForm.requires_acknowledgment}
                    onChange={(e) => setAnnouncementForm({ 
                      ...announcementForm, 
                      requires_acknowledgment: e.target.checked 
                    })}
                  />
                }
                label="Require Acknowledgment"
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Schedule Date (Optional)"
                InputLabelProps={{ shrink: true }}
                value={announcementForm.scheduled_date}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, scheduled_date: e.target.value })}
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
                label="Expiry Date (Optional)"
                InputLabelProps={{ shrink: true }}
                value={announcementForm.expiry_date}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, expiry_date: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAnnouncement}
            variant="contained"
            disabled={!announcementForm.title || !announcementForm.content}
          >
            Create Announcement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AnnouncementCenter
