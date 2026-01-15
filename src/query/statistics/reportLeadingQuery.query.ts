import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import axiosAPI from '../../utils/axiosAPI'
import type { TLeadingQuery } from '../../types'



export function useLeadingQuery(): UseQueryResult<TLeadingQuery[], Error> {
  return useQuery({
    queryKey: ['leadingQueries'],
    queryFn: async (): Promise<TLeadingQuery[]> => {
      const response = await axiosAPI.get<TLeadingQuery[]>('/reports/leadingQueries')
      return response.data ?? []
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

