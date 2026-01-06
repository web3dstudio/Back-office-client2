import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TManufacturer, ManufacturerCode, ManufacturerCodeUpsertDto } from '../types'
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

export function useManufacturersWithSeriesAndModelsQuery(): UseQueryResult<TManufacturer[], Error> {
  return useQuery({
    queryKey: ['manufacturers-names'],
    queryFn: async (): Promise<TManufacturer[]> => {
      const response = await axiosAPI.get('/manufacturers/names')
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
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    retry: 3,
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
      const manufacturerPayload = {
        ...manufacturer,
        serieses: Array.isArray((manufacturer as any)?.serieses)
          ? (manufacturer as any).serieses.map((serie: any) => ({
            ...serie,
            models: Array.isArray(serie?.models)
              ? serie.models.map((model: any) => {
                const { engineType, ...rest } = model
                return {
                  ...rest,
                  engineTypeId: engineType?.id ?? null,
                }
              })
              : serie?.models,
          }))
          : (manufacturer as any)?.serieses,
      }

      const response = await axiosAPI.post(`/manufacturers/upsert`, manufacturerPayload)
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

export function useManufacturerCodesMutation(): UseMutationResult<ManufacturerCode[], Error, { manufacturerId: string, codes: ManufacturerCodeUpsertDto[] }> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ manufacturerId, codes }: { manufacturerId: string, codes: ManufacturerCodeUpsertDto[] }): Promise<ManufacturerCode[]> => {
      const response = await axiosAPI.put(`/manufacturers/${manufacturerId}/codes`, codes)
      return response.data
    },
    onSuccess: (data, variables) => {
      const updatedCodes = Array.isArray(data) ? [...data] : []

      // Обновляем только поле codes у открытого производителя
      queryClient.setQueryData<TManufacturer>(['manufacturer', variables.manufacturerId], (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            codes: updatedCodes
          }
        }
        return oldData
      })

      // Обновляем только поле codes у этого производителя в списке всех производителей
      queryClient.setQueryData<TManufacturer[]>(['manufacturers'], (oldData) => {
        if (!oldData) return oldData

        const manufacturerIndex = oldData.findIndex(m => m.id === variables.manufacturerId)
        if (manufacturerIndex === -1) return oldData

        const updated = [...oldData]
        updated[manufacturerIndex] = {
          ...updated[manufacturerIndex],
          codes: updatedCodes
        }

        return updated
      })

      // Инвалидируем и перезапрашиваем запросы для принудительного обновления UI
      queryClient.invalidateQueries({ queryKey: ['manufacturer', variables.manufacturerId] })
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
      queryClient.refetchQueries({ queryKey: ['manufacturers'] })

      toast.success(t('manufacturer_codes_updated_successfully') || 'Codes updated successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

