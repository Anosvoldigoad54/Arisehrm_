'use client'

import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  IconButton,
  Collapse,
  Badge,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Dashboard,
  People,
  Schedule,
  Assignment,
  AttachMoney,
  Folder,
  BarChart,
  Person,
  Settings,
  ExpandLess,
  ExpandMore,
  Logout,
  Business,
  Group,
  PersonAdd,
  AccountTree,
  EmojiEvents,
  School,
  AssignmentInd,
  HealthAndSafety,
  Support,
  Work,
  TrendingUp,
  Description,
  CardGiftcard,
} from '@mui/icons-material'
import { ThemeToggle } from '../common/ThemeToggle'

// Same navigation items as desktop sidebar
const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    id: 'hr',
    label: 'Human Resources',
    icon: <People />,
    path: '/hr',
    children: [
      { id: 'employee-directory', label: 'Employee Directory', icon: <Person />, path: '/hr/employees' },
      { id: 'organization-chart', label: 'Organization Chart', icon: <AccountTree />, path: '/hr/organization-chart' },
      { id: 'recruitment', label: 'Recruitment', icon: <Work />, path: '/hr/recruitment' },
      { id: 'performance', label: 'Performance', icon: <TrendingUp />, path: '/hr/performance' },
      { id: 'training', label: 'Training', icon: <School />, path: '/hr/training' },
      { id: 'onboarding', label: 'Onboarding', icon: <AssignmentInd />, path: '/hr/onboarding' },
      { id: 'documents', label: 'Documents', icon: <Description />, path: '/hr/documents' },
      { id: 'benefits', label: 'Benefits', icon: <CardGiftcard />, path: '/hr/benefits' }
    ],
  },
  { id: 'attendance', label: 'Attendance', icon: <Schedule />, path: '/attendance', badge: 8 },
  { id: 'leave', label: 'Leave Management', icon: <Assignment />, path: '/leave', badge: 15 },
  { id: 'payroll', label: 'Payroll', icon: <AttachMoney />, path: '/payroll' },
  { id: 'projects', label: 'Projects', icon: <Folder />, path: '/projects' },
  { id: 'reports', label: 'Reports & Analytics', icon: <BarChart />, path: '/reports' },
  { id: 'self-service', label: 'Self-Service', icon: <Person />, path: '/self-service' },
  { id: 'settings', label: 'Settings', icon: <Settings />, path: '/settings' },
]

interface MobileSidebarDrawerProps {
  open: boolean
  onClose: () => void
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({ open, onClose }) => {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  
  const [expandedItems, setExpandedItems] = useState<string[]>(['hr'])

  // Get active nav item from current path
  const getActiveNavFromPath = () => {
    const path = location.pathname
    if (path.includes('/hr/')) return path.split('/hr/')[1] || 'employees'
    if (path.includes('/leave')) return 'leave'
    if (path.includes('/attendance')) return 'attendance'
    if (path.includes('/payroll')) return 'payroll'
    if (path.includes('/projects')) return 'projects'
    if (path.includes('/reports')) return 'reports'
    if (path.includes('/self-service')) return 'self-service'
    if (path.includes('/settings')) return 'settings'
    return 'dashboard'
  }

  const activeNav = getActiveNavFromPath()

  // Handle navigation
  const handleNavClick = (path: string) => {
    navigate(path)
    onClose() // Close drawer after navigation
  }

  // Handle expand/collapse of menu items
  const handleExpandClick = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      onClose()
    } catch (error) {
    }
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }} // Better performance on mobile
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: theme.palette.primary.contrastText,
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{ p: 2, textAlign: 'center', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.contrastText, mb: 0.5 }}>
            Arise HRM
          </Typography>
          <Typography variant="caption" sx={{ color: alpha(theme.palette.primary.contrastText, 0.7) }}>
            Human Resource Management
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: alpha(theme.palette.primary.contrastText, 0.1) }} />

      {/* User Profile Section */}
      <Box sx={{ p: 2, minHeight: 80 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={profile?.profile_photo_url}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: alpha(theme.palette.primary.contrastText, 0.2),
            }}
          >
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText, fontWeight: 600 }}>
              {profile?.first_name} {profile?.last_name}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha(theme.palette.primary.contrastText, 0.7) }}>
              {profile?.role?.display_name || 'Administrator'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: alpha(theme.palette.primary.contrastText, 0.1) }} />

      {/* Navigation Section */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        py: 1,
        // Fix mobile scroll issues
        '-webkit-overflow-scrolling': 'touch',
        scrollBehavior: 'smooth',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '2px',
        }
      }}>
        <List sx={{ px: 1 }}>
          {navigationItems.map((item) => (
            <Box key={item.id}>
              <ListItemButton
                onClick={() => {
                  if (item.children) {
                    handleExpandClick(item.id)
                  } else {
                    handleNavClick(item.path)
                  }
                }}
                selected={activeNav === item.id}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  color: theme.palette.primary.contrastText,
                  minHeight: 48,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.contrastText, 0.15),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.contrastText, 0.2),
                    },
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'inherit'
                  }}
                />
                {item.children && (
                  expandedItems.includes(item.id) ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>

              {/* Submenu */}
              {item.children && (
                <Collapse in={expandedItems.includes(item.id)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.id}
                        onClick={() => handleNavClick(child.path)}
                        selected={activeNav === child.id}
                        sx={{
                          mb: 0.5,
                          borderRadius: 2,
                          color: alpha(theme.palette.primary.contrastText, 0.8),
                          minHeight: 40,
                          '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
                            color: theme.palette.primary.contrastText,
                          },
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.contrastText, 0.05),
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                          <Badge badgeContent={child.badge} color="error">
                            {child.icon}
                          </Badge>
                        </ListItemIcon>
                        <ListItemText
                          primary={child.label}
                          primaryTypographyProps={{
                            fontSize: '0.8125rem',
                            fontWeight: 400
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: alpha(theme.palette.primary.contrastText, 0.1) }} />

      {/* Footer Section */}
      <Box sx={{ p: 2, minHeight: 60 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <ThemeToggle variant="button" size="small" />
          <IconButton sx={{ color: theme.palette.primary.contrastText }} size="small" onClick={() => navigate('/settings')}>
            <Settings />
          </IconButton>
          <IconButton sx={{ color: theme.palette.primary.contrastText }} size="small" onClick={() => window.open('https://docs.arise-hrm.example/help', '_blank')}>
            <Support />
          </IconButton>
          <IconButton
            sx={{ color: theme.palette.primary.contrastText }}
            onClick={handleLogout}
            size="small"
          >
            <Logout />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  )
}

export default MobileSidebarDrawer
