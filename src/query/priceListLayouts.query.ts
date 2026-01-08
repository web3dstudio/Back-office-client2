import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosAPI from '../utils/axiosAPI'
import type { TPriceListLayout } from '../types'

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

export function usePriceListLayoutsUploadMutation(): UseMutationResult<TPriceListLayout[], Error, TPriceListLayoutUpload> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TPriceListLayoutUpload): Promise<TPriceListLayout[]> => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceList-layouts'] })
    },
  })
}


