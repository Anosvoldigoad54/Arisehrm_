import React, { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  Chip,
  Badge,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  LinearProgress,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Card,
  CardContent,
  CardActions,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Close,
  Send,
  AttachFile,
  EmojiEmotions,
  Search,
  MoreVert,
  Reply,
  Forward,
  Delete,
  Archive,
  Star,
  StarBorder,
  Drafts,
  Inbox,
  Outbox,
  People,
  Person,
  Group,
  Schedule,
  AttachMoney,
  Notification,
  Priority,
  ExpandMore,
  Image,
  Description,
  VideoLibrary,
  AudioFile,
  GetApp,
  Refresh,
  FilterList,
  Check,
  CheckCircle,
  Email,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { useResponsive } from '../../hooks/useResponsive'
import { useAuth } from '../../contexts/AuthContext'

interface Message {
  id: string
  subject: string
  body: string
  sender: {
    id: string
    name: string
    email: string
    avatar?: string
    role?: string
  }
  recipients: Array<{
    id: string
    name: string
    email: string
    type: 'to' | 'cc' | 'bcc'
  }>
  timestamp: string
  read: boolean
  starred: boolean
  archived: boolean
  priority: 'low' | 'normal' | 'high'
  category: 'general' | 'hr' | 'it' | 'finance' | 'announcement' | 'personal'
  attachments?: Array<{
    id: string
    name: string
    size: number
    type: string
    url: string
  }>
  threadId?: string
  replyTo?: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

interface Contact {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
  department?: string
  status: 'online' | 'away' | 'offline'
}

interface MessageCenterProps {
  open: boolean
  onClose: () => void
  preselectedRecipient?: Contact
}

const MessageCenter: React.FC<MessageCenterProps> = ({
  open,
  onClose,
  preselectedRecipient
}) => {
  const theme = useTheme()
  const responsive = useResponsive()
  const { profile } = useAuth()
  
  const [activeTab, setActiveTab] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [composing, setComposing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [contacts, setContacts] = useState<Contact[]>([])
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    to: preselectedRecipient ? [preselectedRecipient] : [] as Contact[],
    cc: [] as Contact[],
    bcc: [] as Contact[],
    subject: '',
    body: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    category: 'general' as Message['category'],
    attachments: [] as File[]
  })
  
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock data
  useEffect(() => {
    loadMessages()
    loadContacts()
  }, [])

  useEffect(() => {
    if (preselectedRecipient) {
      setComposeForm(prev => ({
        ...prev,
        to: [preselectedRecipient]
      }))
      setComposing(true)
    }
  }, [preselectedRecipient])

  const loadMessages = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockMessages: Message[] = [
        {
          id: '1',
          subject: 'Welcome to the Team!',
          body: 'Hi there! Welcome to Arise HRM. We\'re excited to have you on board. This is your central hub for all HR-related communications...',
          sender: {
            id: 'hr-system',
            name: 'HR System',
            email: 'hr@company.com',
            role: 'System'
          },
          recipients: [
            { id: profile?.id || 'user', name: profile?.first_name + ' ' + profile?.last_name || 'User', email: profile?.email || 'user@company.com', type: 'to' }
          ],
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
          starred: false,
          archived: false,
          priority: 'normal',
          category: 'hr',
          status: 'delivered'
        },
        {
          id: '2',
          subject: 'Your Leave Request Status',
          body: 'Your leave request for Dec 25-30 has been approved. Please make sure to update your project assignments before your leave starts.',
          sender: {
            id: 'manager-1',
            name: 'John Smith',
            email: 'john.smith@company.com',
            avatar: '/avatars/john-smith.jpg',
            role: 'Manager'
          },
          recipients: [
            { id: profile?.id || 'user', name: profile?.first_name + ' ' + profile?.last_name || 'User', email: profile?.email || 'user@company.com', type: 'to' }
          ],
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: true,
          starred: true,
          archived: false,
          priority: 'high',
          category: 'hr',
          status: 'read'
        },
        {
          id: '3',
          subject: 'Monthly Team Meeting',
          body: 'Don\'t forget about our monthly team meeting tomorrow at 2 PM. We\'ll be discussing Q4 objectives and project updates.',
          sender: {
            id: 'team-lead',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            role: 'Team Lead'
          },
          recipients: [
            { id: profile?.id || 'user', name: profile?.first_name + ' ' + profile?.last_name || 'User', email: profile?.email || 'user@company.com', type: 'to' }
          ],
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          read: false,
          starred: false,
          archived: false,
          priority: 'normal',
          category: 'general',
          status: 'delivered'
        },
        {
          id: '4',
          subject: 'System Maintenance Notice',
          body: 'The HR system will be undergoing maintenance this weekend. Please save any important work before Friday 6 PM.',
          sender: {
            id: 'it-admin',
            name: 'IT Administration',
            email: 'it@company.com',
            role: 'Admin'
          },
          recipients: [
            { id: 'all-users', name: 'All Users', email: 'all@company.com', type: 'to' }
          ],
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: true,
          starred: false,
          archived: false,
          priority: 'normal',
          category: 'announcement',
          status: 'delivered'
        }
      ]
      
      setMessages(mockMessages)
    } finally {
      setLoading(false)
    }
  }

  const loadContacts = async () => {
    const mockContacts: Contact[] = [
      {
        id: 'contact-1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        avatar: '/avatars/john-smith.jpg',
        role: 'Manager',
        department: 'Engineering',
        status: 'online'
      },
      {
        id: 'contact-2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        role: 'Team Lead',
        department: 'Engineering',
        status: 'online'
      },
      {
        id: 'contact-3',
        name: 'Mike Wilson',
        email: 'mike.wilson@company.com',
        role: 'Developer',
        department: 'Engineering',
        status: 'away'
      },
      {
        id: 'contact-4',
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        role: 'HR Manager',
        department: 'Human Resources',
        status: 'online'
      },
      {
        id: 'contact-5',
        name: 'David Brown',
        email: 'david.brown@company.com',
        role: 'Finance Manager',
        department: 'Finance',
        status: 'offline'
      }
    ]
    
    setContacts(mockContacts)
  }

  const handleSendMessage = async () => {
    if (!composeForm.subject.trim() || !composeForm.body.trim() || composeForm.to.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setSending(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newMessage: Message = {
        id: Date.now().toString(),
        subject: composeForm.subject,
        body: composeForm.body,
        sender: {
          id: profile?.id || 'current-user',
          name: profile?.first_name + ' ' + profile?.last_name || 'Current User',
          email: profile?.email || 'current@company.com',
          role: profile?.role?.display_name || 'Employee'
        },
        recipients: composeForm.to.map(contact => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          type: 'to' as const
        })),
        timestamp: new Date().toISOString(),
        read: true,
        starred: false,
        archived: false,
        priority: composeForm.priority,
        category: composeForm.category,
        status: 'sent'
      }
      
      setMessages(prev => [newMessage, ...prev])
      
      // Reset form
      setComposeForm({
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        body: '',
        priority: 'normal',
        category: 'general',
        attachments: []
      })
      
      setComposing(false)
      toast.success('Message sent successfully!')
      
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleFileAttach = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setComposeForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setComposeForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const toggleMessageStar = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
      )
    )
  }

  const markAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    )
  }

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    toast.success('Message deleted')
  }

  const getFilteredMessages = () => {
    let filtered = messages

    if (searchQuery) {
      filtered = filtered.filter(msg =>
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(msg => msg.category === filterCategory)
    }

    switch (activeTab) {
      case 0: // Inbox
        return filtered.filter(msg => !msg.archived)
      case 1: // Starred
        return filtered.filter(msg => msg.starred)
      case 2: // Sent
        return filtered.filter(msg => msg.sender.id === (profile?.id || 'current-user'))
      case 3: // Archive
        return filtered.filter(msg => msg.archived)
      default:
        return filtered
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main
      case 'low':
        return theme.palette.success.main
      default:
        return theme.palette.info.main
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hr':
        return theme.palette.primary.main
      case 'it':
        return theme.palette.secondary.main
      case 'finance':
        return theme.palette.success.main
      case 'announcement':
        return theme.palette.warning.main
      default:
        return theme.palette.info.main
    }
  }

  const unreadCount = messages.filter(msg => !msg.read && !msg.archived).length
  const starredCount = messages.filter(msg => msg.starred).length
  const filteredMessages = getFilteredMessages()

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({
    children, value, index
  }) => (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={responsive.isMobile}
      PaperProps={{
        sx: { height: responsive.isMobile ? '100%' : '90vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Email />
            <Typography variant="h6">Message Center</Typography>
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="primary">
                <Typography variant="body2" color="text.secondary">
                  ({unreadCount} unread)
                </Typography>
              </Badge>
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={() => setComposing(true)}
              disabled={composing}
            >
              Compose
            </Button>
            <IconButton onClick={loadMessages} disabled={loading}>
              <Refresh />
            </IconButton>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Sidebar */}
          <Paper
            sx={{
              width: responsive.isMobile ? '100%' : 280,
              borderRadius: 0,
              borderRight: `1px solid ${theme.palette.divider}`
            }}
          >
            {/* Search */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>

            {/* Filters */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                  <MenuItem value="it">IT</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="announcement">Announcements</MenuItem>
                  <MenuItem value="personal">Personal</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Tabs */}
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              <Tab
                icon={<Inbox />}
                iconPosition="start"
                label={
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                    <span>Inbox</span>
                    {unreadCount > 0 && <Chip label={unreadCount} size="small" color="primary" />}
                  </Stack>
                }
                sx={{ alignItems: 'flex-start' }}
              />
              <Tab
                icon={<Star />}
                iconPosition="start"
                label={
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                    <span>Starred</span>
                    {starredCount > 0 && <Chip label={starredCount} size="small" />}
                  </Stack>
                }
                sx={{ alignItems: 'flex-start' }}
              />
              <Tab
                icon={<Outbox />}
                iconPosition="start"
                label="Sent"
                sx={{ alignItems: 'flex-start' }}
              />
              <Tab
                icon={<Archive />}
                iconPosition="start"
                label="Archive"
                sx={{ alignItems: 'flex-start' }}
              />
            </Tabs>
          </Paper>

          {/* Main Content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {composing ? (
              /* Compose Form */
              <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Compose Message
                </Typography>

                <Stack spacing={3}>
                  {/* Recipients */}
                  <Box>
                    <Autocomplete
                      multiple
                      options={contacts}
                      value={composeForm.to}
                      onChange={(_, value) => setComposeForm(prev => ({ ...prev, to: value }))}
                      getOptionLabel={(option) => `${option.name} (${option.email})`}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Avatar
                            src={option.avatar}
                            sx={{ width: 24, height: 24, mr: 2 }}
                          >
                            {option.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.email} • {option.role}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option.id}
                            avatar={<Avatar src={option.avatar}>{option.name[0]}</Avatar>}
                            label={option.name}
                            size="small"
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="To"
                          placeholder="Select recipients..."
                          required
                        />
                      )}
                    />

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        onClick={() => setShowCC(!showCC)}
                        color={showCC ? 'primary' : 'inherit'}
                      >
                        CC
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setShowBCC(!showBCC)}
                        color={showBCC ? 'primary' : 'inherit'}
                      >
                        BCC
                      </Button>
                    </Stack>

                    {showCC && (
                      <Autocomplete
                        multiple
                        options={contacts}
                        value={composeForm.cc}
                        onChange={(_, value) => setComposeForm(prev => ({ ...prev, cc: value }))}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="CC"
                            placeholder="Carbon copy..."
                            sx={{ mt: 1 }}
                          />
                        )}
                      />
                    )}

                    {showBCC && (
                      <Autocomplete
                        multiple
                        options={contacts}
                        value={composeForm.bcc}
                        onChange={(_, value) => setComposeForm(prev => ({ ...prev, bcc: value }))}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="BCC"
                            placeholder="Blind carbon copy..."
                            sx={{ mt: 1 }}
                          />
                        )}
                      />
                    )}
                  </Box>

                  {/* Subject and metadata */}
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={composeForm.priority}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, priority: e.target.value as any }))}
                        label="Priority"
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="normal">Normal</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={composeForm.category}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, category: e.target.value as any }))}
                        label="Category"
                      >
                        <MenuItem value="general">General</MenuItem>
                        <MenuItem value="hr">HR</MenuItem>
                        <MenuItem value="it">IT</MenuItem>
                        <MenuItem value="finance">Finance</MenuItem>
                        <MenuItem value="announcement">Announcement</MenuItem>
                        <MenuItem value="personal">Personal</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  {/* Message body */}
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Message"
                    value={composeForm.body}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Type your message here..."
                    required
                  />

                  {/* Attachments */}
                  {composeForm.attachments.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments ({composeForm.attachments.length})
                      </Typography>
                      <Stack spacing={1}>
                        {composeForm.attachments.map((file, index) => (
                          <Card key={index} variant="outlined">
                            <CardContent sx={{ py: 1 }}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Description color="primary" />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2">{file.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() => removeAttachment(index)}
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Actions */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<AttachFile />}
                        onClick={handleFileAttach}
                      >
                        Attach Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={2}>
                      <Button
                        onClick={() => setComposing(false)}
                        disabled={sending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={sending ? <CircularProgress size={16} /> : <Send />}
                        onClick={handleSendMessage}
                        disabled={sending || !composeForm.subject.trim() || !composeForm.body.trim() || composeForm.to.length === 0}
                      >
                        {sending ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            ) : selectedMessage ? (
              /* Message View */
              <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Button
                      startIcon={<Reply />}
                      onClick={() => {
                        setComposeForm(prev => ({
                          ...prev,
                          to: [selectedMessage.sender],
                          subject: selectedMessage.subject.startsWith('Re:') ? selectedMessage.subject : `Re: ${selectedMessage.subject}`
                        }))
                        setComposing(true)
                        setSelectedMessage(null)
                      }}
                    >
                      Back to Messages
                    </Button>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        onClick={() => toggleMessageStar(selectedMessage.id)}
                        color={selectedMessage.starred ? 'primary' : 'default'}
                      >
                        {selectedMessage.starred ? <Star /> : <StarBorder />}
                      </IconButton>
                      <IconButton onClick={() => deleteMessage(selectedMessage.id)} color="error">
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="h6">{selectedMessage.subject}</Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label={selectedMessage.priority}
                              size="small"
                              sx={{ bgcolor: alpha(getPriorityColor(selectedMessage.priority), 0.1) }}
                            />
                            <Chip
                              label={selectedMessage.category}
                              size="small"
                              sx={{ bgcolor: alpha(getCategoryColor(selectedMessage.category), 0.1) }}
                            />
                          </Stack>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar src={selectedMessage.sender.avatar}>
                            {selectedMessage.sender.name[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedMessage.sender.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedMessage.sender.email} • {selectedMessage.sender.role}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDistanceToNow(new Date(selectedMessage.timestamp), { addSuffix: true })}
                          </Typography>
                        </Stack>

                        <Divider />

                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {selectedMessage.body}
                        </Typography>

                        {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Attachments
                            </Typography>
                            <Stack spacing={1}>
                              {selectedMessage.attachments.map((attachment) => (
                                <Card key={attachment.id} variant="outlined">
                                  <CardContent sx={{ py: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <Description color="primary" />
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2">{attachment.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {(attachment.size / 1024).toFixed(1)} KB
                                        </Typography>
                                      </Box>
                                      <IconButton size="small">
                                        <GetApp />
                                      </IconButton>
                                    </Stack>
                                  </CardContent>
                                </Card>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                    <CardActions>
                      <Button
                        startIcon={<Reply />}
                        onClick={() => {
                          setComposeForm(prev => ({
                            ...prev,
                            to: [selectedMessage.sender],
                            subject: selectedMessage.subject.startsWith('Re:') ? selectedMessage.subject : `Re: ${selectedMessage.subject}`
                          }))
                          setComposing(true)
                          setSelectedMessage(null)
                        }}
                      >
                        Reply
                      </Button>
                      <Button startIcon={<Forward />}>
                        Forward
                      </Button>
                    </CardActions>
                  </Card>
                </Stack>
              </Box>
            ) : (
              /* Message List */
              <Box sx={{ height: '100%', overflow: 'auto' }}>
                {loading && <LinearProgress />}
                
                <TabPanel value={activeTab} index={activeTab}>
                  {filteredMessages.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Drafts sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No messages found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || filterCategory !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Your inbox is empty'}
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      <AnimatePresence>
                        {filteredMessages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                          >
                            <ListItem
                              button
                              onClick={() => {
                                setSelectedMessage(message)
                                if (!message.read) markAsRead(message.id)
                              }}
                              sx={{
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                bgcolor: message.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Badge
                                  variant="dot"
                                  color="primary"
                                  invisible={message.read}
                                  anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                >
                                  <Avatar src={message.sender.avatar}>
                                    {message.sender.name[0]}
                                  </Avatar>
                                </Badge>
                              </ListItemAvatar>
                              
                              <ListItemText
                                primary={
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography
                                      variant="body1"
                                      fontWeight={message.read ? 'normal' : 'bold'}
                                      sx={{ flex: 1 }}
                                    >
                                      {message.sender.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                    </Typography>
                                  </Stack>
                                }
                                secondary={
                                  <Box sx={{ mt: 0.5 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight={message.read ? 'normal' : 'medium'}
                                      sx={{ mb: 0.5 }}
                                    >
                                      {message.subject}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        mb: 0.5
                                      }}
                                    >
                                      {message.body}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Chip
                                        label={message.category}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: '0.7rem',
                                          height: 20,
                                          color: getCategoryColor(message.category),
                                          borderColor: getCategoryColor(message.category)
                                        }}
                                      />
                                      {message.priority !== 'normal' && (
                                        <Chip
                                          label={message.priority}
                                          size="small"
                                          sx={{
                                            fontSize: '0.7rem',
                                            height: 20,
                                            bgcolor: alpha(getPriorityColor(message.priority), 0.1),
                                            color: getPriorityColor(message.priority)
                                          }}
                                        />
                                      )}
                                      {message.starred && (
                                        <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                                      )}
                                      {message.attachments && message.attachments.length > 0 && (
                                        <AttachFile sx={{ fontSize: 16, color: 'text.secondary' }} />
                                      )}
                                    </Stack>
                                  </Box>
                                }
                              />
                            </ListItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </List>
                  )}
                </TabPanel>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default MessageCenter