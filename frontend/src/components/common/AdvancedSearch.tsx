import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Autocomplete,
  DatePicker,
  Slider,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tooltip,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Search,
  Close,
  FilterList,
  Clear,
  Save,
  History,
  ExpandMore,
  Add,
  Remove,
  CalendarToday,
  Person,
  Business,
  Assignment,
  TrendingUp,
  Star,
  StarBorder,
  Delete,
  Edit,
  Tune,
  QueryBuilder,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useResponsive } from '../../hooks/useResponsive'

export interface SearchFilter {
  id: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean' | 'slider'
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
  group?: string
}

export interface SearchCriteria {
  [key: string]: any
}

export interface SavedSearch {
  id: string
  name: string
  description?: string
  criteria: SearchCriteria
  createdAt: string
  starred: boolean
  global?: boolean
}

export interface AdvancedSearchProps {
  open: boolean
  onClose: () => void
  onSearch: (criteria: SearchCriteria) => void
  filters: SearchFilter[]
  title?: string
  searchPlaceholder?: string
  allowSavedSearches?: boolean
  initialCriteria?: SearchCriteria
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  open,
  onClose,
  onSearch,
  filters,
  title = 'Advanced Search',
  searchPlaceholder = 'Search...',
  allowSavedSearches = true,
  initialCriteria = {}
}) => {
  const theme = useTheme()
  const responsive = useResponsive()
  
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(initialCriteria)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['basic'])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveSearchName, setSaveSearchName] = useState('')
  const [saveSearchDescription, setSaveSearchDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchCriteria[]>([])

  // Group filters
  const filterGroups = filters.reduce((groups, filter) => {
    const group = filter.group || 'basic'
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(filter)
    return groups
  }, {} as Record<string, SearchFilter[]>)

  useEffect(() => {
    if (open) {
      loadSavedSearches()
      loadSearchHistory()
    }
  }, [open])

  useEffect(() => {
    setSearchCriteria(initialCriteria)
  }, [initialCriteria])

  const loadSavedSearches = async () => {
    try {
      // Mock saved searches - in real app, load from API
      const mockSavedSearches: SavedSearch[] = [
        {
          id: '1',
          name: 'Active Employees in Engineering',
          description: 'All active employees in the engineering department',
          criteria: {
            status: 'active',
            department: 'engineering',
            search: ''
          },
          createdAt: '2024-01-01',
          starred: true
        },
        {
          id: '2',
          name: 'Recent Hires',
          description: 'Employees hired in the last 30 days',
          criteria: {
            dateRange: 'last_30_days',
            search: ''
          },
          createdAt: '2024-01-10',
          starred: false
        },
        {
          id: '3',
          name: 'Senior Level Staff',
          description: 'All senior and above level positions',
          criteria: {
            level: ['senior', 'lead', 'manager'],
            search: ''
          },
          createdAt: '2024-01-15',
          starred: true
        }
      ]
      setSavedSearches(mockSavedSearches)
    } catch (error) {
    }
  }

  const loadSearchHistory = async () => {
    try {
      // Mock search history - in real app, load from localStorage or API
      const history = JSON.parse(localStorage.getItem('search_history') || '[]')
      setSearchHistory(history.slice(0, 5)) // Keep only last 5 searches
    } catch (error) {
    }
  }

  const handleCriteriaChange = (filterId: string, value: any) => {
    setSearchCriteria(prev => ({
      ...prev,
      [filterId]: value
    }))
  }

  const handleSearch = () => {
    // Save to search history
    const newHistory = [searchCriteria, ...searchHistory.filter(h => JSON.stringify(h) !== JSON.stringify(searchCriteria))].slice(0, 5)
    setSearchHistory(newHistory)
    localStorage.setItem('search_history', JSON.stringify(newHistory))

    onSearch(searchCriteria)
    onClose()
  }

  const handleClearAll = () => {
    setSearchCriteria({})
  }

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) {
      toast.error('Please enter a name for the saved search')
      return
    }

    try {
      const newSavedSearch: SavedSearch = {
        id: Date.now().toString(),
        name: saveSearchName,
        description: saveSearchDescription,
        criteria: searchCriteria,
        createdAt: new Date().toISOString(),
        starred: false
      }

      setSavedSearches(prev => [newSavedSearch, ...prev])
      setSaveSearchName('')
      setSaveSearchDescription('')
      setShowSaveDialog(false)
      toast.success('Search saved successfully!')

      // In real app, save to API
    } catch (error) {
      toast.error('Failed to save search')
    }
  }

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setSearchCriteria(savedSearch.criteria)
    toast.success(`Loaded "${savedSearch.name}"`)
  }

  const handleToggleStarred = (searchId: string) => {
    setSavedSearches(prev =>
      prev.map(search =>
        search.id === searchId
          ? { ...search, starred: !search.starred }
          : search
      )
    )
  }

  const handleDeleteSavedSearch = (searchId: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== searchId))
    toast.success('Saved search deleted')
  }

  const renderFilter = (filter: SearchFilter) => {
    const value = searchCriteria[filter.id]

    switch (filter.type) {
      case 'text':
        return (
          <TextField
            key={filter.id}
            fullWidth
            label={filter.label}
            value={value || ''}
            onChange={(e) => handleCriteriaChange(filter.id, e.target.value)}
            placeholder={filter.placeholder}
          />
        )

      case 'select':
        return (
          <FormControl key={filter.id} fullWidth>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleCriteriaChange(filter.id, e.target.value)}
              label={filter.label}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {filter.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )

      case 'multiselect':
        return (
          <Autocomplete
            key={filter.id}
            multiple
            options={filter.options || []}
            value={value || []}
            onChange={(_, newValue) => handleCriteriaChange(filter.id, newValue.map(v => v.value))}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value}
            renderInput={(params) => (
              <TextField {...params} label={filter.label} />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.value}
                  label={option.label}
                  size="small"
                />
              ))
            }
          />
        )

      case 'boolean':
        return (
          <FormControlLabel
            key={filter.id}
            control={
              <Switch
                checked={value || false}
                onChange={(e) => handleCriteriaChange(filter.id, e.target.checked)}
              />
            }
            label={filter.label}
          />
        )

      case 'slider':
        return (
          <Box key={filter.id}>
            <Typography variant="body2" gutterBottom>
              {filter.label}: {value || filter.min || 0} - {value?.[1] || filter.max || 100}
            </Typography>
            <Slider
              value={value || [filter.min || 0, filter.max || 100]}
              onChange={(_, newValue) => handleCriteriaChange(filter.id, newValue)}
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              valueLabelDisplay="auto"
              marks
            />
          </Box>
        )

      case 'date':
        return (
          <TextField
            key={filter.id}
            fullWidth
            type="date"
            label={filter.label}
            value={value || ''}
            onChange={(e) => handleCriteriaChange(filter.id, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        )

      case 'number':
        return (
          <TextField
            key={filter.id}
            fullWidth
            type="number"
            label={filter.label}
            value={value || ''}
            onChange={(e) => handleCriteriaChange(filter.id, e.target.value)}
            inputProps={{
              min: filter.min,
              max: filter.max,
              step: filter.step || 1
            }}
          />
        )

      default:
        return null
    }
  }

  const appliedFiltersCount = Object.values(searchCriteria).filter(value => 
    value !== undefined && value !== '' && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={responsive.isMobile}
      PaperProps={{
        sx: { height: responsive.isMobile ? '100%' : 'auto', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Search />
            <Typography variant="h6">{title}</Typography>
            {appliedFiltersCount > 0 && (
              <Badge badgeContent={appliedFiltersCount} color="primary">
                <FilterList />
              </Badge>
            )}
          </Stack>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Quick Search */}
          <TextField
            fullWidth
            placeholder={searchPlaceholder}
            value={searchCriteria.search || ''}
            onChange={(e) => handleCriteriaChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          {/* Saved Searches */}
          {allowSavedSearches && savedSearches.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Saved Searches
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowSaveDialog(true)}
                  startIcon={<Save />}
                >
                  Save Current
                </Button>
              </Stack>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {savedSearches.filter(s => s.starred).map(savedSearch => (
                  <motion.div key={savedSearch.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Chip
                      label={savedSearch.name}
                      onClick={() => handleLoadSavedSearch(savedSearch)}
                      onDelete={() => handleDeleteSavedSearch(savedSearch.id)}
                      deleteIcon={<Delete />}
                      color="primary"
                      variant="outlined"
                      icon={<Star />}
                    />
                  </motion.div>
                ))}
                {savedSearches.filter(s => !s.starred).slice(0, 3).map(savedSearch => (
                  <motion.div key={savedSearch.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Chip
                      label={savedSearch.name}
                      onClick={() => handleLoadSavedSearch(savedSearch)}
                      onDelete={() => handleDeleteSavedSearch(savedSearch.id)}
                      deleteIcon={<Delete />}
                      variant="outlined"
                    />
                  </motion.div>
                ))}
              </Stack>
            </Paper>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recent Searches
              </Typography>
              <Stack spacing={1}>
                {searchHistory.map((criteria, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                    onClick={() => setSearchCriteria(criteria)}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <QueryBuilder fontSize="small" color="disabled" />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {Object.entries(criteria)
                          .filter(([_, value]) => value && value !== '')
                          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                          .join(' | ') || 'Empty search'}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}

          {/* Filter Groups */}
          {Object.entries(filterGroups).map(([groupName, groupFilters]) => (
            <Accordion
              key={groupName}
              expanded={expandedGroups.includes(groupName)}
              onChange={() => {
                setExpandedGroups(prev =>
                  prev.includes(groupName)
                    ? prev.filter(g => g !== groupName)
                    : [...prev, groupName]
                )
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                    {groupName} Filters
                  </Typography>
                  {groupFilters.some(f => searchCriteria[f.id]) && (
                    <Chip
                      size="small"
                      label={groupFilters.filter(f => searchCriteria[f.id]).length}
                      color="primary"
                    />
                  )}
                </Stack>
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={3}>
                  {groupFilters.map(filter => (
                    <Grid
                      key={filter.id}
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 4
                      }}>
                      {renderFilter(filter)}
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
          <Button
            onClick={handleClearAll}
            startIcon={<Clear />}
            disabled={appliedFiltersCount === 0}
          >
            Clear All
          </Button>
          
          <Box sx={{ flex: 1 }} />
          
          {allowSavedSearches && (
            <Button
              onClick={() => setShowSaveDialog(true)}
              startIcon={<Save />}
              disabled={appliedFiltersCount === 0}
            >
              Save
            </Button>
          )}
          
          <Button onClick={onClose}>
            Cancel
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<Search />}
          >
            Search
          </Button>
        </Stack>
      </DialogActions>
      {/* Save Search Dialog */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Search</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Search Name"
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Enter a name for this search"
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description (optional)"
              value={saveSearchDescription}
              onChange={(e) => setSaveSearchDescription(e.target.value)}
              placeholder="Describe what this search is for"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSearch}
            disabled={!saveSearchName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

export default AdvancedSearch

// Common search filters for different contexts
export const SEARCH_FILTERS = {
  EMPLOYEES: [
    {
      id: 'search',
      label: 'Name, Email or ID',
      type: 'text',
      placeholder: 'Search employees...',
      group: 'basic'
    },
    {
      id: 'department',
      label: 'Department',
      type: 'multiselect',
      group: 'basic',
      options: [
        { value: 'engineering', label: 'Engineering' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'Human Resources' },
        { value: 'finance', label: 'Finance' },
      ]
    },
    {
      id: 'status',
      label: 'Employment Status',
      type: 'select',
      group: 'basic',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'terminated', label: 'Terminated' },
        { value: 'on-leave', label: 'On Leave' },
      ]
    },
    {
      id: 'position_level',
      label: 'Position Level',
      type: 'multiselect',
      group: 'advanced',
      options: [
        { value: 'intern', label: 'Intern' },
        { value: 'junior', label: 'Junior' },
        { value: 'mid', label: 'Mid-Level' },
        { value: 'senior', label: 'Senior' },
        { value: 'lead', label: 'Lead' },
        { value: 'manager', label: 'Manager' },
      ]
    },
    {
      id: 'hire_date_start',
      label: 'Hired After',
      type: 'date',
      group: 'advanced'
    },
    {
      id: 'hire_date_end',
      label: 'Hired Before',
      type: 'date',
      group: 'advanced'
    },
    {
      id: 'salary_range',
      label: 'Salary Range',
      type: 'slider',
      min: 30000,
      max: 200000,
      step: 5000,
      group: 'advanced'
    },
    {
      id: 'remote_work',
      label: 'Remote Work Enabled',
      type: 'boolean',
      group: 'advanced'
    },
  ] as SearchFilter[],

  DOCUMENTS: [
    {
      id: 'search',
      label: 'Document Name or Content',
      type: 'text',
      placeholder: 'Search documents...',
      group: 'basic'
    },
    {
      id: 'document_type',
      label: 'Document Type',
      type: 'multiselect',
      group: 'basic',
      options: [
        { value: 'policy', label: 'Policy' },
        { value: 'form', label: 'Form' },
        { value: 'contract', label: 'Contract' },
        { value: 'manual', label: 'Manual' },
        { value: 'report', label: 'Report' },
      ]
    },
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      group: 'basic',
      options: [
        { value: 'hr', label: 'Human Resources' },
        { value: 'finance', label: 'Finance' },
        { value: 'legal', label: 'Legal' },
        { value: 'it', label: 'IT' },
        { value: 'general', label: 'General' },
      ]
    },
    {
      id: 'created_date_start',
      label: 'Created After',
      type: 'date',
      group: 'advanced'
    },
    {
      id: 'created_date_end',
      label: 'Created Before',
      type: 'date',
      group: 'advanced'
    },
    {
      id: 'file_size',
      label: 'File Size (MB)',
      type: 'slider',
      min: 0,
      max: 100,
      step: 1,
      group: 'advanced'
    },
    {
      id: 'confidential',
      label: 'Confidential Documents Only',
      type: 'boolean',
      group: 'advanced'
    },
  ] as SearchFilter[],
} as const