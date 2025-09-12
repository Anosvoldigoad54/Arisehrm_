import React, { useState, useEffect } from 'react'
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  InputAdornment,
  Card,
  CardContent,
  Tab,
  Tabs,
  Breadcrumbs,
  Link,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Badge,
  Paper,
  Grid,
  useTheme,
} from '@mui/material'
import {
  Close,
  Search,
  Help,
  ExpandMore,
  Article,
  VideoLibrary,
  Quiz,
  Support,
  Phone,
  Email,
  Chat,
  BookOpen,
  Star,
  ThumbUp,
  ThumbDown,
  Share,
  Print,
  GetApp,
  ArrowBack,
  Home,
  TrendingUp,
  Schedule,
  People,
  Settings,
  Security,
  Assignment,
  Dashboard,
  Lightbulb,
  BugReport,
  Feedback,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useResponsive } from '../../hooks/useResponsive'

interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  tags: string[]
  popularity: number
  lastUpdated: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: number
  helpful: number
  notHelpful: number
  relatedArticles?: string[]
}

interface HelpCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  articleCount: number
  subcategories?: { id: string; name: string; articleCount: number }[]
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  popularity: number
}

interface HelpCenterProps {
  open: boolean
  onClose: () => void
  contextualHelp?: string
  initialCategory?: string
}

