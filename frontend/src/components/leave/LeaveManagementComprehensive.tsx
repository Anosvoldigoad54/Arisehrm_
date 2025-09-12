import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Button,
  Stack,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Paper,
  LinearProgress,
  CircularProgress,
  Badge,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Snackbar,
  useMediaQuery,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,

  Autocomplete,

  RadioGroup,
  Radio,
  FormLabel,
  Checkbox,
  FormGroup
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// Mock Timeline components - replace with @mui/lab imports if available
const Timeline = ({ children, ...props }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} {...props}>
    {children}
  </Box>
)

const TimelineItem = ({ children, ...props }: any) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }} {...props}>
    {children}
  </Box>
)

const TimelineSeparator = ({ children, ...props }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }} {...props}>
    {children}
  </Box>
)

const TimelineConnector = ({ ...props }: any) => (
  <Box 
    sx={{ 
      width: 2, 
      height: 40, 
      bgcolor: 'divider',
      borderRadius: 1
    }} 
    {...props} 
  />
)

const TimelineContent = ({ children, ...props }: any) => (
  <Box sx={{ flex: 1, pt: 0.5 }} {...props}>
    {children}
  </Box>
)

const TimelineDot = ({ children, color = 'primary', ...props }: any) => (
  <Avatar 
    sx={{ 
      width: 24, 
      height: 24, 
      bgcolor: `${color}.main`,
      fontSize: '0.75rem'
    }} 
    {...props}
  >
    {children}
  </Avatar>
)

const TimelineOppositeContent = ({ children, ...props }: any) => (
  <Box sx={{ flex: 0.3, pt: 0.5, pr: 2, textAlign: 'right' }} {...props}>
    {children}
  </Box>
)

