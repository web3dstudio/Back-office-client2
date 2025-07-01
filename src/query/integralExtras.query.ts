import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TIntegralExtra } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useIntegralExtrasQuery(): UseQueryResult<TIntegralExtra[], Error> {
  return useQuery({
    queryKey: ['integralExtras'],
    queryFn: async (): Promise<TIntegralExtra[]> => {
      const response = await axiosAPI.get('/integralExtras')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useIntegralExtrasAddMutation(): UseMutationResult<TIntegralExtra, Error, Omit<TIntegralExtra, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newIntegralExtra: Omit<TIntegralExtra, 'id'>): Promise<TIntegralExtra> => {
      const response = await axiosAPI.post('/integralExtras', newIntegralExtra)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['integralExtras'] })
      toast.success(t('integralExtra_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useIntegralExtrasUpdateMutation(): UseMutationResult<TIntegralExtra, Error, TIntegralExtra> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedIntegralExtra: TIntegralExtra): Promise<TIntegralExtra> => {
      const response = await axiosAPI.put(`/integralExtras/${updatedIntegralExtra.id}`, updatedIntegralExtra)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['integralExtras'] })
      toast.success(t('integralExtra_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useIntegralExtrasDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/integralExtras/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['integralExtras'] })
      toast.success(t('integralExtra_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
