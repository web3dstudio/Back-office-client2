import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TUsageType } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'


export function useUsageTypesQuery(): UseQueryResult<TUsageType[], Error> {
  return useQuery({
    queryKey: ['usage-types'],
    queryFn: async (): Promise<TUsageType[]> => {
      const response = await axiosAPI.get('/usageTypes')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useUsageTypesAddMutation(): UseMutationResult<TUsageType, Error, Omit<TUsageType, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newUsageType: Omit<TUsageType, 'id'>): Promise<TUsageType> => {
      const response = await axiosAPI.post('/usageTypes', newUsageType)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['usage-types'] })
      toast.success(t('usage_type_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useUsageTypesUpdateMutation(): UseMutationResult<TUsageType, Error, TUsageType> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedUsageType: TUsageType): Promise<TUsageType> => {
      const response = await axiosAPI.put(`/usageTypes/${updatedUsageType.id}`, updatedUsageType)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['usage-types'] })
      toast.success(t('usage_type_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useUsageTypesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/usageTypes/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['usage-types'] })
      toast.success(t('usage_type_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
