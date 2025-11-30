import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TIcon } from '../types'
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"


export function useIconsQuery(): UseQueryResult<TIcon[], Error> {
  return useQuery({
    queryKey: ['icons'],
    queryFn: async (): Promise<TIcon[]> => {
      const response = await axiosAPI.get('/icons')
      return response.data ?? []
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    retry: 3,
  })
}

export function useUploadIconMutation(): UseMutationResult<TIcon, Error, FileList> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData()
      for (const file of files) {
        formData.append('files', file)
        formData.append('fileNames', file.name);
      }

      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axiosAPI.post('/icons', formData)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['icons'] })
      toast.success(t('icon_uploaded_successfully') || 'Icon uploaded successfully!')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useDeleteIconMutation(): UseMutationResult<any, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosAPI.delete(`/icons/${id}`)
      return response.data.data
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<any[]>(['icons'], (old) =>
        old ? old.filter(icon => icon.id !== id) : []
      )
      toast.success(t('icon_deleted_successfully') || 'Icon deleted successfully!')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}