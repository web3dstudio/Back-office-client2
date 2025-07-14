import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TEngineType } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useEngineTypesQuery(): UseQueryResult<TEngineType[], Error> {
  return useQuery({
    queryKey: ['engine-types'],
    queryFn: async (): Promise<TEngineType[]> => {
      const response = await axiosAPI.get('/engineTypes')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useEngineTypesAddMutation(): UseMutationResult<TEngineType, Error, Omit<TEngineType, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newEngineType: Omit<TEngineType, 'id'>): Promise<TEngineType> => {
      const response = await axiosAPI.post('/engineTypes', newEngineType)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['engine-types'] })
      toast.success(t('engine_type_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useEngineTypesUpdateMutation(): UseMutationResult<TEngineType, Error, TEngineType> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedEngineType: TEngineType): Promise<TEngineType> => {
      const response = await axiosAPI.put(`/engineTypes/${updatedEngineType.id}`, updatedEngineType)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['engine-types'] })
      toast.success(t('engine_type_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useEngineTypesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/engineTypes/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['engine-types'] })
      toast.success(t('engine_type_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
