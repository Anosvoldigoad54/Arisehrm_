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
  Avatar,
  Stack,
  Paper,
  Alert,
  Divider
} from '@mui/material'
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface ExpenseClaim {
  id: string
  employee_id: string
  title: string
  description: string
  category: string
  amount: number
  currency: string
  expense_date: string
  receipt_url?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'
  submitted_at?: string
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  created_at: string
  employee?: {
    full_name: string
    department: string
  }
  approver?: {
    full_name: string
  }
}

const EXPENSE_CATEGORIES = [
  { value: 'travel', label: 'Travel & Transportation' },
  { value: 'meals', label: 'Meals & Entertainment' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'training', label: 'Training & Development' },
  { value: 'communication', label: 'Communication' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' }
]

const ExpenseManagement: React.FC = () => {
  const { profile } = useAuth()
  const { isHR, isManager } = usePermissions()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState(0)
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<ExpenseClaim | null>(null)
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    description: '',
    category: 'travel',
    amount: 0,
    currency: 'USD',
    expense_date: new Date().toISOString().split('T')[0],
    receipt_file: null as File | null
  })

  // Fetch my expense claims
  const { data: myExpenses, isLoading } = useQuery({
    queryKey: ['my-expenses', profile?.employee_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_claims')
        .select(`
          *,
          approver:user_profiles!expense_claims_approved_by_fkey(full_name)
        `)
        .eq('employee_id', profile?.employee_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ExpenseClaim[]
    },
    enabled: !!profile?.employee_id
  })

  // Fetch pending approvals (for managers/HR)
  const { data: pendingApprovals } = useQuery({
    queryKey: ['pending-expense-approvals'],
    queryFn: async () => {
      let query = supabase
        .from('expense_claims')
        .select(`
          *,
          employee:user_profiles!expense_claims_employee_id_fkey(full_name, department)
        `)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: true })

      // Managers see only their team's expenses
      if (isManager() && !isHR()) {
        // Add team filter logic here
      }

      const { data, error } = await query
      if (error) throw error
      return data as ExpenseClaim[]
    },
    enabled: isManager() || isHR()
  })

  // Create expense claim mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      let receiptUrl = null

      // Upload receipt if provided
      if (data.receipt_file) {
        const fileExt = data.receipt_file.name.split('.').pop()
        const fileName = `${profile?.employee_id}-${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('expense-receipts')
          .upload(fileName, data.receipt_file)

        if (uploadError) throw uploadError
        receiptUrl = uploadData.path
      }

      const { error } = await supabase
        .from('expense_claims')
        .insert({
          employee_id: profile?.employee_id,
          title: data.title,
          description: data.description,
          category: data.category,
          amount: data.amount,
          currency: data.currency,
          expense_date: data.expense_date,
          receipt_url: receiptUrl,
          status: 'draft'
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-expenses'] })
      toast.success('Expense claim created successfully')
      setOpenCreate(false)
      resetForm()
    },
    onError: () => {
      toast.error('Failed to create expense claim')
    }
  })

  // Submit expense claim mutation
  const submitExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from('expense_claims')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', expenseId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-expenses'] })
      toast.success('Expense claim submitted for approval')
    },
    onError: () => {
      toast.error('Failed to submit expense claim')
    }
  })

  // Approve expense claim mutation
  const approveExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from('expense_claims')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: profile?.employee_id
        })
        .eq('id', expenseId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-expense-approvals'] })
      toast.success('Expense claim approved')
    },
    onError: () => {
      toast.error('Failed to approve expense claim')
    }
  })

  // Reject expense claim mutation
  const rejectExpenseMutation = useMutation({
    mutationFn: async ({ expenseId, reason }: { expenseId: string, reason: string }) => {
      const { error } = await supabase
        .from('expense_claims')
        .update({
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', expenseId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-expense-approvals'] })
      toast.success('Expense claim rejected')
    },
    onError: () => {
      toast.error('Failed to reject expense claim')
    }
  })

  const resetForm = () => {
    setExpenseForm({
      title: '',
      description: '',
      category: 'travel',
      amount: 0,
      currency: 'USD',
      expense_date: new Date().toISOString().split('T')[0],
      receipt_file: null
    })
  }

  const handleCreateExpense = () => {
    createExpenseMutation.mutate(expenseForm)
  }

  const handleSubmitExpense = (expenseId: string) => {
    submitExpenseMutation.mutate(expenseId)
  }

  const handleApproveExpense = (expenseId: string) => {
    approveExpenseMutation.mutate(expenseId)
  }

  const handleRejectExpense = (expenseId: string, reason: string) => {
    rejectExpenseMutation.mutate({ expenseId, reason })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'submitted': return 'warning'
      case 'paid': return 'info'
      default: return 'default'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const renderMyExpensesTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">My Expense Claims</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          New Expense
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {myExpenses?.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {expense.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {expense.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={expense.category} size="small" />
                </TableCell>
                <TableCell>
                  {formatCurrency(expense.amount, expense.currency)}
                </TableCell>
                <TableCell>
                  {new Date(expense.expense_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={expense.status}
                    color={getStatusColor(expense.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {expense.status === 'draft' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleSubmitExpense(expense.id)}
                      >
                        Submit
                      </Button>
                    )}
                    {expense.receipt_url && (
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    )}
                    {expense.status === 'draft' && (
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  const renderApprovalsTab = () => (
    <Box>
      <Typography variant="h6" mb={3}>Pending Approvals</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingApprovals?.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {expense.employee?.full_name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {expense.employee?.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {expense.employee?.department}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {expense.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {expense.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={expense.category} size="small" />
                </TableCell>
                <TableCell>
                  {formatCurrency(expense.amount, expense.currency)}
                </TableCell>
                <TableCell>
                  {expense.submitted_at && new Date(expense.submitted_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleApproveExpense(expense.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleRejectExpense(expense.id, 'Rejected by manager')}
                    >
                      Reject
                    </Button>
                    {expense.receipt_url && (
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Expense Management
      </Typography>
      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="My Expenses" />
          {(isManager() || isHR()) && <Tab label="Approvals" />}
          {isHR() && <Tab label="Reports" />}
        </Tabs>

        <CardContent>
          {activeTab === 0 && renderMyExpensesTab()}
          {activeTab === 1 && (isManager() || isHR()) && renderApprovalsTab()}
          {activeTab === 2 && isHR() && (
            <Alert severity="info">Expense reports coming soon...</Alert>
          )}
        </CardContent>
      </Card>
      {/* Create Expense Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Expense Claim</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Title"
                value={expenseForm.title}
                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
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
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
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
                type="number"
                label="Amount"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) })}
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
                label="Expense Date"
                InputLabelProps={{ shrink: true }}
                value={expenseForm.expense_date}
                onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ height: 56 }}
              >
                Upload Receipt
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setExpenseForm({ ...expenseForm, receipt_file: file })
                    }
                  }}
                />
              </Button>
              {expenseForm.receipt_file && (
                <Typography variant="caption" color="text.secondary">
                  {expenseForm.receipt_file.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            onClick={handleCreateExpense}
            variant="contained"
            disabled={!expenseForm.title || expenseForm.amount <= 0}
          >
            Create Expense
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExpenseManagement
