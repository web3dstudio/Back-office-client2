import { createFileRoute } from '@tanstack/react-router'
import { Box } from '@mui/material'
import AppLoading from '../../../../components/AppLoading'
import AppError from '../../../../components/AppError'
import { useReportStatisticsQuery } from '../../../../query/statistics/reportStatistics.query'
import StyledPaper from '../../../../components/StyledPaper'
import ReportsStatLineChart from '../../../../components/ReportsStatLineChart'
import AppMonthlyTrafficChart from '../../../../components/AppMonthlyTrafficChart'
import Grid from '@mui/material/Grid'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { AppControlledDatePicker } from '../../../../components/AppControlledDatePicker'
import { AppAutocomplete } from '../../../../components/AppAutocomplete'
import AppSessionsSummaryTable from '../../../../components/AppSessionsSummaryTable'

export const Route = createFileRoute('/_authenticated/reports/statistics/')({
  component: StatisticsPage,
})

function StatisticsPage() {
  const { t } = useTranslation()

  const currentYear = new Date().getFullYear()
  const years = useMemo(() => {
    const result: number[] = []
    for (let y = currentYear; y >= 2005; y--) result.push(y)
    return result
  }, [currentYear])
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

  const [month, setMonth] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)
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

  const params = useMemo(() => {
    const hasYearMonth = year !== null && month !== null
    const hasDates = !!fromDate || !!toDate

    if (hasYearMonth) {
      return { year, month }
    }

    if (hasDates) {
      return {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }
    }

    return undefined
  }, [fromDate, toDate, month, year])

  const { data: monthlyTraffic, isLoading, isError, error } = useReportStatisticsQuery(params)


  return (
    <Box sx={{}}>
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
        {isLoading ? (
          <AppLoading />
        ) : isError ? (
          <AppError error={error} />
        ) : (
          monthlyTraffic && <>
            <AppMonthlyTrafficChart dataset={monthlyTraffic} />
            <AppSessionsSummaryTable dataset={monthlyTraffic} />
          </>
        )}
      </StyledPaper>

      <StyledPaper sx={{ mt: 3 }}>
        {isLoading ? (
          <AppLoading />
        ) : isError ? (
          <AppError error={error} />
        ) : (
          <ReportsStatLineChart
            title={t('reviewSessions', { ns: 'reportsStatistics' })}
            dataset={monthlyTraffic?.dailyVisits ?? []}
          />
        )}
      </StyledPaper>

    </Box>
  )
}

