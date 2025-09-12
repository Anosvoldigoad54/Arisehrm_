# 🏢 Arise HRM - Advanced Human Resource Management System

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.2.0-blue.svg)](https://mui.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.43.4-green.svg)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-7.0.6-purple.svg)](https://vitejs.dev/)

> **🚨 IMPORTANT: RLS Issues Resolved!** 
> If you were experiencing "Row Level Security is blocking database access" errors, please see [README-FINAL.md](README-FINAL.md) for complete setup instructions.

A comprehensive, mobile-first Human Resource Management System built with React, TypeScript, and Supabase. Features advanced authentication, responsive design, real-time data, and complete HR workflow management.

## 🚀 Quick Start

For the most up-to-date setup instructions, please refer to [README-FINAL.md](README-FINAL.md).

## 📋 Complete Documentation

All documentation has been updated to reflect the RLS fixes:

1. **[README-FINAL.md](README-FINAL.md)** - Quick start with all fixes applied
2. **[RLS_FIXES_COMPLETE.md](RLS_FIXES_COMPLETE.md)** - Final summary of all fixes
3. **[FINAL_RLS_FIX_INSTRUCTIONS.md](FINAL_RLS_FIX_INSTRUCTIONS.md)** - Complete step-by-step instructions
4. **[APPLY_RLS_FIXES.md](APPLY_RLS_FIXES.md)** - Detailed RLS fix application guide
5. **[RLS_ERROR_RESOLUTION.md](RLS_ERROR_RESOLUTION.md)** - Comprehensive troubleshooting
6. **[RUN_DATABASE_SETUP.md](RUN_DATABASE_SETUP.md)** - Database setup instructions
7. **[COMPLETE_FILE_SUMMARY.md](COMPLETE_FILE_SUMMARY.md)** - Summary of all files created/modified

## 🔧 TypeScript Path Resolution

This project uses TypeScript path aliases for cleaner imports. To ensure proper resolution in different environments:

### For Development (Vite)
Path aliases work out of the box with Vite's built-in support.

### For Scripts and Tests
When running TypeScript scripts or tests directly with Node.js/tsx, use the included script runner:

```bash
# Run a TypeScript script
npm run script:ts path/to/script.ts

# Example: Initialize test users
npm run init-test-users
```

### For Custom Scripts
If you need to create new scripts:
1. Place them in the `scripts/` directory
2. Use the `@/` alias for imports from `src/`
3. Run them using the script runner

### Troubleshooting
If you encounter module resolution errors:
1. Ensure all imports use the `.js` extension for ES modules
2. Verify `tsconfig.json` has the correct `baseUrl` and `paths`
3. Make sure to run scripts through the script runner or with the proper `-r tsconfig-paths/register` flag

## ✨ Features

### 🔐 **Advanced Authentication & Security**
- Multi-factor authentication with biometric support
- Device fingerprinting and trust management
- Session monitoring and security risk assessment
- Role-based access control (RBAC) with granular permissions
- RLS (Row Level Security) bypass with fallback mechanisms

### 📱 **Mobile-First Responsive Design**
- Optimized for all device sizes (mobile, tablet, desktop)
- Progressive Web App (PWA) capabilities
- Touch-friendly interfaces and gestures
- Adaptive navigation (drawer, sidebar, bottom tabs)
- React Native compatibility preparation

### 👥 **Employee Management**
- Advanced employee directory with smart search
- Complete employee lifecycle management
- Interactive organization chart
- Employee onboarding and offboarding workflows
- Skill tracking and competency mapping

### ⏰ **Smart Attendance System**
- GPS-based location verification
- Photo verification for clock-in/out
- Biometric integration support
- Offline attendance capability
- Automated attendance pattern analysis

### 🗓️ **Leave Management**
- Intelligent leave request system with conflict detection
- Multi-level approval workflows
- Team leave calendar with conflict resolution
- Automated leave balance calculations
- Predictive leave planning

### 💰 **Payroll & Benefits**
- Automated payroll processing
- Tax calculations and compliance
- Benefits enrollment and management
- Expense management system
- Compensation benchmarking tools

### 📊 **Analytics & Reporting**
- Real-time dashboard with customizable widgets
- Advanced HR analytics and insights
- Predictive analytics with ML integration
- Custom report builder
- Data visualization with interactive charts

### ⚙️ **System Administration**
- Comprehensive settings management
- User account creation and management
- Database administration panel
- Backup and recovery systems
- Audit logging and compliance

## 📁 Project Structure

```
arise-hrm/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── admin/         # Admin panel components
│   │   ├── analytics/     # Analytics & reporting
│   │   ├── attendance/    # Attendance management
│   │   ├── auth/          # Authentication components
│   │   ├── benefits/      # Benefits management
│   │   ├── common/        # Shared/reusable components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── documents/     # Document management
│   │   ├── employees/     # Employee management
│   │   ├── layout/        # Layout components
│   │   ├── leave/         # Leave management
│   │   ├── onboarding/    # Employee onboarding
│   │   ├── organization/  # Org chart & structure
│   │   ├── payroll/       # Payroll management
│   │   ├── performance/   # Performance reviews
│   │   ├── recruitment/   # Recruitment & hiring
│   │   ├── selfservice/   # Employee self-service
│   │   ├── settings/      # System settings
│   │   └── training/      # Training & development
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Third-party library configs
│   ├── services/          # API services & data layer
│   ├── styles/            # Global styles & themes
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx            # Main application component
├── .env.example           # Environment variables template
├── package.json           # Dependencies & scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration
```

## 🗄️ Database Setup

### Supabase Configuration

1. **Create Supabase Project**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Create a new project
   - Copy your project URL and anon key

2. **Database Schema**
   The system includes comprehensive database schemas for:
   - User profiles and authentication
   - Employee management
   - Attendance tracking
   - Leave management
   - Payroll and benefits
   - Performance reviews
   - Audit logs and security

3. **RLS Policies**
   Row Level Security policies are implemented for:
   - Data isolation by organization
   - Role-based data access
   - Security audit trails

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Additional Configuration
VITE_APP_NAME=Arise HRM
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
```

## 🎨 Theming & Customization

### Theme Configuration

The system supports extensive theming:

```typescript
// src/styles/Theme/tokens.ts
export const designTokens = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    // ... more colors
  },
  fontFamily: {
    primary: 'Inter, sans-serif',
    // ... more fonts
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    // ... more sizes
  }
}
```

### Responsive Breakpoints

```typescript
// Customizable breakpoints in useResponsive hook
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests

