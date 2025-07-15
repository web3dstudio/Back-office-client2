import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TInternalStatus } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useInternalStatusesQuery(): UseQueryResult<TInternalStatus[], Error> {
  return useQuery({
    queryKey: ['internal-statuses'],
    queryFn: async (): Promise<TInternalStatus[]> => {
      const response = await axiosAPI.get('/internalStatuses')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useInternalStatusesAddMutation(): UseMutationResult<TInternalStatus, Error, Omit<TInternalStatus, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newInternalStatus: Omit<TInternalStatus, 'id'>): Promise<TInternalStatus> => {
      const response = await axiosAPI.post('/internalStatuses', newInternalStatus)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['internal-statuses'] })
      toast.success(t('internal_status_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useInternalStatusesUpdateMutation(): UseMutationResult<TInternalStatus, Error, TInternalStatus> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedInternalStatus: TInternalStatus): Promise<TInternalStatus> => {
      const response = await axiosAPI.put(`/internalStatuses/${updatedInternalStatus.id}`, updatedInternalStatus)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['internal-statuses'] })
      toast.success(t('internal_status_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useInternalStatusesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/internalStatuses/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['internal-statuses'] })
      toast.success(t('internal_status_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
