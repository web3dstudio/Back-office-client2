import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TAverageMileage } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'


export function useAverageMileagesQuery(): UseQueryResult<TAverageMileage[], Error> {
  return useQuery({
    queryKey: ['averageMileages'],
    queryFn: async (): Promise<TAverageMileage[]> => {
      const response = await axiosAPI.get('/averageMileages')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

type TParams = {
  field: "averageMileageMin" | "averageMileageMax",
  id: string,
  value: number,
}

export function useUpdateAverageMileagesMutation(): UseMutationResult<TAverageMileage, Error, TParams> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: TParams): Promise<TAverageMileage> => {
      const { id, field, value } = params
      const response = await axiosAPI.put(`/averageMileages/${id}`, { field: field, value: value })
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['averageMileages'] })
      toast.success(t('average_mileage_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}