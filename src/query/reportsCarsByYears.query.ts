import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"

export interface IReportsCarsByYearsData {
    // TODO: Add proper types based on API response
    [key: string]: any
}

export function useReportsCarsByYearsQuery(): UseQueryResult<IReportsCarsByYearsData, Error> {
    return useQuery({
        queryKey: ['reports', 'carsByYears'],
        queryFn: async (): Promise<IReportsCarsByYearsData> => {
            const response = await axiosAPI.get('/reports/carsByYears')
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
