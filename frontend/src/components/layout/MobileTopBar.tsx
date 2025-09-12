'use client'

import React from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Badge,
  Tooltip,
  styled,
} from '@mui/material'
import {
  Menu,
  Add,
  Notifications,
  NetworkWifi,
  BatteryFull,
} from '@mui/icons-material'

interface MobileTopBarProps {
  onMenuClick: () => void
  onQuickActionsClick: () => void
  onNotificationsClick: (event: React.MouseEvent<HTMLElement>) => void
  notificationCount: number
}

const StyledMobileTopBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  backdropFilter: 'blur(20px)',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  onMenuClick,
  onQuickActionsClick,
  onNotificationsClick,
  notificationCount,
}) => {
  return (
    <StyledMobileTopBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
        >
          <Menu />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, ml: 2 }}>
          Arise HRM
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Quick Actions">
            <IconButton
              color="inherit"
              size="small"
              onClick={onQuickActionsClick}
            >
              <Add />
            </IconButton>
          </Tooltip>
          <IconButton 
            color="inherit" 
            size="small"
            onClick={onNotificationsClick}
          >
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <NetworkWifi fontSize="small" />
          <BatteryFull fontSize="small" />
          <Typography variant="caption">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Stack>
      </Toolbar>
    </StyledMobileTopBar>
  )
}

