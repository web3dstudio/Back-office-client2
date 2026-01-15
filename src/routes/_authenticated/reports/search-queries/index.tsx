import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography } from '@mui/material'
import { useReportsSearchQueriesQuery } from '../../../../query/reportsSearchQueries.query'
import { useEffect, useMemo, useState } from 'react'
import AppLoading from '../../../../components/AppLoading'
import AppError from '../../../../components/AppError'
import StyledPaper from '../../../../components/StyledPaper'
import { BarChart } from '@mui/x-charts/BarChart'
import { useDateTimeFormat } from '../../../../hooks/useDateTimeFormat'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import { AppAutocomplete } from '../../../../components/AppAutocomplete'
import { useForm } from 'react-hook-form'
import { AppControlledDatePicker } from '../../../../components/AppControlledDatePicker'
import { useReportStatisticsCustomersQuery } from '../../../../query/statistics/reportStatisticsCustomers.query'
import type { TCustomerWithUsers, TIdName } from '../../../../types'
import dayjs from 'dayjs'

export const Route = createFileRoute('/_authenticated/reports/search-queries/')({
  component: SearchQueriesPage,
})

function SearchQueriesPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const currentDate = new Date()
  const apiYear = currentDate.getFullYear()
  const apiMonth = currentDate.getMonth() + 1

  const [month, setMonth] = useState<number | null>(apiMonth)
  const [year, setYear] = useState<number | null>(apiYear)

  const [company, setCompany] = useState<TCustomerWithUsers | null>(null)
  const [user, setUser] = useState<TIdName | null>(null)

  const { data: statisticsCustomers, isLoading: isLoadingStatisticsCustomers, isError: isErrorStatisticsCustomers } =
    useReportStatisticsCustomersQuery()


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

  const { data: searchQueries, isLoading, error } = useReportsSearchQueriesQuery({
    customerId: company?.id ?? '',
    customerUserId: user?.id ?? '',
    year: year,
    month: month,
    fromDate: fromDate || null,
    toDate: toDate || null,
  })

  const dateTimeFormat = useDateTimeFormat()

  return (
    <Box>
      <StyledPaper sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 2 }}>
            <AppAutocomplete<TCustomerWithUsers>
              value={company}
              onChange={(v) => {
                setCompany(v)
                setUser(null)
              }}
              options={statisticsCustomers ?? []}
              getOptionLabel={(opt) => opt?.name ?? ''}
              isOptionEqualToValue={(opt, value) => opt.id === value.id}
              label="user-queries:selectCompany"
              loading={isLoadingStatisticsCustomers}
              disabled={isLoadingStatisticsCustomers || isErrorStatisticsCustomers}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <AppAutocomplete<TIdName>
              value={user}
              onChange={(v) => setUser(v)}
              options={company?.customerUsers ?? []}
              getOptionLabel={(opt) => opt?.name ?? ''}
              isOptionEqualToValue={(opt, value) => opt.id === value.id}
              label="user-queries:selectUser"
              disabled={!company}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
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

          <Grid size={{ xs: 12, md: 2 }}>
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

          <Grid size={{ xs: 12, md: 2 }}>
            <AppControlledDatePicker
              name="fromDate"
              control={control}
              errors={formState.errors}
              label={t('filterFromDate', { ns: 'reportsStatistics' })}
              minDate={dayjs().subtract(1, 'year')}
              maxDate={dayjs()}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <AppControlledDatePicker
              name="toDate"
              control={control}
              errors={formState.errors}
              label={t('filterToDate', { ns: 'reportsStatistics' })}
              minDate={fromDate ? dayjs(fromDate) : undefined}
              maxDate={dayjs()}
            />
          </Grid>
        </Grid>
      </StyledPaper>

      <StyledPaper sx={{ mt: 3 }}>
        {isLoading ? (
          <AppLoading />
        ) : error ? (
          <AppError error={error} />
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('user-queries', { ns: 'reports' })}
            </Typography>
            <BarChart
              dataset={searchQueries ?? []}
              xAxis={[
                {
                  dataKey: 'date',
                  scaleType: 'band',
                  valueFormatter: (value: string) => dateTimeFormat(value, false, '2-digit'),
                },
              ]}
              yAxis={[
                {
                  valueFormatter: (value: number) => String(Math.round(value)),
                  tickMinStep: 1,
                },
              ]}
              series={[
                {
                  dataKey: 'number',
                  color: theme.palette.primary.main,
                },
              ]}
              slotProps={{ legend: { sx: { display: 'none' } } }}
              height={400}
              grid={{ horizontal: true }}
              sx={{
                '.MuiAreaElement-root': {
                  fill: theme.palette.divider,
                },
              }}
            />
          </>
        )}
      </StyledPaper>

    </Box>
  )
}
