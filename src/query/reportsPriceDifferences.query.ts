import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TReportPriceDifferenceResponse } from "../types"

export interface IReportsPriceDifferencesParams {
    countryId: string
    manufacturerYear: number
    modelCode: string
}

export function useReportsPriceDifferencesQuery(
    params: IReportsPriceDifferencesParams
): UseQueryResult<TReportPriceDifferenceResponse, Error> {
    const { countryId, manufacturerYear, modelCode } = params

    return useQuery({
        queryKey: ['reports', 'priceDifferences', countryId, manufacturerYear, modelCode],
        queryFn: async (): Promise<TReportPriceDifferenceResponse> => {
            const queryParams = new URLSearchParams({
                CountryId: countryId,
                ManufacturerYear: String(manufacturerYear),
                ModelCode: modelCode,
            })

            const response = await axiosAPI.get(`/reports/priceDifferences?${queryParams.toString()}`)
            return response.data
        },
        enabled: countryId.trim() !== '' && manufacturerYear > 0 && modelCode.trim() !== '',
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
