import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"

export interface IReportsPriceDifferencesParams {
    manufacturerYear?: number
    modelCode?: string
}

export interface IReportsPriceDifferencesData {
    // TODO: Add proper types based on API response
    [key: string]: any
}

export function useReportsPriceDifferencesQuery(
    params: IReportsPriceDifferencesParams = {}
): UseQueryResult<IReportsPriceDifferencesData, Error> {
    const { manufacturerYear, modelCode } = params

    return useQuery({
        queryKey: ['reports', 'priceDifferences', manufacturerYear, modelCode],
        queryFn: async (): Promise<IReportsPriceDifferencesData> => {
            const queryParams = new URLSearchParams()

            if (manufacturerYear) {
                queryParams.append('ManufacturerYear', String(manufacturerYear))
            }
            if (modelCode) {
                queryParams.append('ModelCode', modelCode)
            }

            const response = await axiosAPI.get(`/reports/priceDifferences?${queryParams.toString()}`)
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
        enabled: !!manufacturerYear && !!modelCode, // Only run if both params are provided
    })
}
