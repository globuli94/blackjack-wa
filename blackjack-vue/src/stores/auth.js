import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth'
import { auth } from 'src/config/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const idToken = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || null)
  const userName = computed(() => user.value?.displayName || user.value?.email || 'User')
  const hasValidToken = computed(() => !!idToken.value)

  // Initialize auth state listener
  const init = () => {
    try {
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          user.value = firebaseUser

          // Get token if user is logged in
          if (firebaseUser) {
            await getIdToken()
          } else {
            idToken.value = null
          }

          loading.value = false
          error.value = null
          console.log('[Auth Store] Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')
        },
        (error) => {
          console.error('[Auth Store] Auth state change error:', error)
          loading.value = false
          error.value = error.message
        }
      )
    } catch (err) {
      console.error('[Auth Store] Failed to initialize auth listener:', err)
      loading.value = false
      error.value = err.message
    }
  }

  // Email/Password Sign In
  const signIn = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      await getIdToken()
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Email/Password Sign Up
  const signUp = async (email, password, displayName = null) => {
    try {
      loading.value = true
      error.value = null
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user

      // Update display name if provided
      if (displayName && user.value) {
        await user.value.updateProfile({ displayName })
      }

      await getIdToken()
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      user.value = userCredential.user
      await getIdToken()
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Facebook Sign In
  const signInWithFacebook = async () => {
    try {
      loading.value = true
      error.value = null
      const provider = new FacebookAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      user.value = userCredential.user
      await getIdToken()
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Twitter Sign In
  const signInWithTwitter = async () => {
    try {
      loading.value = true
      error.value = null
      const provider = new TwitterAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      user.value = userCredential.user
      await getIdToken()
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign Out
  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      await signOut(auth)
      user.value = null
      idToken.value = null
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Get Firebase ID Token
  const getIdToken = async (forceRefresh = false) => {
    if (!user.value) {
      console.warn('[Auth Store] Cannot get ID token: No user logged in')
      return null
    }

    try {
      const token = await user.value.getIdToken(forceRefresh)
      idToken.value = token
      console.log('[Auth Store] ID token retrieved successfully')
      return token
    } catch (err) {
      console.error('[Auth Store] Failed to get ID token:', err)
      error.value = err.message
      return null
    }
  }

  return {
    user,
    loading,
    error,
    idToken,
    isAuthenticated,
    userEmail,
    userName,
    hasValidToken,
    init,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    logout,
    clearError,
    getIdToken,
  }
})
