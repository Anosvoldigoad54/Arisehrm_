'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as buttonHandlers from '../../utils/buttonHandlers'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Paper,
  LinearProgress,
  useTheme,
  alpha,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Menu,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  ListItemIcon,
} from '@mui/material'
import {
  Folder,
  FolderOpen,
  InsertDriveFile,
  Description,
  PictureAsPdf,
  Image,
  VideoFile,
  AudioFile,
  Archive,
  CloudUpload,
  CloudDownload,
  Share,
  Delete,
  Edit,
  Visibility,
  MoreVert,
  Add,
  CreateNewFolder,
  Upload,
  Download,
  Search,
  FilterList,
  Sort,
  GridView,
  ViewList,
  Star,
  StarBorder,
  Lock,
  LockOpen,
  History,
  Assignment,
  Group,
  Person,
  CalendarToday,
  AccessTime,
  Security,
  Warning,
  CheckCircle,
  Close,
  Refresh,
  FolderShared,
  CloudSync,
  Analytics,
  Settings,
  AdminPanelSettings,
  ExpandMore,
  ChevronRight,
  FilePresent,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { MetricCard } from '../common/MetricCard'
import { StatusChip } from '../common/StatusChip'
import { NumberTicker } from '../common/NumberTicker'

// Types
interface Document {
  id: string
  name: string
  type: 'file' | 'folder'
  extension?: string
  size?: number
  mimeType?: string
  content?: string
  parentId?: string
  path: string
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  lastAccessedAt?: string
  tags: string[]
  category: string
  isStarred: boolean
  isShared: boolean
  isLocked: boolean
  permissions: {
    read: string[]
    write: string[]
    admin: string[]
  }
  version: number
  versions?: DocumentVersion[]
  downloadCount: number
  fileUrl?: string
  thumbnailUrl?: string
  description?: string
  expiresAt?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  approvedBy?: {
    id: string
    name: string
    approvedAt: string
  }
}

interface DocumentVersion {
  id: string
  version: number
  createdBy: {
    id: string
    name: string
  }
  createdAt: string
  size: number
  changes: string
  fileUrl: string
}

interface DocumentStats {
  totalDocuments: number
  totalFolders: number
  totalSize: number
  documentsThisMonth: number
  pendingApprovals: number
  sharedDocuments: number
  expiringSoon: number
  storageUsed: number
  storageLimit: number
}

const DocumentManagement: React.FC = () => {
  const { profile } = useAuth()
  const theme = useTheme()

  // State
  const [activeTab, setActiveTab] = useState(0)
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentPath, setCurrentPath] = useState('/')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [contextDocument, setContextDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    totalFolders: 0,
    totalSize: 0,
    documentsThisMonth: 0,
    pendingApprovals: 0,
    sharedDocuments: 0,
    expiringSoon: 0,
    storageUsed: 0,
    storageLimit: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    type: 'all',
    dateRange: 'all',
    owner: 'all',
  })

  // Load real data
  useEffect(() => {
    loadDocumentData()
  }, [])

  const loadDocumentData = async () => {
    try {
      // Import the real data service
      const { default: RealDataService } = await import('../../services/realDataService')

      // Fetch real document data
      const [documentsResult, statsData] = await Promise.all([
        RealDataService.getDocuments({}),
        RealDataService.getDocumentStats()
      ])

      setDocuments(documentsResult.data)
      setStats(statsData)
    } catch (error) {
      // Fallback to demo data
      loadDemoDataFallback()
    }
  }

  const loadDemoDataFallback = () => {
    const demoDocuments: Document[] = [
      {
        id: 'f1',
        name: 'HR Policies',
        type: 'folder',
        path: '/hr-policies',
        createdBy: { id: 'u1', name: 'Admin User' },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
        tags: ['policies', 'hr'],
        category: 'HR',
        isStarred: true,
        isShared: true,
        isLocked: false,
        permissions: {
          read: ['all'],
          write: ['hr'],
          admin: ['admin']
        },
        version: 1,
        downloadCount: 0
      },
      {
        id: 'f2',
        name: 'Employee Contracts',
        type: 'folder',
        path: '/employee-contracts',
        createdBy: { id: 'u1', name: 'Admin User' },
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-18T00:00:00Z',
        tags: ['contracts', 'legal'],
        category: 'Legal',
        isStarred: false,
        isShared: false,
        isLocked: true,
        permissions: {
          read: ['hr', 'legal'],
          write: ['hr'],
          admin: ['admin']
        },
        version: 1,
        downloadCount: 0
      },
      {
        id: 'd1',
        name: 'Employee Handbook 2024.pdf',
        type: 'file',
        extension: 'pdf',
        size: 2456789,
        mimeType: 'application/pdf',
        parentId: 'f1',
        path: '/hr-policies/employee-handbook-2024.pdf',
        createdBy: { id: 'u2', name: 'Sarah Johnson', avatar: '' },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
        lastAccessedAt: '2024-01-21T10:30:00Z',
        tags: ['handbook', 'policies', '2024'],
        category: 'HR',
        isStarred: true,
        isShared: true,
        isLocked: false,
        permissions: {
          read: ['all'],
          write: ['hr'],
          admin: ['admin']
        },
        version: 3,
        downloadCount: 245,
        description: 'Updated employee handbook for 2024 including new remote work policies',
        approvalStatus: 'approved',
        approvedBy: {
          id: 'u1',
          name: 'Admin User',
          approvedAt: '2024-01-20T00:00:00Z'
        }
      },
      {
        id: 'd2',
        name: 'Code of Conduct.pdf',
        type: 'file',
        extension: 'pdf',
        size: 1234567,
        mimeType: 'application/pdf',
        parentId: 'f1',
        path: '/hr-policies/code-of-conduct.pdf',
        createdBy: { id: 'u3', name: 'Mike Chen', avatar: '' },
        createdAt: '2024-01-12T00:00:00Z',
        updatedAt: '2024-01-12T00:00:00Z',
        tags: ['conduct', 'policies', 'ethics'],
        category: 'HR',
        isStarred: false,
        isShared: true,
        isLocked: false,
        permissions: {
          read: ['all'],
          write: ['hr'],
          admin: ['admin']
        },
        version: 1,
        downloadCount: 89,
        description: 'Company code of conduct and ethical guidelines',
        approvalStatus: 'approved'
      },
      {
        id: 'd3',
        name: 'Training Schedule Q1 2024.xlsx',
        type: 'file',
        extension: 'xlsx',
        size: 567890,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        path: '/training-schedule-q1-2024.xlsx',
        createdBy: { id: 'u4', name: 'Emily Rodriguez', avatar: '' },
        createdAt: '2024-01-08T00:00:00Z',
        updatedAt: '2024-01-18T00:00:00Z',
        tags: ['training', 'schedule', 'q1'],
        category: 'Training',
        isStarred: true,
        isShared: true,
        isLocked: false,
        permissions: {
          read: ['all'],
          write: ['hr', 'training'],
          admin: ['admin']
        },
        version: 2,
        downloadCount: 156,
        description: 'Comprehensive training schedule for Q1 2024',
        approvalStatus: 'pending'
      },
      {
        id: 'd4',
        name: 'Company Logo.png',
        type: 'file',
        extension: 'png',
        size: 234567,
        mimeType: 'image/png',
        path: '/company-logo.png',
        createdBy: { id: 'u5', name: 'Design Team', avatar: '' },
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z',
        tags: ['logo', 'branding', 'design'],
        category: 'Branding',
        isStarred: false,
        isShared: true,
        isLocked: false,
        permissions: {
          read: ['all'],
          write: ['design', 'marketing'],
          admin: ['admin']
        },
        version: 1,
        downloadCount: 423,
        description: 'Official company logo in PNG format'
      }
    ]

    const demoStats: DocumentStats = {
      totalDocuments: demoDocuments.filter(d => d.type === 'file').length,
      totalFolders: demoDocuments.filter(d => d.type === 'folder').length,
      totalSize: demoDocuments.reduce((sum, doc) => sum + (doc.size || 0), 0),
      documentsThisMonth: 3,
      pendingApprovals: 1,
      sharedDocuments: demoDocuments.filter(d => d.isShared).length,
      expiringSoon: 0,
      storageUsed: 15.7, // GB
      storageLimit: 100 // GB
    }

    setDocuments(demoDocuments)
    if (!stats) {
      setStats(demoStats)
    }
    setLoading(false)
  }

  // Filter documents based on current path and filters
  const filteredDocuments = useMemo(() => {
    const pathDocuments = documents.filter(doc => {
      if (currentPath === '/') {
        return !doc.parentId
      }
      return doc.parentId === getCurrentFolderId()
    })

    return pathDocuments.filter(doc => {
      if (filters.search && !doc.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.category !== 'all' && doc.category !== filters.category) return false
      if (filters.type !== 'all') {
        if (filters.type === 'folders' && doc.type !== 'folder') return false
        if (filters.type === 'files' && doc.type !== 'file') return false
      }
      return true
    })
  }, [documents, currentPath, filters])

  const getCurrentFolderId = () => {
    if (currentPath === '/') return undefined
    const folder = documents.find(d => d.type === 'folder' && d.path === currentPath)
    return folder?.id
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (document: Document) => {
    if (document.type === 'folder') {
      return document.isShared ? <FolderShared /> : <Folder />
    }

    switch (document.extension) {
      case 'pdf':
        return <PictureAsPdf />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <Image />
      case 'mp4':
      case 'avi':
      case 'mov':
        return <VideoFile />
      case 'mp3':
      case 'wav':
        return <AudioFile />
      case 'zip':
      case 'rar':
        return <Archive />
      case 'doc':
      case 'docx':
        return <Description />
      default:
        return <InsertDriveFile />
    }
  }

  const handleDocumentClick = (document: Document) => {
    if (document.type === 'folder') {
      setCurrentPath(document.path)
    } else {
      setSelectedDocument(document)
      setShowDocumentDialog(true)
    }
  }

  const handleContextMenu = (event: React.MouseEvent, document: Document) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget as HTMLElement)
    setContextDocument(document)
  }

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  const handleStarToggle = (documentId: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId
        ? { ...doc, isStarred: !doc.isStarred }
        : doc
    ))
  }

  const DocumentCard: React.FC<{ document: Document }> = ({ document }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: selectedDocuments.includes(document.id) ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
        }}
        onClick={() => handleDocumentClick(document)}
        onContextMenu={(e) => handleContextMenu(e, document)}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Header with selection */}
            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <Checkbox
                checked={selectedDocuments.includes(document.id)}
                onChange={(e) => {
                  e.stopPropagation()
                  handleDocumentSelect(document.id)
                }}
                size="small"
              />
              <Box sx={{ 
                color: theme.palette.primary.main, 
                fontSize: 40,
                display: 'flex',
                alignItems: 'center'
              }}>
                {getFileIcon(document)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                    {document.name}
                  </Typography>
                  {document.isStarred && <Star sx={{ fontSize: 16, color: theme.palette.warning.main }} />}
                  {document.isLocked && <Lock sx={{ fontSize: 16, color: theme.palette.error.main }} />}
                </Stack>
                
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <StatusChip 
                    status={document.approvalStatus || 'approved'} 
                    size="xs" 
                  />
                  {document.isShared && (
                    <Chip label="Shared" size="small" variant="outlined" />
                  )}
                </Stack>
              </Box>
              
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStarToggle(document.id)
                }}
              >
                {document.isStarred ? <Star color="warning" /> : <StarBorder />}
              </IconButton>
            </Stack>

            {/* Document details */}
            <Stack spacing={1}>
              {document.type === 'file' && document.size && (
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(document.size)} • v{document.version}
                </Typography>
              )}
              
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar
                  src={document.createdBy.avatar}
                  sx={{ width: 20, height: 20 }}
                >
                  {document.createdBy.name[0]}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {document.createdBy.name}
                </Typography>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                {new Date(document.createdAt).toLocaleDateString()}
              </Typography>

              {document.tags.length > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {document.tags.slice(0, 2).map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.625rem', height: 20 }}
                    />
                  ))}
                  {document.tags.length > 2 && (
                    <Chip
                      label={`+${document.tags.length - 2}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.625rem', height: 20 }}
                    />
                  )}
                </Stack>
              )}
            </Stack>

            {/* Quick actions */}
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>
                <Visibility sx={{ fontSize: 16 }} />
              </Button>
              <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>
                <Download sx={{ fontSize: 16 }} />
              </Button>
              <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>
                <Share sx={{ fontSize: 16 }} />
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  )

  const DocumentListItem: React.FC<{ document: Document }> = ({ document }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 2,
          mb: 1,
          cursor: 'pointer',
          borderRadius: 2,
          border: selectedDocuments.includes(document.id) ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            borderColor: alpha(theme.palette.primary.main, 0.2),
          },
        }}
        onClick={() => handleDocumentClick(document)}
        onContextMenu={(e) => handleContextMenu(e, document)}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Checkbox
            checked={selectedDocuments.includes(document.id)}
            onChange={(e) => {
              e.stopPropagation()
              handleDocumentSelect(document.id)
            }}
            size="small"
          />
          
          <Box sx={{ color: theme.palette.primary.main, fontSize: 24 }}>
            {getFileIcon(document)}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body1" sx={{ fontWeight: 500 }} noWrap>
                {document.name}
              </Typography>
              {document.isStarred && <Star sx={{ fontSize: 16, color: theme.palette.warning.main }} />}
              {document.isLocked && <Lock sx={{ fontSize: 16, color: theme.palette.error.main }} />}
            </Stack>
            
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="caption" color="text.secondary">
                {document.createdBy.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(document.createdAt).toLocaleDateString()}
              </Typography>
              {document.type === 'file' && document.size && (
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(document.size)}
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <StatusChip status={document.approvalStatus || 'approved'} size="xs" />
            {document.isShared && (
              <Chip label="Shared" size="small" variant="outlined" />
            )}
          </Stack>

          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleStarToggle(document.id) }}>
            {document.isStarred ? <Star color="warning" /> : <StarBorder />}
          </IconButton>

          <IconButton size="small" onClick={(e) => handleContextMenu(e, document)}>
            <MoreVert />
          </IconButton>
        </Stack>
      </Paper>
    </motion.div>
  )

  return (
    <Box sx={{ p: 3 }} className="container-fluid px-2 px-md-3 px-lg-4">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Document Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Organize, share, and manage all your important documents
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Analytics />}>
            Analytics
          </Button>
          <Button variant="contained" startIcon={<CloudUpload />}>
            Upload
          </Button>
        </Stack>
      </Stack>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <MetricCard
            title="Total Documents"
            value={<NumberTicker value={stats.totalDocuments} />}
            icon={<InsertDriveFile />}
            color="primary"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <MetricCard
            title="Storage Used"
            value={`${stats.storageUsed}GB`}
            subtitle={`of ${stats.storageLimit}GB`}
            icon={<CloudSync />}
            color="info"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <MetricCard
            title="Shared Files"
            value={<NumberTicker value={stats.sharedDocuments} />}
            icon={<Share />}
            color="success"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <MetricCard
            title="Pending Approvals"
            value={<NumberTicker value={stats.pendingApprovals} />}
            icon={<Assignment />}
            color="warning"
          />
        </Grid>
      </Grid>
      {/* Breadcrumbs */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            size="small"
            onClick={() => setCurrentPath('/')}
            sx={{ minWidth: 'auto', color: currentPath === '/' ? 'primary.main' : 'text.secondary' }}
          >
            Home
          </Button>
          {currentPath !== '/' && (
            <>
              <ChevronRight />
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                {currentPath.split('/').pop()}
              </Typography>
            </>
          )}
        </Stack>
      </Paper>
      {/* Toolbar */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
            <TextField
              placeholder="Search documents..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              size="small"
              sx={{ minWidth: 300 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Legal">Legal</MenuItem>
                <MenuItem value="Training">Training</MenuItem>
                <MenuItem value="Branding">Branding</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                label="Type"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="folders">Folders</MenuItem>
                <MenuItem value="files">Files</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            {selectedDocuments.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {selectedDocuments.length} selected
              </Typography>
            )}
            
            <IconButton
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              {viewMode === 'grid' ? <ViewList /> : <GridView />}
            </IconButton>

            <Button variant="outlined" startIcon={<CreateNewFolder />} size="small">
              New Folder
            </Button>
            
            <Button variant="contained" startIcon={<CloudUpload />} size="small">
              Upload
            </Button>
          </Stack>
        </Stack>
      </Paper>
      {/* Document Grid/List */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredDocuments.map((document) => (
            <Grid
              key={document.id}
              size={{
                xs: 12,
                sm: 6,
                md: 4,
                lg: 3
              }}>
              <DocumentCard document={document} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          {filteredDocuments.map((document) => (
            <DocumentListItem key={document.id} document={document} />
          ))}
        </Box>
      )}
      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setAnchorEl(null)
          if (selectedDocument) {
            // Open document in new tab
            window.open(selectedDocument.url || '#', '_blank')
            toast.success(`Opening ${selectedDocument.name}`)
          }
        }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>Open</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorEl(null)
          if (selectedDocument) {
            // Create download link
            const link = document.createElement('a')
            link.href = selectedDocument.url || '#'
            link.download = selectedDocument.name
            link.click()
            toast.success(`Downloading ${selectedDocument.name}`)
          }
        }}>
          <ListItemIcon><Download fontSize="small" /></ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorEl(null)
          if (selectedDocument) {
            // Copy document link to clipboard
            const shareUrl = window.location.origin + '/documents/' + selectedDocument.id
            navigator.clipboard.writeText(shareUrl)
            toast.success('Document link copied to clipboard')
          }
        }}>
          <ListItemIcon><Share fontSize="small" /></ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorEl(null)
          if (selectedDocument) {
            // Show rename dialog
            const newName = prompt('Enter new name:', selectedDocument.name)
            if (newName && newName !== selectedDocument.name) {
              setDocuments(prev => prev.map(doc =>
                doc.id === selectedDocument.id
                  ? { ...doc, name: newName }
                  : doc
              ))
              toast.success('Document renamed successfully')
            }
          }
        }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setAnchorEl(null)
          if (selectedDocument) {
            // Show confirmation dialog
            if (window.confirm(`Are you sure you want to delete "${selectedDocument.name}"?`)) {
              setDocuments(prev => prev.filter(doc => doc.id !== selectedDocument.id))
              toast.success('Document deleted successfully')
            }
          }
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      {/* Document Detail Dialog */}
      <Dialog
        open={showDocumentDialog}
        onClose={() => setShowDocumentDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedDocument && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ color: theme.palette.primary.main, fontSize: 32 }}>
                    {getFileIcon(selectedDocument)}
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      {selectedDocument.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDocument.description}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setShowDocumentDialog(false)}>
                  <Close />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">
                      Size
                    </Typography>
                    <Typography variant="body2">
                      {selectedDocument.size ? formatFileSize(selectedDocument.size) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">
                      Version
                    </Typography>
                    <Typography variant="body2">
                      v{selectedDocument.version}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">
                      Created by
                    </Typography>
                    <Typography variant="body2">
                      {selectedDocument.createdBy.name}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">
                      Downloads
                    </Typography>
                    <Typography variant="body2">
                      {selectedDocument.downloadCount}
                    </Typography>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Tags
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                    {selectedDocument.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDocumentDialog(false)}>
                Close
              </Button>
              <Button variant="outlined" startIcon={<Share />}>
                Share
              </Button>
              <Button variant="contained" startIcon={<Download />}>
                Download
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Document Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<CloudUpload />}
          tooltipTitle="Upload File"
          onClick={() => setShowUploadDialog(true)}
        />
        <SpeedDialAction
          icon={<CreateNewFolder />}
          tooltipTitle="Create Folder"
          onClick={() => setShowCreateFolderDialog(true)}
        />
        <SpeedDialAction
          icon={<Analytics />}
          tooltipTitle="View Analytics"
        />
      </SpeedDial>
    </Box>
  );
}

export default DocumentManagement
