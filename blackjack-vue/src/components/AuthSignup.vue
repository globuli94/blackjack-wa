<template>
  <q-card class="auth-card">
    <q-card-section class="auth-header">
      <img src="icons/logo/blackjack_logo.png" alt="Blackjack Logo" class="auth-logo q-mb-md" />
      <div class="text-h4 text-center q-mb-sm text-white">Sign Up</div>
    </q-card-section>

    <q-card-section class="auth-form-section">
      <q-form @submit="handleSignUp" class="auth-form">
        <q-input
          v-model="displayName"
          label="Display Name (optional)"
          outlined
          dark
          color="amber"
          label-color="white"
          :disable="authStore.loading"
          class="auth-input"
        />

        <q-input
          v-model="email"
          type="email"
          label="Email"
          outlined
          dark
          color="amber"
          label-color="white"
          :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Email must be valid']"
          :disable="authStore.loading"
          class="auth-input"
        />

        <q-input
          v-model="password"
          type="password"
          label="Password"
          outlined
          dark
          color="amber"
          label-color="white"
          :rules="[val => !!val || 'Password is required', val => val.length >= 6 || 'Password must be at least 6 characters']"
          :disable="authStore.loading"
          class="auth-input"
        />

        <q-input
          v-model="confirmPassword"
          type="password"
          label="Confirm Password"
          outlined
          dark
          color="amber"
          label-color="white"
          :rules="[val => !!val || 'Please confirm your password', val => val === password || 'Passwords do not match']"
          :disable="authStore.loading"
          class="auth-input"
        />

        <q-btn
          type="submit"
          label="Sign Up"
          color="amber"
          text-color="black"
          class="full-width auth-submit-btn"
          unelevated
          :loading="authStore.loading"
        />

        <!-- SSO Providers -->
        <q-btn
          outline
          color="white"
          text-color="white"
          icon="fab fa-google"
          label="Sign up with Google"
          class="full-width auth-google-btn"
          :disable="authStore.loading"
          @click="handleGoogleSignIn"
        />
      </q-form>
    </q-card-section>

    <q-card-section class="text-center auth-footer">
      <div class="text-body1 text-white">
        Already have an account?
        <a href="#" class="auth-link" @click.prevent="$emit('switch-to-login')">Sign in</a>
      </div>
    </q-card-section>

    <q-banner v-if="authStore.error" class="bg-negative text-white q-ma-md">
      {{ authStore.error }}
      <template v-slot:action>
        <q-btn flat dense icon="close" @click="authStore.clearError()" />
      </template>
    </q-banner>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { Notify } from 'quasar'

const emit = defineEmits(['switch-to-login', 'authenticated'])

const authStore = useAuthStore()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleSignUp = async () => {
  if (password.value !== confirmPassword.value) {
    Notify.create({
      type: 'negative',
      message: 'Passwords do not match',
      position: 'top',
    })
    return
  }

  const result = await authStore.signUp(email.value, password.value, displayName.value || null)
  if (result.success) {
    // Automatically log in the user after signup
    const loginResult = await authStore.signIn(email.value, password.value)
    if (loginResult.success) {
      Notify.create({
        type: 'positive',
        message: 'Account created and signed in successfully!',
        position: 'top',
      })
      emit('authenticated')
    } else {
      Notify.create({
        type: 'positive',
        message: 'Account created successfully!',
        position: 'top',
      })
      emit('authenticated')
    }
  }
}

const handleGoogleSignIn = async () => {
  const result = await authStore.signInWithGoogle()
  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Signed up with Google successfully!',
      position: 'top',
    })
    emit('authenticated')
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-card {
  animation: fadeIn 0.4s ease-out;
  min-width: 400px;
  max-width: 500px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
}

.auth-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
}

.auth-logo {
  display: block;
  margin: 0 auto 1rem;
  height: 180px;
  width: auto;
  object-fit: contain;
}

.auth-form-section {
  padding: 1.5rem 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-input {
  width: 100%;
}

.auth-input :deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.auth-input :deep(.q-field__control) {
  color: white;
}

.auth-input :deep(.q-field__native) {
  color: white;
}

.auth-input :deep(.q-field--outlined .q-field__control) {
  border-color: rgba(255, 255, 255, 0.3);
}

.auth-input :deep(.q-field--outlined:hover .q-field__control) {
  border-color: rgba(251, 191, 36, 0.6);
}

.auth-input :deep(.q-field--focused .q-field__control) {
  border-color: #fbbf24;
}

.auth-submit-btn {
  min-height: 56px;
  height: 56px;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.auth-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.5);
}

.divider {
  position: relative;
  text-align: center;
  margin: 1rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.divider-text {
  position: relative;
  background: transparent;
  padding: 0 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.auth-google-btn {
  min-height: 56px;
  height: 56px;
  border-color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.auth-google-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.auth-footer {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.auth-link {
  color: #fbbf24;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.5rem;
  transition: color 0.2s ease;
}

.auth-link:hover {
  color: #fcd34d;
  text-decoration: underline;
}

.auth-card :deep(.q-banner) {
  background: rgba(239, 68, 68, 0.9) !important;
  border-radius: 8px;
  margin: 1rem;
}
</style>
