import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosAPI from '../utils/axiosAPI'
import type { EPriceListAdvertisementLayoutType, TPricelistLayoutUploadResponse, TPriceListLayout } from '../types'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

export function usePriceListLayoutsQuery(): UseQueryResult<TPriceListLayout[], Error> {
  return useQuery({
    queryKey: ['priceList-layouts'],
    queryFn: async (): Promise<TPriceListLayout[]> => {
      const response = await axiosAPI.get('/pricelist-layouts')
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

// Данные для отправки (ключ в FormData должен называться "files")
export type TPriceListLayoutUpload = {
  files: File[]
}

export function usePriceListLayoutsUploadMutation(): UseMutationResult<TPricelistLayoutUploadResponse, Error, TPriceListLayoutUpload> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TPriceListLayoutUpload): Promise<TPricelistLayoutUploadResponse> => {
      const formData = new FormData()
      data.files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await axiosAPI.post('/pricelist-layouts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (results) => {
      const hasAnySuccess = (results ?? []).some((x) => x.success)
      const created = (results ?? []).map((x) => x.layout).filter((x): x is TPriceListLayout => Boolean(x))

      // If backend doesn't return created layouts yet (layout=null), force refetch to update list
      if (created.length === 0) {
        queryClient.invalidateQueries({ queryKey: ['priceList-layouts'] })
      } else {
        queryClient.setQueryData<TPriceListLayout[]>(
          ['priceList-layouts'],
          (old) => {
            const prev = old ?? []
            // new/updated first, then rest
            const createdIds = new Set(created.map(x => x.id))
            const next: TPriceListLayout[] = [
              ...created,
              ...prev.filter(x => !createdIds.has(x.id)),
            ]
            // ensure uniqueness while preserving order
            const seen = new Set<string>()
            return next.filter(x => (seen.has(x.id) ? false : (seen.add(x.id), true)))
          }
        )
      }

      if (hasAnySuccess) {
        toast.success(t('pricelist_layouts_uploaded_successfully'))
      } else {
        toast.error(t('error_occurred') || 'Error!')
      }
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function usePriceListLayoutsDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/pricelist-layouts/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceList-layouts'] })
      queryClient.removeQueries({ queryKey: ['priceList-layout-schedules'] })
      toast.success(t('pricelist_layout_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export type TPriceListLayoutUpdate = {
  id: string
  layoutType: EPriceListAdvertisementLayoutType
  isActive: boolean
}

export function usePriceListLayoutsUpdateMutation(): UseMutationResult<TPriceListLayout, Error, TPriceListLayoutUpdate> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TPriceListLayoutUpdate): Promise<TPriceListLayout> => {
      const { id, layoutType, isActive } = data
      const response = await axiosAPI.put(`/pricelist-layouts/${id}`, { layoutType, isActive })
      return response.data
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<TPriceListLayout[]>(
        ['priceList-layouts'],
        (old) => {
          const prev = old ?? []
          const idx = prev.findIndex(x => x.id === updated.id)
          if (idx === -1) return [updated, ...prev]
          const next = [...prev]
          next[idx] = updated
          return next
        }
      )
    },
  })
}


