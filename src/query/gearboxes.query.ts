import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TGearbox } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useGearboxesQuery(): UseQueryResult<TGearbox[], Error> {
  return useQuery({
    queryKey: ['gearboxes'],
    queryFn: async (): Promise<TGearbox[]> => {
      const response = await axiosAPI.get('/gearboxes')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useGearboxesAddMutation(): UseMutationResult<TGearbox, Error, Omit<TGearbox, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newGearbox: Omit<TGearbox, 'id'>): Promise<TGearbox> => {
      const response = await axiosAPI.post('/gearboxes', newGearbox)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['gearboxes'] })
      toast.success(t('gearbox_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useGearboxesUpdateMutation(): UseMutationResult<TGearbox, Error, TGearbox> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedGearbox: TGearbox): Promise<TGearbox> => {
      const response = await axiosAPI.put(`/gearboxes/${updatedGearbox.id}`, updatedGearbox)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['gearboxes'] })
      toast.success(t('gearbox_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useGearboxesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/gearboxes/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['gearboxes'] })
      toast.success(t('gearbox_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
