import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Authentication guard
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    console.log('[Router Guard] Navigating to:', to.path)
    console.log('[Router Guard] Auth loading:', authStore.loading, 'Authenticated:', authStore.isAuthenticated)
    
    // Helper function to check auth and proceed
    const checkAuth = () => {
      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      
      console.log('[Router Guard] Route requires auth:', requiresAuth)
      console.log('[Router Guard] User authenticated:', authStore.isAuthenticated)
      
      if (requiresAuth && !authStore.isAuthenticated) {
        console.log('[Router Guard] Redirecting to /auth')
        next({ path: '/auth', query: { redirect: to.fullPath } })
      } else if (!requiresAuth && to.path === '/auth' && authStore.isAuthenticated) {
        // If already authenticated and trying to access auth page, redirect to home
        console.log('[Router Guard] Already authenticated, redirecting to /')
        next({ path: '/' })
      } else {
        console.log('[Router Guard] Access granted')
        next()
      }
    }
    
    // If auth is still loading, wait for it to finish using a Promise
    if (authStore.loading) {
      console.log('[Router Guard] Waiting for auth to initialize...')
      
      // Return a Promise that resolves when auth is ready
      return new Promise((resolve) => {
        let attempts = 0
        const maxAttempts = 30
        
        const waitForAuth = () => {
          attempts++
          if (!authStore.loading || attempts >= maxAttempts) {
            console.log('[Router Guard] Auth initialized, checking access...')
            checkAuth()
            resolve()
          } else {
            setTimeout(waitForAuth, 100)
          }
        }
        
        waitForAuth()
      })
    } else {
      // Auth already initialized, check immediately
      checkAuth()
    }
  })

  return Router
})
