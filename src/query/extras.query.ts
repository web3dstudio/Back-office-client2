import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TExtra } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useExtrasQuery(): UseQueryResult<TExtra[], Error> {
  return useQuery({
    queryKey: ['extras'],
    queryFn: async (): Promise<TExtra[]> => {
      const response = await axiosAPI.get('/extras')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useExtrasAddMutation(): UseMutationResult<TExtra, Error, Omit<TExtra, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newExtra: Omit<TExtra, 'id'>): Promise<TExtra> => {
      const response = await axiosAPI.post('/extras', newExtra)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['extras'] })
      toast.success(t('extra_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useExtrasUpdateMutation(): UseMutationResult<TExtra, Error, TExtra> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedExtra: TExtra): Promise<TExtra> => {
      const response = await axiosAPI.put(`/extras/${updatedExtra.id}`, updatedExtra)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['extras'] })
      toast.success(t('extra_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useExtrasDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/extras/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['extras'] })
      toast.success(t('extra_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
