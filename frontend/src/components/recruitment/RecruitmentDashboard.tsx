'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  PersonAdd,
  Work,
  Assessment,
  Phone,
  VideoCall,
  CheckCircle,
  Schedule,
  TrendingUp,
  Star,
  LocationOn,
  School,
  Business,
  Email,
  LinkedIn,
  GitHub,
  AttachFile,
  Add,
  Edit,
  Visibility,
  MoreVert,
  Flag,
  Timer,
  Group,
  Analytics,
  FilterList,
  Search
} from '@mui/icons-material'
// Removed framer-motion for performance optimization
import { NumberTicker } from '../common/NumberTicker'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { useResponsive } from '../../hooks/useResponsive'
import { toast } from 'sonner'

// Types
interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  stage: 'applied' | 'screening' | 'interview' | 'technical' | 'final' | 'offered' | 'hired' | 'rejected'
  rating: number
  experience: number
  location: string
  salary_expectation: number
  avatar?: string
  skills: string[]
  resume_url?: string
  linkedin?: string
  github?: string
  applied_date: string
  last_activity: string
  notes: string
}

interface RecruitmentStats {
  totalCandidates: number
  activeOpenings: number
  interviewsScheduled: number
  offersExtended: number
  hireRate: number
  timeToHire: number
  costPerHire: number
  sourceEffectiveness: number
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    email: 'emma.thompson@email.com',
    phone: '+1 (555) 123-4567',
    position: 'Senior React Developer',
    department: 'Engineering',
    stage: 'interview',
    rating: 4.8,
    experience: 5,
    location: 'San Francisco, CA',
    salary_expectation: 120000,
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    applied_date: '2025-01-02',
    last_activity: '2025-01-05',
    notes: 'Strong technical background, excellent communication skills'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    email: 'marcus.chen@email.com',
    phone: '+1 (555) 234-5678',
    position: 'UX Designer',
    department: 'Design',
    stage: 'technical',
    rating: 4.5,
    experience: 3,
    location: 'Austin, TX',
    salary_expectation: 85000,
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    applied_date: '2025-01-01',
    last_activity: '2025-01-04',
    notes: 'Creative portfolio, strong design thinking process'
  },
  {
    id: '3',
    name: 'Sarah Rodriguez',
    email: 'sarah.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    position: 'Product Manager',
    department: 'Product',
    stage: 'final',
    rating: 4.9,
    experience: 7,
    location: 'New York, NY',
    salary_expectation: 140000,
    skills: ['Product Strategy', 'Analytics', 'Agile', 'Leadership'],
    applied_date: '2024-12-28',
    last_activity: '2025-01-06',
    notes: 'Exceptional leadership skills, strong product vision'
  }
]

const mockStats: RecruitmentStats = {
  totalCandidates: 156,
  activeOpenings: 23,
  interviewsScheduled: 12,
  offersExtended: 8,
  hireRate: 85.5,
  timeToHire: 18,
  costPerHire: 4200,
  sourceEffectiveness: 73.2
}

// Pipeline stages
const pipelineStages = [
  { key: 'applied', label: 'Applied', icon: <PersonAdd />, color: '#6c757d' },
  { key: 'screening', label: 'Screening', icon: <Assessment />, color: '#17a2b8' },
  { key: 'interview', label: 'Interview', icon: <VideoCall />, color: '#ffc107' },
  { key: 'technical', label: 'Technical', icon: <School />, color: '#fd7e14' },
  { key: 'final', label: 'Final Round', icon: <Star />, color: '#6f42c1' },
  { key: 'offered', label: 'Offered', icon: <Flag />, color: '#20c997' },
  { key: 'hired', label: 'Hired', icon: <CheckCircle />, color: '#28a745' },
  { key: 'rejected', label: 'Rejected', icon: <Schedule />, color: '#dc3545' }
]

