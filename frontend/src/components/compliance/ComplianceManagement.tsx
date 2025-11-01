import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  LinearProgress,
  Avatar,
  Stack,
  Paper,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Add as AddIcon,
  Policy as PolicyIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Security as SecurityIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface Policy {
  id: string
  title: string
  description: string
  category: string
  content: string
  version: string
  effective_date: string
  expiry_date?: string
  mandatory: boolean
  target_roles: string[]
  status: 'draft' | 'active' | 'expired'
  created_by: string
  created_at: string
  acknowledgments?: PolicyAcknowledgment[]
}

interface PolicyAcknowledgment {
  id: string
  policy_id: string
  employee_id: string
  acknowledged_at: string
  version: string
  employee?: {
    full_name: string
    department: string
  }
}

interface ComplianceTraining {
  id: string
  title: string
  description: string
  category: string
  mandatory: boolean
  deadline?: string
  status: 'active' | 'expired'
  completions?: TrainingCompletion[]
}

interface TrainingCompletion {
  id: string
  training_id: string
  employee_id: string
  completed_at: string
  score?: number
  certificate_url?: string
}

const POLICY_CATEGORIES = [
  { value: 'hr', label: 'HR Policies' },
  { value: 'security', label: 'Security & Privacy' },
  { value: 'safety', label: 'Health & Safety' },
  { value: 'code_of_conduct', label: 'Code of Conduct' },
  { value: 'financial', label: 'Financial Policies' },
  { value: 'it', label: 'IT Policies' },
  { value: 'legal', label: 'Legal & Compliance' }
]

