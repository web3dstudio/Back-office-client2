import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TCountry } from '../types'
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'


export function useCountriesQuery(): UseQueryResult<TCountry[], Error> {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async (): Promise<TCountry[]> => {
      const response = await axiosAPI.get('/countries')
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

export function useCountriesDeleteMutation(): UseMutationResult<
  void,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axiosAPI.delete(`/countries/${id}`)
    },
    retry: 3,
    onSuccess: (_, id) => {
      // Удаляем элемент из кэша
      queryClient.setQueryData<TCountry[]>(['countries'], (oldData) => {
        if (!oldData) return []
        return oldData.filter((country) => country.id !== id)
      })

      toast.success(t('country_deleted_successfully') || 'Country deleted successfully!')
    },
    onError: (error: Error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    }
  })
}

export function useCountriesAddMutation(): UseMutationResult<
  TCountry,
  Error,
  Omit<TCountry, 'id'>,
  unknown
> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async (newCountry: Omit<TCountry, 'id'>): Promise<TCountry> => {
      const response = await axiosAPI.post('/countries/', newCountry)
      return response.data
    },
    retry: 3,
    onSuccess: (newCountry) => {
      // Добавляем новый объект в кэш
      queryClient.setQueryData<TCountry[]>(['countries'], (oldData) => {
        if (!oldData) return [newCountry]
        return [...oldData, newCountry]
      })

      toast.success(t('country_added_successfully') || 'Country added successfully!')
    },
    onError: (error: Error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    }
  })
}


export function useCountriesUpdateMutation(): UseMutationResult<
  TCountry,
  Error,
  TCountry,
  unknown
> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async (updatedCountry: TCountry): Promise<TCountry> => {
      // Отправляем только id вместо объекта в priceListType
      const payload = {
        ...updatedCountry,
      };
      const response = await axiosAPI.put(`/countries/${updatedCountry.id}`, payload)
      return response.data
    },
    retry: 3,
    onSuccess: (updatedCountry) => {
      // Обновляем объект в кэше
      queryClient.setQueryData<TCountry[]>(['countries'], (oldData) => {
        if (!oldData) return [updatedCountry]
        return oldData.map((country) =>
          country.id === updatedCountry.id ? updatedCountry : country
        )
      })

      toast.success(t('country_updated_successfully') || 'Country updated successfully!')
    },
    onError: (error: Error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    }
  })
}