// Animated Candidate Card
const CandidateCard = ({
  candidate,
  delay = 0,
  onCandidateClick
}: {
  candidate: Candidate
  delay?: number
  onCandidateClick?: (candidate: Candidate) => void
}) => {
  const theme = useTheme()
  const responsive = useResponsive()
  const [isExpanded, setIsExpanded] = useState(false)

  const getStageConfig = (stage: Candidate['stage']) => {
    return pipelineStages.find(s => s.key === stage) || pipelineStages[0]
  }

  const stageConfig = getStageConfig(candidate.stage)

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div>
      <Card
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.08)} 0%, 
            ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${stageConfig.color} 0%, ${alpha(stageConfig.color, 0.6)} 100%)`
          },
          '&:hover': {
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
          }
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardContent sx={{ p: responsive.getPadding(2, 3) }}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={responsive.getSpacing(1.5, 2)}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Avatar sx={{ width: 20, height: 20, backgroundColor: stageConfig.color }}>
                    {React.cloneElement(stageConfig.icon, { sx: { fontSize: 12, color: 'white' } })}
                  </Avatar>
                }
              >
                <Avatar
                  src={candidate.avatar}
                  sx={{
                    width: 50,
                    height: 50,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                  }}
                >
                  {candidate.name[0]}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {candidate.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {candidate.position}
                </Typography>
              </Box>
            </Stack>

            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreVert />
            </IconButton>
          </Stack>

          {/* Stage and Rating */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Chip
              icon={stageConfig.icon}
              label={stageConfig.label}
              size="small"
              sx={{
                backgroundColor: alpha(stageConfig.color, 0.1),
                color: stageConfig.color,
                fontWeight: 'medium'
              }}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Star sx={{ color: '#ffc107', fontSize: 16 }} />
              <Typography variant="body2" fontWeight="bold">
                <NumberTicker value={candidate.rating} formatValue={(val) => val.toFixed(1)} />
              </Typography>
            </Stack>
          </Stack>

          {/* Key Info */}
          <Stack spacing={1} mb={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="caption">{candidate.location}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Work fontSize="small" color="action" />
              <Typography variant="caption">{candidate.experience} years experience</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AttachFile fontSize="small" color="action" />
              <Typography variant="caption">
                Expected: {formatSalary(candidate.salary_expectation)}
              </Typography>
            </Stack>
          </Stack>

          {/* Skills */}
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Key Skills:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
              {candidate.skills.slice(0, 3).map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 'auto', py: 0.5 }}
                />
              ))}
              {candidate.skills.length > 3 && (
                <Chip
                  label={`+${candidate.skills.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 'auto', py: 0.5 }}
                />
              )}
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" startIcon={<Visibility />}>
              View
            </Button>
            <Button size="small" startIcon={<VideoCall />} variant="outlined">
              Interview
            </Button>
          </Stack>

          {/* Expanded Details */}
          {isExpanded && (
            <div>
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="caption">{candidate.email}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="caption">{candidate.phone}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="caption">
                      Applied: {new Date(candidate.applied_date).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  {candidate.notes && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Notes:</strong> {candidate.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Main Recruitment Dashboard
export function RecruitmentDashboard() {
  const { profile } = useAuth()
  const permissions = usePermissions()
  const theme = useTheme()
  const responsive = useResponsive()

  const [candidates] = useState<Candidate[]>(mockCandidates)
  const [stats] = useState<RecruitmentStats>(mockStats)
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [jobDialogOpen, setJobDialogOpen] = useState(false)
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'date'>('date')

  const canManageRecruitment = permissions.hasPermission('employees.create')

  const filteredCandidates = selectedStage === 'all' 
    ? candidates 
    : candidates.filter(c => c.stage === selectedStage)

  const handleCandidateAction = (candidate: Candidate, action: string) => {
    setSelectedCandidate(candidate)
    switch (action) {
      case 'view':
        setCandidateDialogOpen(true)
        break
      case 'interview':
        toast.success(`Interview scheduled for ${candidate.name}`)
        break
      case 'hire':
        toast.success(`${candidate.name} hired successfully!`)
        break
      case 'reject':
        toast.info(`${candidate.name} application rejected`)
        break
      default:
        break
    }
  }

  const filteredAndSortedCandidates = candidates
    .filter(c => selectedStage === 'all' || c.stage === selectedStage)
    .filter(c => !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return b.rating - a.rating
        case 'date':
          return new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime()
        default:
          return 0
      }
    })

  return (
    <Box sx={{ p: responsive.getPadding(2, 3), background: theme.palette.background.default, minHeight: '100vh' }} className="container-fluid px-2 px-md-3 px-lg-4">
      {/* Header */}
      <div>
        <Stack
          direction={responsive.getFlexDirection('column', 'row')}
          justifyContent="space-between"
          alignItems={responsive.isMobile ? "stretch" : "center"}
          spacing={responsive.getSpacing(2, 0)}
          mb={responsive.getSpacing(3, 4)}
        >
          <Box>
            <Typography
              variant={responsive.getVariant('h5', 'h4')}
              fontWeight="bold"
              gutterBottom
            >
              🎯 Recruitment Pipeline
            </Typography>
            <Typography
              variant={responsive.getVariant('body2', 'body1')}
              color="text.secondary"
            >
              Manage candidates and track hiring progress across all stages
            </Typography>
          </Box>

          <Stack
            direction={responsive.getFlexDirection('column', 'row')}
            spacing={responsive.getSpacing(1, 2)}
            sx={{ width: responsive.isMobile ? '100%' : 'auto' }}
          >
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              size={responsive.getButtonSize()}
              fullWidth={responsive.isMobile}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              size={responsive.getButtonSize()}
              fullWidth={responsive.isMobile}
            >
              Reports
            </Button>

            {canManageRecruitment && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setJobDialogOpen(true)}
                size={responsive.getButtonSize()}
                fullWidth={responsive.isMobile}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                }}
              >
                Post Job
              </Button>
            )}
          </Stack>
        </Stack>
      </div>
      {/* Search and Filters */}
      <Paper sx={{ p: responsive.getPadding(2, 3), mb: responsive.getSpacing(2, 3), borderRadius: 3 }}>
        <Stack spacing={responsive.getSpacing(2, 3)}>
          <Stack
            direction={responsive.getFlexDirection('column', 'row')}
            spacing={responsive.getSpacing(2, 2)}
            alignItems={responsive.isMobile ? "stretch" : "center"}
          >
            <TextField
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size={responsive.getInputSize()}
              sx={{
                minWidth: responsive.isMobile ? '100%' : 300,
                maxWidth: responsive.isMobile ? '100%' : 400
              }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <Stack direction={responsive.getFlexDirection('column', 'row')} spacing={responsive.getSpacing(1, 2)}>
              <TextField
                select
                label="Stage"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                size={responsive.getInputSize()}
                sx={{ minWidth: responsive.isMobile ? '100%' : 140 }}
              >
                <MenuItem value="all">All Stages</MenuItem>
                {pipelineStages.map((stage) => (
                  <MenuItem key={stage.key} value={stage.key}>
                    {stage.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                size={responsive.getInputSize()}
                sx={{ minWidth: responsive.isMobile ? '100%' : 120 }}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
      {/* Stats Cards */}
      <Grid container spacing={responsive.getSpacing(2, 3, 4)} mb={responsive.getSpacing(3, 4)}>
        <Grid>
          <div>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Box sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                    <PersonAdd color="primary" />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    <NumberTicker value={stats.totalCandidates} />
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Total Candidates
                </Typography>
              </CardContent>
            </Card>
          </div>
        </Grid>

        <Grid>
          <div>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Box sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
                    <Work color="success" />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    <NumberTicker value={stats.activeOpenings} />
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Active Openings
                </Typography>
              </CardContent>
            </Card>
          </div>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <div>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Box sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
                    <VideoCall color="warning" />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    <NumberTicker value={stats.interviewsScheduled} />
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Interviews Scheduled
                </Typography>
              </CardContent>
            </Card>
          </div>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <div>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Box sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
                    <TrendingUp color="info" />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    <NumberTicker value={stats.hireRate} formatValue={(val) => `${val}%`} />
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Hire Rate
                </Typography>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>
      {/* Pipeline Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📊 Pipeline Stages
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={`All (${candidates.length})`}
                onClick={() => setSelectedStage('all')}
                color={selectedStage === 'all' ? 'primary' : 'default'}
                variant={selectedStage === 'all' ? 'filled' : 'outlined'}
              />
              {pipelineStages.map((stage) => {
                const count = candidates.filter(c => c.stage === stage.key).length
                return (
                  <Chip
                    key={stage.key}
                    icon={stage.icon}
                    label={`${stage.label} (${count})`}
                    onClick={() => setSelectedStage(stage.key)}
                    color={selectedStage === stage.key ? 'primary' : 'default'}
                    variant={selectedStage === stage.key ? 'filled' : 'outlined'}
                    sx={{
                      ...(selectedStage === stage.key && {
                        backgroundColor: stage.color,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: alpha(stage.color, 0.8),
                        }
                      })
                    }}
                  />
                )
              })}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
      {/* Candidates Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              👥 Candidates {selectedStage !== 'all' && `- ${pipelineStages.find(s => s.key === selectedStage)?.label}`}
            </Typography>
            
            <Grid container spacing={responsive.getSpacing(2, 3, 4)}>
              {filteredAndSortedCandidates.map((candidate, index) => (
                <Grid key={candidate.id}>
                  <CandidateCard
                    candidate={candidate}
                    delay={index}
                    onCandidateClick={() => handleCandidateAction(candidate, 'view')}
                  />
                </Grid>
              ))}
            </Grid>

            {filteredAndSortedCandidates.length === 0 && (
              <Box textAlign="center" py={4}>
                <PersonAdd sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No candidates found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStage === 'all' 
                    ? 'Start by posting job openings to attract candidates'
                    : `No candidates in ${pipelineStages.find(s => s.key === selectedStage)?.label} stage`
                  }
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
      {/* Candidate Detail Dialog */}
      <Dialog
        open={candidateDialogOpen}
        onClose={() => setCandidateDialogOpen(false)}
        maxWidth={responsive.getDialogMaxWidth()}
        fullWidth
        fullScreen={responsive.isMobile}
        PaperProps={{ sx: { borderRadius: responsive.isMobile ? 0 : 3 } }}
      >
        {selectedCandidate && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar src={selectedCandidate.avatar} sx={{ width: 40, height: 40 }}>
                  {selectedCandidate.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedCandidate.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCandidate.position} • {selectedCandidate.department}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <IconButton onClick={() => setCandidateDialogOpen(false)}>
                    <MoreVert />
                  </IconButton>
                </Box>
              </Stack>
            </DialogTitle>

            <DialogContent>
              <Stack spacing={responsive.getSpacing(2, 3)}>
                {/* Contact Information */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Contact Information</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Email color="action" />
                        <Typography>{selectedCandidate.email}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Phone color="action" />
                        <Typography>{selectedCandidate.phone}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOn color="action" />
                        <Typography>{selectedCandidate.location}</Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Skills & Experience */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Skills & Experience</Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Experience: {selectedCandidate.experience} years
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expected Salary: ${selectedCandidate.salary_expectation.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Skills</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          {selectedCandidate.skills.map((skill, index) => (
                            <Chip key={index} label={skill} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Application Status */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Application Status</Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Current Stage</Typography>
                        <Chip
                          label={pipelineStages.find(s => s.key === selectedCandidate.stage)?.label}
                          color="primary"
                          variant="outlined"
                        />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Rating</Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              sx={{
                                fontSize: 20,
                                color: i < selectedCandidate.rating ? 'warning.main' : 'grey.300'
                              }}
                            />
                          ))}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {selectedCandidate.rating}/5
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Applied Date</Typography>
                        <Typography variant="body2">{new Date(selectedCandidate.applied_date).toLocaleDateString()}</Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedCandidate.notes && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Notes</Typography>
                      <Typography variant="body2">{selectedCandidate.notes}</Typography>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: responsive.getPadding(2, 3) }}>
              <Stack
                direction={responsive.getFlexDirection('column', 'row')}
                spacing={responsive.getSpacing(1, 2)}
                sx={{ width: responsive.isMobile ? '100%' : 'auto' }}
              >
                <Button
                  onClick={() => setCandidateDialogOpen(false)}
                  size={responsive.getButtonSize()}
                  fullWidth={responsive.isMobile}
                >
                  Close
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VideoCall />}
                  onClick={() => handleCandidateAction(selectedCandidate, 'interview')}
                  size={responsive.getButtonSize()}
                  fullWidth={responsive.isMobile}
                >
                  Schedule Interview
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleCandidateAction(selectedCandidate, 'hire')}
                  size={responsive.getButtonSize()}
                  fullWidth={responsive.isMobile}
                >
                  Hire
                </Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>
      {/* Job Posting Dialog */}
      <Dialog
        open={jobDialogOpen}
        onClose={() => setJobDialogOpen(false)}
        maxWidth={responsive.getDialogMaxWidth()}
        fullWidth
        fullScreen={responsive.isMobile}
        PaperProps={{ sx: { borderRadius: responsive.isMobile ? 0 : 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Work color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Post New Job Opening
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={responsive.getSpacing(2, 3)} mt={responsive.getSpacing(1, 2)}>
            <TextField
              label="Job Title"
              fullWidth
              placeholder="Senior React Developer"
              size={responsive.getInputSize()}
            />
            <TextField
              label="Department"
              fullWidth
              placeholder="Engineering"
              size={responsive.getInputSize()}
            />
            <TextField
              label="Location"
              fullWidth
              placeholder="San Francisco, CA"
              size={responsive.getInputSize()}
            />
            <TextField
              label="Salary Range"
              fullWidth
              placeholder="$100,000 - $140,000"
              size={responsive.getInputSize()}
            />
            <TextField
              label="Job Description"
              multiline
              rows={responsive.isMobile ? 3 : 4}
              fullWidth
              placeholder="Describe the role, responsibilities, and requirements..."
              size={responsive.getInputSize()}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: responsive.getPadding(2, 3) }}>
          <Stack
            direction={responsive.getFlexDirection('column-reverse', 'row')}
            spacing={responsive.getSpacing(1, 2)}
            sx={{ width: responsive.isMobile ? '100%' : 'auto' }}
          >
            <Button
              onClick={() => setJobDialogOpen(false)}
              size={responsive.getButtonSize()}
              fullWidth={responsive.isMobile}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              size={responsive.getButtonSize()}
              fullWidth={responsive.isMobile}
              onClick={() => {
                toast.success('Job posting created successfully!')
                setJobDialogOpen(false)
              }}
            >
              Post Job
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RecruitmentDashboard
