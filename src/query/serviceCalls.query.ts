import { type UseQueryResult, type UseMutationResult, type UseInfiniteQueryResult, useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TServiceCallsResponse, TServiceCall, TServiceCallsStats } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

export function useServiceCallsInfiniteQuery(
  filters: Record<string, string> = {}
): UseInfiniteQueryResult<TServiceCallsResponse, Error> {
  return useInfiniteQuery({
    queryKey: ['serviceCalls', filters],
    queryFn: async ({ pageParam = 0 }): Promise<TServiceCallsResponse> => {
      const params = new URLSearchParams({
        Page: String(pageParam + 1),
        PageSize: '10',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      })

      const response = await axiosAPI.get(`/serviceCalls?${params.toString()}`)
      return response.data
    },
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = allPages.length < lastPage.totalPagesNumber
      return hasMore ? allPages.length : undefined
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  })
}

export function useServiceCallsStatsQuery(): UseQueryResult<TServiceCallsStats, Error> {
  return useQuery({
    queryKey: ['serviceCallsStats'],
    queryFn: async (): Promise<TServiceCallsStats> => {
      const response = await axiosAPI.get(`/serviceCalls/stats`)
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useServiceCallQuery(id: string): UseQueryResult<TServiceCall, Error> {
  return useQuery({
    queryKey: ['serviceCall', id],
    queryFn: async (): Promise<TServiceCall> => {
      const response = await axiosAPI.get(`/serviceCalls/${id}`)
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

export function useServiceCallUpdateStatusMutation(): UseMutationResult<TServiceCall, Error, { id: string; status: number }> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }): Promise<TServiceCall> => {
      const response = await axiosAPI.post(`/serviceCalls/${id}/${status}`)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['serviceCalls'] })
      queryClient.refetchQueries({ queryKey: ['serviceCalls'] })
      queryClient.invalidateQueries({ queryKey: ['serviceCallsStats'] })
      queryClient.refetchQueries({ queryKey: ['serviceCallsStats'] })
      toast.success(t('serviceCall_updated_successfully') || 'Service call updated successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

