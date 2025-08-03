import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TCustomer, TCustomerListResponse } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'
import type { GridSortModel } from "@mui/x-data-grid"

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

export function useCustomersListQuery(page: number, filters: Record<string, string>, sortModel?: GridSortModel): UseQueryResult<TCustomerListResponse, Error> {
  return useQuery({
    queryKey: ['customers', page, filters, sortModel],
    queryFn: async (): Promise<TCustomerListResponse> => {
      const params = new URLSearchParams({
        Page: String(page + 1),
        PageSize: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      });

      // Добавляем параметры сортировки
      if (sortModel && sortModel.length > 0) {
        const sort = sortModel[0];
        params.append('sortField', sort.field);
        params.append('sortDirection', sort.sort || 'asc');
      }

      const response = await axiosAPI.get(`/customers?${params.toString()}`)
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData, // ВАЖНО!!! НЕ ТРОГАТЬ!!!
    retry: 3,
  })
}

export function useGetCustomerQuery(id: string): UseQueryResult<TCustomer, Error> {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async (): Promise<TCustomer> => {
      const response = await axiosAPI.get(`/customers/${id}`)
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
    enabled: !!id,
  })
}

export function useCustomersAddMutation(): UseMutationResult<TCustomer, Error, FormData> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData): Promise<TCustomer> => {
      const response = await axiosAPI.post('/customers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
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

export function useCustomersUpdateMutation(): UseMutationResult<TCustomer, Error, FormData> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData): Promise<TCustomer> => {
      const id = formData.get('id') as string
      const response = await axiosAPI.put(`/customers/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
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
