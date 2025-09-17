import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TOwner } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'


export function useOwnersQuery(): UseQueryResult<TOwner[], Error> {
  return useQuery({
    queryKey: ['owners'],
    queryFn: async (): Promise<TOwner[]> => {
      const response = await axiosAPI.get('/owners')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useOwnerAddMutation(): UseMutationResult<TOwner, Error, Omit<TOwner, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newOwner: Omit<TOwner, 'id'>): Promise<TOwner> => {
      const response = await axiosAPI.post('/owners', newOwner)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      toast.success(t('owner_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useOwnerUpdateMutation(): UseMutationResult<TOwner, Error, TOwner> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedOwner: TOwner): Promise<TOwner> => {
      const response = await axiosAPI.put(`/owners/${updatedOwner.id}`, updatedOwner)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      toast.success(t('owner_updated_successfully'))
    },
    onError: () => {
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useOwnerDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/owners/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      toast.success(t('owner_deleted_successfully'))
    },
    onError: () => {
      toast.error('Failed to delete owners')
    },
  })
}