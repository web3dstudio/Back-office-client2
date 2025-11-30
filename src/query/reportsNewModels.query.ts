import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"

export interface IReportsNewModelsParams {
    year?: number
    month?: number
    page?: number
}

export interface IReportsNewModelsData {
    // TODO: Add proper types based on API response
    [key: string]: any
}

export function useReportsNewModelsQuery(
    params: IReportsNewModelsParams = {}
): UseQueryResult<IReportsNewModelsData, Error> {
    const currentDate = new Date()
    const year = params.year ?? currentDate.getFullYear()
    const month = params.month ?? currentDate.getMonth() + 1
    const page = params.page ?? 1

    return useQuery({
        queryKey: ['reports', 'newModels', year, month, page],
        queryFn: async (): Promise<IReportsNewModelsData> => {
            const queryParams = new URLSearchParams({
                Year: String(year),
                Month: String(month),
                Page: String(page),
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
