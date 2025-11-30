import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"

export interface IReportsLeadingQueriesParams {
    year?: number
    month?: number
    page?: number
}

export interface IReportsLeadingQueriesData {
    // TODO: Add proper types based on API response
    [key: string]: any
}

export function useReportsLeadingQueriesQuery(
    params: IReportsLeadingQueriesParams = {}
): UseQueryResult<IReportsLeadingQueriesData, Error> {
    const currentDate = new Date()
    const year = params.year ?? currentDate.getFullYear()
    const month = params.month ?? currentDate.getMonth() + 1
    const page = params.page ?? 1

    return useQuery({
        queryKey: ['reports', 'leadingQueries', year, month, page],
        queryFn: async (): Promise<IReportsLeadingQueriesData> => {
            const queryParams = new URLSearchParams({
                Year: String(year),
                Month: String(month),
                Page: String(page),
            })

            const response = await axiosAPI.get(`/reports/leadingQueries?${queryParams.toString()}`)
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