import {
  EventNote as EventNoteIcon,
  CalendarToday as CalendarTodayIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  GetApp as GetAppIcon,
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  History as HistoryIcon,
  AccountBalance as AccountBalanceIcon,
  Policy as PolicyIcon,
  RequestQuote as RequestQuoteIcon,
  Approval as ApprovalIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  LocalHospital as LocalHospitalIcon,
  School as SchoolIcon,
  Flight as FlightIcon,
  FamilyRestroom as FamilyRestroomIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { format, addDays, differenceInDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { useResponsive } from '../../hooks/useResponsive'

// Mock components - replace with actual implementations
const MetricCard = ({ title, value, change, icon, color, loading }: any) => (
  <Card>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{ color: `${color}.main` }}>{icon}</Box>
        <Box>
          <Typography variant="h6">{value}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          {change && (
            <Typography variant="caption" color={change > 0 ? 'success.main' : 'error.main'}>
              {change > 0 ? '+' : ''}{change}%
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
)

const CountUp = ({ end, decimals = 0, suffix = '' }: { end: number; decimals?: number; suffix?: string }) => (
  <span>{end.toFixed(decimals)}{suffix}</span>
)

const StatusChip = ({ status, size = 'medium' }: { status: string; size?: 'small' | 'medium' }) => {
  const getColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }
  
  return <Chip label={status} size={size} color={getColor(status) as any} />
}

// Types based on schema
interface LeaveType {
  id: string
  name: string
  code: string
  description?: string
  category: string
  max_days_per_year?: number
  max_days_per_period?: number
  accrual_method: string
  accrual_rate?: number
  accrual_frequency: string
  accrual_cap?: number
  proration_method: string
  carry_forward_allowed: boolean
  max_carry_forward_days: number
  carry_forward_expiry_months: number
  use_it_or_lose_it: boolean
  cash_out_allowed: boolean
  cash_out_rate: number
  cash_out_threshold?: number
  min_notice_days: number
  max_notice_days: number
  min_duration_hours: number
  max_duration_days: number
  max_consecutive_days?: number
  min_gap_between_requests: number
  blackout_periods: any[]
  advance_booking_limit_days: number
  requires_medical_certificate: boolean
  medical_cert_threshold_days: number
  requires_manager_approval: boolean
  requires_hr_approval: boolean
  requires_director_approval: boolean
  auto_approve_threshold_days?: number
  delegation_allowed: boolean
  is_paid: boolean
  pay_rate_multiplier: number
  affects_benefits: boolean
  affects_seniority: boolean
  affects_pension: boolean
  affects_bonus_calculation: boolean
  public_holiday_interaction: string
  eligibility_rules: any
  min_service_months: number
  max_service_months?: number
  employment_types: string[]
  applicable_countries?: string[]
  applicable_states?: string[]
  gender_specific: boolean
  age_restrictions: any
  statutory_leave: boolean
  fmla_qualifying: boolean
  workers_comp_related: boolean
  disability_related: boolean
  legal_requirements: any
  reporting_requirements: any
  weekend_counting: string
  public_holiday_counting: string
  half_day_allowed: boolean
  hourly_leave_allowed: boolean
  color_code: string
  icon: string
  display_order: number
  is_active: boolean
  effective_from: string
  effective_to?: string
  created_at: string
  updated_at: string
  metadata: any
}

interface LeaveRequest {
  id: string
  request_number: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  start_period: string
  end_period: string
  start_time?: string
  end_time?: string
  total_days: number
  business_days?: number
  total_hours?: number
  reason?: string
  detailed_reason?: string
  emergency_request: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  urgency_justification?: string
  contact_during_leave: any
  emergency_contact_override: any
  work_handover_completed: boolean
  handover_notes?: string
  handover_checklist: any[]
  coverage_arranged: boolean
  coverage_details: any
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  sub_status?: string
  workflow_step: number
  current_approver_id?: string
  escalation_level: number
  auto_approved: boolean
  requires_coverage: boolean
  approval_chain: any[]
  approvals_received: any[]
  rejections_received: any[]
  delegation_history: any[]
  final_approver_id?: string
  approved_at?: string
  supporting_documents: any[]
  medical_certificate_required: boolean
  medical_certificate_submitted: boolean
  medical_certificate_verified: boolean
  medical_certificate_expiry?: string
  additional_documentation: any[]
  team_impact_score: number
  project_impact: any[]
  client_impact_assessment?: string
  business_justification?: string
  cost_impact_estimate?: number
  revenue_impact_estimate?: number
  expected_return_date: string
  actual_return_date?: string
  return_confirmed: boolean
  return_to_work_interview: boolean
  fitness_for_work_clearance: boolean
  phased_return_plan: any
  pay_impact: any
  benefit_impacts: any[]
  accrual_adjustments: any
  pension_impact: any
  statutory_leave_flag: boolean
  fmla_covered: boolean
  disability_related: boolean
  workers_comp_claim?: string
  legal_requirements_met: boolean
  approval_probability?: number
  similar_requests_analysis: any
  pattern_analysis: any
  risk_assessment: any
  recommendation_engine: any
  notification_preferences: any
  reminder_schedule: any[]
  communication_log: any[]
  created_at: string
  updated_at: string
  submitted_at: string
  metadata: any
  employee?: {
    id: string
    employee_id: string
    first_name: string
    last_name: string
    profile_photo_url?: string
    department?: string
    position?: string
  }
  leave_type?: LeaveType
}

interface EmployeeLeaveBalance {
  id: string
  employee_id: string
  leave_type_id: string
  current_balance: number
  accrued_balance: number
  used_balance: number
  pending_balance: number
  reserved_balance: number
  available_balance: number
  last_accrual_date?: string
  next_accrual_date?: string
  accrual_rate_override?: number
  accrual_suspended: boolean
  accrual_suspension_reason?: string
  carry_forward_balance: number
  carry_forward_expiry_date?: string
  previous_year_balance: number
  ytd_accrued: number
  ytd_used: number
  ytd_forfeited: number
  ytd_cashed_out: number
  policy_year_start?: string
  policy_year_end?: string
  manual_adjustments: number
  adjustment_reason?: string
  adjustment_approved_by?: string
  adjustment_date?: string
  low_balance_threshold: number
  expiry_alert_days: number
  last_alert_sent?: string
  created_at: string
  updated_at: string
  metadata: any
  leave_type?: LeaveType
}

// Mock data
const mockLeaveTypes: LeaveType[] = [
  {
    id: '1',
    name: 'Annual Leave',
    code: 'AL',
    description: 'Annual vacation leave',
    category: 'vacation',
    max_days_per_year: 25,
    accrual_method: 'annual',
    accrual_rate: 2.08,
    accrual_frequency: 'monthly',
    proration_method: 'hire_date',
    carry_forward_allowed: true,
    max_carry_forward_days: 5,
    carry_forward_expiry_months: 12,
    use_it_or_lose_it: false,
    cash_out_allowed: true,
    cash_out_rate: 1.0,
    min_notice_days: 7,
    max_notice_days: 365,
    min_duration_hours: 8.0,
    max_duration_days: 15,
    min_gap_between_requests: 0,
    blackout_periods: [],
    advance_booking_limit_days: 365,
    requires_medical_certificate: false,
    medical_cert_threshold_days: 0,
    requires_manager_approval: true,
    requires_hr_approval: false,
    requires_director_approval: false,
    delegation_allowed: true,
    is_paid: true,
    pay_rate_multiplier: 1.0,
    affects_benefits: false,
    affects_seniority: false,
    affects_pension: false,
    affects_bonus_calculation: false,
    public_holiday_interaction: 'exclude',
    eligibility_rules: {},
    min_service_months: 0,
    employment_types: ['full_time'],
    gender_specific: false,
    age_restrictions: {},
    statutory_leave: false,
    fmla_qualifying: false,
    workers_comp_related: false,
    disability_related: false,
    legal_requirements: {},
    reporting_requirements: {},
    weekend_counting: 'exclude',
    public_holiday_counting: 'exclude',
    half_day_allowed: true,
    hourly_leave_allowed: false,
    color_code: '#4CAF50',
    icon: 'flight',
    display_order: 1,
    is_active: true,
    effective_from: '2024-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    metadata: {}
  },
  {
    id: '2',
    name: 'Sick Leave',
    code: 'SL',
    description: 'Medical leave for illness',
    category: 'medical',
    max_days_per_year: 12,
    accrual_method: 'annual',
    accrual_rate: 1.0,
    accrual_frequency: 'monthly',
    proration_method: 'hire_date',
    carry_forward_allowed: false,
    max_carry_forward_days: 0,
    carry_forward_expiry_months: 0,
    use_it_or_lose_it: true,
    cash_out_allowed: false,
    cash_out_rate: 0,
    min_notice_days: 0,
    max_notice_days: 365,
    min_duration_hours: 4.0,
    max_duration_days: 5,
    min_gap_between_requests: 0,
    blackout_periods: [],
    advance_booking_limit_days: 0,
    requires_medical_certificate: true,
    medical_cert_threshold_days: 3,
    requires_manager_approval: true,
    requires_hr_approval: false,
    requires_director_approval: false,
    delegation_allowed: true,
    is_paid: true,
    pay_rate_multiplier: 1.0,
    affects_benefits: false,
    affects_seniority: false,
    affects_pension: false,
    affects_bonus_calculation: false,
    public_holiday_interaction: 'exclude',
    eligibility_rules: {},
    min_service_months: 0,
    employment_types: ['full_time', 'part_time'],
    gender_specific: false,
    age_restrictions: {},
    statutory_leave: false,
    fmla_qualifying: true,
    workers_comp_related: false,
    disability_related: false,
    legal_requirements: {},
    reporting_requirements: {},
    weekend_counting: 'exclude',
    public_holiday_counting: 'exclude',
    half_day_allowed: true,
    hourly_leave_allowed: true,
    color_code: '#F44336',
    icon: 'local_hospital',
    display_order: 2,
    is_active: true,
    effective_from: '2024-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    metadata: {}
  },
  {
    id: '3',
    name: 'Personal Leave',
    code: 'PL',
    description: 'Personal time off',
    category: 'personal',
    max_days_per_year: 5,
    accrual_method: 'annual',
    accrual_rate: 0.42,
    accrual_frequency: 'monthly',
    proration_method: 'hire_date',
    carry_forward_allowed: false,
    max_carry_forward_days: 0,
    carry_forward_expiry_months: 0,
    use_it_or_lose_it: true,
    cash_out_allowed: false,
    cash_out_rate: 0,
    min_notice_days: 3,
    max_notice_days: 365,
    min_duration_hours: 4.0,
    max_duration_days: 3,
    min_gap_between_requests: 7,
    blackout_periods: [],
    advance_booking_limit_days: 90,
    requires_medical_certificate: false,
    medical_cert_threshold_days: 0,
    requires_manager_approval: true,
    requires_hr_approval: false,
    requires_director_approval: false,
    delegation_allowed: true,
    is_paid: true,
    pay_rate_multiplier: 1.0,
    affects_benefits: false,
    affects_seniority: false,
    affects_pension: false,
    affects_bonus_calculation: false,
    public_holiday_interaction: 'exclude',
    eligibility_rules: {},
    min_service_months: 6,
    employment_types: ['full_time'],
    gender_specific: false,
    age_restrictions: {},
    statutory_leave: false,
    fmla_qualifying: false,
    workers_comp_related: false,
    disability_related: false,
    legal_requirements: {},
    reporting_requirements: {},
    weekend_counting: 'exclude',
    public_holiday_counting: 'exclude',
    half_day_allowed: true,
    hourly_leave_allowed: false,
    color_code: '#FF9800',
    icon: 'home',
    display_order: 3,
    is_active: true,
    effective_from: '2024-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    metadata: {}
  }
]

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    request_number: 'LR-2024-001',
    employee_id: 'EMP001',
    leave_type_id: '1',
    start_date: '2024-02-15',
    end_date: '2024-02-19',
    start_period: 'full_day',
    end_period: 'full_day',
    total_days: 5,
    business_days: 5,
    reason: 'Family vacation',
    detailed_reason: 'Annual family trip to Europe',
    emergency_request: false,
    priority: 'medium',
    work_handover_completed: true,
    handover_notes: 'All tasks delegated to Sarah',
    coverage_arranged: true,
    coverage_details: { covering_employee: 'EMP002' },
    status: 'pending',
    workflow_step: 1,
    escalation_level: 0,
    auto_approved: false,
    requires_coverage: true,
    approval_chain: [],
    approvals_received: [],
    rejections_received: [],
    delegation_history: [],
    supporting_documents: [],
    medical_certificate_required: false,
    medical_certificate_submitted: false,
    medical_certificate_verified: false,
    additional_documentation: [],
    team_impact_score: 3,
    project_impact: [],
    expected_return_date: '2024-02-20',
    return_confirmed: false,
    return_to_work_interview: false,
    fitness_for_work_clearance: false,
    phased_return_plan: {},
    pay_impact: {},
    benefit_impacts: [],
    accrual_adjustments: {},
    pension_impact: {},
    statutory_leave_flag: false,
    fmla_covered: false,
    disability_related: false,
    legal_requirements_met: true,
    similar_requests_analysis: {},
    pattern_analysis: {},
    risk_assessment: {},
    recommendation_engine: {},
    notification_preferences: {},
    reminder_schedule: [],
    communication_log: [],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    submitted_at: '2024-01-15T10:00:00Z',
    metadata: {},
    employee: {
      id: '1',
      employee_id: 'EMP001',
      first_name: 'John',
      last_name: 'Smith',
      profile_photo_url: '/avatars/john.jpg',
      department: 'Engineering',
      position: 'Senior Developer'
    },
    leave_type: mockLeaveTypes[0]
  },
  {
    id: '2',
    request_number: 'LR-2024-002',
    employee_id: 'EMP002',
    leave_type_id: '2',
    start_date: '2024-01-20',
    end_date: '2024-01-22',
    start_period: 'full_day',
    end_period: 'full_day',
    total_days: 3,
    business_days: 3,
    reason: 'Flu symptoms',
    detailed_reason: 'Doctor advised rest due to flu',
    emergency_request: true,
    priority: 'high',
    work_handover_completed: false,
    coverage_arranged: false,
    coverage_details: {},
    status: 'approved',
    workflow_step: 3,
    escalation_level: 0,
    auto_approved: false,
    requires_coverage: false,
    approval_chain: [],
    approvals_received: [],
    rejections_received: [],
    delegation_history: [],
    supporting_documents: [],
    medical_certificate_required: true,
    medical_certificate_submitted: true,
    medical_certificate_verified: true,
    additional_documentation: [],
    team_impact_score: 2,
    project_impact: [],
    expected_return_date: '2024-01-23',
    return_confirmed: true,
    return_to_work_interview: false,
    fitness_for_work_clearance: true,
    phased_return_plan: {},
    pay_impact: {},
    benefit_impacts: [],
    accrual_adjustments: {},
    pension_impact: {},
    statutory_leave_flag: false,
    fmla_covered: false,
    disability_related: false,
    legal_requirements_met: true,
    similar_requests_analysis: {},
    pattern_analysis: {},
    risk_assessment: {},
    recommendation_engine: {},
    notification_preferences: {},
    reminder_schedule: [],
    communication_log: [],
    created_at: '2024-01-18T08:30:00Z',
    updated_at: '2024-01-19T14:20:00Z',
    submitted_at: '2024-01-18T08:30:00Z',
    metadata: {},
    employee: {
      id: '2',
      employee_id: 'EMP002',
      first_name: 'Sarah',
      last_name: 'Connor',
      profile_photo_url: '/avatars/sarah.jpg',
      department: 'Marketing',
      position: 'Marketing Manager'
    },
    leave_type: mockLeaveTypes[1]
  }
]

