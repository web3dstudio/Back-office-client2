import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../../utils/axiosAPI"
import type { TLowYearExceedsHigh } from "../../types"

export function useReportsLowYearExceedsHighQuery(): UseQueryResult<TLowYearExceedsHigh[], Error> {
    return useQuery({
        queryKey: ['reports', 'lowYearExceedsHigh'],
        queryFn: async (): Promise<TLowYearExceedsHigh[]> => {
            const response = await axiosAPI.get('/reports/lowYearExceedsHigh')
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
