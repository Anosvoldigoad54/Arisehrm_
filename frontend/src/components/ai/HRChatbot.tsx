import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Fab,
  Collapse,
  Alert
} from '@mui/material'
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  Help as HelpIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Policy as PolicyIcon,
  AttachMoney as PayrollIcon
} from '@mui/icons-material'
import { format } from 'date-fns'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  category?: string
  suggestions?: string[]
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  category: string
  query: string
}

const HRChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI HR Assistant. I can help you with policies, leave requests, payroll questions, and more. How can I assist you today?',
      timestamp: new Date(),
      suggestions: ['Check leave balance', 'Company policies', 'Payroll information', 'Submit request']
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Leave Balance',
      icon: <ScheduleIcon />,
      category: 'Leave',
      query: 'What is my current leave balance?'
    },
    {
      id: '2',
      label: 'Submit Leave Request',
      icon: <AssignmentIcon />,
      category: 'Leave',
      query: 'How do I submit a leave request?'
    },
    {
      id: '3',
      label: 'Company Policies',
      icon: <PolicyIcon />,
      category: 'Policies',
      query: 'Show me company policies'
    },
    {
      id: '4',
      label: 'Payroll Info',
      icon: <PayrollIcon />,
      category: 'Payroll',
      query: 'When is the next payroll date?'
    },
    {
      id: '5',
      label: 'Team Directory',
      icon: <PeopleIcon />,
      category: 'Directory',
      query: 'Find team member contact information'
    },
    {
      id: '6',
      label: 'Performance Review',
      icon: <AnalyticsIcon />,
      category: 'Performance',
      query: 'When is my next performance review?'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateBotResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase()
    let response = ''
    let category = 'General'
    let suggestions: string[] = []

    // AI-powered response generation based on keywords and context
    if (lowerMessage.includes('leave') || lowerMessage.includes('vacation') || lowerMessage.includes('time off')) {
      category = 'Leave'
      if (lowerMessage.includes('balance')) {
        response = 'Your current leave balance is: Vacation: 15 days, Sick: 8 days, Personal: 3 days. You can view detailed breakdown in the Leave Management section.'
        suggestions = ['Submit leave request', 'View leave history', 'Check team calendar']
      } else if (lowerMessage.includes('request') || lowerMessage.includes('submit')) {
        response = 'To submit a leave request: 1) Go to Leave Management, 2) Click "New Request", 3) Select dates and type, 4) Add reason, 5) Submit for approval. Your manager will be notified automatically.'
        suggestions = ['Open Leave Management', 'Check approval status', 'View leave policies']
      } else {
        response = 'I can help you with leave-related queries. You can check your balance, submit requests, or view policies. What specifically would you like to know?'
        suggestions = ['Check leave balance', 'Submit leave request', 'Leave policies']
      }
    } else if (lowerMessage.includes('payroll') || lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
      category = 'Payroll'
      response = 'Next payroll date is March 15th. You can view your payslips, tax documents, and salary details in the Payroll section. For salary adjustments, please contact HR.'
      suggestions = ['View payslips', 'Download tax documents', 'Contact HR']
    } else if (lowerMessage.includes('policy') || lowerMessage.includes('policies') || lowerMessage.includes('handbook')) {
      category = 'Policies'
      response = 'Company policies are available in the Document Management section. Key policies include: Work from Home, Code of Conduct, Leave Policy, and IT Security. Which policy would you like to review?'
      suggestions = ['Work from Home policy', 'Leave policy', 'Code of conduct', 'All policies']
    } else if (lowerMessage.includes('performance') || lowerMessage.includes('review') || lowerMessage.includes('evaluation')) {
      category = 'Performance'
      response = 'Your next performance review is scheduled for April 10th. You can view your goals, feedback, and previous reviews in the Performance Management section.'
      suggestions = ['View current goals', 'Self-assessment form', 'Schedule 1:1 meeting']
    } else if (lowerMessage.includes('team') || lowerMessage.includes('colleague') || lowerMessage.includes('directory')) {
      category = 'Directory'
      response = 'You can find team member information in the Employee Directory. Search by name, department, or role. Contact details and org chart are also available.'
      suggestions = ['Open directory', 'View org chart', 'Find by department']
    } else if (lowerMessage.includes('attendance') || lowerMessage.includes('clock') || lowerMessage.includes('check in')) {
      category = 'Attendance'
      response = 'For attendance tracking, use the Attendance System to clock in/out. Your current status shows you\'re checked in since 9:00 AM. Need help with attendance records?'
      suggestions = ['View attendance history', 'Clock out', 'Report attendance issue']
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = 'I\'m here to help! I can assist with: Leave management, Payroll queries, Company policies, Performance reviews, Team directory, and Attendance tracking. What do you need help with?'
      suggestions = ['Leave questions', 'Payroll info', 'Company policies', 'Performance reviews']
    } else {
      response = 'I understand you\'re asking about "' + userMessage + '". Could you provide more details? I can help with leave, payroll, policies, performance, team info, and attendance.'
      suggestions = ['Leave management', 'Payroll questions', 'Company policies', 'Team directory']
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      category,
      suggestions
    }
  }

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim()
    if (!messageText) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI processing time
    setTimeout(() => {
      const botResponse = generateBotResponse(messageText)
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.query)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const ChatWindow = () => (
    <Card sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BotIcon color="primary" />
          HR Assistant
          <Chip label="Online" color="success" size="small" sx={{ ml: 'auto' }} />
        </Typography>
      </CardContent>
      
      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 1 }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, maxWidth: '80%' }}>
              {message.type === 'bot' && (
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <BotIcon fontSize="small" />
                </Avatar>
              )}
              
              <Box>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    borderTopLeftRadius: message.type === 'bot' ? 0 : 2,
                    borderTopRightRadius: message.type === 'user' ? 0 : 2
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                  {message.category && (
                    <Chip
                      label={message.category}
                      size="small"
                      sx={{ mt: 1, height: 20, fontSize: '0.7rem' }}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Paper>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {format(message.timestamp, 'HH:mm')}
                </Typography>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        size="small"
                        onClick={() => handleSendMessage(suggestion)}
                        sx={{ fontSize: '0.7rem', py: 0.5, px: 1 }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </Box>
                )}
              </Box>

              {message.type === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  <UserIcon fontSize="small" />
                </Avatar>
              )}
            </Box>
          </Box>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <BotIcon fontSize="small" />
            </Avatar>
            <Paper sx={{ p: 2, borderRadius: 2, borderTopLeftRadius: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  AI is thinking...
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Quick Actions */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Quick Actions:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {quickActions.slice(0, 4).map((action) => (
            <Button
              key={action.id}
              variant="outlined"
              size="small"
              startIcon={action.icon}
              onClick={() => handleQuickAction(action)}
              sx={{ fontSize: '0.7rem' }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask me anything about HR..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
          />
          <IconButton
            color="primary"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Card>
  )

  return (
    <>
      {/* Floating Chat Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Chat Window */}
      <Collapse in={isOpen}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 400,
            zIndex: 999,
            boxShadow: 3
          }}
        >
          <ChatWindow />
        </Box>
      </Collapse>

      {/* Full Page Mode */}
      {!isOpen && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BotIcon color="primary" />
            HR AI Assistant
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Your intelligent HR assistant is ready to help! Click the chat button in the bottom-right corner to start a conversation,
              or use the quick actions below to get started.
            </Typography>
          </Alert>

          {/* Quick Actions Grid */}
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
            {quickActions.map((action) => (
              <Card key={action.id} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                <CardContent onClick={() => {
                  setIsOpen(true)
                  setTimeout(() => handleQuickAction(action), 500)
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: 'primary.main' }}>
                      {action.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {action.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {action.category}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Features */}
          <Typography variant="h6" gutterBottom>
            AI Assistant Features
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><ScheduleIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Leave Management"
                secondary="Check balances, submit requests, view policies"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><PayrollIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Payroll Information"
                secondary="Payslip access, tax documents, salary queries"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><PolicyIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Company Policies"
                secondary="Access to all HR policies and procedures"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><PeopleIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Team Directory"
                secondary="Find colleagues, contact information, org chart"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><AnalyticsIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Performance Reviews"
                secondary="Goal tracking, feedback, review schedules"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><HelpIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="24/7 Support"
                secondary="Instant answers to common HR questions"
              />
            </ListItem>
          </List>
        </Box>
      )}
    </>
  )
}

export default HRChatbot
