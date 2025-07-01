import { type UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TPriceListType } from '../types'


export function usePriceListTypesQuery(): UseQueryResult<TPriceListType[], Error> {
  return useQuery({
    queryKey: ['priceListTypes'],
    queryFn: async (): Promise<TPriceListType[]> => {
      const response = await axiosAPI.get('/priceListTypes')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    retry: 3,
  })
}