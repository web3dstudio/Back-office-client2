import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosAPI from '../utils/axiosAPI'
import type { TMark } from '../types'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

export type TMarkCreate = Omit<TMark, 'id'>
export type TMarkUpdate = TMarkCreate

export function useMarksQuery(): UseQueryResult<TMark[], Error> {
  return useQuery({
    queryKey: ['marks'],
    queryFn: async (): Promise<TMark[]> => {
      const response = await axiosAPI.get('/marks')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useMarkByIdQuery(id: string): UseQueryResult<TMark, Error> {
  return useQuery({
    queryKey: ['marks', id],
    queryFn: async (): Promise<TMark> => {
      const response = await axiosAPI.get(`/marks/${id}`)
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

export function useMarksCreateMutation(): UseMutationResult<TMark, Error, TMarkCreate> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: TMarkCreate): Promise<TMark> => {
      const response = await axiosAPI.post('/marks', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] })
      toast.success(t('mark_added_successfully') || 'Mark added successfully!')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useMarksUpdateMutation(): UseMutationResult<TMark, Error, { id: string; data: TMarkUpdate }> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TMarkUpdate }): Promise<TMark> => {
      const response = await axiosAPI.put(`/marks/${id}`, data)
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marks'] })
      queryClient.invalidateQueries({ queryKey: ['marks', variables.id] })
      toast.success(t('mark_updated_successfully') || 'Mark updated successfully!')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useMarksDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/marks/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] })
      toast.success(t('mark_deleted_successfully') || 'Mark deleted successfully!')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}


