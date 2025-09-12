import React from 'react'
import { useLocation, Link as RouterLink } from 'react-router-dom'
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  Chip
} from '@mui/material'
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material'

interface BreadcrumbItem {
  label: string
  path?: string
  icon?: React.ReactNode
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  hr: 'Human Resources',
  employees: 'Employee Directory',
  'employee-management': 'Employee Management',
  hiring: 'Hiring & Recruitment',
  interviews: 'Interview Management',
  performance: 'Performance Management',
  training: 'Training & Learning',
  announcements: 'Announcements',
  compliance: 'Compliance',
  expenses: 'Expenses',
  onboarding: 'Onboarding',
  documents: 'Documents',
  benefits: 'Benefits',
  attendance: 'Attendance',
  location: 'Location-based',
  leave: 'Leave Management',
  payroll: 'Payroll',
  projects: 'Projects',
  reports: 'Reports & Analytics',
  settings: 'Settings',
  'organization-chart': 'Organization Chart'
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation()
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/dashboard', icon: <HomeIcon fontSize="small" /> }
    ]

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      
      // Don't add link for the last item (current page)
      const isLast = index === pathSegments.length - 1
      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs for home/dashboard page
  if (location.pathname === '/dashboard' || location.pathname === '/') {
    return null
  }

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary'
          }
        }}
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          if (isLast) {
            return (
              <Box key={crumb.label} display="flex" alignItems="center" gap={0.5}>
                {crumb.icon}
                <Typography color="text.primary" fontWeight="medium">
                  {crumb.label}
                </Typography>
              </Box>
            )
          }

          return (
            <Link
              key={crumb.label}
              component={RouterLink}
              to={crumb.path!}
              underline="hover"
              color="inherit"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              {crumb.icon}
              {crumb.label}
            </Link>
          )
        })}
      </MuiBreadcrumbs>
    </Box>
  )
}

export default Breadcrumbs
