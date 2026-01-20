import React, { useState, useEffect, useRef } from 'react'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, getExpandedRowModel, flexRender } from '@tanstack/react-table'
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Button, Checkbox, IconButton, Pagination, CircularProgress, Divider, TextField, Menu, FormGroup, FormControlLabel } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import { ArrowUpward, ArrowDownward, ViewColumn, Search, Close } from '@mui/icons-material'
import { t } from 'i18next'


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
  renderSubComponent?: (props: { row: any, table: any }) => React.ReactElement
  globalFilterFn?: (row: any, columnId: string, filterValue: string) => boolean
  hidePagination?: boolean
  sx?: SxProps<Theme>
  getRowSx?: (row: T, index: number) => SxProps<Theme>
  onSearchChange?: (searchValue: string) => void
  onFilteredRowsCountChange?: (count: number) => void
}

export default function AppDataTable<T>({
  data,
  columns,
  isLoading,
  expandedRows = new Set(),
  tableName = 'default',
  initialColumnVisibility = {},
  sorting = [],
  onSortingChange = () => { },
  pagination = { pageIndex: 0, pageSize: 20 },
  onPaginationChange = () => { },
  totalPages = 1,
  manualPagination = false,
  renderSubComponent,
  globalFilterFn,
  hidePagination = false,
  sx,
  getRowSx,
  onSearchChange,
  onFilteredRowsCountChange,
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
  const [savedColumnVisibility, setSavedColumnVisibility] = useState<Record<string, boolean>>({});
  const [showSearch, setShowSearch] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setSavedColumnVisibility(columnVisibility);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReset = () => {
    setColumnVisibility(savedColumnVisibility);
  };

  const handleGoToPage = () => {
    const pageNumber = parseInt(pageInput);
    if (pageNumber && pageNumber >= 1 && pageNumber <= totalPages) {
      onPaginationChange({ pageIndex: pageNumber - 1, pageSize: pagination.pageSize });
      setPageInput('');
    }
  };

  // Закрытие поиска по клику вне поля
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);

  // Вызываем колбэк при изменении поиска
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(searchValue)
    }
  }, [searchValue, onSearchChange])

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: globalFilterFn,
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
      globalFilter: searchValue,
    },
    defaultColumn: {
      minSize: 30,
      maxSize: 800,
    },
  })

  // Вызываем колбэк при изменении количества отфильтрованных строк
  useEffect(() => {
    if (onFilteredRowsCountChange && !manualPagination) {
      const filteredCount = table.getFilteredRowModel().rows.length
      onFilteredRowsCountChange(filteredCount)
    }
  }, [table.getFilteredRowModel().rows.length, onFilteredRowsCountChange, manualPagination])

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', flexGrow: 1 }}>
      <CircularProgress />
    </Box>
  }

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2, position: 'relative', alignItems: 'center' }}>

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

        <Divider orientation="vertical" flexItem sx={{ marginLeft: 1, marginRight: 1 }} />

        <Box
          ref={searchRef}
          sx={{
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            transition: 'width 0.2s ease-in-out, opacity 0.2s ease-in-out',
            width: showSearch ? 200 : 0,
            opacity: showSearch ? 1 : 0
          }}
        >
          <TextField
            size="small"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ fontSize: 20, marginRight: 1, color: 'text.secondary' }} />
              }
            }}
            sx={{ minWidth: 200 }}
          />
          <IconButton
            size="small"
            onClick={() => setShowSearch(false)}
            sx={{ marginLeft: 1 }}
          >
            <Close />
          </IconButton>
        </Box>

        <IconButton
          size="small"
          onClick={() => setShowSearch(true)}
          sx={{
            display: showSearch ? 'none' : 'flex',
            opacity: showSearch ? 0 : 1,
            transition: 'opacity 0.2s ease-in-out',
            transitionDelay: showSearch ? '0s' : '0.2s',
            pointerEvents: showSearch ? 'none' : 'auto'
          }}
        >
          <Search sx={{ fontSize: 20 }} />
        </IconButton>

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
                      variant='head'
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      sx={{
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                        width: header.getSize(),
                        minWidth: 'unset !important',
                        maxWidth: 'unset !important',
                        textAlign: (header.column.columnDef.meta as any)?.align || 'left'
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
            {table.getRowModel().rows.map((row, index) => (
              <React.Fragment key={row.id}>
                <TableRow sx={{
                  backgroundColor: index % 2 === 0 ? 'transparent' : '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e3f2fd'
                  },
                  ...(getRowSx ? getRowSx(row.original, index) : {}),
                }}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      variant='body'
                      key={cell.id}
                      sx={{
                        width: cell.column.getSize(),
                        minWidth: 'unset !important',
                        maxWidth: 'unset !important',
                        textAlign: (cell.column.columnDef.meta as any)?.align || 'left',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {expandedRows.has((row.original as any).id?.toString() || '') && renderSubComponent && (
                  renderSubComponent({ row: row.original, table })
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!hidePagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2, alignItems: 'center' }}>
          <Pagination
            size='large'
            count={totalPages}
            page={pagination.pageIndex + 1}
            onChange={(_event, page) => {
              onPaginationChange({ pageIndex: page - 1, pageSize: pagination.pageSize })
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
          <TextField
            size="small"
            sx={{ width: 100, marginLeft: 2 }}
            placeholder={t('page', { ns: 'common' })}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleGoToPage();
              }
            }}
          />
          <Button
            size='large'
            variant='outlined'
            color='primary'
            onClick={handleGoToPage}
            sx={{ marginLeft: 1 }}
          >
            <Typography variant='body2'>
              {t('go', { ns: 'common' })}
            </Typography>
          </Button>
        </Box>
      )}
    </Box>
  )
} 