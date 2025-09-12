/**
 * Comprehensive Validation Schemas for Arise HRM
 * Using Yup for robust form validation across all components
 */

import * as yup from 'yup';
import { log } from '@/services/loggingService';

// ==============================================
// COMMON VALIDATION PATTERNS
// ==============================================

// Phone number regex (supports multiple formats)
const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;

// Employee ID format (alphanumeric, 3-20 characters)
const employeeIdRegex = /^[A-Za-z0-9]{3,20}$/;

// Strong password requirements
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Professional email domains (extendable list)
const professionalEmailDomains = [
  'gmail.com', 'outlook.com', 'yahoo.com', 'company.com', 'corporate.com',
  'work.com', 'business.com', 'enterprise.com', 'org', 'edu', 'gov'
];

// ==============================================
// CUSTOM VALIDATION METHODS
// ==============================================

// Custom age validation
const validateAge = (birthDate: string): boolean => {
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
      ? age - 1 
      : age;
    
    return actualAge >= 16 && actualAge <= 100;
  } catch (error) {
    log.warn('Invalid birth date provided for age validation', error as Error, { birthDate });
    return false;
  }
};

// Custom future date validation
const validateFutureDate = (date: string, maxYears: number = 10): boolean => {
  try {
    const inputDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + maxYears);
    
    return inputDate > today && inputDate <= maxDate;
  } catch (error) {
    log.warn('Invalid date provided for future date validation', error as Error, { date, maxYears });
    return false;
  }
};

// Custom past date validation (for hire dates, etc.)
const validatePastDate = (date: string, maxYearsAgo: number = 50): boolean => {
  try {
    const inputDate = new Date(date);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - maxYearsAgo);
    
    return inputDate <= today && inputDate >= minDate;
  } catch (error) {
    log.warn('Invalid date provided for past date validation', error as Error, { date, maxYearsAgo });
    return false;
  }
};

// ==============================================
// AUTHENTICATION SCHEMAS
// ==============================================

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase('Email should be lowercase')
    .trim(),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: yup.boolean().default(false),
});

export const registrationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .matches(/^[A-Za-z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .matches(/^[A-Za-z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .test('professional-email', 'Please use a professional email address', (value) => {
      if (!value) return false;
      const domain = value.split('@')[1]?.toLowerCase();
      return professionalEmailDomains.some(profDomain => domain?.includes(profDomain));
    })
    .lowercase()
    .trim(),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  agreeToTerms: yup
    .boolean()
    .required('You must agree to the terms and conditions')
    .oneOf([true], 'You must agree to the terms and conditions'),
});

export const passwordResetSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),
});

export const passwordChangeSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required')
    .min(6, 'Password must be at least 6 characters'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .notOneOf([yup.ref('currentPassword')], 'New password must be different from current password'),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export const twoFactorSchema = yup.object({
  code: yup
    .string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Verification code must be 6 digits')
    .length(6, 'Verification code must be exactly 6 digits'),
});

// ==============================================
// EMPLOYEE MANAGEMENT SCHEMAS
// ==============================================

export const employeeSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .matches(/^[A-Za-z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .matches(/^[A-Za-z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),
  phone: yup
    .string()
    .nullable()
    .matches(phoneRegex, 'Please enter a valid phone number'),
  employeeId: yup
    .string()
    .nullable()
    .matches(employeeIdRegex, 'Employee ID must be 3-20 alphanumeric characters'),
  dateOfBirth: yup
    .string()
    .nullable()
    .test('valid-age', 'Employee must be between 16 and 100 years old', (value) => {
      return !value || validateAge(value);
    }),
  hireDate: yup
    .string()
    .required('Hire date is required')
    .test('valid-hire-date', 'Hire date cannot be more than 50 years ago or in the future', (value) => {
      return !value || validatePastDate(value, 50);
    }),
  departmentId: yup
    .string()
    .nullable(),
  positionId: yup
    .string()
    .nullable(),
  employmentStatus: yup
    .string()
    .required('Employment status is required')
    .oneOf(['active', 'inactive', 'terminated', 'on_leave', 'suspended'], 'Please select a valid employment status'),
  employmentType: yup
    .string()
    .required('Employment type is required')
    .oneOf(['full_time', 'part_time', 'contract', 'intern', 'consultant'], 'Please select a valid employment type'),
  salary: yup
    .number()
    .nullable()
    .min(0, 'Salary cannot be negative')
    .max(10000000, 'Salary cannot exceed $10,000,000'),
  address: yup
    .string()
    .nullable()
    .max(200, 'Address cannot exceed 200 characters'),
});

export const employeeProfileUpdateSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .trim(),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .trim(),
  phone: yup
    .string()
    .nullable()
    .matches(phoneRegex, 'Please enter a valid phone number'),
  address: yup
    .string()
    .nullable()
    .max(200, 'Address cannot exceed 200 characters'),
  emergencyContactName: yup
    .string()
    .nullable()
    .max(100, 'Emergency contact name cannot exceed 100 characters'),
  emergencyContactPhone: yup
    .string()
    .nullable()
    .matches(phoneRegex, 'Please enter a valid emergency contact phone number'),
});

