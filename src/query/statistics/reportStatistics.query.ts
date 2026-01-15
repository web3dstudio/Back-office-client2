import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import axiosAPI from '../../utils/axiosAPI'
import type { TReportsStatistics } from '../../types'

export type TReportStatisticsParams = {
  year?: number
  month?: number
  fromDate?: string
  toDate?: string
}

function buildStatisticsUrl(params?: TReportStatisticsParams): string {
  if (!params) return '/reports/statistics'

  const hasYearMonth = typeof params.year === 'number' && typeof params.month === 'number'
  const hasDates = !!params.fromDate || !!params.toDate

  const qs = new URLSearchParams()

  if (hasYearMonth) {
    qs.set('year', String(params.year))
    qs.set('month', String(params.month))
  } else if (hasDates) {
    if (params.fromDate) qs.set('fromDate', params.fromDate)
    if (params.toDate) qs.set('toDate', params.toDate)
  } else {
    return '/reports/statistics'
  }

  const queryString = qs.toString()
  return queryString ? `/reports/statistics?${queryString}` : '/reports/statistics'
}

export function useReportStatisticsQuery(params?: TReportStatisticsParams): UseQueryResult<TReportsStatistics, Error> {
  const hasYearMonth = typeof params?.year === 'number' && typeof params?.month === 'number'
  const hasDates = !!params?.fromDate || !!params?.toDate

  return useQuery({
    queryKey: [
      'reportsStatistics',
      hasYearMonth ? params?.year ?? null : null,
      hasYearMonth ? params?.month ?? null : null,
      !hasYearMonth && hasDates ? params?.fromDate ?? null : null,
      !hasYearMonth && hasDates ? params?.toDate ?? null : null,
    ],
    queryFn: async (): Promise<TReportsStatistics> => {
      const url = buildStatisticsUrl(params)
      const response = await axiosAPI.get<TReportsStatistics>(url)
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

