import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TCode, TCodeFromApi, TCodesSyncResponse } from "../types"
import type { TCodeCreate } from "./codes.query"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

export function useCodesFromApiQuery(): UseQueryResult<TCodeFromApi[], Error> {
  return useQuery({
    queryKey: ['codesFromApi'],
    queryFn: async (): Promise<TCodeFromApi[]> => {
      const response = await axiosAPI.get('/codesFromApi')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useCodesSyncQuery(years: string[]): UseQueryResult<TCodesSyncResponse, Error> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useQuery({
    queryKey: ['syncCodes', years],
    queryFn: async (): Promise<TCodesSyncResponse> => {
      const query = years.length ? `?years=${years.join(',')}` : ''
      const response = await axiosAPI.get(`/codesFromApi/sync${query}`)

      // После успешного запроса инвалидируем кеш и показываем toast
      queryClient.invalidateQueries({ queryKey: ['codesFromApi'] })
      toast.success(t('codes_sync_successfully', { defaultValue: 'Codes sync successfully!' }))

      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 1,
    enabled: false,
  })
}

export function useCodeAddMutation(): UseMutationResult<
  TCode,
  Error,
  TCodeCreate,
  unknown
> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async (newCode: TCodeCreate): Promise<TCode> => {
      const response = await axiosAPI.post('/codes', newCode)
      return response.data
    },
    retry: 3,
    onSuccess: (_newCode: TCode) => {
      // queryClient.invalidateQueries({ queryKey: ['codesFromApi'] })
      queryClient.invalidateQueries({ queryKey: ['codes'] })
      toast.success(t('code_added_successfully') || 'Code added successfully!')
    },
    onError: (error: Error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    }
  })
}

export function useCodeDeleteMutation(): UseMutationResult<
  any,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async (codeId: string): Promise<any> => {
      await axiosAPI.delete(`/codes/${codeId}`)
    },
    retry: 3,
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['codesFromApi'] })
      queryClient.invalidateQueries({ queryKey: ['codes'] })
      toast.success(t('code_deleted_successfully') || 'Code deleted successfully!')
    },
    onError: (error: Error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    }
  })
}

