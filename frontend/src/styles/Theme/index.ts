import { createTheme, ThemeOptions, alpha } from '@mui/material/styles'
import { designTokens, semantic, gradients, shadows, animation } from './tokens'

// Shared Brand Colors
const brandColors = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff', 
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',    // Main brand color
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  
  secondary: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a', 
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',    // Gold accent
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  
  accent: {
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    pink: '#ec4899',
    emerald: '#10b981',
  },
  
  status: {
    error: '#ef4444',
    warning: '#f59e0b', 
    info: '#06b6d4',
    success: '#10b981',
  },
}

// Premium Dark Theme Colors
const darkThemeColors = {
  background: {
    default: '#0a0a0f',
    paper: '#121218',
    surface: '#1a1a25',
    elevated: '#212130',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    disabled: '#64748b',
  },
  border: '#1e293b',
  divider: '#334155',
}

// Premium Light Theme Colors
const lightThemeColors = {
  background: {
    default: '#fafafc',
    paper: '#ffffff',
    surface: '#f8fafc',
    elevated: '#f1f5f9',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    disabled: '#94a3b8',
  },
  border: '#e2e8f0',
  divider: '#e2e8f0',
}

// Enhanced Base Theme Configuration with Design Tokens
const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Geist", "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeightLight: designTokens.fontWeight.light,
    fontWeightRegular: designTokens.fontWeight.normal,
    fontWeightMedium: designTokens.fontWeight.medium,
    fontWeightBold: designTokens.fontWeight.semibold,
    h1: {
      fontSize: '3rem',
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.50rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none' as const,
      letterSpacing: '0.025em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  
  shape: {
    borderRadius: parseInt(designTokens.borderRadius.lg),
  },

  spacing: 8,

  breakpoints: {
    values: {
      xs: parseInt(designTokens.breakpoints.xs),
      sm: parseInt(designTokens.breakpoints.sm),
      md: parseInt(designTokens.breakpoints.md),
      lg: parseInt(designTokens.breakpoints.lg),
      xl: parseInt(designTokens.breakpoints.xl),
    },
  },

  transitions: {
    duration: {
      shortest: parseInt(designTokens.animation.duration.fastest),
      shorter: parseInt(designTokens.animation.duration.fast),
      short: parseInt(designTokens.animation.duration.normal),
      standard: parseInt(designTokens.animation.duration.normal),
      complex: parseInt(designTokens.animation.duration.slow),
      enteringScreen: parseInt(designTokens.animation.duration.normal),
      leavingScreen: parseInt(designTokens.animation.duration.fast),
    },
    easing: {
      easeInOut: designTokens.animation.ease.inOut,
      easeOut: designTokens.animation.ease.out,
      easeIn: designTokens.animation.ease.in,
      sharp: designTokens.animation.ease.linear,
    },
  },
}

// Dark Theme Configuration
export const darkThemeConfig: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: brandColors.primary[500],
      light: brandColors.primary[400],
      dark: brandColors.primary[700],
      contrastText: darkThemeColors.text.primary,
    },
    secondary: {
      main: brandColors.secondary[500],
      light: brandColors.secondary[400],
      dark: brandColors.secondary[700],
      contrastText: darkThemeColors.background.default,
    },
    error: {
      main: brandColors.status.error,
      light: '#f87171',
      dark: '#dc2626',
      contrastText: darkThemeColors.text.primary,
    },
    warning: {
      main: brandColors.status.warning,
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: darkThemeColors.background.default,
    },
    info: {
      main: brandColors.status.info,
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: darkThemeColors.text.primary,
    },
    success: {
      main: brandColors.status.success,
      light: '#34d399',
      dark: '#059669',
      contrastText: darkThemeColors.text.primary,
    },
    background: {
      default: darkThemeColors.background.default,
      paper: darkThemeColors.background.paper,
    },
    text: {
      primary: darkThemeColors.text.primary,
      secondary: darkThemeColors.text.secondary,
      disabled: darkThemeColors.text.disabled,
    },
    divider: darkThemeColors.divider,
    action: {
      active: brandColors.primary[400],
      hover: 'rgba(99, 102, 241, 0.08)',
      selected: 'rgba(99, 102, 241, 0.12)',
      disabled: darkThemeColors.text.disabled,
      disabledBackground: darkThemeColors.background.surface,
      focus: 'rgba(99, 102, 241, 0.16)',
    },
  },
  
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.5)',
    '0 4px 6px rgba(0, 0, 0, 0.3)',
    '0 5px 15px rgba(0, 0, 0, 0.3)',
    '0 10px 24px rgba(0, 0, 0, 0.3)',
    '0 15px 35px rgba(0, 0, 0, 0.3)',
    '0 20px 40px rgba(0, 0, 0, 0.3)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
    '0 25px 50px rgba(0, 0, 0, 0.4)',
  ],
  
  // Cast to any to accommodate extended CSSObject usage in styleOverrides
  components: getDarkComponents() as any,
}

