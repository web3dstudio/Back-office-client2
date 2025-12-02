import { type UseQueryResult, type UseMutationResult, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { GridSortModel } from "@mui/x-data-grid"
import type { TSupportArticlesResponse, TSupportArticle } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

export function useSupportArticlesQuery(
  page: number,
  filters: Record<string, string> = {},
  sortModel?: GridSortModel
): UseQueryResult<TSupportArticlesResponse, Error> {
  return useQuery({
    queryKey: ['supportArticles', page, filters, sortModel],
    queryFn: async (): Promise<TSupportArticlesResponse> => {
      const params = new URLSearchParams({
        Page: String(page + 1),
        PageSize: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      })

      // Добавляем параметры сортировки
      if (sortModel && sortModel.length > 0) {
        const sort = sortModel[0]
        params.append('sortField', sort.field)
        params.append('sortDirection', sort.sort || 'asc')
      }

      const response = await axiosAPI.get(`/supportArticles?${params.toString()}`)
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useSupportArticleQuery(id: string): UseQueryResult<TSupportArticle, Error> {
  return useQuery({
    queryKey: ['supportArticle', id],
    queryFn: async (): Promise<TSupportArticle> => {
      const response = await axiosAPI.get(`/supportArticles/${id}`)
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
    enabled: !!id,
  })
}

export type TSupportArticleCategory = {
  id: string
  name: string
}

export function useSupportArticleCategoriesQuery(): UseQueryResult<TSupportArticleCategory[], Error> {
  return useQuery({
    queryKey: ['supportArticleCategories'],
    queryFn: async (): Promise<TSupportArticleCategory[]> => {
      const response = await axiosAPI.get('/supportArticles/categories')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useSupportArticleCategoryAddMutation(): UseMutationResult<TSupportArticleCategory, Error, Omit<TSupportArticleCategory, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newCategory: Omit<TSupportArticleCategory, 'id'>): Promise<TSupportArticleCategory> => {
      const response = await axiosAPI.post('/supportArticles/categories', newCategory)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['supportArticleCategories'] })
      toast.success(t('category_added_successfully') || 'Category added successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useSupportArticleCategoryUpdateMutation(): UseMutationResult<TSupportArticleCategory, Error, TSupportArticleCategory> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedCategory: TSupportArticleCategory): Promise<TSupportArticleCategory> => {
      const response = await axiosAPI.put(`/supportArticles/categories/${updatedCategory.id}`, updatedCategory)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['supportArticleCategories'] })
      toast.success(t('category_updated_successfully') || 'Category updated successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useSupportArticleCategoryDeleteMutation(): UseMutationResult<string, Error, { id: string; replaceWithCategoryId?: string }> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, replaceWithCategoryId }: { id: string; replaceWithCategoryId?: string }): Promise<string> => {
      const params = replaceWithCategoryId ? `?replaceWithCategoryId=${replaceWithCategoryId}` : ''
      await axiosAPI.delete(`/supportArticles/categories/${id}${params}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['supportArticleCategories'] })
      queryClient.invalidateQueries({ queryKey: ['supportArticles'] })
      toast.success(t('category_deleted_successfully') || 'Category deleted successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export type TSupportArticleCreateData = {
  title: string
  application: number
  supportArticleCategoryId: string
  content: string
}

export function useSupportArticleCreateMutation(): UseMutationResult<TSupportArticle, Error, TSupportArticleCreateData> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TSupportArticleCreateData): Promise<TSupportArticle> => {
      const response = await axiosAPI.post('/supportArticles', data)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['supportArticles'] })
      queryClient.refetchQueries({ queryKey: ['supportArticles'] })
      toast.success(t('article_added_successfully') || 'Article added successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useSupportArticleUpdateMutation(): UseMutationResult<TSupportArticle, Error, { id: string; data: TSupportArticleCreateData }> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TSupportArticleCreateData }): Promise<TSupportArticle> => {
      const payload = {
        ...data,
        id,
      }
      const response = await axiosAPI.put(`/supportArticles/${id}`, payload)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['supportArticles'] })
      queryClient.invalidateQueries({ queryKey: ['supportArticle'] })
      queryClient.refetchQueries({ queryKey: ['supportArticles'] })
      toast.success(t('article_updated_successfully') || 'Article updated successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useSupportArticleDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/supportArticles/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['supportArticles'] })
      queryClient.refetchQueries({ queryKey: ['supportArticles'] })
      toast.success(t('article_deleted_successfully') || 'Article deleted successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

