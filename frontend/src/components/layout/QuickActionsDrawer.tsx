'use client'

import React from 'react'
import {
  Box,
  Grid,
  Button,
  IconButton,
  Typography,
  Badge,
  SwipeableDrawer,
  alpha,
} from '@mui/material'
import {
  Add as AddIcon,
  PersonAdd,
  AssignmentTurnedIn,
  Schedule,
  BarChart,
  Settings,
  Notifications,
  Close,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useResponsive } from '../../hooks/useResponsive'

interface QuickActionsDrawerProps {
  open: boolean
  onClose: () => void
  onOpen: () => void
  pendingLeaveRequests: number
}

export const QuickActionsDrawer: React.FC<QuickActionsDrawerProps> = ({
  open,
  onClose,
  onOpen,
  pendingLeaveRequests,
}) => {
  const navigate = useNavigate()
  const responsive = useResponsive()

  const quickActions = [
    { id: 'employee-directory', icon: <Person />, label: 'Employee Directory', color: 'primary', action: () => navigate('/hr/employees') },
    { id: 'organization-chart', icon: <AccountTree />, label: 'Org Chart', color: 'secondary', action: () => navigate('/hr/organization-chart') },
    { id: 'recruitment', icon: <Work />, label: 'Recruitment', color: 'success', action: () => navigate('/hr/recruitment') },
    { id: 'performance-reviews', icon: <TrendingUp />, label: 'Performance', color: 'warning', action: () => navigate('/hr/performance') },
    { id: 'training', icon: <School />, label: 'Training', color: 'info', action: () => navigate('/hr/training') },
    { id: 'leave-request', icon: <Event />, label: 'Request Leave', color: 'primary', action: () => navigate('/leave/dashboard') },
    { id: 'attendance', icon: <Schedule />, label: 'Clock In/Out', color: 'secondary', action: () => navigate('/attendance') },
    { id: 'payroll', icon: <AttachMoney />, label: 'Payroll', color: 'success', action: () => navigate('/payroll') }
  ]

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: responsive.isMobile ? 20 : 24,
          borderTopRightRadius: responsive.isMobile ? 20 : 24,
          maxHeight: responsive.isMobile ? '80vh' : '70vh',
          backgroundColor: alpha('#ffffff', 0.95),
          backdropFilter: 'blur(20px)',
          margin: responsive.isMobile ? 0 : '0 16px',
          maxWidth: responsive.isMobile ? '100%' : '600px',
          left: responsive.isMobile ? 0 : '50%',
          transform: responsive.isMobile ? 'none' : 'translateX(-50%)',
        },
      }}
    >
      <Box sx={{ p: responsive.getPadding(2, 3, 3) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant={responsive.getVariant('h6', 'h6', 'h5')} sx={{ fontWeight: 700 }}>
            Quick Actions
          </Typography>
          <IconButton onClick={onClose} size={responsive.getButtonSize()}>
            <Close />
          </IconButton>
        </Box>

        <Grid container spacing={responsive.getSpacing(1.5, 2, 2)}>
          {quickActions.map((action, index) => (
            <Grid item {...responsive.getGridColumns(6, 4, 3)} key={index}>
              <div>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={action.icon}
                  onClick={() => {
                    action.action()
                    onClose()
                  }}
                  sx={{
                    p: responsive.getPadding(1.5, 2, 2),
                    borderRadius: 3,
                    flexDirection: 'column',
                    height: responsive.isMobile ? 70 : 80,
                    position: 'relative',
                    borderColor: alpha(`#${action.color === 'primary' ? '1976d2' : action.color === 'secondary' ? '9c27b0' : action.color === 'success' ? '2e7d32' : action.color === 'warning' ? 'ed6c02' : action.color === 'error' ? 'd32f2f' : '1976d2'}`, 0.3),
                    '&:hover': {
                      borderColor: `#${action.color === 'primary' ? '1976d2' : action.color === 'secondary' ? '9c27b0' : action.color === 'success' ? '2e7d32' : action.color === 'warning' ? 'ed6c02' : action.color === 'error' ? 'd32f2f' : '1976d2'}`,
                      backgroundColor: alpha(`#${action.color === 'primary' ? '1976d2' : action.color === 'secondary' ? '9c27b0' : action.color === 'success' ? '2e7d32' : action.color === 'warning' ? 'ed6c02' : action.color === 'error' ? 'd32f2f' : '1976d2'}`, 0.05),
                    }
                  }}
                >
                  <Typography
                    variant={responsive.isMobile ? 'caption' : 'body2'}
                    sx={{ mt: 0.5, fontSize: responsive.isMobile ? '0.7rem' : '0.75rem' }}
                  >
                    {action.label}
                  </Typography>
                  {action.badge && (
                    <Badge
                      badgeContent={action.badge}
                      color="error"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                  )}
                </Button>
              </div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </SwipeableDrawer>
  )
}

