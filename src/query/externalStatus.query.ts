import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TExternalStatus } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useExternalStatusesQuery(): UseQueryResult<TExternalStatus[], Error> {
  return useQuery({
    queryKey: ['external-statuses'],
    queryFn: async (): Promise<TExternalStatus[]> => {
      const response = await axiosAPI.get('/externalStatuses')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useExternalStatusesAddMutation(): UseMutationResult<TExternalStatus, Error, Omit<TExternalStatus, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newExternalStatus: Omit<TExternalStatus, 'id'>): Promise<TExternalStatus> => {
      const response = await axiosAPI.post('/externalStatuses', newExternalStatus)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['external-statuses'] })
      toast.success(t('external_status_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useExternalStatusesUpdateMutation(): UseMutationResult<TExternalStatus, Error, TExternalStatus> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedExternalStatus: TExternalStatus): Promise<TExternalStatus> => {
      const response = await axiosAPI.put(`/externalStatuses/${updatedExternalStatus.id}`, updatedExternalStatus)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['external-statuses'] })
      toast.success(t('external_status_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useExternalStatusesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/externalStatuses/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['external-statuses'] })
      toast.success(t('external_status_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
