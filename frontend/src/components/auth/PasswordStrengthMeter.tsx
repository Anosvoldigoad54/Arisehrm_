'use client'

import React from 'react'
import { Box, Typography, LinearProgress, Stack, Chip } from '@mui/material'
import { CheckCircle, Warning, Error, Security } from '@mui/icons-material'

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Enter password', color: '#64748b', suggestions: [] }
    
    let score = 0
    const suggestions: string[] = []

    // Length checks
    if (pwd.length >= 8) score += 20
    else suggestions.push('At least 8 characters')
    if (pwd.length >= 12) score += 10
    if (pwd.length >= 16) score += 10

    // Character variety
    if (/[a-z]/.test(pwd)) score += 15
    else suggestions.push('Add lowercase letters')
    if (/[A-Z]/.test(pwd)) score += 15
    else suggestions.push('Add uppercase letters')
    if (/[0-9]/.test(pwd)) score += 15
    else suggestions.push('Add numbers')
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15
    else suggestions.push('Add special characters')

    // Pattern checks
    if (!/(.)\1{2,}/.test(pwd)) score += 5 // No repeated characters
    if (!/123|abc|qwe/i.test(pwd)) score += 5 // No common sequences

    let label = 'Very Weak'
    let color = '#ef4444'
    let bgColor = 'rgba(239, 68, 68, 0.1)'

    if (score >= 90) {
      label = 'Excellent'
      color = '#10b981'
      bgColor = 'rgba(16, 185, 129, 0.1)'
    } else if (score >= 70) {
      label = 'Strong'
      color = '#06b6d4'
      bgColor = 'rgba(6, 182, 212, 0.1)'
    } else if (score >= 50) {
      label = 'Good'
      color = '#8b5cf6'
      bgColor = 'rgba(139, 92, 246, 0.1)'
    } else if (score >= 30) {
      label = 'Fair'
      color = '#f59e0b'
      bgColor = 'rgba(245, 158, 11, 0.1)'
    } else if (score >= 10) {
      label = 'Weak'
      color = '#ec4899'
      bgColor = 'rgba(236, 72, 153, 0.1)'
    }

    return { score, label, color, bgColor, suggestions }
  }

  const { score, label, color, bgColor, suggestions } = getStrength(password)

  const getIcon = () => {
    if (score >= 70) return <CheckCircle sx={{ color, fontSize: '1rem' }} />
    if (score >= 30) return <Warning sx={{ color, fontSize: '1rem' }} />
    return <Error sx={{ color, fontSize: '1rem' }} />
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        background: bgColor,
        border: `1px solid ${color}40`,
        transition: 'all 0.3s ease',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        {getIcon()}
        <Typography 
          variant="body2" 
          sx={{ 
            color, 
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          Password Strength: {label}
        </Typography>
      </Stack>
      
      <LinearProgress
        variant="determinate"
        value={Math.min(score, 100)}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            borderRadius: 4,
          },
        }}
      />

      {suggestions.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#cbd5e1', 
              fontSize: '0.75rem',
              display: 'block'
            }}
          >
            Suggestions: {suggestions.slice(0, 2).join(', ')}
            {suggestions.length > 2 && '...'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
