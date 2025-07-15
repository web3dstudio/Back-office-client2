import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TCustomer } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useCustomersQuery(): UseQueryResult<TCustomer[], Error> {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<TCustomer[]> => {
      const response = await axiosAPI.get('/customers/all')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useCustomersAddMutation(): UseMutationResult<TCustomer, Error, Omit<TCustomer, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newCustomer: Omit<TCustomer, 'id'>): Promise<TCustomer> => {
      const response = await axiosAPI.post('/customers', newCustomer)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success(t('customer_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useCustomersUpdateMutation(): UseMutationResult<TCustomer, Error, TCustomer> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedCustomer: TCustomer): Promise<TCustomer> => {
      const response = await axiosAPI.put(`/customers/${updatedCustomer.id}`, updatedCustomer)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success(t('customer_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useCustomersDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/customers/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success(t('customer_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
