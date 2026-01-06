import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TBodyType } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useBodyTypesQuery(): UseQueryResult<TBodyType[], Error> {
  return useQuery({
    queryKey: ['body-types'],
    queryFn: async (): Promise<TBodyType[]> => {
      const response = await axiosAPI.get('/bodyTypes')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useBodyTypeQuery(id: string): UseQueryResult<TBodyType, Error> {
  return useQuery({
    queryKey: ['body-type', id],
    queryFn: async (): Promise<TBodyType> => {
      const response = await axiosAPI.get(`/bodyTypes/${id}`)
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

export function useBodyTypesAddMutation(): UseMutationResult<TBodyType, Error, Omit<TBodyType, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newBodyType: Omit<TBodyType, 'id'>): Promise<TBodyType> => {
      const response = await axiosAPI.post('/bodyTypes', newBodyType)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-types'] })
      toast.success(t('body_type_added_successfully') || 'Body type added successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useBodyTypesUpdateMutation(): UseMutationResult<TBodyType, Error, TBodyType> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedBodyType: TBodyType): Promise<TBodyType> => {
      const response = await axiosAPI.put(`/bodyTypes/${updatedBodyType.id}`, updatedBodyType)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-types'] })
      toast.success(t('body_type_updated_successfully') || 'Body type updated successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useBodyTypesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/bodyTypes/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-types'] })
      toast.success(t('body_type_deleted_successfully') || 'Body type deleted successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}