# Utilities
npm run clean        # Clean build artifacts
npm run analyze      # Analyze bundle size
```

### Code Quality

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks
- **Conventional Commits** for commit standards

### Testing Strategy

```bash
# Unit Tests (Jest + React Testing Library)
npm run test

# E2E Tests (Playwright)
npm run test:e2e

# Visual Regression Tests
npm run test:visual
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Serve the built application
npm run preview
```

### Deployment Options

#### 1. **Vercel** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 2. **Netlify**
```bash
# Build command: npm run build
# Publish directory: dist
```

#### 3. **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment Configuration

Production environment variables:

```env
# Production Supabase
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key

# Analytics & Monitoring
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn

# Feature Flags
VITE_ENABLE_BETA_FEATURES=false
VITE_MAINTENANCE_MODE=false
```

## 🔒 Security

### Security Features

- **Authentication**: Multi-factor with biometric support
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row-level security (RLS)
- **Audit Trails**: Comprehensive logging
- **Device Security**: Fingerprinting and trust management
- **Session Management**: Advanced session monitoring

### Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for configuration
3. **Implement proper RLS policies** in Supabase
4. **Regular security audits** and updates
5. **Monitor failed login attempts** and suspicious activity

### Troubleshooting RLS Issues

If you encounter "infinite recursion detected in policy" errors:

1. **Apply Updated RLS Policies**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `database/complete-rls-policies.sql`
   - Run the script

2. **Verify the Fix**
   - Run the verification script:
     ```bash
     cd scripts
     npx tsx verify-setup.ts
     ```

3. **Check Documentation**
   - Refer to [RLS_ERROR_RESOLUTION.md](RLS_ERROR_RESOLUTION.md) for detailed troubleshooting
   - Refer to [APPLY_RLS_FIXES.md](APPLY_RLS_FIXES.md) for step-by-step fix application

## 📱 Mobile Development

### Progressive Web App (PWA)

The application is PWA-ready with:
- Service worker for offline functionality
- App manifest for installation
- Push notifications support
- Background sync capabilities

### React Native Preparation

Components are designed for React Native compatibility:
- Shared component library structure
- Platform-agnostic styling approach
- Responsive design patterns
- Cross-platform state management

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add employee bulk import functionality
fix: resolve attendance calculation bug
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add unit tests for payroll module
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automatic formatting
- **Component Structure**: Functional components with hooks
- **File Naming**: PascalCase for components, camelCase for utilities

## 📊 Performance

### Optimization Features

- **Code Splitting**: Lazy loading of route components
- **Tree Shaking**: Automatic dead code elimination
- **Bundle Analysis**: Webpack bundle analyzer
- **Image Optimization**: Automatic image compression
- **Caching**: Service worker with caching strategies

### Performance Metrics

Target performance benchmarks:
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.0s
- **Bundle Size**: < 500KB gzipped

## 🐛 Troubleshooting

### Common Issues

#### 1. **Database Connection Issues**
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test database connection
npm run test:db
```

#### 2. **PowerShell '&&' Operator Issue**
If you encounter the error "The token '&&' is not a valid statement separator", use one of these alternatives:
```powershell
# Option 1: Use semicolon instead
cd frontend; npm run dev

# Option 2: Use the provided PowerShell script
.\start-dev.ps1

# Option 3: Run commands separately
cd frontend
npm run dev
```

#### 3. **Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
```

#### 4. **TypeScript Errors**
```bash
# Run type checking
npm run type-check

# Update TypeScript
npm update typescript
```

### Debug Mode

Enable debug mode for detailed logging:

```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 📞 Support

### Getting Help

- **Documentation**: [Full Documentation](https://docs.arisehrm.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/arise-hrm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/arise-hrm/discussions)
- **Email**: support@arisehrm.com

### Community

- **Discord**: [Join our Discord](https://discord.gg/arisehrm)
- **Twitter**: [@AriseHRM](https://twitter.com/arisehrm)
- **LinkedIn**: [Arise HRM](https://linkedin.com/company/arisehrm)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Material-UI Team** for the beautiful component library
- **Supabase Team** for the excellent backend-as-a-service
- **Open Source Community** for inspiration and contributions

---

<div align="center">
  <strong>Built with ❤️ by the Arise HRM Team</strong>
  <br>
  <br>
  <a href="https://arisehrm.com">Website</a> •
  <a href="https://docs.arisehrm.com">Documentation</a> •
  <a href="https://demo.arisehrm.com">Live Demo</a>
</div>