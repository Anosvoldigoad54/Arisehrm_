import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material'
import {
  Warning,
  TrendingDown,
  Schedule,
  Person,
  Analytics,
  Notifications,
  CheckCircle,
  Error,
  Info,
  Close,
  SmartToy
} from '@mui/icons-material'
import { format, subDays, differenceInDays } from 'date-fns'

interface AttendanceRecord {
  id: string
  employee_id: string
  employee_name: string
  date: string
  check_in: string | null
  check_out: string | null
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'partial'
  hours_worked: number
  department: string
}

interface AttendanceAnomaly {
  id: string
  employee_id: string
  employee_name: string
  type: 'frequent_late' | 'irregular_hours' | 'long_breaks' | 'weekend_work' | 'consecutive_absences'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  detected_date: string
  pattern_data: any
  recommendation: string
}

const AIAttendanceAnalyzer: React.FC = () => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AttendanceAnomaly | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Mock attendance data for demonstration
  const attendanceData: AttendanceRecord[] = useMemo(() => {
    const data: AttendanceRecord[] = []
    const employees = [
      { id: '1', name: 'John Doe', department: 'Engineering' },
      { id: '2', name: 'Jane Smith', department: 'Marketing' },
      { id: '3', name: 'Mike Johnson', department: 'Sales' },
      { id: '4', name: 'Sarah Wilson', department: 'HR' },
      { id: '5', name: 'David Brown', department: 'Finance' }
    ]

    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i)
      employees.forEach(emp => {
        // Simulate different attendance patterns
        let status: AttendanceRecord['status'] = 'present'
        let checkIn = '09:00'
        let checkOut = '17:30'
        let hoursWorked = 8.5

        // Introduce anomalies for specific employees
        if (emp.id === '1' && Math.random() > 0.7) {
          checkIn = '09:45' // Frequently late
          status = 'late'
        }
        if (emp.id === '2' && Math.random() > 0.8) {
          status = 'absent'
          checkIn = null
          checkOut = null
          hoursWorked = 0
        }
        if (emp.id === '3' && Math.random() > 0.6) {
          checkOut = '16:00' // Early leaves
          status = 'early_leave'
          hoursWorked = 7
        }

        data.push({
          id: `${emp.id}-${i}`,
          employee_id: emp.id,
          employee_name: emp.name,
          date: format(date, 'yyyy-MM-dd'),
          check_in: checkIn,
          check_out: checkOut,
          status,
          hours_worked: hoursWorked,
          department: emp.department
        })
      })
    }
    return data
  }, [])

  // AI-powered anomaly detection
  const detectedAnomalies: AttendanceAnomaly[] = useMemo(() => {
    const anomalies: AttendanceAnomaly[] = []
    
    // Group by employee
    const employeeData = attendanceData.reduce((acc, record) => {
      if (!acc[record.employee_id]) {
        acc[record.employee_id] = []
      }
      acc[record.employee_id].push(record)
      return acc
    }, {} as Record<string, AttendanceRecord[]>)

    Object.entries(employeeData).forEach(([employeeId, records]) => {
      const employee = records[0]
      
      // Detect frequent lateness
      const lateCount = records.filter(r => r.status === 'late').length
      const latePercentage = (lateCount / records.length) * 100
      
      if (latePercentage > 30) {
        anomalies.push({
          id: `late-${employeeId}`,
          employee_id: employeeId,
          employee_name: employee.employee_name,
          type: 'frequent_late',
          severity: latePercentage > 50 ? 'high' : 'medium',
          description: `Employee is late ${latePercentage.toFixed(1)}% of the time (${lateCount}/${records.length} days)`,
          confidence: 85,
          detected_date: format(new Date(), 'yyyy-MM-dd'),
          pattern_data: { lateCount, totalDays: records.length, percentage: latePercentage },
          recommendation: 'Schedule a meeting to discuss work-life balance and potential schedule adjustments'
        })
      }

      // Detect consecutive absences
      let consecutiveAbsences = 0
      let maxConsecutive = 0
      records.forEach(record => {
        if (record.status === 'absent') {
          consecutiveAbsences++
          maxConsecutive = Math.max(maxConsecutive, consecutiveAbsences)
        } else {
          consecutiveAbsences = 0
        }
      })

      if (maxConsecutive >= 3) {
        anomalies.push({
          id: `absence-${employeeId}`,
          employee_id: employeeId,
          employee_name: employee.employee_name,
          type: 'consecutive_absences',
          severity: maxConsecutive >= 5 ? 'critical' : 'high',
          description: `Employee has ${maxConsecutive} consecutive absences`,
          confidence: 92,
          detected_date: format(new Date(), 'yyyy-MM-dd'),
          pattern_data: { maxConsecutive },
          recommendation: 'Immediate HR intervention required. Check for health issues or personal problems'
        })
      }

      // Detect irregular hours
      const avgHours = records.reduce((sum, r) => sum + r.hours_worked, 0) / records.length
      const hourVariance = records.reduce((sum, r) => sum + Math.pow(r.hours_worked - avgHours, 2), 0) / records.length
      
      if (hourVariance > 2) {
        anomalies.push({
          id: `hours-${employeeId}`,
          employee_id: employeeId,
          employee_name: employee.employee_name,
          type: 'irregular_hours',
          severity: 'medium',
          description: `Highly irregular working hours (variance: ${hourVariance.toFixed(2)})`,
          confidence: 78,
          detected_date: format(new Date(), 'yyyy-MM-dd'),
          pattern_data: { avgHours, variance: hourVariance },
          recommendation: 'Review workload distribution and discuss flexible working arrangements'
        })
      }
    })

    return anomalies.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }, [attendanceData])

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, any> = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    }
    return colors[severity] || 'default'
  }

  const getSeverityIcon = (severity: string) => {
    const icons: Record<string, React.ReactNode> = {
      critical: <Error color="error" />,
      high: <Warning color="warning" />,
      medium: <Info color="info" />,
      low: <CheckCircle color="success" />
    }
    return icons[severity] || <Info />
  }

  const getAnomalyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      frequent_late: 'Frequent Lateness',
      irregular_hours: 'Irregular Hours',
      long_breaks: 'Extended Breaks',
      weekend_work: 'Weekend Work',
      consecutive_absences: 'Consecutive Absences'
    }
    return labels[type] || type
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SmartToy color="primary" />
        AI Attendance Anomaly Detection
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="error">
              {detectedAnomalies.filter(a => a.severity === 'critical').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Critical Issues
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              {detectedAnomalies.filter(a => a.severity === 'high').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Priority
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="info.main">
              {detectedAnomalies.filter(a => a.severity === 'medium').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Medium Priority
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="success.main">
              {Math.round((1 - detectedAnomalies.length / 10) * 100)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall Health Score
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Anomalies List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detected Anomalies ({detectedAnomalies.length})
          </Typography>
          
          {detectedAnomalies.length === 0 ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                No attendance anomalies detected. All employees are following regular attendance patterns.
              </Typography>
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Anomaly Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detectedAnomalies.map((anomaly) => (
                    <TableRow key={anomaly.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {anomaly.employee_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getAnomalyTypeLabel(anomaly.type)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getSeverityIcon(anomaly.severity)}
                          label={anomaly.severity.toUpperCase()}
                          color={getSeverityColor(anomaly.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={anomaly.confidence}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption">
                            {anomaly.confidence}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {anomaly.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedAnomaly(anomaly)
                              setDialogOpen(true)
                            }}
                          >
                            <Analytics />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Anomaly Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAnomaly && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Anomaly Details: {selectedAnomaly.employee_name}
                </Typography>
                <IconButton onClick={() => setDialogOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Alert severity={getSeverityColor(selectedAnomaly.severity) as any} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {getAnomalyTypeLabel(selectedAnomaly.type)}
                  </Typography>
                  <Typography variant="body2">
                    {selectedAnomaly.description}
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Chip
                    label={`${selectedAnomaly.confidence}% Confidence`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Detected: ${format(new Date(selectedAnomaly.detected_date), 'MMM dd, yyyy')}`}
                    variant="outlined"
                  />
                </Box>

                <Typography variant="h6" gutterBottom>
                  AI Recommendation
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2">
                    {selectedAnomaly.recommendation}
                  </Typography>
                </Paper>

                {selectedAnomaly.pattern_data && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Pattern Analysis
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      <pre style={{ fontSize: '0.875rem', margin: 0 }}>
                        {JSON.stringify(selectedAnomaly.pattern_data, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button variant="contained" color="primary">
                Create Action Plan
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default AIAttendanceAnalyzer
