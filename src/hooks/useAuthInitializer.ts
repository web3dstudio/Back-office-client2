import { useAccessTokenStore } from '../store/accessTokenStore'
import { useAuthStore } from '../store/authStore'
import { useEffect } from 'react'
import { useTokenValidation } from './useTokenValidation'

const useAuthInitializer = () => {
  const token = useAccessTokenStore((state) => state.accessToken)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const { isTokenValid, isAuthenticated } = useTokenValidation(token)

  useEffect(() => {
    if (token && isTokenValid) {
      setAuthenticated(isAuthenticated)
    } else {
      setAuthenticated(false)
    }
  }, [token, setAuthenticated])
}

export default useAuthInitializer
