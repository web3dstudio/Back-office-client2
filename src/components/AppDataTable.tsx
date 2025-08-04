import React, { useState, useEffect, useRef } from 'react'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Button, Checkbox, IconButton, Pagination } from '@mui/material'
import { ArrowUpward, ArrowDownward } from '@mui/icons-material'

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


  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне меню
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnsDropdown(false);
      }
    }
    if (showColumnsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnsDropdown]);

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
    return <Typography>Loading...</Typography>
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2, position: 'relative' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowColumnsDropdown((v) => !v)}
          sx={{ marginBottom: 1 }}
        >
          Columns
        </Button>
        {showColumnsDropdown && (
          <Box
            ref={dropdownRef}
            sx={{
              position: 'absolute',
              right: 0,
              top: '100%',
              zIndex: 10,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 1,
              padding: 1,
              minWidth: 160,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {table.getAllLeafColumns().map(column => (
              <Box key={column.id} sx={{ display: 'block', marginBottom: 0.5 }}>
                <Checkbox
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  size="small"
                />
                <Typography variant="body2" component="span">
                  {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <TableContainer component={Paper} sx={{ width: '100%' }}>
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