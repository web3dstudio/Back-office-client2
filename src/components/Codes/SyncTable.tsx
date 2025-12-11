import React, { useState, useEffect } from 'react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Box, CircularProgress, Pagination, IconButton, Menu, FormGroup, FormControlLabel, Checkbox, Divider, Button } from '@mui/material'
import { ViewColumn } from '@mui/icons-material'

interface SyncTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  tableName?: string
  columnGroups?: Array<{ label: string; startIndex: number; endIndex: number; hasBackground?: boolean }>
  getRowSx?: (row: T) => any
}

export default function SyncTable<T>({ data, columns, isLoading, tableName = 'syncTable', columnGroups, getRowSx }: SyncTableProps<T>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const LOCAL_STORAGE_KEY = tableName + '_columnVisibility'

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(columnVisibility))
    } catch { }
  }, [columnVisibility, LOCAL_STORAGE_KEY])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [savedColumnVisibility, setSavedColumnVisibility] = useState<Record<string, boolean>>({})

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setSavedColumnVisibility(columnVisibility)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleReset = () => {
    setColumnVisibility(savedColumnVisibility)
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
      columnVisibility,
    },
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '200px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
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
                      disabled={!column.getCanHide()}
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
          <Box sx={{ px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <Button
              size="small"
              onClick={handleReset}
              sx={{ minWidth: 'auto', padding: '4px 8px' }}
            >
              Reset
            </Button>
          </Box>
        </Menu>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            {columnGroups && columnGroups.length > 0 && (
              <TableRow>
                {(() => {
                  const visibleColumns = table.getVisibleLeafColumns()
                  const allColumns = table.getAllColumns()
                  const cells: React.ReactNode[] = []
                  let visibleIndex = 0

                  columnGroups.forEach((group, groupIndex) => {
                    // Находим видимые колонки в диапазоне группы
                    const groupVisibleColumns = visibleColumns.filter((col) => {
                      const colIndex = allColumns.findIndex(c => c.id === col.id)
                      return colIndex >= group.startIndex && colIndex <= group.endIndex
                    })

                    // Добавляем пустую ячейку для пропуска видимых колонок перед группой
                    if (visibleIndex < visibleColumns.length) {
                      const beforeGroup = visibleColumns.slice(visibleIndex).filter((col) => {
                        const colIndex = allColumns.findIndex(c => c.id === col.id)
                        return colIndex < group.startIndex
                      })
                      if (beforeGroup.length > 0) {
                        cells.push(
                          <TableCell
                            key={`gap-${groupIndex}`}
                            colSpan={beforeGroup.length}
                            sx={{ border: 'none' }}
                          />
                        )
                        visibleIndex += beforeGroup.length
                      }
                    }

                    // Добавляем ячейку с заголовком группы
                    if (groupVisibleColumns.length > 0) {
                      cells.push(
                        <TableCell
                          key={`group-${groupIndex}`}
                          colSpan={groupVisibleColumns.length}
                          sx={{
                            textAlign: 'center',
                            fontWeight: 'bold',
                            borderBottom: '1px solid rgba(224, 224, 224, 1)'
                          }}
                        >
                          {group.label}
                        </TableCell>
                      )
                      visibleIndex += groupVisibleColumns.length
                    }
                  })

                  // Добавляем пустую ячейку для оставшихся видимых колонок
                  const remaining = visibleColumns.length - visibleIndex
                  if (remaining > 0) {
                    cells.push(
                      <TableCell
                        key="gap-end"
                        colSpan={remaining}
                        sx={{ border: 'none' }}
                      />
                    )
                  }

                  return cells
                })()}
              </TableRow>
            )}
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnIndex = table.getAllColumns().findIndex(col => col.id === header.column.id)
                  const group = columnGroups?.find(group =>
                    columnIndex >= group.startIndex && columnIndex <= group.endIndex
                  )
                  const hasBackground = group?.hasBackground !== false && group !== undefined
                  return (
                    <TableCell
                      key={header.id}
                      sx={{
                        width: header.getSize(),
                        minWidth: 'unset !important',
                        maxWidth: 'unset !important',
                        backgroundColor: hasBackground ? 'rgba(0, 0, 0, 0.05)' : 'transparent'
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map(row => {
              const hasInnerCode = (row.original as any).innerCode
              return (
                <TableRow
                  key={row.id}
                  sx={{
                    ...(getRowSx ? getRowSx(row.original) : {}),
                    backgroundColor: getRowSx ? (getRowSx(row.original)?.backgroundColor || 'transparent') : (!hasInnerCode ? 'rgba(255, 0, 0, 0.1)' : 'transparent')
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnIndex = table.getAllColumns().findIndex(col => col.id === cell.column.id)
                    const group = columnGroups?.find(group =>
                      columnIndex >= group.startIndex && columnIndex <= group.endIndex
                    )
                    const hasBackground = group?.hasBackground !== false && group !== undefined
                    return (
                      <TableCell
                        key={cell.id}
                        sx={{
                          width: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                          minWidth: 'unset !important',
                          paddingTop: 0,
                          paddingBottom: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          backgroundColor: hasBackground ? 'rgba(0, 0, 0, 0.05)' : 'transparent'
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Pagination
          size='large'
          count={table.getPageCount()}
          page={pagination.pageIndex + 1}
          onChange={(_event, page) => {
            table.setPageIndex(page - 1)
          }}
          showFirstButton
          showLastButton
          sx={{
            '& .MuiPaginationItem-root.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
                color: 'white'
              }
            }
          }}
        />
      </Box>
    </Box>
  )
}
