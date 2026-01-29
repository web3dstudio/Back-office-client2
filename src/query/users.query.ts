import { type UseQueryResult, useQuery, useMutation, type UseMutationResult, useQueryClient } from "@tanstack/react-query"
import axiosAPI from "../utils/axiosAPI"
import type { GridSortModel } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import type { TUser, TAvatarUpload, TAdUser, TPagination } from "../types"

// IUser используется только для списка пользователей в таблице
export interface IUser {
    id: string
    firstName: string
    lastName: string
    userName: string
    mobileNumber: string | null
    email: string
    address: string | null
    position: string | null
    department: string | null
}

export type TUsersResponse = {
    data: IUser[]
} & TPagination

export function useUsersQuery(
    page: number,
    filters: Record<string, string> = {},
    sortModel?: GridSortModel
): UseQueryResult<TUsersResponse, Error> {
    return useQuery({
        queryKey: ['users', page, filters, sortModel],
        queryFn: async (): Promise<TUsersResponse> => {
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

            const response = await axiosAPI.get(`/users?${params.toString()}`)
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}

export function useGetUserQuery(id: string): UseQueryResult<TUser, Error> {
    return useQuery({
        queryKey: ['user', id],
        queryFn: async (): Promise<TUser> => {
            const response = await axiosAPI.get(`/users/${id}`)
            return response.data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
        enabled: !!id,
    })
}

type TUserMutationData = {
    id?: string
    adSid: string | null
    adUser: boolean
    userName: string
    firstName: string
    middleName?: string | null
    lastName: string
    email: string
    tz: string
    mobileNumber: string
    phoneNumber?: string | null
    address?: string | null
    department?: string | null
    position?: string | null
    startWorkDate?: string | null
    password: string
    imageFileName?: string | null
    role: number
}

export function useCreateUserMutation(): UseMutationResult<TUser, Error, { data: TUserMutationData; avatar: TAvatarUpload | null }> {
    const { t } = useTranslation('notifications')
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ data, avatar }: { data: TUserMutationData; avatar: TAvatarUpload | null }): Promise<TUser> => {
            const formData = new FormData()

            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (value === null) {
                        formData.append(key, '')
                    } else if (typeof value === 'boolean') {
                        formData.append(key, value ? 'true' : 'false')
                    } else {
                        formData.append(key, String(value))
                    }
                }
            })

            if (avatar && avatar.file) {
                formData.append('ImageFile', avatar.file)
            }

            const response = await axiosAPI.post('/users', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response.data
        },
        onSuccess: (_data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.refetchQueries({ queryKey: ['users'] })
            toast.success(t('user_added_successfully') || 'User added successfully')
        },
        onError: (error) => {
            console.log('ERROR', error.message)
            toast.error(t('error_occurred') || 'Error!')
        },
    })
}

export function useUpdateUserMutation(): UseMutationResult<TUser, Error, { id: string; data: TUserMutationData; avatar: TAvatarUpload | null }> {
    const { t } = useTranslation('notifications')
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data, avatar }: { id: string; data: TUserMutationData; avatar: TAvatarUpload | null }): Promise<TUser> => {
            const formData = new FormData()

            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (value === null) {
                        formData.append(key, '')
                    } else if (typeof value === 'boolean') {
                        formData.append(key, value ? 'true' : 'false')
                    } else {
                        formData.append(key, String(value))
                    }
                }
            })

            if (avatar && avatar.file) {
                formData.append('ImageFile', avatar.file)
            }

            const response = await axiosAPI.put(`/users/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response.data
        },
        onSuccess: (_data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['user'] })
            queryClient.refetchQueries({ queryKey: ['users'] })
            toast.success(t('user_updated_successfully') || 'User updated successfully')
        },
        onError: (error) => {
            console.log('ERROR', error.message)
            toast.error(t('error_occurred') || 'Error!')
        },
    })
}

export function useDeleteUserMutation(): UseMutationResult<string, Error, string> {
    const { t } = useTranslation('notifications')
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string): Promise<string> => {
            await axiosAPI.delete(`/users/${id}`)
            return id
        },
        onSuccess: (_data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            toast.success(t('user_deleted_successfully') || 'User deleted successfully')
        },
        onError: (error) => {
            console.log('ERROR', error.message)
            toast.error(t('error_occurred') || 'Error!')
        },
    })
}

export function useAdUsersQuery(): UseQueryResult<TAdUser[], Error> {
    return useQuery({
        queryKey: ['adUsers'],
        queryFn: async (): Promise<TAdUser[]> => {
            const response = await axiosAPI.get('/users/ad-users')
            console.log('response', response.data)
            return response.data || []
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: 3,
    })
}

export function useSetDefaultPageMutation(): UseMutationResult<void, Error, string> {
    const { t } = useTranslation('notifications')
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (page: string): Promise<void> => {
            await axiosAPI.post(`/users/defaultPage?page=${encodeURIComponent(page)}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current_user'] })
            toast.success(t('default_page_set_successfully') || 'Default page set successfully')
        },
        onError: (error) => {
            console.log('ERROR', error.message)
            toast.error(t('error_occurred') || 'Error!')
        },
    })
}

export function useUsersSyncOutMutation(): UseMutationResult<unknown, Error, void> {
    const { t } = useTranslation('notifications')
    return useMutation({
        mutationFn: async (): Promise<unknown> => {
            const response = await axiosAPI.post('/users/syncOut')
            return response.data
        },
        onSuccess: () => {
            toast.success(t('sync_started') || 'Synchronization started')
        },
        retry: 1,
    })
}


