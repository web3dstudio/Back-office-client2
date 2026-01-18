import { createFileRoute } from '@tanstack/react-router'
import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import StyledPaper from '../../../../components/StyledPaper'
import Grid from '@mui/material/Grid'
import { AppAutocomplete } from '../../../../components/AppAutocomplete'
import { useForm } from 'react-hook-form'
import { AppControlledDatePicker } from '../../../../components/AppControlledDatePicker'
import { useTranslation } from 'react-i18next'
import { useReportsNewModelsQuery } from '../../../../query/reportsNewModels.query'
import AppError from '../../../../components/AppError'
import AppDataTable from '../../../../components/AppDataTable'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'
import type { TReportsNewModel } from '../../../../types'
import { useDateTimeFormat } from '../../../../hooks/useDateTimeFormat'

export const Route = createFileRoute('/_authenticated/reports/new-models/')({
  component: NewModelsPage,
})

function NewModelsPage() {
  const { t } = useTranslation()
  const dateTimeFormat = useDateTimeFormat()

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const apiYear = currentYear
  const apiMonth = currentDate.getMonth() + 1

  const years = useMemo(() => {
    const result: number[] = []
    for (let y = currentYear; y >= 2005; y--) result.push(y)
    return result
  }, [currentYear])
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

  const [month, setMonth] = useState<number | null>(apiMonth)
  const [year, setYear] = useState<number | null>(apiYear)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  const page = pagination.pageIndex + 1

  const { control, formState, watch, setValue } = useForm<{ fromDate: string; toDate: string }>({
    defaultValues: { fromDate: '', toDate: '' },
    mode: 'onChange',
  })

  const fromDate = watch('fromDate')
  const toDate = watch('toDate')

  // If user starts using date range -> clear month/year
  useEffect(() => {
    if ((fromDate || toDate) && (month !== null || year !== null)) {
      setMonth(null)
      setYear(null)
    }
  }, [fromDate, toDate, month, year])

  // Reset pagination when filters change
  useEffect(() => {
    setPagination({ pageIndex: 0, pageSize: 20 })
  }, [month, year])

  const queryYear = typeof year === 'number' ? year : apiYear
  const queryMonth = typeof month === 'number' ? month : apiMonth
  const { data: newModels, isLoading, isError, error } = useReportsNewModelsQuery({ year: queryYear, month: queryMonth, page, pageSize: pagination.pageSize })

  const rows = useMemo<TReportsNewModel[]>(() => {
    const items = Array.isArray(newModels?.data) ? newModels.data : (Array.isArray(newModels) ? newModels : [])
    return items.map((item: any, index: number) => ({
      id: String(item?.id ?? index),
      ...item,
    }))
  }, [newModels])

  const columns = useMemo<ColumnDef<TReportsNewModel>[]>(
    () => [
      {
        accessorKey: 'manufacturerName',
        header: t('manufacturerName', { ns: 'newModels' }),
        enableSorting: true,
      },
      {
        accessorKey: 'modelName',
        header: t('modelName', { ns: 'newModels' }),
        enableSorting: true,
      },
      {
        accessorKey: 'volume',
        header: t('volume', { ns: 'newModels' }),
        enableSorting: true,
      },
      {
        accessorKey: 'modelFinishing',
        header: t('fin', { ns: 'newModels' }),
        enableSorting: true,
      },
      {
        accessorKey: 'createdDate',
        header: t('createdDate', { ns: 'newModels' }),
        enableSorting: true,
        cell: ({ row }) => dateTimeFormat(row.original.createdDate),
      },
    ],
    [t, dateTimeFormat]
  )

  return (
    <Box>
      <StyledPaper sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <AppAutocomplete<number>
              value={month}
              onChange={(v) => {
                setMonth(v)
                if (v !== null) {
                  setValue('fromDate', '')
                  setValue('toDate', '')
                }
              }}
              options={months}
              getOptionLabel={(opt) => String(opt)}
              label="reportsStatistics:filterMonth"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <AppAutocomplete<number>
              value={year}
              onChange={(v) => {
                setYear(v)
                if (v !== null) {
                  setValue('fromDate', '')
                  setValue('toDate', '')
                }
              }}
              options={years}
              getOptionLabel={(opt) => String(opt)}
              label="reportsStatistics:filterYear"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <AppControlledDatePicker
              name="fromDate"
              control={control}
              errors={formState.errors}
              label={t('filterFromDate', { ns: 'reportsStatistics' })}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <AppControlledDatePicker
              name="toDate"
              control={control}
              errors={formState.errors}
              label={t('filterToDate', { ns: 'reportsStatistics' })}
            />
          </Grid>
        </Grid>
      </StyledPaper>

      <StyledPaper sx={{ mt: 3 }}>
        {isError ? (
          <AppError error={error} />
        ) : (
          <AppDataTable<TReportsNewModel>
            tableName="newModels"
            data={rows}
            columns={columns}
            isLoading={isLoading}
            manualPagination={true}
            sorting={sorting}
            onSortingChange={setSorting}
            pagination={pagination}
            onPaginationChange={setPagination}
            totalPages={newModels?.totalPagesNumber ?? 1}
            currentPage={newModels?.currentPageNumber ?? pagination.pageIndex + 1}
            globalFilterFn={(row, _columnId, filterValue) => {
              const q = String(filterValue || '').toLowerCase()
              if (!q) return true

              const item = row.original
              const manufacturerMatch = item.manufacturerName?.toLowerCase().includes(q) || false
              const modelMatch = item.modelName?.toLowerCase().includes(q) || false
              const finishingMatch = item.modelFinishing?.toLowerCase().includes(q) || false
              const volumeMatch = item.volume?.toString().toLowerCase().includes(q) || false

              return manufacturerMatch || modelMatch || finishingMatch || volumeMatch
            }}
          />
        )}
      </StyledPaper>
    </Box>
  )
}
