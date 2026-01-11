import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosAPI from '../utils/axiosAPI'
import type { TPricelistLayoutSchedule } from '../types'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

export function usePriceListLayoutSchedulesQuery(): UseQueryResult<TPricelistLayoutSchedule[], Error> {
  return useQuery({
    queryKey: ['priceList-layout-schedules'],
    queryFn: async (): Promise<TPricelistLayoutSchedule[]> => {
      const response = await axiosAPI.get('/pricelist-layout-schedules')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function usePriceListLayoutScheduleQuery(id: string): UseQueryResult<TPricelistLayoutSchedule, Error> {
  return useQuery({
    queryKey: ['priceList-layout-schedule', id],
    queryFn: async (): Promise<TPricelistLayoutSchedule> => {
      const response = await axiosAPI.get(`/pricelist-layout-schedules/${id}`)
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

export function usePriceListLayoutScheduleCreateMutation(): UseMutationResult<
  TPricelistLayoutSchedule,
  Error,
  Omit<TPricelistLayoutSchedule, 'id' | 'layout'>
> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<TPricelistLayoutSchedule, 'id' | 'layout'>): Promise<TPricelistLayoutSchedule> => {
      const response = await axiosAPI.post('/pricelist-layout-schedules', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceList-layout-schedules'] })
      toast.success(t('saved_successfully') || 'Saved successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function usePriceListLayoutScheduleUpdateMutation(): UseMutationResult<
  TPricelistLayoutSchedule,
  Error,
  Omit<TPricelistLayoutSchedule, 'layout'>
> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<TPricelistLayoutSchedule, 'layout'>): Promise<TPricelistLayoutSchedule> => {
      const response = await axiosAPI.put(`/pricelist-layout-schedules/${data.id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceList-layout-schedules'] })
      toast.success(t('saved_successfully') || 'Saved successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function usePriceListLayoutScheduleDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/pricelist-layout-schedules/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceList-layout-schedules'] })
      toast.success(t('deleted_successfully') || 'Deleted successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}


