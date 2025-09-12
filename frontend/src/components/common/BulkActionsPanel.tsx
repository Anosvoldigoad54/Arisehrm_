import React, { useState } from 'react'
import {
  Paper,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Close,
  Delete,
  Edit,
  Archive,
  Unarchive,
  Download,
  Upload,
  Send,
  Block,
  CheckCircle,
  Cancel,
  MoreHoriz,
  ExpandMore,
  ExpandLess,
  Warning,
  Info,
  Group,
  Assignment,
  Email,
  Lock,
  LockOpen,
  Person,
  PersonOff,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  confirmationRequired?: boolean
  confirmationMessage?: string
  requiresInput?: boolean
  inputLabel?: string
  inputType?: 'text' | 'select' | 'textarea'
  selectOptions?: { value: string; label: string }[]
  dangerous?: boolean
}

export interface BulkActionsPanelProps {
  selectedItems: any[]
  onClearSelection: () => void
  onAction: (actionId: string, items: any[], inputValue?: string) => Promise<void>
  actions: BulkAction[]
  itemType?: string // e.g., "employees", "users", "documents"
  maxDisplayItems?: number
}

const BulkActionsPanel: React.FC<BulkActionsPanelProps> = ({
  selectedItems,
  onClearSelection,
  onAction,
  actions,
  itemType = 'items',
  maxDisplayItems = 3
}) => {
  const theme = useTheme()
  
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: BulkAction | null
    inputValue: string
  }>({
    open: false,
    action: null,
    inputValue: ''
  })
  const [processing, setProcessing] = useState(false)
  const [expandedPreview, setExpandedPreview] = useState(false)

  if (selectedItems.length === 0) {
    return null
  }

  const handleActionClick = (action: BulkAction) => {
    if (action.confirmationRequired || action.requiresInput) {
      setConfirmDialog({
        open: true,
        action,
        inputValue: ''
      })
    } else {
      executeAction(action, '')
    }
    setAnchorEl(null)
  }

  const executeAction = async (action: BulkAction, inputValue?: string) => {
    setProcessing(true)
    try {
      await onAction(action.id, selectedItems, inputValue)
      toast.success(`${action.label} completed for ${selectedItems.length} ${itemType}`)
      setConfirmDialog({ open: false, action: null, inputValue: '' })
    } catch (error: any) {
      toast.error(`Failed to ${action.label.toLowerCase()}: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const getItemDisplayText = (item: any) => {
    // Try different common fields for item identification
    return item.name || 
           item.title || 
           item.email || 
           `${item.first_name || ''} ${item.last_name || ''}`.trim() ||
           item.id ||
           'Unknown'
  }

  const primaryActions = actions.filter(action => !action.dangerous).slice(0, 3)
  const secondaryActions = actions.filter(action => action.dangerous)
  const moreActions = actions.slice(3)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Paper
          elevation={4}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.appBar - 1,
            mb: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          <Box sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Selection Info */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                <Group color="primary" />
                <Typography variant="body1" fontWeight="medium" color="primary">
                  {selectedItems.length} {itemType} selected
                </Typography>
                
                {/* Preview selected items */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {selectedItems.slice(0, maxDisplayItems).map((item, index) => (
                    <Chip
                      key={index}
                      label={getItemDisplayText(item)}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                  {selectedItems.length > maxDisplayItems && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setExpandedPreview(!expandedPreview)}
                      endIcon={expandedPreview ? <ExpandLess /> : <ExpandMore />}
                    >
                      +{selectedItems.length - maxDisplayItems} more
                    </Button>
                  )}
                </Box>
              </Stack>

              {/* Actions */}
              <Stack direction="row" spacing={1}>
                {/* Primary Actions */}
                {primaryActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outlined"
                    size="small"
                    startIcon={action.icon}
                    onClick={() => handleActionClick(action)}
                    color={action.color || 'primary'}
                    disabled={processing}
                  >
                    {action.label}
                  </Button>
                ))}

                {/* More Actions Menu */}
                {(moreActions.length > 0 || secondaryActions.length > 0) && (
                  <>
                    <IconButton
                      size="small"
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      disabled={processing}
                    >
                      <MoreHoriz />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => setAnchorEl(null)}
                      PaperProps={{ sx: { minWidth: 200 } }}
                    >
                      {moreActions.map((action) => (
                        <MenuItem
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          disabled={processing}
                        >
                          <ListItemIcon>
                            {action.icon}
                          </ListItemIcon>
                          <ListItemText primary={action.label} />
                        </MenuItem>
                      ))}
                      
                      {secondaryActions.length > 0 && moreActions.length > 0 && (
                        <Divider />
                      )}
                      
                      {secondaryActions.map((action) => (
                        <MenuItem
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          disabled={processing}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <ListItemIcon sx={{ color: 'inherit' }}>
                            {action.icon}
                          </ListItemIcon>
                          <ListItemText primary={action.label} />
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}

                {/* Clear Selection */}
                <IconButton
                  size="small"
                  onClick={onClearSelection}
                  disabled={processing}
                  sx={{ ml: 1 }}
                >
                  <Close />
                </IconButton>
              </Stack>
            </Stack>

            {/* Expanded Preview */}
            <Collapse in={expandedPreview}>
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Selected {itemType}:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 120, overflow: 'auto' }}>
                  {selectedItems.map((item, index) => (
                    <Chip
                      key={index}
                      label={getItemDisplayText(item)}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </Box>
            </Collapse>
          </Box>
        </Paper>
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => !processing && setConfirmDialog({ open: false, action: null, inputValue: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            {confirmDialog.action?.icon}
            <Typography variant="h6">
              {confirmDialog.action?.label}
            </Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          {confirmDialog.action?.dangerous && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. Please proceed with caution.
            </Alert>
          )}
          
          <Typography variant="body1" gutterBottom>
            {confirmDialog.action?.confirmationMessage || 
             `Are you sure you want to ${confirmDialog.action?.label.toLowerCase()} ${selectedItems.length} ${itemType}?`}
          </Typography>

          {confirmDialog.action?.requiresInput && (
            <Box sx={{ mt: 2 }}>
              {confirmDialog.action.inputType === 'select' ? (
                <FormControl fullWidth>
                  <InputLabel>{confirmDialog.action.inputLabel}</InputLabel>
                  <Select
                    value={confirmDialog.inputValue}
                    onChange={(e) => setConfirmDialog(prev => ({ ...prev, inputValue: e.target.value }))}
                    label={confirmDialog.action.inputLabel}
                  >
                    {confirmDialog.action.selectOptions?.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : confirmDialog.action.inputType === 'textarea' ? (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={confirmDialog.action.inputLabel}
                  value={confirmDialog.inputValue}
                  onChange={(e) => setConfirmDialog(prev => ({ ...prev, inputValue: e.target.value }))}
                />
              ) : (
                <TextField
                  fullWidth
                  label={confirmDialog.action.inputLabel}
                  value={confirmDialog.inputValue}
                  onChange={(e) => setConfirmDialog(prev => ({ ...prev, inputValue: e.target.value }))}
                />
              )}
            </Box>
          )}

          {/* Preview affected items */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              This will affect the following {itemType}:
            </Typography>
            <List dense sx={{ maxHeight: 150, overflow: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 1, mt: 1 }}>
              {selectedItems.slice(0, 10).map((item, index) => (
                <ListItem key={index} dense>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Checkbox checked size="small" disabled />
                  </ListItemIcon>
                  <ListItemText 
                    primary={getItemDisplayText(item)}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
              {selectedItems.length > 10 && (
                <ListItem dense>
                  <ListItemText 
                    primary={`... and ${selectedItems.length - 10} more`}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', fontStyle: 'italic' }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, action: null, inputValue: '' })}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={() => confirmDialog.action && executeAction(confirmDialog.action, confirmDialog.inputValue)}
            variant="contained"
            color={confirmDialog.action?.dangerous ? 'error' : confirmDialog.action?.color || 'primary'}
            disabled={processing || (confirmDialog.action?.requiresInput && !confirmDialog.inputValue.trim())}
            startIcon={processing ? <CircularProgress size={16} /> : confirmDialog.action?.icon}
          >
            {processing ? 'Processing...' : confirmDialog.action?.label}
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatePresence>
  )
}

export default BulkActionsPanel

// Common bulk actions for different item types
export const BULK_ACTIONS = {
  EMPLOYEES: [
    {
      id: 'export',
      label: 'Export',
      icon: <Download />,
      color: 'primary' as const,
    },
    {
      id: 'send_message',
      label: 'Send Message',
      icon: <Email />,
      color: 'primary' as const,
      requiresInput: true,
      inputLabel: 'Message',
      inputType: 'textarea' as const,
    },
    {
      id: 'update_department',
      label: 'Update Department',
      icon: <Edit />,
      color: 'primary' as const,
      requiresInput: true,
      inputLabel: 'Department',
      inputType: 'select' as const,
      selectOptions: [
        { value: 'engineering', label: 'Engineering' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'Human Resources' },
        { value: 'finance', label: 'Finance' },
      ],
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive />,
      color: 'warning' as const,
      confirmationRequired: true,
      confirmationMessage: 'Archived employees will be hidden from the main directory but their data will be preserved.',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Delete />,
      color: 'error' as const,
      dangerous: true,
      confirmationRequired: true,
      confirmationMessage: 'This will permanently delete the selected employees and all their associated data.',
    },
  ] as BulkAction[],

  USERS: [
    {
      id: 'activate',
      label: 'Activate',
      icon: <CheckCircle />,
      color: 'success' as const,
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: <Cancel />,
      color: 'warning' as const,
      confirmationRequired: true,
    },
    {
      id: 'reset_password',
      label: 'Reset Password',
      icon: <Lock />,
      color: 'primary' as const,
      confirmationRequired: true,
      confirmationMessage: 'This will generate new passwords for the selected users and send them via email.',
    },
    {
      id: 'unlock_accounts',
      label: 'Unlock Accounts',
      icon: <LockOpen />,
      color: 'info' as const,
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Download />,
      color: 'primary' as const,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Delete />,
      color: 'error' as const,
      dangerous: true,
      confirmationRequired: true,
      confirmationMessage: 'This will permanently delete the selected user accounts. This action cannot be undone.',
    },
  ] as BulkAction[],

  DOCUMENTS: [
    {
      id: 'download',
      label: 'Download',
      icon: <Download />,
      color: 'primary' as const,
    },
    {
      id: 'share',
      label: 'Share',
      icon: <Send />,
      color: 'primary' as const,
      requiresInput: true,
      inputLabel: 'Share with (email)',
      inputType: 'text' as const,
    },
    {
      id: 'move_to_folder',
      label: 'Move to Folder',
      icon: <Assignment />,
      color: 'primary' as const,
      requiresInput: true,
      inputLabel: 'Folder',
      inputType: 'select' as const,
      selectOptions: [
        { value: 'hr', label: 'HR Documents' },
        { value: 'finance', label: 'Finance Documents' },
        { value: 'legal', label: 'Legal Documents' },
        { value: 'policies', label: 'Policies' },
      ],
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive />,
      color: 'warning' as const,
      confirmationRequired: true,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Delete />,
      color: 'error' as const,
      dangerous: true,
      confirmationRequired: true,
    },
  ] as BulkAction[],
}