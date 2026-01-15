import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import axiosAPI from '../../utils/axiosAPI'
import type { TReportDailyVisits } from '../../types'



export function useReportDailyVisitsQuery(): UseQueryResult<TReportDailyVisits[], Error> {
  return useQuery({
    queryKey: ['dailyVisits'],
    queryFn: async (): Promise<TReportDailyVisits[]> => {
      const response = await axiosAPI.get<TReportDailyVisits[]>('/reports/dailyVisits')
      return response.data ?? []
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

