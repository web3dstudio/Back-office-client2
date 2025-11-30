import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"

export interface IReportsStatisticsParams {
    year?: number
    month?: number
}

export interface IReportsStatisticsData {
    // TODO: Add proper types based on API response
    [key: string]: any
}

export function useReportsStatisticsQuery(
    params: IReportsStatisticsParams = {}
): UseQueryResult<IReportsStatisticsData, Error> {
    const currentDate = new Date()
    const year = params.year ?? currentDate.getFullYear()
    const month = params.month ?? currentDate.getMonth() + 1

    return useQuery({
        queryKey: ['reports', 'statistics', year, month],
        queryFn: async (): Promise<IReportsStatisticsData> => {
            const queryParams = new URLSearchParams({
                Year: String(year),
                Month: String(month),
            })

            const response = await axiosAPI.get(`/reports/statistics?${queryParams.toString()}`)
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
