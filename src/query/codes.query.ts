import { type UseQueryResult, type UseMutationResult, useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TCode, TCodesResponse } from "../types"
import type { GridSortModel } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

export type TCodeCreate = Omit<TCode, 'id' | 'carType'> & {
  carTypeId: string
}

export type TCodeUpdate = Omit<TCodeCreate, 'chassis'> & {
  chassis?: string | null
}

export function useCodesQuery(page: number, filters: Record<string, string>, sortModel?: GridSortModel): UseQueryResult<TCodesResponse, Error> {
  return useQuery({
    queryKey: ['codes', page, filters, sortModel],
    queryFn: async (): Promise<TCodesResponse> => {
      const params = new URLSearchParams({
        Page: String(page + 1),
        PageSize: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      });

      // Добавляем параметры сортировки
      if (sortModel && sortModel.length > 0) {
        const sort = sortModel[0];
        params.append('sortField', sort.field);
        params.append('sortDirection', sort.sort || 'asc');
      }

      const response = await axiosAPI.get(`/codes?${params.toString()}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    retry: 3,
  })
}

export function useCodeQuery(id: string): UseQueryResult<TCode, Error> {
  return useQuery({
    queryKey: ['code', id],
    queryFn: async (): Promise<TCode> => {
      const response = await axiosAPI.get(`/codes/${id}`)
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

export function useCodeCreateMutation(): UseMutationResult<TCode, Error, TCodeCreate> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TCodeCreate): Promise<TCode> => {
      const response = await axiosAPI.post(`/codes`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes'] })
      queryClient.refetchQueries({ queryKey: ['codes'] })
      toast.success(t('code_created_successfully') || 'Code created successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useCodeUpdateMutation(): UseMutationResult<TCode, Error, { id: string; data: TCodeUpdate }> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TCodeUpdate }): Promise<TCode> => {
      const response = await axiosAPI.put(`/codes/${id}`, data)
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['codes'] })
      queryClient.refetchQueries({ queryKey: ['codes'] })
      queryClient.invalidateQueries({ queryKey: ['code', variables.id] })
      toast.success(t('code_updated_successfully') || 'Code updated successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useCodeDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/codes/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes'] })
      queryClient.refetchQueries({ queryKey: ['codes'] })
      toast.success(t('code_deleted_successfully') || 'Code deleted successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}


