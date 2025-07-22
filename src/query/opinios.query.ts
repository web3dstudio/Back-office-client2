import { type UseMutationResult, type UseQueryResult, keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { TOpinion, TOpinionResponse } from "../types"
import { useTranslation } from "react-i18next"
import { toast } from 'react-toastify'
import type { GridSortModel } from "@mui/x-data-grid"

export function useOpinionsQuery(page: number, filters: Record<string, string>, sortModel?: GridSortModel): UseQueryResult<TOpinionResponse, Error> {
  return useQuery({
    queryKey: ['opinions', page, filters, sortModel],
    queryFn: async (): Promise<TOpinionResponse> => {
      const params = new URLSearchParams({
        Page: String(page + 1),
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

      const response = await axiosAPI.get(`/opinions?${params.toString()}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData, // ВАЖНО!!! НЕ ТРОГАТЬ!!!
    retry: 3,
  })
}

export function useOpinionQuery(id: string): UseQueryResult<TOpinion, Error> {
  return useQuery({
    queryKey: ['opinion', id],
    queryFn: async (): Promise<TOpinion> => {
      const response = await axiosAPI.get(`/opinions/${id}`)
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 3,
  })
}

export function useOpinionsAddMutation(): UseMutationResult<TOpinion, Error, Omit<TOpinion, 'id'>> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newOpinion: Omit<TOpinion, 'id'>): Promise<TOpinion> => {
      const response = await axiosAPI.post('/opinions', newOpinion, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['opinions'] })
      toast.success(t('opinion_added_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

type TOpinionWithFiles = TOpinion & {
  licenseFiles?: File[]
  carFiles?: File[]
  deleteLicenseImage?: boolean
  changeLicenseFile?: boolean
}

export function useOpinionUpdateMutation(): UseMutationResult<TOpinion, Error, TOpinionWithFiles> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedOpinion: TOpinionWithFiles): Promise<TOpinion> => {
      const formData = new FormData();
      const { licenseFiles, carFiles, ...opinionData } = updatedOpinion;
      formData.append('data', JSON.stringify(opinionData));

      if (licenseFiles) {
        licenseFiles.forEach((file: File) => {
          formData.append('licenseFiles', file);
        });
      }
      if (carFiles) {
        carFiles.forEach((file: File) => {
          formData.append('carFiles', file);
        });
      }

      const response = await axiosAPI.put(`/opinions/${updatedOpinion.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['opinion', data.id] })
      toast.success(t('opinion_updated_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}

export function useOpinionsDeleteMutation(): UseMutationResult<string, Error, string> {
  const { t } = useTranslation('notifications')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosAPI.delete(`/opinions/${id}`)
      return id
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['opinions'] })
      toast.success(t('opinion_deleted_successfully'))
    },
    onError: (error) => {
      console.log('ERROR', error.message)
      toast.error(t('error_occurred') || 'Error!')
    },
  })
}
