import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TUpgradePackage } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'

const URL = '/upgradePackages';

export function useUpgradePackagesQuery(): UseQueryResult<TUpgradePackage[], Error> {
  return useQuery({
    queryKey: ['upgradePackages'],
    queryFn: async (): Promise<TUpgradePackage[]> => {
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

export function useUpgradePackagesAddMutation(): UseMutationResult<TUpgradePackage, Error, Omit<TUpgradePackage, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newUpgradePackage: Omit<TUpgradePackage, 'id'>): Promise<TUpgradePackage> => {
      const response = await axiosAPI.post(URL, newUpgradePackage)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['upgradePackages'] })
      toast.success(t('upgrade_package_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useUpgradePackagesUpdateMutation(): UseMutationResult<TUpgradePackage, Error, TUpgradePackage> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedUpgradePackage: TUpgradePackage): Promise<TUpgradePackage> => {
      const response = await axiosAPI.put(`${URL}/${updatedUpgradePackage.id}`, updatedUpgradePackage)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['upgradePackages'] })
      toast.success(t('upgrade_package_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useUpgradePackagesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`${URL}/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['upgradePackages'] })
      toast.success(t('upgrade_package_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
