import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { GridSortModel } from "@mui/x-data-grid"
import type { TSupportArticlesResponse } from "../types"

export function useSupportArticlesQuery(
  page: number,
  filters: Record<string, string> = {},
  sortModel?: GridSortModel
): UseQueryResult<TSupportArticlesResponse, Error> {
  return useQuery({
    queryKey: ['supportArticles', page, filters, sortModel],
    queryFn: async (): Promise<TSupportArticlesResponse> => {
      const params = new URLSearchParams({
        Page: String(page + 1),
        PageSize: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      })

      // Добавляем параметры сортировки
      if (sortModel && sortModel.length > 0) {
        const sort = sortModel[0]
        params.append('sortField', sort.field)
        params.append('sortDirection', sort.sort || 'asc')
      }

      const response = await axiosAPI.get(`/supportArticles?${params.toString()}`)
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

