import Axios from 'axios'
import { useAccessTokenStore } from '../store/accessTokenStore'
import { useAuthStore } from '../store/authStore'


const authStore = useAuthStore.getState()

const axiosAPI = Axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
  headers: {
    'Content-type': 'application/json',
    'Accept': 'application/json',
  },
})

axiosAPI.interceptors.request.use(async request => {
  const token = useAccessTokenStore.getState().accessToken
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

axiosAPI.interceptors.response.use((response) => {
  return response
}, (error) => {

  if (error.response && error.response.status === 401) {
    // Обработка ошибки 401
    console.log('Ошибка 401: Не авторизован');
    useAccessTokenStore.setState({ accessToken: '' })
    useAuthStore.setState({ isAuthenticated: false })
    authStore.isAuthenticated = false
    window.location.href = '/login'; // Перенаправление на страницу входа
  }
  return Promise.reject(error);
})

// Отдельный инстанс для скачивания файлов (blob)
export const axiosDownload = Axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
  responseType: 'blob',
})

axiosDownload.interceptors.request.use(async request => {
  const token = useAccessTokenStore.getState().accessToken
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

axiosDownload.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.response && error.response.status === 401) {
    console.log('Ошибка 401: Не авторизован');
    useAccessTokenStore.setState({ accessToken: '' })
    useAuthStore.setState({ isAuthenticated: false })
    authStore.isAuthenticated = false
    window.location.href = '/login';
  }
  return Promise.reject(error);
})

export default axiosAPI
