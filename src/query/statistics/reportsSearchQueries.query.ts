import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../../utils/axiosAPI"
import type { TReportsSearchQuery } from "../../types"

export interface IReportsSearchQueriesParams {
    customerId?: string
    customerUserId?: string
    year?: number | null
    month?: number | null
    fromDate?: string | null
    toDate?: string | null
}

export function useReportsSearchQueriesQuery(
    params: IReportsSearchQueriesParams = {}
): UseQueryResult<TReportsSearchQuery[], Error> {
    const currentDate = new Date()
    const year = typeof params.year === 'number' ? params.year : currentDate.getFullYear()
    const month = typeof params.month === 'number' ? params.month : currentDate.getMonth() + 1

    const customerId = params.customerId ?? ''
    const customerUserId = params.customerUserId ?? ''

    const hasYearMonth = typeof params.year === 'number' && typeof params.month === 'number'
    const hasDates = !!params.fromDate || !!params.toDate

    return useQuery({
        queryKey: [
            'reports',
            'searchQueries',
            customerId,
            customerUserId,
            hasYearMonth ? year : null,
            hasYearMonth ? month : null,
            !hasYearMonth && hasDates ? params.fromDate ?? null : null,
            !hasYearMonth && hasDates ? params.toDate ?? null : null,
        ],
        queryFn: async (): Promise<TReportsSearchQuery[]> => {
            const queryParams = new URLSearchParams()
            if (customerId) queryParams.set('CustomerId', customerId)
            if (customerUserId) queryParams.set('CustomerUserId', customerUserId)

            // Priority: year+month, otherwise from/to
            if (hasYearMonth) {
                queryParams.set('Year', String(year))
                queryParams.set('Month', String(month))
            } else if (hasDates) {
                if (params.fromDate) queryParams.set('FromDate', params.fromDate)
                if (params.toDate) queryParams.set('ToDate', params.toDate)
            } else {
                queryParams.set('Year', String(year))
                queryParams.set('Month', String(month))
            }

            const response = await axiosAPI.get<TReportsSearchQuery[]>(`/reports/searchQueries?${queryParams.toString()}`)
            return response.data ?? []
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}
