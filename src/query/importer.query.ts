import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TImporter } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useImportersQuery(): UseQueryResult<TImporter[], Error> {
  return useQuery({
    queryKey: ['importers'],
    queryFn: async (): Promise<TImporter[]> => {
      const response = await axiosAPI.get('/importers')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useImportersAddMutation(): UseMutationResult<TImporter, Error, Omit<TImporter, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newImporter: Omit<TImporter, 'id'>): Promise<TImporter> => {
      const response = await axiosAPI.post('/importers', newImporter)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['importers'] })
      toast.success(t('importer_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useImportersUpdateMutation(): UseMutationResult<TImporter, Error, TImporter> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedImporter: TImporter): Promise<TImporter> => {
      const response = await axiosAPI.put(`/importers/${updatedImporter.id}`, updatedImporter)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['importers'] })
      toast.success(t('importer_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useImportersDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/importers/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['importers'] })
      toast.success(t('importer_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
