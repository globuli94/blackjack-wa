import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration
// All values should be set in .env files (VITE_ prefix required for Vite)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Validate and normalize authDomain
if (firebaseConfig.authDomain) {
  // Remove any protocol prefix if accidentally included
  firebaseConfig.authDomain = firebaseConfig.authDomain
    .replace(/^https?:?\/?\/?/, '') // More forgiving regex to catch https// too
    .replace(/\/+$/, '') // Remove trailing slashes
    .trim() // Remove whitespace
  
  console.log('[Firebase Config] authDomain:', firebaseConfig.authDomain)
}

// Validate that required config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing required values. Please check your .env files.')
  console.error('Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID')
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Analytics (only in browser environment)
// Note: Analytics requires a valid API key and proper Firebase project setup
let analytics = null
if (typeof window !== 'undefined') {
  try {
    // Only initialize analytics if we have a valid measurementId
    if (firebaseConfig.measurementId && firebaseConfig.apiKey && firebaseConfig.apiKey !== '') {
      analytics = getAnalytics(app)
    }
  } catch (error) {
    // Silently fail analytics - it's not critical for authentication
    console.warn('Firebase Analytics initialization failed (non-critical):', error.message)
  }
}

export { analytics }
export default app