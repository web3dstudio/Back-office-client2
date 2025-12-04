import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TAdvertisement } from '../types'
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useAdvertisementsQuery(): UseQueryResult<TAdvertisement[], Error> {
  return useQuery({
    queryKey: ['advertisements'],
    queryFn: async (): Promise<TAdvertisement[]> => {
      const response = await axiosAPI.get('/advertisements')
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

export type TAdvertisementCreateData = {
  pageType: number
  dock: number
  pageNumber?: number | null
  link: string | null
  script: string | null
  file?: File | null
  id?: string
}

export function useAdvertisementAddMutation(): UseMutationResult<TAdvertisement, Error, TAdvertisementCreateData> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (advertisement: TAdvertisementCreateData): Promise<TAdvertisement> => {
      const formData = new FormData()

      const { file, ...advertisementData } = advertisement

      // Добавляем поля напрямую в FormData
      formData.append('PageType', String(advertisementData.pageType))
      formData.append('Dock', String(advertisementData.dock))

      if (advertisementData.pageNumber !== undefined && advertisementData.pageNumber !== null) {
        formData.append('PageNumber', String(advertisementData.pageNumber))
      }

      if (advertisementData.link) {
        formData.append('Link', advertisementData.link)
      }

      if (advertisementData.script) {
        formData.append('Script', advertisementData.script)
      }

      // Добавляем файл изображения, если он выбран
      if (file) {
        formData.append('ImageFile', file)
      }

      const response = await axiosAPI.post('/advertisements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      toast.success(t('advertisement_added_successfully') || 'Advertisement added successfully!')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useAdvertisementUpdateMutation(): UseMutationResult<TAdvertisement, Error, TAdvertisementCreateData> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (advertisement: TAdvertisementCreateData): Promise<TAdvertisement> => {
      const formData = new FormData()

      const { file, id, ...advertisementData } = advertisement

      // Добавляем поля напрямую в FormData
      formData.append('PageType', String(advertisementData.pageType))
      formData.append('Dock', String(advertisementData.dock))

      if (advertisementData.pageNumber !== undefined && advertisementData.pageNumber !== null) {
        formData.append('PageNumber', String(advertisementData.pageNumber))
      }

      if (advertisementData.link) {
        formData.append('Link', advertisementData.link)
      }

      if (advertisementData.script) {
        formData.append('Script', advertisementData.script)
      }

      // Добавляем файл изображения, если он выбран
      if (file) {
        formData.append('ImageFile', file)
      }

      const response = await axiosAPI.put(`/advertisements/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      toast.success(t('advertisement_updated_successfully') || 'Advertisement updated successfully!')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useAdvertisementDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/advertisements/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      toast.success(t('advertisement_deleted_successfully') || 'Advertisement deleted successfully!')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

