import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TCategory } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export function useCategoriesQuery(): UseQueryResult<TCategory[], Error> {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<TCategory[]> => {
      const response = await axiosAPI.get('/categories')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useCategoriesAddMutation(): UseMutationResult<TCategory, Error, Omit<TCategory, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newCategory: Omit<TCategory, 'id'>): Promise<TCategory> => {
      const response = await axiosAPI.post('/categories', newCategory)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('category_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useCategoriesUpdateMutation(): UseMutationResult<TCategory, Error, TCategory> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedCategory: TCategory): Promise<TCategory> => {
      const response = await axiosAPI.put(`/categories/${updatedCategory.id}`, updatedCategory)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('category_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useCategoriesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/categories/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('category_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
