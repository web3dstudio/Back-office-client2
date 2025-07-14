import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TAppraiser } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'


export function useAppraisersQuery(): UseQueryResult<TAppraiser[], Error> {
  return useQuery({
    queryKey: ['appraisers'],
    queryFn: async (): Promise<TAppraiser[]> => {
      const response = await axiosAPI.get('/appraisers')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useAddAppraiserMutation(): UseMutationResult<TAppraiser, Error, Omit<TAppraiser, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newAppraiser: Omit<TAppraiser, 'id'>): Promise<TAppraiser> => {
      const response = await axiosAPI.post('/appraisers', newAppraiser)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['appraisers'] })
      toast.success(t('appraiser_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useUpdateAppraiserMutation(): UseMutationResult<TAppraiser, Error, TAppraiser> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedAppraiser: TAppraiser): Promise<TAppraiser> => {
      const response = await axiosAPI.put(`/appraisers/${updatedAppraiser.id}`, updatedAppraiser)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['appraisers'] })
      toast.success(t('appraiser_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useAppraiserDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/appraisers/${id}`)
      return id
    },
    onSuccess: (_id) => {
      queryClient.invalidateQueries({ queryKey: ['appraisers'] })
      toast.success(t('appraiser_deleted_successfully'))
    },
    onError: () => {
      toast.error('Failed to delete appraiser')
    },
  })
}