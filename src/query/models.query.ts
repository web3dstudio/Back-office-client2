import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TModel, TPartialModelUpdateParams } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'


export function useModelsQuery(): UseQueryResult<TModel[], Error> {
  return useQuery({
    queryKey: ['models'],
    queryFn: async (): Promise<TModel[]> => {
      const response = await axiosAPI.get('/models')
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

export function useModelPatchMutation(): UseMutationResult<TModel, Error, { id: string; params: TPartialModelUpdateParams }, unknown> {

  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async ({ id, params }: { id: string; params: TPartialModelUpdateParams }): Promise<TModel> => {
      const response = await axiosAPI.patch('/models/' + id, params);
      return response.data;
    },
    retry: 3,
    onSuccess: (response: TModel) => {

      queryClient.setQueryData<TModel[]>(['models'], (oldData) => {
        if (!oldData) return []
        return oldData.map((model) => (model.id === response.id ? response : model))
      })
      toast.success(t('model_updated_successfully') || 'Model updated successfully!')
    },
    onError: (error: Error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    }
  })
}