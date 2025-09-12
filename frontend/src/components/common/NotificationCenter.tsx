import React, { useState, useEffect } from 'react'
import {
  Popover,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Badge,
  Button,
  Divider,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
  MenuItem,
  Menu,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  MarkAsUnread,
  Delete,
  Settings,
  Close,
  FilterList,
  Refresh,
  CheckCircle,
  Warning,
  Error,
  Info,
  Schedule,
  Person,
  Work,
  TrendingUp,
  Message,
  Event,
  Assignment,
} from '@mui/icons-material'
// Removed framer-motion animations for better performance
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'system' | 'hr' | 'attendance' | 'leave' | 'message' | 'task' | 'announcement'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionText?: string
  priority: 'low' | 'medium' | 'high'
  sender?: {
    name: string
    avatar?: string
    role?: string
  }
  metadata?: any
}

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
  anchorEl: HTMLElement | null
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  open,
  onClose,
  anchorEl
}) => {
  const theme = useTheme()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    autoMarkRead: false
  })

  // Mock data for demonstration
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'info',
          category: 'hr',
          title: 'New Employee Onboarded',
          message: 'Sarah Johnson has completed her onboarding process and is ready to start.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
          read: false,
          priority: 'medium',
          actionUrl: '/hr/employees',
          actionText: 'View Profile',
          sender: {
            name: 'HR System',
            role: 'System'
          }
        },
        {
          id: '2',
          type: 'warning',
          category: 'attendance',
          title: 'Late Clock-in Alert',
          message: 'You clocked in 15 minutes late today. Please ensure punctuality.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: false,
          priority: 'high',
          sender: {
            name: 'Attendance System',
            role: 'System'
          }
        },
        {
          id: '3',
          type: 'success',
          category: 'leave',
          title: 'Leave Request Approved',
          message: 'Your vacation leave request for Dec 25-30 has been approved.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          read: true,
          priority: 'medium',
          actionUrl: '/leave',
          actionText: 'View Details',
          sender: {
            name: 'John Smith',
            avatar: '/avatars/john-smith.jpg',
            role: 'Manager'
          }
        },
        {
          id: '4',
          type: 'info',
          category: 'message',
          title: 'New Message',
          message: 'You have a new message from the Finance team regarding your expense report.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          read: true,
          priority: 'low',
          actionUrl: '/messages',
          actionText: 'Read Message',
          sender: {
            name: 'Finance Team',
            role: 'Department'
          }
        },
        {
          id: '5',
          type: 'info',
          category: 'announcement',
          title: 'Company Policy Update',
          message: 'New remote work policy has been published. Please review the updated guidelines.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          read: false,
          priority: 'medium',
          actionUrl: '/documents',
          actionText: 'View Policy',
          sender: {
            name: 'HR Department',
            role: 'Department'
          }
        }
      ]
      
      setNotifications(mockNotifications)
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (category: string, type: string) => {
    const iconColor = type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'primary'
    
    switch (category) {
      case 'hr':
        return <Person color={iconColor} />
      case 'attendance':
        return <Schedule color={iconColor} />
      case 'leave':
        return <Event color={iconColor} />
      case 'message':
        return <Message color={iconColor} />
      case 'task':
        return <Assignment color={iconColor} />
      case 'announcement':
        return <TrendingUp color={iconColor} />
      case 'system':
      default:
        return type === 'error' ? <Error color={iconColor} /> : 
               type === 'warning' ? <Warning color={iconColor} /> : 
               type === 'success' ? <CheckCircle color={iconColor} /> : 
               <Info color={iconColor} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main
      case 'medium':
        return theme.palette.warning.main
      case 'low':
      default:
        return theme.palette.info.main
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    )
    toast.success('Notification deleted')
  }

  const clearAll = () => {
    setNotifications([])
    toast.success('All notifications cleared')
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      // In a real app, you'd use navigate(notification.actionUrl)
      toast.info(`Navigating to ${notification.actionText || 'details'}`)
    }
  }

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 0: // All
        return notifications
      case 1: // Unread
        return notifications.filter(n => !n.read)
      case 2: // Important
        return notifications.filter(n => n.priority === 'high' || n.priority === 'medium')
      default:
        return notifications
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifications = getFilteredNotifications()

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 600,
          mt: 1,
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <Box sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Notifications
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={loadNotifications} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton
                  size="small"
                  onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                >
                  <Settings />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={onClose}>
                <Close />
              </IconButton>
            </Stack>
          </Stack>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ mt: 1, minHeight: 36 }}
          >
            <Tab label="All" sx={{ minHeight: 36, py: 0.5 }} />
            <Tab label="Unread" sx={{ minHeight: 36, py: 0.5 }} />
            <Tab label="Important" sx={{ minHeight: 36, py: 0.5 }} />
          </Tabs>
        </Box>

        {/* Actions */}
        {filteredNotifications.length > 0 && (
          <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button
                size="small"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All Read
              </Button>
              <Button
                size="small"
                onClick={clearAll}
                color="error"
              >
                Clear All
              </Button>
            </Stack>
          </Box>
        )}

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading notifications...
              </Typography>
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsOff sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications found
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <ListItem
                    divider={index < filteredNotifications.length - 1}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      },
                      borderLeft: `3px solid ${getPriorityColor(notification.priority)}`,
                      py: 1.5
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {notification.sender?.avatar ? (
                        <Avatar
                          src={notification.sender.avatar}
                          sx={{ width: 32, height: 32 }}
                        >
                          {notification.sender.name[0]}
                        </Avatar>
                      ) : (
                        getNotificationIcon(notification.category, notification.type)
                      )}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="body2"
                            fontWeight={notification.read ? 'normal' : 'bold'}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                bgcolor: 'primary.main',
                                borderRadius: '50%'
                              }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </Typography>
                            {notification.sender && (
                              <Typography variant="caption" color="text.secondary">
                                {notification.sender.name}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={0.5}>
                        {!notification.read && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                </div>
              ))}
            </List>
          )}
        </Box>

        {/* Settings Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
          PaperProps={{ sx: { minWidth: 250 } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Notification Settings
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    size="small"
                  />
                }
                label="Email notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    size="small"
                  />
                }
                label="Push notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                    size="small"
                  />
                }
                label="Sound alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoMarkRead}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoMarkRead: e.target.checked }))}
                    size="small"
                  />
                }
                label="Auto-mark as read"
              />
            </Stack>
          </Box>
        </Menu>
      </Box>
    </Popover>
  )
}

export default NotificationCenter