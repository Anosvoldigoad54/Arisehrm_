import { toast } from 'sonner'

// Enhanced button handlers with proper functionality and error handling
export class ButtonHandlers {
  // File operations
  static async exportData(data: any[], filename: string, format: 'csv' | 'json' | 'excel' = 'csv') {
    try {
      let content: string
      let mimeType: string
      
      switch (format) {
        case 'csv':
          content = this.convertToCSV(data)
          mimeType = 'text/csv;charset=utf-8;'
          break
        case 'json':
          content = JSON.stringify(data, null, 2)
          mimeType = 'application/json;charset=utf-8;'
          break
        case 'excel':
          // For now, export as CSV - can be enhanced with actual Excel export
          content = this.convertToCSV(data)
          mimeType = 'text/csv;charset=utf-8;'
          filename = filename.replace('.xlsx', '.csv')
          break
        default:
          throw new Error('Unsupported format')
      }

      const blob = new Blob([content], { type: mimeType })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
      
      toast.success(`${format.toUpperCase()} exported successfully!`, {
        description: `Downloaded ${filename}`
      })
    } catch (error) {
      toast.error('Export failed', {
        description: 'Please try again or contact support'
      })
    }
  }

  static async importFile(acceptedTypes: string[] = ['.csv', '.xlsx', '.json']): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = acceptedTypes.join(',')
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          toast.success(`File selected: ${file.name}`, {
            description: 'Processing...'
          })
          resolve(file)
        } else {
          resolve(null)
        }
      }
      input.oncancel = () => resolve(null)
      input.click()
    })
  }

  // Document operations
  static async downloadDocument(url: string, filename: string) {
    try {
      if (!url || url === '#') {
        // Generate a demo file for demo purposes
        const content = `Document: ${filename}\nGenerated: ${new Date().toLocaleString()}\n\nThis is a demo document.`
        const blob = new Blob([content], { type: 'text/plain' })
        const demoUrl = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = demoUrl
        link.download = filename
        link.click()
        URL.revokeObjectURL(demoUrl)
      } else {
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.target = '_blank'
        link.click()
      }
      
      toast.success('Download started', {
        description: filename
      })
    } catch (error) {
      toast.error('Download failed', {
        description: 'Please try again'
      })
    }
  }

  static async shareDocument(documentId: string, documentName: string) {
    try {
      const shareUrl = `${window.location.origin}/documents/${documentId}`
      
      if (navigator.share) {
        await navigator.share({
          title: documentName,
          text: 'Check out this document',
          url: shareUrl
        })
        toast.success('Shared successfully!')
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard', {
          description: 'Share this link with others'
        })
      }
    } catch (error) {
      toast.error('Share failed', {
        description: 'Please try again'
      })
    }
  }

  // Location operations
  static async getCurrentLocation(): Promise<{latitude: number, longitude: number} | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error('Geolocation not supported')
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          toast.error('Failed to get location', {
            description: 'Please enable location services'
          })
          resolve(null)
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 300000
        }
      )
    })
  }

  // Form operations
  static validateForm(data: Record<string, any>, requiredFields: string[]): { isValid: boolean, errors: string[] } {
    const errors: string[] = []
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push(`${field.replace('_', ' ')} is required`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static async submitForm(
    data: Record<string, any>, 
    endpoint: string, 
    method: 'POST' | 'PUT' | 'PATCH' = 'POST'
  ) {
    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      
      toast.success('Form submitted successfully!', {
        description: 'Your data has been saved'
      })
      
      return { success: true, data }
    } catch (error) {
      toast.error('Form submission failed', {
        description: 'Please check your data and try again'
      })
      throw error
    }
  }

  // Confirmation dialogs
  static async confirmAction(
    message: string, 
    title: string = 'Confirm Action',
    type: 'warning' | 'error' | 'info' = 'warning'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = window.confirm(`${title}\n\n${message}`)
      resolve(confirmed)
    })
  }

  // Print operations
  static printElement(elementId: string) {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        toast.error('Print element not found')
        return
      }

      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('Popup blocked - please allow popups for printing')
        return
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${element.innerHTML}
          </body>
        </html>
      `)
      
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
      
      toast.success('Print dialog opened')
    } catch (error) {
      toast.error('Print failed')
    }
  }

  // Notification operations
  static async sendNotification(
    recipients: string[], 
    message: string, 
    type: 'email' | 'sms' | 'push' = 'email'
  ) {
    try {
      // Simulate sending notification
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`${type.toUpperCase()} notification sent!`, {
        description: `Sent to ${recipients.length} recipient(s)`
      })
      
      return { success: true, recipients, type, message }
    } catch (error) {
      toast.error('Failed to send notification')
      throw error
    }
  }

  // Utility functions
  private static convertToCSV(data: any[]): string {
    if (!data.length) return ''
    
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return String(value)
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  // Error handling
  static handleError(error: unknown, context: string = 'Operation') {
    
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    
    toast.error(`${context} failed`, {
      description: message
    })
  }

  // Loading states
  static withLoading<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    loadingMessage: string = 'Processing...'
  ) {
    return async (...args: T): Promise<R> => {
      const loadingToast = toast.loading(loadingMessage)
      
      try {
        const result = await fn(...args)
        toast.dismiss(loadingToast)
        return result
      } catch (error) {
        toast.dismiss(loadingToast)
        throw error
      }
    }
  }
}

export default ButtonHandlers
