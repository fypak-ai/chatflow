import axios from 'axios'
import { useAuthStore } from '../store/auth'

// In production (Railway), VITE_API_URL is set to the backend Railway URL
// In development, falls back to localhost:8000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
