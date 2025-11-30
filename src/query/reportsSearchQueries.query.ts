import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"

export interface IReportsSearchQueriesParams {
    year?: number
    month?: number
}

export interface IReportsSearchQueriesData {
    // TODO: Add proper types based on API response
    [key: string]: any
}

export function useReportsSearchQueriesQuery(
    params: IReportsSearchQueriesParams = {}
): UseQueryResult<IReportsSearchQueriesData, Error> {
    const currentDate = new Date()
    const year = params.year ?? currentDate.getFullYear()
    const month = params.month ?? currentDate.getMonth() + 1

    return useQuery({
        queryKey: ['reports', 'searchQueries', year, month],
        queryFn: async (): Promise<IReportsSearchQueriesData> => {
            const queryParams = new URLSearchParams({
                Year: String(year),
                Month: String(month),
            })

            const response = await axiosAPI.get(`/reports/searchQueries?${queryParams.toString()}`)
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
