'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  CheckCircle,
  Warning,
  PlayArrow,
  Refresh,
  Info,
  Storage,
  People,
  Business,
  Assignment,
  NetworkCheck,
} from '@mui/icons-material'
import { toast } from 'sonner'
import { initializeCompleteDatabase } from '../../utils/initializeDatabase'
import { validateDatabaseConnection, checkDataInitializationStatus } from '../../utils/databaseValidator'
import { testAllDataFlows } from '../../utils/dataFlowTester'

interface DatabaseStatus {
  hasData: boolean
  companies: number
  departments: number
  roles: number
  positions: number
  leaveTypes: number
  userProfiles: number
}

export function DatabaseAdminPanel() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [validationResults, setValidationResults] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>(null)

  const checkDatabaseStatus = async () => {
    setLoading(true)
    try {
      // Run comprehensive validation
      const [connectionResult, initStatusResult] = await Promise.all([
        validateDatabaseConnection(),
        checkDataInitializationStatus()
      ])

      setValidationResults({
        connection: connectionResult,
        initialization: initStatusResult
      })

      // Extract counts for existing status display
      if (initStatusResult.success && initStatusResult.details) {
        const counts = initStatusResult.details.reduce((acc, detail) => {
          const match = detail.match(/(\w+): (\d+)/)
          if (match) {
            const [, key, value] = match
            acc[key.toLowerCase()] = parseInt(value)
          }
          return acc
        }, {} as any)

        const statusData: DatabaseStatus = {
          hasData: (counts.companies || 0) > 0 && (counts.departments || 0) > 0,
          companies: counts.companies || 0,
          departments: counts.departments || 0,
          roles: counts.roles || 0,
          positions: counts.positions || 0,
          leaveTypes: counts['leave types'] || 0,
          userProfiles: counts['user profiles'] || 0
        }

        setStatus(statusData)
      }

      if (connectionResult.success) {
        toast.success('Database validation completed')
      } else {
        toast.error('Database validation found issues')
      }
    } catch (error) {
      toast.error('Failed to check database status')
      setValidationResults({
        connection: { success: false, message: 'Connection failed', errors: [error.message] }
      })
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setLoading(true)
    try {
      const result = await initializeCompleteDatabase()
      
      if (result.success) {
        setLastAction('Database initialized successfully')
        await checkDatabaseStatus()
        toast.success('Database initialized!', {
          description: 'Sample data has been created'
        })
      } else {
        toast.error('Database initialization failed', {
          description: result.error
        })
      }
    } catch (error) {
      toast.error('Database initialization failed')
    } finally {
      setLoading(false)
    }
  }

  const StatusChip = ({ value, label, color }: { 
    value: number
    label: string
    color: 'success' | 'warning' | 'error' | 'default'
  }) => (
    <Chip
      label={`${label}: ${value}`}
      color={color}
      size="small"
      icon={value > 0 ? <CheckCircle /> : <Warning />}
    />
  )

  React.useEffect(() => {
    checkDatabaseStatus()
  }, [])

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Storage sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Database Administration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Initialize and manage your HRM database
                </Typography>
              </Box>
            </Stack>

            {/* Status Alert */}
            {status && (
              <Alert 
                severity={status.hasData ? 'success' : 'warning'}
                icon={status.hasData ? <CheckCircle /> : <Warning />}
              >
                <Typography variant="body2">
                  {status.hasData 
                    ? 'Database is initialized and ready to use' 
                    : 'Database needs initialization - no master data found'
                  }
                </Typography>
              </Alert>
            )}

            {/* Last Action */}
            {lastAction && (
              <Alert severity="info" icon={<Info />}>
                <Typography variant="body2">{lastAction}</Typography>
              </Alert>
            )}

            {/* Status Overview */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Database Status
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {status ? (
                  <>
                    <StatusChip 
                      value={status.companies} 
                      label="Companies" 
                      color={status.companies > 0 ? 'success' : 'warning'} 
                    />
                    <StatusChip 
                      value={status.departments} 
                      label="Departments" 
                      color={status.departments > 0 ? 'success' : 'warning'} 
                    />
                    <StatusChip 
                      value={status.roles} 
                      label="Roles" 
                      color={status.roles > 0 ? 'success' : 'warning'} 
                    />
                    <StatusChip 
                      value={status.positions} 
                      label="Positions" 
                      color={status.positions > 0 ? 'success' : 'warning'} 
                    />
                    <StatusChip 
                      value={status.leaveTypes} 
                      label="Leave Types" 
                      color={status.leaveTypes > 0 ? 'success' : 'warning'} 
                    />
                    <StatusChip 
                      value={status.userProfiles} 
                      label="Users" 
                      color={status.userProfiles > 0 ? 'success' : 'error'} 
                    />
                  </>
                ) : (
                  <CircularProgress size={24} />
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Validation Results */}
            {validationResults && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Database Validation
                </Typography>

                {/* Connection Status */}
                <Alert
                  severity={validationResults.connection?.success ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Connection: {validationResults.connection?.message}
                  </Typography>
                  {validationResults.connection?.details && (
                    <Box sx={{ mt: 1 }}>
                      {validationResults.connection.details.map((detail: string, index: number) => (
                        <Typography key={index} variant="caption" display="block">
                          {detail}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  {validationResults.connection?.errors && (
                    <Box sx={{ mt: 1 }}>
                      {validationResults.connection.errors.map((error: string, index: number) => (
                        <Typography key={index} variant="caption" display="block" color="error">
                          {error}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Alert>

                {/* Initialization Status */}
                {validationResults.initialization && (
                  <Alert
                    severity={validationResults.initialization.success ? 'info' : 'warning'}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Data Status: {validationResults.initialization.message}
                    </Typography>
                    {validationResults.initialization.details && (
                      <Box sx={{ mt: 1 }}>
                        {validationResults.initialization.details.map((detail: string, index: number) => (
                          <Typography key={index} variant="caption" display="block">
                            {detail}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Alert>
                )}
              </Box>
            )}

            {/* Data Flow Test Results */}
            {testResults && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Data Flow Test Results
                </Typography>

                <Alert
                  severity={testResults.overallSuccess ? 'success' : 'warning'}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Overall Status: {testResults.totalPassed}/{testResults.totalTests} tests passed
                    ({Math.round((testResults.totalPassed / testResults.totalTests) * 100)}%)
                  </Typography>
                </Alert>

                {testResults.suites?.map((suite: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {suite.name}: {suite.passedTests}/{suite.totalTests}
                      {suite.success ? ' ✅' : ' ⚠️'}
                    </Typography>

                    {suite.results?.map((result: any, resultIndex: number) => (
                      <Typography
                        key={resultIndex}
                        variant="caption"
                        display="block"
                        color={result.success ? 'success.main' : 'error.main'}
                        sx={{ ml: 2 }}
                      >
                        {result.success ? '✅' : '❌'} {result.method}: {result.message}
                        {result.dataCount !== undefined && ` (${result.dataCount} records)`}
                        {result.error && ` - ${result.error}`}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Box>
            )}

            <Divider />

            {/* Initialization Info */}
            <Box>
              <Typography variant="h6" gutterBottom>
                What gets initialized?
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Business fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Company Setup" 
                    secondary="Creates your organization profile and settings"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <People fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Departments & Roles" 
                    secondary="Sets up organizational structure and permission roles"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assignment fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Positions & Leave Types" 
                    secondary="Creates job positions and leave management configuration"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Storage fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="System Configuration" 
                    secondary="Sets up workflows, permissions, and default settings"
                  />
                </ListItem>
              </List>
            </Box>

            <Divider />

            {/* Actions */}
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                onClick={initializeDatabase}
                disabled={loading}
                color="primary"
              >
                {loading ? 'Initializing...' : 'Initialize Database'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={checkDatabaseStatus}
                disabled={loading}
              >
                Validate & Refresh
              </Button>

              <Button
                variant="outlined"
                startIcon={<NetworkCheck />}
                onClick={async () => {
                  setLoading(true)
                  try {
                    const result = await validateDatabaseConnection()
                    if (result.success) {
                      toast.success('Database connection successful!')
                    } else {
                      toast.error('Database connection failed')
                    }
                    setValidationResults({ connection: result })
                  } catch (error) {
                    toast.error('Connection test failed')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                color="info"
              >
                Test Connection
              </Button>

              <Button
                variant="outlined"
                startIcon={<Assignment />}
                onClick={async () => {
                  setLoading(true)
                  try {
                    const result = await testAllDataFlows()
                    setTestResults(result)
                  } catch (error) {
                    toast.error('Data flow test failed')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                color="secondary"
              >
                Test Data Flow
              </Button>
            </Stack>

            {/* Warning */}
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Note:</strong> This will only create sample data if your database is empty. 
                Existing data will not be affected.
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default DatabaseAdminPanel