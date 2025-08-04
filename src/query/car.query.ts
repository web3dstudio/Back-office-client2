import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TCarResponse } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'
import type { GridSortModel } from "@mui/x-data-grid"

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


