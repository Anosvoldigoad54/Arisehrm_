import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Psychology,
  Analytics,
  Person,
  Schedule,
  Assignment
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'

interface AIInsight {
  id: string
  type: 'performance' | 'attendance' | 'leave' | 'hiring' | 'general'
  severity: 'info' | 'warning' | 'error' | 'success'
  title: string
  description: string
  recommendation: string
  confidence: number
  data_points: any[]
  created_at: string
}

const AIInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

  // Enhanced AI insights data with more comprehensive analytics
  const insights = [
    {
      id: '1',
      title: 'High Turnover Risk Detected',
      description: 'Engineering department shows 15% higher turnover risk than company average. 3 key employees at risk.',
      severity: 'high',
      recommendation: 'Implement immediate retention strategies: salary review, career development plans, and conduct one-on-one meetings with at-risk employees',
      category: 'retention',
      impact: 'High',
      timeframe: 'Next 30 days',
      affectedEmployees: 12,
      confidence: 87
    },
    {
      id: '2', 
      title: 'Performance Improvement Trend',
      description: 'Overall team performance increased by 12% this quarter, with Marketing leading at 18% improvement',
      severity: 'low',
      recommendation: 'Continue current performance management practices and share Marketing\'s best practices across departments',
      category: 'performance',
      impact: 'Medium',
      timeframe: 'Ongoing',
      affectedEmployees: 45,
      confidence: 92
    },
    {
      id: '3',
      title: 'Monday Absence Pattern',
      description: 'Monday absences are 25% higher than other weekdays, indicating potential burnout or work-life balance issues',
      severity: 'medium',
      recommendation: 'Consider implementing flexible Monday work arrangements, remote work options, or wellness programs',
      category: 'attendance',
      impact: 'Medium',
      timeframe: 'Next 60 days',
      affectedEmployees: 23,
      confidence: 78
    },
    {
      id: '4',
      title: 'Skill Gap Analysis',
      description: 'AI/ML skills shortage detected across technical teams. 67% of projects require skills not currently available',
      severity: 'high',
      recommendation: 'Invest in AI/ML training programs or consider strategic hiring for these roles',
      category: 'skills',
      impact: 'High',
      timeframe: 'Next 90 days',
      affectedEmployees: 28,
      confidence: 85
    },
    {
      id: '5',
      title: 'Productivity Optimization',
      description: 'Meeting frequency analysis shows 23% of time spent in meetings could be optimized through async communication',
      severity: 'medium',
      recommendation: 'Implement meeting-free time blocks and promote async communication tools',
      category: 'productivity',
      impact: 'Medium',
      timeframe: 'Next 45 days',
      affectedEmployees: 67,
      confidence: 81
    },
    {
      id: '6',
      title: 'Diversity & Inclusion Opportunity',
      description: 'Leadership positions show 32% gender imbalance. Promotion pipeline analysis reveals systemic barriers',
      severity: 'medium',
      recommendation: 'Implement mentorship programs and review promotion criteria for unconscious bias',
      category: 'diversity',
      impact: 'High',
      timeframe: 'Next 120 days',
      affectedEmployees: 15,
      confidence: 89
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'error'
      case 'warning': return 'warning'
      case 'success': return 'success'
      case 'info': return 'info'
      default: return 'info'
    }
  }

  const TabPanel = ({ children, value, index }: any) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Psychology color="primary" />
        AI Insights & Analytics
      </Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Performance" />
        <Tab label="Attendance" />
        <Tab label="Predictions" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {insights.map((insight) => (
            <Box key={insight.id} sx={{ width: { xs: '100%', md: '48%', lg: '31%' } }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6">{insight.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {insight.description}
                  </Typography>
                  <Alert severity={getSeverityColor(insight.severity) as any}>
                    {insight.recommendation}
                  </Alert>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6">Performance Analytics Coming Soon</Typography>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6">Attendance Analytics Coming Soon</Typography>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Typography variant="h6">Predictions Coming Soon</Typography>
      </TabPanel>
    </Box>
  )
}

export default AIInsights
