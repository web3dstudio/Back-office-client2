import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TProtective } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useProtectivesQuery(): UseQueryResult<TProtective[], Error> {
  return useQuery({
    queryKey: ['protectives'],
    queryFn: async (): Promise<TProtective[]> => {
      const response = await axiosAPI.get('/protectives')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useProtectivesAddMutation(): UseMutationResult<TProtective, Error, Omit<TProtective, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newProtective: Omit<TProtective, 'id'>): Promise<TProtective> => {
      const response = await axiosAPI.post('/protectives', newProtective)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['protectives'] })
      toast.success(t('protective_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useProtectivesUpdateMutation(): UseMutationResult<TProtective, Error, TProtective> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedProtective: TProtective): Promise<TProtective> => {
      const response = await axiosAPI.put(`/protectives/${updatedProtective.id}`, updatedProtective)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['protectives'] })
      toast.success(t('protective_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useProtectivesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/protectives/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['protectives'] })
      toast.success(t('protective_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
