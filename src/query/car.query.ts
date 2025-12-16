import { type UseQueryResult, type UseMutationResult, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TCar, TCarResponse, TCarYears, CarUpdateRequest } from "../types"
import type { GridSortModel } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

export function useCarsQuery(page: number, filters: Record<string, string>, sortModel?: GridSortModel): UseQueryResult<TCarResponse, Error> {
  return useQuery({
    queryKey: ['cars', page, filters, sortModel],
    queryFn: async (): Promise<TCarResponse> => {

      const params = new URLSearchParams({
        Page: String(page + 1),
        PageSize: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      });

      // Добавляем параметры сортировки
      if (sortModel && sortModel.length > 0) {
        const sort = sortModel[0];
        params.append('sortField', sort.field);
        params.append('sortDirection', sort.sort || 'asc');
      }

      const response = await axiosAPI.get(`/cars?${params.toString()}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    // placeholderData: keepPreviousData, // ВАЖНО!!! НЕ ТРОГАТЬ!!!
    retry: 3,
  })
}

export function useCarYearsQuery(modelId: string): UseQueryResult<TCarYears[], Error> {
  return useQuery({
    queryKey: ['car', modelId],
    queryFn: async (): Promise<TCarYears[]> => {
      const response = await axiosAPI.get(`/cars/years/${modelId}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
    enabled: !!modelId,
  })
}

export function useCarQuery(id: string): UseQueryResult<TCar, Error> {
  return useQuery({
    queryKey: ['car', id],
    queryFn: async (): Promise<TCar> => {
      const response = await axiosAPI.get(`/cars/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
    enabled: !!id,
  })
}

export function useCarUpdateMutation(): UseMutationResult<TCar, Error, { id: string; data: CarUpdateRequest }> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CarUpdateRequest }): Promise<TCar> => {
      const response = await axiosAPI.put(`/cars/${id}`, data)
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['car', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      toast.success(t('car_updated_successfully') || 'Car updated successfully!')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

