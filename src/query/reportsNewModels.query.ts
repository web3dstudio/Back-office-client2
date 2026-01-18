import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TReportsNewModels } from "../types"

export interface IReportsNewModelsParams {
    year?: number
    month?: number
    page?: number
    pageSize?: number
}

export function useReportsNewModelsQuery(
    params: IReportsNewModelsParams = {}
): UseQueryResult<TReportsNewModels, Error> {
    const currentDate = new Date()
    const year = params.year ?? currentDate.getFullYear()
    const month = params.month ?? currentDate.getMonth() + 1
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20

    return useQuery({
        queryKey: ['reports', 'newModels', year, month, page, pageSize],
        queryFn: async (): Promise<TReportsNewModels> => {
            const queryParams = new URLSearchParams({
                Year: String(year),
                Month: String(month),
                Page: String(page),
                PageSize: String(pageSize),
            })

            const response = await axiosAPI.get(`/reports/newModels?${queryParams.toString()}`)
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
