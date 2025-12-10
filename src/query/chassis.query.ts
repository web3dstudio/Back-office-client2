import { type UseQueryResult, useQuery, keepPreviousData } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TChassis } from "../types"

export function useChassisQuery(): UseQueryResult<TChassis[], Error> {
  return useQuery({
    queryKey: ['chassis'],
    queryFn: async (): Promise<TChassis[]> => {
      const response = await axiosAPI.get('/chassis')
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

