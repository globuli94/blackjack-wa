import { boot } from 'quasar/wrappers'
import firebaseApp from 'src/config/firebase'
import { useAuthStore } from 'src/stores/auth'

export default boot(() => {
  // Firebase is initialized in the config file
  // This boot file ensures Firebase is available throughout the app
  console.log('[Firebase Boot] Firebase initialized', firebaseApp)
  
  // Initialize auth store early so router guards can check auth state
  const authStore = useAuthStore()
  console.log('[Firebase Boot] Initializing auth store...')
  authStore.init()
  console.log('[Firebase Boot] Auth store initialized, loading:', authStore.loading)
})