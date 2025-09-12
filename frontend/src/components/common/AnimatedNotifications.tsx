'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Stack,
  Chip,
  Divider,
  Badge,
  useTheme,
  alpha,
  Tooltip,
  Button,
  Collapse
} from '@mui/material'
import {
  Notifications,
  NotificationsActive,
  Close,
  Circle,
  CheckCircle,
  Warning,
  Info,
  Error as ErrorIcon,
  Assignment,
  Schedule,
  People,
  AttachMoney,
  Celebration,
  ExpandMore,
  ExpandLess,
  MarkAsUnread,
  Archive
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'celebration'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  avatar?: string
  actionLabel?: string
  onAction?: () => void
  category: 'hr' | 'payroll' | 'attendance' | 'performance' | 'system'
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'celebration',
    title: 'Performance Milestone! 🎉',
    message: 'Sarah Johnson has achieved 95% performance score this quarter',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    category: 'performance',
    actionLabel: 'View Report'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Attendance Alert',
    message: '3 employees have been absent for more than 2 consecutive days',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    category: 'attendance',
    actionLabel: 'Review'
  },
  {
    id: '3',
    type: 'info',
    title: 'Payroll Processing',
    message: 'Monthly payroll for January 2025 is ready for approval',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
    category: 'payroll',
    actionLabel: 'Approve'
  },
  {
    id: '4',
    type: 'success',
    title: 'New Employee Onboarded',
    message: 'Alex Chen has completed the onboarding process successfully',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: false,
    category: 'hr',
    actionLabel: 'Welcome'
  }
]

// Notification Item Component
const NotificationItem = ({ 
  notification, 
  index, 
  onRead, 
  onArchive 
}: { 
  notification: Notification
  index: number
  onRead: (id: string) => void
  onArchive: (id: string) => void
}) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  const getNotificationConfig = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return { icon: <CheckCircle />, color: theme.palette.success.main }
      case 'warning':
        return { icon: <Warning />, color: theme.palette.warning.main }
      case 'error':
        return { icon: <ErrorIcon />, color: theme.palette.error.main }
      case 'celebration':
        return { icon: <Celebration />, color: theme.palette.secondary.main }
      case 'info':
      default:
        return { icon: <Info />, color: theme.palette.info.main }
    }
  }

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'hr': return <People />
      case 'payroll': return <AttachMoney />
      case 'attendance': return <Schedule />
      case 'performance': return <Assignment />
      case 'system': return <Notifications />
      default: return <Circle />
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const config = getNotificationConfig(notification.type)

  return (
    <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{ x: 4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        sx={{
          mb: 1.5,
          backgroundColor: notification.isRead 
            ? 'background.paper' 
            : alpha(config.color, 0.05),
          border: `1px solid ${notification.isRead 
            ? theme.palette.divider 
            : alpha(config.color, 0.2)}`,
          borderLeft: `4px solid ${config.color}`,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 25px ${alpha(config.color, 0.15)}`,
            transform: 'translateY(-1px)'
          }
        }}
        onClick={() => !notification.isRead && onRead(notification.id)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {/* Notification Icon */}
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: alpha(config.color, 0.1),
                color: config.color
              }}
            >
              {config.icon}
            </Avatar>

            {/* Content */}
            <Box flex={1} minWidth={0}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={notification.isRead ? 'medium' : 'bold'}
                  sx={{ pr: 1 }}
                >
                  {notification.title}
                </Typography>
                
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip
                    icon={getCategoryIcon(notification.category)}
                    label={notification.category.toUpperCase()}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.7rem',
                      height: 'auto',
                      py: 0.5,
                      '& .MuiChip-icon': { fontSize: '0.875rem' }
                    }}
                  />
                  
                  {!notification.isRead && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: config.color
                        }}
                      />
                    </motion.div>
                  )}
                </Stack>
              </Stack>

              <Typography 
                variant="body2" 
                color="text.secondary" 
                mb={1.5}
                sx={{ fontSize: '0.875rem' }}
              >
                {notification.message}
              </Typography>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(notification.timestamp)}
                </Typography>
                
                <AnimatePresence>
                  {(isHovered || notification.actionLabel) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Stack direction="row" spacing={1}>
                        {notification.actionLabel && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation()
                              notification.onAction?.()
                            }}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                        
                        {isHovered && (
                          <>
                            <Tooltip title={notification.isRead ? "Mark as unread" : "Mark as read"}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onRead(notification.id)
                                }}
                              >
                                <MarkAsUnread fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Archive">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onArchive(notification.id)
                                }}
                              >
                                <Archive fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Main Animated Notifications Component
export const AnimatedNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isExpanded, setIsExpanded] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: !n.isRead } : n
    ))
  }

  const handleArchive = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsActive color="primary" />
              </Badge>
              <Typography variant="h6" fontWeight="bold">
                Notifications
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant={filter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </Button>
              <Button
                size="small"
                variant={filter === 'unread' ? 'contained' : 'outlined'}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
              
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAllAsRead}
                  sx={{ ml: 1 }}
                >
                  Mark All Read
                </Button>
              )}

              <IconButton
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Collapse in={isExpanded}>
        <Box>
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onRead={handleMarkAsRead}
                  onArchive={handleArchive}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Notifications 
                      sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} 
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You're all caught up! 🎉
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Collapse>
    </Box>
  )
}

export default AnimatedNotifications
