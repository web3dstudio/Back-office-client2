import { type UseQueryResult, type UseMutationResult, useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import type { TPriceChange } from '../types'

export type TPriceChangeCreate = Omit<TPriceChange, 'id'> & {
  countryId: string | null
  from: string | null
  to: string | null
}

export function usePriceChangesQuery(countryId: string | null): UseQueryResult<TPriceChange[], Error> {
  return useQuery({
    queryKey: ['priceChanges', countryId],
    queryFn: async (): Promise<TPriceChange[]> => {
      if (!countryId) {
        return []
      }
      const response = await axiosAPI.get(`/priceChanges/${countryId}`)
      return response.data
    },
    enabled: !!countryId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    retry: 3,
  })
}

export function usePriceChangeCreateMutation(): UseMutationResult<TPriceChange[], Error, (TPriceChangeCreate | (TPriceChangeCreate & { id: string }))[]> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async (data: (TPriceChangeCreate | (TPriceChangeCreate & { id: string }))[]): Promise<TPriceChange[]> => {
      const response = await axiosAPI.post('/priceChanges', data)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['priceChanges'] })
      toast.success(t('priceChange_added_successfully', { defaultValue: 'Price change added successfully' }))
    },
    onError: () => {
      toast.error(t('priceChange_added_failed', { defaultValue: 'Failed to add price change' }))
    },
  })
}

