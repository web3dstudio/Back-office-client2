import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"

export interface IReportsDeductedModelsParams {
    year?: number
    month?: number
    page?: number
    orders?: Array<{ column: string }>
}

export interface IReportsDeductedModelsData {
    // TODO: Add proper types based on API response
    [key: string]: any
}

export function useReportsDeductedModelsQuery(
    params: IReportsDeductedModelsParams = {}
): UseQueryResult<IReportsDeductedModelsData, Error> {
    const currentDate = new Date()
    const year = params.year ?? currentDate.getFullYear()
    const month = params.month ?? currentDate.getMonth() + 1
    const page = params.page ?? 1
    const orders = params.orders ?? [{ column: 'DeletedDate' }]

    return useQuery({
        queryKey: ['reports', 'deductedModels', year, month, page, orders],
        queryFn: async (): Promise<IReportsDeductedModelsData> => {
            const queryParams = new URLSearchParams({
                Year: String(year),
                Month: String(month),
                Page: String(page),
            })

            // Add orders parameters
            orders.forEach((order, index) => {
                queryParams.append(`Orders[${index}].Column`, order.column)
            })

            const response = await axiosAPI.get(`/reports/deductedModels?${queryParams.toString()}`)
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