// ==============================================
// LEAVE MANAGEMENT SCHEMAS
// ==============================================

export const leaveRequestSchema = yup.object({
  leaveType: yup
    .string()
    .required('Leave type is required')
    .oneOf(['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other'], 'Please select a valid leave type'),
  startDate: yup
    .string()
    .required('Start date is required')
    .test('future-date', 'Start date must be in the future', (value) => {
      if (!value) return false;
      return new Date(value) >= new Date();
    }),
  endDate: yup
    .string()
    .required('End date is required')
    .test('after-start-date', 'End date must be after start date', function(value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true;
      return new Date(value) >= new Date(startDate);
    })
    .test('reasonable-duration', 'Leave duration cannot exceed 365 days', function(value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true;
      const daysDiff = Math.ceil((new Date(value).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24));
      return daysDiff <= 365;
    }),
  reason: yup
    .string()
    .required('Reason for leave is required')
    .min(10, 'Please provide a detailed reason (at least 10 characters)')
    .max(500, 'Reason cannot exceed 500 characters')
    .trim(),
  isHalfDay: yup
    .boolean()
    .default(false),
  attachments: yup
    .array()
    .of(yup.string())
    .max(5, 'Cannot upload more than 5 attachments'),
});

export const leaveApprovalSchema = yup.object({
  status: yup
    .string()
    .required('Approval status is required')
    .oneOf(['approved', 'rejected', 'pending'], 'Please select a valid status'),
  comments: yup
    .string()
    .nullable()
    .max(500, 'Comments cannot exceed 500 characters')
    .when('status', {
      is: 'rejected',
      then: (schema) => schema.required('Comments are required when rejecting a leave request').min(10, 'Please provide a detailed reason for rejection'),
      otherwise: (schema) => schema,
    }),
});

// ==============================================
// ATTENDANCE MANAGEMENT SCHEMAS
// ==============================================

export const attendanceSchema = yup.object({
  date: yup
    .string()
    .required('Date is required')
    .test('valid-date', 'Date cannot be in the future', (value) => {
      if (!value) return false;
      return new Date(value) <= new Date();
    }),
  clockInTime: yup
    .string()
    .required('Clock in time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
  clockOutTime: yup
    .string()
    .nullable()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)')
    .test('after-clock-in', 'Clock out time must be after clock in time', function(value) {
      const { clockInTime } = this.parent;
      if (!value || !clockInTime) return true;
      
      const clockIn = new Date(`1970-01-01T${clockInTime}:00`);
      const clockOut = new Date(`1970-01-01T${value}:00`);
      
      return clockOut > clockIn;
    }),
  location: yup
    .string()
    .nullable()
    .max(100, 'Location cannot exceed 100 characters'),
  notes: yup
    .string()
    .nullable()
    .max(300, 'Notes cannot exceed 300 characters'),
});

// ==============================================
// PERFORMANCE MANAGEMENT SCHEMAS
// ==============================================

export const performanceReviewSchema = yup.object({
  employeeId: yup
    .string()
    .required('Employee is required'),
  reviewPeriodStart: yup
    .string()
    .required('Review period start date is required'),
  reviewPeriodEnd: yup
    .string()
    .required('Review period end date is required')
    .test('after-start', 'End date must be after start date', function(value) {
      const { reviewPeriodStart } = this.parent;
      if (!value || !reviewPeriodStart) return true;
      return new Date(value) > new Date(reviewPeriodStart);
    }),
  overallRating: yup
    .number()
    .required('Overall rating is required')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  strengths: yup
    .string()
    .required('Please list employee strengths')
    .min(20, 'Please provide detailed strengths (at least 20 characters)')
    .max(1000, 'Strengths cannot exceed 1000 characters'),
  areasForImprovement: yup
    .string()
    .required('Please list areas for improvement')
    .min(20, 'Please provide detailed areas for improvement (at least 20 characters)')
    .max(1000, 'Areas for improvement cannot exceed 1000 characters'),
  goals: yup
    .string()
    .required('Please set goals for next period')
    .min(20, 'Please provide detailed goals (at least 20 characters)')
    .max(1000, 'Goals cannot exceed 1000 characters'),
  reviewerComments: yup
    .string()
    .nullable()
    .max(1000, 'Reviewer comments cannot exceed 1000 characters'),
});

