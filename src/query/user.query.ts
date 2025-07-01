import { useMutation, type UseMutationResult, type UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosAPI from '../utils/axiosAPI'
import type { TCurrentUser, TLogoutResponse } from '../types';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from '@tanstack/react-router';
import { useAccessTokenStore } from '../store/accessTokenStore';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';


type TLoginParams = {
  userName: string
  password: string
}

type TLoginResponse = {
  data: {
    token: string;
  };
  status: number;
  message: unknown;
};



export function useLoginMutation(): UseMutationResult<
  TLoginResponse,
  Error,
  TLoginParams,
  unknown
> {
  // const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: TLoginParams): Promise<TLoginResponse> => {
      const response = await axiosAPI.post('/users/login', values)
      return response.data
    },
    retry: 3,
    onSuccess: (_response: any) => {
      // queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: (error: Error) => {
      console.log('LOGIN ERROR', error.message)
      // enqueueSnackbar(t('loginError'), { variant: 'error' })
    },
  })
}

///api/users/logout
///api/users/logout
export function useLogoutMutation(): UseMutationResult<
  TLogoutResponse,
  Error,
  void
> {
  const accessTokenStore = useAccessTokenStore()
  const authStore = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_args: void): Promise<TLogoutResponse> => {
      const response = await axiosAPI.post('/users/logout', {})
      return response.data
    },
    retry: 1,
    onSuccess: (_response: TLogoutResponse) => {
      queryClient.removeQueries()
      // queryClient.removeQueries({ queryKey: ['currentUser'] })
      // queryClient.removeQueries({ queryKey: ['homePageData'] })
      toast.success(t('logoutSuccess', { ns: 'notifications' }))
    },
    onError: (error: Error) => {
      console.log('LOGOUT ERROR', error.message)
    },
    onSettled: () => {
      accessTokenStore.setToken('')
      authStore.isAuthenticated = false
      navigate({ to: '/login' })
    },
  })
}

// '/api/users/current'
export function useCurrentUserQuery(): UseQueryResult<TCurrentUser, Error> {
  return useQuery({
    queryKey: ['current_user'],
    queryFn: async (): Promise<TCurrentUser> => {
      const response = await axiosAPI.get('/users/current')
      return response.data.data
    }
  })
}