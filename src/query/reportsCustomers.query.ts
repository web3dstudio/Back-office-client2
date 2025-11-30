import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"

export interface IReportsCustomersParams {
    page?: number
}

export interface IReportsCustomersData {
    // TODO: Add proper types based on API response
    [key: string]: any
}

export function useReportsCustomersQuery(
    params: IReportsCustomersParams = {}
): UseQueryResult<IReportsCustomersData, Error> {
    const page = params.page ?? 1

    return useQuery({
        queryKey: ['reports', 'customers', page],
        queryFn: async (): Promise<IReportsCustomersData> => {
            const queryParams = new URLSearchParams({
                Page: String(page),
            })

            const response = await axiosAPI.get(`/reports/customers?${queryParams.toString()}`)
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
