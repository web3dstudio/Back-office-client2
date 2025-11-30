import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"

export interface IReportsLowYearExceedsHighData {
    // TODO: Add proper types based on API response
    [key: string]: any
}

export function useReportsLowYearExceedsHighQuery(): UseQueryResult<IReportsLowYearExceedsHighData, Error> {
    return useQuery({
        queryKey: ['reports', 'lowYearExceedsHigh'],
        queryFn: async (): Promise<IReportsLowYearExceedsHighData> => {
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
