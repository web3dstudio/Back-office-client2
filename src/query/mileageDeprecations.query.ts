import type { TMileageDepreciation } from "../types"
import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'


export function useMileageDepreciationsQuery(): UseQueryResult<TMileageDepreciation[], Error> {
  return useQuery({
    queryKey: ['mileageDepreciations'],
    queryFn: async (): Promise<TMileageDepreciation[]> => {
      const response = await axiosAPI.get('/mileageDepreciations')
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

export function useUpdateMileageDepreciationsMutation(): UseMutationResult<TMileageDepreciation, Error, { id: string, mileageThreshold: number }> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string, mileageThreshold: number }): Promise<TMileageDepreciation> => {
      const response = await axiosAPI.put(`/mileageDepreciations/${params.id}`, { mileageThreshold: params.mileageThreshold })
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['mileageDepreciations'] })
      toast.success(t('mileage_depreciation_updated_successfully'))
    },
    onError: (_error) => {
      toast.error(t('mileage_depreciation_update_failed'))
    },
  })
}