import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Stack,
  Grid,
  Divider,
  Button,
  IconButton,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material'
import {
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Business,
  Work,
  School,
  Star,
  Edit,
  Message,
  Print,
  Share,
  Close,
  Person,
  Assignment,
  Timeline,
  Security,
  Badge,
} from '@mui/icons-material'
// Removed framer-motion animations for better performance
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { Database } from '../../types/database'

type Employee = Database['public']['Tables']['user_profiles']['Row']
import { useResponsive } from '../../hooks/useResponsive'

// Message service interface
interface MessageData {
  recipientId: string
  recipientEmail: string
  subject: string
  content: string
  senderId: string
}

// Emergency contact interface
interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

// Placeholder message service - in real implementation, this would integrate with email/messaging system
const sendMessageToEmployee = async (messageData: MessageData): Promise<void> => {
  // This would integrate with your actual messaging service (email, Slack, Teams, etc.)
  // For now, we'll simulate the API call
  
  // In production, this would log through proper logging service
  // loggingService.logInfo('Message sent to employee', { recipientId: messageData.recipientId })
  
  // In a real implementation, this could:
  // 1. Send via email using SendGrid, AWS SES, etc.
  // 2. Create internal message in the database
  // 3. Send push notification
  // 4. Integrate with Slack/Teams
  
  return new Promise((resolve) => {
    setTimeout(resolve, 500) // Simulate API delay
  })
}

interface EmployeeProfileProps {
  employee: Employee
  onEdit?: (employee: Employee) => void
  onClose?: () => void
  open?: boolean
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({
  employee,
  onEdit,
  onClose,
  open = true
}) => {
  const responsive = useResponsive()
  const [activeTab, setActiveTab] = useState(0)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast.error('Please fill in all message fields')
      return
    }

    setSendingMessage(true)
    try {
      // Simulate API call - send message
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Send message through proper messaging service
      await sendMessageToEmployee({
        recipientId: employee.id,
        recipientEmail: employee.email,
        subject: messageSubject,
        content: messageContent,
        senderId: 'current-user-id' // Should come from auth context
      })
      
      toast.success(`Message sent to ${employee.first_name} ${employee.last_name}`)
      setShowMessageDialog(false)
      setMessageSubject('')
      setMessageContent('')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handlePrint = () => {
    window.print()
    toast.info('Opening print dialog...')
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${employee.first_name} ${employee.last_name} - Profile`,
          text: `Employee profile for ${employee.first_name} ${employee.last_name}`,
          url: window.location.href
        })
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Profile link copied to clipboard')
      }
    } catch (error) {
      toast.error('Failed to share profile')
    }
  }

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({
    children,
    value,
    index
  }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={responsive.isMobile}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Person />
            <Typography variant="h6">Employee Profile</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => setShowMessageDialog(true)} size="small">
              <Message />
            </IconButton>
            <IconButton onClick={handlePrint} size="small">
              <Print />
            </IconButton>
            <IconButton onClick={handleShare} size="small">
              <Share />
            </IconButton>
            {onEdit && (
              <Button
                startIcon={<Edit />}
                onClick={() => onEdit(employee)}
                size="small"
                variant="outlined"
              >
                Edit
              </Button>
            )}
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Header Card */}
        <Card sx={{ m: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Stack direction={responsive.isMobile ? 'column' : 'row'} spacing={3} alignItems="center">
              <Avatar
                src={employee.profile_photo_url}
                sx={{ 
                  width: 120, 
                  height: 120,
                  border: '4px solid white',
                  boxShadow: 3
                }}
              >
                {employee.first_name?.[0]}{employee.last_name?.[0]}
              </Avatar>
              
              <Box sx={{ color: 'white', textAlign: responsive.isMobile ? 'center' : 'left' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {employee.first_name} {employee.last_name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }} gutterBottom>
                  {employee.position_id || 'Position not specified'}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent={responsive.isMobile ? 'center' : 'flex-start'}>
                  <Chip 
                    label={employee.employee_id} 
                    variant="filled" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip 
                    label={employee.employment_status || 'Active'} 
                    variant="filled"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Overview" />
            <Tab label="Contact Info" />
            <Tab label="Employment Details" />
            <Tab label="Skills & Education" />
            <Tab label="Emergency Contacts" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Email color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{employee.email}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Phone color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{employee.phone || 'Not provided'}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CalendarToday color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                      <Typography variant="body1">
                        {employee.date_of_birth ? format(parseISO(employee.date_of_birth), 'PPP') : 'Not provided'}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Box>
            
            <Box>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Work Information</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Business color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Department</Typography>
                      <Typography variant="body1">{employee.department_id || 'Not assigned'}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Work color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Position</Typography>
                      <Typography variant="body1">{employee.position_id || 'Not specified'}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CalendarToday color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Hire Date</Typography>
                      <Typography variant="body1">
                        {employee.hire_date ? format(parseISO(employee.hire_date), 'PPP') : 'Not provided'}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Contact Information</Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
                    <Typography variant="body1">{employee.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
                    <Typography variant="body1">{employee.phone || 'Not provided'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">{employee.address_line1 || 'Not provided'}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Employment Details</Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Employee ID</Typography>
                    <Typography variant="body1">{employee.employee_id}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Employment Status</Typography>
                    <Typography variant="body1">{employee.employment_status || 'Active'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Employment Type</Typography>
                    <Typography variant="body1">{employee.employment_type || 'Full-time'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Hire Date</Typography>
                    <Typography variant="body1">
                      {employee.hire_date ? format(parseISO(employee.hire_date), 'PPP') : 'Not provided'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Skills</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {employee.skills && employee.skills.length > 0 ? (
                    employee.skills.map((skill: string, index: number) => (
                      <Chip key={index} label={skill} variant="outlined" />
                    ))
                  ) : (
                    <Typography color="text.secondary">No skills listed</Typography>
                  )}
                </Stack>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Certifications</Typography>
                <Stack spacing={2}>
                  {employee.certifications && employee.certifications.length > 0 ? (
                    employee.certifications.map((cert: string, index: number) => (
                      <Box key={index}>
                        <Typography variant="body1">{cert}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography color="text.secondary">No certifications listed</Typography>
                  )}
                </Stack>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Emergency Contacts</Typography>
            {employee.emergency_contacts && employee.emergency_contacts.length > 0 ? (
              <List>
                {(employee.emergency_contacts as EmergencyContact[])?.map((contact: EmergencyContact, index: number) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={contact.name}
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="body2">
                            Relationship: {contact.relationship}
                          </Typography>
                          <Typography variant="body2">
                            Phone: {contact.phone}
                          </Typography>
                          {contact.email && (
                            <Typography variant="body2">
                              Email: {contact.email}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No emergency contacts listed</Typography>
            )}
          </Paper>
        </TabPanel>
      </DialogContent>

      {/* Message Dialog */}
      <Dialog
        open={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Send Message to {employee.first_name} {employee.last_name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Subject"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              disabled={sendingMessage}
              required
            />
            <TextField
              fullWidth
              label="Message"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              disabled={sendingMessage}
              required
              multiline
              rows={6}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMessageDialog(false)} disabled={sendingMessage}>
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            disabled={sendingMessage || !messageSubject.trim() || !messageContent.trim()}
            startIcon={sendingMessage ? <CircularProgress size={20} /> : <Message />}
          >
            {sendingMessage ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}

export default EmployeeProfile