const ComplianceManagement: React.FC = () => {
  const { profile } = useAuth()
  const { isHR, isAdmin } = usePermissions()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState(0)
  const [openCreatePolicy, setOpenCreatePolicy] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [policyForm, setPolicyForm] = useState({
    title: '',
    description: '',
    category: 'hr',
    content: '',
    version: '1.0',
    effective_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    mandatory: true,
    target_roles: [] as string[]
  })

  // Fetch policies
  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      let query = supabase
        .from('policies')
        .select(`
          *,
          acknowledgments:policy_acknowledgments(
            id,
            employee_id,
            acknowledged_at,
            version,
            employee:user_profiles(full_name, department)
          )
        `)
        .order('created_at', { ascending: false })

      // Non-HR users see only active policies
      if (!isHR()) {
        query = query.eq('status', 'active')
      }

      const { data, error } = await query
      if (error) throw error
      return data as Policy[]
    }
  })

  // Fetch my policy acknowledgments
  const { data: myAcknowledgments } = useQuery({
    queryKey: ['my-policy-acknowledgments', profile?.employee_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policy_acknowledgments')
        .select(`
          *,
          policy:policies(title, version, mandatory, category)
        `)
        .eq('employee_id', profile?.employee_id)
        .order('acknowledged_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!profile?.employee_id
  })

  // Fetch pending acknowledgments
  const { data: pendingAcknowledgments } = useQuery({
    queryKey: ['pending-acknowledgments', profile?.employee_id],
    queryFn: async () => {
      // Get active mandatory policies not yet acknowledged by user
      const { data: activePolicies, error } = await supabase
        .from('policies')
        .select(`
          id,
          title,
          category,
          version,
          effective_date,
          mandatory
        `)
        .eq('status', 'active')
        .eq('mandatory', true)

      if (error) throw error

      // Filter out already acknowledged policies
      const acknowledged = myAcknowledgments?.map(ack => ack.policy_id) || []
      return activePolicies?.filter(policy => !acknowledged.includes(policy.id)) || []
    },
    enabled: !!profile?.employee_id && !!myAcknowledgments
  })

  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('policies')
        .insert({
          ...data,
          created_by: profile?.employee_id,
          status: 'draft'
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast.success('Policy created successfully')
      setOpenCreatePolicy(false)
      resetForm()
    },
    onError: () => {
      toast.error('Failed to create policy')
    }
  })

  // Acknowledge policy mutation
  const acknowledgePolicyMutation = useMutation({
    mutationFn: async ({ policyId, version }: { policyId: string, version: string }) => {
      const { error } = await supabase
        .from('policy_acknowledgments')
        .insert({
          policy_id: policyId,
          employee_id: profile?.employee_id,
          version: version
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-policy-acknowledgments'] })
      queryClient.invalidateQueries({ queryKey: ['pending-acknowledgments'] })
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast.success('Policy acknowledged successfully')
    },
    onError: () => {
      toast.error('Failed to acknowledge policy')
    }
  })

  const resetForm = () => {
    setPolicyForm({
      title: '',
      description: '',
      category: 'hr',
      content: '',
      version: '1.0',
      effective_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      mandatory: true,
      target_roles: []
    })
  }

  const handleCreatePolicy = () => {
    createPolicyMutation.mutate(policyForm)
  }

  const handleAcknowledgePolicy = (policyId: string, version: string) => {
    acknowledgePolicyMutation.mutate({ policyId, version })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'expired': return 'error'
      default: return 'default'
    }
  }

  const isAcknowledged = (policyId: string) => {
    return myAcknowledgments?.some(ack => ack.policy_id === policyId)
  }

  const getAcknowledgmentStats = (policy: Policy) => {
    const total = policy.acknowledgments?.length || 0
    // In real implementation, calculate total eligible employees
    const eligible = 100 // Placeholder
    return { acknowledged: total, total: eligible }
  }

  const renderPoliciesTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Company Policies</Typography>
        {isHR() && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreatePolicy(true)}
          >
            Create Policy
          </Button>
        )}
      </Box>

      {pendingAcknowledgments && pendingAcknowledgments.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have {pendingAcknowledgments.length} policies requiring acknowledgment
        </Alert>
      )}

      <Grid container spacing={3}>
        {policies?.map((policy) => (
          <Grid key={policy.id} size={12}>
            <Card 
              sx={{ 
                border: policy.mandatory && !isAcknowledged(policy.id) ? '2px solid #ff9800' : 'none',
                backgroundColor: policy.mandatory && !isAcknowledged(policy.id) ? 'rgba(255, 152, 0, 0.05)' : 'inherit'
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {policy.title}
                      </Typography>
                      <Chip
                        label={policy.category}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={policy.status}
                        color={getStatusColor(policy.status) as any}
                        size="small"
                      />
                      {policy.mandatory && (
                        <Chip
                          icon={<WarningIcon />}
                          label="Mandatory"
                          color="warning"
                          size="small"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {policy.description}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Typography variant="body2">
                        Version {policy.version} • Effective: {new Date(policy.effective_date).toLocaleDateString()}
                      </Typography>
                      {policy.expiry_date && (
                        <Typography variant="body2" color="text.secondary">
                          Expires: {new Date(policy.expiry_date).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                      {policy.mandatory && (
                        <>
                          {isAcknowledged(policy.id) ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Acknowledged"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              onClick={() => handleAcknowledgePolicy(policy.id, policy.version)}
                            >
                              Acknowledge Required
                            </Button>
                          )}
                        </>
                      )}
                      
                      {isHR() && (
                        <Typography variant="body2" color="text.secondary">
                          {getAcknowledgmentStats(policy).acknowledged} / {getAcknowledgmentStats(policy).total} acknowledged
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box display="flex" gap={1}>
                    <IconButton size="small" onClick={() => setSelectedPolicy(policy)}>
                      <ViewIcon />
                    </IconButton>
                    {isHR() && (
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )

  const renderComplianceTab = () => (
    <Box>
      <Typography variant="h6" mb={3}>Compliance Dashboard</Typography>
      
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <SecurityIcon color="primary" />
                <Typography variant="h6">Policy Compliance</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {myAcknowledgments?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Policies Acknowledged
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <WarningIcon color="warning" />
                <Typography variant="h6">Pending Actions</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {pendingAcknowledgments?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Policies Requiring Action
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AssignmentIcon color="success" />
                <Typography variant="h6">Training Complete</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compliance Trainings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {pendingAcknowledgments && pendingAcknowledgments.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" mb={2}>Action Required</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Policy</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Effective Date</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingAcknowledgments.map((policy: any) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {policy.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={policy.category} size="small" />
                    </TableCell>
                    <TableCell>
                      {new Date(policy.effective_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        onClick={() => handleAcknowledgePolicy(policy.id, policy.version)}
                      >
                        Acknowledge
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  )

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Compliance Management
      </Typography>
      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Policies" />
          <Tab label="My Compliance" />
          {isHR() && <Tab label="Reports" />}
        </Tabs>

        <CardContent>
          {activeTab === 0 && renderPoliciesTab()}
          {activeTab === 1 && renderComplianceTab()}
          {activeTab === 2 && isHR() && (
            <Alert severity="info">Compliance reports coming soon...</Alert>
          )}
        </CardContent>
      </Card>
      {/* Create Policy Dialog */}
      <Dialog open={openCreatePolicy} onClose={() => setOpenCreatePolicy(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Policy</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Policy Title"
                value={policyForm.title}
                onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={policyForm.description}
                onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Policy Content"
                value={policyForm.content}
                onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={policyForm.category}
                  onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                >
                  {POLICY_CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label="Version"
                value={policyForm.version}
                onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                type="date"
                label="Effective Date"
                InputLabelProps={{ shrink: true }}
                value={policyForm.effective_date}
                onChange={(e) => setPolicyForm({ ...policyForm, effective_date: e.target.value })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date (Optional)"
                InputLabelProps={{ shrink: true }}
                value={policyForm.expiry_date}
                onChange={(e) => setPolicyForm({ ...policyForm, expiry_date: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={policyForm.mandatory}
                    onChange={(e) => setPolicyForm({ ...policyForm, mandatory: e.target.checked })}
                  />
                }
                label="Mandatory Acknowledgment"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreatePolicy(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePolicy}
            variant="contained"
            disabled={!policyForm.title || !policyForm.content}
          >
            Create Policy
          </Button>
        </DialogActions>
      </Dialog>
      {/* Policy View Dialog */}
      <Dialog open={!!selectedPolicy} onClose={() => setSelectedPolicy(null)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedPolicy?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {selectedPolicy?.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPolicy(null)}>Close</Button>
          {selectedPolicy?.mandatory && !isAcknowledged(selectedPolicy.id) && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                handleAcknowledgePolicy(selectedPolicy.id, selectedPolicy.version)
                setSelectedPolicy(null)
              }}
            >
              Acknowledge
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ComplianceManagement
