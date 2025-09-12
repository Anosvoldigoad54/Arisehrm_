import React, { memo, useMemo, useCallback, useState, useRef } from 'react'
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Checkbox,
  useTheme,
  alpha,
  TableSortLabel,
  Skeleton
} from '@mui/material'
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material'
import { FixedSizeList as List } from 'react-window'
import { useVirtualization } from '../../hooks/useVirtualization'
import { useTableData } from '../../hooks/usePerformance'

interface Column<T> {
  id: keyof T | string
  label: string
  width?: number | string
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: T, index: number) => React.ReactNode
  headerRender?: () => React.ReactNode
  sticky?: boolean
  resizable?: boolean
}

interface VirtualizedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  height?: number
  rowHeight?: number
  overscan?: number
  selectable?: boolean
  selectedRows?: Set<string | number>
  onRowSelect?: (rowId: string | number, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  sortable?: boolean
  onSort?: (column: keyof T | string, direction: 'asc' | 'desc') => void
  sortColumn?: keyof T | string
  sortDirection?: 'asc' | 'desc'
  onRowClick?: (row: T, index: number) => void
  onRowDoubleClick?: (row: T, index: number) => void
  getRowId?: (row: T, index: number) => string | number
  className?: string
  loading?: boolean
  emptyMessage?: string
  stickyHeader?: boolean
  striped?: boolean
  hover?: boolean
  dense?: boolean
  virtualized?: boolean
  searchQuery?: string
  filterFn?: (row: T, query: string) => boolean
  itemsPerPage?: number
}

// Row component for virtualization
const TableRowComponent = memo(<T,>({
  index,
  style,
  data
}: {
  index: number
  style: React.CSSProperties
  data: {
    items: T[]
    columns: Column<T>[]
    selectedRows: Set<string | number>
    onRowSelect?: (rowId: string | number, selected: boolean) => void
    onRowClick?: (row: T, index: number) => void
    onRowDoubleClick?: (row: T, index: number) => void
    getRowId: (row: T, index: number) => string | number
    selectable: boolean
    hover: boolean
    striped: boolean
  }
}) => {
  const theme = useTheme()
  const {
    items,
    columns,
    selectedRows,
    onRowSelect,
    onRowClick,
    onRowDoubleClick,
    getRowId,
    selectable,
    hover,
    striped
  } = data

  const row = items[index]
  if (!row) return null

  const rowId = getRowId(row, index)
  const isSelected = selectedRows.has(rowId)

  const handleRowClick = useCallback(() => {
    onRowClick?.(row, index)
  }, [row, index, onRowClick])

  const handleRowDoubleClick = useCallback(() => {
    onRowDoubleClick?.(row, index)
  }, [row, index, onRowDoubleClick])

  const handleSelectChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onRowSelect?.(rowId, event.target.checked)
  }, [rowId, onRowSelect])

  return (
    <div style={style}>
      <TableRow
        selected={isSelected}
        onClick={handleRowClick}
        onDoubleClick={handleRowDoubleClick}
        sx={{
          cursor: onRowClick ? 'pointer' : 'default',
          backgroundColor: striped && index % 2 === 1 
            ? alpha(theme.palette.action.hover, 0.04) 
            : 'transparent',
          '&:hover': hover ? {
            backgroundColor: alpha(theme.palette.action.hover, 0.08)
          } : {},
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.16)
            }
          }
        }}
      >
        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={isSelected}
              onChange={handleSelectChange}
              size="small"
            />
          </TableCell>
        )}
        {columns.map((column, columnIndex) => {
          const value = typeof column.id === 'string' && column.id.includes('.')
            ? column.id.split('.').reduce((obj: any, key) => obj?.[key], row)
            : (row as any)[column.id]

          return (
            <TableCell
              key={`${rowId}-${columnIndex}`}
              align={column.align}
              sx={{
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.width,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {column.render ? column.render(value, row, index) : String(value || '')}
            </TableCell>
          )
        })}
      </TableRow>
    </div>
  )
})

TableRowComponent.displayName = 'TableRowComponent'

