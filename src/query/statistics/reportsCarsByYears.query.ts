import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../../utils/axiosAPI"
import type { TCarsByYears } from "../../types"

export function useReportsCarsByYearsQuery(): UseQueryResult<TCarsByYears[], Error> {
    return useQuery({
        queryKey: ['reports', 'carsByYears'],
        queryFn: async (): Promise<TCarsByYears[]> => {
            const response = await axiosAPI.get<TCarsByYears[]>('/reports/carsByYears')
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
