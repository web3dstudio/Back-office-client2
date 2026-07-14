import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TExtra } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

export type TExtraSeriesRuleUpsert = {
  id?: string
  manufacturerSeriesId: string | null
  appliesToAllSeries: boolean
  fromYear: number | null
  toYear: number | null
  changePercentage: number | null
}

export type TExtraUpsert = {
  id?: string
  name: string
  nameEn: string
  defaultChangePercentage: number
  sortIndex: number
  iconId: string | null
  manufacturerId: string | null
  extraSeriesRules: TExtraSeriesRuleUpsert[]
}

export type TFilteredExtrasForCarParams = {
  manufacturerId: string
  seriesId?: string
  year?: number
  includeExtraIds?: string[]
}

export function useExtrasQuery(): UseQueryResult<TExtra[], Error> {
  return useQuery({
    queryKey: ['extras'],
    queryFn: async (): Promise<TExtra[]> => {
      const response = await axiosAPI.get('/extras')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useFilteredExtrasForCarQuery(
  params: TFilteredExtrasForCarParams | null
): UseQueryResult<TExtra[], Error> {
  const enabled = !!params?.manufacturerId

  return useQuery({
    queryKey: [
      'extras',
      'filtered',
      params?.manufacturerId,
      params?.seriesId,
      params?.year,
      params?.includeExtraIds,
    ],
    queryFn: async (): Promise<TExtra[]> => {
      const response = await axiosAPI.get('/extras/filtered', {
        params: {
          manufacturerId: params!.manufacturerId,
          ...(params!.seriesId ? { seriesId: params!.seriesId } : {}),
          ...(params!.year && params!.year > 0 ? { year: params!.year } : {}),
          includeExtraIds: params!.includeExtraIds,
        },
        paramsSerializer: {
          indexes: null,
        },
      })
      return response.data
    },
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 0,
    retry: 3,
  })
}

export function useExtrasAddMutation(): UseMutationResult<TExtra, Error, Omit<TExtraUpsert, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newExtra: Omit<TExtraUpsert, 'id'>): Promise<TExtra> => {
      const response = await axiosAPI.post('/extras', newExtra)
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['extras'] })
      queryClient.invalidateQueries({ queryKey: ['extras', 'filtered'] })
      // Manufacturer edit caches forever (staleTime: Infinity, refetchOnMount: false) —
      // drop detail cache so seriesExtras reload after extra/rules change.
      if (variables.manufacturerId) {
        queryClient.removeQueries({ queryKey: ['manufacturer', variables.manufacturerId] })
      } else {
        queryClient.removeQueries({ queryKey: ['manufacturer'] })
      }
      toast.success(t('extra_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useExtrasUpdateMutation(): UseMutationResult<TExtra, Error, TExtraUpsert & { id: string }> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedExtra: TExtraUpsert & { id: string }): Promise<TExtra> => {
      const response = await axiosAPI.put(`/extras/${updatedExtra.id}`, updatedExtra)
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['extras'] })
      queryClient.invalidateQueries({ queryKey: ['extras', 'filtered'] })
      if (variables.manufacturerId) {
        queryClient.removeQueries({ queryKey: ['manufacturer', variables.manufacturerId] })
      } else {
        queryClient.removeQueries({ queryKey: ['manufacturer'] })
      }
      toast.success(t('extra_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useExtrasDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/extras/${id}`)
      return id
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<TExtra[]>(['extras'], (old) => {
        if (!old) return old
        return old.filter((x) => x.id !== deletedId)
      })
      queryClient.invalidateQueries({ queryKey: ['extras'] })
      queryClient.invalidateQueries({ queryKey: ['extras', 'filtered'] })
      queryClient.removeQueries({ queryKey: ['manufacturer'] })
      toast.success(t('extra_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