const mockLeaveBalances: EmployeeLeaveBalance[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    leave_type_id: '1',
    current_balance: 22.5,
    accrued_balance: 25,
    used_balance: 2.5,
    pending_balance: 5,
    reserved_balance: 0,
    available_balance: 17.5,
    accrual_suspended: false,
    carry_forward_balance: 0,
    previous_year_balance: 0,
    ytd_accrued: 25,
    ytd_used: 2.5,
    ytd_forfeited: 0,
    ytd_cashed_out: 0,
    manual_adjustments: 0,
    low_balance_threshold: 5.0,
    expiry_alert_days: 30,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    metadata: {},
    leave_type: mockLeaveTypes[0]
  },
  {
    id: '2',
    employee_id: 'EMP001',
    leave_type_id: '2',
    current_balance: 9,
    accrued_balance: 12,
    used_balance: 3,
    pending_balance: 0,
    reserved_balance: 0,
    available_balance: 9,
    accrual_suspended: false,
    carry_forward_balance: 0,
    previous_year_balance: 0,
    ytd_accrued: 12,
    ytd_used: 3,
    ytd_forfeited: 0,
    ytd_cashed_out: 0,
    manual_adjustments: 0,
    low_balance_threshold: 2.0,
    expiry_alert_days: 30,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    metadata: {},
    leave_type: mockLeaveTypes[1]
  },
  {
    id: '3',
    employee_id: 'EMP001',
    leave_type_id: '3',
    current_balance: 5,
    accrued_balance: 5,
    used_balance: 0,
    pending_balance: 0,
    reserved_balance: 0,
    available_balance: 5,
    accrual_suspended: false,
    carry_forward_balance: 0,
    previous_year_balance: 0,
    ytd_accrued: 5,
    ytd_used: 0,
    ytd_forfeited: 0,
    ytd_cashed_out: 0,
    manual_adjustments: 0,
    low_balance_threshold: 1.0,
    expiry_alert_days: 30,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    metadata: {},
    leave_type: mockLeaveTypes[2]
  }
]

