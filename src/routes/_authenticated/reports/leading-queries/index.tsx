import { createFileRoute } from '@tanstack/react-router'
import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import StyledPaper from '../../../../components/StyledPaper'
import Grid from '@mui/material/Grid'
import { AppAutocomplete } from '../../../../components/AppAutocomplete'
import { useForm } from 'react-hook-form'
import { AppControlledDatePicker } from '../../../../components/AppControlledDatePicker'
import { useTranslation } from 'react-i18next'
import { useReportsLeadingQueriesQuery } from '../../../../query/statistics/reportsLeadingQueries.query'
import AppError from '../../../../components/AppError'
import AppDataTable from '../../../../components/AppDataTable'
import type { ColumnDef, SortingState } from '@tanstack/react-table'

export const Route = createFileRoute('/_authenticated/reports/leading-queries/')({
  component: LeadingQueriesPage,
})

function LeadingQueriesPage() {
  const { t } = useTranslation()
  const currentDate = new Date()
  const apiYear = currentDate.getFullYear()
  const apiMonth = currentDate.getMonth() + 1

  const [month, setMonth] = useState<number | null>(apiMonth)
  const [year, setYear] = useState<number | null>(apiYear)
  const [page] = useState(1)

  const queryYear = typeof year === 'number' ? year : apiYear
  const queryMonth = typeof month === 'number' ? month : apiMonth
  const { data, isLoading, error } = useReportsLeadingQueriesQuery({ year: queryYear, month: queryMonth, page })

  type TLeadingQueryRow = {
    id: string
    car: string
    manufacturerYear: number
    number: number
  }

  const rows = useMemo<TLeadingQueryRow[]>(() => {
    const items = Array.isArray(data) ? data : []
    return items.map((item: any, index: number) => ({
      id: String(item?.id ?? index),
      car: String(item?.car ?? ''),
      manufacturerYear: Number(item?.manufacturerYear ?? 0),
      number: Number(item?.number ?? 0),
    }))
  }, [data])

  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<TLeadingQueryRow>[]>(
    () => [
      {
        accessorKey: 'car',
        header: t('leadingQueriesCar', { ns: 'reportsStatistics' }),
        enableSorting: true,
      },
      {
        accessorKey: 'manufacturerYear',
        header: t('leadingQueriesYear', { ns: 'reportsStatistics' }),
        meta: { align: 'right' },
        enableSorting: true,
        cell: ({ getValue }) => (
          <Box sx={{ width: '100%', textAlign: 'right' }}>
            {getValue<number>()}
          </Box>
        ),
      },
      {
        accessorKey: 'number',
        header: t('leadingQueriesCount', { ns: 'reportsStatistics' }),
        meta: { align: 'right' },
        enableSorting: true,
        cell: ({ getValue }) => (
          <Box sx={{ width: '100%', textAlign: 'right' }}>
            {getValue<number>()}
          </Box>
        ),
      },
    ],
    [t]
  )

  const globalFilterFn = useMemo(
    () =>
      (row: any, _columnId: string, filterValue: string) => {
        const q = String(filterValue ?? '').trim().toLowerCase()
        if (!q) return true

        const original = row?.original as TLeadingQueryRow | undefined
        const car = String(original?.car ?? '').toLowerCase()
        const year = String(original?.manufacturerYear ?? '')
        const count = String(original?.number ?? '')

        return car.includes(q) || year.includes(q) || count.includes(q)
      },
    []
  )

  const currentYear = new Date().getFullYear()
  const years = useMemo(() => {
    const result: number[] = []
    for (let y = currentYear; y >= 2005; y--) result.push(y)
    return result
  }, [currentYear])
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

  const { control, formState, watch, setValue } = useForm<{ fromDate: string | null; toDate: string | null }>({
    defaultValues: { fromDate: null, toDate: null },
    mode: 'onChange',
  })

  const fromDate = watch('fromDate')
  const toDate = watch('toDate')

  // Same UX logic as /reports/statistics:
  // - If user selects month/year -> clear date pickers
  useEffect(() => {
    if (month !== null || year !== null) {
      setValue('fromDate', null, { shouldDirty: true })
      setValue('toDate', null, { shouldDirty: true })
    }
  }, [month, year, setValue])

  // - If user selects date range -> clear month/year
  useEffect(() => {
    if (!!fromDate || !!toDate) {
      setMonth(null)
      setYear(null)
    }
  }, [fromDate, toDate])

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
                  setValue('fromDate', null)
                  setValue('toDate', null)
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
                  setValue('fromDate', null)
                  setValue('toDate', null)
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
        {error ? (
          <AppError error={error} />
        ) : (
          <AppDataTable<TLeadingQueryRow>
            tableName="leadingQueries"
            data={rows}
            columns={columns}
            isLoading={isLoading}
            sorting={sorting}
            onSortingChange={setSorting}
            globalFilterFn={globalFilterFn}
            hidePagination
          />
        )}
      </StyledPaper>
    </Box>
  )
}
