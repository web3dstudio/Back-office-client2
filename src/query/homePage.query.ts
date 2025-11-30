import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import axiosAPI from '../utils/axiosAPI'


type TSession = {
  date: string,
  number: number
}

type THomePageResp = {
  cars: number
  manufacturers: number,
  opinions: number,
  customers: number,
  reportLeadingQuery: any[],
  sessions: TSession[]
}

export function useHomePageQuery(): UseQueryResult<THomePageResp, Error> {
  return useQuery({
    queryKey: ['home_page_data'],
    queryFn: async (): Promise<THomePageResp> => {
      const response = await axiosAPI.get('/reports/homePageData')
      return response.data
    }
  })
}