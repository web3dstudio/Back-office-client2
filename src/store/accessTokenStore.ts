import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'


type State = {
  accessToken: string
}

type Actions = {
  setToken: (token: State['accessToken']) => Promise<void>
  getToken: () => Promise<State['accessToken']>
}

export const useAccessTokenStore = create<State & Actions>()(
  devtools(
    persist((set, get) => ({
      accessToken: '',
      setToken: async (token: string) => set({ accessToken: token }),
      getToken: async () => get().accessToken
    }),
      {
        name: 'accessToken',
        storage: createJSONStorage(() => localStorage),
      })
  ))
