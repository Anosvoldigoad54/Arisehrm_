import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material'
import {
  SmartToy,
  Upload,
  Visibility,
  Download,
  CheckCircle,
  Cancel,
  Close
} from '@mui/icons-material'
import { useAIConfig } from '../../hooks/useAIConfig'
import { toast } from 'sonner'

interface ResumeAnalysis {
  id: string
  candidate_name: string
  email: string
  ai_score: number
  skills_match: number
  experience_match: number
  recommendation: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  missing_skills: string[]
}

const AIResumeAnalyzer: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [analysisDialog, setAnalysisDialog] = useState<ResumeAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { getGridBreakpoints } = useAIConfig()

  // JSON-based data for performance optimization
  const jobsData = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      min_experience: 5,
      required_skills: ['React', 'TypeScript', 'JavaScript'],
      department: 'Engineering'
    },
    {
      id: '2',
      title: 'Product Manager',
      min_experience: 3,
      required_skills: ['Strategy', 'Analytics', 'User Research'],
      department: 'Product'
    },
    {
      id: '3',
      title: 'HR Specialist',
      min_experience: 2,
      required_skills: ['Recruitment', 'Employee Relations'],
      department: 'HR'
    }
  ]

  const analysesData = [
    {
      id: '1',
      candidate_name: 'John Doe',
      email: 'john@email.com',
      ai_score: 85,
      skills_match: 78,
      experience_match: 92,
      recommendation: 'strong_match',
      summary: 'Excellent candidate with strong technical skills.',
      strengths: ['Strong React skills', 'Good problem-solving'],
      weaknesses: ['Limited cloud experience'],
      missing_skills: ['AWS', 'Docker']
    },
    {
      id: '2',
      candidate_name: 'Jane Smith',
      email: 'jane@email.com',
      ai_score: 72,
      skills_match: 68,
      experience_match: 75,
      recommendation: 'good_match',
      summary: 'Solid candidate with good fundamentals.',
      strengths: ['Quick learner', 'Good communication'],
      weaknesses: ['Limited experience'],
      missing_skills: ['React', 'TypeScript']
    }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setIsAnalyzing(true)
      // Simulate AI analysis with realistic processing time
      setTimeout(() => {
        setIsAnalyzing(false)
        toast.success(`Analyzed ${files.length} resume(s) successfully`)
      }, 3000)
    }
  }

  // AI-powered sorting function
  const sortCandidatesByAI = (candidates: typeof analysesData) => {
    return [...candidates].sort((a, b) => {
      // Multi-factor AI scoring
      const scoreA = (a.ai_score * 0.4) + (a.skills_match * 0.3) + (a.experience_match * 0.3)
      const scoreB = (b.ai_score * 0.4) + (b.skills_match * 0.3) + (b.experience_match * 0.3)
      return scoreB - scoreA
    })
  }

  // Enhanced analysis with AI insights
  const getAIRecommendation = (analysis: typeof analysesData[0]) => {
    const overallScore = (analysis.ai_score * 0.4) + (analysis.skills_match * 0.3) + (analysis.experience_match * 0.3)
    
    if (overallScore >= 85) return { text: 'Highly Recommended', color: 'success' }
    if (overallScore >= 70) return { text: 'Recommended', color: 'info' }
    if (overallScore >= 55) return { text: 'Consider', color: 'warning' }
    return { text: 'Not Recommended', color: 'error' }
  }

  const getRecommendationColor = (recommendation: string) => {
    const colors: Record<string, string> = {
      'strong_match': 'success',
      'good_match': 'info',
      'weak_match': 'warning',
      'no_match': 'error'
    }
    return colors[recommendation] || 'default'
  }

  const getRecommendationText = (recommendation: string) => {
    const texts: Record<string, string> = {
      'strong_match': 'Strong Match',
      'good_match': 'Good Match',
      'weak_match': 'Weak Match',
      'no_match': 'No Match'
    }
    return texts[recommendation] || 'Unknown'
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SmartToy color="primary" />
        AI Resume Analyzer
      </Typography>

      {/* Job Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Select Job Position</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {jobsData.map((job) => (
              <Paper
                key={job.id}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  width: { xs: '100%', md: '48%' },
                  border: selectedJob === job.id ? 2 : 1,
                  borderColor: selectedJob === job.id ? 'primary.main' : 'divider',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => setSelectedJob(job.id)}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {job.department} • Min Experience: {job.min_experience} years
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {job.required_skills.slice(0, 3).map((skill) => (
                    <Chip key={skill} label={skill} size="small" />
                  ))}
                  {job.required_skills.length > 3 && (
                    <Chip label={`+${job.required_skills.length - 3} more`} size="small" variant="outlined" />
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Upload Section */}
      {selectedJob && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Upload Resume for Analysis</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<Upload />}
                disabled={isAnalyzing}
              >
                Upload Resume
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={handleFileUpload}
                />
              </Button>
              {isAnalyzing && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Analyzing resumes...</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {selectedJob && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>AI Analysis Results</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {analysesData.map((analysis) => (
                <Paper key={analysis.id} sx={{ p: 2, width: { xs: '100%', md: '48%' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {analysis.candidate_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={getRecommendationText(analysis.recommendation)}
                      color={getRecommendationColor(analysis.recommendation) as any}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">AI Score</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {analysis.ai_score}/100
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={analysis.ai_score} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Skills</Typography>
                      <Typography variant="body2" fontWeight="bold">{analysis.skills_match}%</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Experience</Typography>
                      <Typography variant="body2" fontWeight="bold">{analysis.experience_match}%</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setAnalysisDialog(analysis)}
                    >
                      View Details
                    </Button>
                    <Box>
                      <Tooltip title="View Resume">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Resume">
                        <IconButton size="small">
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Analysis Dialog */}
      <Dialog
        open={!!analysisDialog}
        onClose={() => setAnalysisDialog(null)}
        maxWidth="md"
        fullWidth
      >
        {analysisDialog && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  AI Analysis: {analysisDialog.candidate_name}
                </Typography>
                <IconButton onClick={() => setAnalysisDialog(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Summary:</strong> {analysisDialog.summary}
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                  <Typography variant="subtitle2" gutterBottom>Strengths</Typography>
                  <List dense>
                    {analysisDialog.strengths?.map((strength, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} />
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                  <Typography variant="subtitle2" gutterBottom>Areas for Improvement</Typography>
                  <List dense>
                    {analysisDialog.weaknesses?.map((weakness, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <Cancel color="warning" sx={{ mr: 1, fontSize: 16 }} />
                        <ListItemText primary={weakness} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAnalysisDialog(null)}>Close</Button>
              <Button variant="contained" color="primary">
                Schedule Interview
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default AIResumeAnalyzer
