import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  LinearProgress
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { IconButton, InputAdornment } from '@mui/material'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface PasswordChangeDialogProps {
  open: boolean
  onClose: () => void
  isFirstLogin?: boolean
  employeeId?: string
}

export const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({
  open,
  onClose,
  isFirstLogin = false,
  employeeId
}) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return errors
  }

  const handlePasswordChange = async () => {
    try {
      setLoading(true)
      setErrors([])

      // Validate new password
      const passwordErrors = validatePassword(newPassword)
      if (passwordErrors.length > 0) {
        setErrors(passwordErrors)
        return
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        setErrors(['New passwords do not match'])
        return
      }

      // Update password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (authError) throw authError

      // Update employee record to mark password as changed
      if (employeeId) {
        const { error: updateError } = await supabase
          .from('employees')
          .update({ 
            is_first_login: false,
            default_password: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', employeeId)

        if (updateError) throw updateError
      }

      toast.success('Password updated successfully!')
      onClose()
      
      // Refresh the page if it's first login
      if (isFirstLogin) {
        const isLoginInProgress = sessionStorage.getItem('login_in_progress') === 'true' ||
                                 localStorage.getItem('auth_token') !== null ||
                                 document.querySelector('.UnifiedLoginSystem') !== null;
        
        if (!isLoginInProgress) {
          window.location.reload()
        } else {
          console.log('[PasswordChange] Skipping refresh during authentication flow');
          // Just close the dialog instead of refreshing
        }
      }

    } catch (error: any) {
      setErrors([error.message || 'Failed to update password'])
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/\d/.test(password)) strength += 20
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20
    return strength
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'error'
    if (strength < 80) return 'warning'
    return 'success'
  }

  const getStrengthLabel = (strength: number) => {
    if (strength < 40) return 'Weak'
    if (strength < 80) return 'Medium'
    return 'Strong'
  }

  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <Dialog 
      open={open} 
      onClose={isFirstLogin ? undefined : onClose}
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={isFirstLogin}
    >
      <DialogTitle>
        {isFirstLogin ? 'Change Your Password' : 'Update Password'}
      </DialogTitle>
      <DialogContent>
        {isFirstLogin && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You must change your password before continuing. This is required for security.
          </Alert>
        )}
        
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        {!isFirstLogin && (
          <TextField
            fullWidth
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

        <TextField
          fullWidth
          label="New Password"
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {newPassword && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Password Strength: {getStrengthLabel(passwordStrength)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={passwordStrength}
              color={getStrengthColor(passwordStrength) as any}
              sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
            />
          </Box>
        )}

        <TextField
          fullWidth
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          error={confirmPassword && newPassword !== confirmPassword}
          helperText={
            confirmPassword && newPassword !== confirmPassword
              ? 'Passwords do not match'
              : ''
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Password requirements:
          <br />• At least 8 characters long
          <br />• Contains uppercase and lowercase letters
          <br />• Contains at least one number
          <br />• Contains at least one special character
        </Typography>
      </DialogContent>
      <DialogActions>
        {!isFirstLogin && (
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handlePasswordChange}
          disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PasswordChangeDialog
