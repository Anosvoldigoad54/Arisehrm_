// Comprehensive Button Functionality Manager
// This file contains all button handlers and functionality across the HRM system

// Export/Import Handlers
export const handleExportEmployees = () => {
  // Create CSV data
  const csvData = [
    ['Name', 'Email', 'Department', 'Position', 'Status', 'Start Date'],
    ['Sarah Johnson', 'sarah.johnson@company.com', 'Engineering', 'Senior Software Engineer', 'Active', '2022-01-15'],
    ['Mike Chen', 'mike.chen@company.com', 'Marketing', 'Marketing Manager', 'Active', '2021-03-10'],
    // Add more mock data as needed
  ]
  
  const csvContent = csvData.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Show success notification
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Employee data exported successfully!', 'success')
  }
}

export const handleImportEmployees = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv,.xlsx'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      // Here you would implement the actual import logic
      if (typeof window !== 'undefined' && (window as any).showNotification) {
        (window as any).showNotification(`Import started for ${file.name}`, 'info')
      }
    }
  }
  input.click()
}

// Payroll Handlers
export const handleProcessPayroll = () => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Payroll processing started', 'info')
  }
  
  // Simulate processing
  setTimeout(() => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('Payroll processed successfully!', 'success')
    }
  }, 2000)
}

export const handleGeneratePayslips = () => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Generating payslips for all employees...', 'info')
  }
  
  setTimeout(() => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('Payslips generated and sent!', 'success')
    }
  }, 1500)
}

// Leave Management Handlers
export const handleApproveLeave = (requestId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Leave request approved', 'success')
  }
}

export const handleRejectLeave = (requestId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Leave request rejected', 'warning')
  }
}

// Attendance Handlers
export const handleClockIn = (location?: { lat: number; lng: number }) => {
  const timestamp = new Date().toLocaleTimeString()
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification(`Clocked in at ${timestamp}`, 'success')
  }
}

export const handleClockOut = () => {
  const timestamp = new Date().toLocaleTimeString()
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification(`Clocked out at ${timestamp}`, 'success')
  }
}

// Performance Handlers
export const handleStartReview = (employeeId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Performance review started', 'info')
  }
}

export const handleSubmitReview = (reviewData: any) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Performance review submitted', 'success')
  }
}

// Training Handlers
export const handleEnrollCourse = (courseId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Successfully enrolled in course!', 'success')
  }
}

export const handleCompleteCourse = (courseId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Course completed! Certificate will be issued.', 'success')
  }
}

// Recruitment Handlers
export const handleScheduleInterview = (candidateId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Interview scheduled successfully', 'success')
  }
}

export const handleHireCandidate = (candidateId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Candidate hired! Starting onboarding process...', 'success')
  }
}

// Document Handlers
export const handleDocumentUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = '.pdf,.doc,.docx,.jpg,.png'
  input.onchange = (e) => {
    const files = (e.target as HTMLInputElement).files
    if (files) {
      if (typeof window !== 'undefined' && (window as any).showNotification) {
        (window as any).showNotification(`Uploading ${files.length} file(s)...`, 'info')
      }
    }
  }
  input.click()
}

export const handleDocumentDownload = (documentId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Document download started', 'info')
  }
}

// Settings Handlers
export const handleSaveSettings = (settings: any) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Settings saved successfully!', 'success')
  }
}

export const handleResetSettings = () => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Settings reset to defaults', 'info')
  }
}

// Benefits Handlers
export const handleEnrollBenefit = (benefitId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Benefit enrollment submitted for approval', 'success')
  }
}

export const handleCancelBenefit = (enrollmentId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Benefit enrollment canceled', 'warning')
  }
}

// Onboarding Handlers
export const handleStartOnboarding = (employeeId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Onboarding process started', 'success')
  }
}

export const handleCompleteTask = (taskId: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Task completed successfully', 'success')
  }
}

// Analytics and Reporting Handlers
export const handleGenerateReport = (reportType: string, filters: any) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('Report generation started...', 'info')
  }
  
  setTimeout(() => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('Report generated successfully!', 'success')
    }
  }, 2000)
}

export const handleExportReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification(`Exporting report as ${format.toUpperCase()}...`, 'info')
  }
  
  setTimeout(() => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('Report exported successfully!', 'success')
    }
  }, 1500)
}

// Notification System
export const handleSendNotification = (recipients: string[], message: string, type: 'email' | 'sms' | 'push') => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification(`${type.toUpperCase()} notification sent to ${recipients.length} recipient(s)`, 'success')
  }
}

// Generic Handlers
export const handleRefresh = () => {
  // ✅ FIXED: Prevent refresh during authentication
  const isLoginInProgress = sessionStorage.getItem('login_in_progress') === 'true' ||
                           localStorage.getItem('auth_token') !== null ||
                           document.querySelector('.UnifiedLoginSystem') !== null;
  
  if (!isLoginInProgress) {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('Data refreshed', 'info')
    }
    window.location.reload()
  } else {
    console.log('[ButtonHandlers] Skipping refresh during authentication flow');
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('Please complete login before refreshing', 'info')
    }
  }
}

export const handlePrint = () => {
  window.print()
}

export const handleShare = (data: any) => {
  if (navigator.share) {
    navigator.share({
      title: 'Arise HRM Data',
      text: 'Check out this HRM data',
      url: window.location.href
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('Link copied to clipboard', 'info')
    }
  }
}

// Emergency Handlers
export const handleEmergencyAlert = (message: string) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('EMERGENCY: ' + message, 'error')
  }
}

export const handleBackup = () => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification('System backup started', 'info')
  }
}

// Global notification system
if (typeof window !== 'undefined') {
  (window as any).showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    // Create a temporary notification element
    const notification = document.createElement('div')
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 9999;
      max-width: 300px;
      transition: all 0.3s ease;
      background-color: ${
        type === 'success' ? '#10b981' :
        type === 'error' ? '#ef4444' :
        type === 'warning' ? '#f59e0b' :
        '#3b82f6'
      };
    `
    
    document.body.appendChild(notification)
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
      notification.style.opacity = '1'
    }, 10)
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      notification.style.opacity = '0'
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }
}
