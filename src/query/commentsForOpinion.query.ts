import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TCommentsForOpinion } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useCommentsForOpinionQuery(): UseQueryResult<TCommentsForOpinion[], Error> {
  return useQuery({
    queryKey: ['comments-for-opinion'],
    queryFn: async (): Promise<TCommentsForOpinion[]> => {
      const response = await axiosAPI.get('/commentsForOpinion')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useCommentsForOpinionAddMutation(): UseMutationResult<TCommentsForOpinion, Error, Omit<TCommentsForOpinion, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newCommentsForOpinion: Omit<TCommentsForOpinion, 'id'>): Promise<TCommentsForOpinion> => {
      const response = await axiosAPI.post('/commentsForOpinion', newCommentsForOpinion)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['comments-for-opinion'] })
      toast.success(t('comments_for_opinion_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useCommentsForOpinionUpdateMutation(): UseMutationResult<TCommentsForOpinion, Error, TCommentsForOpinion> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedCommentsForOpinion: TCommentsForOpinion): Promise<TCommentsForOpinion> => {
      const response = await axiosAPI.put(`/commentsForOpinion/${updatedCommentsForOpinion.id}`, updatedCommentsForOpinion)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['comments-for-opinion'] })
      toast.success(t('comments_for_opinion_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useCommentsForOpinionDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/commentsForOpinion/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['comments-for-opinion'] })
      toast.success(t('comments_for_opinion_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
