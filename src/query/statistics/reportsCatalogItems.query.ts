import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../../utils/axiosAPI"
import type { TReportCatalogItems } from "../../types"

export function useReportsCatalogItemsQuery(): UseQueryResult<TReportCatalogItems, Error> {
    return useQuery({
        queryKey: ['reports', 'catalogItems'],
        queryFn: async (): Promise<TReportCatalogItems> => {
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
