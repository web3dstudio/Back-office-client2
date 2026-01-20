import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TCustomer, TPagination } from "../types"
import { toast } from "react-toastify"
import { useTranslation } from "react-i18next"

export interface IReportsCustomersParams {
    page?: number
    pageSize?: number
}

export type TReportsCustomersResponse = {
    data: TCustomer[]
} & TPagination

export function useReportsCustomersQuery(
    params: IReportsCustomersParams = {}
): UseQueryResult<TReportsCustomersResponse, Error> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20

    return useQuery({
        queryKey: ['reportsCustomers', page, pageSize],
        queryFn: async (): Promise<TReportsCustomersResponse> => {
            const queryParams = new URLSearchParams({
                Page: String(page),
                PageSize: String(pageSize),
            })

            const response = await axiosAPI.get<TReportsCustomersResponse>(`/reports/customers?${queryParams.toString()}`)
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}

export function useCustomerRenewalMutation(): UseMutationResult<void, Error, string> {
    const { t } = useTranslation('notifications')
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (customerId: string): Promise<void> => {
            await axiosAPI.post(`/reports/customers/renewal/${customerId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reportsCustomers'] })
            toast.success(t('subscription_renewed_successfully') || 'Subscription renewed successfully')
        },
        onError: (error) => {
            console.log('ERROR', error.message)
            toast.error(t('error_occurred') || 'Error!')
        },
    })
}

export function useCustomerExclusionMutation(): UseMutationResult<void, Error, string> {
    const { t } = useTranslation('notifications')
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (customerId: string): Promise<void> => {
            await axiosAPI.post(`/reports/customers/exclusion/${customerId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reportsCustomers'] })
            toast.success(t('subscription_excluded_successfully') || 'Subscription excluded successfully')
        },
        onError: (error) => {
            console.log('ERROR', error.message)
            toast.error(t('error_occurred') || 'Error!')
        },
    })
}
