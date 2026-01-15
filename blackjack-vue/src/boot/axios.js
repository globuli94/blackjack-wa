import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'

// Create axios instance with credentials support
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000',
  withCredentials: true, // Enable cookies for session management
  // Don't set default Content-Type - let the interceptor set it based on data type
  transformRequest: [
    (data, headers) => {
      // Handle URLSearchParams - convert to string and set Content-Type
      if (data instanceof URLSearchParams) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        return data.toString()
      }
      // Let axios handle other data types (JSON, FormData, etc.)
      return data
    },
    ...axios.defaults.transformRequest
  ]
})

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api

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

      // Set Content-Type based on data type
      // If data is URLSearchParams, use form-encoded (required by Play Framework)
      if (config.data instanceof URLSearchParams) {
        // Convert URLSearchParams to string and set correct Content-Type
        config.data = config.data.toString()
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        console.log('[Axios] Sending form-encoded data:', config.data)
      } else if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData) && !(config.data instanceof URLSearchParams)) {
        // For JSON objects, use JSON content type
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json'
        }
        // Only stringify if it's not already a string
        if (typeof config.data !== 'string') {
          config.data = JSON.stringify(config.data)
        }
      } else if (typeof config.data === 'string' && config.data.includes('=') && !config.headers['Content-Type']) {
        // If data is already a string that looks like form data, set Content-Type
        // This handles cases where URLSearchParams was already converted
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        console.log('[Axios] Detected form-encoded string, setting Content-Type')
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

      // Handle CORS errors specifically
      if (error.message === 'Network Error' && !error.response) {
        console.error('[Axios] Network/CORS error - check backend CORS configuration')
        return Promise.reject(error)
      }

      // If 401 and not already retried, refresh token and retry
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        console.log('[Axios] 401 received, refreshing token...')
        
        try {
          // Force refresh token
          const newToken = await authStore.getIdToken(true)
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          } else {
            throw new Error('Failed to refresh token')
          }
        } catch (refreshError) {
          // Token refresh failed, logout user
          console.error('[Axios] Token refresh failed, logging out...', refreshError)
          await authStore.logout()
          // Redirect to auth page
          window.location.href = '/#/auth'
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )
})

export { api }