// Main VirtualizedTable component
export const VirtualizedTable = memo(<T,>({
  data,
  columns,
  height = 400,
  rowHeight = 52,
  overscan = 5,
  selectable = false,
  selectedRows = new Set(),
  onRowSelect,
  onSelectAll,
  sortable = true,
  onSort,
  sortColumn,
  sortDirection = 'asc',
  onRowClick,
  onRowDoubleClick,
  getRowId = (row, index) => index,
  className,
  loading = false,
  emptyMessage = 'No data available',
  stickyHeader = true,
  striped = false,
  hover = true,
  dense = false,
  virtualized = true,
  searchQuery = '',
  filterFn,
  itemsPerPage = 1000
}: VirtualizedTableProps<T>) => {
  const theme = useTheme()

  // Process data with search, sort, and pagination
  const processedData = useTableData(
    data,
    searchQuery,
    sortColumn && sortDirection ? {
      key: sortColumn,
      direction: sortDirection
    } : null,
    filterFn,
    virtualized ? data.length : itemsPerPage // No pagination for virtualized
  )

  const displayData = virtualized ? processedData.sortedData : processedData.paginatedItems

  // Virtualization setup
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle sort
  const handleSort = useCallback((column: Column<T>) => {
    if (!column.sortable || !onSort) return

    const newDirection = sortColumn === column.id && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(column.id, newDirection)
  }, [sortColumn, sortDirection, onSort])

  // Handle select all
  const handleSelectAll = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll?.(event.target.checked)
  }, [onSelectAll])

  // Check if all rows are selected
  const isAllSelected = useMemo(() => {
    return displayData.length > 0 && displayData.every((row, index) => 
      selectedRows.has(getRowId(row, index))
    )
  }, [displayData, selectedRows, getRowId])

  const isIndeterminate = useMemo(() => {
    const selectedCount = displayData.filter((row, index) => 
      selectedRows.has(getRowId(row, index))
    ).length
    return selectedCount > 0 && selectedCount < displayData.length
  }, [displayData, selectedRows, getRowId])

  // Loading skeleton
  if (loading) {
    return (
      <TableContainer component={Paper} className={className}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && <TableCell padding="checkbox" />}
              {columns.map((column, index) => (
                <TableCell key={index} align={column.align}>
                  <Skeleton variant="text" width="80%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: Math.min(10, Math.floor(height / rowHeight)) }).map((_, index) => (
              <TableRow key={index}>
                {selectable && <TableCell padding="checkbox"><Skeleton variant="circular" width={20} height={20} /></TableCell>}
                {columns.map((_, columnIndex) => (
                  <TableCell key={columnIndex}>
                    <Skeleton variant="text" width="90%" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  // Empty state
  if (displayData.length === 0) {
    return (
      <TableContainer component={Paper} className={className}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && <TableCell padding="checkbox" />}
              {columns.map((column, index) => (
                <TableCell key={index} align={column.align}>
                  {column.headerRender ? column.headerRender() : column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={height - 100}
          flexDirection="column"
        >
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {emptyMessage}
          </Typography>
        </Box>
      </TableContainer>
    )
  }

  // Virtualized table
  if (virtualized) {
    return (
      <TableContainer component={Paper} className={className} ref={containerRef}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    size="small"
                  />
                </TableCell>
              )}
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  align={column.align}
                  sortDirection={sortColumn === column.id ? sortDirection : false}
                  sx={{
                    width: column.width,
                    minWidth: column.minWidth,
                    position: column.sticky ? 'sticky' : 'relative',
                    left: column.sticky ? 0 : 'auto',
                    zIndex: column.sticky ? 1 : 'auto',
                    backgroundColor: column.sticky ? theme.palette.background.paper : 'transparent'
                  }}
                >
                  {column.sortable && sortable ? (
                    <TableSortLabel
                      active={sortColumn === column.id}
                      direction={sortColumn === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column)}
                    >
                      {column.headerRender ? column.headerRender() : column.label}
                    </TableSortLabel>
                  ) : (
                    column.headerRender ? column.headerRender() : column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
        <Box height={height - (stickyHeader ? 56 : 0)}>
          <List
            height={height - (stickyHeader ? 56 : 0)}
            itemCount={displayData.length}
            itemSize={rowHeight}
            overscanCount={overscan}
            itemData={{
              items: displayData,
              columns,
              selectedRows,
              onRowSelect,
              onRowClick,
              onRowDoubleClick,
              getRowId,
              selectable,
              hover,
              striped
            }}
          >
            {TableRowComponent}
          </List>
        </Box>
      </TableContainer>
    )
  }

  // Regular table (non-virtualized)
  return (
    <TableContainer component={Paper} className={className} sx={{ maxHeight: height }}>
      <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  size="small"
                />
              </TableCell>
            )}
            {columns.map((column, index) => (
              <TableCell
                key={index}
                align={column.align}
                sortDirection={sortColumn === column.id ? sortDirection : false}
                sx={{
                  width: column.width,
                  minWidth: column.minWidth,
                  position: column.sticky ? 'sticky' : 'relative',
                  left: column.sticky ? 0 : 'auto',
                  zIndex: column.sticky ? 1 : 'auto',
                  backgroundColor: column.sticky ? theme.palette.background.paper : 'transparent'
                }}
              >
                {column.sortable && sortable ? (
                  <TableSortLabel
                    active={sortColumn === column.id}
                    direction={sortColumn === column.id ? sortDirection : 'asc'}
                    onClick={() => handleSort(column)}
                  >
                    {column.headerRender ? column.headerRender() : column.label}
                  </TableSortLabel>
                ) : (
                  column.headerRender ? column.headerRender() : column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayData.map((row, index) => {
            const rowId = getRowId(row, index)
            const isSelected = selectedRows.has(rowId)

            return (
              <TableRow
                key={rowId}
                selected={isSelected}
                onClick={() => onRowClick?.(row, index)}
                onDoubleClick={() => onRowDoubleClick?.(row, index)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  backgroundColor: striped && index % 2 === 1 
                    ? alpha(theme.palette.action.hover, 0.04) 
                    : 'transparent',
                  '&:hover': hover ? {
                    backgroundColor: alpha(theme.palette.action.hover, 0.08)
                  } : {},
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.16)
                    }
                  }
                }}
              >
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => onRowSelect?.(rowId, event.target.checked)}
                      size="small"
                    />
                  </TableCell>
                )}
                {columns.map((column, columnIndex) => {
                  const value = typeof column.id === 'string' && column.id.includes('.')
                    ? column.id.split('.').reduce((obj: any, key) => obj?.[key], row)
                    : (row as any)[column.id]

                  return (
                    <TableCell
                      key={`${rowId}-${columnIndex}`}
                      align={column.align}
                      sx={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.width,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {column.render ? column.render(value, row, index) : String(value || '')}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
})

VirtualizedTable.displayName = 'VirtualizedTable'

export default VirtualizedTable

// Type exports for easier usage
export type { Column, VirtualizedTableProps }
