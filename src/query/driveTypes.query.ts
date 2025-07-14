import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TDriveType, TEngineType } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useDriveTypesQuery(): UseQueryResult<TDriveType[], Error> {
  return useQuery({
    queryKey: ['drive-types'],
    queryFn: async (): Promise<TDriveType[]> => {
      const response = await axiosAPI.get('/driveTypes')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useDriveTypesAddMutation(): UseMutationResult<TDriveType, Error, Omit<TDriveType, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newDriveType: Omit<TDriveType, 'id'>): Promise<TDriveType> => {
      const response = await axiosAPI.post('/driveTypes', newDriveType)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['drive-types'] })
      toast.success(t('drive_type_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useDriveTypesUpdateMutation(): UseMutationResult<TDriveType, Error, TDriveType> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedDriveType: TDriveType): Promise<TDriveType> => {
      const response = await axiosAPI.put(`/driveTypes/${updatedDriveType.id}`, updatedDriveType)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['drive-types'] })
      toast.success(t('drive_type_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useDriveTypesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/driveTypes/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['drive-types'] })
      toast.success(t('drive_type_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
