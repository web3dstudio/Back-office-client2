import { type UseQueryResult, type UseMutationResult, useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TServiceCallsResponse, TServiceCall } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

export function useServiceCallsQuery(
  page: number,
  filters: Record<string, string> = {}
): UseQueryResult<TServiceCallsResponse, Error> {
  return useQuery({
    queryKey: ['serviceCalls', page, filters],
    queryFn: async (): Promise<TServiceCallsResponse> => {
      const params = new URLSearchParams({
        Page: String(page + 1),
        PageSize: '10',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      })

      const response = await axiosAPI.get(`/serviceCalls?${params.toString()}`)
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
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
      toast.success(t('serviceCall_updated_successfully') || 'Service call updated successfully')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

