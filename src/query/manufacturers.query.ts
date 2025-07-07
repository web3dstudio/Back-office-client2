import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TManufacturer } from '../types'
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useManufacturersQuery(): UseQueryResult<TManufacturer[], Error> {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: async (): Promise<TManufacturer[]> => {
      const response = await axiosAPI.get('/manufacturers/list')
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

export function useManufacturerQuery(id: string): UseQueryResult<TManufacturer, Error> {
  return useQuery({
    queryKey: ['manufacturer', id],
    queryFn: async (): Promise<TManufacturer> => {
      const response = await axiosAPI.get(`/manufacturers/${id}`)
      return response.data
    },
  })
}


type TManufacturerWithFiles = TManufacturer & { files?: FileList }

export function useManufacturerAddMutation(): UseMutationResult<TManufacturer, Error, TManufacturerWithFiles> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (manufacturer: TManufacturerWithFiles): Promise<TManufacturer> => {
      const formData = new FormData();

      Object.entries(manufacturer).forEach(([key, value]) => {
        if (key !== 'files') {
          formData.append(key, value as any);
        }
      });

      // Добавляем файлы, если есть
      if (manufacturer.files) {
        for (const file of manufacturer.files) {
          formData.append('files', file);
        }
      }

      const response = await axiosAPI.post('/manufacturers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
      toast.success(t('manufacturer_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}


export function useManufacturerDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/manufacturers/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
      toast.success(t('manufacturer_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export default function useManufacturerSeriesModelsMutation(): UseMutationResult<TManufacturer, Error, TManufacturer> {
  const { t } = useTranslation('notifications')
  return useMutation({
    mutationFn: async (manufacturer: TManufacturer): Promise<TManufacturer> => {
      const response = await axiosAPI.post(`/manufacturers/upsert`, manufacturer)
      return response.data
    },
    onSuccess: (_data) => {
      toast.success(t('manufacturer_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

