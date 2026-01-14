import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000',
  withCredentials: true,
})

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  // Add request interceptor for Firebase authentication
  api.interceptors.request.use(
    async (config) => {
      const authStore = useAuthStore()

      // Skip auth for certain endpoints (if needed)
      if (config.url?.includes('/public')) {
        return config
      }

      // Get fresh token if user is authenticated
      if (authStore.isAuthenticated) {
        const token = await authStore.getIdToken()

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('[Axios] Added Firebase token to request:', config.url)
        } else {
          console.warn('[Axios] Failed to get token for request:', config.url)
        }
      }

      return config
    },
    (error) => {
      console.error('[Axios] Request interceptor error:', error)
      return Promise.reject(error)
    }
  )

  // Add response interceptor for token refresh on 401
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const authStore = useAuthStore()
      const originalRequest = error.config

      // If 401 and not already retried, refresh token and retry
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        console.log('[Axios] 401 received, refreshing token...')

        // Force refresh token
        const newToken = await authStore.getIdToken(true)

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } else {
          // Token refresh failed, logout user
          console.error('[Axios] Token refresh failed, logging out...')
          await authStore.logout()
          // Redirect to auth page
          window.location.href = '/#/auth'
        }
      }

      return Promise.reject(error)
    }
  )
})

export { api }
