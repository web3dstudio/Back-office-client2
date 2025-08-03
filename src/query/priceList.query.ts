import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import type { TPriceList, TPriceListResponse } from '../types'
import type { GridSortModel } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export function usePriceListsQuery(page: number, filters: Record<string, string>, sortModel?: GridSortModel): UseQueryResult<TPriceListResponse, Error> {
  return useQuery({
    queryKey: ['priceLists', page, filters, sortModel],
    queryFn: async (): Promise<TPriceListResponse> => {
      const params = new URLSearchParams({
        Page: String(page + 1),
        PageSize: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      });

      if (sortModel && sortModel.length > 0) {
        const sort = sortModel[0];
        params.append('sortField', sort.field);
        params.append('sortDirection', sort.sort || 'asc');
      }

      const response = await axiosAPI.get(`/priceLists?${params.toString()}`)
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

export default function usePriceListCreateMutation(): UseMutationResult<TPriceList, Error, Omit<TPriceList, 'id' | 'date' | 'carTypes'> & { carTypeIds: string[] }> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')
  return useMutation({
    mutationFn: async (data: Omit<TPriceList, 'id' | 'date' | 'carTypes'> & { carTypeIds: string[] }) => {
      const response = await axiosAPI.post('/priceLists', data)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['priceLists'] })
      toast.success(t('priceList_added_successfully'))
    },
    onError: () => {
      toast.error(t('priceList_added_failed'))
    },
  })
}


export function useDeletePriceListMutation(): UseMutationResult<string, Error, string> {
  const queryClient = useQueryClient()
  const { t } = useTranslation('notifications')
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosAPI.delete(`/priceLists/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceLists'] })
      toast.success(t('priceList_deleted_successfully'))
    },
    onError: () => {
      toast.error(t('priceList_deleted_failed'))
    },
  })
}