interface ComprehensiveLeaveManagementProps {
  className?: string
}

export const ComprehensiveLeaveManagement: React.FC<ComprehensiveLeaveManagementProps> = ({ className }) => {
  const theme = useTheme()
  const { isMobile, isTablet } = useResponsive()
  
  // State management
  const [selectedTab, setSelectedTab] = useState(0)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests)
  const [leaveBalances, setLeaveBalances] = useState<EmployeeLeaveBalance[]>(mockLeaveBalances)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(mockLeaveTypes)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showBalanceDialog, setShowBalanceDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [newRequest, setNewRequest] = useState<Partial<LeaveRequest>>({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    start_period: 'full_day',
    end_period: 'full_day',
    reason: '',
    detailed_reason: '',
    emergency_request: false,
    priority: 'medium',
    work_handover_completed: false,
    coverage_arranged: false
  })

  // Calculate metrics
  const metrics = useMemo(() => {
    const pendingCount = leaveRequests.filter(r => r.status === 'pending').length
    const approvedCount = leaveRequests.filter(r => r.status === 'approved').length
    const rejectedCount = leaveRequests.filter(r => r.status === 'rejected').length
    const totalBalance = leaveBalances.reduce((sum, b) => sum + b.available_balance, 0)
    const usedThisYear = leaveBalances.reduce((sum, b) => sum + b.ytd_used, 0)
    const pendingDays = leaveRequests
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.total_days, 0)

    return {
      pendingCount,
      approvedCount,
      rejectedCount,
      totalBalance,
      usedThisYear,
      pendingDays,
      approvalRate: leaveRequests.length > 0 ? 
        (approvedCount / (approvedCount + rejectedCount)) * 100 : 0
    }
  }, [leaveRequests, leaveBalances])

  // Chart data
  const chartData = useMemo(() => {
    const monthStart = startOfMonth(new Date())
    const monthEnd = endOfMonth(new Date())
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayRequests = leaveRequests.filter(r => 
        dayStr >= r.start_date && dayStr <= r.end_date && r.status === 'approved'
      )
      
      return {
        date: format(day, 'MMM dd'),
        onLeave: dayRequests.length,
        types: leaveTypes.map(type => ({
          name: type.name,
          count: dayRequests.filter(r => r.leave_type_id === type.id).length,
          color: type.color_code
        }))
      }
    })
  }, [leaveRequests, leaveTypes])

  // Event handlers
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }, [])

  const handleRequestClick = useCallback((request: LeaveRequest) => {
    setSelectedRequest(request)
  }, [])

  const handleNewRequestChange = useCallback((field: string, value: any) => {
    setNewRequest(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmitRequest = useCallback(async () => {
    if (!newRequest.leave_type_id || !newRequest.start_date || !newRequest.end_date) {
      return
    }

    const startDate = new Date(newRequest.start_date)
    const endDate = new Date(newRequest.end_date)
    const totalDays = differenceInDays(endDate, startDate) + 1

    const request: LeaveRequest = {
      id: Date.now().toString(),
      request_number: `LR-2024-${String(leaveRequests.length + 1).padStart(3, '0')}`,
      employee_id: 'current-user',
      leave_type_id: newRequest.leave_type_id!,
      start_date: newRequest.start_date!,
      end_date: newRequest.end_date!,
      start_period: newRequest.start_period!,
      end_period: newRequest.end_period!,
      total_days: totalDays,
      business_days: totalDays, // Simplified calculation
      reason: newRequest.reason,
      detailed_reason: newRequest.detailed_reason,
      emergency_request: newRequest.emergency_request!,
      priority: newRequest.priority!,
      work_handover_completed: newRequest.work_handover_completed!,
      coverage_arranged: newRequest.coverage_arranged!,
      status: 'pending',
      workflow_step: 1,
      escalation_level: 0,
      auto_approved: false,
      requires_coverage: true,
      approval_chain: [],
      approvals_received: [],
      rejections_received: [],
      delegation_history: [],
      supporting_documents: [],
      medical_certificate_required: false,
      medical_certificate_submitted: false,
      medical_certificate_verified: false,
      additional_documentation: [],
      team_impact_score: 2,
      project_impact: [],
      expected_return_date: format(addDays(endDate, 1), 'yyyy-MM-dd'),
      return_confirmed: false,
      return_to_work_interview: false,
      fitness_for_work_clearance: false,
      phased_return_plan: {},
      pay_impact: {},
      benefit_impacts: [],
      accrual_adjustments: {},
      pension_impact: {},
      statutory_leave_flag: false,
      fmla_covered: false,
      disability_related: false,
      legal_requirements_met: true,
      similar_requests_analysis: {},
      pattern_analysis: {},
      risk_assessment: {},
      recommendation_engine: {},
      notification_preferences: {},
      reminder_schedule: [],
      communication_log: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      metadata: {},
      leave_type: leaveTypes.find(t => t.id === newRequest.leave_type_id)
    }

    setLeaveRequests(prev => [request, ...prev])
    setShowRequestDialog(false)
    setNewRequest({
      leave_type_id: '',
      start_date: '',
      end_date: '',
      start_period: 'full_day',
      end_period: 'full_day',
      reason: '',
      detailed_reason: '',
      emergency_request: false,
      priority: 'medium',
      work_handover_completed: false,
      coverage_arranged: false
    })
  }, [newRequest, leaveRequests.length, leaveTypes])

  const getLeaveTypeIcon = useCallback((iconName: string) => {
    switch (iconName) {
      case 'flight': return <FlightIcon />
      case 'local_hospital': return <LocalHospitalIcon />
      case 'home': return <HomeIcon />
      case 'school': return <SchoolIcon />
      case 'family_restroom': return <FamilyRestroomIcon />
      case 'work': return <WorkIcon />
      default: return <EventNoteIcon />
    }
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography 
              variant="h4" 
              fontWeight={700} 
              sx={{ 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Leave Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive leave tracking and approval system
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<GetAppIcon />}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowRequestDialog(true)}
            >
              Request Leave
            </Button>
          </Stack>
        </Stack>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Pending Requests"
              value={<CountUp end={metrics.pendingCount} />}
              change={-5.2}
              icon={<PendingIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Available Days"
              value={<CountUp end={metrics.totalBalance} decimals={1} />}
              change={8.3}
              icon={<AccountBalanceIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Used This Year"
              value={<CountUp end={metrics.usedThisYear} decimals={1} />}
              change={12.7}
              icon={<AssessmentIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Approval Rate"
              value={<CountUp end={metrics.approvalRate} decimals={1} suffix="%" />}
              change={2.1}
              icon={<ApprovalIcon />}
              color="primary"
            />
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons="auto"
            >
              <Tab 
                label="My Requests" 
                icon={<AssignmentIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Balances" 
                icon={<AccountBalanceIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Team Calendar" 
                icon={<CalendarTodayIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Analytics" 
                icon={<AnalyticsIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Policies" 
                icon={<PolicyIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <AnimatePresence mode="wait">
              {selectedTab === 0 && (
                <motion.div
                  key="requests"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* Leave Requests */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6">
                      Leave Requests
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        size="small"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: <SearchIcon />
                        }}
                      />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          label="Status"
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Stack>

                  <Grid container spacing={3}>
                    {leaveRequests
                      .filter(request => 
                        filterStatus === 'all' || request.status === filterStatus
                      )
                      .filter(request =>
                        searchQuery === '' || 
                        request.employee?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        request.employee?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        request.reason?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((request) => (
                        <Grid item xs={12} md={6} lg={4} key={request.id}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              border: `1px solid ${alpha(request.leave_type?.color_code || theme.palette.primary.main, 0.3)}`,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4],
                                borderColor: request.leave_type?.color_code || theme.palette.primary.main,
                              }
                            }}
                            onClick={() => handleRequestClick(request)}
                          >
                            <CardContent>
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar
                                      sx={{ 
                                        bgcolor: request.leave_type?.color_code || theme.palette.primary.main,
                                        width: 40,
                                        height: 40
                                      }}
                                    >
                                      {getLeaveTypeIcon(request.leave_type?.icon || 'event_note')}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle1" fontWeight={600}>
                                        {request.leave_type?.name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {request.request_number}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <StatusChip status={request.status} size="small" />
                                </Stack>

                                <Divider />

                                <Stack spacing={1}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <DateRangeIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                      {format(parseISO(request.start_date), 'MMM dd')} - {format(parseISO(request.end_date), 'MMM dd')}
                                    </Typography>
                                  </Stack>
                                  
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <AccessTimeIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                      {request.total_days} day{request.total_days !== 1 ? 's' : ''}
                                    </Typography>
                                  </Stack>

                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <InfoIcon fontSize="small" color="action" />
                                    <Typography variant="body2" noWrap>
                                      {request.reason || 'No reason provided'}
                                    </Typography>
                                  </Stack>
                                </Stack>

                                {request.emergency_request && (
                                  <Alert severity="warning">
                                    Emergency Request
                                  </Alert>
                                )}

                                {request.medical_certificate_required && (
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <LocalHospitalIcon fontSize="small" color="error" />
                                    <Typography variant="caption" color="error.main">
                                      Medical certificate required
                                    </Typography>
                                  </Stack>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>

                  {leaveRequests.length === 0 && (
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          No leave requests
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          You haven't submitted any leave requests yet
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowRequestDialog(true)}
                        >
                          Request Leave
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {selectedTab === 1 && (
                <motion.div
                  key="balances"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* Leave Balances */}
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Leave Balances
                  </Typography>

                  <Grid container spacing={3}>
                    {leaveBalances.map((balance) => (
                      <Grid item xs={12} sm={6} md={4} key={balance.id}>
                        <Card>
                          <CardContent>
                            <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                  sx={{ 
                                    bgcolor: balance.leave_type?.color_code || theme.palette.primary.main,
                                    width: 48,
                                    height: 48
                                  }}
                                >
                                  {getLeaveTypeIcon(balance.leave_type?.icon || 'event_note')}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" fontWeight={600}>
                                    {balance.leave_type?.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {balance.leave_type?.description}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Divider />

                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    Available
                                  </Typography>
                                  <Typography variant="h6" fontWeight={600} color="success.main">
                                    {balance.available_balance} days
                                  </Typography>
                                </Stack>

                                <LinearProgress
                                  variant="determinate"
                                  value={(balance.used_balance / balance.accrued_balance) * 100}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: alpha(balance.leave_type?.color_code || theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: balance.leave_type?.color_code || theme.palette.primary.main,
                                      borderRadius: 4,
                                    }
                                  }}
                                />

                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="caption" color="text.secondary">
                                    Used: {balance.used_balance} days
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Total: {balance.accrued_balance} days
                                  </Typography>
                                </Stack>

                                {balance.pending_balance > 0 && (
                                  <Alert severity="info">
                                    {balance.pending_balance} days pending approval
                                  </Alert>
                                )}

                                {balance.available_balance <= balance.low_balance_threshold && (
                                  <Alert severity="warning">
                                    Low balance alert
                                  </Alert>
                                )}
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              )}

              {selectedTab === 2 && (
                <motion.div
                  key="calendar"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* Team Calendar */}
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Team Leave Calendar
                  </Typography>

                  <Card>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar
                            dataKey="onLeave"
                            fill={theme.palette.primary.main}
                            name="Employees on Leave"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {selectedTab === 3 && (
                <motion.div
                  key="analytics"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* Analytics */}
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Leave Analytics
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Leave Usage Trends
                          </Typography>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="leaveGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="onLeave"
                                stroke={theme.palette.primary.main}
                                fillOpacity={1}
                                fill="url(#leaveGradient)"
                                name="On Leave"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                      <Stack spacing={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Leave Types Usage
                            </Typography>
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={leaveTypes.map(type => ({
                                    name: type.name,
                                    value: leaveBalances.find(b => b.leave_type_id === type.id)?.used_balance || 0,
                                    color: type.color_code
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  dataKey="value"
                                >
                                  {leaveTypes.map((type, index) => (
                                    <Cell key={`cell-${index}`} fill={type.color_code} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Quick Stats
                            </Typography>
                            <Stack spacing={2}>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">Pending Days</Typography>
                                <Chip 
                                  label={metrics.pendingDays} 
                                  size="small" 
                                  color="warning"
                                />
                              </Stack>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">Approved Requests</Typography>
                                <Chip 
                                  label={metrics.approvedCount} 
                                  size="small" 
                                  color="success"
                                />
                              </Stack>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">Rejected Requests</Typography>
                                <Chip 
                                  label={metrics.rejectedCount} 
                                  size="small" 
                                  color="error"
                                />
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Stack>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {selectedTab === 4 && (
                <motion.div
                  key="policies"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* Leave Policies */}
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Leave Policies & Types
                  </Typography>

                  <Grid container spacing={3}>
                    {leaveTypes.map((type) => (
                      <Grid item xs={12} key={type.id}>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                              <Avatar
                                sx={{ 
                                  bgcolor: type.color_code,
                                  width: 40,
                                  height: 40
                                }}
                              >
                                {getLeaveTypeIcon(type.icon)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight={600}>
                                  {type.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {type.description}
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={1}>
                                <Chip 
                                  label={type.is_paid ? 'Paid' : 'Unpaid'} 
                                  size="small" 
                                  color={type.is_paid ? 'success' : 'default'}
                                />
                                <Chip 
                                  label={`Max: ${type.max_days_per_year || 'Unlimited'} days`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </Stack>
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Accrual Details
                                </Typography>
                                <Stack spacing={1}>
                                  <Typography variant="body2">
                                    <strong>Method:</strong> {type.accrual_method}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Rate:</strong> {type.accrual_rate} days/{type.accrual_frequency}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Cap:</strong> {type.accrual_cap || 'None'}
                                  </Typography>
                                </Stack>
                              </Grid>

                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Request Rules
                                </Typography>
                                <Stack spacing={1}>
                                  <Typography variant="body2">
                                    <strong>Min Notice:</strong> {type.min_notice_days} days
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Max Duration:</strong> {type.max_duration_days} days
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Min Gap:</strong> {type.min_gap_between_requests} days
                                  </Typography>
                                </Stack>
                              </Grid>

                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Approval Requirements
                                </Typography>
                                <Stack spacing={1}>
                                  {type.requires_manager_approval && (
                                    <Chip label="Manager Approval" size="small" color="primary" />
                                  )}
                                  {type.requires_hr_approval && (
                                    <Chip label="HR Approval" size="small" color="secondary" />
                                  )}
                                  {type.requires_medical_certificate && (
                                    <Chip label="Medical Certificate" size="small" color="error" />
                                  )}
                                </Stack>
                              </Grid>

                              <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Additional Features
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                  {type.carry_forward_allowed && (
                                    <Chip label="Carry Forward" size="small" variant="outlined" />
                                  )}
                                  {type.cash_out_allowed && (
                                    <Chip label="Cash Out" size="small" variant="outlined" />
                                  )}
                                  {type.half_day_allowed && (
                                    <Chip label="Half Day" size="small" variant="outlined" />
                                  )}
                                  {type.hourly_leave_allowed && (
                                    <Chip label="Hourly Leave" size="small" variant="outlined" />
                                  )}
                                  {type.statutory_leave && (
                                    <Chip label="Statutory" size="small" color="info" />
                                  )}
                                  {type.fmla_qualifying && (
                                    <Chip label="FMLA" size="small" color="warning" />
                                  )}
                                </Stack>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* New Leave Request Dialog */}
        <Dialog
          open={showRequestDialog}
          onClose={() => setShowRequestDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            Request Leave
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={newRequest.leave_type_id}
                    onChange={(e) => handleNewRequestChange('leave_type_id', e.target.value)}
                    label="Leave Type"
                  >
                    {leaveTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar
                            sx={{ 
                              bgcolor: type.color_code,
                              width: 24,
                              height: 24
                            }}
                          >
                            {getLeaveTypeIcon(type.icon)}
                          </Avatar>
                          <Typography>{type.name}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newRequest.priority}
                    onChange={(e) => handleNewRequestChange('priority', e.target.value)}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={newRequest.start_date}
                  onChange={(e) => handleNewRequestChange('start_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={newRequest.end_date}
                  onChange={(e) => handleNewRequestChange('end_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  value={newRequest.reason}
                  onChange={(e) => handleNewRequestChange('reason', e.target.value)}
                  placeholder="Brief reason for leave"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Detailed Explanation"
                  value={newRequest.detailed_reason}
                  onChange={(e) => handleNewRequestChange('detailed_reason', e.target.value)}
                  placeholder="Provide additional details if necessary"
                />
              </Grid>

              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newRequest.emergency_request}
                        onChange={(e) => handleNewRequestChange('emergency_request', e.target.checked)}
                      />
                    }
                    label="Emergency Request"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newRequest.work_handover_completed}
                        onChange={(e) => handleNewRequestChange('work_handover_completed', e.target.checked)}
                      />
                    }
                    label="Work handover completed"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newRequest.coverage_arranged}
                        onChange={(e) => handleNewRequestChange('coverage_arranged', e.target.checked)}
                      />
                    }
                    label="Coverage arranged"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitRequest}
              disabled={!newRequest.leave_type_id || !newRequest.start_date || !newRequest.end_date}
            >
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Request Details Dialog */}
        <Dialog
          open={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          {selectedRequest && (
            <>
              <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{ 
                      bgcolor: selectedRequest.leave_type?.color_code || theme.palette.primary.main,
                      width: 40,
                      height: 40
                    }}
                  >
                    {getLeaveTypeIcon(selectedRequest.leave_type?.icon || 'event_note')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedRequest.leave_type?.name} Request
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedRequest.request_number}
                    </Typography>
                  </Box>
                </Stack>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Request Details
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Dates:</strong> {format(parseISO(selectedRequest.start_date), 'MMM dd, yyyy')} - {format(parseISO(selectedRequest.end_date), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Duration:</strong> {selectedRequest.total_days} days
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong> <StatusChip status={selectedRequest.status} size="small" />
                      </Typography>
                      <Typography variant="body2">
                        <strong>Priority:</strong> {selectedRequest.priority}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Request Status
                    </Typography>
                    <Timeline>
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot color="primary">
                            <AssignmentIcon />
                          </TimelineDot>
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2">
                            Request Submitted
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(parseISO(selectedRequest.submitted_at), 'MMM dd, HH:mm')}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                      
                      {selectedRequest.status === 'approved' && (
                        <TimelineItem>
                          <TimelineSeparator>
                            <TimelineDot color="success">
                              <CheckCircleIcon />
                            </TimelineDot>
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="body2">
                              Request Approved
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {selectedRequest.approved_at && format(parseISO(selectedRequest.approved_at), 'MMM dd, HH:mm')}
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                      )}
                    </Timeline>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Reason
                    </Typography>
                    <Typography variant="body2">
                      {selectedRequest.reason || 'No reason provided'}
                    </Typography>
                    {selectedRequest.detailed_reason && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedRequest.detailed_reason}
                      </Typography>
                    )}
                  </Grid>

                  {selectedRequest.medical_certificate_required && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          Medical certificate is required for this leave type.
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
                {selectedRequest.status === 'pending' && (
                  <Button variant="outlined" startIcon={<EditIcon />}>
                    Edit Request
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </motion.div>
  )
}

export default ComprehensiveLeaveManagement
