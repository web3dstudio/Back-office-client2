import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware'


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