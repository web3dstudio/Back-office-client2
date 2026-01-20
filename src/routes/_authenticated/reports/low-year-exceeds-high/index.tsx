import { createFileRoute } from '@tanstack/react-router'
import { Box } from '@mui/material'
import { useReportsLowYearExceedsHighQuery } from '../../../../query/statistics/reportsLowYearExceedsHigh.query'
import AppLoading from '../../../../components/AppLoading'
import AppError from '../../../../components/AppError'
import StyledPaper from '../../../../components/StyledPaper'
import { useMemo, useState, useEffect } from 'react'
import AppDataTable from '../../../../components/AppDataTable'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'
import type { TLowYearExceedsHigh } from '../../../../types'
import { useTranslation } from 'react-i18next'
import useCurrencyFormat from '../../../../hooks/useCurrencyFormat'

export const Route = createFileRoute('/_authenticated/reports/low-year-exceeds-high/')({
  component: LowYearExceedsHighPage,
})

function LowYearExceedsHighPage() {
  const { t, i18n } = useTranslation()
  const { formatCurrency } = useCurrencyFormat()
  const { data, isLoading, error } = useReportsLowYearExceedsHighQuery()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchValue, setSearchValue] = useState('')
  const [filteredRowsCount, setFilteredRowsCount] = useState<number | null>(null)

  // Сброс пагинации при изменении поиска
  useEffect(() => {
    if (pagination.pageIndex > 0) {
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }
  }, [searchValue])

  const handleSearchChange = (newSearchValue: string) => {
    setSearchValue(newSearchValue)
  }

  const handleFilteredRowsCountChange = (count: number) => {
    setFilteredRowsCount(count)
  }

  const rows = useMemo<TLowYearExceedsHigh[]>(() => {
    return Array.isArray(data) ? data : []
  }, [data])

  const columns = useMemo<ColumnDef<TLowYearExceedsHigh>[]>(
    () => [
      {
        accessorKey: 'manufacturerName',
        header: t('ManufacturerName', { ns: 'lowYearExceedsHigh' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'modelName',
        header: t('ModelName', { ns: 'lowYearExceedsHigh' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'lowYear',
        header: t('LowYear', { ns: 'lowYearExceedsHigh' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: 'lowPrice',
        header: t('LowPrice', { ns: 'lowYearExceedsHigh' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => {
          const price = row.original.lowPrice
          if (price === null || price === undefined) return '–'
          const formatted = formatCurrency(price)
          return formatted || String(price)
        },
      },
      {
        accessorKey: 'highYear',
        header: t('HighYear', { ns: 'lowYearExceedsHigh' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: 'highPrice',
        header: t('HighPrice', { ns: 'lowYearExceedsHigh' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => {
          const price = row.original.highPrice
          if (price === null || price === undefined) return '–'
          const formatted = formatCurrency(price)
          return formatted || String(price)
        },
      },
      {
        accessorKey: 'difference',
        header: t('Difference', { ns: 'lowYearExceedsHigh' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => {
          const diff = row.original.difference
          return new Intl.NumberFormat(i18n.language, {
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
          }).format(diff) + '%'
        },
      },
    ],
    [t, formatCurrency, i18n.language]
  )

  return (
    <Box>
      <StyledPaper sx={{ mt: 3 }}>
        {isLoading ? (
          <AppLoading />
        ) : error ? (
          <AppError error={error} />
        ) : (
          <AppDataTable
            tableName="lowYearExceedsHigh"
            data={rows}
            columns={columns}
            isLoading={isLoading}
            manualPagination={false}
            sorting={sorting}
            onSortingChange={setSorting}
            pagination={pagination}
            onPaginationChange={setPagination}
            totalPages={filteredRowsCount !== null ? Math.ceil((filteredRowsCount || 0) / pagination.pageSize) || 1 : Math.ceil((rows.length || 0) / pagination.pageSize) || 1}
            onSearchChange={handleSearchChange}
            onFilteredRowsCountChange={handleFilteredRowsCountChange}
            globalFilterFn={(row, _columnId, filterValue) => {
              const q = String(filterValue || '').toLowerCase()
              if (!q) return true

              const item = row.original
              const manufacturerMatch = item.manufacturerName?.toLowerCase().includes(q) || false
              const modelMatch = item.modelName?.toLowerCase().includes(q) || false
              const lowYearMatch = item.lowYear?.toString().toLowerCase().includes(q) || false
              const highYearMatch = item.highYear?.toString().toLowerCase().includes(q) || false

              return manufacturerMatch || modelMatch || lowYearMatch || highYearMatch
            }}
          />
        )}
      </StyledPaper>
    </Box>
  )
}
