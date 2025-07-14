import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TServicePackage } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

const URL = '/servicePackages';

export function useServicePackagesQuery(): UseQueryResult<TServicePackage[], Error> {
  return useQuery({
    queryKey: ['servicePackages'],
    queryFn: async (): Promise<TServicePackage[]> => {
      const response = await axiosAPI.get(URL)
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

export function useServicePackagesAddMutation(): UseMutationResult<TServicePackage, Error, Omit<TServicePackage, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newServicePackage: Omit<TServicePackage, 'id'>): Promise<TServicePackage> => {
      const response = await axiosAPI.post(URL, newServicePackage)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['servicePackages'] })
      toast.success(t('service_package_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useServicePackagesUpdateMutation(): UseMutationResult<TServicePackage, Error, TServicePackage> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedServicePackage: TServicePackage): Promise<TServicePackage> => {
      const response = await axiosAPI.put(`${URL}/${updatedServicePackage.id}`, updatedServicePackage)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['servicePackages'] })
      toast.success(t('service_package_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useServicePackagesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`${URL}/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['servicePackages'] })
      toast.success(t('service_package_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
