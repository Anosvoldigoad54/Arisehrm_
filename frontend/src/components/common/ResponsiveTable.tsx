import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Collapse,
  useTheme,
  alpha,
  Hidden,
} from '@mui/material'
import {
  ExpandMore,
  ExpandLess,
  MoreVert,
} from '@mui/icons-material'
import { useResponsive } from '../../hooks/useResponsive'

export interface ResponsiveTableColumn {
  id: string
  label: string
  align?: 'left' | 'center' | 'right'
  minWidth?: number
  priority?: 'high' | 'medium' | 'low' // Controls visibility on different screen sizes
  format?: (value: any) => React.ReactNode
  sortable?: boolean
}

export interface ResponsiveTableProps {
  columns: ResponsiveTableColumn[]
  rows: any[]
  loading?: boolean
  stickyHeader?: boolean
  maxHeight?: number | string
  onRowClick?: (row: any, index: number) => void
  renderMobileCard?: (row: any, index: number) => React.ReactNode
  emptyState?: React.ReactNode
}

export function ResponsiveTable({
  columns,
  rows,
  loading = false,
  stickyHeader = false,
  maxHeight,
  onRowClick,
  renderMobileCard,
  emptyState
}: ResponsiveTableProps) {
  const theme = useTheme()
  const responsive = useResponsive()
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const handleExpandRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  // Filter columns based on screen size and priority
  const getVisibleColumns = () => {
    if (responsive.isDesktop) return columns
    
    if (responsive.isTablet) {
      return columns.filter(col => col.priority !== 'low')
    }
    
    // Mobile: only show high priority columns
    return columns.filter(col => col.priority === 'high')
  }

  const visibleColumns = getVisibleColumns()

  // Mobile Card View
  const MobileCard = ({ row, index }: { row: any; index: number }) => {
    if (renderMobileCard) {
      return <>{renderMobileCard(row, index)}</>
    }

    const isExpanded = expandedRows.has(index)
    const highPriorityColumns = columns.filter(col => col.priority === 'high')
    const otherColumns = columns.filter(col => col.priority !== 'high')

    return (
      <Card 
        sx={{ 
          mb: 2, 
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': onRowClick ? {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-1px)',
          } : {},
          transition: 'all 0.2s ease'
        }}
        onClick={onRowClick ? () => onRowClick(row, index) : undefined}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={2}>
            {/* High Priority Fields - Always Visible */}
            {highPriorityColumns.map((column) => (
              <Box key={column.id}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {column.label}
                </Typography>
                <Typography variant="body2">
                  {column.format ? column.format(row[column.id]) : row[column.id]}
                </Typography>
              </Box>
            ))}

            {/* Expandable Section for Other Fields */}
            {otherColumns.length > 0 && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="primary">
                    {isExpanded ? 'Less Details' : 'More Details'}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExpandRow(index)
                    }}
                  >
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>

                <Collapse in={isExpanded}>
                  <Stack spacing={2} sx={{ pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    {otherColumns.map((column) => (
                      <Box key={column.id}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {column.label}
                        </Typography>
                        <Typography variant="body2">
                          {column.format ? column.format(row[column.id]) : row[column.id]}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Collapse>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    )
  }

  // Loading State
  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  // Empty State
  if (rows.length === 0) {
    return (
      <Box p={4} textAlign="center">
        {emptyState || <Typography color="text.secondary">No data available</Typography>}
      </Box>
    )
  }

  // Mobile View
  if (responsive.isMobile) {
    return (
      <Box>
        {rows.map((row, index) => (
          <MobileCard key={index} row={row} index={index} />
        ))}
      </Box>
    )
  }

  // Desktop/Tablet Table View
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        maxHeight,
        '& .MuiTableCell-head': {
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          fontWeight: 600,
        }
      }}
    >
      <Table stickyHeader={stickyHeader}>
        <TableHead>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                sx={{ 
                  minWidth: column.minWidth,
                  fontWeight: 600,
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              hover={!!onRowClick}
              sx={{ 
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick ? {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                } : {},
              }}
              onClick={onRowClick ? () => onRowClick(row, index) : undefined}
            >
              {visibleColumns.map((column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.format ? column.format(row[column.id]) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ResponsiveTable
