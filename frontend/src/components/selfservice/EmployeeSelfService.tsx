'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  IconButton,
  Chip,
  Stack,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Badge,
} from '@mui/material'
import {
  Person,
  Edit,
  Save,
  Cancel,
  Upload,
  Download,
  Notifications,
  Security,
  Work,
  Schedule,
  RequestQuote,
  Assignment,
  School,
  HealthAndSafety,
  Phone,
  Email,
  Home,
  Business,
  Family,
  Description,
  CalendarToday,
  CheckCircle,
  Pending,
  Info,
  Warning,
  Error,
  Close,
  Add,
  Visibility,
  CloudUpload,
  GetApp,
  History,
  TrendingUp,
  Assessment,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useResponsive } from '../../hooks/useResponsive'
import { toast } from 'sonner'
import * as buttonHandlers from '../../utils/buttonHandlers'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`self-service-tabpanel-${index}`}
      aria-labelledby={`self-service-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export function EmployeeSelfService() {
  const { profile } = useAuth()
  const theme = useTheme()
  const responsive = useResponsive()
  
  // State
  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState<string | null>(null)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestType, setRequestType] = useState('')
  
  // Mock employee data
  const [employeeData, setEmployeeData] = useState({
    personal: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      preferredName: 'Sarah',
      email: 'sarah.johnson@company.com',
      phone: '+1-555-0123',
      mobile: '+1-555-0124',
      address: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      dateOfBirth: '1990-03-15',
      emergencyContact: {
        name: 'John Johnson',
        relationship: 'Spouse',
        phone: '+1-555-0125',
      }
    },
    professional: {
      employeeId: 'EMP001',
      position: 'Senior Software Engineer',
      department: 'Engineering',
      manager: 'Mike Chen',
      startDate: '2022-01-15',
      employmentType: 'Full-time',
      workLocation: 'Hybrid',
      salary: '$85,000',
    },
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      language: 'English',
      timezone: 'EST',
      theme: 'System',
    }
  })

  // Mock requests data
  const [requests, setRequests] = useState([
    {
      id: '1',
      type: 'Time Off',
      description: 'Vacation Leave - Dec 20-27',
      status: 'Approved',
      submitDate: '2024-01-10',
      approver: 'Mike Chen',
    },
    {
      id: '2',
      type: 'Equipment',
      description: 'New laptop request',
      status: 'Pending',
      submitDate: '2024-01-12',
      approver: 'IT Department',
    },
    {
      id: '3',
      type: 'Training',
      description: 'AWS Certification Course',
      status: 'In Review',
      submitDate: '2024-01-08',
      approver: 'HR Department',
    }
  ])

  // Mock documents
  const [documents, setDocuments] = useState([
    { id: '1', name: 'Employment Contract', type: 'Contract', date: '2022-01-15', size: '1.2 MB' },
    { id: '2', name: 'Performance Review 2023', type: 'Review', date: '2023-12-15', size: '856 KB' },
    { id: '3', name: 'Tax Documents W-2', type: 'Tax', date: '2023-01-31', size: '324 KB' },
    { id: '4', name: 'Benefits Enrollment', type: 'Benefits', date: '2022-01-20', size: '445 KB' },
  ])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleEditToggle = (section: string) => {
    setEditMode(editMode === section ? null : section)
  }

  const handleSave = (section: string) => {
    buttonHandlers.handleSaveSettings({ section, data: employeeData })
    setEditMode(null)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      case 'in review': return 'info'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle />
      case 'pending': return <Pending />
      case 'rejected': return <Error />
      case 'in review': return <Info />
      default: return <Info />
    }
  }

  // Personal Information Tab
  const PersonalInfoTab = () => (
    <Grid container spacing={responsive.getSpacing(2, 3, 4)}>
      <Grid>
        <Card sx={{ textAlign: 'center', p: responsive.getPadding(2, 3) }}>
          <Avatar
            sx={{
              width: responsive.isMobile ? 80 : 120,
              height: responsive.isMobile ? 80 : 120,
              mx: 'auto',
              mb: responsive.getSpacing(1, 2)
            }}
            src={profile?.profile_photo_url}
          >
            {employeeData.personal.firstName[0]}{employeeData.personal.lastName[0]}
          </Avatar>
          <Typography variant={responsive.getVariant('subtitle1', 'h6')} gutterBottom>
            {employeeData.personal.firstName} {employeeData.personal.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {employeeData.professional.position}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            fullWidth
            size={responsive.getButtonSize()}
            sx={{ mt: responsive.getSpacing(1, 2) }}
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (!file) return
                try {
                  const url = URL.createObjectURL(file)
                  // Preview by updating avatar via local state
                  setEmployeeData(prev => ({
                    ...prev,
                    personal: { ...prev.personal }
                  }))
                  const img = document.querySelector('#selfservice-avatar') as HTMLImageElement | null
                  if (img) img.src = url
                  toast.success('Photo selected (not uploaded)')
                } catch {
                  toast.error('Failed to select photo')
                }
              }
              input.click()
            }}
          >
            Update Photo
          </Button>
        </Card>
      </Grid>

      <Grid>
        <Card sx={{ p: responsive.getPadding(2, 3) }}>
          <Stack
            direction={responsive.getFlexDirection('column', 'row')}
            justifyContent="space-between"
            alignItems={responsive.isMobile ? "stretch" : "center"}
            spacing={responsive.getSpacing(2, 0)}
            sx={{ mb: responsive.getSpacing(2, 3) }}
          >
            <Typography variant={responsive.getVariant('subtitle1', 'h6')}>Personal Information</Typography>
            <Button
              startIcon={editMode === 'personal' ? <Save /> : <Edit />}
              onClick={() => editMode === 'personal' ? handleSave('personal') : handleEditToggle('personal')}
              variant={editMode === 'personal' ? 'contained' : 'outlined'}
              size={responsive.getButtonSize()}
              fullWidth={responsive.isMobile}
            >
              {editMode === 'personal' ? 'Save' : 'Edit'}
            </Button>
          </Stack>

          <Grid container spacing={responsive.getSpacing(2, 3)}>
            <Grid>
              <TextField
                fullWidth
                label="First Name"
                value={employeeData.personal.firstName}
                disabled={editMode !== 'personal'}
                size={responsive.getInputSize()}
                onChange={(e) => setEmployeeData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, firstName: e.target.value }
                }))}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                label="Last Name"
                value={employeeData.personal.lastName}
                disabled={editMode !== 'personal'}
                size={responsive.getInputSize()}
                onChange={(e) => setEmployeeData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, lastName: e.target.value }
                }))}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                label="Email"
                size={responsive.getInputSize()}
                value={employeeData.personal.email}
                disabled={editMode !== 'personal'}
                type="email"
                onChange={(e) => setEmployeeData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, email: e.target.value }
                }))}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Phone"
                value={employeeData.personal.phone}
                disabled={editMode !== 'personal'}
                onChange={(e) => setEmployeeData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, phone: e.target.value }
                }))}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Address"
                value={employeeData.personal.address}
                disabled={editMode !== 'personal'}
                onChange={(e) => setEmployeeData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, address: e.target.value }
                }))}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Emergency Contact
          </Typography>
          <Grid container spacing={3}>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Contact Name"
                value={employeeData.personal.emergencyContact.name}
                disabled={editMode !== 'personal'}
                onChange={(e) => setEmployeeData(prev => ({
                  ...prev,
                  personal: {
                    ...prev.personal,
                    emergencyContact: { ...prev.personal.emergencyContact, name: e.target.value }
                  }
                }))}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Relationship"
                value={employeeData.personal.emergencyContact.relationship}
                disabled={editMode !== 'personal'}
                onChange={(e) => setEmployeeData(prev => ({
                  ...prev,
                  personal: {
                    ...prev.personal,
                    emergencyContact: { ...prev.personal.emergencyContact, relationship: e.target.value }
                  }
                }))}
              />
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  )

  // Professional Information Tab
  const ProfessionalInfoTab = () => (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Professional Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your professional details. Contact HR to make changes.
      </Typography>

      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            fullWidth
            label="Employee ID"
            value={employeeData.professional.employeeId}
            disabled
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            fullWidth
            label="Position"
            value={employeeData.professional.position}
            disabled
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            fullWidth
            label="Department"
            value={employeeData.professional.department}
            disabled
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            fullWidth
            label="Manager"
            value={employeeData.professional.manager}
            disabled
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            fullWidth
            label="Start Date"
            value={employeeData.professional.startDate}
            disabled
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            fullWidth
            label="Employment Type"
            value={employeeData.professional.employmentType}
            disabled
          />
        </Grid>
      </Grid>
    </Card>
  )

  // Requests Tab
  const RequestsTab = () => (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">My Requests</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowRequestDialog(true)}
        >
          New Request
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {requests.map((request) => (
          <Grid
            key={request.id}
            size={{
              xs: 12,
              md: 6,
              lg: 4
            }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                        {request.type}
                      </Typography>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status) as any}
                        size="small"
                        icon={getStatusIcon(request.status)}
                      />
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary">
                      {request.description}
                    </Typography>
                    
                    <Divider />
                    
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Submitted:</strong> {request.submitDate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Approver:</strong> {request.approver}
                      </Typography>
                    </Stack>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      fullWidth
                    >
                      View Details
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )

  // Documents Tab
  const DocumentsTab = () => (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">My Documents</Typography>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={buttonHandlers.handleDocumentUpload}
        >
          Upload Document
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid
            key={doc.id}
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Description color="primary" />
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        {doc.name}
                      </Typography>
                    </Stack>
                    
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Type: {doc.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date: {doc.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size: {doc.size}
                      </Typography>
                    </Stack>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GetApp />}
                      fullWidth
                      onClick={() => buttonHandlers.handleDocumentDownload(doc.id)}
                    >
                      Download
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )

  // Preferences Tab
  const PreferencesTab = () => (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Preferences</Typography>
        <Button
          startIcon={<Save />}
          variant="contained"
          onClick={() => handleSave('preferences')}
        >
          Save Changes
        </Button>
      </Stack>

      <Stack spacing={4}>
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Email />
              </ListItemIcon>
              <ListItemText primary="Email Notifications" secondary="Receive updates via email" />
              <ListItemSecondaryAction>
                <Switch
                  checked={employeeData.preferences.notifications.email}
                  onChange={(e) => setEmployeeData(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      notifications: { ...prev.preferences.notifications, email: e.target.checked }
                    }
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Phone />
              </ListItemIcon>
              <ListItemText primary="SMS Notifications" secondary="Receive updates via SMS" />
              <ListItemSecondaryAction>
                <Switch
                  checked={employeeData.preferences.notifications.sms}
                  onChange={(e) => setEmployeeData(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      notifications: { ...prev.preferences.notifications, sms: e.target.checked }
                    }
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText primary="Push Notifications" secondary="Receive browser notifications" />
              <ListItemSecondaryAction>
                <Switch
                  checked={employeeData.preferences.notifications.push}
                  onChange={(e) => setEmployeeData(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      notifications: { ...prev.preferences.notifications, push: e.target.checked }
                    }
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Box>

        <Divider />

        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={employeeData.preferences.language}
                label="Language"
                onChange={(e) => setEmployeeData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, language: e.target.value }
                }))}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Spanish">Spanish</MenuItem>
                <MenuItem value="French">French</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={employeeData.preferences.timezone}
                label="Timezone"
                onChange={(e) => setEmployeeData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, timezone: e.target.value }
                }))}
              >
                <MenuItem value="EST">Eastern (EST)</MenuItem>
                <MenuItem value="CST">Central (CST)</MenuItem>
                <MenuItem value="MST">Mountain (MST)</MenuItem>
                <MenuItem value="PST">Pacific (PST)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Stack>
    </Card>
  )

  // New Request Dialog
  const NewRequestDialog = () => (
    <Dialog
      open={showRequestDialog}
      onClose={() => setShowRequestDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          New Request
          <IconButton onClick={() => setShowRequestDialog(false)}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Request Type</InputLabel>
            <Select
              value={requestType}
              label="Request Type"
              onChange={(e) => setRequestType(e.target.value)}
            >
              <MenuItem value="time-off">Time Off</MenuItem>
              <MenuItem value="equipment">Equipment Request</MenuItem>
              <MenuItem value="training">Training Request</MenuItem>
              <MenuItem value="expense">Expense Reimbursement</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            placeholder="Please describe your request in detail..."
          />
          
          <TextField
            fullWidth
            label="Justification"
            multiline
            rows={3}
            placeholder="Why is this request necessary?"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowRequestDialog(false)}>
          Cancel
        </Button>
        <Button variant="contained">
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Box sx={{ p: responsive.getPadding(2, 3) }} className="container-fluid px-2 px-md-3 px-lg-4">
      {/* Header */}
      <Stack spacing={responsive.getSpacing(2, 2)} sx={{ mb: responsive.getSpacing(3, 4) }}>
        <Typography variant={responsive.getVariant('h5', 'h4')} sx={{ fontWeight: 700 }}>
          Employee Self-Service
        </Typography>
        <Typography variant={responsive.getVariant('body2', 'body1')} color="text.secondary">
          Manage your personal information, view documents, and submit requests
        </Typography>
      </Stack>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={responsive.isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          allowScrollButtonsMobile={responsive.isMobile}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: responsive.isMobile ? 56 : 72,
              textTransform: 'none',
              fontSize: responsive.isMobile ? '0.875rem' : '1rem',
            }
          }}
        >
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<Work />} label="Professional" />
          <Tab icon={<Assignment />} label="Requests" />
          <Tab icon={<Description />} label="Documents" />
          <Tab icon={<Security />} label="Preferences" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <PersonalInfoTab />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <ProfessionalInfoTab />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <RequestsTab />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <DocumentsTab />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <PreferencesTab />
        </TabPanel>
      </Paper>

      {/* New Request Dialog */}
      <NewRequestDialog />
    </Box>
  )
}
