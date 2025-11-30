import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"

export interface IReportsCatalogItemsData {
    // TODO: Add proper types based on API response
    [key: string]: any
}

export function useReportsCatalogItemsQuery(): UseQueryResult<IReportsCatalogItemsData, Error> {
    return useQuery({
        queryKey: ['reports', 'catalogItems'],
        queryFn: async (): Promise<IReportsCatalogItemsData> => {
            const response = await axiosAPI.get('/reports/catalogItems')
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
