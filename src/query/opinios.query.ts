import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TOpinion, TOpinionResponse } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useOpinionsQuery(page: number, filters: Record<string, string>): UseQueryResult<TOpinionResponse, Error> {
  return useQuery({
    queryKey: ['opinions', page, filters],
    queryFn: async (): Promise<TOpinionResponse> => {
      const params = new URLSearchParams({
        Page: String(page + 1),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      });
      const response = await axiosAPI.get(`/opinions?${params.toString()}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData, // ВАЖНО!!! НЕ ТРОГАТЬ!!!
    retry: 3,
  })
}

export function useOpinionsAddMutation(): UseMutationResult<TOpinion, Error, Omit<TOpinion, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newOpinion: Omit<TOpinion, 'id'>): Promise<TOpinion> => {
      const response = await axiosAPI.post('/opinions', newOpinion)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['opinions'] })
      toast.success(t('opinion_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useOpinionsUpdateMutation(): UseMutationResult<TOpinion, Error, TOpinion> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedOpinion: TOpinion): Promise<TOpinion> => {
      const response = await axiosAPI.put(`/opinions/${updatedOpinion.id}`, updatedOpinion)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['opinions'] })
      toast.success(t('opinion_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useOpinionsDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/opinions/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['opinions'] })
      toast.success(t('opinion_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
