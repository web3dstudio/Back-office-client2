import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TCarType } from '../types'
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useCarTypesQuery(): UseQueryResult<TCarType[], Error> {
  return useQuery({
    queryKey: ['carTypes'],
    queryFn: async (): Promise<TCarType[]> => {
      const response = await axiosAPI.get('/carTypes')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    retry: 3,
  })
}

export function useCarTypeDeleteMutation(): UseMutationResult<
  void,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axiosAPI.delete(`/carTypes/${id}`)
    },
    retry: 3,
    onSuccess: (_, id) => {
      // Удаляем элемент из кэша
      queryClient.setQueryData<TCarType[]>(['carTypes'], (oldData) => {
        if (!oldData) return []
        return oldData.filter((carType) => carType.id !== id)
      })

      toast.success(t('carType_deleted_successfully') || 'Car type deleted successfully!')
    },
    onError: (error: Error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    }
  })
}

export function useCarTypeAddMutation(): UseMutationResult<
  TCarType,
  Error,
  Omit<TCarType, 'id'>,
  unknown
> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async (newCarType: Omit<TCarType, 'id'>): Promise<TCarType> => {
      const response = await axiosAPI.post('/carTypes', newCarType)
      return response.data
    },
    retry: 3,
    onSuccess: (newCarType) => {
      // Добавляем новый объект в кэш
      queryClient.setQueryData<TCarType[]>(['carTypes'], (oldData) => {
        if (!oldData) return [newCarType]
        return [...oldData, newCarType]
      })

      toast.success(t('carType_added_successfully') || 'Car type added successfully!')
    },
    onError: (error: Error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    }
  })
}


export function useCarTypeUpdateMutation(): UseMutationResult<
  TCarType,
  Error,
  TCarType,
  unknown
> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async (updatedCarType: TCarType): Promise<TCarType> => {
      const response = await axiosAPI.put(`/carTypes/${updatedCarType.id}`, updatedCarType)
      return response.data
    },
    retry: 3,
    onSuccess: (updatedCarType) => {
      // Обновляем объект в кэше
      queryClient.setQueryData<TCarType[]>(['carTypes'], (oldData) => {
        if (!oldData) return [updatedCarType]
        return oldData.map((carType) =>
          carType.id === updatedCarType.id ? updatedCarType : carType
        )
      })

      toast.success(t('carType_updated_successfully') || 'Car type updated successfully!')
    },
    onError: (error: Error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    }
  })
}


