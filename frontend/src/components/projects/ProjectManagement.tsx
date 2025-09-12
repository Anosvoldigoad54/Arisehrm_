'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Avatar,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material'
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Group,
  CalendarToday,
  Assignment,
  TrendingUp,
} from '@mui/icons-material'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'completed' | 'on-hold'
  progress: number
  startDate: string
  endDate: string
  teamMembers: number
  budget?: number
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'HR Portal Redesign',
      description: 'Modernize the employee self-service portal',
      status: 'active',
      progress: 65,
      startDate: '2024-01-15',
      endDate: '2024-03-30',
      teamMembers: 5,
      budget: 50000
    },
    {
      id: '2',
      name: 'Performance Review System',
      description: 'Implement new performance evaluation process',
      status: 'planning',
      progress: 15,
      startDate: '2024-02-01',
      endDate: '2024-05-15',
      teamMembers: 3,
      budget: 30000
    },
    {
      id: '3',
      name: 'Employee Training Platform',
      description: 'Build comprehensive learning management system',
      status: 'active',
      progress: 40,
      startDate: '2024-01-01',
      endDate: '2024-04-30',
      teamMembers: 8,
      budget: 75000
    }
  ])

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'success'
      case 'completed': return 'primary'
      case 'planning': return 'warning'
      case 'on-hold': return 'error'
      default: return 'default'
    }
  }

  const handleCreateProject = () => {
    setSelectedProject(null)
    setOpenDialog(true)
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setOpenDialog(true)
    setAnchorEl(null)
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId))
    toast.success('Project deleted successfully')
    setAnchorEl(null)
  }

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (selectedProject) {
      // Edit existing project
      setProjects(projects.map(p => 
        p.id === selectedProject.id 
          ? { ...p, ...projectData }
          : p
      ))
      toast.success('Project updated successfully')
    } else {
      // Create new project
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectData.name || '',
        description: projectData.description || '',
        status: 'planning',
        progress: 0,
        startDate: projectData.startDate || new Date().toISOString().split('T')[0],
        endDate: projectData.endDate || '',
        teamMembers: projectData.teamMembers || 1,
        budget: projectData.budget
      }
      setProjects([...projects, newProject])
      toast.success('Project created successfully')
    }
    setOpenDialog(false)
  }

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
            {project.name}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              setSelectedProject(project)
              setAnchorEl(e.currentTarget)
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {project.description}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip 
            label={project.status.replace('-', ' ')} 
            color={getStatusColor(project.status)}
            size="small"
          />
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">{project.progress}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={project.progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Group fontSize="small" color="action" />
            <Typography variant="body2">{project.teamMembers} members</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="body2">{new Date(project.endDate).toLocaleDateString()}</Typography>
          </Stack>
        </Box>

        {project.budget && (
          <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'medium' }}>
            Budget: ${project.budget.toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Project Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateProject}
        >
          New Project
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Basic project management functionality. Advanced features like task management, 
        time tracking, and team collaboration will be added in future updates.
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </Box>

      {/* Project Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => selectedProject && handleEditProject(selectedProject)}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Project
        </MenuItem>
        <MenuItem onClick={() => selectedProject && handleDeleteProject(selectedProject.id)}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Project
        </MenuItem>
      </Menu>

      {/* Create/Edit Project Dialog */}
      <ProjectDialog
        open={openDialog}
        project={selectedProject}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveProject}
      />
    </Box>
  )
}

interface ProjectDialogProps {
  open: boolean
  project: Project | null
  onClose: () => void
  onSave: (project: Partial<Project>) => void
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({ open, project, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    teamMembers: 1,
    budget: undefined
  })

  useEffect(() => {
    if (project) {
      setFormData(project)
    } else {
      setFormData({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        teamMembers: 1,
        budget: undefined
      })
    }
  }, [project, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) {
      toast.error('Project name is required')
      return
    }
    onSave(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {project ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Project Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Team Members"
                type="number"
                value={formData.teamMembers || 1}
                onChange={(e) => setFormData({ ...formData, teamMembers: parseInt(e.target.value) || 1 })}
                fullWidth
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Budget ($)"
                type="number"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || undefined })}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {project ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ProjectManagement
