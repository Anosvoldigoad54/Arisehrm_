'use client'

import React, { useState } from 'react'
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
  alpha,
  useTheme,
} from '@mui/material'
import {
  LightMode,
  DarkMode,
  SettingsBrightness,
  Brightness7,
  Brightness4,
  BrightnessAuto,
  Check,
} from '@mui/icons-material'
import { useThemeMode } from '../../contexts/ThemeContext'

interface ThemeToggleProps {
  variant?: 'menu' | 'button'
  size?: 'small' | 'medium' | 'large'
  showTooltip?: boolean
}

export function ThemeToggle({ variant = 'button', size = 'medium' }: ThemeToggleProps) {
  const { themeMode, toggleTheme, setThemeMode } = useThemeMode()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const theme = useTheme()

  const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const closeMenu = () => setAnchorEl(null)

  const icon =
    themeMode === 'light' ? <LightMode /> : themeMode === 'dark' ? <DarkMode /> : <SettingsBrightness />

  if (variant === 'button') {
    return (
      <Tooltip title={`Current: ${themeMode} theme - Click to cycle`} arrow>
        <IconButton
          color="inherit"
          onClick={toggleTheme}
          size={size}
          sx={{
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
            }
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>
    )
  }

  const themeOptions = [
    { id: 'light', label: 'Light Mode', icon: <Brightness7 />, desc: 'Bright theme for daytime use' },
    { id: 'dark', label: 'Dark Mode', icon: <Brightness4 />, desc: 'Dark theme for night time' },
    { id: 'system', label: 'System Theme', icon: <BrightnessAuto />, desc: 'Follow system preference' },
  ]

  return (
    <>
      <Tooltip title="Theme preferences" arrow>
        <IconButton
          color="inherit"
          onClick={openMenu}
          size={size}
          sx={{
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
            }
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        TransitionComponent={Fade}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              minWidth: 200,
              boxShadow: theme.shadows[8],
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }
          }
        }}
      >
        {themeOptions.map((opt) => (
          <MenuItem
            key={opt.id}
            selected={themeMode === opt.id}
            onClick={() => {
              setThemeMode(opt.id as any)
              closeMenu()
            }}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {opt.icon}
            </ListItemIcon>
            <ListItemText
              primary={opt.label}
              secondary={opt.desc}
              primaryTypographyProps={{ fontWeight: 500 }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
            {themeMode === opt.id && (
              <Check fontSize="small" color="primary" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
