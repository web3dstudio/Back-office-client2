import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosAPI from '../utils/axiosAPI'
import type { TNewModel } from '../types'
import { toast } from 'react-toastify'


export function useNewModelsQuery(
  years: number[]
): UseQueryResult<TNewModel[], Error> {
  return useQuery({
    queryKey: ['newModels'],
    queryFn: async (): Promise<TNewModel[]> => {
      const params = new URLSearchParams();
      if (years.length > 0) {
        {
          params.append('years', years.join(','));
        }
      }
      const response = await axiosAPI.get(`/models/getNewModels?${params.toString()}`)
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
    enabled: false,
  })
}


export function useImportNewModelsMutation(): UseMutationResult<TNewModel[], Error, { ids: number[] }, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ids }: { ids: number[] }): Promise<TNewModel[]> => {
      const response = await axiosAPI.post(`models/import`,
        ids
      );
      return response.data;
    },
    retry: 3,
    onSuccess: (response: TNewModel[]) => {
      queryClient.setQueryData<TNewModel[]>(['newModels'], (oldModels = []) => {
        return oldModels.filter(
          oldModel => !response.some(newModel => newModel.id === oldModel.id)
        )
      })
      toast.success('New models imported successfully!')
    },
    onError: (_error) => {
      toast.error('Import error! Try again later.')
    }
  })
}