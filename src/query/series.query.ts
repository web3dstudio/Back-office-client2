import { type UseMutationResult, useMutation } from "@tanstack/react-query"
import axiosAPI from '../utils/axiosAPI'
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'


export function useSeriesDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/series/${id}`)
      return id
    },
    onSuccess: (_data) => {
      toast.success(t('series_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

