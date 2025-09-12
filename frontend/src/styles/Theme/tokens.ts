// Advanced Design Tokens for Arise HRM
// Enterprise-grade design system tokens

export const designTokens = {
  // ========================================
  // SPACING SYSTEM
  // ========================================
  spacing: {
    xxs: '2px',    // 0.125rem
    xs: '4px',     // 0.25rem
    sm: '8px',     // 0.5rem
    md: '12px',    // 0.75rem
    lg: '16px',    // 1rem
    xl: '20px',    // 1.25rem
    xxl: '24px',   // 1.5rem
    '3xl': '32px', // 2rem
    '4xl': '40px', // 2.5rem
    '5xl': '48px', // 3rem
    '6xl': '64px', // 4rem
    '7xl': '80px', // 5rem
    '8xl': '96px', // 6rem
  },

  // ========================================
  // BORDER RADIUS SYSTEM
  // ========================================
  borderRadius: {
    none: '0px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    full: '9999px',
    // Semantic radius
    button: '12px',
    card: '16px',
    modal: '20px',
    input: '10px',
    chip: '20px',
  },

  // ========================================
  // TYPOGRAPHY SCALE
  // ========================================
  fontSize: {
    'xs': '0.75rem',     // 12px
    'sm': '0.875rem',    // 14px
    'base': '1rem',      // 16px
    'lg': '1.125rem',    // 18px
    'xl': '1.25rem',     // 20px
    '2xl': '1.5rem',     // 24px
    '3xl': '1.875rem',   // 30px
    '4xl': '2.25rem',    // 36px
    '5xl': '3rem',       // 48px
    '6xl': '3.75rem',    // 60px
    '7xl': '4.5rem',     // 72px
    '8xl': '6rem',       // 96px
    '9xl': '8rem',       // 128px
  },

  // ========================================
  // LINE HEIGHT SYSTEM
  // ========================================
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // ========================================
  // FONT WEIGHT SYSTEM
  // ========================================
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // ========================================
  // Z-INDEX SYSTEM
  // ========================================
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // ========================================
  // SHADOW SYSTEM
  // ========================================
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
    // Semantic shadows
    card: '0 4px 16px rgba(0, 0, 0, 0.08)',
    cardHover: '0 8px 24px rgba(0, 0, 0, 0.12)',
    modal: '0 20px 60px rgba(0, 0, 0, 0.15)',
    dropdown: '0 10px 25px rgba(0, 0, 0, 0.1)',
  },

  // ========================================
  // ANIMATION SYSTEM
  // ========================================
  animation: {
    duration: {
      fastest: '100ms',
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
      slowest: '1000ms',
    },
    ease: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },

  // ========================================
  // BREAKPOINTS SYSTEM
  // ========================================
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '900px',
    lg: '1200px',
    xl: '1536px',
    // Custom breakpoints for HRM
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    widescreen: '1440px',
    ultrawide: '1920px',
  },

  // ========================================
  // COMPONENT SIZES
  // ========================================
  componentSizes: {
    button: {
      xs: { height: '28px', padding: '6px 12px', fontSize: '0.75rem' },
      sm: { height: '32px', padding: '8px 16px', fontSize: '0.875rem' },
      md: { height: '40px', padding: '10px 20px', fontSize: '1rem' },
      lg: { height: '48px', padding: '12px 24px', fontSize: '1.125rem' },
      xl: { height: '56px', padding: '16px 32px', fontSize: '1.25rem' },
    },
    input: {
      xs: { height: '28px', padding: '6px 12px', fontSize: '0.75rem' },
      sm: { height: '32px', padding: '8px 12px', fontSize: '0.875rem' },
      md: { height: '40px', padding: '10px 16px', fontSize: '1rem' },
      lg: { height: '48px', padding: '12px 20px', fontSize: '1.125rem' },
      xl: { height: '56px', padding: '16px 24px', fontSize: '1.25rem' },
    },
    avatar: {
      xs: '24px',
      sm: '32px',
      md: '40px',
      lg: '56px',
      xl: '80px',
      xxl: '120px',
    },
    iconButton: {
      xs: '24px',
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '56px',
    },
  },

  // ========================================
  // SEMANTIC TOKENS
  // ========================================
  semantic: {
    // Status colors
    status: {
      positive: '#10b981',
      negative: '#ef4444',
      warning: '#f59e0b',
      neutral: '#6b7280',
      info: '#3b82f6',
    },
    
    // Priority levels
    priority: {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626',
    },
    
    // Department colors
    departments: {
      engineering: '#3b82f6',
      design: '#8b5cf6',
      marketing: '#f59e0b',
      sales: '#10b981',
      hr: '#ec4899',
      finance: '#06b6d4',
      operations: '#6b7280',
      support: '#84cc16',
    },
    
    // Employee status
    employeeStatus: {
      active: '#10b981',
      inactive: '#6b7280',
      onLeave: '#f59e0b',
      terminated: '#ef4444',
      probation: '#8b5cf6',
    },
    
    // Attendance status
    attendance: {
      present: '#10b981',
      absent: '#ef4444',
      late: '#f59e0b',
      halfDay: '#3b82f6',
      holiday: '#8b5cf6',
      weekend: '#6b7280',
    },
  },

  // ========================================
  // LAYOUT TOKENS
  // ========================================
  layout: {
    sidebar: {
      width: '280px',
      miniWidth: '72px',
      mobileWidth: '320px',
    },
    header: {
      height: '64px',
      mobileHeight: '56px',
    },
    footer: {
      height: '48px',
    },
    container: {
      xs: '100%',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xxl: '1536px',
    },
    grid: {
      gutter: '24px',
      mobileGutter: '16px',
    },
  },

  // ========================================
  // GLASS MORPHISM EFFECTS
  // ========================================
  glassMorphism: {
    light: {
      background: 'rgba(255, 255, 255, 0.25)',
      backdrop: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },
    dark: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdrop: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    },
  },

  // ========================================
  // GRADIENT SYSTEM
  // ========================================
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    error: 'linear-gradient(135deg, #ff8a80 0%, #ff5722 100%)',
    info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    // Brand gradients
    brandPrimary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    brandSecondary: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
    // Special effects
    aurora: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ocean: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)',
  },
}

// Export individual token categories for easier imports
export const {
  spacing,
  borderRadius,
  fontSize,
  lineHeight,
  fontWeight,
  zIndex,
  shadows,
  animation,
  breakpoints,
  componentSizes,
  semantic,
  layout,
  glassMorphism,
  gradients,
} = designTokens

export default designTokens
