import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import axiosAPI from '../utils/axiosAPI'


type THomePageResp = {
  cars: number
  manufacturers: number,
  opinions: number,
  customers: number,
}

export function useHomePageQuery(): UseQueryResult<THomePageResp, Error> {
  return useQuery({
    queryKey: ['home_page_data'],
    queryFn: async (): Promise<THomePageResp> => {
      const response = await axiosAPI.get('/reports/homePageData')
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}