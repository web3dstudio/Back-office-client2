import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import axiosAPI from '../../utils/axiosAPI'
import type { TExpiringCustomer } from '../../types'

export type TExpiringCustomersResponse = {
    items: TExpiringCustomer[]
    totalCount: number
    page: number
    pageSize: number
}

export function useExpiringCustomersQuery(
    page: number = 1,
    pageSize: number = 20
): UseQueryResult<TExpiringCustomersResponse, Error> {
    return useQuery({
        queryKey: ['reports', 'customers', page, pageSize],
        queryFn: async (): Promise<TExpiringCustomersResponse> => {
            const response = await axiosAPI.get(`/reports/customers?page=${page}&pageSize=${pageSize}`)
            return response.data
        },
    })
}
