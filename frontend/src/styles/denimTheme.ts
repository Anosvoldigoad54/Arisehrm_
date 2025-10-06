import { ThemeOptions, PaletteColorOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Denim Color Palette
export const denimColors = {
  50: '#f0f8fe',   // Lightest - backgrounds
  100: '#deedfb',  // Very light - hover states
  200: '#c4e2f9',  // Light - borders, dividers
  300: '#9bcff5',  // Light accent - chips, badges
  400: '#6bb5ef',  // Medium light - secondary buttons
  500: '#4997e8',  // Medium - primary color
  600: '#347bdc',  // Medium dark - primary hover
  700: '#2962c2',  // Dark - primary pressed
  800: '#2954a4',  // Darker - headings
  900: '#264882',  // Darkest - text
  950: '#1b2d50',  // Ultra dark - dark theme backgrounds
} as const;

// Semantic color mapping
export const semanticColors = {
  primary: denimColors[500],
  primaryLight: denimColors[300],
  primaryDark: denimColors[700],
  primaryContrast: '#ffffff',
  
  secondary: denimColors[400],
  secondaryLight: denimColors[200],
  secondaryDark: denimColors[600],
  secondaryContrast: '#ffffff',
  
  background: {
    light: denimColors[50],
    main: '#ffffff',
    dark: denimColors[950],
    paper: '#ffffff',
    paperDark: denimColors[900],
  },
  
  text: {
    primary: denimColors[900],
    secondary: denimColors[700],
    disabled: denimColors[400],
    primaryDark: denimColors[100],
    secondaryDark: denimColors[300],
  },
  
  divider: denimColors[200],
  dividerDark: denimColors[800],
  
  success: '#10b981',
  warning: '#f59e0b', 
  error: '#ef4444',
  info: denimColors[400],
} as const;

// Gradient definitions
export const denimGradients = {
  primary: `linear-gradient(135deg, ${denimColors[500]} 0%, ${denimColors[600]} 100%)`,
  light: `linear-gradient(135deg, ${denimColors[200]} 0%, ${denimColors[300]} 100%)`,
  dark: `linear-gradient(135deg, ${denimColors[700]} 0%, ${denimColors[800]} 100%)`,
  ultraDark: `linear-gradient(135deg, ${denimColors[900]} 0%, ${denimColors[950]} 100%)`,
  
  // Special gradients
  hero: `linear-gradient(135deg, ${denimColors[600]} 0%, ${denimColors[700]} 50%, ${denimColors[800]} 100%)`,
  card: `linear-gradient(145deg, ${alpha(denimColors[500], 0.05)} 0%, ${alpha(denimColors[600], 0.02)} 100%)`,
  sidebar: `linear-gradient(180deg, ${denimColors[600]} 0%, ${denimColors[700]} 50%, ${denimColors[800]} 100%)`,
  button: `linear-gradient(45deg, ${denimColors[500]} 30%, ${denimColors[600]} 90%)`,
  
  // Role-specific gradients
  employee: `linear-gradient(135deg, ${denimColors[400]} 0%, ${denimColors[500]} 100%)`,
  teamLead: `linear-gradient(135deg, ${denimColors[500]} 0%, ${denimColors[600]} 100%)`,
  manager: `linear-gradient(135deg, ${denimColors[600]} 0%, ${denimColors[700]} 100%)`,
  hr: `linear-gradient(135deg, ${denimColors[700]} 0%, ${denimColors[800]} 100%)`,
  admin: `linear-gradient(135deg, ${denimColors[800]} 0%, ${denimColors[900]} 100%)`,
  superAdmin: `linear-gradient(135deg, ${denimColors[900]} 0%, ${denimColors[950]} 100%)`,
} as const;

// Box shadows with denim colors
export const denimShadows = {
  small: `0 2px 8px ${alpha(denimColors[500], 0.15)}`,
  medium: `0 4px 16px ${alpha(denimColors[500], 0.2)}`,
  large: `0 8px 32px ${alpha(denimColors[500], 0.25)}`,
  xlarge: `0 12px 48px ${alpha(denimColors[500], 0.3)}`,
  
  // Interactive shadows
  hover: `0 6px 20px ${alpha(denimColors[500], 0.25)}`,
  active: `0 2px 8px ${alpha(denimColors[500], 0.3)}`,
  
  // Role-specific shadows
  employee: `0 4px 16px ${alpha(denimColors[400], 0.2)}`,
  manager: `0 4px 16px ${alpha(denimColors[600], 0.2)}`,
  admin: `0 4px 16px ${alpha(denimColors[800], 0.2)}`,
} as const;

// Status color mapping with denim integration
export const statusColors = {
  success: {
    main: '#10b981',
    light: '#6ee7b7',
    dark: '#047857',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  info: {
    main: denimColors[400],
    light: denimColors[300],
    dark: denimColors[500],
    contrastText: '#ffffff',
  },
} as const;

// Create MUI theme options with denim colors
export const createDenimThemeOptions = (isDark: boolean): ThemeOptions => ({
  palette: {
    mode: isDark ? 'dark' : 'light',
    primary: {
      50: denimColors[50],
      100: denimColors[100],
      200: denimColors[200],
      300: denimColors[300],
      400: denimColors[400],
      500: denimColors[500],
      600: denimColors[600],
      700: denimColors[700],
      800: denimColors[800],
      900: denimColors[900],
      main: denimColors[500],
      light: denimColors[300],
      dark: denimColors[700],
      contrastText: '#ffffff',
    },
    secondary: {
      50: denimColors[100],
      100: denimColors[200],
      200: denimColors[300],
      300: denimColors[400],
      400: denimColors[500],
      500: denimColors[400],
      600: denimColors[500],
      700: denimColors[600],
      800: denimColors[700],
      900: denimColors[800],
      main: denimColors[400],
      light: denimColors[200],
      dark: denimColors[600],
      contrastText: '#ffffff',
    },
    success: statusColors.success,
    warning: statusColors.warning,
    error: statusColors.error,
    info: statusColors.info,
    background: {
      default: isDark ? denimColors[950] : denimColors[50],
      paper: isDark ? denimColors[900] : '#ffffff',
    },
    text: {
      primary: isDark ? denimColors[100] : denimColors[900],
      secondary: isDark ? denimColors[300] : denimColors[700],
      disabled: isDark ? denimColors[500] : denimColors[400],
    },
    divider: isDark ? denimColors[800] : denimColors[200],
    action: {
      active: isDark ? denimColors[300] : denimColors[700],
      hover: isDark ? alpha(denimColors[300], 0.08) : alpha(denimColors[500], 0.04),
      selected: isDark ? alpha(denimColors[300], 0.16) : alpha(denimColors[500], 0.08),
      disabled: isDark ? alpha(denimColors[500], 0.3) : alpha(denimColors[400], 0.3),
      disabledBackground: isDark ? alpha(denimColors[500], 0.12) : alpha(denimColors[400], 0.12),
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    denimShadows.small,
    denimShadows.small,
    denimShadows.medium,
    denimShadows.medium,
    denimShadows.large,
    denimShadows.large,
    denimShadows.xlarge,
    denimShadows.xlarge,
    `0 16px 64px ${alpha(denimColors[500], 0.35)}`,
    `0 20px 80px ${alpha(denimColors[500], 0.4)}`,
    `0 24px 96px ${alpha(denimColors[500], 0.45)}`,
    `0 28px 112px ${alpha(denimColors[500], 0.5)}`,
    `0 32px 128px ${alpha(denimColors[500], 0.55)}`,
    `0 36px 144px ${alpha(denimColors[500], 0.6)}`,
    `0 40px 160px ${alpha(denimColors[500], 0.65)}`,
    `0 44px 176px ${alpha(denimColors[500], 0.7)}`,
    `0 48px 192px ${alpha(denimColors[500], 0.75)}`,
    `0 52px 208px ${alpha(denimColors[500], 0.8)}`,
    `0 56px 224px ${alpha(denimColors[500], 0.85)}`,
    `0 60px 240px ${alpha(denimColors[500], 0.9)}`,
    `0 64px 256px ${alpha(denimColors[500], 0.95)}`,
    `0 68px 272px ${alpha(denimColors[500], 1)}`,
    `0 72px 288px ${alpha(denimColors[500], 1)}`,
    `0 76px 304px ${alpha(denimColors[500], 1)}`,
  ],
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      color: isDark ? denimColors[100] : denimColors[900],
    },
    h2: {
      fontWeight: 700,
      color: isDark ? denimColors[100] : denimColors[900],
    },
    h3: {
      fontWeight: 600,
      color: isDark ? denimColors[200] : denimColors[800],
    },
    h4: {
      fontWeight: 600,
      color: isDark ? denimColors[200] : denimColors[800],
    },
    h5: {
      fontWeight: 600,
      color: isDark ? denimColors[300] : denimColors[700],
    },
    h6: {
      fontWeight: 600,
      color: isDark ? denimColors[300] : denimColors[700],
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${isDark ? denimColors[800] : denimColors[200]}`,
          backgroundColor: isDark ? denimColors[900] : '#ffffff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: isDark ? denimColors[700] : denimColors[300],
            boxShadow: denimShadows.hover,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          background: denimGradients.button,
          color: '#ffffff',
          '&:hover': {
            background: `linear-gradient(45deg, ${denimColors[600]} 30%, ${denimColors[700]} 90%)`,
          },
          '&:active': {
            background: `linear-gradient(45deg, ${denimColors[700]} 30%, ${denimColors[800]} 90%)`,
          },
        },
        outlined: {
          borderColor: denimColors[300],
          color: denimColors[600],
          '&:hover': {
            borderColor: denimColors[500],
            backgroundColor: alpha(denimColors[500], 0.04),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor: isDark ? denimColors[700] : denimColors[300],
            },
            '&:hover fieldset': {
              borderColor: isDark ? denimColors[600] : denimColors[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: denimColors[500],
            },
          },
          '& .MuiInputLabel-root': {
            '&.Mui-focused': {
              color: denimColors[500],
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        colorPrimary: {
          backgroundColor: denimColors[500],
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: denimColors[400],
          color: '#ffffff',
        },
        outlined: {
          borderColor: denimColors[300],
          color: denimColors[600],
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: isDark ? denimColors[800] : denimColors[200],
        },
        bar: {
          borderRadius: 10,
          backgroundColor: denimColors[500],
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: denimColors[500],
          color: '#ffffff',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: denimGradients.button,
          '&:hover': {
            background: `linear-gradient(45deg, ${denimColors[600]} 30%, ${denimColors[700]} 90%)`,
          },
        },
      },
    },
  },
});

// CSS Custom Properties for denim theme
export const denimCSSVariables = `
  /* Denim Color Palette */
  --denim-50: ${denimColors[50]};
  --denim-100: ${denimColors[100]};
  --denim-200: ${denimColors[200]};
  --denim-300: ${denimColors[300]};
  --denim-400: ${denimColors[400]};
  --denim-500: ${denimColors[500]};
  --denim-600: ${denimColors[600]};
  --denim-700: ${denimColors[700]};
  --denim-800: ${denimColors[800]};
  --denim-900: ${denimColors[900]};
  --denim-950: ${denimColors[950]};
  
  /* Semantic Colors */
  --denim-primary: ${semanticColors.primary};
  --denim-primary-light: ${semanticColors.primaryLight};
  --denim-primary-dark: ${semanticColors.primaryDark};
  --denim-secondary: ${semanticColors.secondary};
  --denim-secondary-light: ${semanticColors.secondaryLight};
  --denim-secondary-dark: ${semanticColors.secondaryDark};
  
  /* Background Colors */
  --denim-background: ${semanticColors.background.light};
  --denim-background-dark: ${semanticColors.background.dark};
  --denim-paper: ${semanticColors.background.paper};
  --denim-paper-dark: ${semanticColors.background.paperDark};
  
  /* Text Colors */
  --denim-text-primary: ${semanticColors.text.primary};
  --denim-text-secondary: ${semanticColors.text.secondary};
  --denim-text-disabled: ${semanticColors.text.disabled};
  --denim-text-primary-dark: ${semanticColors.text.primaryDark};
  --denim-text-secondary-dark: ${semanticColors.text.secondaryDark};
  
  /* Gradients */
  --denim-gradient-primary: ${denimGradients.primary};
  --denim-gradient-light: ${denimGradients.light};
  --denim-gradient-dark: ${denimGradients.dark};
  --denim-gradient-hero: ${denimGradients.hero};
  --denim-gradient-sidebar: ${denimGradients.sidebar};
  --denim-gradient-button: ${denimGradients.button};
  
  /* Shadows */
  --denim-shadow-small: ${denimShadows.small};
  --denim-shadow-medium: ${denimShadows.medium};
  --denim-shadow-large: ${denimShadows.large};
  --denim-shadow-hover: ${denimShadows.hover};
  
  /* Role Colors */
  --denim-role-employee: ${denimColors[400]};
  --denim-role-team-lead: ${denimColors[500]};
  --denim-role-manager: ${denimColors[600]};
  --denim-role-hr: ${denimColors[700]};
  --denim-role-admin: ${denimColors[800]};
  --denim-role-super-admin: ${denimColors[900]};
`;

// Utility functions
export const getDenimColor = (shade: keyof typeof denimColors) => denimColors[shade];
export const getDenimGradient = (type: keyof typeof denimGradients) => denimGradients[type];
export const getDenimShadow = (type: keyof typeof denimShadows) => denimShadows[type];

// Role-based color helper
export const getRoleColor = (role: string | null | undefined) => {
  if (!role || typeof role !== 'string') {
    return denimColors[500]; // Default color
  }
  
  switch (role.toLowerCase()) {
    case 'employee': return denimColors[400];
    case 'senior_employee': return denimColors[500];
    case 'team_lead': 
    case 'team_leader': return denimColors[600];
    case 'department_manager': 
    case 'manager': return denimColors[700];
    case 'hr_manager': 
    case 'hr': return denimColors[800];
    case 'admin': 
    case 'administrator': return denimColors[900];
    case 'super_admin': 
    case 'super_administrator': return denimColors[950];
    default: return denimColors[500];
  }
};

// Status color helper with denim integration
export const getStatusColor = (status: string, variant: 'main' | 'light' | 'dark' = 'main') => {
  const statusKey = status.toLowerCase();
  
  // For denim-specific statuses
  if (statusKey.includes('active') || statusKey.includes('present')) {
    return statusColors.success[variant];
  }
  if (statusKey.includes('pending') || statusKey.includes('review')) {
    return statusColors.warning[variant];
  }
  if (statusKey.includes('rejected') || statusKey.includes('error')) {
    return statusColors.error[variant];
  }
  
  // Default to denim info color
  return statusColors.info[variant];
};

export default denimColors;
