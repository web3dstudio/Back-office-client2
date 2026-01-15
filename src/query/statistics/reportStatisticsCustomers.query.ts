import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import axiosAPI from '../../utils/axiosAPI'
import type { TCustomerWithUsers } from '../../types'

export function useReportStatisticsCustomersQuery(): UseQueryResult<TCustomerWithUsers[], Error> {
  return useQuery({
    queryKey: ['reportsStatisticsCustomers'],
    queryFn: async (): Promise<TCustomerWithUsers[]> => {
      const response = await axiosAPI.get<TCustomerWithUsers[]>('/reports/statistics/customers')
      return response.data ?? []
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