// Light Theme Configuration
export const lightThemeConfig: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primary[600],
      light: brandColors.primary[400],
      dark: brandColors.primary[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.secondary[600],
      light: brandColors.secondary[400],
      dark: brandColors.secondary[800],
      contrastText: '#ffffff',
    },
    error: {
      main: brandColors.status.error,
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    warning: {
      main: brandColors.status.warning,
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      main: brandColors.status.info,
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    success: {
      main: brandColors.status.success,
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    background: {
      default: lightThemeColors.background.default,
      paper: lightThemeColors.background.paper,
    },
    text: {
      primary: lightThemeColors.text.primary,
      secondary: lightThemeColors.text.secondary,
      disabled: lightThemeColors.text.disabled,
    },
    divider: lightThemeColors.divider,
    action: {
      active: brandColors.primary[600],
      hover: 'rgba(99, 102, 241, 0.04)',
      selected: 'rgba(99, 102, 241, 0.08)',
      disabled: lightThemeColors.text.disabled,
      disabledBackground: lightThemeColors.background.surface,
      focus: 'rgba(99, 102, 241, 0.12)',
    },
  },
  
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  
  components: getLightComponents() as any,
}

// Dark Mode Components
function getDarkComponents() {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `radial-gradient(ellipse at top, ${darkThemeColors.background.surface} 0%, ${darkThemeColors.background.default} 100%)`,
          scrollbarColor: `${brandColors.primary[600]} ${darkThemeColors.background.surface}`,
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: brandColors.primary[600],
            borderRadius: 8,
            '&:hover': {
              backgroundColor: brandColors.primary[500],
            },
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: darkThemeColors.background.surface,
            borderRadius: 8,
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: darkThemeColors.background.paper,
          borderRadius: designTokens.borderRadius.card,
          border: `1px solid ${darkThemeColors.border}`,
          boxShadow: shadows.card,
          backdropFilter: 'blur(20px)',
          transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.ease.inOut}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: shadows.cardHover,
            borderColor: brandColors.primary[600],
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.chip,
          fontWeight: designTokens.fontWeight.medium,
          transition: `all ${designTokens.animation.duration.fast} ${designTokens.animation.ease.out}`,
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: shadows.sm,
          },
        },
        colorPrimary: {
          background: gradients.brandPrimary,
          color: darkThemeColors.text.primary,
        },
        colorSecondary: {
          background: gradients.brandSecondary,
          color: darkThemeColors.background.default,
        },
      },
    },

    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.xl,
          boxShadow: shadows.lg,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: shadows.xl,
          },
        },
        primary: {
          background: gradients.brandPrimary,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: gradients.brandPrimary,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(darkThemeColors.text.primary, 0.1)}`,
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: gradients.brandPrimary,
          borderRight: 'none',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '3px',
          },
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.md,
          margin: '2px 8px',
          transition: `all ${designTokens.animation.duration.fast} ${designTokens.animation.ease.out}`,
          '&:hover': {
            backgroundColor: alpha(darkThemeColors.text.primary, 0.1),
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: alpha(darkThemeColors.text.primary, 0.15),
            '&:before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '3px',
              backgroundColor: brandColors.secondary[400],
              borderRadius: '0 2px 2px 0',
            },
          },
        },
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: darkThemeColors.background.paper,
          border: `1px solid ${darkThemeColors.border}`,
          borderRadius: designTokens.borderRadius.lg,
          '& .MuiDataGrid-cell': {
            borderColor: darkThemeColors.border,
            '&:focus': {
              outline: `2px solid ${brandColors.primary[400]}`,
              outlineOffset: '-2px',
            },
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: darkThemeColors.background.surface,
            borderColor: darkThemeColors.border,
            fontWeight: designTokens.fontWeight.semibold,
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: alpha(brandColors.primary[400], 0.05),
            },
            '&.Mui-selected': {
              backgroundColor: alpha(brandColors.primary[400], 0.1),
            },
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            background: gradients.brandPrimary,
            height: '3px',
            borderRadius: '2px',
          },
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: designTokens.fontWeight.medium,
          fontSize: designTokens.fontSize.sm,
          minHeight: '48px',
          transition: `all ${designTokens.animation.duration.fast} ${designTokens.animation.ease.out}`,
          '&:hover': {
            color: brandColors.primary[300],
            backgroundColor: alpha(brandColors.primary[400], 0.05),
          },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: darkThemeColors.background.paper,
          border: `1px solid ${darkThemeColors.border}`,
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: shadows.dropdown,
          backdropFilter: 'blur(16px)',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: darkThemeColors.background.paper,
          borderRadius: designTokens.borderRadius.modal,
          boxShadow: shadows.modal,
          backdropFilter: 'blur(20px)',
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          border: '1px solid',
          '&.MuiAlert-standardSuccess': {
            backgroundColor: alpha(semantic.status.positive, 0.1),
            borderColor: semantic.status.positive,
            color: darkThemeColors.text.primary,
          },
          '&.MuiAlert-standardError': {
            backgroundColor: alpha(semantic.status.negative, 0.1),
            borderColor: semantic.status.negative,
            color: darkThemeColors.text.primary,
          },
          '&.MuiAlert-standardWarning': {
            backgroundColor: alpha(semantic.status.warning, 0.1),
            borderColor: semantic.status.warning,
            color: darkThemeColors.text.primary,
          },
          '&.MuiAlert-standardInfo': {
            backgroundColor: alpha(semantic.status.info, 0.1),
            borderColor: semantic.status.info,
            color: darkThemeColors.text.primary,
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: darkThemeColors.background.paper,
          backgroundImage: 'none',
          borderRadius: 16,
        },
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          textTransform: 'none',
          fontSize: '0.875rem',
          padding: '12px 28px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${brandColors.primary[500]} 0%, ${brandColors.accent.purple} 100%)`,
          color: darkThemeColors.text.primary,
          '&:hover': {
            background: `linear-gradient(135deg, ${brandColors.primary[600]} 0%, ${brandColors.accent.purple} 100%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${brandColors.secondary[500]} 0%, ${brandColors.secondary[600]} 100%)`,
          color: darkThemeColors.background.default,
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: darkThemeColors.background.surface,
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary[400],
            },
            '& .MuiOutlinedInput-input': {
              color: darkThemeColors.text.primary,
            },
          },
          '& .MuiInputLabel-root': {
            color: darkThemeColors.text.tertiary,
            '&.Mui-focused': {
              color: brandColors.primary[400],
            },
          },
        },
      },
    },
    
    // ... other dark mode components
  }
}

// Light Mode Components
function getLightComponents() {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(135deg, ${lightThemeColors.background.default} 0%, ${lightThemeColors.background.surface} 100%)`,
          scrollbarColor: `${brandColors.primary[600]} ${lightThemeColors.background.surface}`,
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: brandColors.primary[600],
            borderRadius: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: lightThemeColors.background.surface,
            borderRadius: 8,
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: lightThemeColors.background.paper,
          borderRadius: 20,
          border: `1px solid ${lightThemeColors.border}`,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            borderColor: brandColors.primary[300],
          },
        },
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          textTransform: 'none',
          fontSize: '0.875rem',
          padding: '12px 28px',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${brandColors.primary[600]} 0%, ${brandColors.accent.purple} 100%)`,
          color: '#ffffff',
        },
      },
    },
    
    // ... other light mode components
  }
}

// Create themes
export const darkTheme = createTheme(darkThemeConfig)
export const lightTheme = createTheme(lightThemeConfig)

// Default export (dark theme)
export const theme = darkTheme
export default darkTheme

// Theme utilities
export { brandColors, darkThemeColors, lightThemeColors }
