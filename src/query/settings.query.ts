import { useMutation, type UseMutationResult, type UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosAPI from '../utils/axiosAPI'
import type { TSystemSettings } from '../types'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

export function useSystemSettingsQuery(): UseQueryResult<TSystemSettings, Error> {
  return useQuery({
    queryKey: ['systemSettings'],
    queryFn: async (): Promise<TSystemSettings> => {
      const response = await axiosAPI.get('/settings')
      return response.data
    },
    retry: 3,
  })
}

export function useSystemSettingsUpdateMutation(): UseMutationResult<TSystemSettings, Error, TSystemSettings> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: TSystemSettings): Promise<TSystemSettings> => {
      const response = await axiosAPI.put('/settings', settings)
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] })
      toast.success(t('settings_updated_successfully') || 'Settings updated successfully!')
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

