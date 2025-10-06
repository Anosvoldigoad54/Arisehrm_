'use client'

import * as React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
} from '@mui/material'
import {
  People as PeopleIcon,
  AccountTree as AccountTreeIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  AssignmentInd as AssignmentIndIcon,
  Description as DescriptionIcon,
  CardGiftcard as CardGiftcardIcon,
  Announcement as AnnouncementIcon,
  HealthAndSafety as ComplianceIcon,
  Receipt as ExpenseIcon,
  QuestionAnswer as InterviewIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useRBAC } from '../../hooks/useRBAC'

const hrModules = [
  {
    id: 'employees',
    title: 'Employee Directory',
    description: 'Manage employee profiles and information',
    icon: <PeopleIcon />,
    path: '/hr/employees',
    permission: 'employees.view'
  },
  {
    id: 'organization-chart',
    title: 'Organization Chart',
    description: 'View organizational structure and hierarchy',
    icon: <AccountTreeIcon />,
    path: '/hr/organization-chart',
    permission: 'employees.view'
  },
  {
    id: 'recruitment',
    title: 'Recruitment',
    description: 'Manage job postings and applications',
    icon: <WorkIcon />,
    path: '/hr/recruitment',
    permission: 'employees.create'
  },
  {
    id: 'hiring',
    title: 'Hiring Management',
    description: 'Manage hiring process and candidates',
    icon: <WorkIcon />,
    path: '/hr/hiring',
    permission: 'employees.create'
  },
  {
    id: 'interviews',
    title: 'Interview Management',
    description: 'Schedule and manage interviews',
    icon: <InterviewIcon />,
    path: '/hr/interviews',
    permission: 'employees.create'
  },
  {
    id: 'performance',
    title: 'Performance Management',
    description: 'Track and manage employee performance',
    icon: <TrendingUpIcon />,
    path: '/hr/performance',
    permission: 'performance.view'
  },
  {
    id: 'training',
    title: 'Training & Development',
    description: 'Manage training programs and certifications',
    icon: <SchoolIcon />,
    path: '/hr/training',
    permission: 'training.view'
  },
  {
    id: 'onboarding',
    title: 'Employee Onboarding',
    description: 'Manage new employee onboarding process',
    icon: <AssignmentIndIcon />,
    path: '/hr/onboarding',
    permission: 'employees.create'
  },
  {
    id: 'documents',
    title: 'Document Management',
    description: 'Manage HR documents and policies',
    icon: <DescriptionIcon />,
    path: '/hr/documents',
    permission: 'documents.view'
  },
  {
    id: 'benefits',
    title: 'Benefits Management',
    description: 'Manage employee benefits and packages',
    icon: <CardGiftcardIcon />,
    path: '/hr/benefits',
    permission: 'employees.view'
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Create and manage company announcements',
    icon: <AnnouncementIcon />,
    path: '/hr/announcements',
    permission: 'announcements.create'
  },
  {
    id: 'compliance',
    title: 'Compliance Management',
    description: 'Manage regulatory compliance and policies',
    icon: <ComplianceIcon />,
    path: '/hr/compliance',
    permission: 'compliance.view'
  },
  {
    id: 'expenses',
    title: 'Expense Management',
    description: 'Manage employee expenses and reimbursements',
    icon: <ExpenseIcon />,
    path: '/hr/expenses',
    permission: 'payroll.view'
  },
]

export default function HRDashboard() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { canAccess } = useRBAC()

  const handleModuleClick = (path: string) => {
    navigate(path)
  }

  const visibleModules = hrModules.filter(module => 
    canAccess(module.permission)
  )

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Human Resources Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive HR management tools and features
      </Typography>

      <Grid container spacing={3}>
        {visibleModules.map((module) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                },
              }}
              onClick={() => handleModuleClick(module.path)}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: theme.palette.primary.main,
                    '& svg': {
                      fontSize: 48,
                    },
                  }}
                >
                  {module.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {module.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {module.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {visibleModules.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No HR modules available with your current permissions
          </Typography>
        </Box>
      )}
    </Box>
  )
}
