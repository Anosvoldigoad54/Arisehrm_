import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  Chip,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Divider
} from '@mui/material'
import {
  Send,
  SmartToy,
  Person,
  Close,
  Chat,
  Help,
  Policy,
  Schedule,
  Assessment
} from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  message: string
  timestamp: Date
  suggestions?: string[]
}

const AIChatbot: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: 'Hi! I\'m your HR AI assistant. I can help you with policies, leave requests, attendance queries, and more. What would you like to know?',
      timestamp: new Date(),
      suggestions: [
        'How do I request leave?',
        'What\'s the company policy on remote work?',
        'Check my attendance summary',
        'Performance review process'
      ]
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // AI response mutation
  const aiResponseMutation = useMutation({
    mutationFn: async (userMessage: string): Promise<ChatMessage> => {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock AI responses based on keywords
      let response = ''
      let suggestions: string[] = []

      if (userMessage.toLowerCase().includes('leave')) {
        response = 'To request leave, go to the Leave Management section in your dashboard. You can submit a leave request by selecting the dates, leave type, and providing a reason. Your manager will be notified for approval.'
        suggestions = ['View leave balance', 'Leave policy details', 'Emergency leave process']
      } else if (userMessage.toLowerCase().includes('attendance')) {
        response = 'Your attendance summary shows you\'ve been present 22 out of 23 working days this month. You can view detailed attendance records in the Attendance section of your dashboard.'
        suggestions = ['View attendance details', 'Report attendance issue', 'Work from home policy']
      } else if (userMessage.toLowerCase().includes('policy') || userMessage.toLowerCase().includes('remote')) {
        response = 'Our remote work policy allows up to 3 days per week of remote work with manager approval. You can find the complete policy in the Compliance section under "Remote Work Guidelines".'
        suggestions = ['View all policies', 'Submit policy feedback', 'Compliance training']
      } else if (userMessage.toLowerCase().includes('performance')) {
        response = 'Performance reviews are conducted quarterly. Your next review is scheduled for next month. You can view your current goals and progress in the Performance Management section.'
        suggestions = ['View current goals', 'Self-assessment form', 'Feedback history']
      } else if (userMessage.toLowerCase().includes('payroll') || userMessage.toLowerCase().includes('salary')) {
        response = 'For payroll inquiries, please check the Payroll section in your dashboard. Your latest payslip is available for download. For specific questions, contact HR directly.'
        suggestions = ['Download payslip', 'Tax information', 'Benefits overview']
      } else {
        response = 'I can help you with various HR topics including leave requests, attendance, policies, performance reviews, and payroll. What specific information are you looking for?'
        suggestions = ['Leave management', 'Attendance tracking', 'Company policies', 'Performance reviews']
      }

      return {
        id: Date.now().toString(),
        type: 'bot',
        message: response,
        timestamp: new Date(),
        suggestions
      }
    }
  })

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Get AI response
    try {
      const aiResponse = await aiResponseMutation.mutateAsync(inputMessage)
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        message: 'Sorry, I encountered an error. Please try again or contact HR support.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
        onClick={() => setOpen(true)}
      >
        <Chat />
      </Fab>

      {/* Chat Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { height: '600px', display: 'flex', flexDirection: 'column' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <SmartToy color="primary" />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            HR AI Assistant
          </Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <Divider />

        <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
          {/* Messages Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    display: 'flex',
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 2,
                    p: 0
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32
                    }}
                  >
                    {message.type === 'user' ? <Person /> : <SmartToy />}
                  </Avatar>
                  
                  <Box sx={{ maxWidth: '70%' }}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                        color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                        borderTopLeftRadius: message.type === 'user' ? 2 : 0.5,
                        borderTopRightRadius: message.type === 'user' ? 0.5 : 2
                      }}
                    >
                      <Typography variant="body2">{message.message}</Typography>
                    </Paper>
                    
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        textAlign: message.type === 'user' ? 'right' : 'left'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>

                    {/* Suggestions */}
                    {message.type === 'bot' && message.suggestions && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            variant="outlined"
                            clickable
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </ListItem>
              ))}
              
              {aiResponseMutation.isPending && (
                <ListItem sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, p: 0 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    <SmartToy />
                  </Avatar>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2, borderTopLeftRadius: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      AI is typing...
                    </Typography>
                  </Paper>
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Actions */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                icon={<Schedule />}
                label="Request Leave"
                size="small"
                clickable
                onClick={() => handleSuggestionClick('How do I request leave?')}
              />
              <Chip
                icon={<Assessment />}
                label="Attendance"
                size="small"
                clickable
                onClick={() => handleSuggestionClick('Check my attendance summary')}
              />
              <Chip
                icon={<Policy />}
                label="Policies"
                size="small"
                clickable
                onClick={() => handleSuggestionClick('Show me company policies')}
              />
              <Chip
                icon={<Help />}
                label="Help"
                size="small"
                clickable
                onClick={() => handleSuggestionClick('I need help with HR processes')}
              />
            </Box>

            {/* Input Area */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
                disabled={aiResponseMutation.isPending}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || aiResponseMutation.isPending}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <Send />
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AIChatbot
