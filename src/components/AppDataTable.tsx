import React, { useState, useEffect, useRef } from 'react'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Button, Checkbox, IconButton, Pagination, CircularProgress, Divider, TextField, List, ListItem, ListItemIcon, ListItemText, Menu, FormGroup, FormControlLabel } from '@mui/material'
import { ArrowUpward, ArrowDownward, ViewColumn, Search } from '@mui/icons-material'


interface AppDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  expandedRows?: Set<string>
  setExpandedRows?: (rows: Set<string>) => void
  tableName?: string
  initialColumnVisibility?: Record<string, boolean>
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  pageSize?: number
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  totalPages?: number
  currentPage?: number
  manualPagination?: boolean
}

export default function AppDataTable<T>({
  data,
  columns,
  isLoading,
  expandedRows = new Set(),
  setExpandedRows = () => { },
  tableName = 'default',
  initialColumnVisibility = {},
  sorting = [],
  onSortingChange = () => { },
  pagination = { pageIndex: 0, pageSize: 20 },
  onPaginationChange = () => { },
  totalPages = 1,
  manualPagination = false
}: AppDataTableProps<T>) {


  const LOCAL_STORAGE_KEY = tableName + '_columnVisibility';

  // Восстанавливаем состояние из localStorage при инициализации
  const [columnVisibility, setColumnVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      return saved ? JSON.parse(saved) : initialColumnVisibility
    } catch {
      return initialColumnVisibility;
    }
  });

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(columnVisibility));
    } catch { }
  }, [columnVisibility, LOCAL_STORAGE_KEY]);


  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      onSortingChange(newSorting)
    },
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: manualPagination,
    rowCount: totalPages,
    state: {
      sorting,
      pagination,
      columnVisibility,
    },
  })

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', flexGrow: 1 }}>
      <CircularProgress />
    </Box>
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', marginBottom: 2, position: 'relative', }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ fontSize: 16, marginRight: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 200 }}
        />
        <Divider orientation="vertical" flexItem />
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{ marginBottom: 1 }}
        >
          <ViewColumn />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              sx: {
                minWidth: 300,
                padding: 0
                // maxHeight: 300
              }
            }
          }}
        >
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            <FormGroup sx={{ px: 2 }}>
              {table.getAllLeafColumns().map(column => (
                <FormControlLabel
                  key={column.id}
                  control={
                    <Checkbox
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      size="medium"
                    />
                  }
                  label={typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                  sx={{ marginBottom: 0 }}
                  slotProps={{
                    typography: { variant: 'body2' }
                  }}
                />
              ))}
            </FormGroup>
          </Box>
          <Divider />
          <Box sx={{ px: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={table.getAllLeafColumns().every(column => column.getIsVisible())}
                  indeterminate={!table.getAllLeafColumns().every(column => column.getIsVisible()) && table.getAllLeafColumns().some(column => column.getIsVisible())}
                  onChange={(e) => {
                    if (e.target.checked) {
                      table.toggleAllColumnsVisible(true)
                    } else {
                      table.toggleAllColumnsVisible(false)
                    }
                  }}
                  size="medium"
                />
              }
              label="Show/Hide All"
              sx={{ marginBottom: 0, whiteSpace: 'nowrap' }}
              slotProps={{
                typography: { variant: 'body2' }
              }}
            />
          </Box>
        </Menu>
      </Box>
      <TableContainer component={Box} sx={{
        width: '100%'
      }}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort()
                  const sortDirection = header.column.getIsSorted()

                  return (
                    <TableCell
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      sx={{
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none'
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <IconButton
                          size="small"
                          onClick={header.column.getToggleSortingHandler()}
                          sx={{ padding: 0.5, marginLeft: 0.5 }}
                        >
                          {sortDirection === 'asc' ? <ArrowUpward sx={{ fontSize: 16 }} /> : sortDirection === 'desc' ? <ArrowDownward sx={{ fontSize: 16 }} /> : <ArrowUpward sx={{ fontSize: 16, opacity: 0.3 }} />}
                        </IconButton>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                <TableRow>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {expandedRows.has((row.original as any).id?.toString() || '') && (
                  <TableRow>
                    <TableCell colSpan={columns.length} sx={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2">
                          Детальная информация
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Pagination
          count={totalPages}
          page={pagination.pageIndex + 1}
          onChange={(_event, page) => {
            onPaginationChange({ pageIndex: page - 1, pageSize: pagination.pageSize })
          }}
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  )
} 