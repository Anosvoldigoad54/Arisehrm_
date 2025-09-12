import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material'
import {
  Person,
  Notifications,
  Palette,
  Shield,
  Security,
  Storage,
  Upload,
  Email,
  Phone,
  Download,
  Delete,
  Key,
  CloudSync,
  Backup
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export const SettingsPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const [settings, setSettings] = useState({
    firstName: user?.user_metadata?.first_name || 'John',
    lastName: user?.user_metadata?.last_name || 'Doe',
    email: user?.email || 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Human Resources',
    position: 'HR Manager',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weekendNotifications: false,
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    profileVisibility: 'team',
    showEmail: true,
    showPhone: false,
    allowDirectMessages: true,
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 60,
    dataSharing: false,
    deviceTracking: true
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }

  const handleExportData = () => {
    toast.info('Data export initiated. You will receive an email when ready.')
  }

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false)
    toast.error('Account deletion initiated. Please check your email for confirmation.')
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Palette />} label="Appearance" />
          <Tab icon={<Shield />} label="Privacy" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Storage />} label="Data" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                  src={user?.user_metadata?.avatar_url}
                >
                  {settings.firstName.charAt(0)}{settings.lastName.charAt(0)}
                </Avatar>
                <Button variant="outlined" startIcon={<Upload />}>
                  Change Photo
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={settings.firstName}
                    onChange={(e) => handleSettingChange('firstName', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={settings.lastName}
                    onChange={(e) => handleSettingChange('lastName', e.target.value)}
                  />
                  <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                      InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} /> }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={settings.phone}
                    onChange={(e) => handleSettingChange('phone', e.target.value)}
                    InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  />
                  <TextField
                    fullWidth
                    label="Department"
                    value={settings.department}
                    onChange={(e) => handleSettingChange('department', e.target.value)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    />
                  }
                  label="SMS Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.weekendNotifications}
                      onChange={(e) => handleSettingChange('weekendNotifications', e.target.checked)}
                    />
                  }
                  label="Weekend Notifications"
                />
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Theme & Display
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      label="Theme"
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.language}
                      label="Language"
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Regional Settings
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      label="Timezone"
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Chicago">Central Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.dateFormat}
                      label="Date Format"
                      onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Privacy Tab */}
        <TabPanel value={activeTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Privacy Controls
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={settings.profileVisibility}
                    onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                    label="Profile Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="team">Team Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.showEmail}
                      onChange={(e) => handleSettingChange('showEmail', e.target.checked)}
                    />
                  }
                  label="Show Email Address"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.showPhone}
                      onChange={(e) => handleSettingChange('showPhone', e.target.checked)}
                    />
                  }
                  label="Show Phone Number"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowDirectMessages}
                      onChange={(e) => handleSettingChange('allowDirectMessages', e.target.checked)}
                    />
                  }
                  label="Allow Direct Messages"
                />
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorEnabled}
                        onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                      />
                    }
                    label="Two-Factor Authentication"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.loginAlerts}
                        onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                      />
                    }
                    label="Login Alerts"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Session Timeout (minutes)</InputLabel>
                    <Select
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                      label="Session Timeout (minutes)"
                    >
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={60}>1 hour</MenuItem>
                      <MenuItem value={240}>4 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Password & Access
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <Button variant="outlined" startIcon={<Key />}>
                    Change Password
                  </Button>
                  <Button variant="outlined" startIcon={<Shield />}>
                    Manage API Keys
                  </Button>
                  <Button variant="outlined" startIcon={<CloudSync />}>
                    Active Sessions
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Data Tab */}
        <TabPanel value={activeTab} index={5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Management
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleExportData}
                    fullWidth
                  >
                    Export My Data
                  </Button>
                  <Button variant="outlined" startIcon={<Backup />}>
                    Backup Settings
                  </Button>
                  <Button variant="outlined" startIcon={<Upload />}>
                    Import Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Danger Zone
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  These actions cannot be undone. Please proceed with caution.
                </Alert>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setDeleteDialogOpen(true)}
                  fullWidth
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 3 }}>
          <Button variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </Box>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SettingsPage
