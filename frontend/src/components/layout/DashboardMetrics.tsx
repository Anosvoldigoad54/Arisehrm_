'use client'

import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  alpha,
  styled,
  Stack,
  IconButton,
} from '@mui/material'
import {
  Business,
  LocationOn,
  Security,
  Refresh,
  Settings,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { getDenimGradient, getDenimShadow } from '../../styles/denimTheme'

interface DashboardMetricsProps {
  isMobile: boolean
  onRefresh: () => void
  onSettingsClick: () => void
}

const WelcomeCard = styled(Card)(({ theme }) => ({
  background: getDenimGradient('primary'),
  color: 'white',
  borderRadius: 24,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: getDenimShadow('medium'),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    background: `radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    opacity: 0.3,
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: 20,
  },
}))

const AnalyticsChip = styled(Chip)(({ theme }) => ({
  borderRadius: 12,
  fontWeight: 600,
  fontSize: '0.75rem',
  '& .MuiChip-icon': {
    fontSize: '1rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
  },
}))

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  isMobile,
  onRefresh,
  onSettingsClick,
}) => {
  const { profile } = useAuth()

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <Box>
      {/* Welcome Section */}
      <WelcomeCard sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  color: 'inherit'
                }}
              >
                {getTimeOfDayGreeting()}, {profile?.first_name || 'User'}! 👋
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.9, 
                  mb: 2,
                  color: 'inherit'
                }}
              >
                Here's your comprehensive workforce overview for {new Date().toLocaleDateString()}
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                <AnalyticsChip 
                  icon={<Business />}
                  label={profile?.role?.display_name || 'Administrator'}
                  size="small"
                  sx={{ 
                    backgroundColor: alpha('#ffffff', 0.2),
                    color: 'inherit',
                    '& .MuiChip-icon': { color: 'inherit' }
                  }}
                />
                <AnalyticsChip 
                  icon={<LocationOn />}
                  label="Remote"
                  size="small"
                  sx={{ 
                    backgroundColor: alpha('#ffffff', 0.2),
                    color: 'inherit',
                    '& .MuiChip-icon': { color: 'inherit' }
                  }}
                />
                <AnalyticsChip 
                  icon={<Security />}
                  label="SECURE"
                  size="small"
                  sx={{ 
                    backgroundColor: alpha('#ffffff', 0.2),
                    color: 'inherit',
                    '& .MuiChip-icon': { color: 'inherit' }
                  }}
                />
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Avatar
                src={profile?.profile_photo_url}
                sx={{ 
                  width: { xs: 60, md: 80 }, 
                  height: { xs: 60, md: 80 },
                  mx: { xs: 'auto', md: 0 },
                  border: `3px solid ${alpha('#ffffff', 0.3)}`,
                }}
              >
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </Avatar>
              
              {!isMobile && (
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                  <IconButton 
                    sx={{ 
                      color: 'inherit', 
                      backgroundColor: alpha('#ffffff', 0.1) 
                    }}
                    onClick={onRefresh}
                  >
                    <Refresh />
                  </IconButton>
                  <IconButton 
                    sx={{ 
                      color: 'inherit', 
                      backgroundColor: alpha('#ffffff', 0.1) 
                    }}
                    onClick={onSettingsClick}
                  >
                    <Settings />
                  </IconButton>
                </Stack>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </WelcomeCard>
    </Box>
  )
}

