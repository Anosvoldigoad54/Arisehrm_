# 🏢 Arise HRM - Advanced Human Resource Management System

> A comprehensive, modern HR management platform built with React, TypeScript, Express, and Supabase

[![Status](https://img.shields.io/badge/Status-Operational-success)](/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue)](/)
[![Backend](https://img.shields.io/badge/Backend-Express%20%2B%20TypeScript-green)](/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-orange)](/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Database Setup](#-database-setup)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Support](#-support)

---

## ✨ Features

### Core HR Modules

#### 👥 Employee Management
- Complete employee profiles with photos
- Organizational hierarchy
- Department and team management
- Position and role assignments
- Employee lifecycle tracking

#### ⏰ Attendance & Time Tracking
- GPS-based clock in/out
- Multiple shift support
- Flexible work schedules
- Overtime tracking
- Attendance corrections

#### 🏖️ Leave Management
- Multiple leave types (Annual, Sick, Casual, etc.)
- Leave balance tracking
- Multi-level approvals
- Holiday calendar
- Team leave calendar view

#### 💰 Payroll & Compensation
- Automated payroll processing
- Salary components (earnings/deductions)
- Payslip generation
- Bonus management
- Tax calculations

#### 📊 Performance Management
- Performance reviews
- Goal setting and tracking
- 360-degree feedback
- Rating systems
- Performance analytics

#### 🎯 Recruitment & Hiring
- Job posting management
- Applicant tracking system (ATS)
- Interview scheduling
- Candidate evaluation
- Offer letter generation

#### 🎓 Training & Development
- Training program management
- Session scheduling
- Enrollment tracking
- Certification management
- Learning paths

#### 📁 Document Management
- Secure document storage
- Document categorization
- Version control
- Access control
- Audit trail

#### 💼 Benefits Administration
- Benefits enrollment
- Plan management
- Coverage tracking
- Dependent management

#### 💳 Expense Management
- Expense report submission
- Multi-level approvals
- Receipt management
- Reimbursement tracking
- Budget monitoring

#### 📈 Analytics & Reports
- Custom report builder
- Real-time dashboards
- Export capabilities (PDF, Excel, CSV)
- Scheduled reports
- Visual analytics

#### 🔔 Communication
- Company announcements
- Internal messaging
- Notifications system
- Email integration

#### ✅ Compliance & Audit
- Policy management
- Compliance tracking
- Audit logs
- Access control
- Data retention

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript 5.3.3
- **Build Tool**: Vite 7.0.6
- **UI Library**: Material-UI 7.2.0
- **Styling**: Tailwind CSS 4.1.12
- **State Management**: React Query 5.45.1
- **Routing**: React Router 6.23.1
- **Forms**: React Hook Form + Yup
- **Charts**: Recharts, Chart.js
- **Date Handling**: Day.js, date-fns

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.19.2
- **Language**: TypeScript 5.3.3
- **Database Client**: Supabase JS 2.78.0
- **Authentication**: JWT + bcryptjs
- **API**: RESTful

### Database
- **RDBMS**: PostgreSQL
- **Platform**: Supabase
- **ORM**: Supabase Client (native)

### Infrastructure
- **Process Manager**: Supervisor
- **Reverse Proxy**: Nginx
- **Deployment**: Kubernetes
- **Version Control**: Git

### Development Tools
- **Testing**: Vitest, Cypress
- **Linting**: ESLint
- **Code Quality**: TypeScript strict mode

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and yarn
- PostgreSQL 12+ (or Supabase account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd arise-hrm
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   yarn install
   
   # Frontend
   cd ../frontend
   yarn install
   ```

3. **Configure environment variables**
   
   Backend (`.env`):
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://...
   PORT=4000
   JWT_SECRET=your-super-secret-jwt-key
   ```
   
   Frontend (`.env`):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=http://localhost:4000
   VITE_APP_NAME=Arise HRM
   VITE_ENVIRONMENT=development
   ```

4. **Set up database**
   ```bash
   # Run the complete schema in Supabase SQL Editor
   # See /database/SETUP_GUIDE.md for detailed instructions
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   yarn dev
   
   # Terminal 2 - Frontend
   cd frontend
   yarn dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Health Check: http://localhost:4000/health

---

## 🗄️ Database Setup

### Using Supabase (Recommended)

1. Create a Supabase project at https://supabase.com

2. Go to SQL Editor in your Supabase dashboard

3. Copy and run `/database/COMPLETE_SCHEMA.sql`

4. Verify installation:
   ```sql
   SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public';
   -- Should return 70+
   ```

5. Create your first admin user (see `/database/SETUP_GUIDE.md`)

### Database Features
- ✅ 70+ tables covering all HR operations
- ✅ 15 custom ENUM types
- ✅ 30+ performance indexes
- ✅ Automatic timestamp triggers
- ✅ Row Level Security (RLS) ready
- ✅ Default data pre-populated

For detailed setup instructions, see `/database/SETUP_GUIDE.md`

---

## 📂 Project Structure

```
arise-hrm/
├── backend/                    # Express.js backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── routes/            # API routes
│   │   └── server.ts          # Entry point
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── admin/         # Admin features
│   │   │   ├── attendance/    # Attendance module
│   │   │   ├── leave/         # Leave management
│   │   │   ├── payroll/       # Payroll module
│   │   │   ├── performance/   # Performance reviews
│   │   │   ├── recruitment/   # Recruitment & hiring
│   │   │   └── ...            # 20+ more modules
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   ├── App.tsx            # Main component
│   │   └── main.tsx           # Entry point
│   ├── public/                # Static assets
│   ├── .env                   # Environment variables
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── database/                   # Database files
│   ├── COMPLETE_SCHEMA.sql    # Full database schema (2000+ lines)
│   └── SETUP_GUIDE.md         # Setup instructions
│
├── docs/                       # Documentation
│   ├── AUDIT_REPORT.md        # Comprehensive audit
│   ├── COMPLETE_FIX_SUMMARY.md # All fixes applied
│   └── VITE_HOST_FIX.md       # Configuration fixes
│
└── README.md                   # This file
```

---

## 📚 Documentation

### Available Guides

1. **[SETUP_GUIDE.md](/database/SETUP_GUIDE.md)**
   - Database setup instructions
   - Configuration examples
   - Troubleshooting tips

2. **[AUDIT_REPORT.md](/AUDIT_REPORT.md)**
   - Complete code audit
   - Architecture analysis
   - Security review
   - Performance metrics

3. **[COMPLETE_FIX_SUMMARY.md](/COMPLETE_FIX_SUMMARY.md)**
   - All fixes applied
   - Before/after comparison
   - Configuration changes

4. **[VITE_HOST_FIX.md](/VITE_HOST_FIX.md)**
   - Vite configuration details
   - Host access setup

---

## 💻 Development

### Available Scripts

#### Backend
```bash
yarn dev          # Start development server with hot reload
yarn build        # Compile TypeScript to JavaScript
yarn start        # Start production server
```

#### Frontend
```bash
yarn dev          # Start Vite dev server
yarn build        # Build for production
yarn preview      # Preview production build
yarn lint         # Run ESLint
yarn test         # Run unit tests
yarn test:e2e     # Run E2E tests
```

### Code Style

- **TypeScript Strict Mode**: Enabled
- **ESLint**: Configured for React/TypeScript
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit linting

### API Development

Backend API follows RESTful conventions:

```typescript
// Example: Leave requests endpoint
GET    /api/leave-requests           # List all
GET    /api/leave-requests/:id       # Get one
POST   /api/leave-requests           # Create
PATCH  /api/leave-requests/:id       # Update
DELETE /api/leave-requests/:id       # Delete
```

All endpoints return JSON:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

---

## 🧪 Testing

### Unit Tests (Vitest)
```bash
cd frontend
yarn test                 # Run tests
yarn test:coverage        # With coverage
yarn test:ui              # Interactive UI
```

### E2E Tests (Cypress)
```bash
cd frontend
yarn test:e2e            # Open Cypress
yarn test:e2e:ci         # Run headless
```

### Manual Testing
1. Use demo credentials on login page
2. Test each module thoroughly
3. Check browser console for errors
4. Verify mobile responsiveness

---

## 🚢 Deployment

### Production Build

1. **Build Backend**
   ```bash
   cd backend
   yarn build
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   yarn build
   # Output in: /frontend/dist
   ```

3. **Environment Variables**
   - Set production URLs
   - Use secure JWT secrets
   - Enable HTTPS
   - Configure CORS properly

### Using Supervisor (Current Setup)

Services are managed by Supervisor:

```bash
# Check status
sudo supervisorctl status

# Restart services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart all

# View logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/frontend.out.log
```

### Docker (Future)

Docker configuration coming soon for easier deployment.

---

## 🔒 Security

### Implemented
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS configuration
- ✅ Environment variables
- ✅ Input validation
- ✅ SQL injection protection (parameterized queries)

### Recommended
- [ ] Rate limiting
- [ ] HTTPS enforcement
- [ ] Security headers
- [ ] Audit logging
- [ ] Regular security audits
- [ ] Dependency updates

---

## 📊 Performance

### Current Metrics
- **Frontend Load Time**: ~2-3 seconds
- **API Response Time**: <100ms average
- **Database Queries**: Optimized with 30+ indexes
- **Bundle Size**: Optimized with code splitting

### Optimization Features
- ✅ Code splitting (lazy loading)
- ✅ Tree shaking
- ✅ Image optimization
- ✅ Database indexing
- ✅ Query optimization
- ✅ Caching strategies

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Services not starting
```bash
# Check logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log

# Restart services
sudo supervisorctl restart all
```

**Issue**: Database connection errors
```bash
# Check environment variables
cat backend/.env

# Test connection
curl http://localhost:4000/health
```

**Issue**: Frontend not loading
```bash
# Check if frontend is running
curl -I http://localhost:3000

# Check Vite config
cat frontend/vite.config.ts
```

For more troubleshooting, see `/database/SETUP_GUIDE.md`

---

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

### Commit Convention
```
feat: Add new feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code restructure
test: Tests
chore: Maintenance
```

---

## 📝 License

[Add your license here]

---

## 👥 Team

Developed by [Your Team/Organization]

---

## 📞 Support

### Documentation
- Setup Guide: `/database/SETUP_GUIDE.md`
- Audit Report: `/AUDIT_REPORT.md`
- Fix Summary: `/COMPLETE_FIX_SUMMARY.md`

### Resources
- Supabase Docs: https://supabase.com/docs
- Material-UI: https://mui.com
- React: https://react.dev

### Contact
- Email: support@arisehrm.com
- Website: [Your Website]
- Issues: [GitHub Issues]

---

## 🎉 Acknowledgments

- Built with ❤️ using modern web technologies
- Thanks to all open-source contributors
- Special thanks to Supabase, Material-UI, and React teams

---

## 📈 Roadmap

### Phase 1 (Current) ✅
- [x] Core HR modules
- [x] Database schema
- [x] Authentication system
- [x] Basic UI/UX

### Phase 2 (Q1 2025)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] AI-powered insights
- [ ] Workflow automation

### Phase 3 (Q2 2025)
- [ ] Multi-tenancy
- [ ] Custom integrations
- [ ] API marketplace
- [ ] Advanced reporting

### Phase 4 (Q3 2025)
- [ ] Global expansion features
- [ ] Compliance automation
- [ ] Advanced security
- [ ] Performance optimization

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: Production Ready ✅

---

Made with 💙 by the Arise HRM Team
