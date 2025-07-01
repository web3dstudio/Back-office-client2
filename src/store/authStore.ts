import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

export const CUSTOMER_TYPE_Opinion = 1
export const CUSTOMER_TYPE_Assessor = 2
export const CUSTOMER_TYPE_Company = 4
export const CUSTOMER_TYPE_Subscription = 8
export const CUSTOMER_TYPE_CompanyUser = 16

interface AuthState {
  isAuthenticated: boolean;
  userType: number | undefined
  setAuthenticated: (value: AuthState['isAuthenticated']) => Promise<void>

}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        userType: undefined,
        setAuthenticated: async (value: boolean) => set({ isAuthenticated: value }),
      }),
      {
        name: 'authStore',
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);