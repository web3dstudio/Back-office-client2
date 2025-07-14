import type { TMileageAppreciation } from "../types"
import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'


export function useMileageAppreciationsQuery(): UseQueryResult<TMileageAppreciation[], Error> {
  return useQuery({
    queryKey: ['mileageAppreciations'],
    queryFn: async (): Promise<TMileageAppreciation[]> => {
      const response = await axiosAPI.get('/mileageAppreciations')
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

export function useUpdateMileageAppreciationsMutation(): UseMutationResult<TMileageAppreciation, Error, { id: string, mileageThreshold: number }> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string, mileageThreshold: number }): Promise<TMileageAppreciation> => {
      const response = await axiosAPI.put(`/mileageAppreciations/${params.id}`, { mileageThreshold: params.mileageThreshold })
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['mileageAppreciations'] })
      toast.success(t('mileage_appreciation_updated_successfully'))
    },
    onError: (_error) => {
      toast.error(t('mileage_appreciation_update_failed'))
    },
  })
}