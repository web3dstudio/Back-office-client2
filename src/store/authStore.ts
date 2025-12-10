import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware'


interface AuthState {
  isAuthenticated: boolean;
  userType: number | undefined
  shouldRedirectToDefaultPage: boolean
  setAuthenticated: (value: AuthState['isAuthenticated']) => Promise<void>
  setShouldRedirectToDefaultPage: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        userType: undefined,
        shouldRedirectToDefaultPage: false,
        setAuthenticated: async (value: boolean) => set({ isAuthenticated: value }),
        setShouldRedirectToDefaultPage: (value: boolean) => set({ shouldRedirectToDefaultPage: value }),
      }),
      {
        name: 'authStore',
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);