const HelpCenter: React.FC<HelpCenterProps> = ({
  open,
  onClose,
  contextualHelp,
  initialCategory
}) => {
  const theme = useTheme()
  const responsive = useResponsive()
  
  const [activeTab, setActiveTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '')
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<string[]>(['Help Center'])
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([])
  const [showContactForm, setShowContactForm] = useState(false)
  
  // Mock data
  const categories: HelpCategory[] = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: <Lightbulb />,
      description: 'Learn the basics of using Arise HRM',
      articleCount: 12,
      subcategories: [
        { id: 'first-login', name: 'First Login', articleCount: 3 },
        { id: 'dashboard', name: 'Dashboard Overview', articleCount: 4 },
        { id: 'navigation', name: 'Navigation', articleCount: 5 }
      ]
    },
    {
      id: 'employee-management',
      name: 'Employee Management',
      icon: <People />,
      description: 'Managing employees, profiles, and directories',
      articleCount: 18,
      subcategories: [
        { id: 'adding-employees', name: 'Adding Employees', articleCount: 6 },
        { id: 'employee-profiles', name: 'Employee Profiles', articleCount: 8 },
        { id: 'bulk-operations', name: 'Bulk Operations', articleCount: 4 }
      ]
    },
    {
      id: 'attendance',
      name: 'Attendance & Time',
      icon: <Schedule />,
      description: 'Time tracking, attendance, and scheduling',
      articleCount: 15,
    },
    {
      id: 'leave-management',
      name: 'Leave Management',
      icon: <Assignment />,
      description: 'Managing leave requests and policies',
      articleCount: 10,
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      icon: <TrendingUp />,
      description: 'Generating reports and viewing analytics',
      articleCount: 8,
    },
    {
      id: 'settings',
      name: 'Settings & Configuration',
      icon: <Settings />,
      description: 'System settings and customization',
      articleCount: 14,
    },
    {
      id: 'security',
      name: 'Security & Privacy',
      icon: <Security />,
      description: 'Security features and privacy settings',
      articleCount: 6,
    }
  ]

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page. Enter your email address and follow the instructions sent to your email.',
      category: 'getting-started',
      popularity: 95
    },
    {
      id: '2',
      question: 'How do I add a new employee?',
      answer: 'Go to HR > Employee Management, click the "Add Employee" button (plus icon in the bottom right), and fill out the employee information form. You can also import multiple employees using the import feature.',
      category: 'employee-management',
      popularity: 88
    },
    {
      id: '3',
      question: 'Can I export employee data?',
      answer: 'Yes! In the Employee Management section, click on the export button in the speed dial menu. You can choose from CSV, Excel, or JSON formats and select which fields to export.',
      category: 'employee-management',
      popularity: 82
    },
    {
      id: '4',
      question: 'How do I approve leave requests?',
      answer: 'Navigate to Leave Management, view pending requests in your dashboard, and click on any request to approve or deny it. You can also add comments for the employee.',
      category: 'leave-management',
      popularity: 79
    },
    {
      id: '5',
      question: 'How do I view attendance reports?',
      answer: 'Go to Reports & Analytics, select "Attendance Reports", choose your date range and filters, then click "Generate Report". You can export the report in various formats.',
      category: 'reports',
      popularity: 75
    }
  ]

  const popularArticles: HelpArticle[] = [
    {
      id: 'article-1',
      title: 'Getting Started with Arise HRM',
      content: 'Welcome to Arise HRM! This comprehensive guide will walk you through the essential features and help you get started with managing your workforce effectively...',
      category: 'getting-started',
      tags: ['basics', 'overview', 'tutorial'],
      popularity: 98,
      lastUpdated: '2024-01-15',
      difficulty: 'beginner',
      estimatedReadTime: 5,
      helpful: 47,
      notHelpful: 3
    },
    {
      id: 'article-2',
      title: 'Managing Employee Profiles',
      content: 'Learn how to create, edit, and manage employee profiles in Arise HRM. This guide covers adding personal information, employment details, and managing permissions...',
      category: 'employee-management',
      tags: ['employees', 'profiles', 'management'],
      popularity: 92,
      lastUpdated: '2024-01-12',
      difficulty: 'intermediate',
      estimatedReadTime: 8,
      helpful: 38,
      notHelpful: 2
    },
    {
      id: 'article-3',
      title: 'Setting Up Attendance Tracking',
      content: 'Configure attendance tracking for your organization. This guide covers setting up work schedules, break times, overtime policies, and attendance rules...',
      category: 'attendance',
      tags: ['attendance', 'setup', 'configuration'],
      popularity: 87,
      lastUpdated: '2024-01-10',
      difficulty: 'intermediate',
      estimatedReadTime: 12,
      helpful: 34,
      notHelpful: 1
    }
  ]

  useEffect(() => {
    if (contextualHelp) {
      searchForContextualHelp(contextualHelp)
    }
  }, [contextualHelp])

  const searchForContextualHelp = async (context: string) => {
    setLoading(true)
    try {
      // Simulate contextual search
      await new Promise(resolve => setTimeout(resolve, 500))
      const contextualResults = popularArticles.filter(article =>
        article.category === context || article.tags.includes(context)
      )
      setSearchResults(contextualResults)
      setActiveTab(1) // Switch to search results
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const results = popularArticles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setSearchResults(results)
      setActiveTab(1)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (category: HelpCategory) => {
    setSelectedCategory(category.id)
    setBreadcrumb(['Help Center', category.name])
    // In a real app, you'd fetch articles for this category
    toast.info(`Loading ${category.name} articles...`)
  }

  const handleArticleSelect = (article: HelpArticle) => {
    setSelectedArticle(article)
    const categoryName = categories.find(c => c.id === article.category)?.name || 'Articles'
    setBreadcrumb(['Help Center', categoryName, article.title])
  }

  const handleBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null)
      setBreadcrumb(breadcrumb.slice(0, -1))
    } else if (selectedCategory) {
      setSelectedCategory('')
      setBreadcrumb(['Help Center'])
    }
  }

  const markHelpful = (articleId: string, helpful: boolean) => {
    toast.success(helpful ? 'Thanks for your feedback!' : 'Thanks for letting us know!')
  }

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({
    children, value, index
  }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )

  const renderBreadcrumb = () => (
    <Breadcrumbs sx={{ mb: 2 }}>
      <Link
        component="button"
        variant="body2"
        onClick={() => {
          setSelectedCategory('')
          setSelectedArticle(null)
          setBreadcrumb(['Help Center'])
        }}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Home sx={{ mr: 0.5, fontSize: 16 }} />
        Help Center
      </Link>
      {breadcrumb.slice(1).map((crumb, index) => (
        <Typography key={index} color="text.primary" variant="body2">
          {crumb}
        </Typography>
      ))}
    </Breadcrumbs>
  )

  const renderCategories = () => (
    <Grid container spacing={2}>
      {categories.map((category) => (
        <Grid item xs={12} sm={6} md={4} key={category.id}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  bgcolor: alpha => alpha(theme.palette.primary.main, 0.02)
                }
              }}
              onClick={() => handleCategorySelect(category)}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {category.icon}
                    </Avatar>
                    <Badge badgeContent={category.articleCount} color="primary">
                      <Typography variant="h6" noWrap>
                        {category.name}
                      </Typography>
                    </Badge>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                  {category.subcategories && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                      {category.subcategories.slice(0, 2).map(sub => (
                        <Chip
                          key={sub.id}
                          label={sub.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {category.subcategories.length > 2 && (
                        <Chip
                          label={`+${category.subcategories.length - 2} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  )

  const renderFAQs = () => (
    <Box>
      {faqs.map((faq) => (
        <Accordion key={faq.id}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
              <Typography variant="body1" sx={{ flex: 1 }}>
                {faq.question}
              </Typography>
              <Chip
                label={`${faq.popularity}% helpful`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )

  const renderArticle = (article: HelpArticle) => (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Chip
          label={article.difficulty}
          size="small"
          color={article.difficulty === 'beginner' ? 'success' : article.difficulty === 'intermediate' ? 'warning' : 'error'}
        />
        <Typography variant="body2" color="text.secondary">
          {article.estimatedReadTime} min read
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Updated {new Date(article.lastUpdated).toLocaleDateString()}
        </Typography>
      </Stack>

      <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
        {article.content}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Was this article helpful?
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<ThumbUp />}
              size="small"
              onClick={() => markHelpful(article.id, true)}
            >
              Yes ({article.helpful})
            </Button>
            <Button
              startIcon={<ThumbDown />}
              size="small"
              onClick={() => markHelpful(article.id, false)}
            >
              No ({article.notHelpful})
            </Button>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          <IconButton size="small">
            <Share />
          </IconButton>
          <IconButton size="small">
            <Print />
          </IconButton>
          <IconButton size="small">
            <GetApp />
          </IconButton>
        </Stack>
      </Box>
    </Box>
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
            {(selectedCategory || selectedArticle) && (
              <IconButton onClick={handleBack}>
                <ArrowBack />
              </IconButton>
            )}
            <Help />
            <Typography variant="h6">Help Center</Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {renderBreadcrumb()}

        {selectedArticle ? (
          renderArticle(selectedArticle)
        ) : (
          <Box>
            {/* Search Bar */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: loading && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || loading}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowContactForm(true)}
                  startIcon={<Support />}
                >
                  Contact Support
                </Button>
              </Stack>
            </Paper>

            {/* Contextual Help */}
            {contextualHelp && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  We found some articles related to "{contextualHelp}" that might help you.
                </Typography>
              </Alert>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 2 }}>
              <Tab label="Browse Topics" />
              <Tab label="Search Results" />
              <Tab label="Popular Articles" />
              <Tab label="FAQs" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              {selectedCategory ? (
                <Typography>Category articles would be loaded here...</Typography>
              ) : (
                renderCategories()
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {searchResults.length > 0 ? (
                <List>
                  {searchResults.map((article) => (
                    <ListItem
                      key={article.id}
                      button
                      onClick={() => handleArticleSelect(article)}
                    >
                      <ListItemIcon>
                        <Article />
                      </ListItemIcon>
                      <ListItemText
                        primary={article.title}
                        secondary={`${article.category} • ${article.estimatedReadTime} min read`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  {searchQuery ? 'No results found. Try different keywords.' : 'Start typing to search for articles.'}
                </Typography>
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <List>
                {popularArticles.map((article) => (
                  <ListItem
                    key={article.id}
                    button
                    onClick={() => handleArticleSelect(article)}
                  >
                    <ListItemIcon>
                      <Star color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={article.title}
                      secondary={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="caption">
                            {article.category} • {article.estimatedReadTime} min
                          </Typography>
                          <Chip
                            label={`${article.popularity}% helpful`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              {renderFAQs()}
            </TabPanel>
          </Box>
        )}
      </DialogContent>

      {!selectedArticle && (
        <DialogActions>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Can't find what you're looking for?
            </Typography>
            <Button
              startIcon={<Chat />}
              onClick={() => setShowContactForm(true)}
            >
              Contact Support
            </Button>
            <Button
              startIcon={<BugReport />}
              color="warning"
              onClick={() => toast.info('Bug report form would open here')}
            >
              Report Bug
            </Button>
          </Stack>
        </DialogActions>
      )}
    </Dialog>
  )
}

export default HelpCenter