import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TCustomerType } from "../types"


export function useCustomerTypesQuery(): UseQueryResult<TCustomerType[], Error> {
  return useQuery({
    queryKey: ['customer-types'],
    queryFn: async (): Promise<TCustomerType[]> => {
      const response = await axiosAPI.get('/customerTypes')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}