// ==============================================
// RECRUITMENT SCHEMAS
// ==============================================

export const jobApplicationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .trim(),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .trim(),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(phoneRegex, 'Please enter a valid phone number'),
  position: yup
    .string()
    .required('Position is required'),
  experience: yup
    .number()
    .required('Years of experience is required')
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years'),
  education: yup
    .string()
    .required('Education level is required')
    .oneOf(['high_school', 'associates', 'bachelors', 'masters', 'doctorate', 'other'], 'Please select a valid education level'),
  coverLetter: yup
    .string()
    .required('Cover letter is required')
    .min(100, 'Cover letter must be at least 100 characters')
    .max(2000, 'Cover letter cannot exceed 2000 characters'),
  resume: yup
    .mixed()
    .required('Resume is required'),
});

// ==============================================
// PAYROLL SCHEMAS
// ==============================================

export const payrollSchema = yup.object({
  employeeId: yup
    .string()
    .required('Employee is required'),
  payPeriodStart: yup
    .string()
    .required('Pay period start date is required'),
  payPeriodEnd: yup
    .string()
    .required('Pay period end date is required')
    .test('after-start', 'End date must be after start date', function(value) {
      const { payPeriodStart } = this.parent;
      if (!value || !payPeriodStart) return true;
      return new Date(value) > new Date(payPeriodStart);
    }),
  basicSalary: yup
    .number()
    .required('Basic salary is required')
    .min(0, 'Salary cannot be negative'),
  overtime: yup
    .number()
    .min(0, 'Overtime cannot be negative')
    .default(0),
  bonuses: yup
    .number()
    .min(0, 'Bonuses cannot be negative')
    .default(0),
  deductions: yup
    .number()
    .min(0, 'Deductions cannot be negative')
    .default(0),
});

// ==============================================
// CONTACT & COMMUNICATION SCHEMAS
// ==============================================

export const contactFormSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),
  subject: yup
    .string()
    .required('Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject cannot exceed 200 characters')
    .trim(),
  message: yup
    .string()
    .required('Message is required')
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message cannot exceed 1000 characters')
    .trim(),
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high', 'urgent'], 'Please select a valid priority')
    .default('medium'),
});

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Validates a schema and returns formatted errors
 */
export const validateSchema = async (schema: yup.Schema, data: any): Promise<{
  isValid: boolean;
  errors: Record<string, string>;
  data?: any;
}> => {
  try {
    const validatedData = await schema.validate(data, { abortEarly: false });
    return {
      isValid: true,
      errors: {},
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });

      log.info('Form validation failed', { errors, data: JSON.stringify(data) });
      
      return {
        isValid: false,
        errors,
      };
    }
    
    log.error('Unexpected error during schema validation', error as Error, { data });
    return {
      isValid: false,
      errors: { general: 'An unexpected error occurred during validation' },
    };
  }
};

/**
 * Creates a validation function for use with form libraries
 */
export const createValidator = (schema: yup.Schema) => {
  return async (data: any) => {
    const result = await validateSchema(schema, data);
    return result.errors;
  };
};

/**
 * Validation schema collection for easy access
 */
export const validationSchemas = {
  // Authentication
  login: loginSchema,
  registration: registrationSchema,
  passwordReset: passwordResetSchema,
  passwordChange: passwordChangeSchema,
  twoFactor: twoFactorSchema,
  
  // Employee Management
  employee: employeeSchema,
  employeeProfileUpdate: employeeProfileUpdateSchema,
  
  // Leave Management
  leaveRequest: leaveRequestSchema,
  leaveApproval: leaveApprovalSchema,
  
  // Attendance
  attendance: attendanceSchema,
  
  // Performance
  performanceReview: performanceReviewSchema,
  
  // Recruitment
  jobApplication: jobApplicationSchema,
  
  // Payroll
  payroll: payrollSchema,
  
  // Communication
  contactForm: contactFormSchema,
};

export default validationSchemas;
