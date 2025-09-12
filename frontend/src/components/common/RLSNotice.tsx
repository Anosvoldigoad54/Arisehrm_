import React from 'react'
import { Alert, Typography, Box, Button, Link } from '@mui/material'
import { Security, OpenInNew } from '@mui/icons-material'

interface RLSNoticeProps {
  show?: boolean
  onDismiss?: () => void
}

export function RLSNotice({ show = true, onDismiss }: RLSNoticeProps) {
  if (!show || !import.meta.env.DEV) return null

  return (
    <Alert 
      severity="info" 
      icon={<Security />}
      sx={{ mb: 2 }}
      onClose={onDismiss}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
        🔒 Development Mode: RLS Bypass Active
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Row Level Security is blocking database access. The app is using fallback data for demonstration.
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          To enable live data, choose one option:
        </Typography>
        
        <Box sx={{ ml: 2 }}>
          <Typography variant="caption" display="block">
            • <strong>Quick Fix:</strong> Disable RLS in Supabase Dashboard → Authentication → Policies
          </Typography>
          <Typography variant="caption" display="block">
            • <strong>Recommended:</strong> Create RLS policies for authenticated users
          </Typography>
          <Typography variant="caption" display="block">
            • <strong>Admin:</strong> Use service role key in environment variables
          </Typography>
        </Box>
        
        <Box sx={{ mt: 1 }}>
          <Link 
            href="https://supabase.com/docs/guides/auth/row-level-security" 
            target="_blank"
            rel="noopener"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem' }}
          >
            RLS Documentation <OpenInNew fontSize="inherit" />
          </Link>
        </Box>
      </Box>
    </Alert>
  )
}

export default RLSNotice
